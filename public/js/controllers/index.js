'use strict';

angular.module('cloudsim.system').controller('IndexController',
    ['$scope', 'Global', function ($scope, Global) {
        $scope.global = Global;
    }
]);
