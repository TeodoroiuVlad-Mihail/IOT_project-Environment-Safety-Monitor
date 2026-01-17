// server.js

const express = require('express');
const coap = require('coap');
const app = express();
app.use(express.json());

const COAP_HOST = '10.41.175.140'; // ESP32 IP
const COAP_PORT = 5683;

// GET /coap?path=/led
app.get('/coap', (req, res) => {
  const path = req.query.path;
  const reqCoap = coap.request(`coap://${COAP_HOST}:${COAP_PORT}${path}`);
  reqCoap.on('response', (coapRes) => {
    let data = '';
    coapRes.on('data', chunk => data += chunk);
    coapRes.on('end', () => res.send(data));
  });
  reqCoap.end();
});

// POST /coap (with JSON {path: "/led", payload: "on"})
app.post('/coap', (req, res) => {
  const { path, payload } = req.body;
  const reqCoap = coap.request({
    hostname: COAP_HOST,
    port: COAP_PORT,
    method: 'PUT',
    pathname: path
  });
  reqCoap.write(payload);
  reqCoap.on('response', coapRes => {
    let data = '';
    coapRes.on('data', chunk => data += chunk);
    coapRes.on('end', () => res.send(data));
  });
  reqCoap.end();
});

// Echo route (POST)
app.post('/echo', (req, res) => {
  const { message } = req.body;
  res.send(`Echo: ${message}`);
});

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/sensors', (req, res) => {
  const reqCoap = coap.request(`coap://${COAP_HOST}:${COAP_PORT}/sensors`);

  reqCoap.on('response', coapRes => {
    let data = '';
    coapRes.on('data', chunk => data += chunk);
    coapRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).send('Invalid JSON from sensor');
      }
    });
  });

  reqCoap.on('error', err => {
    res.status(500).send(err.message);
  });

  reqCoap.end();
});




app.listen(3000, () => console.log('HTTP-CoAP proxy on http://localhost:3000'));
