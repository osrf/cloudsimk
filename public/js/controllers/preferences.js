'use strict';

angular.module('cloudsim.preferences').controller('PreferencesController', 
                ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Users', 
                function ($scope, $stateParams, $location, $modal, Global, Users) {

    $scope.global = Global;

//    $scope.sshKeys = [];
    $scope.users = Users.query(); // window.user._id);
    $scope.user = null;
    
    /////////////////////////////////////////////
    /// @brief Open a modal to confirm the deletion of an ssh key.
    /// @param[in] index Index of the key to delete.
    $scope.removeSSHKey = function(index) {
        if (index >= 0 && index < $scope.sshKeys.length) {
            // Open the modal, and pass in (resolve) the ssh key label.
            var modalInstance = $modal.open({
                templateUrl: 'views/users/ssh_key_remove_modal.html',
                resolve: {
                    // The ssh key label 
                    label: function() {
                        return $scope.sshKeys[index].label;
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
                $scope.sshKeys.splice(index, 1);
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
        if(!$scope.user) {
            for(var i=0; i < $scope.users.length; i++) {
                var user = $scope.global.users[i];
                if(user._id == $scope.global.user._id) {
                    $scope.user = user;
                }
            }
        }

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
                // The array of ssh keys.
                sshKeys: function() {
                    return $scope.sshKeys;
                }
            }
        });

        // Wait for the modal to be closed/canceled.
        modalInstance.result.then(function () {
            // Send the keys to the server.
        }, function () {
            // Do nothing when the modal is dismissed.
        });
    };

    /////////////////////////////////////////////
    /// Controller for the add/edit ssh key modal
    /// @param[in] index Index into the sshKeys array of the key to edit.
    ///                  Undefined if adding a new key.
    /// @param[in] sshKeys The array of ssh keys.
    var SSHKeyModelCtrl = function($scope, $modalInstance, index, sshKeys) {
        // Grab the label and key, if editing a key. We do this so that
        // editing the values in the form does not directly change the
        // key properties. The user can modify a value, and hit cancel
        // without the key changed.
        if (index !== undefined) {
            $scope.label = sshKeys[index].label;
            $scope.key = sshKeys[index].key;
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

            // Add a new key if the index was not defined.
            // Otherwise, update an existing key
            if (index === undefined) {

                sshKeys.push({'label':form.label.$viewValue,
                              'key':form.key.$viewValue,
                              'date':y + '-' + m  + '-' + d});
            } else {
                sshKeys[index].label = form.label.$viewValue;
                sshKeys[index].key = form.key.$viewValue;
                sshKeys[index].date = y + '-' + m + '-' + d;
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
