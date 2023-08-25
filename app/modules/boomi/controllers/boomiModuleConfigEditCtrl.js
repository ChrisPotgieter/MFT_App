/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiModuleConfigEditCtrl.js
 /// Controller to manage Editing of Boomi Module Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/07/2022
 /// </summary>
 */
define(['modules/boomi/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('boomiModuleConfigEditCtrl', ['$scope', '$timeout', 'adminDataSvc','uiSvc', 'boomiDataSvc', function ($scope, $timeout, adminDataSvc,uiSvc, boomiDataSvc)
    {
        var _this = this;
        _this.model = {flags: {allowSave: true}};
        _this.functions = {};


        //<editor-fold desc="Functions">
        _this.functions.initializeWidgets= function()
        {
            _this.model.api = {data: {}, validator:{}};
            _this.model.api.validator  = {watchFlag: {value: -1}, bv: {}};
            _this.model.api.validator.onValidation  = function(isError)
            {
                // tell the wizard that the form has changed
            };

        };


        _this.functions.saveApiData = function()
        {
            // routine to save the api data into a data object if valid
            if (_this.model.api.validator.bv != null)
            {
                _this.model.api.validator.bv.revalidateField("hiddenValidation");
                _this.model.api.validator.bv.validate();
                let valid = _this.model.api.validator.bv.isValid();
                if (!valid)
                    return false;

                // update the model
                _this.model.record.jsonData.settings.account = _this.model.api.data.account;
                _this.model.record.jsonData.settings.monitor = _this.model.api.data.monitor;
                if (_this.model.api.data.environment)
                    _this.model.record.jsonData.settings.monitor.environments = _this.functions.unmapEnvironments();
                _this.model.record.jsonData.settings.monitor.health_report = parseInt(_this.model.record.jsonData.settings.monitor.health_report);
                return true;
            };
            return false;
        };

        _this.functions.mapEnvironments = function()
        {
            // routine to read the environment information
            let obj = {prod: true, test: true};

            if (_this.model.api.data.monitor.environments)
            {
                obj.prod = false;
                obj.test = false;
                lodash.forEach(_this.model.api.data.monitor.environments, function(value)
                {
                    if (value == "PROD")
                        obj.prod = true;
                    if (value === "TEST")
                        obj.test = true;
                })
            }
            return obj;
        };

        _this.functions.unmapEnvironments = function()
        {
            // routine to decompose a environment object into an array
            let returnArr = [];
            let obj = _this.model.api.data.environment;
            if (obj && obj.prod)
                returnArr.push("PROD");
            if (obj && obj.test)
                returnArr.push("TEST");
            return returnArr;
        };


        _this.functions.initializeApiData = function()
        {
            // routine to read the record from the database and update the model
            let data = _this.model.record.jsonData.settings;

            if (!data.account)
                data.account = {};
            if (!data.monitor)
                data.monitor = {};
            if (!data.monitor.api_refresh)
                data.monitor.api_refresh = 10;
            if (!data.monitor.api_timeout)
                data.monitor.api_timeout = 5;
            if (!data.monitor.atom_refresh)
                data.monitor.atom_refresh = 20;
            if (!data.monitor.atom_stopped)
                data.monitor.atom_stopped = 10;
            if (!data.monitor.health_report)
                data.monitor.health_report = 6;


            _this.model.api.data.account = data.account;
            _this.model.api.data.monitor = data.monitor;
            _this.model.api.data.environment = _this.functions.mapEnvironments();



            if (data.account != null && data.account.user != null)
            {
                $timeout(function()
                {
                    if (_this.model.api.validator.bv != null)
                        _this.model.api.validator.watchFlag.value = 1;
                }, 1000);
            }
        };

        _this.functions.saveRecord = function()
        {
            // routine to save the record to the database
            let result = _this.functions.saveApiData();
            if (result)
            {
                adminDataSvc.updateModuleParameter(boomiDataSvc.moduleConfig.code, _this.model.record, "UI Update").then(function(result)
                {
                    _this.model.record = result;
                    _this.functions.initializeApiData();
                    boomiDataSvc.readModuleConfig(true);
                    uiSvc.showExtraSmallPopup("BOOMI Configuration", "Success !<br/>Please Restart your " + boomiDataSvc.moduleConfig.code + " Services for Changes to take Effect !", 5000, "#C79121", "fa-exclamation-triangle bounce animated");
                });
            }
        };

        _this.functions.initialize = function()
        {
            _this.functions.initializeWidgets();
            boomiDataSvc.readModuleConfig(true).then(function(result)
            {
                _this.model.record = result;
                _this.functions.initializeApiData();
            });
        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});