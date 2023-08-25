/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftv2NavigationCtrl.js
 /// Base MFT V2  Navigation Controller
 /// Abstract Controller that is the parent of all MFT V2 Module Screens - this will manage Socket-IO Listeners amongst other things
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module) {

	"use strict";

	module.registerController('mftv2NavigationCtrl', ['$scope', 'transactionReportingSvc', 'mftv2DataSvc', function ($scope, transactionReportingSvc, mftv2DataSvc)
	{
		// initialize the lists
		mftv2DataSvc.initializeLists();

		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.MFT);
	}]);
});
