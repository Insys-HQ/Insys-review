# 에어나이프 1차 건조기 시뮬레이터 — 인수인계 문서

**파일명:** `airknife.html`  
**버전:** v3.5  
**담당부서:** 인시스 AI혁신 R&D센터  
**GitHub Pages:** https://insys-hq.github.io/Insys-review/airknife.html  
**GitHub 원본:** https://github.com/Insys-HQ/Insys-review/blob/main/airknife.html  
**Firebase 프로젝트:** `insys-work` (Firestore, Seoul, 컬렉션: `airknife_sim`)

---

## 1. 개요

세척 후 트레이를 2차 건조기에 투입하기 전, **에어나이프로 표면수·포켓 내 물기를 1차 제거**하는 공정을 시뮬레이션하는 웹 앱.  
모든 계산은 공학 수식 기반이며, 입력값 변경 시 실시간으로 결과가 갱신된다.

---

## 2. 화면 구성 (탭 8개)

| 탭 | 내용 |
|----|------|
| ⚙️ 시뮬레이터 | 전체 입력 + 종합 결과 (메인) |
| 📈 실시간 그래프 | 4개 SVG 차트 (단수별·거리별·열지도·슬릿) |
| 📉 단계별 건조 | 단수별 잔류 수분 추이 + 달성 여부 |
| 🏭 생산량 | 시간당·일 8h 처리량, 속도별 비교표 |
| ⚡ 채널·전력 | 1ch vs 2ch 브로어 수·소비전력·전기요금 비교 |
| 📐 공학 수식 근거 | 6개 이론 + 참고문헌 10건 + 실시간 계산값 |
| 🖼️ 구조도 | SVG 우측면 배치도 (격벽·채널·AK·배수) |
| 💾 저장 이력 | Firebase 저장 기록 조회 |

---

## 3. 입력 파라미터 전체 목록

### 3-1. 트레이 사양

| ID | 항목 | 단위 | 범위 | 계산 반영 내용 |
|----|------|------|------|--------------|
| `tray_w` | 가로 W | mm | 100~2000 | 면적, 채널 유효폭, AK 커버리지 |
| `tray_l` | 세로 L | mm | 100~2000 | 이송 기준 치수, 체류시간 |
| `tray_h` | 높이 H | mm | 5~300 | 포켓 깊이 보정 `f_pocketDepth = 1/(1+H/60)` |
| `pocket` | 포켓 수량 | ea | 1~500 | 포켓 밀도 보정 `f_pocketDensity = 1/(1+(density-2)/5)` |
| `init_water` | 초기 물기량 | g/tray | 1~2000 | 누적 제거 모델의 W₀ |
| `target_water` | 목표 잔류 물기 | g/tray | 0~1000 | 목표 달성 여부 판정, 최소 단수 계산 |
| `ch_count` | 채널 수 | - | 1 or 2 | 처리량 배수, 브로어 총수 |
| `ch_gap` | 채널 간격(격벽 폭) | mm | 20~400 | 채널 유효폭 `chEffWidth = (W - chGap×(ch-1)) / ch` |
| `tray_orient` | 투입 방향 | - | 수직/수평 | `f_orient`: 수직=1.15(중력 배수), 수평=0.85 |

### 3-2. 에어나이프 설정

| ID | 항목 | 단위 | 범위 | 계산 반영 내용 |
|----|------|------|------|--------------|
| `ak_stages` | 단수 | 단 | 1~8 | 누적 제거 반복 횟수 `W[n]=W₀×(1-r)ⁿ` |
| `ak_length` | AK 길이 | mm | 200~3000 (100단위) | 슬릿 면적, 커버리지 |
| `slit_gap` | 슬릿 간격 | mm | 0.5~5.0 | 슬릿 면적 → 풍속, `f_slit = (3-gap)/3` |
| `angle_sweep` | 스윕각 θ₁ | ° | 0~30 | `f_sweep = sin(θ₁)×형상보정` |
| `angle_slit` | 분사각 θ₂ | ° | 0~60 | `f_angle = sin(θ₂)` |
| `ak_dist` | AK-트레이 거리 d | mm | 10~200 | 거리 감쇠 `η = √(30/d)` |
| `blower_hp` | 브로어 마력 | HP | 1/2/3/5/7.5/10/15 | `Q = HP × 0.65 m³/min` |
| `blower_per_face` | AK 1개당 브로어 수 | 대/면 | 1~3 | `Q_face = bpf × Q_blower` |
| `ak_pos` | 설치 면 | - | 양면/단면 | 양면: 독립 병렬 모델, 단면: 상한 50% |
| `feed_speed` | 컨베어 속도 | m/min | 0.5~30 | 체류시간 `t = L_tray / v` → r_time 변화 |

---

## 4. 핵심 물리 수식 (physics 함수)

### 4-1. 슬릿 출구 풍속 (연속 방정식)

