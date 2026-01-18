// server.js

const coap = require('coap');
const express = require('express');
const app = express();

let latestData = null;

/* ================= COAP SERVER ================= */

const coapServer = coap.createServer();

coapServer.on('request', (req, res) => {
  console.log(`CoAP ${req.method} request for ${req.url}`);
  console.log(`Payload: ${req.payload.toString()}`);


  if (req.method === 'POST' && req.url === '/sensors') {
    try {
      latestData = JSON.parse(req.payload.toString());
      console.log('Received CoAP data:', latestData);
      res.end('OK');
    } catch (e) {
      res.code = '5.00';
      res.end('Invalid JSON');
    }
  } else {
    res.code = '4.04';
    res.end();
  }
});

coapServer.listen(5683, '0.0.0.0', () => {
  console.log('CoAP server listening on port 5683');
});

/* ================= HTTP SERVER ================= */

app.get('/sensors', (req, res) => {
  if (!latestData) {
    return res.status(404).send('No data yet');
  }
  res.json(latestData);
});


const path = require('path');

// Serve index.html and other static assets
app.use(express.static(__dirname)); // serve everything in the server folder

// Explicit route for '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(3000, '0.0.0.0', () => {
  console.log('HTTP server on http://localhost:3000');
});
