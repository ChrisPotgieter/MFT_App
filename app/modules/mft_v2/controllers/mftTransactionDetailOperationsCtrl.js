/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftTransactionDetailOperationsCtrl.js
 /// Controller for Managing the MFT Transaction Operations Panel
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/01/2021
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('mftTransactionDetailOperationsCtrl', ['$scope', '$log', 'mftv2DataSvc', 'transactionReportingSvc', 'uiSvc', function ($scope, $log, mftv2DataSvc, transactionReportingSvc, uiSvc)
    {
        // initialize the model
        var _this = this;
        _this.functions = {};
        _this.model = {flags:{inProgress: false, allowResubmit: false, allowRepair: false, allowCancel: false}};

        //<editor-fold desc="Functions">
        $scope.$on("mft_v2_changed", function()
        {
            // build the screen when we have been told we have data from the parent
            _this.functions.initView();
        });

        _this.functions.initView = function()
        {
            // routine to initialize the controller and determine what operations the user has access to for this transaction
            if (!$scope.data)
                return;
            _this.model.id = $scope.data.baseTransaction.transactionId;
            _this.model.cliOperations = transactionReportingSvc.calcTransactionOperations($scope.data.baseTransaction);

            // now based on the available cli operations determine what buttons are available
            _this.model.flags.inProgress = false;
            let found = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.RESUBMIT_TRANSACTION});
            _this.model.flags.allowResubmit = found != null;
            found = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION});
            _this.model.flags.allowRepair = found != null;
            found = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.CANCEL_TRANSACTION});
            _this.model.flags.allowCancel = found != null;

            // TODO: Remove this once repair and resubmit is available
            _this.model.flags.allowResubmit = false;
            _this.model.flags.allowRepair = false;
        };

        _this.functions.confirmCLIOperation = function(cliOperation)
        {
            // routine to manage CLI functions
            let data = lodash.find(_this.model.cliOperations, {operation: cliOperation});
            _this.model.flags.inProgress = true;
            if (data == null)
            {
                $log.error("Unable to find CLI Operation Parameters for code " + cliOperation);
                return;
            }
            data.completeFunction = function(result, isError)
            {
                let promiseApi = $scope.refreshBaseTransaction(true);
                promiseApi.then(function (result2)
                {
                    $scope.changeTransaction(result2);

                    // based on the original operation display a message
                    _this.functions.completeCLIOperation(result, isError, data);
                }).catch(function (result)
                {
                    $log.error("Unable to retrieve Transaction Detail Data", result);
                });
            };
            mftv2DataSvc.confirmCLIOperation(data);
        };
        _this.functions.completeCLIOperation = function(modalResult, isError, operationData)
        {
            // routine to handle the completion of the CLI Operation
            if (isError)
                return;
            let message = null;
            let title = null;
            switch (operationData.operation)
            {
                case transactionReportingSvc.transCliInstructionEnum.CANCEL_TRANSACTION:
                    title = "Cancellation";
                    message = "The Transaction Cancellation Request has been sent MFT Agent";
                    break;
                case transactionReportingSvc.transCliInstructionEnum.RESUBMIT_TRANSACTION:
                    title = "Resubmission";
                    message = "The Transaction Resubmission Request has been sent MFT Agent";
                    break;
                case transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION:
                    title = "Repair";
                    message = "The Updated Transaction Request has been sent MFT Agent";
                    break;
            }
            if (!title)
                return;
            uiSvc.showExtraSmallPopup(title + " Request", message   + " Successfully !", 5000);
        };

        _this.functions.requestRepair = function()
        {
            // routine to initiate a CLI transaction to repair the current transaction
            _this.functions.confirmCLIOperation(transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION);

        };
        _this.functions.requestCancellation = function()
        {
            // routine to initiate a CLI transaction to cancel the current transaction
            _this.functions.confirmCLIOperation(transactionReportingSvc.transCliInstructionEnum.CANCEL_TRANSACTION);
        };
        //</editor-fold>

        // initialize
        _this.functions.initView();
    }]);
});
