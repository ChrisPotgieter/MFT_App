/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionReportingGridViewCtrl.js
 /// Controller for IIB v2 Reporting - Grid View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/03/2019
 /// </summary>
 */
define(['modules/iib_v2/module', 'lodash', 'jszip'], function (module)
{
    "use strict";
    module.registerController('iibv2TransactionReportingGridViewCtrl', ['$scope', '$state','uiSvc','transactionReportingSvc', 'iibv2DataSvc', function ($scope, $state, uiSvc, transactionReportingSvc, iibv2DataSvc)
    {
        var _this = this;
        _this.flags = {userSave: false, gridType: $scope.vm.model.gridType};

        //<editor-fold desc="State Manager">
        _this.stateManager = {};

        // initialize the default custom report
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);
        _this.stateManager.drill = function(model)
        {
            // routine to manage the drill on the grid
            $scope.vm.functions.navigateTransaction(model.transactionId, $state.$current.parent);
        };


        _this.stateManager.export = function(data)
        {

            if (rows.length == 0)
                return;

            let dialogData = {count: rows.length};

            // setup the functions
            let cliFunctions = iibv2DataSvc.setupCLIFunctions();
            cliFunctions.confirmFunction = function(repairData)
            {
                // function to invoke the initial post to the rest api when the user accepts
                let count = rows.length;
                let data = {operation: 30, ui:
                {
                        question: "Resubmit " + count + " Payloads to Resubmit Destinations",
                        class: 'text-primary',
                        icon: "fa fa-recycle",
                        description: "Re-Submit " + count + "Payloads..."
                }};
                data.record =
                    {
                        export_ids:  data.export,
                        resubmit_ids: data.resubmit,
                        destination: "resubmitQueue",
                    };
                // if this is going to an alernative queue change the questions
                if (repairData.data.resubmitType == '1')
                {
                    data.question = "Resubmit " + count + " Payloads to " + repairData.data.destination;
                    data.icon = "fa fa-download";
                    data.description = "Export " + count + "Payloads...";
                    data.record.destination = repairData.data.destination
                }

                iibv2DataSvc.lastCLIRequest = data;
                let request = {operation: data.operation, arguments: data.record};
                return iibv2DataSvc.sendCLIRequest(request);
            };
            cliFunctions.completeFunction = function(result, isError)
            {
                _this.functions.completeExportOperation(result, result.error != null, dialogData);
            };

            // bring up the dialog
            let controlOptions =
                {
                    templateUrl: 'app/modules/iib_v2/partials/transaction-export-resubmit-dialog.tpl.html',
                    controller: 'iibBulkExportDialogCtrl',
                    size: 'lg',
                    windowClass: 'xl-modal'
                };
            let record =  {title:"Export Resubmit Selection", icon:"fa fa-recycle", data: dialogData, functions: cliFunctions};
            let modalInstance = uiSvc.showDialog(record, controlOptions);
            modalInstance.result.then(cliFunctions.completeFunction).catch(cliFunctions.errorFunction);
        }
        //</editor-fold>

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.getExportTitle = function(operationData)
        {
            let title = "Payload Export";
            switch (operationData.resubmitType)
            {
                case "1":
                    title = "Payload Export to " + operationData.destination;
                    break;
                case "0":
                    title = "Payload Re-Submit Request";
                    break;
            }
            return title;
        };

        _this.functions.completeExportOperation = function(modalResult, isError, operationData)
        {
            // routine to handle the completion of the Export CLI Operation
            let title = _this.functions.getExportTitle(operationData);
            if (isError)
            {
                uiSvc.showExtraSmallPopup(title, "Instruction Failed  !<br/>" + result.error, 5000, "#ce2029", "times");
                return;
            }
            if (modalResult.failed == 0)
            {
                let message = "Has Completed Successfully!<br/>Payloads Submitted: " + modalResult.success;
                uiSvc.showExtraSmallPopup(title, message, 5000);
            }
            else
            {
                let message = "Has Failed";
                if (modalResult.success > 0)
                {
                    message += " Partially";
                    message += "<br/>Payloads Succeeded: " + modalResult.success;
                }
                message += "<br/>Payloads Failed: " + modalResult.failed;
                uiSvc.showError(title, message);
            }
            if (operationData.resubmitType == "0")
            {
                $scope.vm.functions.refreshData();
            }
        };

        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill
            if (data.caption == "Total Failures")
            {
                let filter = $scope.vm.functions.getTransactionFilter();
                let data = {apiName:"iibv2TransactionErrors", filter: filter, listCode: $scope.vm.model.columnBuildCode};
                iibv2DataSvc.showErrorSummary(data, _this.stateManager.drill);
            }
        };
        //</editor-fold>

    }]);
});
