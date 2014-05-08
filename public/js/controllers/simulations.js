'use strict';

angular.module('cloudsim.simulations').controller('SimulationsController',
    ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Simulations',
    'Topic',
    function ($scope, $stateParams, $location, $modal, Global, Simulations,
    Topic) {

    $scope.global = Global;

    /// All the worlds available to the user.
    // TODO: Retrieve this list from the server.
    $scope.worlds = ['Empty', 'SimpleShapes', 'PR2', 'Atlas'];

    /// All the regions available to the user.
    // TODO: Retrieve this list from the server.
    $scope.regions = ['US East', 'US West', 'Ireland'];

    /// Get all simulations and update up time.
    $scope.simulations = Simulations.query(function() {
        updateUpTime();
    });

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

    $scope.tableType = {
        console : 0,
        history : 1
    };

    // server time
    $scope.serverTime = window.server_time;

    /// A modal confirmation dialog displayed when the shutdown button
    /// is pressed
    var shutdownDialog = null;

    /// A modal confirmation dialog displayed when the relaunch button
    /// is pressed
    var relaunchDialog = null;

    /// A modal confirmation dialog displayed when the delete forever button
    /// is pressed
    var deleteForeverDialog = null;

    /// Error messessage
    $scope.error = '';

    /// Launch a simulation.
    $scope.launch = function(launchWorld, launchRegion) {
        var sim = new Simulations({
            state: 'Launching',
            region: launchRegion,
            world: launchWorld
        });

        sim.$save(function() {},
            function(error) {
                $scope.error = 'Error launching simulation: ' + error.data;
                sim.state = 'Error';
            });
        sim.selected = false;
        sim.upTime = '00:00:00';
    };

    /// Pop up a dialog to confirm shutting down a simulation
    $scope.showShutdownDialog = function () {
        shutdownDialog = $modal.open({
            templateUrl: 'shutdown.html',
            controller: shutdownDialogCtrl
        });

        // if the user confirms shutting down simulation
        shutdownDialog.result.then(function () {
            var currentPageSims =
                $scope.getPageSimulations($scope.tableType.console);
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

    /// Pop up a dialog to confirm relaunching a terminated simulation
    $scope.showRelaunchDialog = function () {
        relaunchDialog = $modal.open({
            templateUrl: 'relaunch.html',
            controller: relaunchDialogCtrl
        });

        // if the user confirms relaunching the simulation
        relaunchDialog.result.then(function () {
            var currentPageSims =
                $scope.getPageSimulations($scope.tableType.history);
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
        },
        // if the user cancels relaunching simulation
        function () {});
    };

    /// A controller for closing / dimissing the relaunch dialog
    var relaunchDialogCtrl = function ($scope, $modalInstance) {
        $scope.confirmRelaunch = function (relaunch) {
            if (relaunch) {
                $modalInstance.close();
            }
            else {
                $modalInstance.dismiss();
            }
        };
    };

    /// Pop up a dialog to confirm deleting a terminated simulation
    /// from history forever
    $scope.showDeleteForeverDialog = function () {
        deleteForeverDialog = $modal.open({
            templateUrl: 'deleteForever.html',
            controller: deleteForeverDialogCtrl
        });

        // if the user confirms deleting the terminated simulation
        deleteForeverDialog.result.then(function () {
            var currentPageSims =
                $scope.getPageSimulations($scope.tableType.history);
            var selected = currentPageSims.filter(function(sim) {
                return sim.selected === true;
            });

            // send a DELETE to remove the simulation from the database
            for (var i = 0; i < selected.length; ++i) {
                $scope.simulations.splice(
                    $scope.simulations.indexOf(selected[i]), 1);
                selected[i].$remove({simulationId:selected[i].sim_id});
            }
        },
        // if the user cancels deleting terminated simulation
        function () {});
    };

    /// A controller for closing / dimissing the delete forever dialog
    var deleteForeverDialogCtrl = function ($scope, $modalInstance) {
        $scope.confirmDeleteForever = function (del) {
            if (del) {
                $modalInstance.close();
            }
            else {
                $modalInstance.dismiss();
            }
        };
    };

    /// Get simulations in the current page of the table
    $scope.getPageSimulations = function(type) {
        var currentPage;
        var simulations;
        if (type === $scope.tableType.console) {
            currentPage = $scope.consoleCurrentPage;
            simulations = $scope.consoleSimulations;
        }
        else if (type === $scope.tableType.history) {
            currentPage = $scope.historyCurrentPage;
            simulations = $scope.historySimulations;
        }
        var start = (currentPage-1) * $scope.pageSize;
        var end = start + $scope.pageSize;
        return simulations.slice(start, end);
    };

    /// Get running simulations
    $scope.getConsoleSimulations = function(sim) {
        return sim.state !== 'Terminated';
    };

    /// Get terminated simulations
    $scope.getHistorySimulations = function(sim) {
        return sim.state === 'Terminated';
    };

    /// Select all simulations in the current page of the table
    $scope.selectPageSimulations = function(type) {
        var selected = !$scope.getAllPageSimulationsSelected(type);
        var simulations = $scope.getPageSimulations(type);
        for (var i = 0; i < simulations.length; ++i) {
            simulations[i].selected = selected;
        }
    };

    /// Check if all simulations in the current page of the table are selected
    $scope.getAllPageSimulationsSelected = function(type) {
        var simulations = $scope.getPageSimulations(type);
        if (simulations.length > 0) {
            var selectedSimulations = simulations.filter(function(sim) {
                return sim.selected === true;
            });
            if (selectedSimulations.length === simulations.length)
                return true;
            return false;
        }
        return false;
    };

    /// Get an array of selected simulations in the current page.
    $scope.getPageSimulationsSelected = function(type) {
        var simulations = $scope.getPageSimulations(type);
        if (simulations.length > 0) {
            var selectedSimulations = simulations.filter(function(sim) {
                return sim.selected === true;
            });
            return selectedSimulations;
        }
        return simulations;
    };

    /// Get time as a string
    $scope.formatDateTime = function(dateTime) {
        return new Date(dateTime).toString();
    };

    // Subscribe to simulation_create topic
    var simulationCreateTopic = new Topic();
    simulationCreateTopic.subscribe('simulation_create', function(message) {
        var newSim = message.data;
        var sim = new Simulations({
            sim_id: newSim.sim_id,
            state: newSim.state,
            region: newSim.region,
            world: newSim.world,
            date_launch: newSim.date_launch,
            upTime: '00:00:00'
        });
        $scope.$apply(function() {
            $scope.simulations.unshift(sim);
        });
    });

    // Subscribe to simulation_terminate topic
    var simulationTerminateTopic = new Topic();
    simulationTerminateTopic.subscribe('simulation_terminate',
    function(message) {
        var termSim = message.data;
        // find the terminated sim in the table
        var terminated = $scope.simulations.filter(function(sim) {
            return sim.sim_id === termSim.sim_id;
        });
        if (terminated.length === 1)
        {
            $scope.$apply(function() {
                terminated[0].state = 'Terminated';
                terminated[0].date_term = termSim.date_term;
                var uptime = new Date(terminated[0].date_term) -
                    new Date(terminated[0].date_launch);
                terminated[0].upTime = formatTimeElapsed(uptime*1e-3);
                //updateUpTime(terminated[0]);
            });
        }
    });

    // Subscribe to simulation_update topic
    var simulationUpdateTopic = new Topic();
    simulationUpdateTopic.subscribe('simulation_update', function(message) {
      var updatedSim = message.data;
      // find the updated sim in the table
      var updated = $scope.simulations.filter(function(sim) {
          return sim.sim_id === updatedSim.sim_id;
      });
      if (updated.length === 1)
      {
          $scope.$apply(function() {
              updated[0].state = updatedSim.state;
              updated[0].machine_ip = updatedSim.machine_ip;
          });
      }
    });

    // update the simulation up time
    var updateUpTime = function(type) {
        var filtered = $scope.simulations.filter(function(sim) {
            if (type === $scope.tableType.console)
              return !sim.date_term;
            else if (type === $scope.tableType.history)
              return sim.date_term;
            else return true;
        });

        // calculate uptime
        for (var i = 0; i < filtered.length; ++i) {
            var serverLaunch = new Date(filtered[i].date_launch);
            var uptime;
            if (filtered[i].date_term)
                uptime = new Date(filtered[i].date_term) - serverLaunch;
            else
                uptime = $scope.serverTime - serverLaunch;
            filtered[i].upTime = formatTimeElapsed(uptime*1e-3);
        }
    };

    // Subscribe to clock topic
    var simulationClockTopic = new Topic();
    simulationClockTopic.subscribe('clock', function(message) {
        var time = message.data;
        $scope.serverTime = new Date(time);

        $scope.$apply(function() {
            updateUpTime($scope.tableType.console);
        });
    });

    // format elapsed time in seconds into a friendly string
    var formatTimeElapsed = function(time)
    {
        var sec = time;

        var day = Math.floor(sec / 86400);
        sec -= day * 86400;

        var hour = Math.floor(sec / 3600);
        sec -= hour * 3600;

        var minute = Math.floor(sec / 60);
        sec -= minute * 60;

        var timeValue = '';

        if (hour < 10)
        {
          timeValue += '0';
        }
        timeValue += hour.toFixed(0) + ':';
        if (minute < 10)
        {
          timeValue += '0';
        }
        timeValue += minute.toFixed(0) + ':';
        if (sec < 10)
        {
          timeValue += '0';
        }
        timeValue += sec.toFixed(0);

        return timeValue;
    };
}]);
