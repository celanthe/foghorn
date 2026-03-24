/**
 * Foghorn — Full Sensor + Actuator Sketch
 * Elegoo UNO R3
 *
 * Reads: DHT11, photoresistor, button, tilt switch
 * Controls: RGB LED (with pulsing), servo, passive buzzer
 * Protocol: JSON over serial at 9600 baud
 *
 * See hardware/WIRING.md for pin assignments.
 */

#include <DHT.h>
#include <ArduinoJson.h>
#include <Servo.h>

// ==================== Pin assignments ====================

#define DHT_PIN     2
#define BUTTON_PIN  3
#define TILT_PIN    4
#define BUZZER_PIN  5
#define SERVO_PIN   6
#define LED_R_PIN   9
#define LED_G_PIN   10
#define LED_B_PIN   11
#define PHOTO_PIN   A0

#define DHT_TYPE DHT11

// ==================== Timing ====================

#define SENSOR_INTERVAL  2000   // ms between sensor reads
#define DEBOUNCE_MS      50     // button debounce

// ==================== State ====================

DHT dht(DHT_PIN, DHT_TYPE);
Servo servo;

// Sensor state
float lastTemp = 0;
float lastHumidity = 0;
int   lightLevel = 0;

// Button debounce
int  buttonState = HIGH;
int  lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
bool buttonPressed = false;  // one-shot flag

// Tilt
int tiltState = HIGH;

// LED target and pulse
int targetR = 0, targetG = 0, targetB = 0;
unsigned long pulseSpeed = 0;  // 0 = solid (no pulse)

// Buzzer
unsigned int buzzFreq = 0;
unsigned int buzzDuration = 0;
unsigned long buzzStartTime = 0;
bool buzzing = false;

// Timing
unsigned long lastSensorTime = 0;
String serialBuffer = "";

// ==================== Setup ====================

void setup() {
  Serial.begin(9600);
  dht.begin();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(TILT_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_R_PIN, OUTPUT);
  pinMode(LED_G_PIN, OUTPUT);
  pinMode(LED_B_PIN, OUTPUT);

  servo.attach(SERVO_PIN);
  servo.write(90);  // neutral position

  // LED off at start
  analogWrite(LED_R_PIN, 0);
  analogWrite(LED_G_PIN, 0);
  analogWrite(LED_B_PIN, 0);
}

// ==================== Main Loop ====================

void loop() {
  unsigned long now = millis();

  // Read sensors and send data every SENSOR_INTERVAL
  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;
    readSensors();
    sendSensorData();
  }

  // Debounce button
  debounceButton();

  // Check for incoming serial commands
  readSerial();

  // Update LED pulse
  updateLED(now);

  // Handle buzzer duration
  updateBuzzer(now);
}

// ==================== Sensor Reading ====================

void readSensors() {
  float t = dht.readTemperature(true);  // Fahrenheit
  float h = dht.readHumidity();

  // DHT11 sometimes returns NaN — keep last known values
  if (!isnan(t)) lastTemp = t;
  if (!isnan(h)) lastHumidity = h;

  lightLevel = analogRead(PHOTO_PIN);
  tiltState = digitalRead(TILT_PIN);
}

void sendSensorData() {
  JsonDocument doc;
  doc["temp"] = round(lastTemp);
  doc["humidity"] = round(lastHumidity);
  doc["light"] = lightLevel;
  doc["button"] = buttonPressed ? 1 : 0;
  doc["tilt"] = (tiltState == LOW) ? 1 : 0;

  // Clear one-shot button flag after sending
  buttonPressed = false;

  serializeJson(doc, Serial);
  Serial.println();
}

// ==================== Button Debounce ====================

void debounceButton() {
  int reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_MS) {
    if (reading != buttonState) {
      buttonState = reading;
      // Rising edge: button was pressed (active LOW, so transition to HIGH = release)
      // We want press event, so detect LOW transition
      if (buttonState == LOW) {
        buttonPressed = true;
      }
    }
  }

  lastButtonState = reading;
}

// ==================== Serial Command Processing ====================

void readSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      processCommand(serialBuffer);
      serialBuffer = "";
    } else {
      serialBuffer += c;
      // Prevent buffer overflow
      if (serialBuffer.length() > 200) {
        serialBuffer = "";
      }
    }
  }
}

void processCommand(String json) {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, json);
  if (err) return;

  // LED color
  if (doc["led"].is<JsonArray>()) {
    JsonArray led = doc["led"];
    if (led.size() >= 3) {
      targetR = constrain(led[0].as<int>(), 0, 255);
      targetG = constrain(led[1].as<int>(), 0, 255);
      targetB = constrain(led[2].as<int>(), 0, 255);
    }
  }

  // Pulse speed
  if (doc.containsKey("pulse")) {
    pulseSpeed = doc["pulse"].as<unsigned long>();
  }

  // Servo position
  if (doc.containsKey("servo")) {
    int pos = constrain(doc["servo"].as<int>(), 0, 180);
    servo.write(pos);
  }

  // Buzzer
  if (doc["buzz"].is<JsonArray>()) {
    JsonArray buzz = doc["buzz"];
    if (buzz.size() >= 2) {
      buzzFreq = buzz[0].as<unsigned int>();
      buzzDuration = buzz[1].as<unsigned int>();
      if (buzzFreq > 0 && buzzDuration > 0) {
        tone(BUZZER_PIN, buzzFreq);
        buzzStartTime = millis();
        buzzing = true;
      } else {
        noTone(BUZZER_PIN);
        buzzing = false;
      }
    }
  }
}

// ==================== LED Pulse ====================

void updateLED(unsigned long now) {
  float brightness = 1.0;

  if (pulseSpeed > 0) {
    // Sine wave: smoothly oscillates between 0.15 and 1.0
    // Never fully off — always some presence
    float phase = (float)(now % pulseSpeed) / (float)pulseSpeed;
    float sine = sin(phase * 2.0 * PI);
    brightness = 0.15 + (sine * 0.5 + 0.5) * 0.85;
  }

  analogWrite(LED_R_PIN, (int)(targetR * brightness));
  analogWrite(LED_G_PIN, (int)(targetG * brightness));
  analogWrite(LED_B_PIN, (int)(targetB * brightness));
}

// ==================== Buzzer ====================

void updateBuzzer(unsigned long now) {
  if (buzzing && (now - buzzStartTime >= buzzDuration)) {
    noTone(BUZZER_PIN);
    buzzing = false;
  }
}
