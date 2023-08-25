/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - crsBillingCreateDefinitionDialog.js
 /// Controller to Manage the Input Options for a New Billing Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date:20/04/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('aegfBillingConfigDetailCreateDialogCtrl', ['$scope',	'$uibModalInstance','$timeout', 'uiSvc', 'speCNODataSvc', 'dialogData',	function ($scope, $uibModalInstance, $timeout, uiSvc, dataSvc, dialogData)
	{
		let _this = this;
		_this.functions = {};
		_this.model = {groupFilter:{}};
		_this.dataModel = {};



		//<editor-fold desc="Dialog Actions">

		_this.functions.buildResult = function()
		{
			// routine to build the result that will go back
			_this.dataModel.group = _this.model.groupFilter.group;
			_this.dataModel.sub_group = null;
			if (_this.model.groupFilter.sub_groups != null)
				_this.dataModel.sub_group = _this.model.groupFilter.sub_groups;
		};

		_this.functions.cancelDialog = function()
		{
			// close the window
			$uibModalInstance.dismiss('cancel');
		};
		_this.functions.confirmDialog = function()
		{
			// routine to validate the form

			// first check if the records already exist
			let filterObject = {group_id: _this.model.groupFilter.group};
			if (_this.model.groupFilter.sub_groups != null)
				filterObject.sub_groups = [_this.model.groupFilter.sub_groups];
			dataSvc.aegf.functions.searchConfigs(filterObject).then(function(result)
			{
				_this.model.data = result.records;
				_this.form.revalidateField('hiddenValidation');
				_this.form.validate();
				const valid = _this.form.isValid();
				if (!valid) return;

				_this.functions.buildResult();
				$uibModalInstance.close(_this.dataModel);
			});
		};
		//</editor-fold>

		//<editor-fold desc="Initialization">
		_this.functions.initialize = function()
		{
			// routine to initialize the form
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEdit';
			_this.stateInfo.fields = {
				fields: {
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								// make sure there are no existing
								callback: function (value, validator, $field)
								{
									let groupCompleted = ( _this.model.groupFilter.group != null);
									if (!groupCompleted)
									{
										return {message: "Employer Group is Required", valid: false};
									}
									let noDuplicates = _this.model.data.length == 0;
									if (!noDuplicates)
										return {message: "Configuration Already Found - Please Amend", valid: false};
									return {valid: true};
								}
							}
						}
					}
				}
			};

			_this.model.title = "Create New Billing Configuration";
			_this.model.icon = "fa fa-asterisk";

			$uibModalInstance.rendered.then(_this.functions.rendered);
		};
		_this.functions.rendered = function ()
		{
			// setup bootstrap validator when the form is rendered
			uiSvc.attachValidator(_this, _this.stateInfo);
		};
		//</editor-fold>

		// initialize the view
		_this.functions.initialize();
	}]);
});