```
Q_blower = HP × 0.65          [m³/min, 정격압 200mmAq 기준]
Q_face   = bpf × Q_blower     [m³/min, 면당]
A_slit   = L_ak × gap         [m²]
v₀       = (Q_face/60) / A_slit  [m/s]
```

> 근거: Munson 2016 §4.2 (연속 방정식), Siemens/Aerzener 링블로어 카탈로그

### 4-2. 거리 감쇠 (슬릿 자유 제트)

```
η_d   = min(1.2, √(d_ref / d))    d_ref = 30mm
v_eff = min(v₀ × η_d, v₀ × 1.15)
```

> 근거: Rajaratnam 1976 (Turbulent Jets), Forthmann 1934

### 4-3. Weber 수 / Reynolds 수

```
We = ρ_air × v_eff² × δ / σ_water    δ=0.3mm, σ=0.0728 N/m
Re = v_eff × gap / ν_air              ν=1.516×10⁻⁵ m²/s
```

- We ≥ 12: 수막 파단 가능
- Re > 2300: 난류 전이

> 근거: Bhagat 2019 AIChE J.

### 4-4. 단당 물기 제거율 r — 2-메커니즘 모델

**핵심:** 컨베어 속도가 빠를수록 체류시간 t가 줄어 r_time이 감소 → 전체 제거율 하락

```
# 에어 강도 기본 인자 (속도 무관)
f_vel    = min(1, v_eff / 60)
f_slit   = min(1, max(0.05, (3 - gap) / 3))
f_sweep  = sin(θ₁) × max(0.4, 1 - |θ₁-20|/50)
f_angle  = sin(θ₂)
f_dist   = min(1, η_d)
air_strength_base = (f_vel×0.45 + f_slit×0.25 + f_sweep×0.20
                    + f_angle×0.15 + f_dist×0.05) / 1.10

# 구조 보정
f_pocketDepth   = 1 / (1 + H/60)
f_pocketDensity = 1 / (1 + max(0, density-2)/5)    [2개/dm² 기준]
f_pocket  = f_pocketDepth × f_pocketDensity
f_orient  = 1.15 (수직) / 0.85 (수평)
f_coverage = min(1, L_ak / chEffWidth)
air_strength = air_strength_base × f_coverage

# [A] 즉시 제거 (표면수 55%)  — 체류시간 무관
r_instant = air_strength × 0.55 × f_pocket × f_orient

# [B] 시간 의존 제거 (포켓수 45%) — 체류시간 지수 포화
τ = 2.5초  (포켓 배수 시정수)
t = L_tray / v_conveyor
r_time = air_strength × 0.45 × (1 - exp(-t/τ)) × f_pocket × f_orient

# 단면(앞면) 합산
r_front = min(0.45, r_instant + r_time)

# 양면 독립 병렬 (물리 상한 70%)
r_back  = r_front × 0.90
r_stage = min(0.70, 1 - (1-r_front)(1-r_back))   [양면]
r_stage = min(0.50, r_front)                       [단면]
```

> 근거: Sparrow 1980 (경사 충돌), Bhagat 2019, OEMS/Meech/Paxton 산업 실측치

### 4-5. 다단 누적 제거 (지수 감쇠)

```
W[n] = W₀ × (1 - r)ⁿ
η_total = 1 - (1-r)ⁿ
n_min = ⌈ ln(W_target/W₀) / ln(1-r) ⌉
```

> 근거: Incropera 2011 (Beer-Lambert 동형 모델)

### 4-6. 처리량

```
trays/min = (v_conveyor / L_tray) × ch
trays/h   = trays/min × 60
trays/day = trays/h × 8
```

### 4-7. 소비전력

```
kW_each  = HP × 0.7457
blowers  = ch × faceCount × bpf × stages
total_kW = kW_each × blowers
월전기요금 = total_kW × 8h × 22일 × 120원/kWh
```

---

## 5. 슬라이더 최적 범위 기준

| 슬라이더 | ✅ 최적 | ✅ 양호 | ⚠️ 주의 | ⛔ 비권장 |
|---------|--------|--------|---------|---------|
| 슬릿 간격 | ≤1.0mm | 1.5~2.0mm | 2.5~3.0mm | 3.5mm↑ |
| 스윕각 θ₁ | 15~25° | 10~14° | 26~30° | 0~9° |
| 분사각 θ₂ | 25~45° | 20~24° | 50~60° | 0~15° |
| AK-거리 | 20~60mm | 65~100mm | 105~150mm | 155mm↑ |

---

## 6. 실시간 그래프 4종

