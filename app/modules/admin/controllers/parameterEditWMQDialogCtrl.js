/*
 /// <summary>
 /// app.modules.install.controllers - parameterEditWMQDialogCtrl.js
 /// Controller to manage Default Websphere Message Queuing  adding or editing in dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Chris Potgieter
 /// Date: 25/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterEditWMQDialogCtrl', [
		'$uibModalInstance',
		'dialogData',
		'adminDataSvc',
		'uiSvc',
		function ($uibModalInstance, dialogData, adminDataSvc, uiSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = dialogData.row;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmBinding';
			_this.dataModel.code = _this.dataModel.host;

			//<editor-fold desc="Validation">
			//Validate Fields
			_this.stateInfo.fields = {
				fields: {
					host: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Host Name is Required'
							},
							callback: {
								message: 'Host already exists',
								callback: function (value, validator, $field) {
									var found = lodash.find(_this.dialogData.rows, function (record) {
										return (
											record.host === value &&
											record.recordStatus != uiSvc.editModes.DELETE &&
											record.rowId != _this.dataModel.rowId
										);
									});

									if (found && !_this.dataModel.isDuplicate) {
										return false;
									}
									return true;
								}
							}
						}
					},

					port: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Port is Required'
							},
							numeric: {
								message: 'The port is not a number'
							}
						}
					},
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {}
					}
				}
			};
			//</editor-fold>

			//<editor-fold desc="Delete">
			_this.functions.userDelete = function () {
				// routine to confirm deletion of the row
				console.log(_this.dataModel);
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
					_this.dataModel.host +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to remove this Host ?',
					'[No][Yes]',
					_this.functions.confirmDelete
				);
			};

			_this.functions.confirmDelete = function (ButtonPressed) {
				// routine to handle the delete request from the user
				if (ButtonPressed == 'Yes') {
					lodash.forEach(_this.dialogData.rows, function (item, index) {
						if (_this.dataModel.host === item.host) {
							_this.dialogData.rows.splice(index, 1);
							_this.functions.cancelRecord();
							return;
						}
					});
				}
			};
			//</editor-fold>
			//save record
			_this.functions.onSaveRecord = function (record) {
				console.log(_this.dataModel)
				record.code = _this.dataModel.host;
				return _this.dataModel;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Host');
		}
	]);
});
