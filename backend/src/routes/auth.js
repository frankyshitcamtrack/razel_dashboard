const express = require('express')

const authRouter = require('./auth.route')

const auth = express();

auth.use('/secure', authRouter);


module.exports = auth;




