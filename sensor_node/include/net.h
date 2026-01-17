// net.h
// Header file for network management in the IoT Environment Safety Monitor project.

#pragma once

#include "sensors.h"

void initWiFi();
void sendData(const SensorData& data);
void netLoop();