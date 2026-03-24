"""
LED emotional state model.

Maps check-in score (1-10) to RGB color and pulse speed.
Weather preferences add subtle texture — never override the primary signal.

Color language (from FOGHORN_CONTEXT.md):
  1-3: Deep red, very dim, slow pulse
  4-5: Muted purple/amber, soft, steady
  6-7: Neutral warm white, calm, present
  8-10: Soft blue-green, gentle brightness
"""


# Color anchors: (score, (R, G, B))
# Interpolate linearly between these points
_COLOR_ANCHORS = [
    (1,  (80,  5,   5)),    # deep red, very dim
    (3,  (120, 15,  10)),   # deeper red, slightly brighter
    (5,  (100, 50,  70)),   # muted purple/amber
    (7,  (180, 160, 140)),  # warm white
    (10, (60,  160, 140)),  # soft blue-green
]

# Pulse anchors: (score, pulse_ms)  0 = solid
_PULSE_ANCHORS = [
    (1,  3000),   # slow pulse — heavy grief
    (3,  3000),
    (4,  0),      # solid — sitting with it
    (7,  0),      # solid — calm, present
    (8,  4000),   # gentle pulse — lighter day
    (10, 4000),
]


def _lerp(a, b, t):
    """Linear interpolation between a and b by factor t (0-1)."""
    return a + (b - a) * t


def _interpolate(anchors, score):
    """Interpolate a value from anchor points at a given score."""
    score = max(1, min(10, score))

    # Find surrounding anchors
    for i in range(len(anchors) - 1):
        s0, v0 = anchors[i]
        s1, v1 = anchors[i + 1]
        if s0 <= score <= s1:
            if s0 == s1:
                return v0
            t = (score - s0) / (s1 - s0)
            # Handle tuples (RGB) vs scalars (pulse)
            if isinstance(v0, tuple):
                return tuple(int(_lerp(a, b, t)) for a, b in zip(v0, v1))
            return int(_lerp(v0, v1, t))

    # Fallback: return last anchor
    return anchors[-1][1]


def score_to_color(score):
    """
    Map check-in score (1-10) to RGB tuple.

    Returns:
        tuple: (R, G, B) each 0-255
    """
    return _interpolate(_COLOR_ANCHORS, score)


def score_to_pulse(score):
    """
    Map check-in score (1-10) to pulse speed in milliseconds.
    0 = solid (no pulse).

    Returns:
        int: milliseconds per pulse cycle, or 0 for solid
    """
    return _interpolate(_PULSE_ANCHORS, score)


def apply_weather_texture(r, g, b, pulse, weather_condition, weather_prefs):
    """
    Apply subtle weather-based hue shift. Never overrides primary signal.

    The shift is small (+/- 10 on color channels, +/- 10% on pulse) so the
    check-in score always dominates.

    Args:
        r, g, b: Current LED color (0-255 each)
        pulse: Current pulse speed in ms (0 = solid)
        weather_condition: Current weather string (e.g. 'Fog', 'Rain')
        weather_prefs: Dict with 'hardWeather' and 'lovedWeather' lists

    Returns:
        tuple: (r, g, b, pulse) with texture applied
    """
    if not weather_prefs or not weather_condition:
        return (r, g, b, pulse)

    hard = weather_prefs.get("hardWeather", [])
    loved = weather_prefs.get("lovedWeather", [])

    condition_lower = weather_condition.lower()

    # Map weather conditions to preference keys
    condition_map = {
        "fog": "fog", "mist": "fog", "haze": "fog",
        "rain": "rain", "drizzle": "rain",
        "snow": "snow", "sleet": "snow",
        "clear": "heat",  # rough association
        "clouds": "cold",
    }
    pref_key = condition_map.get(condition_lower)
    if not pref_key:
        return (r, g, b, pulse)

    if pref_key in hard:
        # Hard weather: slight warm shift, pulse 10% faster
        r = min(255, r + 10)
        b = max(0, b - 5)
        if pulse > 0:
            pulse = max(500, int(pulse * 0.9))
    elif pref_key in loved:
        # Loved weather: slight cool shift, pulse 10% slower
        r = max(0, r - 5)
        b = min(255, b + 10)
        if pulse > 0:
            pulse = int(pulse * 1.1)

    return (r, g, b, pulse)


def get_led_state(score, weather_condition=None, weather_prefs=None):
    """
    Full pipeline: score -> color + pulse -> weather texture.

    Args:
        score: Check-in intensity (1-10)
        weather_condition: Optional current weather string
        weather_prefs: Optional dict with hardWeather/lovedWeather lists

    Returns:
        dict: {"led": [r, g, b], "pulse": ms}
    """
    r, g, b = score_to_color(score)
    pulse = score_to_pulse(score)

    if weather_condition and weather_prefs:
        r, g, b, pulse = apply_weather_texture(
            r, g, b, pulse, weather_condition, weather_prefs
        )

    return {"led": [r, g, b], "pulse": pulse}
