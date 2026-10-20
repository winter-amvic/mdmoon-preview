# mdmoon.com v2 — 정적 사이트 (작업 중)

빌드: 2026-10-20 · 대상: https://mdmoon.com 리뉴얼 · 언어: EN / 한국어 / 中文

## 구조

```
build/site-v2/
  index.html          홈 (3D 히어로 + 진료 철학 + 5개 진료과 + 영상 + 의료진)
  services.html       5개 진료과 상세 (교차 레이아웃)
  doctors.html        의료진 + 클리닉 소개 + 갤러리 일부
  gallery.html        수집 이미지 94장 + 영상
  contact.html        전화·이메일·진료시간·두 곳의 진료실
  assets/css/site.css 디자인 시스템 (타이포그래피 중심)
  assets/js/i18n.js   3개 언어 사전 (자동 생성)
  assets/js/site.js   언어 전환·드로어·라이트박스·영상 파사드
  assets/js/three-hero.js  three.js 히어로 (파티클 + 링, reduced-motion 대응)
  assets/media/       mdmoon.com에서 수집한 실제 이미지 146장
  media-manifest.json 원본 URL · 파일명 · 바이트 매핑
```

## 재생성

```bash
python tools/wp_media.py     # WP REST에서 미디어 수집 (assets/media)
python tools/build_site.py   # 5개 페이지 + i18n.js 생성
```

`tools/build_site.py` 안의 `C` 딕셔너리가 **모든 문구의 단일 소스**입니다.
문구를 고치면 3개 언어가 동시에 바뀝니다.

## 디자인 방침

- **타이포그래피 우선**: 제목 Fraunces(optical size 가변 세리프), 본문 Inter,
  한국어 Noto Sans KR, 중국어 Noto Sans SC. `letter-spacing`/`line-height`를
  언어별로 보정 (`html[lang="ko"] { word-break: keep-all }`).
- CJK는 **가짜 이탤릭 금지** — 강조는 색(골드)으로만.
- 팔레트: 잉크 네이비 `#0a1a24` / 아이보리 `#f8f5ef` / 골드 `#a9822c`.
- three.js: 파티클 2,000개 + 얇은 링 3개, 포인터 패럴랙스.
  WebGL 없거나 `prefers-reduced-motion`이면 CSS 그라디언트로 폴백.
- 접근성: skip link, `aria-current`, 라이트박스 ESC/화살표, 44px 터치 타깃.

## 자산

- 이미지 **146장**(53.4MB) 수집. 갤러리에는 로고·프로모 배너를 제외한 94장 사용.
- 영상 1편: YouTube `ThSO1JXQiZM` (채널 @taewonmoonmd830) — 클릭 시
  `youtube-nocookie` iframe으로 로드(초기 로딩 비용 0).
- 로고: 310×170 PNG가 작아서 **SVG 워드마크(TM 모노그램 + 세리프 워드마크)**로
  재제작. 어떤 해상도에서도 선명.

## 아직 남은 것

1. **원장님 사진 — 해결 ✅** `team_dr_moon_md_cc.jpg`(500×500) 적용.
   더 큰 원본(1000px 이상)이 있으면 `IMG["moon"]`만 교체하면 됩니다.
   ※ `mdmoon.jpg`는 스톡 사진(모델)이라 원장님으로 쓰지 않았습니다.
2. 갤러리 큐레이션 — 다운로드 실패/근검정 이미지 10장을 제외한 **84장** 사용.
   시술 전후 사진은 별도 동의·표기 검토 필요.
3. 배포 — 현재 `file://` 로컬 프로토타입. 새 WP 인스턴스(또는 정적 호스팅)로
   이전 후 EN/KO/ZH 별도 URL + 301 리다이렉트(`design/redirects.csv`).
4. 폼 — 현재 전화/메일 링크만. 문의 폼은 백엔드(또는 Formspree 등) 연결 필요.

---

## v3 업데이트 (2026-10-20)

| 항목 | 내용 |
|---|---|
| 갤러리 | JS `is-loaded` 게이팅 제거(스크립트 실패해도 표시), 근접 중복 해시 제거, **실사진 30장**만 수동 선별(광고 배너·블로그 캡처·일러스트 제외). 공간 15 / 시술 11 / 의료진 4 |
| 영상 | YouTube iframe 대신 **로컬 MP4**(`assets/video/clinic.mp4`, 10MB)로 교체 → `file://`에서 재생 오류 없음 |
| 진료과 상세 | `tools/services_content.py`에 KO 원문 + EN/ZH 번역. `services.html` 각 섹션에 본문 삽입 |
| 연락처 | 두 곳 사무실 카드 + OSM 지도 + Google Maps 길찾기(이동시간) 링크 + 예약 폼 |
| 예약 폼 | FormSubmit → moonmdny@gmail.com, 발신자 이메일이 reply-to로 들어가 병원이 바로 회신 가능 |
| 로고 | 원본 `logo_mdmoon_310x170.png` → FAL `esrgan` 4x 업스케일(1240×680), 알파 채널 원본에서 복원 |
| 디자인 | 로고 시안에 맞춰 액센트 재조정, 통계 밴드, 서비스 썸네일 카드, 후기 3열, 롱폼 타이포그래피 |

