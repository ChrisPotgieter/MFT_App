/*
 /// <summary>
 /// app.modules.admin.controllers - parameterTemplateGroupListCtrl.js
 /// Controller to manage Editing of Template Groups
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/07/2017
 /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator', 'angular-summernote' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterTemplateGroupListCtrl', [
		'$scope',
		'$log',
		'$filter',
		'$timeout',
		'userSvc',
		'adminDataSvc',
		'uiSvc',
		function ($scope, $log, $filter,$timeout, userSvc, adminDataSvc, uiSvc) {
			// initialize the screen
			var _this = this;
			_this.model = { flags: { refresh: { value: 0 } } };
			_this.functions = {};
			_this.model.gridData = [];

			//New Record before dialog
			_this.functions.initializeNewRecord = function (row) {
				if (!row.jsonData) row.jsonData = {};
				if (!row.jsonData.templates) row.jsonData.templates = [];
				if (!row.subGridData) row.subGridData = [];
				if (!row.templateList) row.templateList = [];
				row.isDuplicate = false;
				row.newRecord = true;
				return row;
			};

			// set the record initializer
			_this.functions.initializeRecord = function (item) {
				 if (item.jsonData == null) item.jsonData = {};
				if (item.jsonData.templates == null) item.jsonData.templates = [];
				if (item.subGridData == null) item.subGridData = [];
				if (item.templateList == null) item.templateList = [];
				if (item.isDuplicate) item.isDuplicate = false;
				item.isDuplicate = false;
				// update the row ids
				lodash.forEach(item.jsonData.templates, function (row, index) {
					row.rowId == index;
				});

				lodash.forEach(item.subGridData, function (row, index) {
					row.rowId == index;
				});

				lodash.forEach(item.templateList, function (row, index) {
					row.rowId == index;
				});

				item.initialized = true;
			};

			// initialize the controller as a list editor controller
			let titleData = { title: 'Notification Template' };
			let dialogData = {
				template: 'app/modules/admin/partials/parameter-template-group-list-dialog.tpl.html',
				controller: 'parameterTemplateGroupListDialogCtrl',
				size: 'lg',
				windowClass: 'xl-modal',
				alias: 'vmDialog'
			};

			adminDataSvc.listFunctions.initializeListController(
				_this,
				'NOTIFICATION_TEMPLATE_GROUP',
				dialogData,
				titleData
			);

			_this.model.flags.allowAdd = true;

			// setup the grid options
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
					sort: [ { field: 'code', dir: 'asc' } ],
					schema: {
						model: {
							id: 'rowId',
							uid: 'rowId'
						}
					}
				},
				columns: [
					{ field: 'rowId', type: 'string', tooltip: false, hidden: true },
					{ field: 'code', title: 'Code', type: 'string', tooltip: false },
					{ field: 'description', title: 'Description', type: 'string', tooltip: false },
					{
						field: 'items',
						title: 'Details',
						filterable: false,
						template: function (dataItem) {
							var icons = { '0': 'envelope', '1': 'bell', '2': 'check-square-o', '3': 'stack-overflow' };
							if (dataItem.jsonData && dataItem.jsonData.templates) {
								var html = "<ul class='list-inline'>";

								lodash.forEach(dataItem.jsonData.templates, function (template) {
									var icon = icons[template];
									if (icon == null) return;
									html += "<li><i class='fa fa-" + icon + "'></i></li>";
								});
								html += '</ul>';
								return html;
							}
							else return '';
						}
					}
				],
				dataBound: function (e) {
					var grid = this;
					uiSvc.dataBoundKendoGrid(grid);
				}
			};

			_this.functions.update = function () {
				// routine to save the details to the database
				adminDataSvc
				.saveAuditParameter(_this.model.data, 'UI Update')
				.then(function (result) {
					uiSvc.showExtraSmallPopup(
						'WMQ Connectivity Settings',
						'The WMQ Connectivity Details have been updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
						5000,
						null,
						'fa-exclamation-triangle bounce animated'
					);

					if ($scope.vm.wizard) $scope.vm.functions.moveNext();
				})
				.catch(function (err) {
					$log.error('Unable to Update WMQ Settings', err);
				});


			
		};
			
			// initialize the screen
			_this.functions.initialize();
		}
	]);
});
