/*
 /// <summary>
 /// app.modules.admin.controllers - parameterNotifyGroupListCtrl.js
 /// Controller to manage Editing of Notification Groups
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 24/06/2017
  /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator', 'angular-jsoneditor' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyGroupListCtrl', [
		'$scope',
		'$log',
		'userSvc',
		'adminDataSvc',
		'cacheDataSvc',
		'uiSvc',
		function ($scope, $log, userSvc, adminDataSvc, cacheDataSvc, uiSvc) {
			var _this = this;

			// add the initial data
			_this.model = { gridData: [] };
			_this.functions = {};

			_this.model.mainCaption = 'Add Group...';

			//New Record before dialog
			_this.functions.initializeNewRecord = function (row) {
				if (!row.jsonData) row.jsonData = {};
				if (!row.jsonData.users) row.jsonData.users = [];
				if (!row.jsonData.roles) row.jsonData.roles = [];
				if (!row.jsonData.queues) row.jsonData.queues = [];
				if (!row.jsonData.endPoints) row.jsonData.endPoints = [];
				row.newRecord = true;
				return row;
			};

			// set the record initializer
			_this.functions.initializeRecord = function (item) {
				if (item.jsonData == null) item.jsonData = {};
				if (item.jsonData.users == null) item.jsonData.users = [];
				if (item.jsonData.roles == null) item.jsonData.roles = [];
				if (item.jsonData.queues == null) item.jsonData.queues = [];
				if (item.jsonData.endPoints == null) item.jsonData.endPoints = [];

				// update the row ids
				lodash.forEach(item.jsonData.queues, function (row, index) {					
					row.rowId = index;
					row.newRecord = false;
					row.code = row.queue+"@"+ row.queueManager;
				});

				lodash.forEach(item.jsonData.endPoints, function (row, index) {
					row.rowId = index;
					row.newRecord = false;
					row.code = row.id;
				});

				item.initialized = true;
			};

			// initialize the controller as a list editor controller
			let titleData = { title: 'Notification Group' };
			let dialogData = {
				template: 'app/modules/admin/partials/parameter-notify-groupListDialog.tpl.html',
				controller: 'parameterNotifyGroupListDialogCtrl',
				size: 'lg',
				windowClass: 'xl-modal',
				alias: 'vmDialog'
			};

			adminDataSvc.listFunctions.initializeListController(_this, 'NOTIFICATION_GROUP', dialogData, titleData);
			_this.model.flags.allowAdd = true;


			_this.functions.update = function () {
				// routine to save the details to the database
				adminDataSvc
					.saveAuditParameter(_this.model.data, 'UI Update')
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'Notify group Settings',
							'The Notify group Details have been updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
							5000,
							null,
							'fa-exclamation-triangle bounce animated'
						);

						if ($scope.vm.wizard) $scope.vm.functions.moveNext();
					})
					.catch(function (err) {
						$log.error('Unable to Update SMTP Settings', err);
					});

					console.log(_this.model)
			};


			// setup the grid options
			let options = lodash.cloneDeep(uiSvc.getKendoGridMetaConfigGridOptions(_this.stateInfo));

			options.columns = lodash.remove(options.columns, function (col) {
				return col.field === 'description';
			});
			_this.model.grid = {};
			let display = {
				field: 'items',
				title: 'Details',
				filterable: false,
				template: function (dataItem) {
					if (dataItem.jsonData && dataItem.jsonData != '') {
						var html = "<ul class='list-inline'>";
						if (dataItem.jsonData.users)
							html +=
								"<li>Users <span class='badge bg-color-blue txt-color-white'>" +
								dataItem.jsonData.users.length +
								'</span></li>';
						if (dataItem.jsonData.roles)
							html +=
								"<li>Roles <span class='badge bg-color-blueDark txt-color-white'>" +
								dataItem.jsonData.roles.length +
								'</span></li>';
						if (dataItem.jsonData.queues)
							html +=
								"<li>Queues <span class='badge bg-color-purple txt-color-white'>" +
								dataItem.jsonData.queues.length +
								'</span></li>';
						if (dataItem.jsonData.endPoints)
							html +=
								"<li>API End Points <span class='badge bg-color-orange txt-color-white'>" +
								dataItem.jsonData.endPoints.length +
								'</span></li>';
						html += '</ul>';
						return html;
					}
					else return '';
				}
			};
			options.columns.push(display);

			_this.model.gridOptions = options;
			// initialize the screen
			_this.functions.initialize();
		}
	]);
});
