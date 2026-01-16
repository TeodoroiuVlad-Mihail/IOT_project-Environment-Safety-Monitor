// sensors.h
// Header file for sensor management
#pragma once

#include <Adafruit_BMP085.h>

extern Adafruit_BMP085 bmp;

struct SensorData {
    float temperature; // in Celsius
    float humidity; // in percentage
    float pressure; // in hPa
    int   gas; // gas concentration in ppm
    bool  vibration; // vibration detected or not
    bool  sound; // sound detected or not
};

void initSensors();
SensorData readSensors();
void detectEvents(SensorData& data);