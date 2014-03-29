'use strict';

angular.module('cloudsim.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', 'Global', 'Simulations', function ($scope, $stateParams, $location, Global, Simulations) {
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

    /// A modal confirmation dialog displayed when the the shutdown button
    /// is pressed
    var shutdownDialog = null;

    /// Launch a simulation.
    $scope.launch = function() {
        var sim = new Simulations({
            sim_id: 0,
            state: 'Launching',
            region: $scope.launch.region,
            world: $scope.launch.world
        });
        sim.$save();
        sim.selected = false;
        $scope.simulations.unshift(sim);
    };

    /// Pop up a dialog to confirm shutting down a simulation
    $scope.showShutdownDialog = function () {
        shutdownDialog = $modal.open({
            templateUrl: 'shutdown.html',
            controller: shutdownDialogCtrl
        });

        // if the user confirms shutting down simulation
        shutdownDialog.result.then(function () {
            var currentPageSims = $scope.getPageSimulations();
            var selected = currentPageSims.filter(function(sim) {
                return sim.selected === true;
            });

            // Set the simulation state to Terminated
            for (var i = 0; i < selected.length; ++i) {
                selected[i].state = 'Terminated';
                selected[i].$update({simulationId:selected[i].sim_id});
            }
        },
        // if the user cancels shutting down simulation
        function () {});
    };

    /// Get simulations in the current page of the table
    $scope.getPageSimulations = function() {
        var start = ($scope.currentPage-1)*$scope.simPerPage;
        var end = start + $scope.simPerPage;
        return $scope.simulations.slice(start, end);
    };


    /// A controller for closing dimissing the shutdown dialog
    var shutdownDialogCtrl = function ($scope, $modalInstance) {
        $scope.confirmShutdown = function (terminate) {
            if (terminate) {
                $modalInstance.close();
            }
            else {
                $modalInstance.dismiss();
            }
        };
    };

}]);
