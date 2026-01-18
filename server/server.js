// server.js

const coap = require('coap');
const express = require('express');
const app = express();

const ESP32_IP = '192.168.100.41'; // esp ip
const COAP_PORT = 5683;

// List of sensor paths to query
const SENSOR_PATHS = [
  'sensors/temperature',
  'sensors/humidity',
  'sensors/pressure',
  'sensors/gas',
  'sensors/vibration',
  'sensors/sound'
];

// Object to store latest readings
let latestData = {};

// Helper to query a single sensor via CoAP GET
function querySensor(path) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: ESP32_IP,
      port: COAP_PORT,
      method: 'GET',
      pathname: path,
      retrySend: 0 // disable automatic retries
    });

    req.setOption('Accept', 'text/plain');

    let data = '';
    req.on('response', (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ path, value: data }));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

// Periodically poll all sensors
async function pollSensors() {
  console.log('Polling sensors...');
  for (const path of SENSOR_PATHS) {
    try {
      const result = await querySensor(path);
      // Convert numeric readings where appropriate
      if (['temperature','humidity','pressure','gas'].includes(result.path.split('/')[1])) {
        latestData[result.path.split('/')[1]] = parseFloat(result.value);
      } else {
        latestData[result.path.split('/')[1]] = result.value === '1';
      }
    } catch (err) {
      console.error(`Error querying ${path}:`, err.message);
    }
  }
}

// Poll sensors every 5 seconds
setInterval(pollSensors, 5000);
pollSensors(); // initial poll

/* ================= HTTP SERVER ================= */

app.get('/sensors', (req, res) => {
  if (!Object.keys(latestData).length) {
    return res.status(404).send('No data yet');
  }
  res.json(latestData);
});

// Serve static files (index.html, etc.)
const path = require('path');
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log('HTTP server running on http://localhost:3000');
});
