/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiRealtimeCtrl.js
 /// Controller to manage realtime statistics for the BOOMI Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/admin/module'], function (module)
{
	"use strict";

	module.registerController('jsonEditCtrl', ['$scope',function ($scope)
    {
		var _this = this;
        _this.functions = {};


        //<editor-fold desc="Initialization">
        _this.functions.initialize = function()
        {
        };


        // initialize the screen
        _this.functions.initialize();

    }]);
});
