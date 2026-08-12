# 화재복구 TF 통합관리 웹앱 v1.1

담당: 인시스 AI혁신 연구개발실 (ys.kim@in-sys.co.kr)

## 1. 최초 1회, Firebase 콘솔에서 설정할 것

1. **Firestore 데이터베이스 생성**
   콘솔 → Firestore Database → 데이터베이스 만들기 → 프로덕션 모드
   생성 후 "규칙" 탭에 `firestore.rules` 내용을 붙여넣고 게시

2. **Storage 활성화**
   콘솔 → Storage → 시작하기
   생성 후 "규칙" 탭에 `storage.rules` 내용을 붙여넣고 게시

3. **Authentication 활성화**
   콘솔 → Authentication → Sign-in method → "익명" 로그인 사용 설정

4. **TF 접속 암호 변경 (선택)**
   `index.html` 안에서 아래 줄을 찾아 원하는 암호로 변경
   ```
   const TF_PASSCODE = "insys2026";
   ```
   ※ 이 암호는 화면 진입만 막는 용도이며, 실제 데이터 접근 통제는 위 2)Authentication + 보안규칙이 담당합니다.

## 2. 배포 방법 (택 1)

### A. Firebase Hosting (추천)
```
npm install -g firebase-tools
firebase login
firebase init hosting   (이 폴더에서 실행, public 디렉토리는 이 폴더 지정)
firebase deploy
```

### B. GitHub Pages
이 폴더를 저장소(Insys-HQ/Insys-review)에 올린 뒤
저장소 설정 → Pages → 브랜치 지정하면 아래 주소로 접속 가능합니다.
```
https://insys-hq.github.io/Insys-review/tf-app/
```

## 3. 화면 구성

| 탭 | 기능 |
|---|---|
| 트랙현황 | 화재보상/지자체지원/고객사보상/공장신축 4개 트랙 현재상태를 텍스트로 기록·저장 |
| 사진 타임라인 | 화재현장/철거/공사진행 사진 업로드 + 한줄 메모, 최신순 정렬 |
| 파일함 | 오피스·PDF 파일 업로드/열람/다운로드/삭제, 트랙별 분류 |
| 카톡 정리 | 카톡 캡쳐 이미지 업로드 + 수동 태그·한줄 요약 |
| 일정관리 | 트랙별 마일스톤 등록, 상태(계획/진행중/완료) 관리 |

## 4. 법률의견 AI분석 기능 (v1.1 신규) — 배포 필수 절차

"법률의견 AI분석" 탭에서 PDF 업로드 시 Claude(Anthropic API)가 자동으로
핵심쟁점/권고조치/기한/리스크/관련트랙을 분석해 보여줍니다. **아래 절차를 반드시 완료해야 동작합니다.**

### 4-1. Firebase 요금제를 Blaze(종량제)로 전환
콘솔 좌측 하단 "업그레이드" → Blaze 플랜 선택 (Cloud Functions는 무료 플랜(Spark)에서 실행 불가)
※ 실제 사용량이 적으면 월 비용은 거의 발생하지 않습니다. (호출당 과금)

### 4-2. Anthropic API 키 발급
https://console.anthropic.com 에서 API 키 발급 (기존 사내 키가 있다면 그것을 사용해도 됩니다)

### 4-3. Firebase CLI 설치 및 로그인 (최초 1회, 로컬 PC에서)
```
npm install -g firebase-tools
firebase login
```

### 4-4. API 키를 Cloud Functions 시크릿으로 등록 (코드에 노출되지 않음)
```
cd tf-app 상위 폴더(repo 루트)로 이동
firebase use insys-work
firebase functions:secrets:set ANTHROPIC_API_KEY
```
→ 프롬프트가 뜨면 발급받은 Anthropic API 키 값을 붙여넣기

### 4-5. 함수 배포
```
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4-6. 확인
배포 완료 후 웹앱에서 "법률의견 AI분석" 탭 → PDF 업로드 시 자동으로 분석 결과가 표시됩니다.
현재는 **PDF만 지원**합니다. (doc/docx는 PDF로 변환 후 업로드 안내 문구가 뜹니다)

### 참고
- 분석 결과는 법적 자문을 대체하지 않는 TF 내부 참고용입니다. 실제 의사결정 전 담당 변호사 확인이 필요합니다.
- 함수 리전은 `asia-northeast3`(서울)로 설정되어 있습니다.

## 5. 그 외 다음 단계 (미포함, 확장 검토 필요)

- **카톡 캡쳐 AI 자동요약**: 위 법률의견 분석과 동일한 Cloud Functions 구조를 재사용해 확장 가능합니다.
- **접근 권한 세분화**: 현재는 TF원 전원이 같은 암호로 접속·수정 가능한 구조입니다.
  담당자별 로그인/권한 분리가 필요하면 Firebase Authentication을 이메일 로그인 방식으로 전환 필요.
