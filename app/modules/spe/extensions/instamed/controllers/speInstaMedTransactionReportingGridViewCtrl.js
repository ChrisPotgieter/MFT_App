/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.controllers - speInstaMedTransactionReportingGridViewCtrl.js
 /// SPE InstaMed Extension
 /// Controller to Manage the Transaction Reporting GridView
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */
define(['modules/spe/module'], function (module)
{
    "use strict";
    module.registerController('speInstaMedTransactionReportingGridViewCtrl', ['$scope', '$state','uiSvc', 'speInstamedDataSvc', 'transactionReportingSvc',function ($scope, $state, uiSvc, speInstamedDataSvc, transactionReportingSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};
        _this.stateManager = {};

        _this.stateManager = {};

        // initialize the default custom report
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);



        // override the drill
        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid
            speInstamedDataSvc.navigateTransaction(model._id,  $state.$current.parent.parent);
        };
    }]);
});
