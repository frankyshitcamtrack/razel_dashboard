const https = require('https');
const http = require("http");
const fs = require('fs');

require('dotenv').config();

const app = require('./app');

//locale
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

//production
//const PORT = process.env.PORT || 8443;

/*const options = {
  key: fs.readFileSync('./ssl/privkey19.pem'),
  cert: fs.readFileSync('./ssl/cert19.pem'),
  ca: fs.readFileSync('./ssl/fullchain19.pem'),
};

const server = https.createServer(options, app);*/

async function startServer() {
  server.listen(PORT, () =>
    console.log(`App is listening to port ${PORT}`)
  );
}

startServer();
