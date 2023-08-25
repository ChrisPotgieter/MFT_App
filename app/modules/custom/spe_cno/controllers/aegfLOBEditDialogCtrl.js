/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfLOBEditDialogCtrl.js
 /// Dialog Controller to manage Line of Business Short to Long Code Mapping
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:22/03/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {
    'use strict';

    module.registerController('aegfLOBEditDialogCtrl', ['$scope', '$uibModalInstance', 'uiSvc', 'adminDataSvc', 'dialogData', function ($scope, $uibModalInstance, uiSvc, adminDataSvc, dialogData)
	{
        let _this = this;
        _this.functions = {};
        _this.model = {};
        _this.dialogData = dialogData;


		//<editor-fold desc="Initialization and Dialog Control">
		_this.functions.init = function ()
		{
			// routine to initialize the admin dialog framework
			_this.dataModel = dialogData.row;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEdit';
			_this.stateInfo.fields = {
				fields: {
					mapping_code: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Mapping Code is Required'
							},
							callback: {
								message: 'Mapping Code already exists',
								callback: function (value, validator, $field) {
									let found = lodash.find(dialogData.rows, function (record) {
										let matches = record.jsonData.mapping_code.toUpperCase() === value.toUpperCase() && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId && record.jsonData.product_lob == _this.dataModel.jsonData.product_lob && record.jsonData.carrier_id == _this.dataModel.jsonData.carrier_id;
										return matches;
									});
									if (found) {
										return false;
									}
									return true;
								}
							}
						}
					},
					description: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Long Description is Required'
							}
						}
					},
					deduction: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Payroll Deduction Code is Required'
							}
						}
					},
					crs_code: {
						excluded: true,
					},
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {}
					}
				}
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Line of Business Short to Long Map');
		};

		_this.functions.cancelDialog = function()
		{
			// close the window
			$uibModalInstance.dismiss('cancel');
		};
		_this.functions.confirmDialog = function()
		{
			_this.functions.saveRecord();
		};
		//</editor-fold>


        //<editor-fold desc="Admin Framework Overrides">
        _this.functions.initializeRecord = function ()
		{
			// read the audit history for this record
			if (_this.dataModel.id) {
				adminDataSvc.readCustomerListAuditRecords(_this.dataModel.id).then(function (result)
				{
					_this.model.auditHistory = result.audits;
				});
			}
		};
        //</editor-fold>

		_this.functions.init();
    }
    ]);
});
