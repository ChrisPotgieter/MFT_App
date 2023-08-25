/*
 /// <summary>
 /// modules.admin.directives - mqaAdmMetaDataList.js
 /// Administration Module Directive to Manage Custom Meta-Data Configuration Listing and adding new Meta-Data into the configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2021
 /// </summary>
 */

define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerDirective('mqaAdmMetaDataList', [
		'$timeout',
		'uiSvc',
		'adminDataSvc',
		'userSvc',
		function ($timeout, uiSvc, adminDataSvc, userSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaAdmMetaDataList.tpl.html',
				replace: true,
				scope: {},
				bindToController: {
					data: '='
				},
				controllerAs: 'vmMetaList',
				controller: function ($element, $scope) {
					let _this = this;

					_this.functions = {};
					_this.fields = {};

					_this.model = { gridData: [], flags: { gridRefresh: { value: 0 } } };
					_this.model.gridOptions = {
						resizable: false,
						selectable: 'row',
						noRecords: true,
						messages: {
							noRecords: 'No Records Available'
						},
						dataSource: {
							pageSize: 25,
							schema: {
								model: {
									id: 'name',
									uid: 'name'
								}
							}
						},
						columns: [
							{
								field: 'name',
								type: 'string',
								tooltip: false,
								hidden: false,
								title: 'Name',
								filterable: true
							},
							{
								field: 'width',
								title: 'Width',
								type: 'number',
								tooltip: false,
								format: '{0:n0}',
								attributes: { style: 'text-align:right;' },
								headerAttributes: { style: 'text-align:right;' }
							},
							{
								field: 'Caption',
								title: 'Caption',
								template: function (dataItem) {
									if (dataItem.filter && dataItem.filter.caption) return dataItem.filter.caption;
									return '';
								}
							},
							{
								field: 'Filterable',
								title: 'Filterable',
								width: '140px',
								template: function (dataItem) {
									if (dataItem.filter && dataItem.filter.filter_type > 0)
										return "<i class='fa fa-check'/>";
									return '';
								}
							},
							{ field: 'displayName', type: 'string', tooltip: false, hidden: false, title: 'Output Tag' }
						],
						dataBound: function (e) {
							var grid = this;
							uiSvc.dataBoundKendoGrid(grid);
						}
					};

					_this.functions.init = function () {
						// routine to initialize the directive
					};

					_this.functions.insertRecord = function () {
						// routine to be called when user choses to add a new item
						var record = { recordStatus: uiSvc.editModes.INSERT, width: 300, filter: { show: true } };
						_this.functions.showDialog(record);
					};

					_this.functions.editRecord = function (record) {
						// routine to bring up the column editor form to allow the user to edit the column they have selected
						if (!userSvc.hasFeature(userSvc.commonFeatures.ADMIN_APP)) return;
						record.recordStatus = uiSvc.editModes.UPDATE;
						if (record.filter == null) record.filter = { show: true };
						_this.functions.showDialog(record);
					};

					// setup the dialog
					let dialogDetails = {
						template: 'app/modules/admin/partials/parameter-meta-dialog.tpl.html',
						controller: 'parameterEditMetaDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(_this, dialogDetails);

					// watch for a data change
					$scope.$watch(
						'vmMetaList.data',
						function (newValue) {
							if (newValue) {
								_this.model.gridData = newValue;
								_this.model.flags.gridRefresh.value += 1;
							}
						},
						true
					);

					_this.model.gridData = _this.data;
					_this.model.lastId = _this.model.gridData.length + 1;
					_this.functions.init();
				}
			};
		}
	]);
});
