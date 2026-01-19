# IOT_project-Environment-Safety-Monitor

Vlad-Mihail TEODOROIU

Reads environmental data (ex: air pressure, gas presence, vibration, ambient noise) and sends it to a web page for viewing. If it detects abnormalities (ex: gas leak, earthquake, "booms") it sends a notification to the user's phone.

---
## Intro

We will be using two detector-probe-devices, to showcase the ability to gather data from multiple locations and for the end user to be able to identify where the warning is coming from.
As such, we need to be able to:
- have devices that are able to stay operational for extensive periods of time
- record relevant data
- send the relevant data to a central "hub"
- communicate with the user's device to display data and warn them about anomalous activities

Device staying operational, two options:
- be plugged in
- battery

What we will need to monitor:
- temperature
- humidity
- pressure
- air quality
- movement
- sound


---

## Hardware

For the nodes / detector probes, we will need an ESP32 board, and then the detectors.
We will be using the following detectors:
- BMP180: temperature and pressure
- HR202: humidity
- MQ-7: air quality, specifically carbon monoxide
- 0104110000000347: movement
- 0104110000082152: sound

Connected to the board as such:
**Figure 1:** Diagram of sensors connected to the board
![ProbeDiagram](images/NodeDiagram.png)


| # | Component                         | Model                        | Quantity | Notes |
|---|-----------------------------------|------------------------------|----------|-------|
| 1 | Microcontroller                   | ESP32-                       | 2        | Probe center |
| 2 | Temperature & Pressure Sensor     | BMP180                       | 2        | SDA & SCL |
| 3 | Humidity Sensor                   | HR202                        | 2        | Digital output |
| 4 | CO Detector                       | MQ-7                         | 2        | Analog output |
| 4 | Movement Detector                 | 0104110000000347             | 2        | Digital output |
| 4 | Sound Detector                    | 0104110000082152             | 2        | Analog output |
| 5 | Cables                            | Mico-USB                     | 2        | Programming & Power supply|
| 7 | Wires                             | Female-Female                | ~10      | Connections |
