const express = require('express')

const repportsRouter = require('./route')

const api = express();

api.use('/razel_dashboard', repportsRouter);


module.exports = api;
