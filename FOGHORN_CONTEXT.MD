# Foghorn — Context Document
*Last updated: March 24, 2026*

## What Foghorn Is

Foghorn is an app for grief and ambiguous loss — the kind that doesn't have a clean shape. A relationship that ended strangely. A version of yourself you had to leave behind. A home. A diagnosis that reframed everything before it.

It uses daily weather as a ritual. The app knows what the weather is like where you are and meets you there. It asks how you're doing — just a number, just enough friction to actually pause — and tracks that over time without turning it into a productivity dashboard. The data is yours. The point isn't optimization. The point is that something noticed.

**The robot is a physical layer on top of the app.** A small creature that lives on your desk and makes the app tangible.

---

## Core Design Principles

### Weather is context, not emotional state
Foghorn never assumes rain = sad or sunshine = happy. Some people have seasonal affective disorder in summer. Some people love grey days. Weather is layered on top of the user's reported state as texture — it never overrides it.

### Primary signal is always the user's check-in number
The check-in is a 1-10 scale. The number is the dominant signal. Weather adds subtle texture to the response but never changes the interpretation of the number.

### User-configured weather preferences
During onboarding, Foghorn learns:
- What seasons or weather patterns are hard for you
- What weather you actually love
This context is held and used to personalize responses.

### No unsolicited check-ins unless opted in
Unsolicited check-ins can feel like pressure or surveillance, especially for neurodivergent users. Foghorn has two modes:

**Ambient mode** — Foghorn sits present on the desk. LED reflects last known state. No interruptions. User comes to it on their own terms.

**Companion mode** — Gentle nudges at user-defined intervals. Still never pushy. User opts into this explicitly.

Both modes should feel like presence, not surveillance.

---

## Emotional State Model (Hardware LED)

### Primary: Check-in number → LED color
| Score | Color | Behavior |
|-------|-------|----------|
| 1–3 | Deep red | Very dim, slow pulse |
| 4–5 | Muted purple or amber | Soft, steady |
| 6–7 | Neutral warm white | Calm, present |
| 8–10 | Soft blue-green | Gentle brightness |

### Secondary: Weather → subtle texture
- Slight hue shift or pulse speed adjustment only
- Never overrides primary signal
- Informed by user's weather preferences

---

## Hardware Stack (Prototype)

### Components (all on hand)
- **Elegoo UNO R3** — Arduino microcontroller
- **DHT11** — temperature and humidity sensor (already wired to breadboard)
- **RGB LED** — emotional state output
- **Photoresistor** — ambient light detection (knows if it's 3am)
- **Button** — check-in trigger
- **Passive buzzer** — ambient sound feedback
- **Tilt switch** — knows if Foghorn has been picked up or knocked over
- **Servo motor** — physical emotional reaction (droop, movement)
- **830 tie-point breadboard + jumper wires**

### Data flow
```
DHT11 + sensors
      ↓
Arduino UNO R3 (reads sensors, controls outputs)
      ↓ USB serial
Raspberry Pi 400 (runs Python, manages state)
      ↓ API call
Claude (interprets state, generates response)
      ↓
Pi 400 → Arduino → RGB LED + buzzer + servo
```

### Current wiring status (March 24 2026)
- DHT11 wired to breadboard: ✅
  - Left pin (Signal) → green wire → Arduino pin 2
  - Middle pin (VCC) → red wire → Arduino 5V
  - Right pin (GND) → black wire → Arduino GND
- Arduino sketch: `foghorn_v0` — reads temp/humidity every 2 seconds, prints to Serial
- DHT sensor library (Adafruit) installed in Arduino IDE: ✅
- USB-C adapter ordered, arriving today: ✅
- Pi 400 integration: next session

### Next steps (hardware)
1. Adapter arrives → upload sketch → confirm DHT11 reads room data
2. Add RGB LED to breadboard
3. Add button for check-in trigger
4. Wire Pi 400 via USB to Arduino
5. Python script on Pi reads Arduino serial output
6. Pi makes Claude API call with sensor data + check-in score
7. Claude returns emotional state
8. Pi sends state back to Arduino → LED color changes

---

## Onboarding (TBD)
No onboarding workflow existed in the original repo. Design decisions made today:

Questions Foghorn should ask on first run:
- What's your name
- What seasons or weather patterns are hard for you
- What weather do you actually love
- Ambient mode or companion mode

---

## Relationship to Human-Rhythm Design Framework
Foghorn is the **Transitions dimension** of the framework — grief, shutdown, overwhelm, and ambiguous loss as real user states that deserve real software. It is also a research artifact within the framework.

---

## Repo
Check `/GitHub/foghorn` locally or ask Claude Code to read the existing codebase before continuing.

*This document was generated from a design session on March 24, 2026. Feed it to Claude Code at the start of any new session to restore context.*
