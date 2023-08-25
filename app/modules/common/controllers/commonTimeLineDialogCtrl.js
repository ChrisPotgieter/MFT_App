/*
 /// <summary>
 /// app.modules.common.controllers - commonTimeLineDialogCtrl
 /// Common Event Time-Line Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/07/2020
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    "use strict";

	module.registerController('commonTimeLineDialogCtrl', ['$uibModalInstance', '$scope', 'transactionReportingSvc', 'dialogData', function ($uibModalInstance, $scope, transactionReportingSvc,dialogData)
    {

        // initialize the object
        const _this = this;
        _this.functions = {};
        _this.model = {};

        //<editor-fold desc="Functions">

        _this.functions.initialize = function()
        {
            // routine to prepare the view for display
            _this.model = dialogData.data;
            _this.model.title = dialogData.title;
            _this.model.icon = dialogData.icon;
        };
        _this.functions.confirmDialog = function()
        {
            // close the window
            $uibModalInstance.close(_this.model.data);
        };
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };



        _this.functions.viewDoc = function(item)
        {
            transactionReportingSvc.viewInLineAttachment(item.oid, item.blobFormat, dialogData.module, item.icon);
        };
        _this.functions.handleButton = function(item, type)
        {
            if (dialogData.handleButton != null)
                dialogData.handleButton(item, type);
        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});
