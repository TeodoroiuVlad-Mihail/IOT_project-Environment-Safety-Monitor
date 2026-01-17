// net.cpp
#include "net.h"
#include "config.h"
#include "sensors.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include <Arduino.h>
#include <WiFiUdp.h>
#include <coap-simple.h>   // hirotakaster/CoAP simple library


// UDP + CoAP objects
WiFiUDP udp;
Coap coap(udp);


void onCoapResponse(CoapPacket &packet, IPAddress ip, int port) {
    // You can just print response for now
    Serial.print("CoAP response from "); Serial.println(ip);
}

void initWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(300);
        Serial.print('.');
    }
    Serial.println();
    Serial.print(F("Wi-Fi OK. IP: "));
    Serial.println(WiFi.localIP());

      // Bind UDP so we can receive responses (use standard CoAP port or 0 for ephemeral)
    udp.begin(5683);
    
    // Register response handler and start CoAP
    coap.response(onCoapResponse);
    coap.start();
}

void sendData(const SensorData& data) {
    if (WiFi.status() != WL_CONNECTED) {
        return;
    }

    StaticJsonDocument<256> doc;

    doc["node"]        = NODE_ID;
    doc["temperature"] = data.temperature;
    doc["humidity"]    = data.humidity;
    doc["pressure"]    = data.pressure;
    doc["gas"]         = data.gas;
    doc["sound"]       = data.sound;
    doc["vibration"]   = data.vibration;

    char payload[256];
    serializeJson(doc, payload);

    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    http.POST(payload);
    http.end();
}


void netLoop() {
    coap.loop();
}
