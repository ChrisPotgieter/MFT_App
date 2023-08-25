/*
 /// <summary>
 /// app.modules.spe.controllers - speNavigationCtrl.js
 /// Base SPE Navigation Controller
 /// Abstract Controller that is the parent of all SPE Module Screens - this will manage Signal-R Listeners amongst other things
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/05/2016
 /// </summary>
 */
define(['modules/spe/module', 'ng-fileupload'], function (module) {

	"use strict";

	module.registerController('speNavigationCtrl', ['$scope', 'userSvc', 'transactionReportingSvc', function ($scope, userSvc, transactionReportingSvc)
	{

		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.ITXA);
	}]);
});
