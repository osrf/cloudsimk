'use strict';

// Simulations service used for simulations REST endpoint
angular.module('cloudsim.simulations').factory('Simulations', ['$resource', function($resource) {
    return $resource('simulations', {
    }, {
        update: {
            method: 'POST'
        }
    });
}]);
