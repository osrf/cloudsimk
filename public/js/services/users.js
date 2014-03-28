'use strict';

// Users service used for users REST endpoint
angular.module('cloudsim').factory('Users', ['$resource', function($resource) {
    return $resource('users/:userId', {}, {
        query:  {method: 'GET', params:{userId:''}, isArray: true},
        post:   {method: 'POST'},
        update: {method: 'PUT', params: {userId: '@userId'}},
        remove: {method: 'DELETE', params: {userId: '@open_id'}}
    });
}]);
