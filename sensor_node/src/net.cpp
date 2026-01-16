#include "net.h"
#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>

void initWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
}

void sendData(const SensorData& data) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    // build JSON...
    http.POST("{}");
    http.end();
}
