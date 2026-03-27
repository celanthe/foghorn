# Foghorn

**A place-based grief processing app using daily weather rituals and sensory memory.**

Foghorn is software for ambiguous loss -- the kind of grief where the person is still alive but gone. No journaling prompts. No five stages. Just a daily ritual anchored in weather, location, and sound.

**Try it:** [foghorn-lime.vercel.app](https://foghorn-lime.vercel.app/)

---

## Why

Most grief software assumes you lost someone to death. Ambiguous loss is different. A parent who chose to leave. A relationship that ended without closure. A version of yourself that no longer exists. These are real losses with no funeral, no casserole, no framework for processing them.

Foghorn does not try to fix grief. It holds space for it through repeatable, bounded rituals that require no verbal processing and no self-assessment.

---

## How It Works

- **Daily weather check-in** -- Your local weather becomes the ritual anchor. Fog means something different than clear sky.
- **Foghorn trigger** -- Specific weather conditions trigger the foghorn sound, a sensory cue for processing. Real recording from Nobska Lighthouse, Falmouth, MA.
- **Historical weather matching** -- "Today's weather is similar to Falmouth, January 14, 1999." Temporal context without narrative.
- **Ritual capture** -- Record intensity (1-10) and loss type per ritual. No journaling. No prompts.
- **Grief phase awareness** -- Active, Processing, Integration, Memorial. Self-reported only. Never auto-detected. Never framed as progress.
- **Retroactive entry** -- Missed a day? Add past rituals with full context. No guilt.
- **Field notes** -- Longer research memos, separate from ritual data.
- **Quarterly check-in** -- Five-question validated instrument for tracking shifts over time. 90-day reminder, never forced.
- **Analytics** -- Total rituals, monthly frequency, average intensity, loss type breakdown, intensity trends. All computed locally.
- **Data export** -- Full JSON and CSV export for analysis. Your data, your formats.
- **Onboarding** -- Three-step setup: name, weather preferences, interaction mode.

---

## Status

**Core features are implemented and working.** Foghorn is in active use as a research artifact.

| Feature | Status |
|---------|--------|
| Daily weather check-in | Done |
| Foghorn audio (real recording) | Done |
| Historical weather matching (1985-2003) | Done |
| Ritual capture (intensity, loss type) | Done |
| Grief phase tracking (self-reported) | Done |
| Analytics and growth tracking | Done |
| Field notes | Done |
| Quarterly check-in instrument | Done |
| Retroactive ritual entry | Done |
| Onboarding flow | Done |
| Settings (triggers, location) | Done |
| Data export (JSON + CSV) | Done |
| Exit strategies (memorial/archive modes) | Planned |
| Push notifications | Planned |

---

## Design Principles

- No streaks. Showing up on day 1 after a 30-day gap is exactly as valid as day 31.
- No gamification. Grief is not a game.
- No social sharing. Grief is private.
- No forced engagement. Silence is a valid interaction.
- Exit as success. The goal is to move through grief, not stay in the app.

---

## Quick Start

### 1. Get an OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Generate an API key (free tier: 1000 calls/day)

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
```

### 3. Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Tech Stack

- React + Vite
- OpenWeatherMap API (current weather)
- Open-Meteo Archive API (historical weather, no key required)
- Web Audio API (foghorn playback)
- IndexedDB (local-first storage, no data leaves the device)

---

## Architecture

```
foghorn/
├── design-system/        # CSS tokens (coastal aesthetic)
├── content/              # All user-facing strings (en.json)
├── core/                 # Pure domain logic (no side effects)
│   ├── domain/           # Ritual model, historical matching
│   └── utils.js          # Weather triggers, formatting
├── src/
│   ├── components/       # React UI
│   └── services/         # Weather API, audio, storage
├── .env.example          # Environment template
└── index.html            # SPA entry point
```

Built with the [Investiture](https://github.com/erikaflowers/investiture) framework. Domain logic is pure and testable. All copy lives in `content/en.json`. All visual values come from design tokens.

---

## Research

Foghorn is part of [Human-Rhythm Design](https://github.com/celanthe/human-rhythm-design), a framework for building software around cognitive, temporal, and emotional patterns. It maps to the **Transitions** pillar -- how the brain processes grief, shutdown, and overwhelm.

The research question: can software hold space for ambiguous loss without trying to resolve it?

Grounded in Pauline Boss's ambiguous loss theory, the Dual Process Model (Stroebe & Schut), and Continuing Bonds Theory (Klass et al.).

The ritual-based transitions pattern extracted from Foghorn is documented in the [Cognitive Accessibility Pattern Library](https://github.com/celanthe/cognitive-accessibility-patterns/blob/main/patterns/ritual-based-transitions.md).

---

## License

MIT

---

**Lighthouses guide you home. Even when home is gone.**
