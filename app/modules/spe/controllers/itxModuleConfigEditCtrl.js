/*
 /// <summary>
 /// app.modules.spe.controllers - itxModuleConfigEditCtrl.js
 /// Controller to manage Editing of ITX Module Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/07/2022
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('itxModuleConfigEditCtrl', ['$scope', 'adminDataSvc','uiSvc', function ($scope, adminDataSvc,uiSvc)
    {
        var _this = this;
        _this.model = {};
        _this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.initializeSenderReceiverMetaData = function()
        {
            _this.model.sender_receiver_meta = {data: [], config:{}, validator:{}};
            let data = _this.model.sender_receiver_meta.config;
            data.stateInfo = {title: "Trading Partner Meta-Data", icon:"fa fa-send", subtitle:"Meta-Data"};
            data.source = {type:"TRADING_META_DATA"};

            data.validator = {watchFlag: {value: -1}, bv: {}};
            data.validator.onValidation  = function(isError)
            {
                // tell the wizard that the form has changed
            };

        };
        _this.functions.initializeITXServerData = function()
        {
            // routine to read the record from the database and update the model
            _this.model.itx_server = {data: {}, config:{}, validator:{}};
            let data = _this.model.itx_server;
            data.validator = {watchFlag: {value: -1}, bv: {}};
            adminDataSvc.readParameter('SPEServer').then(function(result)
            {
                if (!result.value)
                    result = {id:'SPEServer', description:'ITXA Server Details', jsonData:{}};
                data.data = result;
            });
        };

        _this.functions.initialize = function()
        {
           _this.functions.initializeSenderReceiverMetaData();
            _this.functions.initializeITXServerData();

        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});