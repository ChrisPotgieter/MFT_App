/*
 /// <summary>
at
 /// Date: 02/09/2021
 /// </summary>
 */

define([ 'modules/admin/module'], function (module) {
	'use strict';

	module.registerDirective('mqaNotifyEndPointList', [
		'$timeout',
		'uiSvc',
		'adminDataSvc',
		function ($timeout, uiSvc, adminDataSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaNotifyEndPointList.html',
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
					_this.model = {gridData: _this.data, flags: { gridRefresh: { value: 0 } } };
					
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
							schema: {
								model: {
									id: 'id',
									uid: 'id',
									fields: {
										id: { type: 'string', from: 'id' },
										code: { type: 'string', from: 'code ' },
										endpoint: { type: 'string', from: 'endpoint' },
										template: { type: 'string', from: 'templatePath ' },
										requestType: { type: 'string', from: 'requestType' }
									}
								}
							}
						},
						columns: [
							{
								field: 'id',
								title: 'Code',
								hidden: false
							},
							{
								field: 'url',
								title: 'Api End Point',
								hidden: false
							},
							{
								field: 'templatePath ',
								title: 'Template ',
								hidden: false
							},
							{
								field: 'requestType',
								title: 'Request Type',
								hidden: false,
								template: function (dataItem) {
								
										var html = "<ul class='list-inline'>";
										if (dataItem.requestType ===  0)
											html +=
												"<li><span>Post</span></li>"
												
										if (dataItem.requestType === 1)
											html +=
												"<li><spam>Get</span></li>";
										
										html += '</ul>';
										return html;
									
								}
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
							id: '',
							requestType: '0',
							requestContentType: 'JSON',
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

					// setup Endpoint dialog
					let dialogDetails = {
						template: 'app/modules/admin/partials/parameter-notify-endPointDialog.tpl.html',
						controller: 'parameterNotifyEndPointEditDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogDetails,
						'End Point'
					);
				}
			};
		}
	]);
});
