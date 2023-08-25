/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftTransactionItemDrillDialogCtrl
 /// MFT Transaction Item Drill Dialog Controller to Manage Displaying of Single Transaction Item via the Extended Grid
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2022
 /// </summary>
 */

define(['modules/mft_v2/module'], function (module)
{
    "use strict";
    module.registerController('mftTransactionItemDrillDialogCtrl', ['$uibModalInstance', 'dialogData', function ($uibModalInstance, dialogData)
    {
        var _this = this;
        _this.model = dialogData;

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>
    }]);
});
