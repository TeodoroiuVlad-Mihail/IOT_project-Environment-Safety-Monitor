// main.cpp

#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "net.h"

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("Boot OK");

    initSensors();
    Serial.println("Sensors OK");

    initWiFi();
    Serial.println("WiFi OK");
}

void loop() {
    SensorData data = readSensors();
    detectEvents(data);
    sendData(data);

    delay(5000);
}
