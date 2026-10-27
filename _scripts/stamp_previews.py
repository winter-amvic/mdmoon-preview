#!/usr/bin/env python3
"""후보 사이트(a/b/c)에 검색 노출 차단을 스탬프한다.

후보 슬롯은 고객 검토용이므로 색인되면 안 된다. 배포 직전에 작업 트리 사본에
robots.txt 와 <meta name="robots"> 를 심는다. 저장소를 오염시키지 않도록
'배포용 사본'에만 적용하고, 원본 파일은 커밋 대상으로 남긴다(러너는 매번 clean checkout).

사용법: python _scripts/stamp_previews.py <작업트리루트> [a b c ...]
"""
from __future__ import annotations

import sys
from pathlib import Path

META = '<meta name="robots" content="noindex, nofollow">'
ROBOTS = "User-agent: *\nDisallow: /\n"


def stamp(dirpath: Path) -> tuple[int, int]:
    """(html 수, meta 주입 수) 반환."""
    html_files = sorted(dirpath.rglob("*.html"))
    injected = 0
    for f in html_files:
        text = f.read_text(encoding="utf-8", errors="replace")
        low = text.lower()
        if "name=\"robots\"" in low or "name='robots'" in low:
            continue
        # <head> 바로 뒤에 삽입, 없으면 <html> 뒤, 그것도 없으면 맨 앞
        for anchor in ("<head>", "<head ", "<html>", "<html "):
            idx = low.find(anchor)
            if idx >= 0:
                end = text.find(">", idx) + 1
                # <head ...> 형태면 속성 끝까지
                if anchor.endswith(" ") or (anchor == "<head>" and end == 0):
                    end = text.find(">", idx) + 1
                text = text[:end] + META + text[end:]
                break
        else:
            text = META + text
        f.write_text(text, encoding="utf-8")
        injected += 1
    (dirpath / "robots.txt").write_text(ROBOTS, encoding="utf-8")
    return len(html_files), injected


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    root = Path(sys.argv[1])
    names = sys.argv[2:] or ["a", "b", "c"]
    for n in names:
        d = root / n
        if not d.is_dir():
            print(f"  {n}: 없음 (건너뜀)")
            continue
        total, injected = stamp(d)
        print(f"  {n}: html {total}개 중 {injected}개에 noindex 주입, robots.txt 작성")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
