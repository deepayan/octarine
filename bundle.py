#!/usr/bin/env python3
"""
Bundle Octarine modular files into:
  - docs/octarine/octarine.bundle.js (Full presentation layer)
  - docs/octarine/camera.bundle.js   (Standalone camera overlay for bookmarklet & embed)
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OCTARINE_DIR = ROOT / 'docs' / 'octarine'

# Full suite bundle
OCTARINE_MODULES = [
    OCTARINE_DIR / 'vendor' / 'perfect-freehand.js',
    OCTARINE_DIR / 'core.js',
    OCTARINE_DIR / 'octarine.js',
    OCTARINE_DIR / 'camera.js',
    OCTARINE_DIR / 'voice.js',
    OCTARINE_DIR / 'draw.js',
    OCTARINE_DIR / 'board.js',
    OCTARINE_DIR / 'annotate.js',
    OCTARINE_DIR / 'panel.js',
]

OCTARINE_OUTPUT = OCTARINE_DIR / 'octarine.bundle.js'

# Standalone camera overlay bundle
CAMERA_MODULES = [
    OCTARINE_DIR / 'core.js',
    OCTARINE_DIR / 'camera.js',
]

CAMERA_BOOTSTRAP = """
/* Auto-enable standalone camera overlay on injection/load */
(function () {
  'use strict';
  if (typeof window !== 'undefined' && window.OctarineCamera) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.OctarineCamera.enable(), { once: true });
    } else {
      window.OctarineCamera.enable();
    }
  }
})();
"""

CAMERA_OUTPUT = OCTARINE_DIR / 'camera.bundle.js'


def bundle(file_list, output_file, extra_suffix=''):
    parts = []
    for fpath in file_list:
        if not fpath.exists():
            raise FileNotFoundError(f"Missing expected module file: {fpath}")
        content = fpath.read_text(encoding='utf-8')
        parts.append(content.rstrip('\n'))

    if extra_suffix:
        parts.append(extra_suffix.strip('\n'))

    bundled_content = '\n\n'.join(parts) + '\n'
    output_file.write_text(bundled_content, encoding='utf-8')
    print(f"Bundled {len(file_list)} files into {output_file} ({len(bundled_content)} bytes)")


def main():
    bundle(OCTARINE_MODULES, OCTARINE_OUTPUT)
    bundle(CAMERA_MODULES, CAMERA_OUTPUT, CAMERA_BOOTSTRAP)


if __name__ == '__main__':
    main()
