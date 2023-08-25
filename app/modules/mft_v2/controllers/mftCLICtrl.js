/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftCLICtrl
 /// Controller for MFT CLI Invocation based on the data
 /// Will be called by the MFT Data Service Operations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20 October 2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('mftCLICtrl', ['$uibModalInstance', '$scope', '$log',  'mftv2DataSvc', 'uiSvc', 'adminDataSvc', 'dialogData', function ($uibModalInstance, $scope, $log, mftv2DataSvc, uiSvc, adminDataSvc, dialogData)
    {
        var _this = this;

        _this.initialize = function()
        {
            // routine to prepare the progress info and title information
            _this.titleData = {icon:dialogData.icon, desc: dialogData.desc};
            _this.modalInstance = $uibModalInstance;
            _this.modalResult = null;
            _this.downloadFileName = null;
            _this.progressInfo =
            {
                icon: "fa fa-cog",
                showProgress: true,
                showHeader: true,
                inProgress: true,
                title: dialogData.desc,
                description: "Preparing...",
                perc: "1%",
                allowOK: false,
                allowCancel: false,
                showLineDisplay: true,
                showOK: true,
                showCancel: false,
                initialized: false,
                OKText: "OK",

            };
            _this.progressInfo.onProgressUpdate = function(model)
            {
                _this.lastProgress = model;
            };


            _this.progressInfo.onProgressUpdateComplete = function(status)
            {
                if (status == uiSvc.backgroundProcessStates.COMPLETED)
                {
                    if (_this.lastProgress.info.result)
                    {
                        if (_this.lastProgress.state && _this.lastProgress.state.arguments && _this.lastProgress.state.arguments["savePath"] != null)
                        {
                            _this.downloadFileName = _this.lastProgress.info.result;
                            _this.progressInfo.buttons = [
                                {name: "output",
                                class: "default",
                                action: function ()
                                {
                                    adminDataSvc.downloadDocument(_this.lastProgress.info.result.fileName, _this.lastProgress.info.result.extension);
                                },
                                caption: "Download...",
                                visible: true}];
                        }
                        _this.modalResult = _this.lastProgress.info.result;

                    }
                    else
                        _this.modalResult = true;
                }
                if (status == uiSvc.backgroundProcessStates.INERROR)
                {
                    _this.modalResult = {error: _this.lastProgress.info.error};
                }
            };

            // send to the server
            mftv2DataSvc.sendCLIRequest(dialogData.request).then(function(result)
            {
                // set the response and start the timer
                adminDataSvc.handleCLIProgressResponse(_this, result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Invoke MFT CLI", result);
            })

        };


        //<editor-fold desc="Timer and Progress Management">
        _this.ok = function()
        {
            // close the window
            adminDataSvc.handleLongRunOK(_this);
        };

        _this.cancel = function()
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

        _this.initialize();

    }]);
});
