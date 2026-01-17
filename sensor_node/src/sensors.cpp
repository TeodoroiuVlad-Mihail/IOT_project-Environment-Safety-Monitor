//sensors.cpp

#include "sensors.h"
#include <Arduino.h>
#include "pins.h"
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include "config.h"

Adafruit_BMP085 bmp;

void initSensors() {
    // init I2C, ADC, GPIO
    pinMode(PIN_VIBRATION, INPUT);
    // pinMode(PIN_LED, OUTPUT);
    
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);


    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);


    if (!bmp.begin()) {
    Serial.println("BMP085 not detected!");
}
}

float readTemperature() {
    return bmp.readTemperature();
}

float readHumidity() {
    int sensorValue = analogRead(PIN_HUMIDITY);
    // Convert sensor value to humidity percentage
    return (sensorValue / 4095.0) * 100.0;
}

float readPressure() {
    return bmp.readPressure() / 100.0F; // convert to hPa
}

int readGas() {
    return analogRead(PIN_GAS);
}

bool detectVibration() {
    return digitalRead(PIN_VIBRATION) == HIGH;
}

bool detectSound() {
    int sensorValue = analogRead(PIN_SOUND);
    return sensorValue > SOUND_THRESHOLD;
}



SensorData readSensors() {
    SensorData d;
    d.temperature = readTemperature();
    d.humidity = readHumidity();
    d.pressure = readPressure();
    d.gas = readGas();
    d.vibration = detectVibration();
    d.sound = detectSound();
    return d;
}

void detectEvents(SensorData& d) {
    // todo: implement event detection logic if needed
}