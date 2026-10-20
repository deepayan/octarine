#!/usr/bin/env python3
"""
Bundle Octarine modular files into docs/octarine/octarine.bundle.js
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OCTARINE_DIR = ROOT / 'docs' / 'octarine'

MODULE_FILES = [
    OCTARINE_DIR / 'vendor' / 'perfect-freehand.js',
    OCTARINE_DIR / 'octarine.js',
    OCTARINE_DIR / 'camera.js',
    OCTARINE_DIR / 'voice.js',
    OCTARINE_DIR / 'draw.js',
    OCTARINE_DIR / 'board.js',
    OCTARINE_DIR / 'annotate.js',
    OCTARINE_DIR / 'panel.js',
]

OUTPUT_FILE = OCTARINE_DIR / 'octarine.bundle.js'


def main():
    parts = []
    for fpath in MODULE_FILES:
        if not fpath.exists():
            raise FileNotFoundError(f"Missing expected module file: {fpath}")
        content = fpath.read_text(encoding='utf-8')
        parts.append(content.rstrip('\n'))

    bundled_content = '\n\n'.join(parts) + '\n'
    OUTPUT_FILE.write_text(bundled_content, encoding='utf-8')
    print(f"Bundled {len(MODULE_FILES)} modules into {OUTPUT_FILE} ({len(bundled_content)} bytes)")


if __name__ == '__main__':
    main()
