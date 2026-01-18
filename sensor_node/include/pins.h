// pins.h
// Header file defining pin assignments

#pragma once

// I2C // Temperature & Pressure sensor (BMP180/BMP085)
#define PIN_I2C_SDA   21
#define PIN_I2C_SCL   22

// Analog inputs (ADC)
#define PIN_GAS       34   // MQ-7
#define PIN_HUMIDITY  35   // HR202
#define PIN_SOUND     32   // Sound sensor: 0104110000082152

// Digital inputs
#define PIN_VIBRATION 27  // Vibration sensor: 0104110000000347