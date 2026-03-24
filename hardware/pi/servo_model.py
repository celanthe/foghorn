"""
Servo emotional state model.

Maps check-in score (1-10) to servo position (degrees).
Low scores = drooped posture. High scores = upright/uplifted.

The servo gives the desk companion a physical posture that
mirrors the user's self-reported state.
"""


# Anchor points: (score, degrees)
_SERVO_ANCHORS = [
    (1,  30),    # drooped — heavy day
    (3,  45),
    (5,  60),    # halfway — sitting with it
    (7,  90),    # neutral — present, okay
    (10, 120),   # slightly uplifted — lighter day
]


def _lerp(a, b, t):
    return a + (b - a) * t


def score_to_servo(score):
    """
    Map check-in score (1-10) to servo position in degrees.

    Returns:
        int: Servo angle 0-180
    """
    score = max(1, min(10, score))

    for i in range(len(_SERVO_ANCHORS) - 1):
        s0, d0 = _SERVO_ANCHORS[i]
        s1, d1 = _SERVO_ANCHORS[i + 1]
        if s0 <= score <= s1:
            t = (score - s0) / (s1 - s0) if s1 != s0 else 0
            return int(_lerp(d0, d1, t))

    return _SERVO_ANCHORS[-1][1]
