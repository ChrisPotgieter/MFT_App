/*
 /// <summary>
 /// app.modules.itx.controllers - itxCLICtrl
 /// Controller to manage ITX CLI Invocation based on the data
 /// Will be called by the ITX Data Service Operations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18 October 2022
 /// </summary>
 */

define(['modules/spe/module'], function (module) {

    "use strict";

    module.registerController('itxCLICtrl', ['$uibModalInstance', '$scope', '$log',  'speDataSvc', 'adminDataSvc', 'uiSvc', 'userSvc', 'dialogData', function ($uibModalInstance, $scope, $log, dataSvc, adminDataSvc, uiSvc, userSvc, dialogData)
    {
        let _this = this;
        _this.model = {sendRequest: true}

        _this.sendRequest = function()
        {
            // send to the server
            if (!_this.model.sendRequest)
                return;
            dataSvc.sendCLIRequest(dialogData.request).then(function(result)
            {
                // set the response and start the timer
                dataSvc.handleCLIProgressResponse(_this, result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Invoke ITX CLI", result);
            });
        };


        adminDataSvc.initializeCLI(_this, dialogData, $uibModalInstance);
        _this.initialize();



        // override the progress complete events to look for buttons
        if (dialogData.request.operation == dataSvc.cliInstructionEnum.DE_ENVELOPE)
        {
            dataSvc.prepareDeEnvelopeDialog(_this);
        }

        if (dialogData.request.operation == dataSvc.cliInstructionEnum.SENDER_PROFILE_IMPORT)
        {
            _this.model.sendRequest = false;        // halt the request until the file is uploaded

            _this.showUploadError = function (error)
            {
                _this.progressInfo.icon = "fa fa-times";
                _this.progressInfo.description = "Upload Failed " + error;
                return;
            };
            _this.uploadComplete = function(successEvent)
            {
                dialogData.request.arguments = {fileName: successEvent.data, companyId: userSvc.getOrgInfo().companyId};
                _this.model.sendRequest = true;
                _this.sendRequest();
                return;
            };

            let metaData = {uploadFile: dialogData.request.arguments.fileName, destinationFileName: "SPESenderImport.xlsx", destinationPath:"SPE"};
            uiSvc.handleFileUpload(_this, metaData);
        };
        _this.sendRequest();
    }]);
});
