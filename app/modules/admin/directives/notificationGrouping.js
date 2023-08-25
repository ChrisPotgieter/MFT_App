define([ 'modules/admin/module', 'lodash'], function (module, lodash) {
	'use strict';
	module.registerDirective('notificationGrouping', [
		'$timeout',
		'$log',
		'adminDataSvc',
		'uiSvc',
		function ($timeout, $log, adminDataSvc, uiSvc) {
			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					data: '=',
					refreshFlag: '=',
					functionManager: '=?'
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/admin/directives/notificationGrouping.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.functions = {};
					_this.model = { flags: { watched: false, gridRefresh: { value: 0 } } };
					_this.dataModel = _this.data;

					_this.functions.refreshSubGrid = function () {
						// routine to refresh the subgrid when the data changes
						_this.dataModel.subGridData = lodash.filter(_this.data.templateList, function (record) {
							return record.type < 90;
						});
					};

					_this.functions.getTemplateList = function () {
						console.log("GetTempalteList")
						// routine to query the server and get the template list
						if (!_this.data.isDuplicate) {
							adminDataSvc
								.buildTemplateList(_this.data.companyId, _this.data.code)
								.then(function (result) {
									// exclude any email subject templates
									_this.data.templateList = result;
									_this.functions.refreshSubGrid();
								})
								.catch(function (err) {
									$log.error('Unable to get Template List', err);
								});
						}
						else _this.functions.refreshSubGrid();
					};

					// routine to setup the sub grid
					_this.functions.gridSetup = function () {
						_this.model.subGridDataOptions = {
							sortable: true,
							groupable: false,
							filterable: false,
							columnMenu: false,
							resizable: false,
							pageable: {
								pageSizes: true
							},
							selectable: 'row',

							dataSource: {
								data: [],
								pageSize: 10,
								schema: {
									model: {
										id: 'type',
										uid: 'type',
										fields: {
											type: { type: 'number' }
										}
									}
								}
							},
							columns: [
								{
									field: 'type',
									title: 'Type',
									template: function (dataItem) {
										switch (dataItem.type) {
											case 0:
												return 'EMAIL';
											case 1:
												return 'ALERT';
											case 2:
												return 'TASK LIST';
											case 3:
												return 'QUEUE';
										}
									}
								},
								{
									field: 'description',
									title: 'Description',
									template: function (dataItem) {
										switch (dataItem.type) {
											case 0:
												return 'Email Notification Template';
											case 1:
												return 'Desktop Alert Notification Template';
											case 2:
												return 'User Task List Template';
											case 3:
												return 'Message Queue Notification Template';
										}
									}
								},
								{
									field: 'apply',
									title: ' ',
									width: '100px',
									template: function (dataItem) {
										var entry = lodash.find(_this.data.templateList, { type: dataItem.type });
										if (entry.content != undefined && entry.content != null)
											return "<ul class='list-unstyled'><li class='text-success'><i class='fa fa-file-text fa-lg'/></li></ul>";
										return '';
									}
								}
							],
							dataBound: function (e) {
								var grid = this;
								uiSvc.dataBoundKendoGrid(grid);
							}
						};
					};

					_this.functions.initialize = function () {
						// routine to initialize the form
						_this.functions.getTemplateList();
						_this.functions.gridSetup();
					};

					// setup Templates dialog
					let dialogDetails = {
						template: 'app/modules/admin/partials/mqaAdmTemplateGroupEditDialog.tpl.html',
						controller: 'mqaAdmTemplateGroupEditDialog',
						alias: 'vmDialog'
					};
					_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogDetails,
						'Templates'
					);

					//Edit existing record
					_this.functions.editRecord = function (record) {
						
						_this.model.gridData = _this.data.subGridData;
						record.recordStatus = uiSvc.editModes.UPDATE;
						record.isNew = false;
						//	record.code = _this.data.code;

						if (record.content != null) {
							record.rowId = _this.data.rowId;
						}
						//Cant edit if record is being duplicated
						if (_this.data.isDuplicate === false) {
							_this.functions.showDialog(record);
						}
					};

					//Refresh grid on data change
					$scope.$watch(
						'vmDirective.data',
						function (newValue, oldValue) {
							_this.model.flags.gridRefresh += 1;
						},
						true
					);

					_this.functions.initialize();
				}
			};
		}
	]);
});
