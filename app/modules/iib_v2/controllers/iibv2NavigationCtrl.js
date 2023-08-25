/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2NavigationCtrl.js
 /// Base Mongo IIB  Navigation Controller
 /// Abstract Controller that is the parent of all IIB v2 Module Screens - this will manage Signal-R Listeners amongst other things
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/11/2018
 /// </summary>
 */
define(['modules/iib_v2/module'], function (module) {

	"use strict";

	module.registerController('iibv2NavigationCtrl', ['$scope', 'transactionReportingSvc', 'iibv2DataSvc', function ($scope, transactionReportingSvc, iibv2DataSvc)	{

		// initialize the lists
		iibv2DataSvc.initializeLists();

		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.IIB);
	}]);
});
