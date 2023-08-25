/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateNavigationCtrl.js
 /// XML Sign WMQ Gateway  Navigation Controller
 /// Abstract Controller that is the parent of all XML Sign WMQ Gateway Bridge Module Screens - this will manage Socket-IO Listeners amongst other things
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2022
 /// </summary>
 */
define(['modules/bridge/module'], function (module) {

	"use strict";

	module.registerController('xmlSignWMQGateNavigationCtrl', ['$scope', 'transactionReportingSvc', function ($scope, transactionReportingSvc)
	{
		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.BRIDGE);
	}]);
});
