# 화재복구 TF 통합관리 웹앱 v1.5

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

4. **접속 암호 없음 (v1.5부터)**
   TF원 접근성을 위해 별도 암호 입력 화면을 없앴습니다. 대신 Firebase Authentication의 익명 로그인으로
   인증이 자동 처리되며, 데이터 접근 통제는 Firestore/Storage 보안규칙(로그인된 사용자만 허용)이 담당합니다.
   외부인 접근을 막으려면 GitHub 저장소/Pages를 비공개로 전환하거나, 이메일 로그인 방식으로 변경해야 합니다(요청 시 안내).

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
https://insys-hq.github.io/Insys-review/itk-tf/
```

## 3. 화면 구성

| 탭 | 기능 |
|---|---|
| 트랙현황 | 화재보상/지자체지원/고객사보상/공장신축 4개 트랙 현재상태를 텍스트로 기록·저장 |
| 사진 타임라인 | 화재현장/철거/공사진행 사진 업로드 + 한줄 메모, 최신순 정렬 |
| 파일함 | 오피스·PDF 파일 업로드/열람/다운로드/삭제, 트랙별 분류 |
| 카톡 정리 | 카톡 캡쳐 이미지 업로드 + 수동 태그·한줄 요약 |
| 일정관리 | 트랙별 마일스톤 등록, 상태(계획/진행중/완료) 관리 |

## 4. 법률의견 AI분석 기능 — 설정 방법 (터미널 없이 웹 화면만으로)

"법률의견 AI분석" 탭에서 PDF 업로드 시 Claude(Anthropic API)가 자동으로
핵심쟁점/권고조치/기한/리스크/관련트랙을 분석해 보여줍니다.

### 4-1. Firebase 요금제를 Blaze로 전환
Firebase 콘솔(https://console.firebase.google.com) → insys-work 프로젝트 → 좌측 하단 "업그레이드" → Blaze 선택 → 결제수단 등록
(완료하셨다면 이 단계는 건너뛰세요)

### 4-2. Google Cloud Console에서 함수 생성 (클릭만으로 배포)
1. https://console.cloud.google.com/functions 접속 → 상단에서 프로젝트를 **insys-work**로 선택
2. "함수 만들기" 클릭
3. 기본 설정
   - 환경: **2세대**
   - 함수 이름: `analyzeLegalDoc`
   - 리전: `asia-northeast3 (서울)`
   - 트리거: **HTTPS**, 인증 안 됨(공개 액세스 허용) 체크
4. "런타임, 빌드, 연결 및 보안 설정" 펼치기 → **런타임 환경 변수** 섹션에서 "+ 변수 추가"
   - 이름: `ANTHROPIC_API_KEY`
   - 값: 발급받은 Anthropic API 키(sk-ant-로 시작하는 값) 붙여넣기
5. "다음" 클릭 → 런타임: **Node.js 20**, 진입점: `analyzeLegalDoc`
6. 소스 코드 편집기에서
   - `index.js` 탭에 이 저장소의 `functions/index.js` 내용 전체를 복사해서 붙여넣기
   - `package.json` 탭에 이 저장소의 `functions/package.json` 내용 전체를 복사해서 붙여넣기
7. "배포" 클릭 (2~3분 소요)

### 4-3. 배포된 함수 URL을 앱에 연결
1. 배포 완료 후 함수 상세 화면 상단에 있는 **트리거 URL**을 복사
   (예: `https://analyzelegaldoc-xxxxxxx-du.a.run.app`)
2. `itk-tf/index.html` 파일 안에서 아래 줄을 찾아 복사한 URL로 교체
   ```
   const LEGAL_ANALYZE_URL = "여기에_배포된_함수_URL을_붙여넣으세요";
   ```
3. 수정한 파일을 다시 GitHub에 올리면 (챗봇에게 "다시 올려줘"라고 요청하시면 됩니다) 자동 반영됩니다.

### 확인
https://insys-hq.github.io/Insys-review/itk-tf/ → 법률의견 AI분석 탭 → PDF 업로드 → 30초~1분 내 분석 결과 표시

### 참고
- 이 방식은 API 키를 Cloud Function의 "환경 변수"로 저장합니다. Secret Manager보다 접근 통제가 느슨하므로,
  이 프로젝트(insys-work)에 접근 권한이 있는 사람만 콘솔에서 값을 볼 수 있다는 점 참고해주세요.
  더 엄격한 보안이 필요하면 이후 Secret Manager로 전환 가능합니다(요청 시 안내).
- 분석 결과는 법적 자문을 대체하지 않는 TF 내부 참고용입니다.
- 현재는 **PDF만 지원**합니다.

## 5. 그 외 다음 단계 (미포함, 확장 검토 필요)

- **카톡 정리**: v1.4부터 이미지 업로드가 아닌 텍스트 붙여넣기 방식입니다. v1.5부터 등록된 내용의 수정도 가능합니다.
- **업데이트 알림**: 새 버전을 배포할 때는 `index.html`의 `APP_VERSION` 값과 `version.json`의 값을 항상 함께 올려야
  접속 중인 사용자 화면에 "새 버전이 배포되었습니다" 안내 배너가 뜹니다. (배포 후 최대 몇 분 내 반영)

- **카톡 캡쳐 AI 자동요약**: 위 법률의견 분석과 동일한 Cloud Functions 구조를 재사용해 확장 가능합니다.
- **접근 권한 세분화**: 현재는 TF원 전원이 같은 암호로 접속·수정 가능한 구조입니다.
  담당자별 로그인/권한 분리가 필요하면 Firebase Authentication을 이메일 로그인 방식으로 전환 필요.
