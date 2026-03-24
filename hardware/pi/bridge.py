"""
Foghorn Bridge — Main orchestrator.

Reads sensor data from Arduino, detects button presses,
calls Claude API for interpretation, and sends commands
back to the Arduino to control LED, servo, and buzzer.

Between button presses, uses local led_model for LED state.

Usage:
    python bridge.py

Configuration via .env file (see .env.example).
"""

import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from serial_handler import ArduinoSerial
from led_model import get_led_state
from servo_model import score_to_servo
from claude_client import FoghornClaude

# ==================== Configuration ====================

load_dotenv()

SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyACM0")
BAUD_RATE = int(os.getenv("BAUD_RATE", "9600"))
SCORE_FILE = os.getenv("SCORE_FILE", "foghorn_score.json")
ONBOARDING_FILE = os.getenv("ONBOARDING_FILE", "foghorn_onboarding.json")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LOG_DIR = Path(__file__).parent / "logs"

# ==================== Logging ====================

LOG_DIR.mkdir(exist_ok=True)
log_file = LOG_DIR / f"foghorn_{datetime.now().strftime('%Y-%m-%d')}.jsonl"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file),
    ],
)
logger = logging.getLogger("foghorn.bridge")

# ==================== Data Loading ====================


def load_json_file(path):
    """Load a JSON file, returning None if missing or invalid."""
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.debug("Could not load %s: %s", path, e)
        return None


def load_score():
    """Load the current check-in score from the score file."""
    data = load_json_file(SCORE_FILE)
    if data and "score" in data:
        return max(1, min(10, int(data["score"])))
    return None


def load_onboarding():
    """Load onboarding data (name, weather preferences, mode)."""
    return load_json_file(ONBOARDING_FILE)


def log_event(event_type, data):
    """Append a structured event to the daily log file."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "type": event_type,
        **data,
    }
    with open(log_file, "a") as f:
        f.write(json.dumps(entry) + "\n")


# ==================== Main Loop ====================


def main():
    logger.info("Foghorn bridge starting...")
    logger.info("Serial port: %s", SERIAL_PORT)

    # Load onboarding data once at startup
    onboarding = load_onboarding()
    if onboarding:
        logger.info("Onboarding loaded for: %s", onboarding.get("name", "unknown"))
    else:
        logger.warning("No onboarding data found at %s", ONBOARDING_FILE)

    # Initialize Claude client (if API key available)
    claude = None
    if ANTHROPIC_API_KEY:
        claude = FoghornClaude(ANTHROPIC_API_KEY)
        logger.info("Claude API client initialized")
    else:
        logger.warning("No ANTHROPIC_API_KEY — running in local-only mode")

    # Connect to Arduino
    try:
        arduino = ArduinoSerial(SERIAL_PORT, BAUD_RATE)
    except Exception as e:
        logger.error("Failed to connect to Arduino: %s", e)
        sys.exit(1)

    last_score = load_score() or 5  # default to neutral
    weather_prefs = (onboarding or {}).get("weatherPreferences")
    user_name = (onboarding or {}).get("name")

    logger.info("Initial score: %d", last_score)
    logger.info("Bridge running. Press Ctrl+C to stop.")

    try:
        while True:
            # Read sensor data
            sensor_data = arduino.read_sensors()
            if sensor_data is None:
                continue

            # Check for button press
            if sensor_data.get("button") == 1:
                logger.info("Button press detected — initiating check-in")

                # Reload score (may have been updated)
                fresh_score = load_score()
                if fresh_score is not None:
                    last_score = fresh_score

                log_event("button_press", {
                    "score": last_score,
                    "sensors": sensor_data,
                })

                # Try Claude interpretation
                if claude:
                    logger.info("Calling Claude API...")
                    result = claude.interpret(
                        sensor_data, last_score, user_name, weather_prefs
                    )
                    if result:
                        arduino.send_command(
                            led=result.get("led"),
                            pulse=result.get("pulse"),
                            servo=result.get("servo"),
                            buzz=result.get("buzz"),
                        )
                        log_event("claude_response", result)
                        continue

                # Fallback: local model
                logger.info("Using local model (score=%d)", last_score)
                led_state = get_led_state(last_score, None, weather_prefs)
                servo_pos = score_to_servo(last_score)
                arduino.send_command(
                    led=led_state["led"],
                    pulse=led_state["pulse"],
                    servo=servo_pos,
                )
                log_event("local_response", {
                    "led": led_state["led"],
                    "pulse": led_state["pulse"],
                    "servo": servo_pos,
                })

            else:
                # No button press — maintain current LED state locally
                led_state = get_led_state(last_score, None, weather_prefs)
                arduino.send_command(
                    led=led_state["led"],
                    pulse=led_state["pulse"],
                )

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        # LED off, servo neutral on exit
        arduino.send_command(led=(0, 0, 0), pulse=0, servo=90)
        arduino.close()
        logger.info("Bridge stopped.")


if __name__ == "__main__":
    main()
