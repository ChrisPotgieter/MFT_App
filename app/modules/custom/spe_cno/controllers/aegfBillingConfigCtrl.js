/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfBillingConfigCtrl.js
 /// Main Controller for the Automated Employee Group File Billing Configuration Listing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By : Mac Bhyat
 /// Date :18/04/2023
 /// </summary>
 */
define([ 'modules/custom/spe_cno/module', 'lodash'], function (module, lodash)
{
	'use strict';
	module.registerController('aegfBillingConfigCtrl', ['$scope',	'$state', '$timeout', 'uiSvc', 'transactionReportingSvc', 'speCNODataSvc',function ($scope, $state, $timeout, uiSvc, transactionReportingSvc, dataSvc)
	{
		// initialize the screen
		let _this = this;
		_this.functions = {};

		//<editor-fold desc="State Manager">
		_this.stateManager = {};
		transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);

		_this.stateManager.drill = function(model)
		{
			// routine to manage the drill on the grid - this will call the persistence
			_this.functions.navigate(model.id, _this.stateManager.grid, model.group, model.sub_group, model.copy_id);
		};
		_this.stateManager.gridCreate = function(grid)
		{
			uiSvc.addKendoGridTooltip("supplementalTooltip", grid, "supplemental");
			uiSvc.addKendoGridTooltip("statusTooltip", grid, "status_desc");

		};


		_this.stateManager.insertRecord = function(copyId)
		{
			// routine to show the insert option
			let dialogData = {};
			let controlOptions = {};
			controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/aegf-billing-config-detail-create-dialog.tpl.html";
			controlOptions.controller = "aegfBillingConfigDetailCreateDialogCtrl";
			controlOptions.controllerAs = "vmDialog";
			controlOptions.size = 'md';
			let modalInstance = uiSvc.showDialog(dialogData, controlOptions);
			modalInstance.result.then(function (result)
			{
				// close and sent to the drill
				modalInstance.close();
				_this.stateManager.drill({id: -1, group: result.group, sub_group: result.sub_group, copy_id: copyId});
			}, function (err)
			{
			});
		};

		_this.stateManager.editRecord = function(row)
		{
			// routine to edit the selected row
			_this.stateManager.drill({id: row._id, group: row.group_id, sub_group: row.sub_group_id, copy_id: null});
		};
		//</editor-fold>


		//<editor-fold desc="Processing Functions">
		_this.functions.onChangeGroup = function (employeeGroup)
		{
			//Called when user changes the group, to update the data
			if (employeeGroup == null)
				_this.model.data = [];
			else
				_this.functions.refreshData();
		};

		_this.functions.onChangeSubGroup = function (groupChange)
		{
			if (!groupChange)
				_this.functions.refreshData();
		};

		_this.functions.findAll = function()
		{
			// routine to allow the user to find all
			_this.model.groupFilter.group = null;
			_this.model.groupFilter.sub_groups = null;
			_this.functions.refreshData();
		};

		_this.functions.refreshData = function ()
		{
			// routine to perform the actual search when the user clicks the search button
			_this.model.filter.group_id = null;
			_this.model.filter.sub_groups = null;
			if (_this. model.groupFilter.group != null)
				_this.model.filter.group_id = _this.model.groupFilter.group.toString();
			if (_this.model.groupFilter.sub_groups != null)
			{
				_this.model.filter.sub_groups = lodash.map(_this.model.groupFilter.sub_groups, function (value) {
					return value.toString();
				});
			}
			dataSvc.aegf.functions.searchConfigs(_this.model.filter).then(function (result) {
				_this.model.data = dataSvc.aegf.functions.parseBillingConfigData(result.records)
			});
		};
		//</editor-fold>

		//<editor-fold desc="Initialization">

		_this.functions.initialize = function ()
		{
			// model variables
			_this.model = {flags: {inProgress: false, refresh: {value: 0}, rebuild: {value: 0}}, counts: null, filter: {}, groupFilter: {}};
			_this.model.data = [];
		};
		//</editor-fold>

		//<editor-fold desc="State Navigation">
		_this.functions.navigate = function (id, grid, group, sub_group, copy_id)
		{
			// routine to navigate the user to the agent clicked
			if (grid)
				$scope.grid = grid;
			$scope.filter = _this.model.filter;
			transactionReportingSvc.saveGridDrillState($scope, id);

			// routine to invoke the drill
			let model = {id: id, group_id: group, sub_group_id: sub_group, copy_id: copy_id};
			$state.go("app.custom.crs.billing", model);
		};
		//</editor-fold>

		// initialize the view
		_this.functions.initialize();

	}]);
});
