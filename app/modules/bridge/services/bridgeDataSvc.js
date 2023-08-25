/*
 /// <summary>
 /// app.modules.bridge.services - bridgeDataSvc.js
 /// Bridge Module Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2022
 /// </summary>
 */
define(['modules/bridge/module', 'lodash'], function(module, lodash)
{
    "use strict";
    module.registerService('bridgeDataSvc',['$filter','$log','$uibModal', 'apiSvc', 'apiProvider', 'cacheDataSvc', 'transactionReportingSvc', 'userSvc', 'chartSvc', 'uiSvc', function($filter, $log, $uibModal, apiSvc, apiProvider, cacheDataSvc, transactionReportingSvc, userSvc, chartSvc, uiSvc)
    {
        let _this = this;
        // setup the webservice calls
        let configs = [
            {url: 'bridge/xmlsign_wmq_gate/search', resourceName:'xmlSignWMQGateSearch'},
            {url: 'bridge/xmlsign_wmq_gate/dashboard', resourceName: 'xmlSignWMQGateDashboard'},
            {url :'bridge/xmlsign_wmq_gate/detail/:id', resourceName: 'xmlSignWMQGateDetail', params: {id:'@id'}},
        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });



        //<editor-fold desc="Common Functions">
        _this.parseMetaData = function(record)
        {
            // custom function to parse a meta-data record before it gets added to the grid
            if (record.key.startsWith("sender_"))
            {
                record.key = record.key.replace("sender_", "");
                record.category = "Sender Information";
            }
            if (record.key.startsWith("receiver_"))
            {
                record.key = record.key.replace("receiver_", "");
                record.category = "Receiver Information";
            }
        };

        _this.addProperty = function(category, key, value, data)
        {
            let categoryDesc = "MQ Message";
            switch (category)
            {
                case 0:
                    categoryDesc = "Bridge Details";
                    break;
                case 1:
                    categoryDesc = "Sender";
                    break;
                case 2:
                    categoryDesc = "Receiver";
                    break;
                case 3:
                    categoryDesc = "Processing";
                    break;
                case 20:
                    categoryDesc = "Cloud Bridge";
                    break;
                case 21:
                    categoryDesc = "XML Sign Gateway";
                    break;
                case 91:
                    categoryDesc = "Message Properties";
                    break;
                case 92:
                    categoryDesc = "Put Details";
                    break;
                case 93:
                    categoryDesc = "Reply Details";
                    break;
                case 94:
                    categoryDesc = "Data Properties";
                    break;
                case 95:
                    categoryDesc = "Other Details";
                    break;
            }
            data.push({category: categoryDesc, key: key, value: value});
        };

        _this.buildBridgeGrid = function(record)
        {
            // routine to build a bridge grid from the given record and return it
            let data = [];
            _this.getCommonData(record);
            _this.addProperty(0, "Identifier", record._id, data);
            _this.addProperty(0, "Request Date",record.action_date, data);
            if (record.complete_date) {
                _this.addProperty(0, "Complete Date", record.complete_date, data);
                _this.addProperty(0, "Running Time", record.running_time_desc, data);
            }
            _this.addProperty(0, "Last Update",uiSvc.formatDate(record.sys_date), data);
            _this.addProperty(0, "Expiry",uiSvc.formatDate(record.expiry), data);
            _this.addProperty(0, "Direction",record.direction_desc, data);
            _this.addProperty(1, "Sender", record.sender, data);
            _this.addProperty(1, "Source Size", $filter('bytesFilter')(record.source_size), data);
            _this.addProperty(2, "Receiver", record.receiver, data);
            _this.addProperty(2, "Destination Size", $filter('bytesFilter')(record.destination_size), data);
            _this.addProperty(3, "Started",uiSvc.formatDate(record.processing_started), data);
            _this.addProperty(3, "Completed",uiSvc.formatDate(record.processing_completed), data);
            _this.addProperty(3, "Processing Time", record.processing_time_desc, data);
            switch (record.bridge)
            {
                case 2:
                    _this.parseXMLSignWMQGateModuleData(record, data);

            }

            _this.addProperty(0, "Bridge Type", record.bridge_type_desc, data);
            return data;
        };

        _this.buildMessagePropertyGrid = function(descriptor)
        {
            // routine to build the property grid
            let data = [];

            _this.addProperty(91,"Message Id", descriptor.message_id, data);
            _this.addProperty(91, "Correlation Id", $filter('ibmMQMessageIdFilter')(descriptor.correlation_id), data);
            _this.addProperty(91, "Group Id", $filter('ibmMQMessageIdFilter')(descriptor.group_id), data);
            _this.addProperty(91, "Message Sequence", $filter('number')(descriptor.message_sequence_number), data);
            _this.addProperty(91, "Message Offset", $filter('number')(descriptor.offset), data);
            _this.addProperty(91, "Encoding", $filter('ibmMQMessageEncodingFilter')(descriptor.encoding), data);
            _this.addProperty(91, "Type", $filter('ibmMQMessageTypeFilter')(descriptor.message_type), data);
            _this.addProperty(91, "Version", descriptor.version, data);
            let expiry = "Unlimited";
            if (descriptor.expiry > -1)
                expiry = $filter('secondsToStringFilter')(descriptor.expiry/10);
            _this.addProperty(91, "Expiry", expiry, data);



            _this.addProperty(92, "Put Type", $filter('ibmMQMessagePutTypeFilter')(descriptor.put_application_type), data);
            _this.addProperty(92, "Put Application", descriptor.put_application_name.trim(), data);
            _this.addProperty(92, "Put Date-Time",uiSvc.formatDate(descriptor.put_date_time), data);
            _this.addProperty(92, "User Id", descriptor.user_id.trim(), data);


            _this.addProperty(93, "Backout Count", $filter('number')(descriptor.backout_count), data);
            _this.addProperty(93, "Reply To Queue", descriptor.reply_to_queue_name.trim(), data);
            _this.addProperty(93, "Reply To Queue Manager", descriptor.reply_to_queue_manager_name.trim(), data);

            _this.addProperty(94, "Original Length", $filter('bytesFilter')(descriptor.original_length), data);
            _this.addProperty(94, "Data Length", $filter('bytesFilter')(descriptor.data_length), data);



            _this.addProperty(95, "Structure Identifier", descriptor.struc_id.trim(), data);
            _this.addProperty(95, "Report Options", $filter('ibmMQMessageReportFilter')(descriptor.report), data);
            _this.addProperty(95, "Feedback", $filter('ibmMQMessageFeedbackFilter')(descriptor.feedback), data);
            _this.addProperty(95, "Character-Set", $filter('ibmMQMessageCharsetFilter')(descriptor.character_set), data);
            _this.addProperty(95, "Format", descriptor.format.trim(), data);
            _this.addProperty(95, "Priority", descriptor.priority, data);
            _this.addProperty(95, "Persistence", $filter('ibmMQMessagePersistenceFilter')(descriptor.persistence), data);
            _this.addProperty(95, "Accounting Token", descriptor.accounting_token.trim(), data);
            _this.addProperty(95, "Application Identity Data", descriptor.application_id_data.trim(), data);
            _this.addProperty(95, "Application Origin Data", descriptor.application_origin_data.trim(), data);

            // return
            return data;
        };


        _this.getTransactionStatus = function(value)
        {
            return  transactionReportingSvc.getMongoTransactionStatus(value);
        };


        _this.getStatus = function(row)
        {
            // routine to get the status of the given row
            switch (row.status)
            {
                case 10:
                case 11:
                    row.rowStyle = null;
                    break;
                case 12:
                    row.rowStyle = "transactionRepair";
                    break;
                default:
                    row.rowStyle = "transactionError";
                    break;
            }
            if (row.attempts > 1 && row.status < 90)
                row.rowStyle = "recordUpdate";
            row.status_desc = _this.getTransactionStatus(row.status)
        };

        _this.getBootStrapStatus = function(value)
        {
            // routine to get the bootstrap status for the given bridge record status
            switch (value)
            {
                case 90:     /* Failed */
                    return 99;
                    break;
                default:
                    return 2;   // Success
                    break;
            }
        };

        _this.getCommonData = function(row)
        {
            // routine to get the status of the given row
            let parsed = null;
            switch (row.direction)
            {
                case 1:
                    row.direction_desc = "Outbound";
                    break;
                default:
                    row.direction_desc = "In-Bound";
                    break;
            }
            row.attempts = 1;
            if (row.audits)
                row.attempts = row.audits.length;
            if (row.running_time)
                row.running_time_desc = $filter("secondsToStringFilter")(row.running_time);
            if (row.processing_time)
                row.processing_time_desc = $filter("secondsToStringFilter")(row.processing_time);
            row.status_desc = _this.getTransactionStatus(row.status);
            row.action_date = uiSvc.formatDate(row.action_date)

            if (row.complete_date)
            {
                row.complete_date = uiSvc.formatDate(row.complete_date);
            }
        };


        //</editor-fold>

        //<editor-fold desc="XML Sign WMQ Gateway Bridge">
        _this.parseXMLSignWMQGateModuleData = function(record, dataset)
        {
            // routine to parse the module data for the bridge
            record.bridge_type_desc = "XML Sign Bridge";
            _this.addProperty(11, "Service Grouping", record.service_name, dataset);
            if (record.bridge_name)
                _this.addProperty(11, "Bridge Name", record.bridge_name, dataset);
            if (!record.module_data)
                return;
            let moduleData = record.module_data;
            if (moduleData.queue_manager != null)
                _this.addProperty(11, "Queue Manager", moduleData.queue_manager, dataset);
            if (moduleData.destination_queue != null)
                _this.addProperty(11, "Destination", moduleData.destination_queue, dataset);
            if (moduleData.source_queue != null)
                _this.addProperty(11, "Source", moduleData.source_queue, dataset);
        };

        _this.showXMLSignWMQGateDetail = function(id)
        {
            // routine to show the the detail of an XML WMQ Gate Transaction
            _this.readXMLSignWMQGate(id).then(function(data)
            {
                let record = data;
                let controlOptions = {};
                controlOptions.templateUrl = "app/modules/bridge/partials/xmlsign-wmq-gate-detail-dialog.tpl.html";
                controlOptions.controller = "xmlSignWMQGateDetailDialogCtrl";
                controlOptions.controllerAs = "vmDetailDialog";
                controlOptions.size = 'lg';
                controlOptions.windowClass = 'xl-modal';
                uiSvc.showDialog(record, controlOptions);
            }).catch(function (err)
            {
                $log.error("Unable to Display Dialog", err);
            });
        };

        _this.getXMLSignWMQGateColorPalette = function()
        {
            // routine to return the color palette for for the WMQ Gateway Bridge
            let baseColors = chartSvc.getColors();
            //let colors =  ['#6096BA', '#274C77','#FF6700', '#A3CEF1', '#023047', '#8B8C89'];
            //let color =  {error: baseColors.chartError, unk: baseColors.chartUnknown, requests: colors[0], success: colors[1], time: colors[2], bytes: colors[3], proc_time: colors[5]};
            let colors =  ['#89BBFE', '#006494','#25A18E', '#7AE582', '#615d6C', '#9EB3C2'];
            let color =  {error: baseColors.chartError, unk: baseColors.chartUnknown, requests: colors[0], success: colors[1], time: colors[2], proc_time: colors[3], send_bytes: colors[4], receive_bytes: colors[5]};

            return {
                colorArray: colors,
                colorNames: color
            };
        };

        _this.parseXMLSignCountData = function (data, updateObject)
        {
            // update the counts for the given data
            if (!data)
                return;
            updateObject.requests.value = $filter("number")(data.count);
            updateObject.succeeded.value = $filter("number")(data.succeeded);
            updateObject.failed.value = $filter("number")(data.failed);
            let time = $filter('number')(data.run_time, 2);
            let avg_time  = $filter('number')(data.avg_runtime, 2);
            //updateObject.run_time.value = $filter("secondsToStringFilter")(time);
            updateObject.run_time.value = time;
            updateObject.avg_runtime.value = $filter("secondsToStringFilter")(avg_time);
        };
        _this.parseXMLSignWMQGateGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                item.source_queue = item.module_data.source_queue;
                item.destination_queue = item.module_data.destination_queue;
                let value = $filter("localUTCStringFilter")(item.action_date);
                item.action_date = $filter("kendoDateFilter")(value);
                if (item.complete_date)
                {
                    value = $filter("localUTCStringFilter")(item.complete_date);
                    item.complete_date = $filter("kendoDateFilter")(value);
                }
                if (item.processing_started)
                {
                    value = $filter("localUTCStringFilter")(item.processing_started);
                    item.processing_started = $filter("kendoDateFilter")(value);
                    value = $filter("localUTCStringFilter")(item.processing_completed);
                    item.processing_completed = $filter("kendoDateFilter")(value);
                }
                value = $filter("localUTCStringFilter")(item.sys_date);
                item.sys_date = $filter("kendoDateFilter")(value);
                _this.getStatus(item);
            });
            return value;
        };
        _this.refreshXMLSignWMQGateDashboard = function(filterObject)
        {
            // routine to request the XML Sign WMQ Gateway Dashboard reporting for the given filter object
            return apiProvider.getObject('xmlSignWMQGateDashboard', filterObject);
        };

        _this.readXMLSignWMQGate = function(id)
        {
            // routine to return the agent document for the given id
            return apiProvider.get("xmlSignWMQGateDetail",{id: id});
        };
        _this.XMLSignWMQGateSearch = function(filterObject)
        {
            // routine to return all requests for the given filter with stats
            return apiProvider.getObject('xmlSignWMQGateSearch', filterObject);
        };


        //</editor-fold>


    }]);
});
