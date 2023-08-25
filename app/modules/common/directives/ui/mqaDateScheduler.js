/*
 /// <summary>
 /// modules.common.directives.ui - mqaDateScheduler.js
 /// Directive to schedule a date
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 119/04/2023
 */

define([ 'modules/common/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerDirective('mqaDateScheduler', [
		'$timeout',
		'uiSvc',
		'adminDataSvc',
		function ($timeout, uiSvc, adminDataSvc) {
			return {
				restrict: 'EA',
				templateUrl: 'app/modules/common/directives/ui/mqaDateScheduler.tpl.html',
				scope: {},
				replace: true,
				bindToController: {
					pauseBeforeSubmit: '=',
					skipDays: '=',
					check: '='
				},
				controllerAs: 'vmDate',
				controller: function ($scope, $element) {
					var _this = this;
					_this.model = { flags: { refresh: { value: 0 } }, gridData: [] };
					_this.functions = {};

					//New Record before dialog
					_this.functions.initializeNewRecord = function (row) {
						if (!row.jsonData) row.jsonData = {};
						row.newRecord = true;
						return row;
					};

					// set the record initializer
					_this.functions.initializeRecord = function (item) {
						if (item.jsonData == null) item.jsonData = {};

						// update the row ids
						lodash.forEach(item, function (row, index) {
							row.rowId == index;
						});

						item.initialized = true;
					};

					// setup the grid options
					_this.model.gridOptions = {
						sortable: false,
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
							sort: [],
							schema: {
								model: {
									id: 'id',
									uid: 'id',
									fields: {
										id: { type: 'string', from: 'id' },
										day: { type: 'string', from: 'day' },
										date: { type: 'string', from: 'time' },
										time: { type: 'string', from: 'time' }
									}
								}
							}
						},
						columns: [
							{ field: 'id', type: 'string', tooltip: false, hidden: true },
							{
								field: 'day',
								title: 'Day',
								template: function (dataItem) {
									const weekday = [
										'Sunday',
										'Monday',
										'Tuesday',
										'Wednesday',
										'Thursday',
										'Friday',
										'Saturday'
									];

									let day = weekday[dataItem.date.getDay()];

									return day;
								}
							},
							{
								field: 'date',
								title: 'Date',
								template: function (dataItem) {
									const day = dataItem.date.getDay();
									const month = dataItem.date.getMonth() + 1;
									const year = dataItem.date.getFullYear();
									return dataItem.date
								}
							},
							{
								field: 'time',
								title: 'Time',
								template: function (dataItem) {
									return dataItem.time.getHours() + ':' + dataItem.time.getMinutes();
								}
							}
						],
						dataBound: function (e) {
							var grid = this;
							uiSvc.dataBoundKendoGrid(grid);
						}
					};

					// dialog detail for day add
					let dialogDetailsFixedDays = {
						template: 'app/modules/common/partials/common-date-scheduler-days-dialog.tpl.html',
						controller: 'commonDateSchedulerDayDialog',
						size: 'sm',
						windowClass: 'xs-modal',
						alias: 'vmDialog'
					};

					_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogDetailsFixedDays,
						'Day'
					);

					_this.model.flags.allowAdd = true;
					//	_this.model.flags.allowId = false;

					//When batch type drop down value changed reset data
					_this.functions.batchTypeChange = function () {
						_this.model.gridData = [];

						if(_this.model.batchType !='FixedDays')
						{
							_this.functions.insertDay();
						}
					};

					//Open dialog add trecord to daylist
					_this.functions.insertDay = function () {
						let record = {
							day: 0 || _this.model.gridData.length + 1,
							batchType: _this.model.batchType,
							skipDay: _this.model.skipDate,
							recordStatus: uiSvc.editModes.INSERT
						};
						_this.functions.showDialog(record);
					};

					//edit day
					_this.functions.editDay = function (record) {
						record.rowId = record.day;
						record.date = new Date(record.date);
						record.time = new Date(record.time);
					//	record.rowStyle = "recordInsert";
						record.recordStatus = uiSvc.editModes.UPDATE;
						record.initialized = true;
						_this.functions.showDialog(record);
					};
				}
			};
		}
	]);
});
