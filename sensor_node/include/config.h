/// config.h
/// Configuration header

#pragma once

// Wi-Fi credentials
#define WIFI_SSID     ""
#define WIFI_PASSWORD ""

// Thresholds for event detection
#define SOUND_THRESHOLD 512

// Node info
#define NODE_ID       "sensor_1"

// CoAP server configuration
#define SERVER_COAP_PORT 5683
#define SERVER_URL    "/sensors"

const IPAddress SERVER_IP(192, 168, 100, 21); // Replace whenever the server IP changes