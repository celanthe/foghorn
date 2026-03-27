---
project:
  name: Foghorn
  description: "A place-based grief processing app using daily weather rituals and sensory memory for ambiguous loss."
  stage: development
  started: 2026-02-27
  repo: https://github.com/celanthe/foghorn
  live: https://foghorn-lime.vercel.app/
  license: MIT

owner:
  name: Kiran Oliver

knowledge:
  research: ./vector/research/
  interviews: ./vector/research/interviews/
  jtbd: ./vector/research/jtbd/
  personas: ./vector/research/personas/
  competitive: ./vector/research/competitive/
  assumptions: ./vector/research/assumptions/
  schemas: ./vector/schemas/
  decisions: ./vector/decisions/
---

# VECTOR.md -- Foghorn

> Read this file first. Then CLAUDE.md (onboarding briefing). Then ARCHITECTURE.md (technical spec).

---

## Core Relationship

You are a contractor hired to build and maintain this project. The operator (project owner) sets direction. You execute with professional judgment.

- **You do not set product direction.** You advise. The operator decides.
- **You do not introduce new dependencies without approval.** Propose, don't install.
- **You do not refactor without a ticket.** Fix what you're asked to fix.
- **You flag risks, you don't block on them.** Surface concerns, then follow instructions.
- **You match the project's voice.** Read the existing code and content. Write like it.

---

## Seven Principles

> These are Investiture defaults. They apply to every project in the framework. The operator may override specific principles in ARCHITECTURE.md.

1. **Doctrine before code.** Read VECTOR.md, CLAUDE.md, and ARCHITECTURE.md before touching anything. Every time.
2. **Reality over aspiration.** Document what IS, not what should be. Aspirations go in tickets.
3. **Layers are load-bearing.** Architecture layers exist for a reason. Do not bypass them. Do not collapse them.
4. **Content is not code.** User-facing strings, copy, and content live in content files, not in component markup.
5. **Tokens are the source of truth.** Design values (color, spacing, typography) come from the design system. No magic numbers.
6. **Declare, then enforce.** If a convention matters, write it in ARCHITECTURE.md. If it is not written, it is not enforceable.
7. **Ship small, verify often.** Small PRs. Frequent commits. Continuous verification against doctrine.

**Non-negotiable (1, 3, 4, 5):** These principles are structural. Violating them creates debt that compounds. The others are strong defaults that the operator can relax for specific contexts.

---

## Problem Statement

Foghorn addresses ambiguous loss -- grief where the person is still alive but gone. A parent who chose to leave. A relationship that ended without closure. A version of yourself that no longer exists. Most grief software assumes death. Ambiguous loss has no funeral, no casserole, no framework.

Foghorn does not try to fix grief. It holds space for it through repeatable, bounded daily rituals anchored in weather, location, and sound. The goal is to move THROUGH grief, not stay in the app.

---

## Target Audience

The primary user is the researcher/operator (n=1 autoethnographic study). Foghorn is designed for a single person processing ambiguous loss through self-study, grounded in Pauline Boss's ambiguous loss theory, the Dual Process Model, and Continuing Bonds Theory.

Secondary audience: anyone experiencing ambiguous loss who would benefit from a non-verbal, ritual-based processing tool. No therapist role. No community features.

---

## Core Value Proposition

A grief processing tool that requires no verbal processing, no self-assessment beyond a 1-10 intensity scale, and no narrative. Weather becomes the ritual anchor. A foghorn sound from Nobska Lighthouse becomes the sensory cue. Historical weather matching provides temporal context without story. The ritual is bounded, repeatable, and exits when you do.


---

## What This Is Not

- **Not a journaling app.** No prompts, minimal text input. The ritual requires no verbal processing.
- **Not a mood tracker.** Intensity is a research data point, not a gamification vector.
- **Not a social platform.** Grief is private. No sharing, no community, no public profiles.
- **Not a therapy replacement.** Foghorn holds space. It does not treat.
- **Not a weather app.** Weather is the ritual anchor, not the product.

