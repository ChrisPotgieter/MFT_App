/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibCLICtrl
 /// Controller to manage IIB CLI Invocation based on the data
 /// Will be called by the IIB Data Service Operations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12 May 2021
 /// </summary>
 */

define(['modules/iib_v2/module'], function (module) {

    "use strict";

    module.registerController('iibCLICtrl', ['$uibModalInstance', '$scope', '$log',  'iibv2DataSvc', 'adminDataSvc', 'dialogData', function ($uibModalInstance, $scope, $log, iibv2DataSvc, adminDataSvc, dialogData)
    {
        let _this = this;

        adminDataSvc.initializeCLI(_this, dialogData, $uibModalInstance);
        _this.initialize();

        // send to the server
        iibv2DataSvc.sendCLIRequest(dialogData.request).then(function(result)
        {
            // set the response and start the timer
            iibv2DataSvc.handleCLIProgressResponse(_this, result);
            _this.startTimer();
        }).catch(function(result)
        {
            $log.error("Unable to Invoke IIB CLI", result);
        });
    }]);
});
