/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfEmpGroupListCtrl
 /// Controller to manage Employer Group and Sub Group Listing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companie
 /// Written By :Chris Potgieter
 /// Date :24/03/2023
 /// </summary>
 */
 define([ 'modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerController('aegfEmpGroupListCtrl', ['$scope','$timeout', 'adminDataSvc',	'uiSvc', 'speCNODataSvc', function ($scope, $timeout, adminDataSvc, uiSvc, dataSvc)
	{
		// initialize the screen
		let _this = this;
		_this.functions = {};


		//<editor-fold desc="Admin Framework Overrides">
		_this.functions.initializeRecord = function (item)
		{
			if (item.jsonData == null) item.jsonData = {};
			if (item.jsonData.sub_groups == null) item.jsonData.sub_groups = [];

			// update the row ids
			lodash.forEach(item.jsonData.sub_groups, function (row, index) {
				row.rowId == index;
			});

			item.initialized = true;
		};
		//</editor-fold>

		//<editor-fold desc="Initialization">
		_this.stateManager = {};


		_this.stateManager.performOperation = function(value)
		{
			// open the dialog that will initiate a sync of the Employer Group Data
			switch (value)
			{
				case 0:
					_this.functions.performSync(true);
					break;
				case 1:
					_this.functions.showConfigGroups();
					break;
			}
		};

		_this.functions.showConfigGroups = function()
		{
			// routine to show a list of the configured groups
			let controlOptions = {};
			let record = {};
			controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/aegf-emp-group-entry-list.tpl.html";
			controlOptions.controller = "aegfEmpGroupEntryListCtrl";
			controlOptions.controllerAs = "vmDialog";
			let modalInstance = uiSvc.showSlideOutDialog(record, controlOptions);

			modalInstance.result.then(function (result) {
				// refresh the display
				modalInstance.close();

				switch (result.action) {
					case 0:
						_this.functions.performSync(false);
						break;
				}
			}, function (err) {
			});
		};

		_this.functions.initializeAdminFramework = function ()
		{
			// initialize the admin framework
			let base_code = "AEGF_GROUP";
			let titleData = { title: 'Employer Group Listing' };
			let dialogData = {
				template: 'app/modules/custom/spe_cno/partials/aegf-emp-group-dialog.tpl.html',
				controller: 'aegfEmpGroupEditDialogCtrl',
				alias: 'vmDialog'
			};

			adminDataSvc.listFunctions.initializeListController(_this, base_code, dialogData, titleData);

			_this.functions.initializeRecord = function(item)
			{
				// routine to initialize the record for display
				let sub_groups = lodash.map(item.jsonData.sub_groups, function(item)
				{
					return item.description;
				});
				item.sub_groups = sub_groups.join(",");
				item.group_code = null;
				if (item.jsonData.crs_number && item.jsonData.crs_number != "")
					item.group_code = item.jsonData.crs_number;

				// check if the group is inactive
				if (item.jsonData.status != null && item.jsonData.status == 0)
					item.rowStyle = 'recordDelete';
			};

			_this.model.base_code = base_code;
			_this.model.flags.allowAdd = true;
			_this.model.flags.allowId = false;
			_this.model.flags.rebuild = {value: 0};
			_this.model.flags.refresh = {value: 0};

			// setup the grid options
			let pageSizes = dataSvc.aegf.functions.getPageSizes();
			_this.model.gridOptions = {
				sortable: false,
				groupable: false,
				filterable: true,
				columnMenu: false,
				resizable: false,
				pageable: {
					pageSizes: pageSizes
				},
				toolbar: [ 'excel' ],
				excel: {
					fileName: 'Employer Groups Listing.xlsx',
					allPages: true
				},
				excelExport: uiSvc.excelExport,
				selectable: 'row',
				dataSource: {
					data: _this.model.gridData,
					pageSize: pageSizes[0],
					sort: [],
					schema: {
						model: {
							id: 'id',
							uid: 'id',
							fields: {
								id: { type: 'string', from: 'id' },
								description: { type: 'string'},
								group_code:{type:"string"},
								sub_groups: { type: 'string' }
							}
						}
					}
				},
				columns: [
					{
					  field: 'id',
					  type: 'string',
					  tooltip: false,
					  hidden: true
					},
					{
						field: 'description',
						title: 'Employer Group Name',
						type: 'string',
						tooltip: false,
					},
					{
						field:"group_code",
						title:"CRS Code",
						type:"string",
						width:"150px"
					},
					{
						field: 'sub_groups',
						title: 'Sub-Group(s)',
						filterable: false,
						width:"800px",
						template: function (dataItem) {
							if (dataItem.jsonData && dataItem.jsonData.sub_groups) {
								let html = "<ul class='list-unstyled'>";
								let count = dataItem.jsonData.sub_groups.length;
								lodash.forEach(dataItem.jsonData.sub_groups, function (item, index)
								{
									html += "<li> <span class='badge bg-color-blueDark txt-color-white'>";
									if (index > 5)
									{
										html += (count - index + 1).toString() + " more...</span></li>";
										return false;
									}
									html += item.description +'</span></li>';
								});
								return html;
							}
						}
					}
				],
				dataBound: function (e) {
					let grid = this;
					uiSvc.dataBoundKendoGrid(grid, _this.functions.editRecord);
				}
			};
			$timeout(function()
			{
				// be careful with this setting of time as it needs to be faster then the get of the data otherwise we will have timing issues
				_this.model.gridOptions.toolbar.push({name: "Sync", text:"Sync", template: kendo.template($("#templateAdd").html())});
				_this.model.flags.rebuild.value += 1;
			}, 20);
		};
		
		_this.initialize = function ()
		{
			_this.functions.initializeAdminFramework();
			_this.functions.initialize(false);
		};

		_this.functions.performSync = function(ask)
		{
			// routine to perform the sync operation for the group sync
			let cliOperation = {
				ui:
					{
						question: "Refresh Employer Groups from CRS",
						class: "txt-color-teal",
						icon: "fa fa-refresh",
						description: "Sync Employer Groups"
					},
				operation: dataSvc.cliInstructionEnum.AEGF_GROUP_SYNC,
				class: 'txt-color-teal'
			};
			cliOperation.record = {};
			cliOperation.completeFunction = function (result, instructionData, isError)
			{
				// create a complete function
				if (!isError)
				{
					uiSvc.showExtraSmallPopup("Employer Group Sync", 'Sync Completed successfully !',	5000);
					dataSvc.aegf.functions.getLists();
				}
				_this.functions.initialize(false);
			};
			if (ask)
				dataSvc.confirmCLIOperation(cliOperation);
			else
				dataSvc.invokeCLIOperation(cliOperation);
		}
		//</editor-fold>

		// initialize the screen
		_this.initialize();
	}
	]);
});
