define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyQueueEditDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',
		'dialogData',

		function (
			$uibModalInstance,
			cacheDataSvc,
			uiSvc,
			$scope,
			adminDataSvc,
			$timeout,
			userSvc,
			dialogData
		) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.stateInfo = {};
			_this.stateInfo.elementId = "frmQueueBinding";

			_this.stateInfo.fields = {
					fields: {
						queueName: {
							excluded: false,
							group: '#div_queueName',
							validators: {
								notEmpty: {
									message: 'Queue is Required'
								},
								callback: {
									message: 'Queue Name @ Queue Manager Combination Already Exists',
									callback: function (value, validator, $field) {
										//Check if queue name already exists
										var found = lodash.find(_this.dialogData.rows, function(row){
											return (row.queue == value && row.id != _this.dialogData.row.id)
										})
										if (found) {
											return false;
										}
										return true;

									}
								} 
							}
						},
						queueManager: {
							excluded: false,
							group: '#div_queueManager',
							validators: {
								notEmpty: {
									message: 'Queue Manager is Required'
								},
								callback: {
									message: 'Queue Name @ Queue Manager Combination Already Exists',
									callback: function (value, validator, $field) {
										var found = lodash.find(dialogData.rows, function (record) {
											return (
												record.queueManager === value &&
												record.id != dialogData.row.id &&
												record.queue == dialogData.row.queue
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

						hiddenValidation:
						{
							excluded: true,
							
						}
					}
				};

			_this.functions.onSaveRecord = function (record) {
				// routine to post the save of the queue record to the in-memory store
				record.code = _this.dataModel.queue+ "@" + _this.dataModel.queueManager;
				return record;

			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Queue Edit');
		}
	]);
});
