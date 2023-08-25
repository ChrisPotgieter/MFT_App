/*
 /// <summary>
 /// app.modules.spe.controllers - speTransactionRepairCtrl
 /// SPE Controller for Managing the Repair of a Transaction
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 26/03/2017
 /// </summary>
 */

define(['modules/spe/module', 'file-saver', 'ng-fileupload'], function (module, filesaver) {

    "use strict";

    module.registerController('speTransactionRepairCtrl', ['$uibModalInstance', '$q', '$scope', '$log','apiProvider','apiSvc', 'uiSvc', 'Upload',function ($uibModalInstance, $q, $scope, $log, apiProvider, apiSvc, uiSvc, Upload)
    {

        var _this = this;

        _this.uploadFile = {name:''};
        _this.modalResult = null;
        _this.progressInfo = {icon:"fa fa-upload", showProgress: false, description:"Not Selected", perc: "0%", allowUpload:false};

        $scope.$watch('vm.uploadFile', function(newValue, oldValue)
        {
            // initialte the file upload when the upload file is selected
            if (!newValue || newValue == '')
                return;
            if (newValue == oldValue)
                return;
            _this.upload();
        });

        _this.download = function()
        {
            // work out the type based on the type
            apiProvider.getBlob('mftTransDetailIIBTransDoc',{transactionId: $scope.data.baseTransaction.stateInfo.payloadid, id : $scope.data.baseTransaction.stateInfo.payload}).then(function (response)
            {
                var file = new Blob([response.blob], {type: response.blob.type});
                if (response.blob.type == "application/octet-stream")
                    filesaver(response.blob, response.fileName);
                else
                {
                    uiSvc.openBlob(file);
                }
                _this.progressInfo.allowUpload = true;
            }).catch(function (result)
            {
                $log.error("Unable to download SPE Document", result);
            });
        };

            _this.upload = function()
        {
            // routine to upload the file to the server
            _this.modalResult = null;
            _this.progressInfo.showProgress = true;
            if (_this.uploadFile && _this.uploadFile.$error)
            {
                return uiSvc.showUploadError(_this, _this.uploadFile.$error);
            }
            // formulate the upload request
            var uploadRequest = {file: _this.uploadFile};
            uploadRequest.metaData = {destinationFileName: $scope.data.baseTransaction.transactionId + ".edi", destinationPath:"SPE"};
            _this.progressInfo.perc = 0;
            _this.progressInfo.icon = "fa fa-upload";
            var promise = Upload.upload({url:apiSvc.baseUrl + '/upload/uploadTemp', data: uploadRequest});

            // send the upload
            promise.then(function(successEvent)
            {
                // successful upload - enable the proceeed
               _this.modalResult = successEvent.data;
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



        _this.ok = function()
        {
            // close the window
            $uibModalInstance.close(_this.modalResult);
        };

        _this.cancel = function()
        {
            $uibModalInstance.dismiss('cancel');
        };


    }]);
});
