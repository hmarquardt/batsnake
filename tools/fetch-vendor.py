#!/usr/bin/env python3
"""Restore missing pinned vendor files without overwriting local changes."""

from __future__ import annotations

import hashlib
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "vendor-lock.json"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    manifest = json.loads(LOCK.read_text(encoding="utf-8"))
    restored = 0
    for dependency, metadata in manifest["dependencies"].items():
        for entry in metadata["files"]:
            target = ROOT / entry["path"]
            expected = entry["sha256"]
            if target.exists():
                actual = hashlib.sha256(target.read_bytes()).hexdigest()
                if actual != expected:
                    print(f"refusing to overwrite modified file: {entry['path']}", file=sys.stderr)
                    return 1
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            print(f"fetching {dependency}: {entry['path']}")
            try:
                request = urllib.request.Request(entry["url"], headers={"User-Agent": "batsnake-vendor-fetch/1"})
                with urllib.request.urlopen(request, timeout=30) as response:
                    payload = response.read()
            except (OSError, urllib.error.URLError) as error:
                print(f"download failed for {entry['url']}: {error}", file=sys.stderr)
                return 2
            if digest(payload) != expected:
                print(f"checksum rejected for {entry['path']}; file was not written", file=sys.stderr)
                return 1
            target.write_bytes(payload)
            restored += 1
    print(f"vendor fetch complete: {restored} file(s) restored; existing verified files preserved")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
