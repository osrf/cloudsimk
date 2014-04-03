'use strict';

angular.module('cloudsim.simulations').controller('SimulationsController',
    ['$scope', '$stateParams', '$location', 'Global', 'Simulations',
    function ($scope, $stateParams, $location, Global, Simulations) {

    $scope.global = Global;

    /// All the worlds available to the user.
    // TODO: Retrieve this list from the server.
    $scope.worlds = ['Empty', 'SimpleShapes', 'PR2', 'Atlas'];

    /// All the regions available to the user.
    // TODO: Retrieve this list from the server.
    $scope.regions = ['US East', 'US West', 'Ireland'];

    /// Get all the running simulations.
    $scope.simulations = Simulations.query();

    /// The current page of console simulations
    $scope.consoleCurrentPage = 1;

    /// The current page of history simulations
    $scope.historyCurrentPage = 1;

    /// Number of simulations to diplay per page
    $scope.pageSize = 5;

    /// Array of simulations displayed in the console table
    $scope.consoleSimulations = [];

    /// Array of simulations displayed in the history table
    $scope.historySimulations = [];

    /// Launch a simulation.
    $scope.launch = function(launchWorld, launchRegion) {
        var sim = new Simulations({
            sim_id: 0,
            state: 'Launching',
            region: launchRegion,
            world: launchWorld
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

    // shutdown selected machines
    $scope.shutdownSelectedSimulations = function() {
        var currentPageSims = $scope.getPageConsoleSimulations();
        var selected = currentPageSims.filter(function(sim) {
            return sim.selected === true;
        });

        // Set the simulation state to Terminated
        for (var i = 0; i < selected.length; ++i) {
            selected[i].state = 'Terminated';
            selected[i].$update({simulationId:selected[i].sim_id});
        }
    };

    // relaunch selected machines
    $scope.relaunchSelectedSimulations = function() {
        var currentPageSims = $scope.getPageHistorySimulations();
        var selected = currentPageSims.filter(function(sim) {
            return sim.selected === true;
        });

        // launch the simulations but keep the terminated ones in history
        // TODO we should provide some feedback that new simulations are
        // launched
        for (var i = 0; i < selected.length; ++i) {
            $scope.launch(selected[i].world, selected[i].region);
            selected[i].selected = false;
        }
    };

    /// Get simulations in the current page of the console table
    $scope.getPageConsoleSimulations = function() {
        var start = ($scope.consoleCurrentPage-1) * $scope.pageSize;
        var end = start + $scope.pageSize;
        return $scope.consoleSimulations.slice(start, end);
    };

    /// Get simulations in the current page of the history table
    $scope.getPageHistorySimulations = function() {
        var start = ($scope.historyCurrentPage-1) * $scope.pageSize;
        var end = start + $scope.pageSize;
        return $scope.historySimulations.slice(start, end);
    };

    /// Get running simulations
    $scope.getConsoleSimulations = function(sim) {
        return sim.state !== 'Terminated';
    };

    /// Get terminated simulations
    $scope.getHistorySimulations = function(sim) {
        return sim.state === 'Terminated';
    };

    $scope.formatDateTime = function(dateTime)
    {
        return new Date(dateTime).toString();
    };

}]);
