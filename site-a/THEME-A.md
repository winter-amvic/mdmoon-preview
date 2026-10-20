# THEME-A.md — build/site-a (A안 「임상적 럭셔리」 작업 사본)

`build/site-v2` 를 **손대지 않고** 그대로 복제해 만든 A안 프로젝트. 2026-10-20 시작.

en 지시: "현재 만들어진 웹사이트는 그대로 두고 A안으로 프로젝트를 새로 만들어 진행."
site-v2 는 지금 배포본(winter-amvic/mdmoon-preview)의 소스이므로 여기서 변형하지 않는다.

## 단계별 기록

| 단계 | 도구 | 결과 |
|---|---|---|
| 1. 되돌릴 지점 | `git tag pre-theme-a` | 태그 생성 |
| 2. 사본 | `cp -r build/site-v2 build/site-a` | 64MB, 5페이지 동일 |
| 3. 색 토큰화 | `python tools/tokenize_css.py` | 사용처 hex 25→0, rgba 85→0 (`:root` 정의 13 hex+1 rgba 는 보호) |
| 4. 테마 | `assets/css/theme-a.css` (신규 343줄) | A 팔레트·타입·여백·모션 + `design/theme-a-spec.md` 3장 정합 보정 |
| 5. 링크 | `python tools/link_theme_a.py` | 5개 HTML: Noto Serif KR/SC 폰트 추가 + theme-a.css 를 site-v4.css 뒤에 삽입 |
| 6. 캡처 | `python tools/cdp_shot.py` | 1440/390 실제 뷰포트 · KO/ZH · 전체 높이 |

## 검증 (실측, 추정 없음)

- **토큰화는 렌더를 바꾸지 않는다**: v2 vs site-a 픽셀 비교 차이 4,807 — 같은 페이지를 두 번 렌더한 기준선 노이즈 7,229보다 작다(애니메이션·폰트 타이밍 차이).
- **색 리터럴**: 사용처 기준 hex 25 → 0, rgba 85 → 0. `rgb(var(--ink-rgb) / .12)` 형태라 테마에서 채널 한 줄만 바꾸면 86개 알파 변형이 따라온다.
- **가로 오버플로**: 1440 = 1440, 390 = 390 (수정 전 590).
- **계산값**: `.hero h1 em` = rgb(46,90,107)=`--cool`, `.foot h3` = rgb(143,182,196)=`--cool-lt`, `.eyebrow` = #7A5C2A, `.section--ink .eyebrow` = #C2A46B.

## 같이 고친 **기존 사이트의 실제 결함**

