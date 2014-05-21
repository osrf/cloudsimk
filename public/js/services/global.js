'use strict';

// Global service for global variables
angular.module('cloudsim.system').factory('Global', [
    function() {
        var _this = this;
        _this._data = {
            user: window.user,
            authenticated: !! window.user,
            paypalSandbox: window.paypalSandbox
        };

        return _this._data;
    }
]);
