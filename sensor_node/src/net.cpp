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

// Helper to reply to CoAP GET
void coapSendText(IPAddress ip, int port, CoapPacket &req, const char* text) {
    coap.sendResponse(ip, port, req.messageid,
                      text, strlen(text),
                      COAP_RESPONSE_CODE(205), // 2.05 Content
                      COAP_TEXT_PLAIN,
                      req.token, req.tokenlen);
}

// Sensor resource handlers
void h_temperature(CoapPacket &packet, IPAddress ip, int port) {
    char buf[16];
    snprintf(buf, sizeof(buf), "%.2f", readTemperature());
    coapSendText(ip, port, packet, buf);
}

void h_humidity(CoapPacket &packet, IPAddress ip, int port) {
    char buf[16];
    snprintf(buf, sizeof(buf), "%.2f", readHumidity());
    coapSendText(ip, port, packet, buf);
}

void h_pressure(CoapPacket &packet, IPAddress ip, int port) {
    char buf[16];
    snprintf(buf, sizeof(buf), "%.2f", readPressure());
    coapSendText(ip, port, packet, buf);
}

void h_gas(CoapPacket &packet, IPAddress ip, int port) {
    char buf[16];
    snprintf(buf, sizeof(buf), "%d", readGas());
    coapSendText(ip, port, packet, buf);
}

void h_vibration(CoapPacket &packet, IPAddress ip, int port) {
    coapSendText(ip, port, packet, detectVibration() ? "1" : "0");
}

void h_sound(CoapPacket &packet, IPAddress ip, int port) {
    coapSendText(ip, port, packet, detectSound() ? "1" : "0");
}

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

    // Bind UDP so we can receive responses
    udp.begin(5683);
    
    // Register response handler and start CoAP
    coap.response(onCoapResponse);
    coap.start();

    coap.server(h_temperature, "sensors/temperature");
    coap.server(h_humidity,    "sensors/humidity");
    coap.server(h_pressure,    "sensors/pressure");
    coap.server(h_gas,         "sensors/gas");
    coap.server(h_vibration,   "sensors/vibration");
    coap.server(h_sound,       "sensors/sound");

    Serial.println("CoAP server ready.");
}

void netLoop() {
    coap.loop();
}
