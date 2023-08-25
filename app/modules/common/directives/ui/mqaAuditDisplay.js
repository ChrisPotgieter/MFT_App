/*
 /// <summary>
 /// modules.common.directives.ui - mqaAuditDisplay.js
 /// Common Directive to show Audit history in list form
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07/04/2021
 /// </summary>
 */

define(
	[
		'modules/common/module',
		'lodash',
		'beautify',
		'beautify.html',
		'pako',
		'codemirror',
		'angular-codemirror',
		'codemirror-edi',
		'codemirror-fold',
		'codemirror-xml',
		'codemirror-js',
		'codemirror-html'
	],
	function (module, lodash, beautify_json, beautify_html) {
		'use strict';
		module.registerDirective('mqaAuditDisplay', [
			'$timeout',
			'adminDataSvc',
			'cacheDataSvc',
			'uiSvc',
			function ($timeout, adminDataSvc, cacheDataSvc, uiSvc) {
				return {
					restrict: 'E',
					templateUrl: 'app/modules/common/directives/ui/mqaAuditDisplay.tpl.html',
					scope: {},
					bindToController: {
						data: '='
					},
					controllerAs: 'vmAudit',
					controller: function ($element, $scope) {
						var _this = this;
						_this.functions = {};
						_this.model = {};
						// setup audit display dialog
						let dialogDetails = {
							template: 'app/modules/common/partials/common-audit-dialog.tpl.html',
							controller: 'commonAuditDialog',
							size:'lg',
							alias: 'vmDialog'
						};
						_this.functions.showActivityDialog = adminDataSvc.listFunctions.initializeEditDialog(
							_this,
							dialogDetails,
							'Audit History'
						);

						//Edit list in Audit display
						_this.functions.editRecord = function (row) {
							_this.functions.showActivityDialog(row);
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
											eventDate: { type: 'string', from: 'eventDate' },
											description: { type: 'string', from: 'description' },
											user: { type: 'string', from: 'user' },
											auditType: { type: 'string', from: 'auditType' }
										}
									}
								}
							},
							columns: [
								{ field: 'id', type: 'string', tooltip: false, hidden: true },
								{
									field: 'event_date',
									title: 'Event Date',
									template: function (dataItem) {
										return dataItem.event_date.substring(0, 10);
									}
								},
								{ field: 'description', title: 'Description', type: 'string', tooltip: false },
								{ field: 'user.name', title: 'User', type: 'string', tooltip: false },
								{
									field: 'auditType',
									title: 'Audit Type',
									template: function (dataItem) {
										switch (dataItem.audit_type) {
											case 999:
												return 'Admin';
												break;

											default:
												return '';
												break;
										}
										return '';
									}
								}
							],
							dataBound: function (e) {
								var grid = this;
								uiSvc.dataBoundKendoGrid(grid);
							}
						}; 
					}
				};
			}
		]);

	}
);
