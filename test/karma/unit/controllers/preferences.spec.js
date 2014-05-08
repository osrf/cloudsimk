'use strict';

(function() {
    describe('CloudSim controllers', function() {
        describe('PreferencesController', function() {
            // Load the controllers module
            beforeEach(module('cloudsim'));

            var scope, PreferencesController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                PreferencesController = $controller('PreferencesController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });
        });
    });
})();
