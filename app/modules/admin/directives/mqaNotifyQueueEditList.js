/*
 /// <summary>
at
 /// Date: 02/09/2021
 /// </summary>
 */

define([ 'modules/admin/module'], function (module) {
	'use strict';

	module.registerDirective('mqaNotifyQueueEditList', [
		'$timeout',
		'uiSvc',
		'adminDataSvc',
		function ($timeout, uiSvc, adminDataSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaNotifyQueueEditList.html',
				replace: true,
				scope: {},
				bindToController: {
					data: '='
				},
				controllerAs: 'vmDirective',
				controller: function ($element, $scope) {
					let _this = this;

					_this.functions = {};
					_this.fields = {};

					_this.model = { gridData: _this.data, flags: { gridRefresh: { value: 0 } } };
					_this.model.gridOptions = {
						sortable: true,
						groupable: false,
						filterable: true,
						columnMenu: true,
						resizable: false,
						pageable: {
							pageSizes: true
						},
						selectable: 'row',

						dataSource: {
							data: [],
							pageSize: 10,
							sort: [ { field: 'queueName', dir: 'asc' } ],
							schema: {
								model: {
									id: 'id',
									uid: 'id',
									fields: {
										id: { type: 'string', from: 'id' },
										queueManager: { type: 'string', from: 'queueManager' },
										queue: { type: 'string', from: 'queue' }
									}
								}
							}
						},
						columns: [
							{
								field: 'id',
								title: 'Id',
								hidden: true
							},
							{
								field: 'queue',
								title: 'Queue',
								hidden: false
							},
							{
								field: 'queueManager',
								title: 'Queue Manager',
								hidden: false
							}
						],
						dataBound: function (e) {
							var grid = this;
							uiSvc.dataBoundKendoGrid(grid);
						}
					};

					_this.functions.insertRecord = function () {
						// routine to be called when user choses to add a new item
						var record = {
							id: 'new_' + _this.model.gridData.length + 1,
							isNew: true,
							newRecord: true,
							recordStatus: uiSvc.editModes.INSERT
						};

						_this.functions.showDialog(record);
					};

					_this.functions.editRecord = function (record) {
						// routine to bring up the column editor form to allow the user to edit the column they have selected
						//if record create and no row id assigned, assign one
						if (!record.rowId) {
							record.rowId = _this.data.length + 1;
						}
						record.recordStatus = uiSvc.editModes.UPDATE;
						record.isNew = false;
						_this.functions.showDialog(record);
					};

					// setup Queue dialog
					let dialogDetails = {
						template: 'app/modules/admin/partials/parameter-notify-queeuEditDialog.tpl.html',
						controller: 'parameterNotifyQueueEditDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogDetails,
						'Queue'
					);
				}
			};
		}
	]);
});
