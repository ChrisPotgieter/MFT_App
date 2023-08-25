/*
 /// <summary>
 /// app.modules.layout.controllers - fileUploadCtrl
 /// Generic Controller for File Upload Triggers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/11/2019
 /// </summary>
 */

define(['modules/layout/module', 'lodash', 'ng-fileupload'], function (module, lodash) {

    "use strict";

    module.registerController('fileUploadCtrl', ['$scope', '$uibModalInstance', '$log', 'Upload', 'adminDataSvc', 'userSvc', 'uiSvc', 'cacheDataSvc', 'speDataSvc', function ($scope, $uibModalInstance,  $log, Upload, adminDataSvc, userSvc, uiSvc, cacheDataSvc, speDataSvc)
    {
        var _this = this;

        // add the base model
        _this.modalInstance = $uibModalInstance;
        _this.model = {uploadModel: {},  buttons:[], errorFile: null};
        _this.progressInfo = {showHeader: false, inProgress: false, icon:"fa fa-flag-checkered", showProgress: false, title:"Testing Harness", description:"Not Selected", perc: "0%", allowOK:false, allowCancel: true, showLineDisplay: false, showOK: true, showCancel: true, OKText: "Proceed", dbId: 0};
        _this.selector = {record: null, selected: null, options: []};
        _this.model.titleData = {icon:"fa fa-flag-checkered", desc: "Testing Harness"};
        _this.model.fileUpload = null;


        // add the functions
        _this.functions = {};
        _this.functions.onOptionSelect = function()
        {
            // routine to manage the users selection of another option
            var record = lodash.find(_this.selector.options, {code:_this.selector.selected});
            _this.selector.record = record;
            _this.progressInfo.inProgress = false;
        };
        _this.functions.init = function()
        {
            adminDataSvc.readAuditParameter('FILE_UPLOAD').then(function(record)
            {
                if (record != null && record.jsonData.rows.length > 0)
                {
                    lodash.forEach(record.jsonData.rows, function(row)
                    {
                        // work out the type desc and type
                        var destination = row.destination[0];
                        if (!row.commandType)
                            row.commandType = 1;
                        switch (row.commandType)
                        {
                            case 1: // MFT Trigger
                                row.typeDesc = "File System";
                                row.type = row.destination.join('\\');

                                if (destination.indexOf('@') > -1 && row.destination.length == 1) {
                                    row.typeDesc = "Queue";
                                    row.type = destination;
                                }
                                break;
                            case 201: // ITXA De-Envelope
                                row.typeDesc = "ITXA De-Envelope";
                                row.type = destination;
                                break;
                        }
                    });
                    _this.selector.options = record.jsonData.rows;
                    _this.selector.options = lodash.filter(_this.selector.options, function(row)
                    {
                        if (row.security)
                            return userSvc.isAllowed(row.security);
                        else
                            return true;
                    });
                };

            });
        };



        _this.timer = null;

        //<editor-fold desc="Upload Management">
        _this.showUploadError = function(error)
        {
            uiSvc.showUploadError(_this, error);
        };

        _this.uploadComplete = function(event)
        {
            // successful upload - get the result and initiate the processing
            _this.model.uploadModel.sourceFileName = _this.model.uploadModel.uploadFile.name;
            _this.model.uploadModel.filePath = event.data;
            _this.model.uploadModel.destinationPath = _this.selector.record.destination;
            _this.model.uploadModel.destinationFileName = _this.model.uploadModel.uploadFile.name;
            _this.model.uploadModel.progress = {title: _this.selector.record.description};
            _this.functions.processUpload();
        };

        _this.functions.processUpload = function()
        {
            // routine to process the upload
            delete _this.model.uploadModel.uploadFile;

            if (_this.selector.record.commandType == 1 )  // FILE TRIGGER
            {
                _this.model.titleData = {icon:"fa fa-upload", desc: _this.selector.record.description};
                _this.functions.sendFileTrigger();
            }
            if (_this.selector.record.commandType == 201) // ITXA DE-ENVELOPE
            {
                _this.model.titleData = {icon: "fa fa-folder-open", desc: "De-Envelope Request"};
                _this.functions.sendSPEDeEnvelope();
            }
        };


        _this.functions.uploadFile = function(file, errFiles)
        {
            _this.model.errorFile = null;
            if (errFiles && errFiles.length == 1)
            {
                _this.model.errorFile = errFiles;
                return;
            }
            if (file == null)
                return;
            _this.model.uploadModel = {destinationFileName: "uuid", destinationPath: 'Common', uploadFile: file};
            _this.progressInfo.inProgress = true;
            uiSvc.handleFileUpload(_this, _this.model.uploadModel);
        };
        //</editor-fold>

        //<editor-fold desc="Processing Functions">
        _this.functions.sendFileTrigger = function()
        {
            _this.progressInfo = {showHeader: false, inProgress: true, icon:"fa fa-cog", showProgress: true, title: _this.model.titleData.desc, description:"Processing Upload...", perc: "1%", allowOK:false, allowCancel: false, showLineDisplay: false, initialized: false, showOK: true, OKText:"OK"};

            // get the organizational information
            let profile = userSvc.getProfile();
            let orgInfo = {companyId : profile.companyId, userId: profile.id, departmentId: profile.departments[0]};
            orgInfo.departmentName = cacheDataSvc.getDepartmentDesc(orgInfo.departmentId);
            orgInfo.userName = profile.login;
            orgInfo.companyName = cacheDataSvc.getCompanyName(orgInfo.companyId);
            _this.model.uploadModel.orgInfo = orgInfo;


            // send to the server
            userSvc.sendFileTrigger(_this.model.uploadModel).then(function(result)
            {
                userSvc.handleMQCProgressResponse(_this, result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Prepare for File Upload", result);
            })
        };

        _this.functions.sendSPEDeEnvelope = function()
        {
            // routine to send an SPE DEnvelope Request
            speDataSvc.prepareDeEnvelopeDialog(_this);

            // send the instruction
            var requestModel = {userId: userSvc.getProfile().id};
            requestModel.filePath = _this.model.uploadModel.filePath;
            speDataSvc.validatePayload(requestModel).then(function (result)
            {
                _this.progressInfo.dbId = result.oid;
                _this.progressInfo.inProgress = true;
                _this.updateProgress(result);
                _this.startTimer();
            }).catch(function (result) {
                $log.error("Unable to Prepare for De-Envelope Request", result);
            })

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
        //</editor-fold>

        _this.functions.init();
    }]);
});
