/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - crsLobActivityDialogCtrl.js
 /// Controller for the popup dialog to view activyLog for LOB
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 25/01/2023
 /// </summary>
 */
define([ 'modules/common/module' ], function (module) {
	'use strict';

	module.registerController('commonAuditDialog', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',

		function ($uibModalInstance, cacheDataSvc, dialogData, uiSvc, $scope, adminDataSvc, $timeout, userSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = dialogData.row;

			_this.functions.init = function () {
                //Remove unnecessary data from audit list
				let originalData = _this.dataModel.additional.original || [];

				let updatedData = _this.dataModel.additional.updated || [];

				delete originalData.data._events;
				delete originalData.data._handlers;
				delete originalData.data.uid;

				delete originalData._events;
				delete originalData._handlers;
				delete originalData.uid;

				delete updatedData.data._events;
				delete updatedData.data._handlers;
				delete updatedData.data.uid;

				delete updatedData._events;
				delete updatedData._handlers;
				delete updatedData.uid;
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
								description: { type: 'string', from: 'description' },
								date: { type: 'string', from: 'date' }
							}
						}
					}
				},
				columns: [
					{ field: 'id', type: 'string', tooltip: false, hidden: true },
					{ field: 'description', title: 'Description', type: 'string', tooltip: false },
					{ field: 'date', title: 'Date', type: 'string', tooltip: false }
				],
				dataBound: function (e) {
					var grid = this;
					uiSvc.dataBoundKendoGrid(grid);
				}
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'History');

			_this.functions.init();
		}
	]);
});
