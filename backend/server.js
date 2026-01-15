const https = require('https');
const http = require("http");
const fs = require('fs');

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 10000;
let server;

if (process.env.NODE_ENV === 'production') {
  // Render handles SSL, use HTTP
  server = http.createServer(app);
} else {
  // Local development with HTTPS
  const options = {
    key: fs.readFileSync('./ssl/privkey19.pem'),
    cert: fs.readFileSync('./ssl/cert19.pem'),
    ca: fs.readFileSync('./ssl/fullchain19.pem'),
  };
  server = https.createServer(options, app);
}

async function startServer() {
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`App is listening to port ${PORT}`)
  );
}

startServer();
