/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiTransactionReportingGridViewCtrl.js
 /// Controller for Boomi Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/10/2022
 /// </summary>
 */
define(['modules/boomi/module'], function (module)
{
    "use strict";
    module.registerController('boomiTransactionReportingGridViewCtrl', ['$scope', 'boomiDataSvc', 'transactionReportingSvc', function ($scope, dataSvc, transactionReportingSvc)
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
        //</editor-fold>

    }]);
});
