/**
 * ESP32 + MFRC522 RFID Exit Gate Scanner
 * Sends trolley UID to SmartMart backend. Gate opens only after payment.
 * Endpoint: POST /api/exit/scan with JSON body { "uid": "..." }
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 4

MFRC522 rfid(SS_PIN, RST_PIN);

const char* ssid = "sai";
const char* password = "123456789";

// Your backend URL - use IP and port where SupermarketBackend runs
String serverUrl = "http://192.168.1.15:8081/api/exit/scan";

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
  Serial.println("Backend: " + serverUrl);

  SPI.begin();
  rfid.PCD_Init();
  rfid.PCD_DumpVersionToSerial();
  Serial.println("Scan RFID trolley tag...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent())
    return;
  if (!rfid.PICC_ReadCardSerial())
    return;

  // Build UID as hex string (e.g. "d91fab4")
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10)
      uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toLowerCase();

  Serial.println("Card UID: " + uid);

  int result = sendToBackend(uid);  // 1=open, 0=closed, -1=connection failed
  if (result == 1) {
    Serial.println(">>> GATE OPEN - Payment verified!");
    // TODO: Trigger relay/servo/LED to open gate
  } else if (result == 0) {
    Serial.println(">>> GATE CLOSED - Payment required.");
    // TODO: Optional buzzer/LED for denied
  } else {
    Serial.println(">>> CONNECTION FAILED - Check server URL, WiFi, firewall.");
  }

  delay(2000);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Returns: 1=gate open, 0=gate closed (payment required), -1=connection error
int sendToBackend(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return -1;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);  // 10 sec timeout

  StaticJsonDocument<128> doc;
  doc["uid"] = uid;
  String jsonBody;
  serializeJson(doc, jsonBody);

  int httpCode = http.POST(jsonBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Response: " + response);

    StaticJsonDocument<256> resDoc;
    DeserializationError err = deserializeJson(resDoc, response);
    if (!err) {
      bool gateOpen = resDoc["gateOpen"] | false;
      const char* msg = resDoc["message"];
      if (msg)
        Serial.println(msg);
      http.end();
      return gateOpen ? 1 : 0;
    }
  } else {
    Serial.println("HTTP Error: " + String(httpCode) + " - Cannot reach server at " + serverUrl);
  }

  http.end();
  return -1;  // Connection failed
}
