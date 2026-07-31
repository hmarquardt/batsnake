#!/usr/bin/env python3
"""Verify every file pinned by vendor-lock.json using only stdlib."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "vendor-lock.json"


def digest(path: Path) -> str:
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def main() -> int:
    try:
        manifest = json.loads(LOCK.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"vendor verification: cannot read {LOCK.name}: {error}", file=sys.stderr)
        return 2

    checked = 0
    errors: list[str] = []
    for dependency, metadata in manifest.get("dependencies", {}).items():
        for entry in metadata.get("files", []):
            relative = Path(entry["path"])
            target = ROOT / relative
            checked += 1
            if not target.is_file():
                errors.append(f"MISSING  {relative} ({dependency})")
                continue
            actual = digest(target)
            if actual != entry["sha256"]:
                errors.append(f"MISMATCH {relative}\n  expected {entry['sha256']}\n  actual   {actual}")

    if errors:
        print("vendor verification failed:", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"vendor verification passed: {checked} files across {len(manifest['dependencies'])} pinned dependencies")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
