'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation'),
    _ = require('lodash');


/**
 * Find Simulation by id
 */
exports.Simulation = function(req, res, next, id) {
    Simulation.load(id, function(err, Simulation) {
        if (err) return next(err);
        if (!Simulation) return next(new Error('Failed to load Simulation ' + id));
        req.Simulation = Simulation;
        next();
    });
};

/**
 * Create an Simulation
 */
exports.create = function(req, res) {

    console.log('#$@$@# create sim for user: ' + req.user);

    var simulation = new Simulation(req.body);
    simulation.user = req.user;
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

/**
 * Update a Simulation
 */
exports.update = function(req, res) {
    var Simulation = req.Simulation;

    Simulation = _.extend(Simulation, req.body);

    Simulation.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: Simulation
            });
        } else {
            res.jsonp(Simulation);
        }
    });
};

/**
 * Delete an Simulation
 */
exports.destroy = function(req, res) {
    var Simulation = req.Simulation;

    Simulation.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: Simulation
            });
        } else {
            res.jsonp(Simulation);
        }
    });
};

/**
 * Show an Simulation
 */
exports.show = function(req, res) {
    res.jsonp(req.Simulation);
};

/**
 * List of Simulations
 */
exports.all = function(req, res) {
    Simulation.find().sort('-created').populate('user', 'name username').exec(function(err, Simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(Simulations);
        }
    });
};

/**
 * List of Simulations
 */
exports.history = function(req, res) {
    Simulation.find().sort('-created').populate('user', 'name username').exec(function(err, Simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(Simulations);
        }
    });
};

