/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftMonitorReportingGridViewCtrl.js
 /// Controller for MFT Monitor Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module)
{
    "use strict";
    module.registerController('mftMonitorReportingGridViewCtrl', ['$scope', '$state','uiSvc','transactionReportingSvc', 'mftv2DataSvc', function ($scope, $state, uiSvc, transactionReportingSvc, mftv2DataSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};

        //<editor-fold desc="State Manager">
        _this.stateManager = {};
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);

        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid - this will call the persistence
            $scope.vm.functions.navigate(model.id, _this.stateManager.grid);
        };

        _this.stateManager.transactionDrill = function(id, grid)
        {
            $scope.vm.functions.transactionDrill(id, grid);
        };

        _this.stateManager.performOperation = function(value)
        {
            // routine to perform operations
            mftv2DataSvc.buildMonitorExportOperation($scope.vm.model.filter);
        };
        //</editor-fold>

    }]);
});
