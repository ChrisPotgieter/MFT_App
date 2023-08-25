/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfBillingConfigDetailColumnTransformationEditDialogCtrl.js
 /// Controller to Manage Column Transformation Edit Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:04/05/2023
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {
    'use strict';

    module.registerController('aegfBillingConfigDetailColumnTransformationEditDialogCtrl', ['$scope', '$uibModalInstance', 'adminDataSvc', 'uiSvc', 'dialogData', function ($scope, $uibModalInstance, adminDataSvc, uiSvc, dialogData) {
        let _this = this;
        _this.functions = {};
		_this.model = {};
		_this.dialogData = dialogData;
		_this.dataModel = dialogData.row;

		//<editor-fold desc="Initialization and Dialog Control">
		_this.functions.init = function ()
		{
			// routine to initialize the screen
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEditTransform';

			_this.stateInfo.fields = _this.functions.getValidationFields();
			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, "Transformation");
			_this.functions.initializeCombos();
		};

		_this.functions.initializeCombos = function()
		{
			// routine to initialize the combo selections that will be used
			_this.model.function = {options:[]};
			_this.model.function.options = [
				{value: 'trim', name: 'Trim'},
				{value: 'mask', name: 'Mask'},
				{value: 'pad', name: 'Pad'},
				{value: 'length', name: 'Length'}
			];
			// work out the trim value
			_this.model.trim = "left";
			if (_this.dataModel.function == "trim")
			{
				if (_this.dataModel.parameters.all != null && _this.dataModel.parameters.all)
					_this.model.trim = "all";
				if (_this.dataModel.parameters.right != null && _this.dataModel.parameters.right)
					_this.model.trim = "right";
			}
		};


		_this.functions.getValidationFields = function()
		{
			// routine to determine the correct validation fields based on the function selected
			let obj = {
				function: {
					group: '#div_function',
					excluded: false,
					validators: {
						notEmpty: {
							message: 'Function is Required'
						}
					}
				},
				lengthOption: {
					group: '#div_lengthOption',
					excluded: false,
					validators: {
						notEmpty: {
							message: 'Length Value is Required'
						},
						callback: {
							message: 'Length Value must be between 1 - 1000',
							callback: function (value, validator, $field) {
								if (_this.dataModel.function != 'length') return true;
								if (_this.dataModel.parameter < 1000 && _this.dataModel.parameter >= 1) {
									return true;
								} else {
									return false;
								}
							}
						}
					}
				},
				char: {
					group: '#div_char',
					excluded: false,
					validators: {
						notEmpty: {
							message: 'Character is Required'
						}
					}
				},
				chars: {
					group: '#div_chars',
					excluded: false,
					validators: {
						notEmpty: {
							message: 'Characters is Required'
						}
					}
				},
				hiddenTrimOptionValidation: {
					excluded: false,
					feedbackIcons: false,
					validators: {
						callback: {
							message: 'Trim Value is Required',
							callback: function (value, validator, $field) {
								if (_this.dataModel.function != 'trim') return true;
								if (_this.dataModel.parameters) {
									return true;
								} else {
									return false;
								}
							}
						}
					}
				},
			};
			obj = {
				function: {
					group: '#div_function',
					excluded: false,
					validators: {
						notEmpty: {
							message: 'Function is Required'
						}
					}
				},
				hiddenValidation:
				{
						excluded: true
				}
			};
			return {fields: obj};
		};

		_this.functions.cancelDialog = function()
		{
			// close the window
			_this.functions.cancelRecord();
		};
		_this.functions.confirmDialog = function()
		{
			_this.functions.saveRecord();
		};
		//</editor-fold>

		//<editor-fold desc="Processing">
		_this.functions.onFunctionChange = function ()
		{
			// routine to adjust the options when the function changes
			_this.dataModel.parameters = {};
			switch (_this.dataModel.function)
			{
				case "trim":
					_this.model.trim = "left";
					break;
				case "pad":
					_this.dataModel.parameters.char = "0";
					_this.dataModel.parameters.length = 10;
					break;
				case "mask":
					_this.dataModel.parameters.char = "*";
					_this.dataModel.parameters.chars = "";
					break;
				case "length":
					_this.dataModel.parameters.length = 10;
					break;
			}
		};
		//</editor-fold>

		//<editor-fold desc="Admin Framework Overrides">
		_this.functions.onSaveRecord = function (record)
		{
			// routine to save the correct transformation record
			if (record.function === "trim")
				record.parameters[_this.model.trim] = true;
			return record;
		};
		//</editor-fold>

		// initialize the screen
		_this.functions.init();

	}
    ]);
});
