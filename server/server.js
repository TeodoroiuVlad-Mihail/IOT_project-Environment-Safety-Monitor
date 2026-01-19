// server.js

// Load environment variables from .env file
require('dotenv').config();

//For CoAP communication
const coap = require('coap');
const express = require('express');
const app = express();

// For web push notifications
const webpush = require('web-push');
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = [];

app.use(express.json());

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({});
});

function sendAlarmNotification(message) {
  // Log the alarm message
  console.log(message);

  // Prepare payload
  const payload = JSON.stringify({
    title: '!!! Environment Alert',
    body: message
  });

  // Send notification to all subscribers
  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload)
      .catch(err => console.error('Push error', err));
  });
}


// Test alarm endpoint
app.post('/test-alarm', (req, res) => {
  sendAlarmNotification('This is a test alarm!');
  res.json({ status: 'Test alarm sent' });
});

// ================= COAP POLLING =================

// Nodes configuration
const NODES = [
  {
    id: process.env.NODE1_ID,
    ip: process.env.NODE1_IP,
    port: Number(process.env.COAP_PORT)
  },
  {
    id: process.env.NODE2_ID,
    ip: process.env.NODE2_IP,
    port: Number(process.env.COAP_PORT)
  }
];

// List of sensor paths to query
const SENSOR_PATHS = [
  'sensors/temperature',
  'sensors/humidity',
  'sensors/pressure',
  'sensors/gas',
  'sensors/vibration',
  'sensors/sound'
];

const GAS_THRESHOLD = Number(process.env.GAS_THRESHOLD || 400);

// Object to store latest readings
let latestData = {};
const alarmState = {};

// Thresholds
const TEMP_THRESHOLD = Number(process.env.TEMP_THRESHOLD || 50);
const HUM_THRESHOLD = Number(process.env.HUM_THRESHOLD || 80);
const PRESSURE_LOW = Number(process.env.PRESSURE_LOW || 950);
const PRESSURE_HIGH = Number(process.env.PRESSURE_HIGH || 1050);
const SOUND_THRESHOLD = Number(process.env.SOUND_THRESHOLD || 50);

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || 5000);

// Helper to query a single sensor via CoAP GET
function querySensor(node, path) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: node.ip,
      port: node.port,
      method: 'GET',
      pathname: path,
      retrySend: 0 // disable automatic retries
    });

    req.setOption('Accept', 'text/plain');

    let data = '';
    req.on('response', (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ node: node.id, path, value: data }));
    });

    req.on('error', (err) => reject({ node: node.id, path, err }));
    req.end();
  });
}

// Periodically poll all sensors
async function pollNode(node) {
  if (!latestData[node.id]) latestData[node.id] = {};

  for (const path of SENSOR_PATHS) {
    try {
      const result = await querySensor(node, path);
      const sensor = result.path.split('/')[1]; // e.g., "temperature"
      // Convert numeric readings where appropriate
      if (['temperature', 'humidity', 'pressure', 'gas'].includes(sensor)) {
        latestData[node.id][sensor] = parseFloat(result.value);
      } else {
        latestData[node.id][sensor] = result.value === '1';
      }

      // Check thresholds for all sensors
      if (sensor === 'temperature') {
        const tempValue = latestData[node.id][sensor];
        if (tempValue > TEMP_THRESHOLD && !alarmState[`${node.id}_temp`]) {
          sendAlarmNotification(`High temperature detected at ${node.id}: ${tempValue}°C`);
          alarmState[`${node.id}_temp`] = true;
        } else if (tempValue <= TEMP_THRESHOLD) {
          alarmState[`${node.id}_temp`] = false; // reset alarm
        }
      }
      if (sensor === 'humidity') {
        const humValue = latestData[node.id][sensor];
        if (humValue > HUM_THRESHOLD && !alarmState[`${node.id}_hum`]) {
          sendAlarmNotification(`High humidity detected at ${node.id}: ${humValue}%`);
          alarmState[`${node.id}_hum`] = true;
        } else if (humValue <= HUM_THRESHOLD) {
          alarmState[`${node.id}_hum`] = false; // reset alarm
        }
      }
      if (sensor === 'pressure') {
        const presValue = latestData[node.id][sensor];
        if (presValue < PRESSURE_LOW || presValue > PRESSURE_HIGH && !alarmState[`${node.id}_pres`]) {
          sendAlarmNotification(`Abnormal pressure detected at ${node.id}: ${presValue} hPa`);
          alarmState[`${node.id}_pres`] = true;
        } else if (presValue >= PRESSURE_LOW && presValue <= PRESSURE_HIGH) {
          alarmState[`${node.id}_pres`] = false; // reset alarm
        }
      }
      if (sensor === 'gas') {
        const gasValue = latestData[node.id][sensor];
        if (gasValue > GAS_THRESHOLD && !alarmState[node.id]) {
          sendAlarmNotification(`High CO detected at ${node.id}: ${gasValue}`);
          alarmState[`${node.id}_gas`] = true;
        } else if (gasValue <= GAS_THRESHOLD) {
          alarmState[`${node.id}_gas`] = false; // reset alarm
        }
      }
      if (sensor === 'vibration') {
        const vibValue = latestData[node.id][sensor];
        if (vibValue && !alarmState[`${node.id}_vib`]) {
          sendAlarmNotification(`Vibration detected at ${node.id}`);
          alarmState[`${node.id}_vib`] = true;
        } else if (!vibValue) {
          alarmState[`${node.id}_vib`] = false; // reset alarm
        }
      }
      if (sensor === 'sound') {
        const soundValue = latestData[node.id][sensor];
        if (soundValue > SOUND_THRESHOLD && !alarmState[`${node.id}_sound`]) {
          sendAlarmNotification(`High sound level detected at ${node.id}: ${soundValue} dB`);
          alarmState[`${node.id}_sound`] = true;
        } else if (soundValue <= SOUND_THRESHOLD) {
          alarmState[`${node.id}_sound`] = false; // reset alarm
        }
      }


    } catch (err) {
      console.error(`Error querying ${err.node} ${err.path}:`, err.err.message);
      // keep old value if available, do not remove
    }



  }
}

// ===== POLL ALL NODES =====
async function pollAllNodes() {
  console.log('Polling all nodes...');
  for (const node of NODES) {
    pollNode(node); // don't await to avoid blocking other nodes
  }
}

// Poll every 5 seconds
setInterval(pollAllNodes, POLL_INTERVAL);
pollAllNodes(); // initial poll

/* ================= HTTP SERVER ================= */

// Sebve sensor data as JSON
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


const HTTP_BIND = process.env.HTTP_BIND || '0.0.0.0';

app.listen(Number(process.env.HTTP_PORT), HTTP_BIND, () => {
  console.log(`HTTP server running on http://${HTTP_BIND}:${process.env.HTTP_PORT}`);
});
