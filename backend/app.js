const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const api = require('./src/routes/api');

app.use(morgan('combined'));

app.use(cors());

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.use('/api', api);

app.set('etag', 'strong');

app.use(express.static(path.join(__dirname + '/public')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

module.exports = app;
