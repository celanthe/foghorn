# ARCHITECTURE.md -- Foghorn

**Last Updated:** 2026-03-26

This file is the technical specification. For project philosophy and doctrine, read VECTOR.md. For onboarding context, read CLAUDE.md. This file describes how the code is organized, what conventions are enforced, and what not to do.

---

## Layers

Foghorn follows the Investiture architecture pattern with five distinct layers. Each has a clear responsibility boundary.

| Layer | Location | Contents | Rule |
|-------|----------|----------|------|
| Design System | `design-system/` | CSS custom properties, global resets, textures, responsive breakpoints | Single source of truth for all visual values. No component may define its own colors, spacing, or typography outside these tokens. |
| Content | `content/` | `en.json` -- all user-facing strings | Every string the user sees comes from here. Components import and render; they do not contain copy. |
| Core Domain | `core/` | Pure business logic: `utils.js`, `domain/ritual.js`, `domain/historical-match.js` | No side effects. No API calls. No browser APIs. Testable in isolation. |
| Services | `src/services/` | External integrations: `weather.js`, `foghorn.js`, `historical.js`, `storage/` | All external communication (APIs, IndexedDB, Web Audio) lives here. Components call services; they do not call APIs directly. |
| UI | `src/components/` | React components + co-located CSS | Render content, call services, use design tokens. No business logic. No direct API calls. No hardcoded strings. |

**Additional layer (hardware):**

| Layer | Location | Contents | Rule |
|-------|----------|----------|------|
| Hardware | `hardware/` | Arduino sketches, Raspberry Pi bridge (Python) | Physical device companion. Separate runtime. Communicates via serial + Claude API. Not part of the web build. |

---

## Import Direction

```
design-system/tokens.css
       |
       v (imported by App.css, component CSS files)
content/en.json
       |
       v (imported by components, App.jsx)
core/
       |
       v (imported by services, App.jsx)
src/services/
       |
       v (imported by components, App.jsx)
src/components/
       |
       v (composed by App.jsx)
```

**Rules:**
- `core/` never imports from `src/services/` or `src/components/`
- `src/services/` may import from `core/` but never from `src/components/`
- `src/components/` may import from `content/`, `core/`, and `src/services/`
- `design-system/` is imported via CSS `@import`, not JS
- `hardware/` is an independent runtime; it does not import from or export to the web app

---

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + JSX | Component model for ritual UI. No TypeScript -- project prioritizes simplicity and rapid iteration. |
| Build | Vite 7 | Fast dev server, ESM-native, minimal config. |
| Styling | CSS custom properties (design tokens) + plain CSS | Full control over the weathered nautical aesthetic. WCAG AAA verified. No utility framework. |
| State | React useState/useEffect + localStorage | Simple enough for a single-page ritual app. No state library needed. |
| Storage | IndexedDB (via raw API) | Local-first, privacy-first. All ritual data stays on device. |
| Current Weather | OpenWeatherMap API (REST) | Free tier, 1000 calls/day. Requires API key in `.env`. |
| Historical Weather | Open-Meteo Archive API (REST) | Free, no API key. Searches Falmouth, MA 1985-2003. |
| Audio | Web Audio API | Foghorn playback with AudioContext. Lazy-loaded on user gesture for iOS compatibility. |
| Linting | ESLint 9 + react-hooks + react-refresh | Standard React linting. |
| Deployment | Vercel | Static SPA hosting. Auto-deploys from master. |
| Hardware | Arduino + Raspberry Pi + Claude API (Python) | Physical desk companion. Serial communication. Separate from web app. |

---

## Project Structure

