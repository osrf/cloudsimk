'use strict';

angular.module('cloudsim.users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Global', 'Users', function ($scope, $stateParams, $location, Global, Users) {
    $scope.global = Global;

    /// Get all the users on the server.
    $scope.users = Users.query();

    /// The current page of users
    $scope.currentPage = 1;

    /// Number of users to diplay per page
    $scope.pageSize = 5;

    /// Set of selected users.
    $scope.selectedUsers = [];

    // Sort users by their username in acending order
    $scope.predicate = 'username';
    $scope.reverse = false;

    $scope.error = '';

    /////////////////////////////////////////////
    /// Callback that is used when an item in the user list is checked.
    $scope.setSelected = function(usr) {
        $scope.selectedUsers.push(usr);
    };

    /////////////////////////////////////////////
    /// Delete a user from the users collection
    $scope.deleteUser = function() {
        $scope.error = '';

        // Process each checked user
        angular.forEach($scope.selectedUsers, function(usr) {
            // Get the index in the local users array
            var idx = $scope.users.indexOf(usr);

            usr.selected = false;
            // Remove the user from the server, as long as they are not
            // deleting themselves.
            if (usr.email !== $scope.global.user.email) {
                usr.$remove(
                    function() {
                        // Remove the user from the local users list.
                        $scope.users.splice(idx, 1);
                    },
                    function(err) {
                        $scope.error = err.data;
                    }
                );
            }
            else {
                $scope.error = 'Unable to delete yourself';
            }
        });
        $scope.selectedUsers = [];
    };

    /////////////////////////////////////////////
    /// Add a user to the user collection.
    $scope.addUser = function() {
        // Make sure the person is authenticated.
        if (this.global.authenticated) {
            // Create a new user (just fill in the fields using email).
            var user = new Users({
                email: $scope.email,
                open_id: $scope.email,
                username: $scope.email,
                name: $scope.email
            });

            // Add the user to the local user list.
            $scope.users.push(user);

            // Save the user to the server.
            user.$save();

            // Clear the input form.
            $scope.email = '';
        }
        else {
            console.log('Not authenticated');
        }

        // Clear the selected users.
        // todo: clear the checkboxes.
        $scope.selectedUsers = [];
    };
}]);
