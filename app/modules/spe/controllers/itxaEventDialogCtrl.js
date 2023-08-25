/*
 /// <summary>
 /// app.modules.spe.controllers - itxaEventDialogCtrl.js
 /// Controller for ITX Transaction ITXA Event Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/10/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('itxaEventDialogCtrl', ['$uibModalInstance', '$filter', 'uiSvc', 'transactionReportingSvc', 'speDataSvc', 'dialogData', function ($uibModalInstance, $filter, uiSvc, transactionReportingSvc, dataSvc, dialogData)
    {

        // initialize variables
        let _this = this;
        _this.model = {grid:{}, record: dialogData};


        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.init = function()
        {
            // routine to initialize the controller based on the data
            _this.functions.setupStatus();
            _this.functions.setupGrid();
            _this.functions.setupAttachments();
        };
        _this.functions.setupStatus = function()
        {
            // routine to setup the status variables
            _this.model.status = {};

            // first determine the alert-class based on the status
            let alertStatus = _this.model.record.status == 1 ? 2: 99;
            _this.model.status.alertClass = "alert-" + $filter('bootStrapStatusFilter')(alertStatus);
            _this.model.status.icon = "alert-" + $filter('bootStrapStatusIconFilter')(alertStatus);

            // get the event type
            _this.model.title = dataSvc.getEventDescription(_this.model.record.type) + " : " + transactionReportingSvc.getMongoTransactionStatus(_this.model.record.progress_type);
            _this.model.icon = dataSvc.getEventIcon(_this.model.record.type);
            if (!_this.model.record.progress_type)
                _this.model.record.progress_type = 10;

            if (_this.model.record.event_date)
                _this.model.record.event_date = uiSvc.formatDate(_this.model.record.event_date);
        };
        _this.functions.setupAttachments = function()
        {
            if (_this.model.record.attachments)
                _this.model.attachments = _this.model.record.attachments;

        };
        _this.functions.setupGrid = function()
        {
            // routine to setup the grid
            if (!_this.model.record.data)
                _this.model.record.data = {};

            // move all properties into a grid dataset
            _this.model.grid.data = [];
            _this.model.grid.height = "400";
            lodash.forOwn(_this.model.record.data, function(value, key)
            {
                _this.model.grid.data.push({key: key, value: value, category:"ITX/A Event Data"})
            });
        };
        //</editor-fold>



        // initialize the controller
        _this.functions.init();
    }]);
});
