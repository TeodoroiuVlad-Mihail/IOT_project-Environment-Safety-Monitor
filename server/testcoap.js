const coap = require('coap');

const payload = JSON.stringify({
    node: "test_node",
    temperature: 25.3,
    humidity: 50,
    pressure: 1013,
    gas: 0,
    sound: 0,
    vibration: 0
});

const req = coap.request({
    hostname: 'localhost',   // or your server IP
    port: 5683,
    method: 'POST',
    pathname: '/sensors'
});

req.write(payload);

req.on('response', (res) => {
    console.log('Response:', res.code, res.payload.toString());
});

req.end();