'use strict';

/////////////////////////////////////////////////
// Displays a boost-style error message
angular.module('cloudsim').directive('cloudsimAlert', function() {
    return {
       restrict: 'E',
       templateUrl: '/views/templates/alert.html'
    };
});
