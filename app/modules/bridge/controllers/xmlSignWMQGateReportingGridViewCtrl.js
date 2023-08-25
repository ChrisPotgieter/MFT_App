/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateReportingGridViewCtrl.js
 /// Controller for XML Sign WMQ Gateway Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/04/2022
 /// </summary>
 */
define(['modules/bridge/module'], function (module)
{
    "use strict";
    module.registerController('xmlSignWMQGateReportingGridViewCtrl', ['$scope', 'transactionReportingSvc', function ($scope, transactionReportingSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};

        //<editor-fold desc="State Manager">
        _this.stateManager = {};

        // initialize the default custom report
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);
        //</editor-fold>

        //<editor-fold desc="Functions">
        _this.functions = {};
        //</editor-fold>

    }]);
});
