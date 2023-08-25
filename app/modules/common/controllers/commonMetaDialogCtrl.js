/*
 /// <summary>
 /// app.modules.common.controllers - commonMetaDialogCtrl
 /// Common Meta-Data Display Dialog Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 30/09/2020
 /// </summary>
 */

define(['modules/common/module'], function (module)
{
    "use strict";
    module.registerController('commonMetaDialogCtrl', ['$uibModalInstance', 'dialogData', function ($uibModalInstance, dialogData)
    {
        const _this = this;


        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.initialize = function()
        {
            if (dialogData.height && dialogData.records)
            {
                _this.model = {data: dialogData.records, height: dialogData.height};
            }
            else
                _this.model = {data: dialogData};

            _this.model.title = "Meta-Data Information";
            if (dialogData.title)
            {
                _this.model.data = dialogData.records;
                _this.model.title = dialogData.title;
            }
        }
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>


        _this.functions.initialize();

    }]);
});
