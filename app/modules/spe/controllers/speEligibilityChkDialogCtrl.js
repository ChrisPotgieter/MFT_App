/*
 /// <summary>
 /// app.modules.spe.controllers - speEligibilityChkDialogCtrl
 /// Controller for ITX Eligibility Triggers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/11/2019
 /// </summary>
 */

define(['modules/spe/module', 'lodash', 'moment'], function (module, lodash, moment) {

    "use strict";

    module.registerController('speEligibilityChkDialogCtrl', ['$scope', '$uibModalInstance', '$log', '$timeout', 'adminDataSvc', 'userSvc', 'uiSvc', 'cacheDataSvc', 'speDataSvc', function ($scope, $uibModalInstance,  $log, $timeout, adminDataSvc, userSvc, uiSvc, cacheDataSvc, speDataSvc)
    {
        var _this = this;

        // add the base model
        _this.modalInstance = $uibModalInstance;

        _this.model = {postModel: null, flags:{submitted: false}, buttons:[], dob:{options: {}, opened: false}, requestModel: {data: {content: null, contentType: "json"}, cm: {}}, responseModel: {data: {content: null, contentType: "json", success:null, failed: null}, cm: {}}};
        _this.progressInfo = {showHeader: false, inProgress: false, icon:"fa fa-medkit", showProgress: true, title:"Eligibility Verification", description:"Not Selected", perc: "0%", allowOK:false, allowCancel: true, showLineDisplay: false, showOK: true, showCancel: true, OKText: "OK", dbId: 0, initialized: false};

        _this.selector = {record: null, selected: null, options: []};
        _this.model.titleData = {icon:"fa fa-medkit", desc: "Eligibility Verification"};
        _this.timer = null;

        // add the selector options
        let records = cacheDataSvc.getListForType("1", "SPE_ELIGIBILITY_PROFILE", userSvc.getOrgInfo().companyId);
        _this.selector.options = records;


        // add the functions
        _this.functions = {};

        //<editor-fold desc="UI">
        _this.functions.setupCM = function(editor, performFold)
        {
            // routine to adjust the code mirror on display of tabs
            editor.setCursor({line: 0, ch: 0});
            if (performFold)
                editor.foldCode(CodeMirror.Pos(3, 0));
        };

        _this.functions.switchTab = function(tabid)
        {
            // invoke a redraw of the main transaction tab
            if (tabid == 'request')
            {
                if (_this.model.requestModel.cm && _this.model.requestModel.cm.setCursor)
                {
                    $timeout(function () {
                        _this.functions.setupCM(_this.model.requestModel.cm, _this.model.requestModel != 'null');
                    }, 200);
                }
            }
            if (tabid == 'response')
            {
                if (_this.model.responseModel.cm && _this.model.responseModel.cm.setCursor)
                {
                    $timeout(function () {
                        _this.functions.setupCM(_this.model.responseModel.cm, _this.model.responseModel != 'null');
                    }, 200);
                }
            }
        };

        _this.functions.openCalendar = function()
        {
            _this.model.dob.opened = true;
        };

        _this.functions.onOptionSelect = function()
        {
            // routine to manage the users selection of another option
            let record = lodash.find(_this.selector.options, {code:_this.selector.selected});
            _this.model.postModel = record.jsonData;

            // update the date
            _this.model.dob.value = moment(_this.model.postModel.subscriberInfo.dateOfBirth, 'YYYYMMDD').toDate();
            _this.progressInfo.inProgress = false;
        };


        //</editor-fold>


        //<editor-fold desc="Processing Functions">
        _this.functions.submit = function()
        {
            _this.progressInfo.description = "Processing...";
            _this.progressInfo.perc = "1%";
            _this.progressInfo.inProgress = true;
            _this.progressInfo.buttons = [];
            _this.progressInfo.buttons.push({
                name: "output",
                class: "default",
                action: _this.progressInfo.resetForm,
                caption: "Clear Form",
                visible: false
            });

            // create the cli Request
            let cliRequest = {operation: 81, arguments:{profile:{}}};
            cliRequest.arguments.profile = lodash.cloneDeep(_this.model.postModel);
            cliRequest.arguments.profile.subscriberInfo.dateOfBirth = moment(_this.model.dob.value).format("YYYYMMDD");


            // send to the server
            _this.model.flags.submitted = true;
            speDataSvc.sendCLIRequest(cliRequest).then(function(result)
            {
                // set the response and start the timer
                adminDataSvc.handleCLIProgressResponse(_this, result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Invoke SPE CLI", result);
            });
        };

        //</editor-fold>

        //<editor-fold desc="Timer and Progress Management">
        _this.functions.ok = function()
        {
            // close the window
            adminDataSvc.handleLongRunOK(_this);
        };

        _this.functions.cancel = function()
        {
            // close the window
            adminDataSvc.handleLongRunCancel(_this);
        };


        _this.startTimer = function()
        {
            // routine to manage the timer
            uiSvc.startLongRunTimer(_this);
        };
        _this.stopTimer = function()
        {
            // stop the timer
            uiSvc.stopLongRunTimer(_this);
        };

        _this.updateProgress = function(model)
        {
            // routine to update the progress object when the server has sent us a new model
            uiSvc.updateLongRunProgress(model, _this);
        };

        _this.refreshProgress = function ()
        {
            // routine to refresh the progress
            adminDataSvc.refreshLongRunProcess(_this);
        };

        _this.progressInfo.onProgressUpdate = function(model)
        {
            // routine to update the form while the check is in progress
            _this.model.lastProgress = model;
            if (_this.model.requestModel.data.content == null && model != null && model.info != null && model.info.request != null)
                _this.model.requestModel.data.content =  model.info.request;
        };

        _this.progressInfo.onProgressUpdateComplete = function(status)
        {
            if (status == uiSvc.backgroundProcessStates.COMPLETED || status == uiSvc.backgroundProcessStates.INERROR)
            {
                if ( _this.model.lastProgress != null && _this.model.lastProgress.info != null)
                {
                    if (_this.model.responseModel.data.content == null)
                    {
                        _this.model.responseModel.data.content = _this.model.lastProgress.info.error != null ? _this.model.lastProgress.info.error : _this.model.lastProgress.info.result;
                    }
                    if (_this.model.lastProgress.info.error)
                        _this.model.responseModel.data.failed = _this.model.lastProgress.info.error;
                    else
                    {
                        // check if the response is active
                        let jsonObject = JSON.parse(_this.model.responseModel.data.content);
                        if (jsonObject.response.active != null)
                        {
                            if (jsonObject.response.active == 'Y')
                                _this.model.responseModel.data.success = "Coverage Level " + jsonObject.response.coverageLevel;
                            else
                                _this.model.responseModel.data.failed = "Not an Active Response";
                        }
                    }
                }

                // allow the user to clear the form
                _this.progressInfo.buttons[0].visible = true;
            }
        };

        _this.progressInfo.resetForm = function()
        {
            // routine to reset the form
            _this.progressInfo.description = "Not Selected";
            _this.progressInfo.perc = "0%";
            _this.model.postModel = null;
            _this.model.flags.submitted = false;
            _this.model.responseModel.data.content = null;
            _this.model.responseModel.data.success = null;
            _this.model.responseModel.data.failed = null;
            _this.model.requestModel.data.content = null;
            _this.progressInfo.inProgress = false;
            _this.selector.record = null;
            _this.selector.selected = null;
        };



        //</editor-fold>
    }]);
});
