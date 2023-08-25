/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfNavigationCtrl
 /// CNO Automated Employer Group Navigation Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/06/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module'], function (module) {

	"use strict";

	module.registerController('aegfNavigationCtrl', ['$scope', 'transactionReportingSvc', 'speCNODataSvc', function ($scope, transactionReportingSvc, dataSvc)
	{
		// set the module
		transactionReportingSvc.reset(transactionReportingSvc.moduleEnum.CUSTOM);

		// get the lists
		dataSvc.aegf.functions.getLists();
	}]);
});
