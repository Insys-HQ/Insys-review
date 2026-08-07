# 화재복구 TF 통합관리 웹앱 v1.0

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

## 4. 다음 단계 (미포함, 확장 검토 필요)

- **카톡 캡쳐 AI 자동요약**: Firebase Cloud Functions에 Claude API 키를 서버 쪽에 보관하고,
  캡쳐 업로드 시 Cloud Function이 이미지를 읽어 요약을 자동으로 채우는 방식으로 구현 가능합니다.
  (정적 사이트에 API 키를 직접 넣으면 브라우저에서 키가 노출되어 보안상 권장하지 않습니다.)
- **접근 권한 세분화**: 현재는 TF원 전원이 같은 암호로 접속·수정 가능한 구조입니다.
  담당자별 로그인/권한 분리가 필요하면 Firebase Authentication을 이메일 로그인 방식으로 전환 필요.
