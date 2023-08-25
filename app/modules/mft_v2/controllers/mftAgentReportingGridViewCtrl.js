/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftAgentReportingGridViewCtrl.js
 /// Controller for MFT Agent Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module)
{
    "use strict";
    module.registerController('mftAgentReportingGridViewCtrl', ['$scope', '$state','uiSvc','transactionReportingSvc',function ($scope, $state, uiSvc, transactionReportingSvc)
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
        //</editor-fold>


    }]);
});
