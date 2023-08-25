/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfEmpGroupEntryListCtrl
 /// Controller to manage Employer Group Entry Management
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companie
 /// Written By :Mac Bhyat
 /// Date :27/07/2023
 /// </summary>
 */
 define([ 'modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerController('aegfEmpGroupEntryListCtrl', ['$scope', '$panelInstance', 'adminDataSvc','uiSvc', 'speCNODataSvc', function ($scope, $uibModalInstance, adminDataSvc, uiSvc, dataSvc)
	{
		// initialize the screen
		let _this = this;
		_this.functions = {};
		_this.model = {};



		//<editor-fold desc="Functions">
		_this.functions.initialize = function ()
		{
			// initialize the grid
			_this.functions.initializeGrid();

			// read the module config and set the data
			dataSvc.aegf.functions.readModuleConfig().then(function(record)
			{
				_this.model.base_record = record;
				_this.model.grid.data = [];
				if (record.jsonData.groups != null)
				{
					_this.model.grid.data = record.jsonData.groups;
					_this.model.grid.refresh.value += 1;
				}
			}).catch(function(err)
			{

			})
		};

		_this.functions.initializeGrid = function()
		{
			// routine to initialize the schedule grid for days of the month
			_this.model.grid = {data:[], refresh:{value: 0}};


			_this.model.grid.functionManager = {};
			_this.model.grid.functionManager.gridCreate = function(grid)
			{
				// once the grid is create get its reference
				_this.model.grid.obj = grid;

				// update the add button to add the row to the end
				$(".k-grid-group-entry-create", grid.element).on("click", function (e)
				{
					e.preventDefault();
					let dataSource = grid.dataSource;
					let total = dataSource.data().length;
					dataSource.insert(total, {active: true});
					dataSource.page(dataSource.totalPages());
					grid.editRow(grid.tbody.children().last());
				});
			};

			let pageSizes = dataSvc.aegf.functions.getPageSizes();
			_this.model.grid.options =	{
				pageable: {
					pageSizes: pageSizes
				},
				selectable: false,
				filterable: true,
				navigatable: true,
				height: 700,
				toolbar: [{
					name: "group-entry-create",
					text: "Add Entry",
					iconClass: "k-icon k-i-add"
				}, "excel"],
				excel: {
					fileName: "Configured Employer Groups.xlsx",
					allPages: true
				},

				dataSource:
					{
						data: _this.model.grid.data,
						pageSize: pageSizes[0],
						sort: [],
						schema: {
							model: {
								id: "crs_id",
								uid: "crs_id",
								fields: {
									crs_id: {type: "string", validation: {required: true}},
									active: {type: "boolean"}
								}
							}
						}
					},
				columns: [
					{
						field: "crs_id",
						title: "CRS Code",
						width: "120px",
					},
					{
						field: "active",
						title: "Active",
						width: "80px",
						filterable: false,
						template: function (dataItem) {
							if (!dataItem.active)
								return "<span class='badge bg-color-red txt-color-white'>No</span>";
							else
								return "<span class='badge bg-color-green txt-color-white'>Yes</span>";
						}

					}
				],
				editable: true,
				dataBound: function (e)
				{
					let grid = this;

					uiSvc.dataBoundKendoGrid(grid, null);
				}

			}
		};

		_this.functions.cancelDialog = function()
		{
			// close the window
			$uibModalInstance.dismiss('cancel');
		};
		_this.functions.confirmDialog = function()
		{
			// routine to handle the ok button update
			if (_this.model.grid.obj == null)
				return;
			let currentSelection = _this.model.grid.obj.dataSource.data();

			let groups = lodash.filter(currentSelection, function(obj)
			{
				return obj.crs_id != null;
			});

			if (groups != null)
			{
				_this.model.base_record.jsonData.groups = groups;
				adminDataSvc.updateModuleParameter(dataSvc.aegf.data.module_code, _this.model.base_record, "UI Update").then(function(result)
				{
					uiSvc.showExtraSmallPopup(dataSvc.aegf.data.module_code + " Configuration", "Configuration Update Successful !", 5000);
				});
			}
			$uibModalInstance.close({action: 0});
		};

		//</editor-fold>




		// initialize the screen
		_this.functions.initialize();
	}
	]);
});
