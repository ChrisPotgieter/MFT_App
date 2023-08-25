/*
 /// <summary>
 /// app.modules.admin.controllers - parameterSLAEditListCtrl.js
 /// Controller to Manage SLA Config Listing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2021
 /// </summary>
 */

define([ 'modules/admin/module', 'lodash', 'moment', 'bootstrap-validator' ], function (module, lodash, moment) {
	'use strict';
	moment().format();

	module.registerController('parameterSLAEditListCtrl', [
		'$log',
		'$timeout',
		'$uibModal',
		'$filter',
		'$state',
		'$stateParams',
		'uiSvc',
		'userSvc',
		'cacheDataSvc',
		'adminDataSvc',
		function (
			$log,
			$timeout,
			$uibModal,
			$filter,
			$state,
			$stateParams,
			uiSvc,
			userSvc,
			cacheDataSvc,
			adminDataSvc
		) {
			var _this = this;
			_this.functions = {};
			_this.model = {
				gridData: [],
				flags: { allowAdd: true, allowSave: false, gridRefresh: { value: 0 } },
				lastId: -1
			};
			_this.stateInfo = { subTitle: 'SLA Class' };
			console.log(_this.model);
			// setup the grid options
			_this.model.gridOptions = {
				resizable: false,
				selectable: 'row',
				noRecords: true,
				pageable: {
					pageSizes: true
				},
				messages: {
					noRecords: 'No Records Available'
				},
				dataSource: {
					pageSize: 10,
					schema: {
						model: {
							id: 'rowId',
							uid: 'rowId'
						}
					}
				},
				columns: [
					{ field: 'rowId', type: 'string', tooltip: false, hidden: true },
					{ field: 'code', type: 'string', tooltip: true, title: 'Class' },
					{ field: 'description', type: 'string', tooltip: true, title: 'Description' },
					{
						field: 'execute_time',
						title: 'Execution Time',
						width: '150px',
						template: function (dataItem) {
							let value = 0;
							if (dataItem.jsonData && dataItem.jsonData.timing && dataItem.jsonData.timing.exec) {
								value = uiSvc.calcMilliseconds(dataItem.jsonData.timing.exec);
								if (value > 0) value = value / 1000;
							}
							return $filter('secondsToStringFilter')(value);
						}
					}
				],
				dataBound: function (e) {
					var grid = this;
					uiSvc.dataBoundKendoGrid(grid);
				}
			};

			//<editor-fold desc="Grid Management Functions">
			_this.functions.initialize = function () {
				// see if we have to force an ID
				if ($stateParams.id) _this.model.editCode = $stateParams.id;
				_this.model.flags.allowSave = false;
				_this.model.lastId = -1;

				let model = { companyId: userSvc.getOrgInfo().companyId, type: 'SLA_RULE' };
				adminDataSvc
					.readSLA(model)
					.then(function (result) {
						console.log(result);
						_this.model.gridData = result;
						let editRecord = null;
						lodash.forEach(_this.model.gridData, function (item, index) {
							item.rowId = index;
							item.rowStyle = null;
							item.newRecord = false;
							item.notification = null;
							item.recordStatus = uiSvc.editModes.UPDATE;
							item.initialized = false;
							_this.model.lastId++;
						});

						// see if we have an editRecord
						if ($stateParams.id) {
							let id = $stateParams.id.toUpperCase();
							let editRecord = lodash.find(_this.model.gridData, { code: id });
							if (editRecord == null) _this.functions.insertRecord(id);
							else _this.functions.editRecord(editRecord);
						}
					})
					.catch(function (err) {
						$log.error('Unable to Retrieve SLA Class List', err);
					});
			};

			_this.functions.insertRecord = function (code) {
				// routine to allow users to insert records
				let model = {
					recordStatus: uiSvc.editModes.INSERT,
					jsonData: {},
					companyId: userSvc.getOrgInfo().companyId,
					id: 0
				};
				if (code) model.code = code;
				adminDataSvc.initializeSLA(model).then(function (result) {
					model.jsonData = result.jsonData;
					model.initialized = true;
					_this.functions.showDialog(model);
				});
			};

			_this.functions.editRecord = function (record) {
				// routine to allow users to edit existing records
				if (!record.initialized) {
					adminDataSvc.initializeSLA(record).then(function (result) {
						record.jsonData = result.jsonData;
						record.initialized = true;
						_this.functions.showDialog(record);
					});
				}
				else {
					_this.functions.showDialog(record);
				}
			};

			_this.functions.showDialog = function (record) {
				// routine to bring up the editing dialog
				var dialogData = {};
				dialogData.row = angular.copy(record);

				dialogData.rows = _this.model.gridData;

				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'app/modules/admin/partials/parameter-sla-dialog.tpl.html',
					controller: 'parameterSLAEditDialogCtrl',
					controllerAs: 'vmDetail',
					backdrop: 'static',
					size: 'lg',
					resolve: {
						dialogData: dialogData
					}
				});
				modalInstance.result.then(
					function (result) {
						// refresh the data
						let type = result.recordStatus;
						result.initialized = true;
						if (type == uiSvc.editModes.INSERT && (!result.rowId || result.rowId == 0)) {
							// insert the column
							_this.model.lastId++;
							result.rowId = _this.model.lastId;
							result.rowStyle = 'recordInsert';
							result.recordStatus = uiSvc.editModes.INSERT;
							result.newRecord = true;
							_this.model.gridData.push(result);
						}
						if (type == uiSvc.editModes.DELETE) {
							// remove the entry
							if (result.newRecord) {
								// remove the entry from the list as it was an add then a delete
								result = lodash.find(_this.model.gridData, { rowId: result.rowId });

								var entry = { rowId: result.rowId };
								lodash.remove(_this.model.gridData, entry);
							}
							else {
								var recordIndex = lodash.findIndex(_this.model.gridData, { rowId: result.rowId });
								if (recordIndex > -1) {
									result.recordStatus = uiSvc.editModes.DELETE;
									result.rowStyle = 'recordDelete';
									_this.model.gridData.splice(recordIndex, 1, result);
								}
							}
						}
						if (type == uiSvc.editModes.UPDATE) {
							// update the record
							var recordIndex = lodash.findIndex(_this.model.gridData, { rowId: result.rowId });
							if (recordIndex >= -1) _this.model.gridData.splice(recordIndex, 1, result);
						}

						// update the overall record status
						_this.model.flags.allowSave = true;
						if (!result.recordStatus) result.recordStatus = uiSvc.editModes.UPDATE; //"Update"
						if (!result.rowStyle || result.rowStyle == null) result.rowStyle = 'recordUpdate';

						//_this.model.flags.gridRefresh.value += 1;

						// close the dialog
						modalInstance.close();
					},
					function () {}
				);
			};

			_this.functions.updateFunction = function () {
				// routine to post the updates to the server
				let rows = lodash.filter(_this.model.gridData, function (record) {
					return record.rowStyle != undefined && record.rowStyle != null;
				});
				adminDataSvc
					.updateSLA(rows)
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'Service Level Agreements',
							'All the SLA Class Configurations have been updated successfully !',
							5000
						);
						if (_this.model.editCode)
							$state.transitionTo(
								$state.current,
								{},
								{
									reload: 'app.admin.parameters.sla',
									inherit: false,
									notify: true
								}
							);
						else _this.functions.initialize();
					})
					.catch(function (err) {
						$log.error('Unable to Update SLA Class Configurations', err);
					});
			};

			//</editor-fold>

			// initialize the directive
			_this.functions.initialize();
		}
	]);
});
