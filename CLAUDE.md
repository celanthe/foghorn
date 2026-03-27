# Foghorn - Agent Briefing

**Project:** Grief processing app using daily weather rituals and sensory memory
**Research Question:** How do you mourn people who are still alive WITHOUT getting stuck in grief?

> Personal research context is in `CLAUDE.private.md` (gitignored, never commit).

---

## What This Is

Foghorn is NOT a weather app. It's a tool for processing ambiguous loss (mourning people alive but absent) through:
- Daily weather rituals (morning check-in)
- Sensory triggers (foghorn sound = memory = processing)
- Grief phase progression (Active → Processing → Integration → Memorial)
- Growth tracking (moving THROUGH grief, not staying stuck)

**The commitment:** Process grief, not preserve it forever.

---

## Architecture (Investiture Framework)

### Folder Structure

```
design-system/      CSS tokens, visual foundation
  tokens.css        Coastal aesthetic (fog grey, ocean blue, lighthouse beacon)

content/            User-facing strings (no hardcoded copy)
  en.json           Weather, foghorn, memory, grief phase copy

core/               Pure business logic (no side effects)
  utils.js          Weather triggers, formatting, wind direction
  domain/
    ritual.js       Ritual model (intensity, lossType, weather context)
    historical-match.js  Scoring algorithm for historical weather matching

services/           External integrations
  weather.js        OpenWeatherMap API
  foghorn.js        Web Audio API playback
  historical.js     Open-Meteo archive API (Falmouth historical weather)
  storage/
    ritual-storage.js     IndexedDB ritual persistence
    historical-cache.js   IndexedDB cache for historical matches

src/                React components
  components/
    HistoricalMatch.jsx   Historical weather echo display
    RitualCapture.jsx     Intensity + loss type capture panel
  App.jsx           Main app
```

### Architecture Rules

**DO:**
- Pure logic goes in `core/` (testable, no side effects)
- External APIs go in `services/` (weather, audio, storage)
- All copy goes in `content/en.json` (no hardcoded strings)
- Design tokens in `design-system/tokens.css` (no inline styles)
- Components are small, single-purpose, well-named

**DON'T:**
- Mix UI and business logic
- Hardcode strings in components
- Put API calls in components (use services/)
- Inline styles (use design tokens)
- Create new architecture layers without reason

### Naming Conventions

**Non-component files:** kebab-case `.js` (ritual-storage.js, historical-match.js)
**Component files:** PascalCase `.jsx` (RitualCapture.jsx, HistoricalMatch.jsx)
**Components:** PascalCase (WeatherDisplay, FoghornButton)
**Functions:** camelCase (shouldPlayFoghorn, recordRitual)
**Constants:** SCREAMING_SNAKE_CASE (FOGHORN_TRIGGERS)

---

## Design System

### Colors (Coastal Aesthetic)
- `--color-fog-grey` - Background, evokes coastal fog
- `--color-deep-ocean` - Primary actions, headers
- `--color-lighthouse-beacon` - Accent, foghorn trigger indicator
- `--color-soft-white` - Surface, cards

### Typography
- Headers: `--font-family-serif` (Georgia - timeless)
- Body: `--font-family-sans` (System font - clean, readable)

