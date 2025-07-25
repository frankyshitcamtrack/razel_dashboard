const express = require('express');
const repportsRouter = express.Router();

const { httpGetHeureMoteur, httpGetHeureMoteurByParams } = require('../controllers/heuremoteur.controllers');
const { httpGetExceptions, httpGetExceptionsByParams } = require('../controllers/exceptions.controllers')
const { httpGetVehicles } = require('../controllers/vehicles.controllers')
const { login, checkAuth } = require('../controllers/auth.controllers');


repportsRouter.get('/heuremoteur', httpGetHeureMoteurByParams);
repportsRouter.get('/exceptions', httpGetExceptionsByParams);
repportsRouter.get('/vehicles', httpGetVehicles);
repportsRouter.post('/login', login);
repportsRouter.get('/check-auth', checkAuth);



module.exports = repportsRouter;
