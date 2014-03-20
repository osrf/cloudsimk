'use strict';

// Simulations service used for simulations REST endpoint
angular.module('mean.simulations').factory('Simulations', ['$resource', function($resource) {
    return $resource('simulations/:simulationId', {
        simulationId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
