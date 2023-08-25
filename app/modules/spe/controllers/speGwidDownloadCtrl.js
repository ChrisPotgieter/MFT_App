/*
 /// <summary>
 /// app.modules.spe.controllers - speGwidDownloadCtrl
 /// SPE Controller for Managing Bulk GWID Downloads
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/05/2018
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('speGwidDownloadCtrl', ['$uibModalInstance', '$scope', '$log', '$interval', 'speDataSvc','adminDataSvc','userSvc', 'uiSvc',  'dialogData', function ($uibModalInstance, $scope, $log, $interval, speDataSvc, adminDataSvc, userSvc, uiSvc, dialogData)
    {

        var _this = this;
        _this.title = "ITXA - EDI Document Download";
        _this.titleData = {icon:"fa fa-download", desc: _this.title};
       _this.modalResult = null;
       _this.dataModel = {};
       _this.progressInfo = {icon:"fa fa-cog", showProgress: true, title: "User: " + userSvc.getProfile().name, description:"Preparing for Download", perc: "1%", allowOK:false, allowCancel: false, showLineDisplay: false, showOK: true, showCancel: false, OKText: "OK", initialized: false};
       _this.timer = null;

        _this.prepare = function()
        {
            // routine to prepare the operation
            speDataSvc.prepareBulkGWIDDownload(dialogData).then(function(result)
            {
                _this.dataModel.id = result.oid;
                _this.updateProgress(result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Prepare for " + _this.title, result);
            })
        };

        _this.startTimer = function()
        {
            // routine to manage the timer
            if (_this.timer == null)
               _this.timer = $interval(_this.refreshProgress, 3 * 1000);
        };
        _this.stopTimer = function()
        {
            // stop the timer
            if (_this.timer)
            {
                var cancelled = $interval.cancel(_this.timer);
                if (cancelled)
                    _this.timer = null;
            }
        };

        _this.updateProgress = function(model)
        {
            // routine to update the progress object when the server has sent us a new model
            var status = model.status;
            _this.progressInfo.lines = model.info.lines;

            // check for initialization
            if (status != uiSvc.backgroundProcessStates.STARTED && !_this.progressInfo.initialized)
            {
                model.status = uiSvc.backgroundProcessStates.STARTED;
                _this.updateProgress(model);
                model.status = status;
            }

            if (status == uiSvc.backgroundProcessStates.COMPLETED)
            {

                _this.modalResult = model.info.result;
                _this.progressInfo.icon = "fa fa-check";
               _this.progressInfo.description = "Complete";
               _this.progressInfo.perc = "100%";
               _this.progressInfo.allowOK = true;
               _this.stopTimer();
               adminDataSvc.downloadDocument(model.info.resultFileName, model.info.resultFileExtension);
              return;
            }
            if (status == uiSvc.backgroundProcessStates.STARTED)
            {
                _this.progressInfo.showLineDisplay = true;
                _this.progressInfo.icon = "fa fa-timer";
                _this.progressInfo.description = model.description;
                _this.progressInfo.perc = model.progress + "%";
                _this.progressInfo.allowOK = false;
                _this.progressInfo.lineDisplay = true;
                _this.progressInfo.initialized = true;
                return;
            }

            if (status == uiSvc.backgroundProcessStates.INPROGRESS)
            {
                _this.progressInfo.title = model.title;
                _this.progressInfo.description = model.description;
                _this.progressInfo.perc = model.progress + "%";
                return;
            }
            if (status == uiSvc.backgroundProcessStates.INERROR)
            {
                _this.progressInfo.modalResult = false;
                _this.progressInfo.icon = "fa fa-times";
                _this.progressInfo.allowOK = true;
                _this.progressInfo.description = model.description;
                _this.progressInfo.perc = "100%";
                _this.stopTimer();
                return;
            }
        };

        _this.ok = function()
        {
            // close the window
            if (_this.dataModel.id)
            {
                adminDataSvc.deleteProgress(_this.dataModel.id).then(function ()
                {
                    $uibModalInstance.close(_this.modalResult);
                }).catch(function()
                {
                    $uibModalInstance.close(_this.modalResult);
                });
            }
            else
            {
                $uibModalInstance.close(_this.modalResult);
            }
        };

        _this.refreshProgress = function ()
        {
            // routine to request an update of the progress from the server
          adminDataSvc.readProgress(_this.dataModel.id).then(function (result)
          {
              // now update the progress information
              _this.updateProgress(result);
          }).catch(function (result)
          {
              $log.error("Unable to retrieve Progress Update from Server", result);
          });
        };

        // initiate the process
        _this.prepare();
    }]);
});
