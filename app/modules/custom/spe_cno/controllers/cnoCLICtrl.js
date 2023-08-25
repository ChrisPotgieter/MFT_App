/*
 /// <summary>
 /// app.modules.custom.cno.controllers - cnoCLICtrl
 /// Controller to manage CNO Specific CLI Invocation based on the data
 /// Will be called by the AEGF Services and anything other future services as needed
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15 July 2023
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function (module) {

    "use strict";

    module.registerController('cnoCLICtrl', ['$uibModalInstance', '$scope', '$log',  'adminDataSvc', 'uiSvc', 'userSvc','speCNODataSvc', 'dialogData', function ($uibModalInstance, $scope, $log, adminDataSvc, uiSvc, userSvc, dataSvc, dialogData)
    {
        let _this = this;
        _this.model = {sendRequest: true};

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


        if (dialogData.request.operation == dataSvc.cliInstructionEnum.AEGF_ADHOC_RUN)
        {
            // prepare the dialog for the adhoc run
            dataSvc.aegf.functions.prepareAdhocRunDialog(_this);
        }

        _this.sendRequest();
    }]);
});
