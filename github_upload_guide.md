# Insys GitHub 업로드 가이드

> 담당: 인시스 그룹 AI혁신 R&D센터 | 작성일: 2026.06.24 | v1.0

---

## 저장소 정보

| 항목 | 내용 |
|------|------|
| 저장소 | https://github.com/Insys-HQ/Insys-review |
| GitHub Pages | https://insys-hq.github.io/Insys-review/ |
| 기본 브랜치 | main |
| 파일 URL 규칙 | `https://insys-hq.github.io/Insys-review/파일명.html` |

---

## 업로드 도구

🔗 **https://insys-hq.github.io/Insys-review/github_uploader.html**

브라우저에서 직접 GitHub에 파일을 올리는 도구. 북마크 저장 권장.

---

## PAT (Personal Access Token)

| 항목 | 내용 |
|------|------|
| 만료 | 무기한 |
| 권한 | repo (전체 쓰기) |
| 보관 | Claude 메모리 저장됨 |

> ⚠️ PAT 유출 시 즉시 삭제 후 재발급  
> GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Delete

---

## 방법 A — 업로더 도구 사용 (권장)

Claude가 파일을 만든 후 직접 다운로드해서 업로드하는 방식.

1. Claude에서 파일 다운로드
2. 업로더 도구 열기 → https://insys-hq.github.io/Insys-review/github_uploader.html
3. PAT 입력
4. 파일 드래그 또는 클릭하여 선택
5. 커밋 메시지 입력 (선택)
6. **GitHub에 업로드** 버튼 클릭
7. 완료 후 GitHub Pages 링크 확인 (1~2분 소요)

---

## 방법 B — Claude에게 직접 요청

Claude가 파일 생성 후 PAT를 이용해 GitHub API로 직접 푸시.

```
"[파일명] GitHub에 업로드해줘"
```

Claude가 저장된 PAT로 자동 처리. 별도 작업 불필요.

---

## PAT 신규 발급 방법

PAT 만료 또는 유출 시 재발급 절차.

1. https://github.com 로그인
2. 우측 상단 프로필 → **Settings**
3. 좌측 하단 **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token (classic)** 클릭
6. 설정:
   - Note: `insys-upload`
   - Expiration: `No expiration` (또는 원하는 기간)
   - Scope: ✅ **repo** 체크
7. **Generate token** 클릭
8. `ghp_` 로 시작하는 토큰 즉시 복사
9. Claude에게 "PAT 업데이트해줘" + 토큰 붙여넣기

---

## GitHub Pages 반영 시간

| 상황 | 소요 시간 |
|------|----------|
| 신규 파일 | 1~3분 |
| 기존 파일 업데이트 | 1~2분 |
| 브라우저 캐시 | 강제 새로고침 필요 (`Ctrl+Shift+R`) |

---

## 주요 파일 목록

| 파일명 | 설명 | GitHub Pages URL |
|--------|------|-----------------|
| `github_uploader.html` | GitHub 업로드 도구 | https://insys-hq.github.io/Insys-review/github_uploader.html |
| `dryer_spec.html` | 박스세척건조기 에어나이프 제작사양서 v1.9 | https://insys-hq.github.io/Insys-review/dryer_spec.html |

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `Bad credentials` 오류 | PAT 만료 또는 삭제됨 | PAT 재발급 후 Claude에 전달 |
| 링크 접속 안 됨 | 파일 미업로드 또는 Pages 미반영 | 1~2분 대기 후 재시도 |
| 파일 내용 안 바뀜 | 브라우저 캐시 | `Ctrl+Shift+R` 강제 새로고침 |
| `404 Not Found` | 파일명 오타 또는 업로드 안 됨 | 저장소에서 파일 존재 확인 |
