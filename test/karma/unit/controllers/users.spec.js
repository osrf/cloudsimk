'use strict';

(function() {
    describe('CloudSim controllers', function() {
        describe('UsersController', function() {
            // Load the controllers module
            beforeEach(module('cloudsim'));

            var scope, UsersController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                UsersController = $controller('UsersController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });
        });
    });
})();
