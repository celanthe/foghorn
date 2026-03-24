# Foghorn Hardware Wiring Guide

## Board: Elegoo UNO R3

## Pin Assignments

| Component        | Pin  | Type    | Notes                                    |
|------------------|------|---------|------------------------------------------|
| DHT11 signal     | D2   | Digital | Green wire. Already wired.               |
| DHT11 VCC        | 5V   | Power   | Red wire. Already wired.                 |
| DHT11 GND        | GND  | Ground  | Black wire. Already wired.               |
| Button           | D3   | Digital | Internal pullup. One leg to D3, other to GND. |
| Tilt switch      | D4   | Digital | Internal pullup. One leg to D4, other to GND. |
| Passive buzzer + | D5   | PWM     | Positive leg to D5.                      |
| Passive buzzer - | GND  | Ground  | Negative leg to GND.                     |
| Servo signal     | D6   | PWM     | Orange/yellow wire.                      |
| Servo VCC        | 5V   | Power   | Red wire.                                |
| Servo GND        | GND  | Ground  | Brown/black wire.                        |
| RGB LED Red      | D9   | PWM     | Through 220 ohm resistor.               |
| RGB LED Green    | D10  | PWM     | Through 220 ohm resistor.               |
| RGB LED Blue     | D11  | PWM     | Through 220 ohm resistor.               |
| RGB LED Cathode  | GND  | Ground  | Common cathode (longest leg).            |
| Photoresistor    | A0   | Analog  | Voltage divider: one leg to 5V, other to A0 + 10k ohm to GND. |

## Resistor Summary

| Resistor  | Value    | Location                              |
|-----------|----------|---------------------------------------|
| R1        | 220 ohm  | Between D9 and RGB LED red anode      |
| R2        | 220 ohm  | Between D10 and RGB LED green anode   |
| R3        | 220 ohm  | Between D11 and RGB LED blue anode    |
| R4        | 10k ohm  | Between A0 and GND (photoresistor divider) |

## RGB LED Wiring (Common Cathode)

The RGB LED has 4 legs. Looking at it flat side up, legs left to right:

```
    [LED dome]
   /          \
  R   GND   B   G
  |    |    |   |
 220  GND  220  220
  |         |   |
  D9       D11  D10
```

- Longest leg = GND (common cathode)
- Red anode: through 220 ohm to D9
- Green anode: through 220 ohm to D10
- Blue anode: through 220 ohm to D11

## Photoresistor Voltage Divider

```
5V ---[photoresistor]--- A0 ---[10k ohm]--- GND
```

Bright light = low resistance = higher voltage at A0.
Dark = high resistance = lower voltage at A0.
Analog read range: 0 (dark) to ~1023 (bright).

## Button & Tilt Switch

Both use internal pullups (INPUT_PULLUP in code):

```
D3 ---[button]--- GND
D4 ---[tilt switch]--- GND
```

No external resistors needed. Reading LOW = pressed/tilted.

## Serial Connection to Raspberry Pi 400

USB cable from Arduino to Pi 400.
- Baud rate: 9600
- Pi serial port: typically `/dev/ttyACM0` or `/dev/ttyUSB0`
- Check with `ls /dev/tty*` after connecting

## Libraries Required (Arduino IDE)

1. **DHT sensor library** by Adafruit (already installed)
2. **ArduinoJson** by Benoit Blanchon (install via Library Manager)
3. **Servo** (built-in, no install needed)
