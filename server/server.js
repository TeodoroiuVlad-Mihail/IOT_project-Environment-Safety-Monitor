// server.js

const coap = require('coap');
const express = require('express');
const app = express();


// Nodes configuration
const NODES = [
  { id: 'node1', ip: '192.168.100.41', port: 5683 },
  { id: 'node2', ip: '192.168.100.42', port: 5683 }
];
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
setInterval(pollAllNodes, 5000);
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

app.listen(3000, '0.0.0.0', () => {
  console.log('HTTP server running on http://localhost:3000');
});
