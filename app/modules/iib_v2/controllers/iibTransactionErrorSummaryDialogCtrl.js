/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibTransactionErrorSummaryDialogCtrl
 /// IIB/ACE Transaction Error Summary Dialog Controller to Manage Displaying of Errors when drilling via a Error Badge
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/06/2021
 /// </summary>
 */

define(['modules/iib_v2/module'], function (module)
{
    "use strict";
    module.registerController('iibTransactionErrorSummaryDialogCtrl', ['$uibModalInstance', '$log', 'uiSvc', 'iibv2DataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, iibv2DataSvc, dialogData)
    {
        var _this = this;
        _this.model = {title: iibv2DataSvc.getTitle() + " Errors", icon:"fa fa-exclamation-circle", data:[], flags:{refresh: {value: 0}}};

        //<editor-fold desc="Functions">
        _this.functionManager = {};
        _this.functionManager.drill = function(model)
        {
            // routine to manage the drill on the grid - close the dialog and send back the transaction id
            $uibModalInstance.close({transactionId: model.transactionId});
        };

        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.initialize = function()
        {
            _this.model.listCode = dialogData.listCode;
            iibv2DataSvc.refreshErrors(dialogData).then(function (result)
            {
                // parse the data
                _this.model.data = iibv2DataSvc.parseTransactionGridData(result);
                _this.model.flags.refresh.value += 1;
            }).catch(function (result) {
                $log.error("Unable to retrieve Error List Information", result);
            }).finally(function () {
                uiSvc.displayKendoLoader("#grid", false);
            });

        };
        _this.functions.initialize();
        //</editor-fold>
    }]);
});
