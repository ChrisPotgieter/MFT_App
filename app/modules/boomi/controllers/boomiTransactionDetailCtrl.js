/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiTransactionDetailCtrl.js
 /// Controller for Boomi Transaction Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/10/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash', 'appCustomConfig'], function (module, lodash, appCustomConfig)
{

    "use strict";


    module.registerController('boomiTransactionDetailCtrl', ['$scope', '$state',  '$timeout', '$filter', 'uiSvc', 'boomiDataSvc', function ($scope, $state,  $timeout, $filter, uiSvc, dataSvc)
    {
        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {flags: {}};



        //<editor-fold desc="UI Functions">
        _this.functions.initializePanes = function(panes)
        {
            // override the panes creation

            $timeout(function () {
                var isTransactionView = $state.current.name.indexOf('baseview') > 0;
                if (isTransactionView) {

                    $scope.splitter.size(panes[1], "65%");
                    $scope.splitter.size(panes[2], "26%");
                }
                else
                {
                    $scope.splitter.size(panes[0], "15%");
                    $scope.splitter.size(panes[1], "55%");
                    $scope.splitter.size(panes[2], "30%");
                }
            }, 500);

        };

        _this.functions.initView = function()
        {
            // routine to initialize the view when the data changes
            let inError = $scope.data.module_data.module_status > 0;
            let baseProcessId = $scope.data.module_data.process_id;
            _this.model.meta_data  = dataSvc.parseMetaData($scope.data.meta_data);

            // check if there are failed documents steps (and set the status = bootlablel 3)
            //$scope.data.baseTransaction.alertClass="alert alert-danger";
            lodash.forEach($scope.data.module_data.steps, function(step, i)
            {
                step.dataIndex = i;
            });
            _this.model.sortedNodes = lodash.sortBy($scope.data.module_data.steps,"action_date", "desc");
            _this.model.displayNodes = lodash.map(_this.model.sortedNodes, function(step, index)
            {
                let record = _this.functions.buildStepNode(inError, baseProcessId, step);
                return record;
            });
        };

        _this.functions.buildStepNode = function (moduleError, baseProcessId, stepRecord)
        {
            // routine to build the information for the given step and return it
            let record = {action: stepRecord.action, action_date: stepRecord.action_date, source: stepRecord.source, input: stepRecord.input_count, output: stepRecord.output_count, errors: stepRecord.error_count, description: stepRecord.description, dataIndex: stepRecord.dataIndex, size: 0};
            record.process = {id: stepRecord.process_id, name: stepRecord.process_name, step_count: stepRecord.process_steps, current_step: stepRecord.sequence};
            record.supplemental = stepRecord.supplemental;
            if (stepRecord.documents)
            {
                // check if there is only 1 document, then show the view and meta-data
                if (stepRecord.documents.length == 1)
                {
                    let document = stepRecord.documents[0];
                    record.drillInfo = {};
                    if (document.meta_data && document.meta_data.length > 0)
                        record.drillInfo.meta_data = document.meta_data;
                    if (document.attachment_format)
                    {
                        record.drillInfo.type = 2;
                        record.drillInfo.attachment_id = document.attachment_id;
                        record.drillInfo.attachment_format = document.attachment_format;
                        record.drillInfo.attachment_text = "View Document (" + record.drillInfo.attachment_format + ")";
                    }
                    if (document.error)
                        record.drillInfo.error_text = document.error;
                   // check if we have meta-data
                   if (record.drillInfo.meta_data)
                   {
                       record.drillInfo.type = 1;
                       record.drillInfo.buttonText = "View Meta...";
                   }
                }
                else
                {
                    record.drillInfo = {type: 3, documents: stepRecord.documents, buttonText:"View Documents..."};
                }
                record.size = lodash.sumBy(stepRecord.documents, function(document)
                {
                    return (document.size != null ? document.size : 0);
                })

            };

            // figure out if this node is in error
            if (record.errors > 0)
                record.background = "bg-color-red";

            // figure out the right icon based on the action and process
            switch (record.action)
            {
                case 1:
                    record.icon = "fa-play";
                    record.name = "Started";
                    break;
                case 2:
                    record.icon =  "fa-cogs";
                    record.name = "Progress";
                    break;
                case 10:
                    record.icon =  "fa-flag-checkered";
                    record.name = "Completed";
                    break;
                case 90:
                    record.icon = "fa-exclamation-circle";
                    record.name = "Failed";
                    record.background = "bg-color-red";
                    break;
                case 91:
                    record.icon = "fa-exclamation-triangle";
                    record.name = "Failed Documents";
                    break;
            }

            // check if this is a different process that the base
            if (record.process.id != baseProcessId)
            {
                if (!record.background)
                    record.background = "bg-color-yellow";
            }
            if (record.size > 0)
                record.size =  $filter("bytesFilter")(record.size);
            return record;
        };


        _this.functions.drill = function(node)
        {
            // routine to manage the the default drill on the given node
            if (!node.drillInfo)
                return;
            if (node.drillInfo.attachment_id)
            {
                _this.functions.viewDocument(node);
                return;
            }
            if (node.drillInfo.meta_data)
            {
                _this.functions.viewMetaData(node);
                return;
            }
            if (node.drillInfo.type == 3)
            {
                _this.functions.viewDocuments(node);
            }
        };

        _this.functions.viewMetaData = function(node)
        {
            // routine to view document meta-data
            dataSvc.showDocumentMeta(node.drillInfo.meta_data);
        };

        _this.functions.viewDocument = function(data)
        {
            // routine to view the document when there is only 1 document for the step
            let record = {icon: data.icon, attachment_id: data.drillInfo.attachment_id, attachment_format: data.drillInfo.attachment_format};
            dataSvc.viewDocument(record);
        };

        _this.functions.viewDocuments = function(node)
        {
            // routine to view documents linked to a step
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/boomi/partials/document-list-dialog.tpl.html";
            controlOptions.controller = "boomiTransactionDocumentListDialogCtrl";
            controlOptions.size = 'lg';

            // show the dialog
            let record = {transactionId: $scope.data.transactionId, documents: node.drillInfo.documents, step: {description: node.description, dataIndex: node.dataIndex }};
            uiSvc.showDialog(record, controlOptions);
        };

        //</editor-fold>

        //<editor-fold desc="Listened Events">
        $scope.$on("panes_init", function(event, panes)
        {
            // once we know the splitter pane has been initialize the panes
            _this.functions.initializePanes(panes);

            // since we don't have a diagram on this view - this event will trigger the change of Transaction
            $scope.initView();
        });

        $scope.$on("boomi_changed", function()
        {
            // build the screen when we have been told we have data from the parent
            dataSvc.createBaseTransaction($scope.data);
            $scope.initializeTabs();
            $scope.widget.style={height: $state.current.data.infoHeight};
            _this.functions.initView();
        });
        //</editor-fold>
    }]);
});
