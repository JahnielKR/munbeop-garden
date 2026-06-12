#!/usr/bin/env python3
"""WCAG 2.1 contrast audit for the munbeop-garden theme tokens.

Token sources (keep in sync by hand):
  munbeop/app/assets/styles/tokens/colors-light.css
  munbeop/app/assets/styles/tokens/colors-dark.css

Text pairs are checked against 4.5:1 (WCAG AA, normal text); border /
non-text pairs against 3:1 (WCAG 1.4.11). Pairs flagged ``expected_fail``
are intentional — legibility is carried by a pixel outline, not the fill
(e.g. the 문법 brand mark) — they print as EXPECTED and do not fail the run.

Usage:  python tools/contrast_audit.py        exits 1 on any unexpected FAIL
"""

from __future__ import annotations

import sys

LIGHT = {
    'always-dark': '#1a1a1a',
    'always-cream': '#f8efd0',
    'paper': '#f4ecd8',
    'paper-warm': '#ded0b6',
    'paper-deep': '#faf6ee',
    'ink': '#2d1e18',
    'ink-soft': '#705335',
    'ink-line': '#8c6a4a',
    'jade': '#5e8f4a',
    'sky': '#b05c1e',
    'sky-deep': '#8e4a17',
    'gold': '#e6a121',
    'red': '#c23e3e',
}

DARK = {
    'always-dark': '#1a1a1a',
    'always-cream': '#f8efd0',
    'paper': '#0c1220',
    'paper-warm': '#102623',
    'paper-deep': '#1a2440',
    'ink': '#e2e8f0',
    'ink-soft': '#7d9a93',
    'ink-line': '#52749f',
    'jade': '#3ad29f',
    'sky': '#6ea8d8',
    'sky-deep': '#4f87b5',
    'gold': '#e8923c',
    'red': '#ff4757',
}


def _channel(value: int) -> float:
    c = value / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _channel(r) + 0.7152 * _channel(g) + 0.0722 * _channel(b)


def ratio(fg: str, bg: str) -> float:
    lighter, darker = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


# (label, fg token, bg token, threshold[, 'expected_fail'])
light_pairs = [
    ('body: ink on paper', 'ink', 'paper', 4.5),
    ('body: ink on paper-warm', 'ink', 'paper-warm', 4.5),
    ('secondary: ink-soft on paper', 'ink-soft', 'paper', 4.5),
    ('secondary: ink-soft on paper-warm', 'ink-soft', 'paper-warm', 4.5),
    ('sidebar nav active: ink on paper-warm', 'ink', 'paper-warm', 4.5),
    ('sidebar tab window: ink on paper', 'ink', 'paper', 4.5),
    ('sidebar brand gold on paper-warm (has outline)', 'gold', 'paper-warm', 4.5,
     'expected_fail'),
    ('modal CTA: always-dark on jade (PracticeCta)', 'always-dark', 'jade', 4.5),
    ('escape btn: always-dark on gold (GameOver/Victory)', 'always-dark', 'gold', 4.5),
    ('text-on-accent: always-dark on gold', 'always-dark', 'gold', 4.5),
    ('text-on-danger: always-cream on red', 'always-cream', 'red', 4.5),
    ('link: sky-deep on paper', 'sky-deep', 'paper', 4.5),
    ('border: ink-line vs paper', 'ink-line', 'paper', 3.0),
    ('border: ink-line vs paper-warm', 'ink-line', 'paper-warm', 3.0),
    ('border: ink-line vs paper-deep', 'ink-line', 'paper-deep', 3.0),
]

dark_pairs = [
    ('body: ink on paper', 'ink', 'paper', 4.5),
    ('body: ink on paper-warm', 'ink', 'paper-warm', 4.5),
    ('secondary: ink-soft on paper', 'ink-soft', 'paper', 4.5),
    ('sidebar nav active: ink on paper-warm', 'ink', 'paper-warm', 4.5),
    ('sidebar tab window: ink on paper', 'ink', 'paper', 4.5),
    ('modal CTA fix: always-dark on jade', 'always-dark', 'jade', 4.5),
    ('escape btn: always-dark on gold (GameOver/Victory)', 'always-dark', 'gold', 4.5),
    ('text-on-danger: always-dark on red', 'always-dark', 'red', 4.5),
    ('link: jade on paper', 'jade', 'paper', 4.5),
    ('border: ink-line vs paper', 'ink-line', 'paper', 3.0),
    ('border: ink-line vs paper-warm', 'ink-line', 'paper-warm', 3.0),
    ('border: ink-line vs paper-deep', 'ink-line', 'paper-deep', 3.0),
]


def audit(theme: str, tokens: dict, pairs: list) -> int:
    print(f'\n== {theme} ==')
    failures = 0
    for pair in pairs:
        label, fg, bg, threshold = pair[:4]
        expected_fail = len(pair) > 4 and pair[4] == 'expected_fail'
        r = ratio(tokens[fg], tokens[bg])
        ok = r >= threshold
        if ok:
            verdict = 'PASS'
        elif expected_fail:
            verdict = 'EXPECTED'
        else:
            verdict = 'FAIL'
            failures += 1
        print(f'  [{verdict:8}] {r:5.2f}:1  (need {threshold}:1)  {label}')
    return failures


def main() -> int:
    failures = audit('LIGHT', LIGHT, light_pairs)
    failures += audit('DARK', DARK, dark_pairs)
    print()
    if failures:
        print(f'{failures} unexpected failure(s).')
        return 1
    print('All pairs pass (expected-fail exceptions aside).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
