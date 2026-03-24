"""
Claude API client for Foghorn emotional interpretation.

Called on button press to interpret sensor data + check-in score
and return physical device commands (LED, servo, buzzer).

Between button presses, led_model.py handles LED state locally.
"""

import json
import logging

import anthropic

logger = logging.getLogger("foghorn.claude")

SYSTEM_PROMPT = """\
You are Foghorn's emotional interpreter. You translate sensor data and a user's \
self-reported check-in score into physical responses for a small desk companion.

RULES:
1. The check-in score (1-10) is the PRIMARY signal. It is self-reported and \
always respected as ground truth. Never override it.
2. Sensor data provides CONTEXT only:
   - Room temperature and humidity suggest environment
   - Light level suggests time of day or darkness (0=dark, 1023=bright)
   - Tilt means the user picked up or knocked over the device
   - Button press means the user initiated a check-in
3. Weather preferences tell you what weather is emotionally hard or loved \
for this person. Use this to add subtle texture, never to override the score.
4. You respond ONLY with a JSON object. No other text. No markdown fencing.

Response format:
{
  "led": [R, G, B],
  "pulse": <ms>,
  "servo": <degrees>,
  "buzz": [freq, ms],
  "note": "brief internal note about interpretation"
}

Field constraints:
- led: array of 3 integers, each 0-255
- pulse: integer, milliseconds per pulse cycle. 0 for solid (no pulse).
- servo: integer, 0-180 degrees. Low (30) = drooped posture. High (120) = uplifted.
- buzz: array of 2 integers [frequency_hz, duration_ms]. [0, 0] for silence.
- note: string, for logging only, never shown to the user

Emotional color language:
- Deep red, dim, slow pulse = heavy grief (score 1-3)
- Muted purple/amber, steady = sitting with it (score 4-5)
- Warm white, calm = present, okay (score 6-7)
- Soft blue-green, gentle = lighter day (score 8-10)

IMPORTANT: The "note" field is for logging only, never shown to the user.
Keep responses gentle. This is grief processing, not therapy.\
"""


class FoghornClaude:
    """Claude API wrapper for emotional state interpretation."""

    def __init__(self, api_key):
        self.client = anthropic.Anthropic(api_key=api_key)

    def interpret(self, sensor_data, check_in_score, user_name=None,
                  weather_prefs=None):
        """
        Ask Claude to interpret emotional state from sensor + check-in data.

        Args:
            sensor_data: Dict from Arduino (temp, humidity, light, tilt)
            check_in_score: Integer 1-10
            user_name: Optional user name from onboarding
            weather_prefs: Optional dict with hardWeather/lovedWeather

        Returns:
            dict: Command object {led, pulse, servo, buzz, note}
            None: If API call fails
        """
        user_message = self._build_message(
            sensor_data, check_in_score, user_name, weather_prefs
        )

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-5-20241022",
                max_tokens=256,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )

            text = response.content[0].text.strip()
            result = json.loads(text)

            # Validate expected keys
            if "led" not in result or "pulse" not in result:
                logger.warning("Claude response missing required keys: %s", text)
                return None

            logger.info("Claude interpretation: %s", result.get("note", ""))
            return result

        except (anthropic.APIError, json.JSONDecodeError) as e:
            logger.error("Claude API call failed: %s", e)
            return None

    def _build_message(self, sensor_data, score, name, prefs):
        """Build the user message for Claude."""
        parts = [f"Check-in score: {score}/10"]

        if name:
            parts.append(f"User: {name}")

        if sensor_data:
            parts.append(
                f"Room: {sensor_data.get('temp', '?')}°F, "
                f"{sensor_data.get('humidity', '?')}% humidity, "
                f"light level {sensor_data.get('light', '?')}/1023"
            )
            if sensor_data.get("tilt"):
                parts.append("Device was picked up or tilted.")

        if prefs:
            hard = prefs.get("hardWeather", [])
            loved = prefs.get("lovedWeather", [])
            if hard:
                parts.append(f"Hard weather for this person: {', '.join(hard)}")
            if loved:
                parts.append(f"Loved weather for this person: {', '.join(loved)}")

        return "\n".join(parts)
