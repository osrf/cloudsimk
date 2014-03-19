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
    app.get('/simulations/history', Simulations.history);

    /// DEL /simulations/history:simulationId 
    /// Delete one simulation history instance
    app.del('/simulations/history/:simulationId',
            authorization.requiresLogin, hasAuthorization, Simulations.destroy);

    /// GET /simulations/running 
    /// Return all the running simulations
    app.get('/simulations/running', Simulations.all);

    /// POST /simulations 
    /// Create a new simulation
    app.post('/simulations', authorization.requiresLogin, Simulations.create);

    /// GET /simulations/:simulationId
    /// Return properties for one simulation 
    app.get('/simulations/:simulationId', Simulations.show);

    /// PUT /simulations/:simulationId
    /// Modify one simulation
    app.put('/simulations/:simulationId',
            authorization.requiresLogin, hasAuthorization, Simulations.update);

    /// Finish with setting up the articleId param
    app.param('simulationId', Simulations.Simulation);
};
