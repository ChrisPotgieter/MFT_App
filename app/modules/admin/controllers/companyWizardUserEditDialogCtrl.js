/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardUserEditDialogCtrl.js
 /// Controller to manage Company Wizard User Edit Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Chris Potgieter
 /// Date: 25/01/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardUserEditDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',

		function (
			$uibModalInstance,
			cacheDataSvc,
			dialogData,
			uiSvc,
			$scope,
			adminDataSvc,
			$timeout,
			userSvc
		) {
			// initialize the variables
			var _this = this;
			_this.functions = {};
			_this.model = {};
			_this.dialogData = dialogData;
			_this.dataModel = _this.dialogData.row;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmUserEdit';

			_this.stateInfo.fields = {
				fields: {
					userId: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Login is Required'
							},
							regexp: {
								regexp: '^[a-zA-Z0-9_.]{3,}$',
								message: 'Login must contain no spaces or special characters and must be a minimum of 3'
							},

							callback: {
								message: 'Login  Already Exists',
								callback: function (value, validator, $field) {
									var found = lodash.find(_this.dialogData.rows, function (record) {
										return (
											record.user_id && record.user_id.toUpperCase() === value.toUpperCase() &&
											record.recordStatus != uiSvc.editModes.DELETE &&
											_this.dataModel.record.rowId != record.rowId
										);
									});
									if (found) {
										return false;
									}
									return true;
								}
							}
						}
					},

					userPassword: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Password is Required'
							}
						}
					},

					emailAddress: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'The Email Address cannot be empty'
							},
							emailAddress: {
								message: 'Invalid Email Address'
							}
						}
					},
					name: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Name is Required'
							}
						}
					},
					hiddenDept: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								message: 'At least One Department is Required',
								callback: function (value, validator, $field) {
									var valid = _this.dataModel.record.departments.length > 0;
									return valid;
								}
							}
						}
					},
					hiddenRole: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								message: 'At least One Role is Required',
								callback: function (value, validator, $field) {
									var valid = _this.dataModel.record.roles.length > 0;
									return valid;
								}
							}
						}
					},
						hiddenValidation: {
							excluded: true
						}
				}
			};

			//save record
			_this.functions.onSaveRecord = function (record) {
				record.code = _this.dataModel.record.userId;
				return _this.dataModel.record;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'User');
		}
	]);
});
