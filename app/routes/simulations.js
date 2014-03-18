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


    app.get('/simulations/history', Simulations.history);
    app.del('/simulations/history/:simulationId', authorization.requiresLogin, hasAuthorization, Simulations.destroy);

    app.get('/simulations/running', Simulations.all);
    app.post('/simulations/running/', authorization.requiresLogin, Simulations.create);
    app.get('/simulations//:simulationId', Simulations.show);
    app.put('/simulations/:simulationId', authorization.requiresLogin, hasAuthorization, Simulations.update);

    // Finish with setting up the articleId param
    app.param('simulationId', Simulations.Simulation);

};
