/*
 /// <summary>
 /// app.modules.spe.controllers - speSenderImportCtrl
 /// SPE Controller for Managing Sender Profile Imports
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/04/2017
 /// </summary>
 */

define(['modules/spe/module', 'lodash', 'ng-fileupload'], function (module, lodash) {

    "use strict";

    module.registerController('speSenderImportCtrl', ['$uibModalInstance', '$scope', '$log', '$interval', 'Upload', 'speDataSvc','adminDataSvc','userSvc', 'uiSvc', 'apiSvc', function ($uibModalInstance, $scope, $log, $interval, Upload, speDataSvc, adminDataSvc, userSvc, uiSvc, apiSvc)
    {
       var _this = this;

       _this.titleData = {icon:"fa fa-upload", desc: "Sender Profile Import", failureMsg:"Import Failed"};
       _this.modalResult = null;
       _this.importModel = {user_id: userSvc.getProfile().id, companyId: userSvc.getOrgInfo().companyId};
       _this.progressInfo = {icon:"fa fa-upload", showProgress: false, title:"ITXA Sender Import", description:"Not Selected", perc: "0%", allowOK:false, allowCancel: true, showLineDisplay: false, showOK: true, showCancel: true, OKText: "Proceed"};
       _this.uploadFile = $scope.uploadImportFile;
       _this.timer = null;


        _this.upload = function()
        {
            // routine to upload the file to the server
            _this.stopTimer();
            _this.progressInfo.showProgress = true;
            if (_this.uploadFile && _this.uploadFile.$error)
                return uiSvc.showUploadError(_this, _this.uploadFile.$error);

            // formulate the upload request
            var uploadRequest = {file: _this.uploadFile};
            uploadRequest.metaData = {destinationFileName: "SPESenderImport.xlsx", destinationPath:"SPE"};
            _this.progressInfo.perc = 0;
            _this.progressInfo.icon = "fa fa-upload";
            var promise = Upload.upload({url:apiSvc.baseUrl + '/upload/uploadTemp', data: uploadRequest});

            // upload was successful, prepare the import
            promise.then(function(successEvent)
            {
                // successful upload - get the result
               _this.importModel.fileName = successEvent.data;
               _this.prepareImport();
            }, function(failureEvent)
            {
                return uiSvc.showUploadError(_this, failureEvent.data);
            }, function(progressEvent)
            {
                    // update the progress bar
                _this.progressInfo.perc = Math.min(100, parseInt(100.0 * progressEvent.loaded / progressEvent.total)) + "%";
                _this.progressInfo.description = _this.progressInfo.perc + " Complete";

            });
        };


        _this.prepareImport = function()
        {
            // routine to prepare the import

            _this.progressInfo = {icon:"fa fa-cog", showProgress: true, title: "ITXA Sender Import", description:"Preparing for Import", perc: "1%", allowOK:false, allowCancel: false, showLineDisplay: false, initialized: false, showOK: true, OKText:"OK"};
            if (!$scope.importFunction)
                $scope.importFunction = speDataSvc.senderImport;

            $scope.importFunction(_this.importModel).then(function(result)
            {
                _this.importModel.id = result.oid;
                _this.updateProgress(result);
                _this.startTimer();
            }).catch(function(result)
            {
                $log.error("Unable to Prepare for Sender Profile Import", result);
            })
        };

        _this.startTimer = function()
        {
            // routine to manage the timer
            if (_this.timer == null)
               _this.timer = $interval(_this.refreshImportProgress, 3 * 1000);
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
               _this.progressInfo.title = "ITXA Sender Import";
               _this.progressInfo.perc = "100%";
               _this.progressInfo.allowOK = true;
               _this.progressInfo.allowCancel = true;
               _this.stopTimer();
               return;
            }
            if (status == uiSvc.backgroundProcessStates.STARTED)
            {
                _this.progressInfo.showLineDisplay = true;
                _this.progressInfo.icon = "fa fa-timer";
                _this.progressInfo.description = model.description;
                _this.progressInfo.title = model.title;
                _this.progressInfo.perc = model.progress + "%";
                _this.progressInfo.allowOK = false;
                _this.progressInfo.allowCancel = false;
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
                _this.progressInfo.icon = "fa fa-times";
                _this.progressInfo.allowOK = true;
                _this.progressInfo.allowCancel = true;
                _this.progressInfo.title = model.title;
                _this.progressInfo.description = model.description;
                _this.progressInfo.perc = "100%";
                _this.progressInfo.lines.push("Import Failed");
                _this.stopTimer();
                return;
            }
        };

        _this.ok = function()
        {
            // close the window
            if (_this.importModel.id)
            {
                adminDataSvc.deleteProgress(_this.importModel.id).then(function ()
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

        _this.cancel = function()
        {
            // close the window
            if (_this.importModel.id)
            {
                adminDataSvc.deleteProgress(_this.importModel.id).then(function ()
                {
                    $uibModalInstance.dismiss('cancel');
                }).catch(function()
                {
                    $uibModalInstance.dismiss('cancel');
                });
            }
            else
            {
                $uibModalInstance.dismiss('cancel');
            }
        };


        _this.refreshImportProgress = function ()
        {
            // routine to request an update of the progress from the server
          adminDataSvc.readProgress(_this.importModel.id).then(function (result)
          {
              // now update the progress information
              _this.updateProgress(result);
          }).catch(function (result)
          {
              $log.error("Unable to retrieve Progress Update from Server", result);
          });
        };

        // initiate the upload
        _this.upload();




    }]);
});
