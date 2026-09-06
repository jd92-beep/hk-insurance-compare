"""Retired: the legacy implementation inferred evidence and rewrote source data."""
import sys


def main() -> int:
    print(
        "This legacy command is disabled: it could invent quotations, default pages, or current-version labels. "
        "Use scripts/audit_evidence.py for a read-only audit (PR #8), or scripts/curate_citations.py "
        "with an explicitly reviewed manifest and exact dataset/PDF fingerprints. No files were changed.",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