| 그래프 | X축 | Y축 | 특징 |
|--------|-----|-----|------|
| 단수별 잔류 수분 | 단수 (0~8단) | 잔류 수분 g | 목표선, 단당 제거량 막대 |
| 거리별 유효 풍속 | 거리 10~310mm | v_eff m/s | 현재값 마커, 30m/s 기준선 |
| 단수×거리 열지도 | 거리 (8단계) | 단수 (7단계) | 셀별 제거율%, 현재 설정 강조 |
| 슬릿 간격별 풍속 | 슬릿 0.5~5mm | v_eff m/s | 연속 방정식 시각화, 현재값 마커 |

모든 그래프는 입력값 변경 시 **즉시 갱신**.

---

## 7. PDF 출력

- 언어: **전체 영문** (jsPDF 한글 렌더링 불가)
- 섹션: Tray Spec → AK Config → Engineering Results → Production & Power
- 포함 내용: 모든 입력값, 수식 계산 결과(v₀, η, v_eff, We, Re, r, n_min), 참고문헌
- 파일명: `airknife_v3_report.pdf`

---

## 8. Firebase 연동

```javascript
// firebase-app.js (module 방식)
projectId: "insys-work"
collection: "airknife_sim"
필드: 모든 입력 params + 계산 결과 R + savedAt, ver
```

- 저장: 💾 저장 버튼 클릭 시 Firestore addDoc
- 조회: 저장 이력 탭에서 최근 15건 표시
- **주의:** `apiKey`가 placeholder 상태 — 실제 Firebase 콘솔에서 발급한 키로 교체 필요

---

## 9. 수정 이력

| 버전 | 주요 변경 내용 |
|------|--------------|
| v1.0 | 초기 작성 — 기본 입력·바 차트·구조도 |
| v2.0 | Firebase, 단계별 건조, 생산량, 채널/전력 탭 추가 |
| v3.0 | 실시간 SVG 그래프 4종, 공학 수식 근거 탭 추가 |
| v3.1 | 물리 모델 전면 수정 (1단 100% 오류 수정, 상한 70%/50%) |
| v3.2 | 바 차트 6개 물리 의미 재정의 (sin값 → 실제 단위) |
| v3.3 | 컨베어 속도 → 건조 효율 연동 (2-메커니즘 분리 모델) |
| v3.4 | 포켓수·채널간격 계산 반영, 슬라이더 범위 경고, 면당 브로어 설명 |
| v3.5 | ReferenceError 수정(f_coverage 선언 순서), 슬라이더 최적 마커 4종, 단수 막대 피커 |

---

## 10. 추가 개발 시 주의사항

1. **physics() 함수 수정 시** — `drawHeatmap()` 내부에서도 `physics(p)` 호출함. 파라미터 추가 시 반드시 기본값 처리 필요:
   ```javascript
   const newParam = params.newParam || defaultValue;
   ```

2. **f_coverage 선언 순서** — `air_strength_base` 계산 후, `f_coverage` 선언 후, `air_strength` 합산 순서 반드시 유지

3. **단수 입력값 읽기** — `ak_stages`는 `<input type="hidden">`으로 변경됨. `+$('ak_stages').value`로 읽음

4. **PDF 한글 금지** — `exportPDF()` 내 모든 텍스트는 영문/ASCII만 사용

5. **Node.js 검증** — 수식 변경 후 반드시 아래로 검증:
   ```bash
   node --no-warnings test.js
   # test.js: DOM stub + main_js + calc() 실행
   ```

6. **버전 업데이트 위치** (5곳 동시 변경):
   - `<title>` 태그
   - 헤더 `.ver` 배지
   - `ver:'x.x'` (Firebase 저장 시)
   - PDF footer 텍스트
   - GitHub commit message

---

## 11. 참고문헌

| # | 문헌 | 적용 수식 |
|---|------|---------|
| 1 | Munson et al., *Fundamentals of Fluid Mechanics*, 8th ed., Wiley 2016 | 연속 방정식 |
| 2 | Rajaratnam, *Turbulent Jets*, Elsevier 1976 | 슬릿 자유 제트 감쇠 |
| 3 | Forthmann, "Über Turbulente Strahlausbreitung", *Ingenieur-Archiv* 5, 1934 | 슬릿 제트 실험식 |
| 4 | Bhagat et al., "Drainage of thin liquid film by turbulent air jet", *AIChE J.* 65(5), 2019 | Weber 수, 수막 파단 |
| 5 | Beltaos & Rajaratnam, *ASCE J. Hydr. Div.* 100, 1974 | 충돌 제트 |
| 6 | Sparrow & Lovell, *J. Heat Transfer* 102, 1980 | 경사 충돌각 최적 범위 |
| 7 | Incropera et al., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley 2011 | 지수 감쇠 모델 |
| 8 | ISO 5167-1:2003 | 오리피스 유량 측정 |
| 9 | Siemens/Aerzener Ring Blower Technical Catalogue, 2020 | 링블로어 유량 보정계수 |
| 10 | OEMS Inc., "Air Knife Performance Optimization", White Paper, 2018 | 단당 제거율 상한 실측치 |
