/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiAtomReportingGridViewCtrl.js
 /// Controller for BOOMI Atom Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module'], function (module)
{
    "use strict";
    module.registerController('boomiAtomReportingGridViewCtrl', ['$scope', '$state','uiSvc','transactionReportingSvc',function ($scope, $state, uiSvc, transactionReportingSvc)
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
