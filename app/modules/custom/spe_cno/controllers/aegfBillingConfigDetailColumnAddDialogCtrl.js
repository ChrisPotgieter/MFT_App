/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfBillingConfigDetailColumnAddDialogCtrl.js
 /// Dialog Controller to allow the Adding of Custom Columns
 //
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:21/04/2023
 /// </summary>
 */
define([ 'modules/custom/spe_cno/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('aegfBillingConfigDetailColumnAddDialogCtrl', ['$scope', '$uibModalInstance','uiSvc', 'adminDataSvc', 'speCNODataSvc', 'dialogData', function ($scope, $uibModalInstance, uiSvc, adminDataSvc, dataSvc, dialogData) {
		let _this = this;
		_this.functions = {};
		_this.dialogData = dialogData;

		//<editor-fold desc="Initialization and Dialog Control">
		_this.functions.init = function () {
			// routine to initialize the screen
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEdit';
			_this.stateInfo.fields =
				{
					fields: {
						input_caption: {
							group: '#div_caption',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Caption is Required'
								}
							}
						},
						input_1: {
							excluded: false,
							validators: {
								callback: {
									// make sure there are no existing
									callback: function (value, validator, $field)
									{
										if (_this.dataModel.data_source == null || _this.dataModel.data_source.length == 0)
										{
											return {message: "Value is Required", valid: false}
										}
										else
										{
											return true;
										}
									}
								}
							}
						},
						hiddenValidation: {
							excluded: true
						}
					}
				};
			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, "Custom Column");
			_this.model.numberInputs = 1;

			// set the delimiter options
			_this.model.delimiterOptions =
				[
					{value: ',', name: "Comma (,)"},
					{value: " ", name: "Space"},
					{value: "|", name: "Pipe"}
				];
			_this.model.fields = lodash.chain(dataSvc.aegf.functions.getFields()).filter({"selectable": true}).map(function(item)
			{
				return {value: item.data_source[0], label: item.caption};
			}).value();
		};

		_this.functions.tagTransform = function(newTag)
		{
			let item = {
				value: newTag,
				label: newTag
			};

			return item;
		}
		_this.functions.addColumn = function(index)
		{
			_this.model.numberInputs += index;
		};

		_this.functions.cancelDialog = function () {
			// close the window
			_this.functions.cancelRecord();
		};
		_this.functions.confirmDialog = function () {
			_this.functions.saveRecord();
		};
		//</editor-fold>

		//<editor-fold desc="Admin Framework Overrides">
		_this.functions.onSaveRecord = function (record)
		{
			// work out the identifer by looking
			let startId = 1;
			while (true)
			{
				let record = lodash.find(dialogData.rows, {identifier: "custom_" + startId});
				if (record != null)
				{
					startId++;
					continue;
				}
				break;
			}
			record.identifier = "custom_" + startId;
			record.hidden = false;
			record.custom = true;
			return record;
		};
		$scope.$watch("vmDialog.model.source", function(newValue)
		{
			_this.dataModel.data_source = [];
			lodash.forOwn(newValue, function(value, key)
			{
				_this.dataModel.data_source[parseInt(key)] = value;
			});
			_this.form.resetField("input_1");
		}, true);
		//</editor-fold>

		// initialize the view
		_this.functions.init();

	}]);
});
