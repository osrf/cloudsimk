'use strict';
/// @module simulation_controller
/// Server side simulation controller.


/// Module dependencies.
var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    _ = require('lodash');


/////////////////////////////////////////////////
/// Find Simulation by id
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @param[in] next The next Nodejs function to be executed.
/// @param[in] id ID of the simulation instance to retrieve.
/// @return Simulation instance retrieval function.
exports.simulation = function(req, res, next, id) {

    // Load a simulation model based on the given id
    Simulation.loadBySimId(req.user.id, id, function(err, simulation) {
        // in case of error, hand it over to the next middleware
        if (err) return next(err);

        // If a simulation instance was not found, then return an error
        if (!simulation) {
            return next(new Error('Failed to load simulation ' + id));
        }

        // Add the new simulation to the request object
        // for future reference
        req.simulation = simulation;

        // hand over control to the next middleware
        next();
    });
};

/////////////////////////////////////////////////
/// Create a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Simulation create function.
exports.create = function(req, res) {

    // Create a new simulation instance based on the content of the
    // request
    var simulation = new Simulation(req.body);

    // Set the simulation user
    simulation.user = req.user;

    User.load(req.user.id, function(err, user) {

        simulation.sim_id = user.next_sim_id++;
        // Save the simulation instance to the database
        simulation.save(function(err) {
            if (err) {
                return res.send('users/signup', {
                    errors: err.errors,
                    Simulation: simulation
                });
            } else {
                user.save(function(err) {
                    if (err) {
                        return res.send('users/signup', {
                            errors: err.errors,
                            Simulation: simulation
                        });
                    } else {
                        res.jsonp(simulation);
                    }
                });
            }
        });
    });
};

/////////////////////////////////////////////////
/// Update a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object
/// @return Simulation update function.
exports.update = function(req, res) {

    /* Get the simulation from the request */
    var simulation = req.simulation;

    /* use the lodash library to populate each
     * simulation attribute with the values in the
     * request body
     */
    simulation = _.extend(Simulation, req.body);

    /* Save the updated simulation to the database */
    simulation.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
        }
    });
};

/////////////////////////////////////////////////
/// Delete a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Destroy function
exports.destroy = function(req, res) {

    // Get the simulation model
    var simulation = req.simulation;

    // Remove the simulation model from the database
    // TODO: We need to check to make sure the simulation instance has been
    // terminated
    simulation.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
        }
    });
};

/////////////////////////////////////////////////
/// Terminate a running simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Destroy function
exports.terminate = function(req, res) {

    // Get the simulation model
    var simulation = req.simulation;

    simulation.state = 'Terminated';
    simulation.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
        }
    });
};

/////////////////////////////////////////////////
/// Show an simulation.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.show = function(req, res) {
    res.jsonp(req.simulation);
};

/////////////////////////////////////////////////
/// List of simulations for a user.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to get all simulation instances for a user.
exports.all = function(req, res) {
    // Get all simulation models, in creation order, for a user
    Simulation.find().sort('-created').populate('user', 'name username')
      .exec(function(err, simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(simulations);
        }
    });
};

/////////////////////////////////////////////////
/// List of running simulations for a user.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to get all simulation instances for a user.
exports.running = function(req, res) {
    // Get all running simulation models, in creation order, for a user
    Simulation.find({state: {$ne: 'terminated'}}).sort('-created').populate('user', 'name username')
      .exec(function(err, simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(simulations);
        }
    });
};

/////////////////////////////////////////////////
/// List of simulations
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.history = function(req, res) {
    Simulation.find({state: 'terminated'}).sort('-created').populate('user', 'name username')
      .exec(function(err, simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(simulations);
        }
    });
};
