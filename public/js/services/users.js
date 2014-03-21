'use strict';

// Users service used for users REST endpoint
angular.module('cloudsim.users').factory('Users', ['$resource', function($resource) {
    return $resource('users', {
    }, {
        update: {
            method: 'POST'
        }
    });
}]);
