# Foghorn

**A place-based grief processing app using daily weather rituals and sensory memory.**

This is not a weather app. This is grief made tangible.

---

## Quick Start

### 1. Get an OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Generate API key (free tier: 1000 calls/day)

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

## Current Features (Phase 1 - Week 1)

✅ Current weather for your location
✅ Weather condition detection (fog, rain, sleet, snow)
✅ Foghorn trigger indicator
✅ Manual "Play Foghorn" button
✅ Coastal, minimal UI (fog grey aesthetic)
✅ Responsive design

---

## Coming Soon

**Phase 1-2 (Weeks 1-4):**
- Historical Falmouth, MA weather matching (1985-2003)
- "Similar to Falmouth, Jan 14, 1999"
- Real foghorn audio (not placeholder)
- Morning notification (6:45 AM)

**Phase 3-4 (Weeks 5-8):**
- Memory layer (voice notes, photos, timeline)
- Grief phases (Active → Processing → Integration)
- Growth tracking dashboard
- Red/green flag detection

**Phase 5-6 (Weeks 9-12):**
- Exit strategies (Memorial/Archive/Legacy modes)
- Time capsule for daughter

---

## Project Structure

```
foghorn/
├── src/
│   ├── components/     # React components
│   ├── services/       # Weather, foghorn, storage
│   ├── assets/         # Audio files, images
│   ├── App.jsx         # Main app
│   └── App.css         # Coastal aesthetic
├── .env                # API keys (gitignored)
├── .env.example        # Template
└── README.md
```

---

## The Research Question

**"How do you mourn people who are still alive WITHOUT getting stuck in grief?"**

This app helps process ambiguous loss through:
- Daily weather rituals
- Sensory memory triggers (foghorn sound)
- Grief phase progression
- Growth tracking
- Exit strategies

**The commitment:** Process grief, not preserve it forever.

---

## Tech Stack

- React + Vite
- OpenWeatherMap API
- Web Audio API (foghorn playback)
- IndexedDB (local storage, coming soon)

---

## For You

**What you're building this to process:**
- Dad (alive but choosing absence)
- Brother (six months of silence)
- Grandmother, grandfather, aunt (18 months, sirens, snow)
- The 14-year-old you (apple green room, red flannel, the good kid)
- The real foghorn (now a recording)

**What you're teaching your daughter:**
- Grief rituals
- "It was just yesterday"
- That you answer the phone
- That love isn't conditional

---

**Lighthouses guide you home. Even when home is gone.**
