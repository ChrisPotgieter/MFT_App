/*
 /// <summary>
 /// app.modules.admin.controllers - parameterSLAEditDialogCtrl
 /// Dialog Controller to Manage Edit of SLA Rule Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2021
 /// </summary>
 */

 define([ 'modules/admin/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerController('parameterSLAEditDialogCtrl', [
		'$uibModalInstance',
		'$uibModal',
		'$scope',
		'$log',
		'$timeout',
		'uiSvc',
		'cacheDataSvc',
		'dialogData',
		function ($uibModalInstance, $uibModal, $scope, $log, $timeout, uiSvc, cacheDataSvc, dialogData) {
			var _this = this;

			// setup bootstrap validator
			$uibModalInstance.rendered.then(function () {
				// setup bootstrap validator when the form is rendered
				var innerForm = $(document.getElementById('frmSLAConfigEdit'));
				var fields = {
					fields: {
						code: {
							group: '#div_code',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Code is Required'
								},
								regexp: {
									regexp: '[a-zA-Z0-9_]{1,20}$',
									message:
										'Code  must contain no spaces or special characters and must be a minimum of 1 and maximum of 20'
								},
								callback: {
									message: 'Code already exists',
									callback: function (value, validator, $field) {
										if (!_this.model.flags.allowCode) return true;
										var found = lodash.find(dialogData.rows, function (record) {
											return (
												record.code === value &&
												record.recordStatus != uiSvc.editModes.DELETE &&
												record.rowId != _this.dataModel.rowId
											);
										});
										if (found) return false;
										return true;
									}
								}
							}
						},
						description: {
							group: '#div_desc',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Description is Required'
								}
							}
						},
						hiddenValidation: {
							excluded: false,
							group: '#div_exec_time',
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										// check the execution time is > cancel Time
										let cancelTime = uiSvc.calcMilliseconds(_this.dataModel.jsonData.timing.cancel);
										let execTime = uiSvc.calcMilliseconds(_this.dataModel.jsonData.timing.exec);
										let remindTime = uiSvc.calcMilliseconds(_this.dataModel.jsonData.timing.remind);
										if (execTime <= 0)
											return {
												valid: false,
												message: 'Execution Time must be Greater Than 1 Mill-Second'
											};
										if (execTime <= cancelTime)
											return {
												valid: false,
												message: 'Execution Time must be Greater Than Cancellation Time'
											};
										if (execTime <= remindTime)
											return {
												valid: false,
												message: 'Execution Time must be Greater Than Remind Time'
											};
										return true;
									}
								}
							}
						}
					}
				};

				var formOptions = lodash.merge({}, {}, fields);
				var fv = innerForm.bootstrapValidator(formOptions);
				_this.form = innerForm.data('bootstrapValidator');

				// revalidate the form as required
				if (_this.dataModel.rowId > -1) {
					_this.model.title = 'Edit Service Level Agreement';
					_this.model.buttonText = 'Save';
					lodash.forEach(_this.dataModel.jsonData.metadata, function (row, index) {
						_this.model.lastId++;
					});

					// validate the form on edit
					$timeout(function () {
						_this.form.validate();
					}, 500);
				}
			});

			// create the functions
			_this.functions = {};

			_this.functions.initialize = function () {
				_this.model = {
					title: 'Add Service Level Agreement',
					buttonText: 'Create',
					flags: { allowCode: true, gridRefresh: { value: 0 } },
					lastId: -1,
					notification: {},
					modules: {}
				};
				_this.moduleList = cacheDataSvc.getBaseModules();

				_this.dataModel = dialogData.row;

				// determine if the code needs to be disabled
				if (_this.dataModel.code != null && _this.dataModel.code.toUpperCase() == 'DEFAULT')
					_this.model.flags.allowCode = false;

				if (_this.dataModel.newRecord != undefined && !_this.dataModel.newRecord)
					_this.model.flags.allowCode = false;
				if (_this.dataModel.code != undefined && _this.dataModel.recordStatus == uiSvc.editModes.INSERT)
					_this.model.flags.allowCode = false;

				// map the events
				_this.model.lists = {};
				_this.model.lists.mft = {};
				_this.model.lists.mft.export = [];
				_this.model.lists.mft.export.push({ code: 0, description: 'Not Applicable' });
				_this.model.lists.mft.export.push({ code: 1, description: 'Item Specification' });
				_this.model.notifications = {};
				_this.modalResult = null;

				// parse the notifications
				_this.functions.marshallNotification('mft');
				_this.functions.marshallNotification('iib');
				_this.functions.marshallNotification('spe');
				_this.functions.marshallNotification('boomi');
			};

			_this.functions.marshallNotification = function (module) {
				// routine to map the records notifications for the given module
				if (_this.dataModel.jsonData[module]) {
					let moduleRec = {
						header: cacheDataSvc.getModuleDesc(module),
						notification: { jsonData: {} },
						validator: {}
					};
					if (
						_this.dataModel.jsonData[module].notification &&
						_this.dataModel.jsonData[module].notification.events
					)
						moduleRec.notification.jsonData = _this.dataModel.jsonData[module].notification;
					else moduleRec.notification.jsonData = { events: [] };

					moduleRec.notification.jsonData.recordStatus = uiSvc.editModes.UPDATE;
					if (module == 'mft') {
						if (!moduleRec.notification.jsonData.export_type)
							moduleRec.notification.jsonData.export_type = 0;

						moduleRec.notification.jsonData.export_type = parseInt(
							moduleRec.notification.jsonData.export_type
						);
					}
					_this.model.modules[module] = moduleRec;
				}
			};
			_this.functions.unMarshallNotification = function (module) {
				// routine to unmarshall the notification data back to the record
				if (_this.model.modules[module]) {
					if (!_this.dataModel.jsonData[module]) _this.dataModel.jsonData[module] = {};
					_this.dataModel.jsonData[module].notification = _this.model.modules[module].notification.jsonData;
				}
			};
			_this.functions.userDelete = function () {
				// routine to confirm deletion of of the row
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
					_this.dataModel.code +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to delete this Service Level Agreement ? ',
					'[No][Yes]',
					_this.functions.confirmDelete
				);
			};

			_this.functions.confirmDelete = function (ButtonPressed) {
				// routine to handle the delete request from the user
				if (ButtonPressed == 'Yes') {
					_this.dataModel.recordStatus = uiSvc.editModes.DELETE;
					$uibModalInstance.close(_this.dataModel);
				}
			};

			_this.functions.saveRecord = function () {
				// routine to save the entry
				_this.form.revalidateField('hiddenValidation');
				_this.form.validate();
				var valid = _this.form.isValid();
				if (!valid) return;

				// unmarshall the notification data
				_this.functions.unMarshallNotification('mft');
				_this.functions.unMarshallNotification('iib');
				_this.functions.unMarshallNotification('spe');
				_this.functions.unMarshallNotification('boomi');

				// close the window
				$uibModalInstance.close(_this.dataModel);
			};

			_this.functions.cancelRecord = function () {
				// close the window
				$uibModalInstance.dismiss('cancel');
			};

			_this.functions.initialize();
		}
	]);
});
