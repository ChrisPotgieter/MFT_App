/*
 /// <summary>
 /// app.modules.auth.directives - loginInfo.js
 /// AngularJS directive to Display Currently Logged On User Information
 /// Adapted from the SmartAdmin Template
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/27/2014
 /// </summary>
 */

define(['modules/auth/module'], function(module){
    "use strict";

    return module.registerDirective('loginInfo', ['userSvc', function(userSvc)
    {


        return {
            restrict: 'A',
            templateUrl: 'app/modules/auth/directives/loginInfo.tpl.html',
            scope:{},
            controllerAs:'vm',
            controller: function ($element, $scope)
            {
                let _this = this;
                _this.model = {user: userSvc.getProfile()};
            }
        }
    }])
});
