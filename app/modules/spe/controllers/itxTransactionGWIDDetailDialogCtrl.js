/*
 /// <summary>
 /// app.modules.spe.controllers - itxTransactionGWIDDetailDialogCtrl.js
 /// Dialog Controller to Manage ITX Transaction GWID Detail Dialog
 /// This replaces the speGwidDetailCtrl
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/10/2021
 */
define(['modules/spe/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('itxTransactionGWIDDetailDialogCtrl', ['$uibModalInstance', 'speDataSvc', 'dialogData', function ($uibModalInstance, dataSvc, dialogData)
	{
		// initialize variables
		let _this = this;
		_this.model = {};


		//<editor-fold desc="Functions">
		_this.functions = {};
		_this.functions.cancelDialog = function()
		{
			// close the window
			$uibModalInstance.dismiss('cancel');
		};
		_this.functions.init = function()
		{
			// routine to initialize the controller based on the data
			_this.model.title = "EDI Document Information - " + dialogData.id;
			_this.model.icon = "fa fa-book";
			_this.model.id = dialogData.id;
			_this.functionManager = {};
		};
		_this.functions.init();
    }]);

});
