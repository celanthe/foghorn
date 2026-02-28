# Foghorn - Agent Briefing

**Project:** Grief processing app using daily weather rituals and sensory memory
**Framework:** Investiture (MIT licensed by Erika Flowers)
**Research Question:** How do you mourn people who are still alive WITHOUT getting stuck in grief?

---

## What This Is

Foghorn is NOT a weather app. It's a tool for processing ambiguous loss (mourning people alive but absent) through:
- Daily weather rituals (morning check-in)
- Sensory triggers (foghorn sound = memory = processing)
- Grief phase progression (Active → Processing → Integration → Memorial)
- Growth tracking (moving THROUGH grief, not staying stuck)

**The commitment:** Process grief, not preserve it forever.

---

## Core Concepts

### The Memory (1999, Age 14, Falmouth, MA)
- Apple green room, red plaid flannel comforter
- 6:45 AM, foghorn sound, snow hissing on wood shingles
- Knowing the weather before you see it
- Warmth, safety, "it was just yesterday"

### The Losses (Who We're Mourning - Alive But Gone)
- Dad (choosing absence, won't answer phone)
- Brother (six months of silence, political divide)
- The 14-year-old self (the good kid, the useful one)
- The real foghorn (now a recording)
- The place (Falmouth → Louisiana → Berkshires)

### The Grief (Ambiguous Loss)
Not death grief. Grief for:
- People still alive but choosing not to be present
- Relationships lost to transition, politics, time
- Places you can't return to
- The child-self who didn't know how much would be lost

### The Research
**Hypothesis:** Daily sensory rituals help process ambiguous loss
**Data:** Track usage patterns, grief intensity, memory creation over time
**Goal:** Publish findings iteratively (monthly updates, not wait 7 months)

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
  domain/           (Coming) Grief phase, memory, ritual models

services/           External integrations
  weather.js        OpenWeatherMap API
  foghorn.js        Web Audio API playback
  storage/          (Coming) IndexedDB for memories, rituals

src/                React components
  components/       (Coming) Extracted from App.jsx
  App.jsx           Main app (currently monolithic, needs refactor)
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

**Files:** kebab-case (grief-phase.js, foghorn-button.jsx)
**Components:** PascalCase (WeatherDisplay, FoghornButton)
**Functions:** camelCase (shouldPlayFoghorn, recordRitual)
**Constants:** SCREAMING_SNAKE_CASE (FOGHORN_TRIGGERS)

---

## Design System

### Colors (Coastal Aesthetic)

**Primary Palette:**
- `--color-fog-grey` - Background, evokes coastal fog
- `--color-deep-ocean` - Primary actions, headers
- `--color-lighthouse-beacon` - Accent, foghorn trigger indicator
- `--color-soft-white` - Surface, cards

**Semantic Colors:**
- `--color-background` - Fog grey
- `--color-surface` - Soft white
- `--color-primary` - Deep ocean
- `--color-accent` - Lighthouse beacon
- `--color-text-primary` - Charcoal
- `--color-text-secondary` - #666
- `--color-success` - Sea green
- `--color-error` - Muted red

### Typography

**Fonts:**
- Headers: `--font-family-serif` (Georgia - timeless, "it was just yesterday")
- Body: `--font-family-sans` (System font - clean, readable)

**Sizes:**
- Use tokens: `--font-size-sm`, `--font-size-base`, `--font-size-lg`
- Never hardcode font sizes

### Spacing

Use tokens: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`

---

## Content Strings (content/en.json)

All user-facing text lives in `content/en.json`. Import and use:

```javascript
import content from '../content/en.json';

// In component:
<h1>{content.app.title}</h1>
<p>{content.weather.loading}</p>
```

**Never hardcode strings.** This enables:
- Consistent copy across app
- Easy translation to other languages
- Content updates without code changes

---

## Core Utilities (core/utils.js)

Pure functions with no side effects. Examples:

```javascript
import { shouldPlayFoghorn, getWeatherEmoji, formatTemp } from '../core/utils';

shouldPlayFoghorn('Fog')  // true
getWeatherEmoji('Snow')   // '🌨️'
formatTemp(35)            // '35°F'
```

**Rule:** If it transforms data but doesn't call APIs or modify state, it goes in `core/utils.js`.

---

## Services (services/)

External integrations with side effects.

### Weather Service (services/weather.js)

```javascript
import { getCurrentWeather, getUserLocation } from '../services/weather';

const location = await getUserLocation();
const weather = await getCurrentWeather(location.lat, location.lon);
// Returns: { location, condition, temp, wind, shouldPlayFoghorn, ... }
```

### Foghorn Service (services/foghorn.js)

```javascript
import { playFoghorn, loadFoghorn } from '../services/foghorn';

await loadFoghorn('/path/to/foghorn.mp3');  // Once on mount
await playFoghorn();  // Play sound
```

---

## Grief Processing Features (Coming)

### Phases
- **Active Grief:** Daily rituals, high intensity, automatic triggers
- **Processing:** Reflective rituals, medium intensity, optional triggers  
- **Integration:** Occasional rituals, low intensity, memorial mode
- **Memorial:** Archive state, exit strategy

### Ritual Tracking
Record each foghorn ritual:
```javascript
{
  timestamp: Date,
  weather: { condition, temp, location },
  foghornPlayed: boolean,
  duration: number,  // time spent in ritual
  intensity: 1-10    // self-reported grief intensity
}
```

### Memory Layer
Capture memories triggered by weather:
```javascript
{
  type: 'voice' | 'text' | 'photo',
  timestamp: Date,
  weatherContext: { },
  content: { },
  griefContext: {
    phase: 'active' | 'processing' | 'integration',
    intensity: 1-10,
    tags: ['dad', 'brother', 'grandmother']
  }
}
```

### Growth Tracking
Detect patterns over time:
- Ritual frequency (daily → weekly → monthly)
- Grief intensity (high → manageable)
- Red flags (regression)
- Green flags (healing)

### Exit Strategies
When ready to graduate:
- **Memorial Mode:** Anniversaries only
- **Archive Mode:** Saved but silent
- **Legacy Mode:** Time capsule for daughter
- **Delete:** Full wipe with export

---

## Component Patterns (Coming)

### Component Structure

```javascript
import { useState } from 'react';
import content from '../../content/en.json';
import './ComponentName.css';

export default function ComponentName({ prop1, prop2, onAction }) {
  const [state, setState] = useState(null);

  function handleAction() {
    // Logic here
    onAction(data);
  }

  return (
    <div className="component-name">
      <h2>{content.section.title}</h2>
      {/* ... */}
    </div>
  );
}
```

### CSS Modules Pattern

Use design tokens, not magic numbers:

```css
.component-name {
  background: var(--color-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
}
```

---

## Data Storage (Coming - IndexedDB)

Local-first, privacy-first architecture.

### Object Stores
- `memories` - Voice notes, text, photos
- `rituals` - Daily ritual tracking
- `settings` - User preferences
- `historical` - Falmouth weather cache (1985-2003)

### Privacy Rules
- All data local by default
- Cloud sync is opt-in
- Export to JSON for portability
- Clear deletion on exit

---

## Research & Publishing

### Iterative Publishing Timeline
- **Month 1:** Build + use, publish "I'm building Foghorn"
- **Month 2:** Publish "Week 4 findings: Does it help?"
- **Month 3:** Publish "Can weather apps process grief?"
- **Month 6:** Full case study

### What to Track
- Ritual frequency over time
- Grief intensity trends
- Memory creation patterns
- Weather correlations (fog = dad memories, snow = family)
- Phase transitions
- Exit timing

### What to Publish
- Build logs (weekly)
- Research updates (monthly)
- Early findings (honest, even if negative)
- Full case study (6 months)

---

## Technical Constraints

### API Keys & Environment
- OpenWeatherMap API key in `.env` (VITE_OPENWEATHER_API_KEY)
- Default location: Berkshires, MA (42.4509, -73.2481)
- Falmouth, MA for historical: (41.5515, -70.6148)

### Browser Support
- Modern browsers (Chrome, Safari, Firefox)
- iOS Safari (audio unlock required)
- Web Audio API for foghorn playback
- IndexedDB for storage

### Performance
- Keep bundles small (coastal aesthetic is minimal)
- Lazy load heavy features (voice recording, photo upload)
- Cache weather data (offline support)
- Respect reduced motion preferences

---

## Grief-Aware Design Principles

### What NOT to Do
- ❌ Streaks (guilt for missing days)
- ❌ Gamification (trivializes grief)
- ❌ Social sharing (grief is private)
- ❌ Aggressive notifications ("You haven't checked in!")
- ❌ Forced engagement (let users skip rituals)

### What TO Do
- ✅ Gentle reminders ("Weather is foggy today")
- ✅ Progress without pressure ("5 memories this month")
- ✅ Choice over automation ("Play when ready")
- ✅ Respect silence ("It's okay to skip")
- ✅ Exit as success ("You've processed enough")

---

## Common Tasks

### Adding a New Feature

1. **Define domain model** (if needed) in `core/domain/`
2. **Add copy** to `content/en.json`
3. **Create service** (if external integration) in `services/`
4. **Build component** in `src/components/`
5. **Use design tokens** from `design-system/tokens.css`
6. **Test with user** (dogfood immediately)

### Adding a New String

1. Open `content/en.json`
2. Add to appropriate section
3. Import in component: `import content from '../content/en.json'`
4. Use: `{content.section.key}`

### Adding a New Color

1. Add to `design-system/tokens.css`
2. Use semantic name: `--color-purpose-variant`
3. Reference in CSS: `color: var(--color-purpose-variant)`

### Debugging Weather API

- Check `.env` has `VITE_OPENWEATHER_API_KEY`
- Verify key is active (can take 2 hours)
- Test with curl: `curl "https://api.openweathermap.org/data/2.5/weather?lat=42.4509&lon=-73.2481&appid=YOUR_KEY"`

---

## Git Workflow

### Commit Message Format

```
Brief description of change

- Specific change 1
- Specific change 2
- Why this matters for grief processing (if relevant)

Research impact: [if applicable]
```

### What to Commit

- All code changes
- Design token updates
- Content string additions
- Documentation improvements

### What NOT to Commit

- `.env` (has API keys)
- `node_modules/`
- `dist/` (build output)
- Personal grief data (if testing locally)

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

This app is:
- A lighthouse (not a temple)
- A guide (not a prison)
- A ritual (not a replacement)
- A tool for processing (not preserving)

Build accordingly.

---

**This is grief made tangible. Build with care.**
