# 모바일 웹 HTML 디자인 지침 (RC-NET 가이드 기준 · 2026-07)

## 헤더 구성 원칙
- 헤더 높이: PC=44px / 모바일=40px (최소화)
- 헤더 내부 구성 (좌→우): [배지] [제목] ... [간소화된 메타] [뷰토글]
- 뷰토글(PC/모바일 전환 버튼)은 **헤더 내부 우측**에 포함 — 별도 fixed 버튼 금지
- 모바일 모드에서는 header-meta(작성자·기관·버전 등 보조 텍스트) 숨김(display:none)
- 모바일 모드에서 제목 폰트 축소: 13px → 12px
- 헤더는 항상 sticky (top:0, z-index:1000)

## 뷰 토글 버튼 스타일
- 헤더 배경과 어울리는 반투명 스타일: background:rgba(255,255,255,.15)
- 활성 버튼: background:var(--accent) (강조색)
- 비활성: 반투명 텍스트
- border-radius:16px (pill형)
- JS에서 position 조작 금지 — CSS로만 제어

## 모바일 네비게이션 (탭바)
- 헤더 바로 아래 sticky: top = 헤더 높이(40px)
- 가로 스크롤 탭바: overflow-x:auto, scrollbar 숨김
- 탭 아이템: 이모지 + 짧은 한글 (2~4자)
- 패딩: 6px 9px, 폰트: 10px
- 활성 탭: 하단 border 강조색(accent2)
- PC 모드에서는 display:none

## PC 레이아웃
- 좌측 사이드바(220px) + 우측 콘텐츠 2단 grid
- 사이드바: sticky, top = 헤더 높이+여유(52px)
- 모바일 탭바: display:none

## 모바일 레이아웃
- 단일 컬럼, max-width:480px, 여백 최소화(8px)
- 사이드바: display:none
- 테이블 폰트: 11px, 셀 패딩: 4px 6px
- 이미지 카드: max-width:100% (narrow 클래스 무효화)
- 노드 그리드: 2열 → 1열 (400px 이하)
- DTMF 그리드: 3열 → 2열 (400px 이하)

## 공통 폰트/색상
- 폰트: Noto Sans KR (Google Fonts)
- 최소 폰트: 10px
- 배경: #f0f4fa / 카드: #ffffff
- 텍스트: #2d3748 (짙은 회색)
- 강조: #2563a8 (파랑), #e8440a (레드오렌지)
- 헤더: linear-gradient(navy → blue)

## 섹션 구성
- 접기/펼치기 토글 방식 (toggleSection)
- 섹션 헤더: 색상으로 카테고리 구분 (navy/blue/green/red/purple/teal)
- 섹션 간격: margin-bottom:10px
- 내부 패딩: 12px 14px

## 버전 관리
- 코드 내 버전값과 헤더 표시 버전 동시 업데이트
- 형식: vX.X (v1.0 → v1.1 → v2.0)

## 금지 사항
- fixed 버튼을 콘텐츠 위에 겹쳐서 사용 금지
- 모바일에서 긴 텍스트를 한 줄로 강제 금지 (white-space:nowrap 남용 금지)
- 헤더 높이 60px 초과 금지
- 모바일에서 보조 정보(작성자·기관명 등) 헤더에 노출 금지
