/*
 /// <summary>
 /// app.modules.common.controllers - commonCodeMirrorDialogCtrl
 /// Common Code Mirror View Dialog when the document type is one of the viewable ones
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/07/2020
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    "use strict";

	module.registerController('commonCodeMirrorDialogCtrl', ['$uibModalInstance', '$scope', '$timeout', 'uiSvc', 'transactionReportingSvc', 'dialogData', function ($uibModalInstance, $scope, $timeout, uiSvc, transactionReportingSvc, dialogData)
    {

        // initialize the object
        const _this = this;
        _this.functions = {};
        _this.model = {};

        //<editor-fold desc="Functions">

        _this.functions.initialize = function()
        {
            // routine to prepare the view for display
            _this.model.title = dialogData.title;
            _this.model.icon = dialogData.icon;
            _this.model.data = dialogData.data;
            _this.model.cm = dialogData.cm;

            // after the screen is shown go and get the data
            $timeout(function ()
            {
                 // get the content
                _this.functions.getContent();
            }, 20);
        };

        _this.functions.getContent = function()
        {
            // routine to download the partial content from the server
            let options = null;
            if (_this.model.data.options)
                options = _this.model.data.options;
            transactionReportingSvc.getAttachmentContent("editor", _this.model.data, options);
        };


        _this.functions.download = function()
        {
            // routine to download this attachment
            let options = {};
            if (_this.model.data.options)
                options = _this.model.data.options;
            options.downloadAlways = true;
            options.fileName = _this.model.data.fileName;
            transactionReportingSvc.getAttachment(
                _this.model.data.id,
                _this.model.data.module,
                options
            );
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
        //</editor-fold>

        _this.functions.initialize();
    }]);
});