1. **모바일 내비게이션 진입 불가** — 1080px 이하에서 `.nav__cta` 가 남아 `.menu-btn` 을 화면 밖으로 밀어냈다. 390px 실측 scrollWidth 590 → 메뉴 버튼 right=590(보이지 않음). theme-a 모바일 블록에서 `.nav__cta{display:none}` + 헤더 간격·로고·언어토글 축소로 390에 맞춤.
2. **다크 밴드 본문 대비** — `--muted`(#5F6D72)가 `--ink`(#101E23) 위에서 2.2:1. `.section--ink p` 등을 `--on-ink-72` 로 교체.
3. **CTA 밴드 버튼이 배경에 묻힘** — `.cta .btn--gold` 를 아이보리 솔리드로 뒤집음.

## 아직 안 한 것

- **배포 안 함** — en 컨펌 대기. `build/site-a` → `.deploy-tmp` → commit → push 는 승인 후에만.
- **font-size 29개 / padding 46개 토큰화** — 이번엔 색만 토큰화. 타입·여백 리터럴은 테마에서 개별 override 로 처리했고 전면 치환은 다음 단계.
- **designer 2차 감사** — 요청해둔 상태. 결과 반영 전에는 배포하지 않는다.
- 위 결함 3건은 `build/site-v2` 에도 그대로 있으므로, v2를 계속 쓸 경우 별도 수정이 필요하다.

## 재생성 순서

```
cp -r build/site-v2 build/site-a
python tools/tokenize_css.py
python tools/link_theme_a.py
python tools/cdp_shot.py "file:///.../site-a/index.html" out.png --w 1440 --h 900 --full
```

## 2차 반영 (designer spec 4·5장)

- **언어 배율 3중 정의 제거**: `site-v3.css` KO×0.76/ZH×0.84/lede×0.96 블록과 `site-v4.css` KO×0.72/ZH×0.78 블록을 **삭제**. 이제 `theme-a.css` 의 `html[lang]` 변수 곱셈 한 곳에서만 관리된다(잔여 규칙 0 확인).
- **히어로 반전 마무리**: `.hero::after` 다크 스크림 → 24px 헤어라인 격자(opacity .06). `.hero__q` 장식 따옴표는 `display:none`.
- **원장 사진 4:5**: `1/1 + border-radius 50%` → `4/5 + radius-sm + object-position 50% 32%` (A1 샷리스트 기준).
- **금색 리터럴 4곳**(scroll-cue 그라디언트·모노그램 내부 테두리·office 링크 밑줄·포커스 링)을 각각 ink/on-ink16/line/teal 로 교체.
- **카드 그림자 3곳**(.svc/.testi__item/.split__media)만 유지, promo 카드 그림자 제거, sns:hover 중복 통합.
- **검증(계산값)**: `.hero h1 em`=--cool, `.foot h3`=--cool-lt, `.eyebrow`=--accent, `.section--ink .eyebrow`=--accent-2.

### 남긴 판단 — gold 55곳의 in-place 치환

**지금은 theme-a.css 오버라이드로 처리했고, 원본 3파일에는 `var(--gold*)` 선언이 55곳 남아 있다.** designer의 완료 판정(§5, grep으로 4개만)은 아직 미충족.

이유: `tools/prune_gold.py --check` 로 재보니 theme-a가 덮는 선택자는 39건 삭제 가능, 15건은 단일행 블록/그룹 선택자라 선택자 매칭이 어긋나 수동 매핑이 필요하다. 선언 삭제는 theme 규칙이 특이도에서 이길 때만 안전해서, **승인된 화면을 기준선으로 두고** 한 번에 치환하는 게 안전하다(지금 치환하면 회귀가 어느 변경 때문인지 구분이 안 된다).

→ 배포 승인 후 별도 단계로 처리하고, 처리 후 `pre`/`post` 픽셀 비교로 무회귀를 증명한다.

## 3차 — designer 감사 반영 4건 (실측 before → after)

| # | 문제 | 조치 | 측정 |
|---|---|---|---|
| 1 | **ZH 배율이 실제로 죽어 있었다** — i18n 이 `lang="zh-CN"` 을 넣는데 CSS 선택자는 `html[lang="zh"]` | 선택자 `html[lang="zh"]` → `:lang(zh)` | hero 87.84px → **83.448px**(=88×0.95) |
| 2 | **Noto Serif SC 미로드** — 세리프 스택에서 KR 이 먼저라 SC 가 영영 로드되지 않음(중국어가 한국식 자형) | `:lang(zh)` 스코프에서 SC 우선 | `fonts.check('Noto Serif SC')` false → **true** |
| 3 | ghost 버튼 hover 가 accent-2(porcelain 위 2.16:1) | border `--accent`, 글자 `--ink` | — |
| 4 | 후기 섹션이 다크라 다크 밴드 3개(원장·후기·CTA) → A안 "낙차 2개" 약화 | `.section--ink:has(.testi)` 를 밝게, 카드 `--surface` + `--sh-2`, `.doc__photo` 그림자 `--sh-3` | 섹션 rgb(245,244,239) / 카드 rgb(252,251,247) |

designer 계산 검증: 다크 밴드 본문 `--on-ink-72` = 8.52:1, CTA 버튼 반전 = 15.48:1, 다크 eyebrow 7.16:1, 푸터 cool-lt 8.43:1 — **예외 3건 모두 v2보다 대비 상승, 규정 위반 아님**.

### 다음 단계 목록 (designer 지적 잔여)

- gold 55곳 in-place 치환(승인 후, 승인 화면 기준선 + 픽셀 비교)
- `hero__q` 죽은 코드 정리(site-v3.css 97-112, 마크업 2개)
- 모바일 메뉴 안에 예약 CTA 경로 추가(헤더에서 `.nav__cta` 숨긴 대체)
- 탭 타깃 44px 미달: `lang__btn` 30×26, promo dot 12×6 — A안 이전부터 있던 문제
- font-size 29 / padding 46 토큰화

### 3차 추가 — ZH 행간 (designer 4차 지적)

`html[lang="zh"]` 를 쓰던 **6개 선택자**를 `html[lang^="zh"]` 로 치환(site.css 4 / site-v3.css 2). `:lang()` 대신 속성 접두 매칭을 쓴 이유는 특이도를 그대로 유지해 캐스케이드 승자를 바꾸지 않기 위해서다. theme-a.css 의 죽은 중복 선언 1줄도 삭제.

실측(EN/ZH/KO):

| 언어 | hero fs | line-height | 비율 | body fs | line-break |
|---|---|---|---|---|---|
| en | 87.84px | 89.60px | 1.02 | 16.992px | auto |
| zh-CN | 83.448px | **98.469px** | **1.18** | 16.6522px | strict |
| ko | 84.3264px | 99.505px | 1.18 | 16.992px | auto |

수정 전 ZH 는 85.117px(1.02) — KO 보다 빽빽했다. `line-break: strict` 도 이제 실제로 적용된다(이전엔 선택자 불일치로 미적용).

### 4차 추가 — 보조 버튼 기본 테두리

`.btn--ghost { border-color: var(--accent) }` 1줄 추가. 이전 기본값은 `--line`(#D8D9D2)으로 porcelain 위 1.29:1 — 버튼 경계가 배경과 거의 같았다(WCAG 2.1 비텍스트 3:1 미달). 실측 borderColor rgb(122,92,42)=--accent(5.62:1), color rgb(16,30,35)=--ink, 1px. spec R2(버튼 테두리)가 원래 자리로 복귀.

designer 최종 판정: **배포 가능**. 미리보기 업로드는 en 컨펌 사항.
