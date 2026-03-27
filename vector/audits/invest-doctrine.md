## Doctrine Audit

**Files audited:** VECTOR.md, CLAUDE.md, ARCHITECTURE.md
**Project stage:** development
**Audit date:** 2026-03-26

### Findings

#### CONTRADICTION — high
- `CLAUDE.md:Naming Conventions` says "Files: kebab-case (grief-phase.js, foghorn-button.jsx)" for all files including `.jsx`. `ARCHITECTURE.md:Naming Conventions` says component files use PascalCase (e.g., `RitualCapture.jsx`). Codebase matches ARCHITECTURE.md — all 9 component files are PascalCase.

#### INCOMPLETE — high
- `VECTOR.md` — Missing "Key Assumptions" section entirely. A development-stage project should have at least 2 documented assumptions with validation status.
- `VECTOR.md` — Missing "Open Questions" section entirely. Foghorn's research methodology (autoethnographic, n=1) raises questions worth documenting.

#### STRUCTURE — medium
- `hardware/pi/logs/` exists on disk but is not declared in `ARCHITECTURE.md` project structure tree.

#### GAP — low
- `VECTOR.md:Research Status` — All 7 artifacts are "Not started" for a project in "development" stage with 12/14 features shipped. The research artifacts may not apply to this project's autoethnographic methodology, but the mismatch is worth acknowledging.
- `ARCHITECTURE.md:Testing` — No testing framework detected. Pure functions in `core/` are well-suited for unit tests. Not blocking, but noted.

#### PLACEHOLDER — info
- `vector/decisions/`, `vector/research/`, `vector/schemas/` — All empty (contain only `.gitkeep`). Expected for a freshly backfilled project.

### Summary
- Critical: 0 | High: 3 | Medium: 1 | Low: 2 | Info: 1
- Doctrine health: **GAPS FOUND**

### Recommended Actions
1. **Fix CLAUDE.md naming contradiction.** Change "Files: kebab-case (grief-phase.js, foghorn-button.jsx)" to match ARCHITECTURE.md: non-component files use kebab-case `.js`, component files use PascalCase `.jsx`. This is the only contradiction between doctrine files and it will confuse invest-architecture.
2. **Add Key Assumptions and Open Questions to VECTOR.md.** At minimum: assumptions about n=1 validity, weather-as-ritual-anchor effectiveness, non-verbal processing sufficiency. Questions about exit strategy design, long-term data patterns, generalizability beyond the researcher.
3. **Add `hardware/pi/logs/` to ARCHITECTURE.md structure tree** or add it to `.gitignore` if it's runtime output.
