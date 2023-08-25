/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiNavigationCtrl.js
 /// Base BOOMI Navigation Controller
 /// Controller to Manage Navigation within the BOOMI Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module'], function (module) {

	"use strict";

	module.registerController('boomiNavigationCtrl', ['$scope', 'transactionReportingSvc', 'boomiDataSvc', function ($scope, transactionReportingSvc, boomiDataSvc)
	{

		// initialize the lists
		boomiDataSvc.initializeLists();

		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.BOOMI);
	}]);
});