### Spacing
Use tokens: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`

---

## Content Strings (content/en.json)

All user-facing text lives in `content/en.json`. Import and use:

```javascript
import content from '../content/en.json';
<h1>{content.app.title}</h1>
```

**Never hardcode strings.**

---

## Core Utilities (core/utils.js)

Pure functions with no side effects:

```javascript
import { shouldPlayFoghorn, getWeatherEmoji, formatTemp } from '../core/utils';
shouldPlayFoghorn('Fog')  // true
getWeatherEmoji('Snow')   // '🌨️'
formatTemp(35)            // '35°F'
```

---

## Services

### Weather (services/weather.js)
OpenWeatherMap API. Returns `{ location, condition, temp, wind, shouldPlayFoghorn, ... }`

### Foghorn (services/foghorn.js)
Web Audio API. Lazy-loads audio on first play (requires user gesture).
Recording: Nobska Lighthouse, Falmouth, MA. Courtesy of Friends of Nobska Lighthouse.

### Historical (services/historical.js)
Open-Meteo archive API. Finds historical days matching current weather.
No API key required. Searches 1985–2003. Caches results in IndexedDB.

### Storage (services/storage/)
IndexedDB. Local-first, privacy-first. No external transmission.
- `ritual-storage.js` — ritual CRUD + export
- `historical-cache.js` — historical match cache (30-day TTL)

---

## Ritual Tracking

Each ritual records:
```javascript
{
  timestamp: Date,
  weather: { condition, temp, location, wind },
  foghornPlayed: boolean,
  intensity: 1-10,        // self-reported grief intensity
  lossType: string|null   // 'person'|'relationship'|'self'|'place'|'multiple'
}
```

---

## Grief-Aware Design Principles

### What NOT to Do
- ❌ Streaks (guilt for missing days)
- ❌ Gamification (trivializes grief)
- ❌ Social sharing (grief is private)
- ❌ Aggressive notifications
- ❌ Forced engagement

### What TO Do
- ✅ Gentle reminders
- ✅ Progress without pressure
- ✅ Choice over automation
- ✅ Respect silence
- ✅ Exit as success

---

## Grief Phase Model

Active Grief → Processing → Integration → Memorial → Exit

**Important:** Phases are not linear stages. Grief oscillates (Dual Process Model).
Phases are self-reported only — never auto-detected. Never communicated as progress or achievement.

### Exit Strategies
- **Memorial Mode:** Anniversaries only
- **Archive Mode:** Saved but silent
- **Legacy Mode:** Time capsule
- **Delete:** Full wipe with JSON export

---

## Research Methodology

Self-study / autoethnography. n=1. Limitations acknowledged.

**Grounding:** Pauline Boss's ambiguous loss theory, Dual Process Model (Stroebe & Schut),
Continuing Bonds Theory (Klass et al.), ritual theory (van Gennep).

**Minimum viable measurements for publishable findings:**
- Per-ritual: timestamp, weather, intensity (1–10), loss type, duration
- Monthly: frequency trend, intensity trend, loss type distribution
- Quarterly: validated instrument (Grief Intensity Scale or Boss's Ambiguous Loss Scale)

---

## Technical Constraints

### API Keys & Environment
```
VITE_OPENWEATHER_API_KEY=...
VITE_DEFAULT_LAT=...
VITE_DEFAULT_LON=...
```

### Browser Support
- Modern browsers (Chrome, Safari, Firefox)
- iOS Safari (audio unlock handled via lazy-load on user gesture)
- Web Audio API for foghorn playback
- IndexedDB for storage

---

## Common Tasks

### Adding a New Feature
1. Define domain model in `core/domain/`
2. Add copy to `content/en.json`
3. Create service (if external integration) in `services/`
4. Build component in `src/components/`
5. Use design tokens from `design-system/tokens.css`

### Debugging Weather API
Check `.env` has `VITE_OPENWEATHER_API_KEY`. Verify key is active (can take 2 hours after creation).

### Debugging Historical Match
Open-Meteo requires no key. Check browser network tab for `archive-api.open-meteo.com` requests.
First load makes ~19 parallel requests (one per year 1985–2003). Results cache for 30 days.

---

## Git Workflow

### Commit Message Format
```
Brief description of change

- Specific change 1
- Specific change 2
```

### What NOT to Commit
- `.env`
- `CLAUDE.private.md`
- `node_modules/`
- `dist/`

---

## Questions to Ask Before Building

1. **Does this serve grief processing?** (Not just cool tech)
2. **Does this respect user privacy?** (Local-first by default)
3. **Does this help move THROUGH grief?** (Not stay stuck)
4. **Can this be simpler?** (Minimal is better)
5. **Does this advance the research?** (Collecting useful data?)

---

## The Lighthouse Metaphor

**Lighthouses guide you home. Even when home is gone.**

Build accordingly.
