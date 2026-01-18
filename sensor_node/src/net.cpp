// net.cpp
#include "net.h"
#include "config.h"
#include "sensors.h"

#include <WiFi.h>
#include <ArduinoJson.h>

#include <Arduino.h>
#include <WiFiUdp.h>
#include <coap-simple.h>   // hirotakaster/CoAP simple library


// UDP + CoAP objects
WiFiUDP udp;
Coap coap(udp);

COAP_TYPE coapType = COAP_TYPE(0);  // COAP_TYPE_CON;
COAP_METHOD coapMethod = COAP_METHOD(2);  // COAP_METHOD_POST;
COAP_CONTENT_TYPE coapContentType = COAP_CONTENT_TYPE(50); // COAP_CONTENT_TYPE_APPLICATION_JSON;

void onCoapResponse(CoapPacket &packet, IPAddress ip, int port) {
    Serial.print("CoAP response from ");
    Serial.println(ip);
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

    // Send CoAP POST to server
    Serial.println("Sending CoAP POST with payload:");
    Serial.println(payload);
    coap.send(
        SERVER_IP,
        SERVER_COAP_PORT,
        SERVER_URL,
        coapType,
        coapMethod,
        NULL,
        0,
        (const uint8_t*)payload,
        strlen(payload),
        coapContentType
    );
}


void netLoop() {
    coap.loop();
}
