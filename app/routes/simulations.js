'use strict';

// Simulations routes use Simulations controller
var Simulations = require('../controllers/simulations');
var authorization = require('./middlewares/authorization');

// Simulation authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.simulation.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

    /// GET /simulations/history
    /// Return the simulation history for the user
    app.get('/simulations/history',
        authorization.requiresLogin, Simulations.history);

    /// DEL /simulations/history:simulationId
    /// Delete one simulation history instance
    app.del('/simulations/history/:simulationId',
        authorization.requiresLogin, hasAuthorization, Simulations.destroy);

    /// GET /simulations
    /// Return all the simulations, running and terminated
    app.get('/simulations',
        authorization.requiresLogin, Simulations.all);

    /// GET /simulations/running
    /// Return all the running simulations
    app.get('/simulations/running',
        authorization.requiresLogin, Simulations.running);

    /// POST /simulations
    /// Create a new simulation
    app.post('/simulations',
        authorization.requiresLogin, Simulations.create);

    /// DEL /simulations/running/:simulationId
    /// Terminate one running simulation instance
    app.del('/simulations/running/:simulationId',
        authorization.requiresLogin, hasAuthorization, Simulations.terminate);

    /// GET /simulations/:simulationId
    /// Return properties for one simulation
    app.get('/simulations/:simulationId',
        authorization.requiresLogin, Simulations.show);

    /// PUT /simulations/:simulationId
    /// Modify one simulation
    app.put('/simulations/:simulationId',
        authorization.requiresLogin, hasAuthorization, Simulations.update);

    /// Finish with setting up the simulationId param
    app.param('simulationId', Simulations.simulation);
};
