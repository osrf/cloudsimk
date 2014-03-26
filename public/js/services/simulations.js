'use strict';

// Simulations service used for simulations REST endpoint
angular.module('cloudsim.simulations').factory('Simulations', ['$resource', function($resource) {
    return $resource('simulations/:simulationId', {}, {
        query:  {method: 'GET', params:{simulationId:''}, isArray: true},
        post:   {method: 'POST'},
        update: {method: 'PUT', params: {simulationId: '@simulationId'}},
        remove: {method: 'DELETE'}
    });
}]);
