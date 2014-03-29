'use strict';

angular.module('mean.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', 'Global', 'Simulations', function ($scope, $stateParams, $location, Global, Simulations) {
    $scope.global = Global;

    /// All the worlds available to the user.
    // TODO: Retrieve this list from the server.
    $scope.worlds = ['Empty', 'SimpleShapes', 'PR2', 'Atlas'];

    /// All the regions available to the user.
    // TODO: Retrieve this list from the server.
    $scope.regions = ['US East', 'US West', 'Ireland'];

    /// Get all the running simulations.
    $scope.simulations = Simulations.query();

    /// The current page of simulations
    $scope.currentPage = 1;

    /// Number of simulations to diplay per page
    $scope.simPerPage = 5;

    /// Launch a simulation.
    $scope.launch = function() {
        var sim = new Simulations({
            sim_id: 0,
            state: 'Launching',
            region: $scope.launch.region,
            world: $scope.launch.world
        });
        sim.$save(function(response) {
                console.log('your response: ' + response);
            }, function(error) {
                console.log('your error: ' + error);
                alert('AWS error: ' + error.data.error.message);
            });
        sim.selected = false;  
        $scope.simulations.unshift(sim);
    };
}]);
