/*
 /// <summary>
 /// app.modules.spe.controllers - speTransactionReportingGridViewCtrl.js
 /// Controller for SPE Transaction Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/01/2017
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'jszip'], function (module, lodash, jszip)
{
    "use strict";
    window.JSZip = jszip;
    module.registerController('speTransactionReportingGridViewCtrl', ['$scope', 'transactionReportingSvc', function ($scope, transactionReportingSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};


        //<editor-fold desc="State Manager">
        _this.stateManager = {};
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);
        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid
            $scope.vm.functions.navigate(model, _this.stateManager.grid);
        };
        //</editor-fold>


    }]);
});
