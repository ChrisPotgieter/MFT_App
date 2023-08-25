/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfTransactionDetailDialogCtrl
 /// CNO Automated Employer Group Transaction Detail Dialog Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 24/07/2023
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash)
{
    "use strict";
    module.registerController('aegfTransactionDetailDialogCtrl', ['$scope', '$panelInstance', '$filter', '$state', '$interval', 'uiSvc', 'transactionReportingSvc', 'speCNODataSvc', 'dialogData', function ($scope, $uibModalInstance, $filter, $state, $interval, uiSvc, transactionReportingSvc, dataSvc, dialogData)
    {
        let _this = this;
        _this.functions = {};
        _this.model = {};

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };

        _this.functions.confirmDialog = function()
        {
            // close the window
            $uibModalInstance.close({action: 0});
        };


        _this.functions.buildErrors = function()
        {
            // routine to build up a list of data errors for this report
          if (_this.model.base_record.module_data != null && _this.model.base_record.module_data.errors == null)
              return;

          _this.model.errors = [];
          lodash.forOwn(_this.model.base_record.module_data.errors, function(value, key)
          {
              let count = 0;
              if (angular.isArray(value))
                  count = value.length;
              else
                  count = value;
              _this.model.errors.push({key: key, value: $filter("number")(count), caption: dataSvc.aegf.functions.getErrorCaption(key)});
          })
        };
        _this.functions.buildDelivery = function()
        {
            // routine to build the delivery information based on the module data
            if (_this.model.base_record.module_data.delivery == null) {
                _this.model.delivery = null;
                return;
            }
            let delivery = _this.model.base_record.module_data.delivery;
            _this.model.delivery = {type: dataSvc.aegf.functions.getDeliveryType(delivery.type), destination: delivery.destination};
            if (delivery.path != null)
                _this.model.delivery.path = delivery.path;
        };

        _this.functions.buildStatus = function(deliveryMode)
        {
            // routine to build the status as needed by the status header
            _this.model.baseTransaction = transactionReportingSvc.createCommonBaseTransaction(_this.model.base_record);
            transactionReportingSvc.updateTransactionViewModel(_this.model.baseTransaction);

            let status = _this.model.base_record.module_data != null && _this.model.base_record.module_data.status ? _this.model.base_record.module_data.status : -1;
            if (status == 3)
            {
                // delivery has been paused update the display to warning colors as we don't want to set to warn
                let status = dataSvc.aegf.functions.getBootStrapStatus(_this.model.base_record.module_data.status);
                _this.model.baseTransaction.alertClass = "alert-" +  $filter("bootStrapStatusFilter")(status);
                _this.model.baseTransaction.labelClass = "label-" + $filter("bootStrapStatusFilter")(status);
                _this.model.baseTransaction.progressClass = "progress-bar-" + $filter("bootStrapStatusFilter")(status);
                _this.model.baseTransaction.statusIcon = $filter("bootStrapStatusIconFilter")(status);
            }

            // set the scope as the current info views use $scope
            $scope.data = {baseTransaction: _this.model.baseTransaction};

            // build the status information
            _this.model.statusClass = "label-" + $filter('bootStrapStatusFilter')(dataSvc.aegf.functions.getBootStrapStatus(_this.model.base_record.module_data.status));
            _this.model.status = dataSvc.aegf.functions.getModuleStatus(_this.model.base_record.module_data.status);
            if (deliveryMode && status == 3)
                _this.model.status = "Waiting for  Delivery...";
        };
        _this.functions.buildInfo = function()
        {
            // build the employer group and subgroup information
            _this.model.employer = {id: _this.model.base_record.module_data.employer_id};
            let sub_group = null;
            if (_this.model.base_record.module_data.sub_group != null && _this.model.base_record.module_data.sub_group != '')
            {
                _this.model.sub_group = {id: _this.model.base_record.module_data.sub_group};
                sub_group = _this.model.sub_group.id;
            }
            let returnDesc = dataSvc.aegf.functions.getGroupDescriptions(_this.model.employer.id, sub_group);
            _this.model.employer.crs_code = returnDesc.group_code;
            _this.model.employer.desc = returnDesc.groupDesc;

            if (sub_group != null)
                _this.model.sub_group.desc = returnDesc.subGroup;
        };

        _this.functions.waitForDelivery = function()
        {
            // routine to wait for a the delivery to complete on a resume delivery operation or timeout
            _this.model.waitAttempts += 1;
            transactionReportingSvc.readCommonTransaction(dialogData.id).then(function(data)
            {
                _this.model.base_record = data;
                _this.functions.buildStatus(true);
                _this.functions.buildDelivery();

                // check if the status is still paused, if not cancel
                if (_this.model.waitAttempts > 10 ||  (_this.model.base_record.module_data != null && _this.model.base_record.module_data.status != 3))
                    uiSvc.cancelTimers(_this.model.timers);
            }).catch(function(err)
            {
                console.log("read err", err);
            })

        }
        _this.functions.startDeliveryTimer = function(result)
        {
            // routine to start the a timer which refreshes the details every few seconds until delivery is complete
            if (_this.model.timers.mainTimer == null)
            {
                _this.model.waitAttempts = 0;
                let seconds = 2;
                _this.model.timers.mainTimer = $interval(_this.functions.waitForDelivery, seconds * 1000);
            }
        };


        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            transactionReportingSvc.readCommonTransaction(dialogData.id).then(function(data)
            {
                _this.model.timers = {mainTimer: null};
                _this.model.base_record = data;
                _this.model.id = data.transactionId;
                _this.functions.buildStatus();
                _this.functions.buildInfo();
                _this.functions.buildDelivery();
                _this.functions.buildErrors();
            }).catch(function (err)
            {

            });
        };
        //</editor-fold>

        //<editor-fold desc="Function Manager">
        _this.functionManager = {};
        _this.functionManager.viewPayload = function()
        {
            let record = {attachment_id: _this.model.base_record.module_data.payload_id, attachment_format: _this.model.base_record.module_data.payload_format, icon: "fa-paperclip"};
            dataSvc.aegf.functions.viewDocument(record);
        };

        _this.functionManager.deliver = function () {
            // routine to perform the CLI Operation that will Resume the Delivery
            let cliOperation = {
                ui:
                    {
                        question: "Resume Delivery",
                        class: "txt-color-",
                        icon: "fa fa-refresh",
                        description: "Resume Delivery of a Paused Report",
                        silentFunc: _this.functions.startDeliveryTimer
                    },
                operation: dataSvc.cliInstructionEnum.AEGF_RESUME_DELIVERY,
                class: 'txt-color-teal'
            };
            cliOperation.record = {id: _this.model.base_record.module_data.definition_id, transaction_id: _this.model.id, path:_this.model.base_record.module_data.store_path};
            dataSvc.confirmCLIOperation(cliOperation);
        };


        _this.functionManager.viewError = function(error)
        {
            // routine to redirect the user to the correct screen based on the given error key
            let model = null;
            switch (error.key)
            {
                case "lob_deduction":
                case "lob":
                    model = {group_id: _this.model.employer.id};
                    $state.go("app.custom.crs.parameters.lob", model);
                    $uibModalInstance.dismiss('cancel');
                    break;
                case "employee_code":
                    model = {group_id: _this.model.employer.id};
                    if (_this.model.sub_group != null)
                        model.sub_group_id = _this.model.sub_group.id;
                    $state.go("app.custom.crs.parameters.emp_codes", model);
                    $uibModalInstance.dismiss('cancel');
                    break;
                default:
                    _this.functions.viewDefinition();
                    break;
            }
        };

        _this.functionManager.viewDefinition = function()
        {
            // routine to navigate the user to the definition
            dataSvc.aegf.functions.viewDefinition(_this.model.base_record.module_data.definition_id);
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>

        $scope.$on('$destroy', function ()
        {
            // Make sure that the interval is destroyed too
            console.log("cancelling2");
            uiSvc.cancelTimers(_this.model.timers);
        });


        _this.functions.initialize();
    }]);
});
