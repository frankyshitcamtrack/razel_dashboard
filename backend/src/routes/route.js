const express = require('express');
const repportsRouter = express.Router();

const { httpGetHeureMoteur, httpGetHeureMoteurByParams } = require('../controllers/heuremoteur.controllers');
const { httpGetExceptions, httpGetExceptionsByParams } = require('../controllers/exceptions.controllers');
const { httpGetVehicles, httpGetVehicleById } = require('../controllers/vehicles.controllers');
const { httpGetVehiclesGroup, httpGetVehiclesGroupByID } = require('../controllers/vehiclegroup.controllers');
const { httpGetbases } = require('../controllers/base.controllers');
const { httpGettransitbase, httpGetTransitDashboards } = require('../controllers/transitbase.controllers');
const { httpGetTrajet, httpGetTrajetsByParams } = require('../controllers/trajet.controllers');


repportsRouter.get('/heuremoteur', httpGetHeureMoteurByParams);
repportsRouter.get('/list_heuremoteur', httpGetHeureMoteur);

repportsRouter.get('/exceptions', httpGetExceptionsByParams);
repportsRouter.get('/list_exceptions', httpGetExceptions);

repportsRouter.get('/vehicles', httpGetVehicles);
repportsRouter.get('/single_vehicle', httpGetVehicleById);

repportsRouter.get('/vehicles_group', httpGetVehiclesGroup);
repportsRouter.get('/single_vehicle_group', httpGetVehiclesGroupByID);

repportsRouter.get('/bases', httpGetbases);
repportsRouter.get('/transit', httpGettransitbase);
repportsRouter.get('/transit_dashboard', httpGetTransitDashboards);

//repportsRouter.get('/trajet', httpGetTrajet);
repportsRouter.get('/trajets', httpGetTrajetsByParams);



module.exports = repportsRouter;



