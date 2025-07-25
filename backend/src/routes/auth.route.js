const express = require('express');
const authRouter = express.Router();

const { login, checkAuth } = require('../controllers/auth.controllers');
const { authenticateJWT } = require('../midleware/auth')


authRouter.post('/login', login);
authRouter.get('/check-auth', authenticateJWT, checkAuth);

module.exports = authRouter