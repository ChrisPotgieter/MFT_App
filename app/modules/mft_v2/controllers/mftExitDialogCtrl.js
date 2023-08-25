/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftExitDialogCtrl
 /// MFT Exit Dialog Controller to Manage Displaying of Exit Item (Monitor and Transaction)
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 30/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module'], function (module)
{
    "use strict";
    module.registerController('mftExitDialogCtrl', ['$uibModalInstance', 'dialogData', function ($uibModalInstance, dialogData)
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