### 주의
- FormSubmit는 **첫 제출 시 1회 인증 메일**이 옵니다(moonmdny@gmail.com). 링크를 눌러야 이후 자동 전달됩니다.
- Google Maps **임베드**는 API 키가 필요해 OSM 지도로 대체했습니다. 길찾기·이동시간은 Google Maps 링크로 연결됩니다.
- Lipo 섹션은 KO 원문이 길어, EN/ZH는 충실한 요약입니다. 전문 번역이 필요하면 알려주세요.
- 스크린샷/인쇄용: `?noanim=1` (애니메이션 없이 최종 상태 렌더)

## v4 업데이트 — 로고 / 타이틀 장식

- **헤더 로고**: FAL 업스케일본에서 부제(PLASTIC SURGERY LASER CLINIC) 아래를 잘라 `logo_mdmoon_mark.png` 생성, 높이 74px(헤더 96px)
- **푸터 로고**: 104px + 부제를 CSS 텍스트(`brand__tagline`)로 조판 → 작은 래스터 글씨 대신 선명하게 읽힘
- **히어로 타이틀**: 큰 여는 따옴표(장식) + 헤어라인 괘선 + 닫는 따옴표. 모든 페이지 공통 적용
- **지도**: iframe 즉시 로드는 `file://`에서 타일이 비어 보여 **클릭 시 로드** 방식으로 변경. Directions/Google Maps 링크는 그대로

## v5 — 원형 인물 사진 · 아이콘 · 로고 조정
- 의료진 사진: 1:1 원형(최대 400px), 얼굴 중심 크롭(`object-position: center 22%`), 텍스트 중앙 정렬
- 전화/이메일 앞 아이콘: 상단바·사무실 카드·CTA·푸터에 인라인 SVG
- 로고 색: 헤더용 `logo_mdmoon_mark_deep.png`(원본 ×0.82), 푸터는 다크 배경 대비를 위해 원본 밝은 버전 유지
- 로고 크기: 헤더 62px, 푸터 84px

## v6 — 로고 축소 · 따옴표 그래픽 · 언어별 타이포 보정
- 로고: 헤더 54px(헤더 76px), 푸터 72px
- 히어로 따옴표: 인라인 SVG(`QUOTE_SVG`) 하나를 좌상단/우하단에 동일 크기로 배치, 닫는 쪽은 `scaleX(-1)` 반전. 외부 파일 마스크는 `file://`에서 렌더되지 않아 인라인으로 전환
- 한국어 제목 0.76배, 중국어 0.84배 (`--t-hero` 기준) — 한글·한자 정사각 글리프 보정
- 내비 현재 페이지 항목이 커 보이지 않도록 `.nav__link` 크기 고정 + 색 대비로만 구분
- 진료 시간 문구에 `<br>` 삽입 (`월 · 수 · 금` / `오전 9:00 ~ 오후 6:00`)

## v7 — 로고 교체 · 메뉴 대비 · 링크
- 로고: 제공 파일 사용 (`logo_header_182x100.png` 헤더 46px, `logo_footer_white.png` 푸터 56px)
- 상단 위치 안내 → `contact.html#locations` 링크 (호버 시 화살표 이동)
- 마만 표기: "닥터 대니얼 Y. 마만"
- 닫는 따옴표: `rotate(180deg)` → 꼬리가 아래(99 모양)
- 내비: 진한 잉크색 + 호버 시 시안 전환·2px 밑줄 슬라이드, 현재 페이지는 시안 유지

## v8 — 배너 캐러셀 · 로고 미세조정
- 진료 분야 아래 가로 롤링 배너 추가 (`promo_block()`): 8개 미니배너, 스크롤 스냅 + 화살표 + 점, 언어 전환 시 해당 언어 배너로 자동 교체
- 상단 로고: 부제 영역 제거본(`logo_header_notext.png`, 175×51) 사용, 46px
- 하단 로고: 흰색 로고 74px
- 진료 카드 6개(5개 + 상담 CTA)로 3×2 균등 그리드

## v9 — 드래그 스크롤 · 로고 업스케일 · SNS · 통계 압축
- 배너: 포인터 이벤트 기반 마우스 드래그 스크롤(드래그 중 스냅 해제, 이미지 드래그 차단), 터치는 네이티브 스크롤
- 헤더 로고: FAL esrgan 4x (175×51 → 700×204, 알파 복원)
- 푸터 SNS: Facebook / Instagram / TikTok(#) / YouTube — 실제 계정은 연결됨
- 통계 밴드: 한 줄 스트립으로 압축(높이 약 60% 감소)

## v10 — 언어별 비율 · 통계 가독성 · SNS 위치
- 히어로 제목: EN 0.84 / KO 0.72 / ZH 0.78 (`--t-hero` 배율) → 세 언어 시각 무게 통일
- 통계: 숫자 2.1~2.7rem, 라벨 0.78rem으로 확대
- SNS: 로고 → 설명문 → SNS 순서로 이동, 호버는 시안 틴트(아이콘이 사라지지 않음)
- 헤더 로고: FAL 4x + 0.78 다크닝 + contrast 필터, 50px
