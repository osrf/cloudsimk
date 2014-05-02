'use strict';

angular.module('cloudsim.users').controller('UsersController', ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Users', function ($scope, $stateParams, $location, $modal, Global, Users) {
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

    $scope.search = '';

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

    /////////////////////////////////////////////
    /// @brief A function that opens the add user modal.
    $scope.openAddUserModal = function() {
        var template = 'views/users/admin_add_user_modal.html';

        // Make sure the person is authenticated.
        if (this.global.authenticated) {
            // Open the modal, and pass in (resolve) some values.
            var modalInstance = $modal.open({
                templateUrl: template,
                controller: AddUserModalCtrl,
                resolve: {
                  users: function() {return $scope.users;}
                }
            });

            // Wait for the modal to be closed/canceled.
            modalInstance.result.then(function (email) {
                  // Create a new user (just fill in the fields using email).
                  var user = new Users({
                    email: email,
                      open_id: email,
                      username: email,
                      name: email
                  });

                  // Add the user to the local user list.
                  $scope.users.push(user);

                  // Save the user to the server.
                  user.$save();
        
            }, function () {
                // Do nothing when the modal is dismissed.
            });
        }
        else {
            console.log('Not authenticated');
        }
    };

    /////////////////////////////////////////////
    /// Controller for the add/edit ssh key modal
    var AddUserModalCtrl = function($scope, $modalInstance, users) {
        // The ok function is called when the modal form is
        // submitted.
        $scope.ok = function(form) {
            var unique = true;

            // Check that the email is uniqu
            angular.forEach(users, function(usr) {
                if (usr.email == form.email.$viewValue) {
                    unique = false;
                }
            });

            if (unique) {
              $modalInstance.close(form.email.$viewValue);
            } else {
              $scope.error = "Email already exists";
            }
        };

        // The cancel function is called when the modal form is 
        // closed/canceld.
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    };
}]);
