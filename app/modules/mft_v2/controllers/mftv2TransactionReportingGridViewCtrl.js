/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftv2TransactionReportingGridViewCtrl.js
 /// Controller for MFT Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module)
{
    "use strict";
    module.registerController('mftv2TransactionReportingGridViewCtrl', ['$scope', 'mftv2DataSvc', 'transactionReportingSvc', function ($scope, mftv2DataSvc, transactionReportingSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};

        //<editor-fold desc="State Manager">
        _this.stateManager = {};

        // initialize the default custom report
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);
        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid
            $scope.vm.functions.navigate(model.transactionId, _this.stateManager.grid);
        };
        //</editor-fold>

        //<editor-fold desc="Functions">

        _this.functions = {};
        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill
            if (data.caption == "Total Errors")
            {
                let filter = $scope.vm.functions.getTransactionFilter();
                let data = {apiName:"mftv2TransactionErrors", filter: filter};
                mftv2DataSvc.showErrorSummary(data, _this.stateManager.drill);
            }
        };

        _this.stateManager.performOperation = function(value)
        {
            // routine to perform operations
            mftv2DataSvc.buildTransactionExportOperation($scope.vm.functions.getTransactionFilter());
        };

        //</editor-fold>

    }]);
});
