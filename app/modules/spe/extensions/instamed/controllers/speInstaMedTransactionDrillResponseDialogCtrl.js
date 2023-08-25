/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedTransactionDrillResponseDialogCtrl
 /// SPE InstaMed Extension
 /// Controller to manage Drill of a Given Response Record (ldfResponse)
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 05/04/2020
 /// </summary>
 */
define(['modules/spe/module'], function (module) {

    "use strict";

	module.registerController('speInstaMedTransactionDrillResponseDialogCtrl', ['$uibModalInstance', '$scope', '$log', 'speInstamedDataSvc','dialogData', function ($uibModalInstance, $scope, $log, speInstamedDataSvc, dialogData)
    {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {};

        //<editor-fold desc="Functions">

        _this.functions.init = function()
        {
            // routine to prepare the view for display
            var title = speInstamedDataSvc.getProcTitles().response;
            _this.model = {title: title, payments:{}};
            _this.model.row = dialogData.row;

            // prepare the payment view
            _this.model.payments = {methodCounts: _this.model.row.paymentMethodCounts, statusCounts:_this.model.row.paymentStatusCounts};
        };
        _this.functions.confirmDialog = function()
        {
            // close the window
            $uibModalInstance.close(_this.model.row);
        };
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>

        _this.functions.init();
    }]);
});