---

## Design Principles

The README and CLAUDE.md state explicit grief-aware design principles:

1. **No streaks.** Showing up on day 1 after a 30-day gap is exactly as valid as day 31.
2. **No gamification.** Grief is not a game.
3. **No social sharing.** Grief is private.
4. **No forced engagement.** Silence is a valid interaction.
5. **Exit as success.** The goal is to move through grief, not stay in the app.


---

## Constraints

### Technical
- **Client-only SPA.** No backend server. Deployed as static assets on Vercel.
- **Local-first data.** All ritual data stored in IndexedDB. No data leaves the device.
- **API key required.** OpenWeatherMap API key needed for current weather (free tier: 1000 calls/day).
- **No API key for historical.** Open-Meteo archive API is free and keyless.
- **Browser APIs.** Web Audio API for foghorn playback. Geolocation API for weather location.
- **iOS audio unlock.** AudioContext requires user gesture; handled via lazy-load on first play.

### Privacy
- No analytics. No telemetry. No external data transmission.
- `.env` and `CLAUDE.private.md` are gitignored.

### License
- MIT

---

## Key Assumptions

1. **Weather can anchor a grief ritual.** Daily weather provides enough sensory variation to sustain a repeatable ritual without habituation. *Status: partially validated — 12+ features built on this premise, app in active use.*
2. **Non-verbal processing is sufficient.** A 1-10 intensity scale and loss type selection capture enough signal for research without requiring journaling or narrative. *Status: hypothesis — awaiting longitudinal data.*
3. **n=1 autoethnography produces transferable patterns.** Patterns extracted from self-study (e.g., ritual-based transitions) generalize to other users experiencing ambiguous loss. *Status: hypothesis — the pattern is documented in the Cognitive Accessibility Pattern Library but untested with external users.*
4. **Exit is the success metric.** Users who stop using Foghorn have succeeded, not churned. This inverts standard engagement metrics. *Status: design commitment — not yet testable.*

---

## Open Questions

- How long does a ritual need to be practiced before intensity patterns become meaningful research data?
- Does the foghorn sound remain effective as a sensory anchor over months, or does it habituate?
- Should memorial mode preserve ritual data indefinitely or offer a time-boxed archive?
- What validated instruments best measure ambiguous loss processing outside clinical settings?
- Is the Dual Process Model (oscillation between loss-oriented and restoration-oriented coping) observable in the ritual frequency data?

---

## Quality Gates

- All copy in `content/en.json` (no hardcoded strings in components)
- All visual values from `design-system/tokens.css` (no magic numbers)
- Pure logic in `core/` (no side effects)
- API calls in `src/services/` only (not in components)
- WCAG AA minimum, AAA preferred (current tokens are AAA-verified)

---

## Research Status

| Artifact | Location | Status |
|----------|----------|--------|
| Interviews | `./vector/research/interviews/` | Not started |
| JTBD Analysis | `./vector/research/jtbd/` | Not started |
| Personas | `./vector/research/personas/` | Not started |
| Competitive Analysis | `./vector/research/competitive/` | Not started |
| Assumptions | `./vector/research/assumptions/` | Not started |
| Schemas | `./vector/schemas/` | Not started |
| Decisions | `./vector/decisions/` | Not started |

---

## Framework Context

Foghorn is part of [Human-Rhythm Design](https://github.com/celanthe/human-rhythm-design), a framework for building software around cognitive, temporal, and emotional patterns. It maps to the **Transitions** pillar -- how the brain processes grief, shutdown, and overwhelm.

The ritual-based transitions pattern extracted from Foghorn is documented in the [Cognitive Accessibility Pattern Library](https://github.com/celanthe/cognitive-accessibility-patterns/blob/main/patterns/ritual-based-transitions.md).
