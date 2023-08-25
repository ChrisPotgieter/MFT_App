/*
 /// <summary>
 /// app.modules.spe.controllers - speDeEnvelopeCtrl
 /// SPE Controller for Managing De-Envelope Request with the ITXA Server
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07 August 2017
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('speDeEnvelopeCtrl', ['$uibModalInstance', '$scope', '$log', '$interval', 'speDataSvc',  'userSvc', 'uiSvc', 'adminDataSvc', function ($uibModalInstance, $scope, $log, $interval, speDataSvc, userSvc, uiSvc, adminDataSvc) {
        var _this = this;


        _this.titleData = {icon: "fa fa-folder-open", desc: "De-Envelope Request"};
        speDataSvc.prepareDeEnvelopeDialog(_this);
        _this.progressInfo.onProgressUpdateComplete = function(status)
        {
            if (status == uiSvc.backgroundProcessStates.COMPLETED || status == uiSvc.backgroundProcessStates.INERROR)
            {
                if (_this.lastProgress.info.report != null)
                    _this.progressInfo.buttons[0].visible = true;
            }
            if (status == uiSvc.backgroundProcessStates.COMPLETED)
            {
                _this.modalResult = true;
            }
            if (status == uiSvc.backgroundProcessStates.INERROR)
            {
                _this.modalResult = false;
            }
        };

        _this.modalResult = null;
        _this.dataModel = {userId: userSvc.getProfile().id};
        _this.timer = null;

        _this.prepare = function () {
            // routine to prepare the process
            if ($scope.vm.flags.rawMode)
                _this.dataModel.payload = $scope.vm.data.rawEditor;
            else
                _this.dataModel.lines = $scope.gridEditor.dataSource.data();
            _this.dataModel.gwid = $scope.gwid;

            speDataSvc.validatePayload(_this.dataModel).then(function (result) {
                _this.dataModel.id = result.oid;
                _this.updateProgress(result);
                _this.startTimer();
            }).catch(function (result) {
                $log.error("Unable to Prepare for De-Envelope Request", result);
            })
        };

        _this.startTimer = function () {
            // routine to manage the timer
            if (_this.timer == null)
                _this.timer = $interval(_this.refreshProgress, 3 * 1000);
        };
        _this.stopTimer = function () {
            // stop the timer
            if (_this.timer) {
                var cancelled = $interval.cancel(_this.timer);
                if (cancelled)
                    _this.timer = null;
            }
        };

        _this.updateProgress = function (model)
        {
            // routine to update the progress object when the server has sent us a new model
            uiSvc.updateLongRunProgress(model, _this);
        };

        _this.close = function()
        {
            // routine to correctly close the window
            if (_this.modalResult)
                $uibModalInstance.close(_this.modalResult);
            else
                $uibModalInstance.dismiss(_this.lastProgress.info.error);
        };

        _this.ok = function () {
            // close the window
            if (_this.dataModel.id) {
                adminDataSvc.deleteProgress(_this.dataModel.id).then(function ()
                {
                    _this.close();
                }).catch(function ()
                {
                    _this.close();
                });
            }
            else {
                _this.close();
            }
        };

        _this.refreshProgress = function () {
            // routine to request an update of the progress from the server
            adminDataSvc.readProgress(_this.dataModel.id).then(function (result) {
                // now update the progress information
                _this.updateProgress(result);
            }).catch(function (result) {
                $log.error("Unable to retrieve Progress Update from Server", result);
            });
        };

        // initiate the process
        _this.prepare();
    }]);
});
