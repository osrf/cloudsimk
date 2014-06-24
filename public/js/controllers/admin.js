'use strict';

angular.module('cloudsim.admin').controller('AdminController',
    ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Users', 
    function ($scope, $stateParams, $location, $modal, Global, Users) {

    $scope.global = Global;

    /// Get all the users on the server.
    $scope.users = Users.query();

    /// The current page of users
    $scope.currentPage = 1;

    /// The array of users currently visible in the view.
    $scope.filteredUsers = [];

    /// Number of users to diplay per page
    $scope.pageSize = 5;

    // Sort users by their username in acending order
    $scope.predicate = 'username';
    $scope.reverse = false;

    // An error message that will be displayed if set.
    $scope.error = '';

    // A search term. This is used in the admin.html view to filter users.
    $scope.search = '';

    /////////////////////////////////////////////
    /// @brief Return true if a user is selected, otherwise false.
    $scope.userSelected = function() {
      for (var i = 0; i < $scope.filteredUsers.length; ++i) {
        if ($scope.filteredUsers[i].selected === true)
          return true;
      }

      return false;
    };

    /////////////////////////////
    // Update a user, and display error if necessary
    $scope.updateUser = function(user) {
        user.$update(function() {},
            function(error){
                if (error) {
                    $scope.error = 'Error trying to update user data';
                }
            });
    };

    /////////////////////////////////////////////
    /// @brief Select all users in the current page of the table
    $scope.selectPageUsers = function() {
        var selected = !$scope.getAllPageUsersSelected();
        for (var i = 0; i < $scope.filteredUsers.length; ++i) {
            $scope.filteredUsers[i].selected = selected;
        }
    };

    /////////////////////////////////////////////
    /// @brief Check if all users in the current page of the table are selected
    $scope.getAllPageUsersSelected = function() {
        if ($scope.filteredUsers.length > 0) {
            var selectedUsers = $scope.filteredUsers.filter(function(usr) {
                return usr.selected === true;
            });
            if (selectedUsers.length === $scope.filteredUsers.length)
                return true;
            return false;
        }
        return false;
    };

    /////////////////////////////////////////////
    /// @brief Get an array of selected users in the current page.
    $scope.getPageUsersSelected = function() {
        if ($scope.filteredUsers.length > 0) {
            var selectedUsers = $scope.filteredUsers.filter(function(usr) {
                return usr.selected === true;
            });
            return selectedUsers;
        }
        return $scope.filteredUsers;
    };

    /////////////////////////////////////////////
    // @brief Make all users not selected.
    $scope.clearSelected = function() {
        angular.forEach($scope.users, function(usr) {
          usr.selected = false;
        });
    };

    /////////////////////////////////////////////
    /// @brief Delete a user from the users collection
    $scope.deleteUsers = function() {
        $scope.error = '';

        var selectedUsers = $scope.getPageUsersSelected();

        // Process each checked user
        angular.forEach(selectedUsers, function(usr) {
            usr.selected = false;

            // Remove the user from the server, as long as they are not
            // deleting themselves.
            if (usr.email !== $scope.global.user.email) {
                usr.$remove(
                    function() {
                        // Remove the user from the local users list.
                        var idx = $scope.users.indexOf(usr);
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
    };

    /////////////////////////////////////////////
    /// @brief A function that opens the edit invites modal.
    $scope.openEditUsersModal = function() {
        var template = 'views/users/admin_edit_users_modal.html';

        // Make sure the person is authenticated.
        if (this.global.authenticated) {
            // Open the modal, and pass in (resolve) some values.
            var modalInstance = $modal.open({
                templateUrl: template,
                resolve: {
                  users: function() {return $scope.getPageUsersSelected();}
                },
                controller: EditUsersModalCtrl
            });

            // Wait for the modal to be closed/canceled.
            modalInstance.result.then(function () {
                // Do nothing when the modal is submited.
            }, function () {
                // Do nothing when the modal is dismissed.
            });
        }
        else {
            console.log('Not authenticated');
        }
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
                resolve: {
                  users: function() {return $scope.users;}
                },
                controller: AddUserModalCtrl
            });

            // Wait for the modal to be closed/canceled.
            modalInstance.result.then(function (user) {
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
    /// Controller for the edit users modal
    var EditUsersModalCtrl = function($scope, $modalInstance, users) {
        $scope.ok = function(form) {

            var credit = Number(form.credit.$viewValue);
            var invites = Number(form.invites.$viewValue);
            angular.forEach(users, function(usr) {
              usr.credit += credit;
              usr.invites += invites;
              usr.$update(function() {},
                  function(error){
                      if (error) {
                        $scope.error = 'Error trying to update user data';
                      }
                  });
            });

            $modalInstance.close();
        };

        $scope.cancel = function() {$modalInstance.dismiss();};
    };

    /////////////////////////////////////////////
    /// Controller for the add user modal
    var AddUserModalCtrl = function($scope, $modalInstance, users) {
        // The ok function is called when the modal form is submitted.
        $scope.ok = function(form) {
            var unique = true;

            // Check that the email is uniqu
            angular.forEach(users, function(usr) {
                if (usr.email === form.email.$viewValue) {
                    unique = false;
                }
            });

            if (unique) {
                // Create a new user (just fill in the fields using email).
                var user = new Users({
                    email: form.email.$viewValue,
                    open_id: form.email.$viewValue,
                    username: form.email.$viewValue,
                    name: form.email.$viewValue
                });

                user.admin = form.admin.$viewValue;

                $modalInstance.close(user);
            } else {
                $scope.error = 'Email already exists';
            }
        };

        // The cancel function is called when the modal form is 
        // closed/canceld.
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    };
}]);
