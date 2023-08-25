/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciNavigationCtrl.js
 /// CNO Third Party Commission Intake Navigation Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/05/2022
 /// </summary>
 */
define(['modules/custom/spe_cno/module'], function (module) {

	"use strict";

	module.registerController('cnoTpciNavigationCtrl', ['$scope', 'transactionReportingSvc', function ($scope, transactionReportingSvc)
	{
		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.CUSTOM);
	}]);
});
