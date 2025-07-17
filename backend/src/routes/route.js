const express = require('express');
const repportsRouter = express.Router();

const { httpGetHeureMoteur } = require('../controllers/heuremoteur.controllers');
const { httpGetExceptions } = require('../controllers/exceptions.controllers')
const { httpGetVehicles } = require('../controllers/vehicles.controllers')


repportsRouter.get('/heuremoteur', httpGetHeureMoteur);
repportsRouter.get('/exeptions', httpGetExceptions);
repportsRouter.get('/vehicles', httpGetVehicles);




module.exports = repportsRouter;
