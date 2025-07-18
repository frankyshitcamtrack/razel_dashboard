const express = require('express');
const repportsRouter = express.Router();

const { httpGetHeureMoteur, httpGetHeureMoteurByParams } = require('../controllers/heuremoteur.controllers');
const { httpGetExceptions, httpGetExceptionsByParams } = require('../controllers/exceptions.controllers')
const { httpGetVehicles } = require('../controllers/vehicles.controllers')


repportsRouter.get('/heuremoteur', httpGetHeureMoteurByParams);
repportsRouter.get('/exceptions', httpGetExceptionsByParams);
repportsRouter.get('/vehicles', httpGetVehicles);




module.exports = repportsRouter;
