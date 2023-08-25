/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionDetailCtrl.js
 /// Controller for IIB v2 Transaction Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/03/2019
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash', 'appCustomConfig'], function (module, lodash, appCustomConfig)
{

    "use strict";

	module.registerController('iibv2TransactionDetailCtrl', ['$scope', '$log', '$state',  '$stateParams', '$timeout', '$uibModal', 'uiSvc', 'transactionReportingSvc', 'iibv2DataSvc', function ($scope, $log, $state, $stateParams, $timeout, $uibModal, uiSvc, transactionReportingSvc, iibv2DataSvc)
    {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {flags: {allowResubmit: false, allowRepair: false}};


        //<editor-fold desc="Node Building">
        _this.functions.buildStandardNode = function (record, activeNode)
        {
            // routine to build the information for a standard node
            if (activeNode.info && activeNode.info.length >= 1)
            {

                var node = activeNode.info[0];
                if (node.attachment_id != null)
                {
                    record.drillInfo = { id: node.attachment_id, format: node.attach_format};
                    record.drillInfo.buttonText =  node.description;
                    record.drillInfo.buttonText +=  " (" + node.attach_format + ")";

                    // get the icon and styling
                    var attachment = {blobFormat: node.attach_format};
                    uiSvc.getAttachmentStyle(attachment);
                    record.background = attachment.background;
                    record.icon = attachment.icon;
                    let allowOperation = (node.resubmit_destination && node.resubmit_destination != '' && activeNode.node_type == 0);
                    if (node.resubmit_queue)
                        node.resubmit_destination = node.resubmit_queue;
                    if (node.error_destination)
                        record.error_destination = node.error_destination;
                    record.allowResubmit = (allowOperation && _this.model.flags.allowResubmit);
                    record.allowRepair = (allowOperation && _this.model.flags.allowRepair);
                    if (record.allowRepair || record.allowResubmit)
                        record.resubmit_destination = node.resubmit_destination;
                }
                if (node.headers && activeNode.node_type == 0)
                    record.headers = node.headers;
                _this.model.description = node.description;
            }
            else
            {
                record.icon = "fa-laptop";
                record.drillInfo = null;
                record.allowDrill = false;
                if (!record.name)
                    record.name = "Integration Node";
                if (!record.description)
                    record.description = activeNode.name;
            }
        };

        _this.functions.buildTimeLineInfo = function(id)
        {
            // routine to build up the object that can be used for the time line dialog
            var node = _this.model.sortedNodes[id];
            if (!node || !node.info)
                return;
            let finalRecord = {data:{}};
            finalRecord.data.events = lodash.map(node.info, function(eventNode)
            {
                var record =  {actionDate: eventNode.event_time, action: eventNode.event, description: eventNode.description, blobFormat: null, allowResubmit: false, allowRepair: false, resubmit_destination: null, error_destination: null, allowHeaders: false};
                if (eventNode.attachment_id)
                {
                    if (!eventNode.attach_format)
                        eventNode.attach_format = "txt";
                    record.blobFormat = eventNode.attach_format;
                    record.oid = eventNode.attachment_id;

                }
                if (eventNode.resubmit_queue)
                    eventNode.resubmit_destination = eventNode.resubmit_queue;
                if (eventNode.error_destination)
                    record.error_destination = eventNode.error_destination;
                let allowOperation =  (eventNode.resubmit_destination && eventNode.resubmit_destination != '');
                record.allowResubmit =  (allowOperation && _this.model.flags.allowResubmit);
                record.allowRepair =  (allowOperation && _this.model.flags.allowRepair);
                if (record.allowResubmit || record.allowRepair)
                    record.resubmit_destination = eventNode.resubmit_destination;
                if (eventNode.headers)
                    record.headers = eventNode.headers;
                return record;
            });
            iibv2DataSvc.updateTimeEventsViewModel(finalRecord.data.events);
            return finalRecord;
        }

        _this.functions.buildCommandInfo  = function(id)
        {
            // routine to build the information needed for a command information dialog
            var node = _this.model.sortedNodes[id];
            if (!node || !node.info)
                return;
            var info = node.info;

            let record = {command_details:{}};
            record.command_name = node.info.command;
            record.command_type = info.type;

            // add arguments
            if (info && info.arguments)
                record.command_details.arguments = info.arguments;

            // add the settings
            if (info.retry_wait > 0 || info.retry_count > 0) {
                record.command_properties = {};
                record.command_properties.retryCount = info.retry_count;
                record.command_properties.retryWait = info.retry_wait;
            }


            // update the overall result
            var resultObject = {};
            resultObject.outcome = 0;
            resultObject.executeDateTime = info.command_time;
            resultObject.returnCode = info.return_code;
            resultObject.executeRetries = info.retry_count;
            if (info.return_code  > 0)
                resultObject.outcome = 1;

            // get the outputs
            let result = {outcome:  resultObject.outcome, returnCode: resultObject.returnCode, command_date: resultObject.executeDateTime};
            if (info.standard_error)
            {
                resultObject.outcome = 1;
                result.outcome = 1;
                result.standard_error = info.standard_error;
            }

            if (info.standard_output != null)
            {
                if (result.outcome < 1)
                    result.outcome = 0;
                result.standard_output = info.standard_output;
            }
            record.results = [result];
            record.resultObject = resultObject;
            return record;
        };
        //</editor-fold>

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

        _this.functions.showDialog = function(record, controlOptions, size)
        {
            // routine to bring up the dialog for meta data entry
            if (size != null)
                controlOptions.size = size;
            uiSvc.showDialog(record, controlOptions);
        };

        _this.functions.initView = function()
        {
            // routine to initialize the view when the data changes
            var inError = $scope.data.module_data.module_status > 0;
            var fieldName = $scope.data.module_data.nodes[0]["event_sequence"] != null ? "event_sequence" : "event_date";
            _this.model.cliOperations = transactionReportingSvc.calcTransactionOperations($scope.data.baseTransaction);
            let found = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.RESUBMIT_TRANSACTION});
            if (found)
                _this.model.flags.allowResubmit = true;
            found = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION});
            if (found)
                _this.model.flags.allowRepair = true;
            _this.model.meta_data  = $scope.data.meta_data;
            _this.model.sortedNodes = lodash.sortBy($scope.data.module_data.nodes,[fieldName]);
            _this.model.displayNodes = lodash.map(_this.model.sortedNodes, function(activeNode, index)
            {
                let record =  {actionDate: activeNode.event_date, name: activeNode.name,  type: activeNode.node_type, terminal: activeNode.terminal, drillInfo: null, background:"bg-color-blue", allowResubmit: false, allowRepair: false, resubmit_destination: null, error_destination: null, headers: false, error: false};
                record.description = (!activeNode.description) ? activeNode.type : activeNode.description;
                _this.functions.buildStandardNode(record, activeNode);

                if (record.type == 1)
                {
                    record.icon = "icon-shell";
                    if (activeNode.info && activeNode.info.return_code > 0)
                    {
                        record.icon = "icon-script";
                        record.error = true;
                    }
                    record.drillInfo = {id: index};
                    record.drillInfo.buttonText =  "View Details";
                }
                if (record.type == 2) {
                    record.icon = "fa fa-paperclip";
                    record.drillInfo = {id : index};
                    record.error_destination = null;
                    record.drillInfo.buttonText = "View Details";
                }
                if (inError)
                    record.background = record.error ? "bg-color-red"  : "bg-color-orange-error";

                return record;
            });
        };

        _this.functions.drill = function(node)
        {
            // routine to manage the drill of the node
            if (!node.drillInfo)
                return;
            let controlOptions = null;
            let record = null;
            switch (node.type)
            {
                case 0:
                    // attachment download
                    transactionReportingSvc.viewInLineAttachment(node.drillInfo.id, node.drillInfo.format, 1, node.icon);
                    break;
                case 1:
                    // command node
                    controlOptions =
                        {
                            templateUrl: 'app/modules/common/partials/dialog-command-info.tpl.html',
                            controller: 'commonCommandInfoDialogCtrl',
                        };
                    record = {};
                    record.data = _this.functions.buildCommandInfo(node.drillInfo.id);
                    record.title = "Command Information";
                    record.icon = "fa " + node.icon;
                    _this.functions.showDialog(record, controlOptions);
                    break;
                case 2:
                    // time line node
                    controlOptions =
                        {
                            templateUrl: 'app/modules/common/partials/dialog-timeline.tpl.html',
                            controller: 'commonTimeLineDialogCtrl',
                        };

                    record = _this.functions.buildTimeLineInfo(node.drillInfo.id);
                    record.title = "Payload Information";
                    record.icon = "fa " + node.icon;
                    record.module = 1;
                    record.handleButton = function(data, type)
                    {
                        if (type == 0)
                            _this.functions.handleResubmit(data);
                        if (type == 1)
                            _this.functions.handleRepair(data);
                        if (type == 2)
                            _this.functions.viewHeaders(data);


                    };
                    _this.functions.showDialog(record, controlOptions, 'lg');
                    break;

            }
        };
        //</editor-fold>

        //<editor-fold desc="Listened Events">
        $scope.$on("panes_init", function(event, panes)
        {
            // once we know the splitter pane has been initialize the panes
            _this.functions.initializePanes(panes);

            // since we don't have a diagram on this view - this event will trigger the change of Transaction
            // TODO: Check This
            $scope.initView();
        });

        $scope.$on("iib_v2_changed", function()
        {
            // build the screen when we have been told we have data from the parent
            iibv2DataSvc.createBaseTransaction($scope.data);
            $scope.initializeTabs();
            $scope.widget.style={height: $state.current.data.infoHeight};
            iibv2DataSvc.getLists().then(function(result)
            {
                iibv2DataSvc.setTransactionDescriptions(result, $scope.data.module_data, 0);
                _this.functions.initView();
            }).catch(function(err)
            {
                $log.error("Unable to get Transaction Descriptions", err);
            });

            _this.functions.initView();
        });
        //</editor-fold>


        //<editor-fold desc="CLI Operations">
        _this.functions.viewHeaders = function(node)
        {
            // routine to get the headers for the node and display them
            let payloadId = (node.oid ? node.oid : node.drillInfo.id);

            transactionReportingSvc.getRepair(payloadId, 1, 1).then(function(responseData)
            {

                let headers = responseData.headers;
                let controlOptions = {};
                controlOptions.templateUrl = "app/modules/common/partials/common-meta-view-dialog.tpl.html";
                controlOptions.controller = "commonMetaDialogCtrl";
                controlOptions.size = 'lg';

                // format the data
                let records = uiSvc.parseMetaGridData(headers);
                let record = {title:"Payload Header Information", records: records};
                uiSvc.showDialog(record, controlOptions);

            }).catch(function (err)
            {
                uiSvc.showError("Payload Headers", err);
            });

        }
        _this.functions.handleRepair = function(node)
        {
            // routine to handle the repair
            let cliFunctions = {};
            let data = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION});
            let payloadId = (node.oid ? node.oid : node.drillInfo.id);
            let format = (node.blobFormat ? node.blobFormat : node.drillInfo.format);

            // setup the functions
            cliFunctions.confirmFunction = function(repairData)
            {
                // function to invoke the initial post to the rest api when the user accepts
                data.record = {
                    payloadId: payloadId,
                    destination: node.resubmit_destination,
                    content: repairData.content,
                    headers: repairData.headers,
                    transactionId: $scope.data.baseTransaction.transactionId
                };
                iibv2DataSvc.lastCLIRequest = data;
                let request = {operation: data.operation, arguments: data.record};
                return iibv2DataSvc.sendCLIRequest(request);
            };
            cliFunctions.responseFunction = function(dialog, result)
            {
                iibv2DataSvc.handleCLIProgressResponse(dialog, result);
            };
            cliFunctions.completeFunction = function(result, isError)
            {
                if (result.error)
                    uiSvc.showExtraSmallPopup(data.description, "Instruction Failed  !<br/>" + result.error, 5000, "#ce2029", "times");
                _this.functions.completeCLIOperation(result, result.error != null, data);
            };
            cliFunctions.errorFunction = function(err)
            {
               if (err === 'cancel')
                   return;
               uiSvc.showExtraSmallPopup(data.desc, "Instruction Failed  !<br/>" + err, 5000, "#ce2029", "times");
            };
            transactionReportingSvc.viewRepair("Node Repair", payloadId, format, 1, cliFunctions);
        };
        _this.functions.handleResubmit = function(node)
        {
            // routine to request a resubmission of the given node payload using the CLI
            let data = lodash.find(_this.model.cliOperations, {operation: transactionReportingSvc.transCliInstructionEnum.RESUBMIT_TRANSACTION});
            if (data != null)
            {
                // adjust the data
                data.ui.description = "Re-Submit Node Payload...";

                if (node.oid)
                {
                    data.ui.question = "Re-Submit " + node.action  + " Payload to " + node.resubmit_destination;
                    data.record = {payloadId: node.oid, destination: node.resubmit_destination};
                }
                else
                {
                    data.ui.question = "Resubmit " + node.name  + " Payload to " + node.resubmit_destination;
                    data.record = {payloadId: node.drillInfo.id, destination: node.resubmit_destination};
                }
                data.record.transactionId = $scope.data.baseTransaction.transactionId;

            }
            data.completeFunction = function(result, isError)
            {
                _this.functions.completeCLIOperation(result, isError, data);
            };
            iibv2DataSvc.confirmCLIOperation(data);
        };

        _this.functions.completeCLIOperation = function(modalResult, isError, operationData)
        {
            // routine to handle the completion of the CLI Operation
            if (isError)
                return;
            let message = null;
            let title = null;
            switch (operationData.operation)
            {
                case transactionReportingSvc.transCliInstructionEnum.RESUBMIT_TRANSACTION:
                    title = "Resubmission";
                    message = "The Node Resubmission";
                    break;
                case transactionReportingSvc.transCliInstructionEnum.REPAIR_TRANSACTION:
                    title = "Repair";
                    message = "The Node Repair";
                    break;

            }
            message += " Request has been sent Successfully !</br>Message Id " + modalResult;
            if (!title)
                return;
            uiSvc.showExtraSmallPopup(title + " Request", message   + " Successfully !", 5000);
        };
        //</editor-fold>


    }]);
});