```
foghorn/
|-- design-system/                  # [Design System]
|   '-- tokens.css                  #   CSS custom properties, resets, textures
|
|-- content/                        # [Content]
|   '-- en.json                     #   All user-facing strings
|
|-- core/                           # [Core Domain]
|   |-- utils.js                    #   Weather triggers, formatting, energy assessment
|   '-- domain/
|       |-- ritual.js               #   Ritual model: create, validate, format
|       '-- historical-match.js     #   Scoring algorithm, weather code decoder
|
|-- src/
|   |-- main.jsx                    #   React entry point
|   |-- App.jsx                     #   Main app component, state orchestration
|   |-- App.css                     #   Main app styles (imports tokens.css)
|   |-- index.css                   #   Minimal global styles
|   |
|   |-- components/                 # [UI]
|   |   |-- FieldNotes.jsx          #   Research memo interface
|   |   |-- FieldNotes.css
|   |   |-- HistoricalMatch.jsx     #   Historical weather echo display
|   |   |-- HistoricalMatch.css
|   |   |-- Onboarding.jsx          #   Three-step setup flow
|   |   |-- Onboarding.css
|   |   |-- QuarterlyCheckIn.jsx    #   Five-question validated instrument
|   |   |-- QuarterlyCheckIn.css
|   |   |-- RetroRitualCapture.jsx  #   Retrospective ritual entry
|   |   |-- RetroRitualCapture.css
|   |   |-- RitualAnalytics.jsx     #   Frequency, intensity, loss type stats
|   |   |-- RitualAnalytics.css
|   |   |-- RitualCapture.jsx       #   Intensity + loss type capture panel
|   |   |-- RitualCapture.css
|   |   |-- RitualHistory.jsx       #   Journal view with history + stats tabs
|   |   |-- RitualHistory.css
|   |   |-- Settings.jsx            #   Location, triggers, quarterly reflection
|   |   '-- Settings.css
|   |
|   |-- services/                   # [Services]
|   |   |-- weather.js              #   OpenWeatherMap API integration
|   |   |-- foghorn.js              #   Web Audio API playback
|   |   |-- historical.js           #   Open-Meteo archive API
|   |   '-- storage/
|   |       |-- ritual-storage.js   #   IndexedDB ritual CRUD + export
|   |       |-- historical-cache.js #   IndexedDB cache (30-day TTL)
|   |       '-- field-notes-storage.js  # Field notes persistence
|   |
|   '-- assets/                     #   Static assets (Vite-managed)
|
|-- hardware/                       # [Hardware] (separate runtime)
|   |-- WIRING.md                   #   Wiring diagram
|   |-- arduino/
|   |   '-- foghorn_full/foghorn_full.ino
|   |-- foghorn_v0/foghorn_v0.ino
|   '-- pi/
|       |-- bridge.py               #   Serial + Claude orchestrator
|       |-- claude_client.py        #   Claude API emotional interpreter
|       |-- led_model.py            #   LED state machine
|       |-- serial_handler.py       #   Arduino serial communication
|       |-- logs/                   #   Runtime logs (not committed)
|       |-- servo_model.py          #   Servo position model
|       |-- requirements.txt
|       '-- .env.example
|
|-- public/                         # Static assets (served as-is)
|   |-- audio/                      #   Foghorn recording (Nobska Lighthouse)
|   |-- images/                     #   Ocean background
|   '-- textures/                   #   Paper grain, wood grain, rope
|
|-- index.html                      #   SPA entry point
|-- vite.config.js                  #   Vite config (React plugin only)
|-- eslint.config.js                #   ESLint config
|-- package.json
|-- VECTOR.md                       #   Project doctrine
|-- CLAUDE.md                       #   Agent onboarding briefing
|-- ARCHITECTURE.md                 #   This file
'-- vector/                         #   Knowledge artifacts
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files (non-component) | kebab-case `.js` | `ritual-storage.js`, `historical-match.js` |
| Component files | PascalCase `.jsx` | `RitualCapture.jsx`, `HistoricalMatch.jsx` |
| Component CSS | PascalCase `.css` (co-located) | `RitualCapture.css`, `Settings.css` |
| React components | PascalCase | `RitualCapture`, `FieldNotes` |
| Functions | camelCase | `shouldPlayFoghorn`, `createRitual` |
| Constants | SCREAMING_SNAKE_CASE | `FOGHORN_TRIGGERS`, `VALID_LOSS_TYPES` |
| CSS classes | kebab-case with BEM-like nesting | `.phase-selector__label`, `.checkin-notice__begin` |
| CSS custom properties | `--category-name` | `--color-fog-grey`, `--space-md`, `--font-size-lg` |

---

## State Management

React `useState` and `useEffect` in `App.jsx`. No state library.

- **App.jsx** is the state orchestrator. It holds weather data, ritual state, UI panel visibility, settings, onboarding status, and grief phase.
- **localStorage** is used for lightweight persistence: grief phase, onboarding data, settings, quarterly check-in history.
- **IndexedDB** (via `src/services/storage/`) is used for ritual data and historical match cache. This is the durable research data store.
- **No shared context.** Components receive data and callbacks via props from App.jsx.

---

## Styling

**Approach:** CSS custom properties (design tokens) defined in `design-system/tokens.css`, imported by `App.css`. Each component has a co-located `.css` file.

**Token categories:**
- Colors: coastal aesthetic (driftwood grey, lighthouse stone, aged parchment, sea glass green, tide pool blue)
- Textures: paper grain, wood grain, rope (loaded as background images, controlled via opacity tokens)
- Spacing: grief-aware (more breathing room than typical apps: `--space-xs` through `--space-xl`)
- Typography: serif headers (Merriweather/Crimson Text), system sans body
- Borders: rope-style dashed borders with weathered-rope color
- Shadows: fog-like, soft and diffused
- Focus rings: visible, accessible
- Transitions: fast/base/slow with `prefers-reduced-motion` respect

**Accessibility:**
- WCAG AAA color contrast verified (7:1+ for text on parchment backgrounds)
- `prefers-reduced-motion: reduce` disables all animations and transforms
- `prefers-contrast: high` supported
- Minimum 44px touch targets (grief-aware: 60px on primary actions)
- Responsive at 600px breakpoint

---

## API / External Service Pattern

All external communication goes through `src/services/`. Components never call APIs directly.

| Service | File | External Dependency | Auth |
|---------|------|---------------------|------|
| Current weather | `src/services/weather.js` | OpenWeatherMap REST API | API key in `.env` (`VITE_OPENWEATHER_API_KEY`) |
| Historical weather | `src/services/historical.js` | Open-Meteo Archive REST API | None (free, keyless) |
| Foghorn audio | `src/services/foghorn.js` | Web Audio API (browser) | None |
| Ritual storage | `src/services/storage/ritual-storage.js` | IndexedDB (browser) | None |
| Historical cache | `src/services/storage/historical-cache.js` | IndexedDB (browser) | None |
| Field notes | `src/services/storage/field-notes-storage.js` | IndexedDB (browser) | None |
| Hardware bridge | `hardware/pi/claude_client.py` | Anthropic Claude API | API key in `hardware/pi/.env` |

---

## Testing

Testing: None detected.

[OPERATOR: If your project has a testing strategy, declare it here (framework, file patterns, coverage expectations) and invest-architecture will audit against it. The pure functions in core/ are well-suited for unit testing. If testing is outside your doctrine scope, omit this section.]

---

## Development Principles

These are inferred from observed patterns across the codebase. They describe the architectural beliefs that guide decision-making.

1. **Content is data, not markup.** All user-facing strings live in `content/en.json`. Components import and render content; they never contain copy. This enables future localization and keeps the UI layer free of prose.

2. **Domain logic is pure.** The `core/` layer contains no side effects, no API calls, no browser APIs. Functions like `createRitual`, `scoreMatch`, and `shouldPlayFoghorn` are deterministic and testable in isolation. Services wrap the impure world.

3. **Privacy is structural, not policy.** Local-first is enforced by architecture (IndexedDB, no backend), not by a privacy policy document. There is no server to send data to. This is a design choice, not a limitation.

4. **Grief-aware design is not optional decoration.** Spacing tokens are deliberately larger than typical apps. Touch targets exceed WCAG minimums. Animations respect `prefers-reduced-motion`. No streaks, no gamification, no forced engagement. These are architectural commitments, not style preferences.

5. **The ritual is the unit of work.** Everything in the app orbits the daily ritual: weather provides context, the foghorn provides a sensory anchor, historical matching provides temporal resonance, and capture records the data point. Features that do not serve the ritual do not belong.

---

## How to Add a Feature

1. **Read doctrine first.** VECTOR.md, CLAUDE.md, this file.
2. **Define domain model** in `core/domain/` if the feature has business logic. Keep it pure.
3. **Add content strings** to `content/en.json`. No hardcoded copy.
4. **Create service** in `src/services/` if the feature requires external communication (API, storage, browser API).
5. **Build component** in `src/components/` with a co-located `.css` file. Import content, call services, use design tokens.
6. **Use design tokens** from `design-system/tokens.css`. No inline styles. No magic numbers.
7. **Wire into App.jsx.** State lives in App. Pass data and callbacks as props.

---

## What Not to Do

1. **No hardcoded strings in components.** All user-facing text comes from `content/en.json`.
2. **No hardcoded colors, spacing, or typography outside `design-system/tokens.css`.** Use CSS custom properties.
3. **No API calls in components.** All external communication goes through `src/services/`.
4. **No side effects in `core/`.** Pure functions only. No fetch, no IndexedDB, no localStorage.
5. **No files over 200 lines -- split them.** App.jsx is the known exception (state orchestrator); new components should not grow to this size.
6. **No inline styles.** Use design tokens and co-located CSS.
7. **No gamification patterns.** No streaks, no badges, no achievements, no leaderboards. This is a grief processing tool.
8. **No social features.** No sharing, no community, no public profiles.
9. **No API keys in client-side code.** Keys go in `.env` and are accessed via `import.meta.env`.

---

## Flexible Preferences

These are defaults, not rules. Override them when context requires it.

- **Prefer small components.** One responsibility per file.
- **Prefer explicit over clever.** Readability matters more than brevity.
- **Prefer progressive disclosure.** Show the minimum UI. Reveal complexity on interaction.
- **Prefer silence over notification.** When in doubt, do not alert the user.

---

## Decisions

Architecture Decision Records live in `/vector/decisions/`. Reference them by filename when a convention needs justification beyond what this file provides.
