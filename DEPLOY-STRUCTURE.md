# 배포 구조 (2026-10-27 개편)

| 저장소 경로 | NAS 경로 | 공개 URL | 용도 |
|---|---|---|---|
| `a/` | `/volume1/docker/mdmoon.com/a/` | https://a.mdmoon.com | 신규 시안 A |
| `b/` | `/volume1/docker/mdmoon.com/b/` | https://b.mdmoon.com | 신규 시안 B |
| `c/` | `/volume1/docker/mdmoon.com/c/` | https://c.mdmoon.com | 신규 시안 C |
| (최상위, `main` 브랜치의 root) | `/volume1/docker/mdmoon.com/main/` | https://mdmoon.com | 고객이 **선택한** 사이트. 이 워크플로가 자동 배포하지 않는다. |

## 규칙

1. **후보는 `a/`, `b/`, `c/` 폴더에서만 작업한다.** 각 폴더는 완전한 사이트 루트여야 한다
   (`index.html` + `assets/` …). 폴더에 `index.html` 이 없으면 그 슬롯은 배포되지 않고 NAS 도 비워진다.
2. **`main` 은 자동 배포 대상이 아니다.** push 해도 손대지 않는다. 워크플로가 배포 전후 main 의
   sha256 지문을 비교해 무변경을 증명한다.
3. **검색 노출 차단** — 후보 a/b/c 는 배포 직전에 `_scripts/stamp_previews.py` 가
   `<meta name="robots" content="noindex, nofollow">` 와 `robots.txt(Disallow: /)` 를 심는다.
   저장소 파일에는 넣지 않아도 된다.
4. **승격** — 고객이 후보를 고르면 Actions → 이 워크플로 → Run workflow → `promote` 에 `a|b|c` 선택.
   승격 직전 현재 main 을 `backup/pre-promote-<시각>/` 으로 자동 백업하고, 승격본에서 noindex 를 걷어낸다.

## 레거시

`site-a/`, `site-a-person/` 은 2026-10-27 이전 S4/S1 후보의 원본이다. 배포 대상이 아니며,
해당 배포본은 NAS `backup/20261027-112527/` 에 보관돼 있다.
