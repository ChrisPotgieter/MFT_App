/*
 /// <summary>
 /// app.modules.spe.controllers - speGwidReportingGridViewCtrl.js
 /// Controller for SPE Gwid Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/06/2017
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'jszip'], function (module)
{
    "use strict";
    module.registerController('speGwidReportingGridViewCtrl', ['$scope', '$state','uiSvc','transactionReportingSvc','speDataSvc', function ($scope, $state, uiSvc, transactionReportingSvc, dataSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};
        _this.stateManager = {};


        _this.stateManager.persistState = function(model, grid)
        {
            // routine to persist the current grid state to the in-memory store
            let filterName = $scope.vm.model.filterName;
            transactionReportingSvc.saveBaseReportingInfo($scope.vm.model);

            // now save the current state of the grid so that we restore when the user uses the back button
            let reportingInfo = transactionReportingSvc.getBaseReportingInfo(filterName);
            reportingInfo.gridState = {};
            let gridState = uiSvc.saveKendoGridState(grid);

            if (gridState)
            {
                reportingInfo.gridState.grid = gridState;
                if (model != null)
                    reportingInfo.gridState.selectedRow = model.oid;
                else
                    reportingInfo.gridState.selectedRow = null;
            }
        };

        _this.stateManager.loadState = function(grid)
        {
            // routine to load the active state for the grid
            var reportingInfo = transactionReportingSvc.getBaseReportingInfo($scope.vm.model.filterName);
            if (reportingInfo == null)
                return;
            if (reportingInfo.gridState && reportingInfo.gridState.selectedRow)
            {
                var item = grid.dataSource.get(reportingInfo.gridState.selectedRow);
                if (item != null) {
                    var tr = $("[data-uid='" + item.uid + "']", grid.tbody);
                    grid.select(tr);
                }
                reportingInfo.gridState.selectedRow = null;
            }
        };


        _this.stateManager.initializeState = function(options)
        {
            // routine to manage the grid state initialization
            var reportingInfo = transactionReportingSvc.getBaseReportingInfo($scope.vm.model.filterName);
            if (reportingInfo == null)
                return;
            if (reportingInfo.gridState && reportingInfo.gridState.grid)
            {
                uiSvc.loadKendoGridState(options, reportingInfo.gridState.grid);
                if (reportingInfo.reset)
                    reportingInfo.gridState.grid = null;
            }
        };

        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid
            dataSvc.showGWID(model.oid);
        };

        _this.stateManager.navigateTransaction = function(id)
        {
            // routine to navigate to the transaction
            $scope.vm.functions.navigateTransaction(id, $state.$current.parent);
        };

        _this.stateManager.persistUserState = function (settingsObject)
        {
            // routine to persist the filter and grid information to a user settings object
            var grid = _this.stateManager.grid;
            var state = uiSvc.saveKendoGridState(grid);
            settingsObject.info = {filterObject: $scope.vm.model.filter, gridState: {grid: state}};
        }
    }]);
});
