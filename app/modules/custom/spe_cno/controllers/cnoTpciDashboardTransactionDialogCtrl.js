/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciDashboardTransactionDialogCtrl
 /// Third Party Commission Intake Dashboard Transaction Drill Dialog Controller to Manage Displaying of Errors when drilling via the Badges
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/06/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function (module)
{
    "use strict";
    module.registerController('cnoTpciDashboardTransactionDialogCtrl', ['$uibModalInstance', '$log','uiSvc', 'speCNODataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, dataSvc, dialogData)
    {
        var _this = this;
        let titleData = dialogData.type == 1 ? {title: "Transaction Errors", icon: "fa fa-exclamation-circle"} : {title: "Transactions", icon: "fa fa-info-circle"};
        _this.model = {title:titleData.title, icon:titleData.icon, data:[], flags:{refresh: {value: 0}}, limit: "", progressId:"dialogGrid"};

        //<editor-fold desc="Functions">
        _this.functionManager = {};

        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.initialize = function()
        {
            let promise = null;
            $uibModalInstance.rendered.then(function()
            {
                uiSvc.displayKendoLoader("#dialogGrid", true);
                if (dialogData.type == 1)
                    promise = dataSvc.refreshTPCIErrors(dialogData.filter);
                else
                    promise = dataSvc.refreshTPCITransactions(dialogData.filter);
                promise.then(function (result)
                {
                    // parse the data
                    _this.model.data = dataSvc.parseTPCIGridData(result, dialogData.filter.module);
                    if (result.length == 5000)
                        _this.model.limit = " - First 5,000 Only";
                    _this.model.flags.refresh.value += 1;

                });
            }).catch(function (result) {
                $log.error("Unable to retrieve Information", result);
            });

        };
        _this.functions.initialize();
        //</editor-fold>
    }]);
});

