
/*
 /// <summary>
 /// modules.common.directives.input - mqaFileUpload.js
 /// Abstraction of the angular-file upload single directive to allow uploading of files to the server
 /// https://github.com/danialfarid/ng-file-upload/blob/master/README.md#full-reference
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 26/03/2017
 /// </summary>
 */

define(['modules/common/module', 'ng-fileupload'], function(module){
  "use strict";

  module.registerDirective('mqaFileUpload', ['apiSvc', 'Upload', function(apiSvc, Upload){
    return {
        restrict: 'E',
        templateUrl: 'app/modules/common/directives/input/mqaFileUpload.tpl.html',
        scope:
            {
            title:'@',
            onUploadSuccess:'&',
            onUploadFailure:'&?',
            onPreUpload:'&?'
        },
        link: function ($scope, element)
        {
            // routine to upload the file to the server
            $scope.upload = function(file, errFiles)
            {
                $scope.fileToUpload = file;
                if (file)
                {
                    // upload the file to the server
                    var uploadRequest = {file: file};
                    if ($scope.onPreUpload)
                        uploadRequest.metaData = $scope.onPreUpload()();

                    // update the progress bar
                    file.progress = 0;
                    var promise = Upload.upload({url:apiSvc.baseUrl + '/api/upload/singleUpload', data: uploadRequest});

                    promise.then(function(successEvent)
                    {
                        if ($scope.onUploadSuccess)
                            $scope.onUploadSuccess(successEvent);
                    }, function(failureEvent)
                    {
                        if ($scope.onUploadFailure)
                            $scope.onUploadFailure(failureEvent);
                    }, function(progressEvent)
                    {
                        // update the progress bar
                        file.progress = Math.min(100, parseInt(100.0 * progressEvent.loaded / progressEvent.total))
                    });
                }
            }
        }
    }
  }]);

});


