'use strict';

angular.module('cloudsim.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{
    }, {
    }];

    $scope.isCollapsed = false;
}]);
