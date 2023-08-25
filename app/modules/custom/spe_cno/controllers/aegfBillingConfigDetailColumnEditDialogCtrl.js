/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfBillingConfigDetailColumnEditDialogCtrl
 /// Controller to Manage Column Definition Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date:02/05/2023
 /// </summary>
 */
define([ 'modules/custom/spe_cno/module', 'lodash'], function (module, lodash)
{
	'use strict';
	module.registerController('aegfBillingConfigDetailColumnEditDialogCtrl', ['$scope',	'$filter', '$uibModalInstance', 'uiSvc', 'adminDataSvc', 'speCNODataSvc', 'dialogData', function ($scope, $filter, $uibModalInstance, uiSvc, adminDataSvc, dataSvc, dialogData)
	{
		let _this = this;
		_this.functions = {};
		_this.model = {};
		_this.dialogData = dialogData;

		//<editor-fold desc="Initialization and Dialog Control">
		_this.functions.init = function ()
		{
			// routine to initialize the screen
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEdit';

			_this.stateInfo.fields = {
				fields: {
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {}
					}
				}
			};
			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, "Column Definition");

			_this.functions.initData();
			_this.functions.initTransformations();
		};

		_this.functions.initData = function()
		{
			// routine to initialize the data for display
			_this.model.flags = {editCaption: false, allowSave: false};
			_this.model.data_source = _this.dataModel.data_source.join("");
			if (!_this.dataModel.justification)
				_this.dataModel.justification = 0;
			_this.model.justification = _this.dataModel.justification.toString();
		};

		_this.functions.showTransformationDialog = function(record)
		{
			// routine to show the transformations dialog
			let controlOptions  = {};
			controlOptions.template = "app/modules/custom/spe_cno/partials/aegf-billing-config-detail-column-edit-transformation-dialog.tpl.html";
			controlOptions.controller = "aegfBillingConfigDetailColumnTransformationEditDialogCtrl";
			controlOptions.alias = "vmDialog";
			controlOptions.size = 'md';
			adminDataSvc.listFunctions.initializeEditDialog(_this, controlOptions)(record);
		};

		_this.functions.initTransformations = function()
		{
			// routine to initialize the transformation grid
			_this.model.transformations = {refresh: { value: 0 }, data:[], rebuild:{value: 0}};
			_this.model.transformations.functionManager = {};

			_this.model.transformations.functionManager.addTransformation = function()
			{
				// routine to add a new function with default parameters
				let record = {recordStatus: uiSvc.editModes.INSERT, parameters: {}, rowId: -1};
				_this.functions.showTransformationDialog(record);
			};
			_this.model.transformations.functionManager.removeTransformationCommand = function(id)
			{
				// routine to remove the given function from the grid
				_this.model.transformations.delete_id = parseInt(id);
				const html ="<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'></span> ?";
				uiSvc.showSmartAdminBox(html,'Are you sure you wish to Delete this Transformation ?',	'[No][Yes]',_this.model.transformations.functionManager.acceptDelete);
			};

			_this.model.transformations.functionManager.acceptDelete = function(ButtonPressed)
			{
				// routine to delete the selected transformation
				if (ButtonPressed != 'Yes')
					return;

				// remove the record
				const entry = { rowId: _this.model.transformations.delete_id};
				lodash.remove(_this.model.gridData, entry);
			};
			_this.model.transformations.functionManager.editTransformation = function(record)
			{
				_this.functions.showTransformationDialog(record);
			};
			_this.model.transformations.options = {
				sortable: false,
				groupable: false,
				filterable: true,
				columnMenu: true,
				resizable: false,
				pageable: false,
				selectable: 'row',
				toolbar:[],
				dataSource: {
					data: [],
					pageSize: 1000,
					schema:
					{
						id: { type: 'string' },
						function: { type: 'string', from: 'function' },
						parameter: { type: 'string', from: 'parameter' },
						action: { type: 'string', from: 'action' }
					}
				},
				columns: [
					{ field: 'id', type: 'string', tooltip: false, hidden: true },
					{ field: 'function', title: 'Function', type: 'string', tooltip: false,
					   template: function (dataItem, e)
						{
							return dataItem.function.toUpperCase();
						}
					},
					{
						field: 'parameter',
						title: 'Parameter',
						template: function (dataItem, e)
						{
							return $filter("cnoAegfTransformationFilter")(dataItem);
						}
					},
					{
						field: "action",
						title: "Action",
						columnMenu: false,
						width: "100px",
						template: function (dataItem) {
							let button = "<button class='btn bg-color-red txt-color-white' ng-click=\"functionManager.removeTransformationCommand(\'" + dataItem.rowId + "\');\"><i class=\"fa fa-trash-o\"></i></button>";
							return button;
						}
					},
				],
				dataBound: function (e) {
					let grid = this;

					uiSvc.dataBoundKendoGrid(grid, _this.model.transformations.functionManager.editTransformation);
				}
			};
		};

		// Update the caption in the header
		_this.functions.toggleCaption = function ()
		{
			_this.model.flags.editCaption = !_this.model.flags.editCaption;
		};
		//</editor-fold>

		//<editor-fold desc="Admin Framework Overrides">
		_this.functions.onRender= function()
		{
			// routine to override the render function to add the add transformation toolbar
			_this.model.transformations.options.toolbar.push({name: "Column", text:"Column Definitions", template: kendo.template($("#templateAdd").html())});
			_this.model.gridData = [];
			_this.model.lastId = -1;
			if (_this.dataModel.transformations != null)
			{
				lodash.forEach(_this.dataModel.transformations, function(row, index)
				{
					row.rowId = index;
					_this.model.lastId++;
					row.recordStatus = uiSvc.editModes.UPDATE;
					_this.model.gridData.push(row);
				});
			}
			_this.model.transformations.rebuild.value += 1;
		};
		_this.functions.onSaveRecord = function (record)
		{
			// override the save to validate and update the transformation array
			record.justification = parseInt(_this.model.justification);

			// build the transformations
			record.transformations = lodash.map(_this.model.gridData, function(row)
			{
				return {function: row.function, parameters: row.parameters};
			});
			return record;
		};
		//</editor-fold>

		// initialize the screen
		_this.functions.init();
	}]);
});
