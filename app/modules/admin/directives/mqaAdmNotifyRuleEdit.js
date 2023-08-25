/*
 /// <summary>
 /// modules.admin.directives - mqaAdmNotifyRuleEdit.js
 /// Administration Module Directive to Manage Notification Rule Events Edit
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/07/2017
 /// </summary>
 */

 define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';
	module.registerDirective('mqaAdmNotifyRuleEdit', [
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
				templateUrl: 'app/modules/admin/directives/mqaAdmNotifyRuleEdit.tpl.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.functions = {};
					_this.model = { flags: {}, lists: { notificationGroups: [], templateGroups: [] } };
					_this.dataModel = _this.data;

					//setup rule event dialog details
					let dialogNotifyRuleEventDetails = {
						template: 'app/modules/admin/partials/parameter-notify-rule-event-dialog.tpl.html',
						controller: 'parameterNotifyRuleEventDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showNotifyRuleEventDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogNotifyRuleEventDetails,
						'Notification Event'
					);

					//Edit Rule event //Open dialog to edit
					_this.functions.editEvent = function (item) {
						var entry = lodash.find(_this.data.jsonData.events, { eventCode: item.eventCode });
						_this.model.gridData = _this.data.jsonData.events;
						_this.model.editRow = angular.copy(entry);
						_this.functions.getList();
						var entry = lodash.find(_this.data.jsonData.events, {
							eventCode: _this.model.editRow.eventCode
						});

						//Set in create or er edit mode
						if (entry != null && entry.notifyGroups.length > 0) {
							_this.model.rowId = 2;
						}
						else {
							_this.model.rowId = -1;
						}

						//Open dialog
						_this.functions.showNotifyRuleEventDialog(_this.model);
					};

					// get the lists
					_this.functions.getList = function () {
						if (_this.data != null) {
							adminDataSvc
								.readCustomerLists({ companyId: 2, type: 'NotifyGroup' })
								.then(function (result) {
									_this.model.lists.notificationGroups = result;

									_this.model.lists.notificationGroups.push({
										code: 'sys-inline',
										description: 'In-Line Recipients',
										companyId: 2,
										recordStatus: uiSvc.editModes.DUMMY,
										id: 0
									});
								})
								.catch(function (err) {
									$log.error('Unable to retrieve Notification Groups');
								});
							adminDataSvc
								.readCustomerLists({ companyId: 2, type: 'TemplateGroup' })
								.then(function (result) {
									_this.model.lists.templateGroups = result;
								})
								.catch(function (err) {
									$log.error('Unable to retrieve Template Groups');
								});
						}
					};
					//setup the grid
					_this.functions.initializeGrid = function () {
						_this.model.flags.gridRefresh = { value: 0 };
						_this.model.gridOptions = {
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
										id: 'eventCode',
										uid: 'eventCode',
										fields: {
											type: { type: 'string' }
										}
									}
								}
							},
							columns: [
								{
									field: 'eventCode',
									title: 'Event'
								},
								{
									field: 'description',
									title: 'Description'
								},
								{
									field: 'apply',
									title: ' ',
									width: '100px',
									template: function (dataItem) {
										var entry = lodash.find(_this.data.jsonData.events, {
											eventCode: dataItem.eventCode
										});
										if (entry != null && entry.notifyGroups.length > 0)
											return "<ul class='list-unstyled'><li class='text-success'><i class='fa fa-bell fa-lg'/></li></ul>";
										return '';
									}
								}
							]
						};
					};

					_this.functions.initialize = function () {
						_this.functions.initializeGrid();
						_this.functions.getList();
					};

					//Watch if data added/edit then refresh grid
					$scope.$watch(
						'vmDirective.data.jsonData.events',
						function (newValue) {
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



