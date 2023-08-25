/*
 /// <summary>
 /// app.modules.common.services - commonDataSvc.js
 /// Common Functions Data Service
 /// This enables common functions to implement the service pattern for commonly used functions like FILE-TRIGGER
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/10/2022
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment'], function(module, lodash, moment)
{
    "use strict";
    moment().format();
    module.registerService('commonDataSvc',[ 'apiSvc', 'apiProvider', 'adminDataSvc',  'userSvc', 'uiSvc', 'speDataSvc', function( apiSvc, apiProvider, adminDataSvc, userSvc, uiSvc, speDataSvc)
    {
        let _this = this;
        _this.data = {lastCLIRequest: null};
        _this.cliInstructionEnum  = { FILE_TRIGGER: 1, DE_ENVELOPE: 10};

        // setup the webservice calls
        let configs = [
            {url :'common/cli', 'resourceName': 'commonCLIRequest'},
        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });
        adminDataSvc.setupCLI(_this, 'speCLIRequest', 'commonCLICtrl');



        //<editor-fold desc="Initialization & General">
        //</editor-fold>

        //<editor-fold desc="Command Line">

        //</editor-fold>


        //</editor-fold>

    }]);
});
