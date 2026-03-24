"""
Arduino serial communication handler.

Reads JSON sensor data from Arduino, sends JSON commands back.
Protocol documented in hardware/WIRING.md and the Arduino sketch.
"""

import json
import logging

import serial

logger = logging.getLogger("foghorn.serial")


class ArduinoSerial:
    """Bidirectional JSON serial communication with the Arduino."""

    def __init__(self, port, baud=9600, timeout=2):
        """
        Args:
            port: Serial port path (e.g. '/dev/ttyACM0')
            baud: Baud rate (must match Arduino sketch)
            timeout: Read timeout in seconds
        """
        self.ser = serial.Serial(port, baud, timeout=timeout)
        logger.info("Connected to Arduino on %s at %d baud", port, baud)

    def read_sensors(self):
        """
        Read one line of JSON sensor data from Arduino.

        Returns:
            dict or None: Parsed sensor data, or None if read failed.
            Expected keys: temp, humidity, light, button, tilt
        """
        try:
            line = self.ser.readline().decode("utf-8").strip()
            if not line:
                return None
            data = json.loads(line)
            return data
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            logger.debug("Failed to parse sensor data: %s", e)
            return None

    def send_command(self, led=None, pulse=None, servo=None, buzz=None):
        """
        Send a command to the Arduino.

        All parameters are optional. Only included fields are sent.

        Args:
            led: RGB tuple/list (r, g, b) each 0-255
            pulse: Pulse cycle in ms (0 = solid)
            servo: Servo angle 0-180
            buzz: Tuple (frequency_hz, duration_ms)
        """
        cmd = {}
        if led is not None:
            cmd["led"] = list(led)
        if pulse is not None:
            cmd["pulse"] = pulse
        if servo is not None:
            cmd["servo"] = servo
        if buzz is not None:
            cmd["buzz"] = list(buzz)

        if not cmd:
            return

        line = json.dumps(cmd) + "\n"
        self.ser.write(line.encode("utf-8"))
        logger.debug("Sent command: %s", line.strip())

    def close(self):
        """Close the serial connection."""
        if self.ser and self.ser.is_open:
            self.ser.close()
            logger.info("Serial connection closed")
