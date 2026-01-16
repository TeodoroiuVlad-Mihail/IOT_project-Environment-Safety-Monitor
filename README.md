# IOT_project-Environment-Safety-Monitor
Reads environmental data (ex: air pressure, gas presence, vibration, ambient noise) and sends it to a web page for viewing. If it detects abnormalities (ex: gas leak, earthquake, "booms") it sends a notification to the user's phone.


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

For this, we will be using the following devices:
- BMP180: temperature and pressure
- HR202: humidity
- MQ-7: air quality, specifically carbon monoxide
- 0104110000000347: movement
- 0104110000082152: sound



We will be using lab 3 for the web interface