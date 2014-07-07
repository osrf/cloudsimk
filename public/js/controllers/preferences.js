'use strict';

angular.module('cloudsim.preferences').controller('PreferencesController', 
                ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Users', 
                function ($scope, $stateParams, $location, $modal, Global, Users) {

    $scope.global = Global;

    // we store the current logged in user here. It is leaoded with the pref page
    $scope.user = Users.me();
   
    /////////////////////////////////////////////
    /// @brief Open a modal to confirm the deletion of an ssh key.
    /// @param[in] index Index of the key to delete.
    $scope.removeSSHKey = function(index) {
        if (index >= 0 && index < $scope.user.public_ssh_keys.length) {
            // Open the modal, and pass in (resolve) the ssh key label.
            var modalInstance = $modal.open({
                templateUrl: 'views/users/ssh_key_remove_modal.html',
                resolve: {
                    // The ssh key label 
                    label: function() {
                        return $scope.user.public_ssh_keys[index].label;
                    }
                },
                controller: function($scope, $modalInstance, label) {
                    $scope.label = label;
                    $scope.ok = function() {
                        $modalInstance.close();
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss();
                    };
                }
            });

            // Wait for the modal to be closed/canceled.
            modalInstance.result.then(function () {
                // Delete the key if confirmed.
                $scope.user.public_ssh_keys.splice(index, 1);
                $scope.user.$update();
            }, function () {
                // Do nothing when the modal is dismissed.
            });
        }
    };

    /////////////////////////////////////////////
    /// @brief A function that opens the add/edit ssh key modal.
    /// Addition and modifications to keys will be sent to the sever when
    /// the form in the modal window is submitted.
    $scope.openSSHKeyModal = function(index) {

        var template = 'views/users/ssh_key_add_modal.html';
        if (index !== undefined) {
            template = 'views/users/ssh_key_edit_modal.html';
        }

        // Open the modal, and pass in (resolve) some values.
        var modalInstance = $modal.open({
            templateUrl: template,
            controller: SSHKeyModelCtrl,
            resolve: {
                // Index into the sshKeys array. Undefined if adding a new
                // key
                index: function() {
                    return index;
                },
                user: function() {
                    return $scope.user;
                }
            }
        });

        // Wait for the modal to be closed/canceled.
        modalInstance.result.then(function () {
            // Send the keys to the server.
            $scope.user.$update();
        }, function () {
            // Do nothing when the modal is dismissed.
        });
    };

    /////////////////////////////////////////////
    /// Controller for the add/edit ssh key modal
    /// @param[in] index Index into the sshKeys array of the key to edit.
    ///                  Undefined if adding a new key.
    /// @param[in] sshKeys The array of ssh keys.
    var SSHKeyModelCtrl = function($scope, $modalInstance, index, user) {
        // Grab the label and key, if editing a key. We do this so that
        // editing the values in the form does not directly change the
        // key properties. The user can modify a value, and hit cancel
        // without the key changed.
        if (index !== undefined) {
            // Grab the label and key, if editing a key. We do this so that
            // editing the values in the form does not directly change the
            // key properties. The user can modify a value, and hit cancel
            // without the key changed.

            $scope.label = user.public_ssh_keys[index].label;
            $scope.key = btoa(user.public_ssh_keys[index].key).substring(0,20);
        } else {
            $scope.label = '';
            $scope.key = '';
        }

        // The ok function is called when the modal ssh key form is
        // submitted. See public/views/users/preferences.html
        $scope.ok = function(form) {
            var now = new Date();
            var y = now.getFullYear();
            var m = now.getMonth()+1;
            var d = now.getDate();

            m = m < 10 ? '0' + m : m;
            d = d < 10 ? '0' + d : d;

            // add a new key if the index was nmt defined.
            // otherwise, update an existing key
            if (index === undefined) {
                if (user.ssh_keys === undefined) {
                    user.ssh_keys = [];
                }
                user.public_ssh_keys.push({
                              'label':form.label.$viewValue,
                              'key':form.key.$viewValue,
                              'date':y + '-' + m  + '-' + d});
            } else {
                user.public_ssh_keys[index].label = form.label.$viewValue;
                user.public_ssh_keys[index].key = form.key.$viewValue;
                user.public_ssh_keys[index].date = y + '-' + m + '-' + d;
            }
            $modalInstance.close();
        };

        // The cancel function is called when the modal ssh key form is 
        // closed/canceld. See public/views/users/preferences.html
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    };
}]);
