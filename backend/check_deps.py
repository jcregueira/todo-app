#!/bin/env python3
"""Check backend dependencies."""
import importlib

packages = [
    "fastapi", "uvicorn", "sqlalchemy", "pydantic",
    "jose", "passlib", "httpx", "pytest"
]

ok = []
missing = []
for pkg in packages:
    try:
        m = importlib.import_module(pkg)
        ver = getattr(m, "__version__", "?")
        ok.append(f"  ✓ {pkg} {ver}")
    except ImportError:
        missing.append(f"  ✗ {pkg}")

for line in ok:
    print(line)
for line in missing:
    print(line)

if missing:
    print(f"\nMissing: {len(missing)} packages")
    print("Run: cd backend && uv pip install -r requirements.txt")
else:
    print("\nAll dependencies installed!")
