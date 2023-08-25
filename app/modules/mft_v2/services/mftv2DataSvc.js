/*
 /// <summary>
 /// app.modules.mft_v2.services - mftv2DataSvc.js
 /// MFT V2 Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */
define(['modules/mft_v2/module', 'lodash'], function(module, lodash)
{
    "use strict";
    module.registerService('mftv2DataSvc',['$filter','$q', '$log','$state', '$uibModal', 'apiSvc', 'apiProvider', 'cacheDataSvc', 'transactionReportingSvc', 'userSvc', 'chartSvc', 'uiSvc', function($filter, $q, $log, $state, $uibModal, apiSvc, apiProvider, cacheDataSvc, transactionReportingSvc, userSvc, chartSvc, uiSvc)
    {
        var _this = this;
        _this.data = {metaFields: [], agentCache:null, lastCLIRequest: null};
        _this.operationsEnum = {TRANSACTION: 0, MONITOR: 1, AGENT: 2};
        _this.statusEnum = {STARTED: 1, OPERATION_PENDING: 2, STOPPED: 0, PAUSED: 30, DELETED: 99, DELETE_POSSIBLE_RESUME: 98};
        _this.cliInstructionEnum  = { TRANSACTION_EXPORT: 10, RESUME_MONITOR: 30, PAUSE_MONITOR: 31, CLEAR_MONITOR_HISTORY: 38, DELETE_MONITOR: 39, PING_AGENT: 40, MONITOR_EXPORT: 50, MONITOR_IMPORT: 51};



        _this.data.metaFields.push({id:"com.ibm.wmqfte.TransferId", field:"_id"});
        _this.data.metaFields.push({id:"com.ibm.wmqfte.SourceAgent", field:"module_data.source_agent.name"});
        _this.data.metaFields.push({id:"com.ibm.wmqfte.DestinationAgent", field:"module_data.destination_agent.name"});
        _this.data.metaFields.push({id:"com.ibm.wmqfte.JobName", field:"job_name"});
        _this.data.metaFields.push({id:"source_resource", field:"module_data.indexed_fields.first_resource_source"});
        _this.data.metaFields.push({id:"destination_resource", field:"module_data.indexed_fields.first_resource_destination"});
        _this.data.metaFields.push({id:"job_id", field:"job_id"});

        // setup the webservice calls
        var configs = [
            {url: 'mftv2/transaction/search', resourceName:'mftv2TransactionSearch'},
            {url: 'mftv2/transaction/dashboard', resourceName: 'mftv2TransactionDashboard'},
            {url: 'mftv2/transaction/errors/search', resourceName: 'mftv2TransactionErrors'},
            {url: 'mftv2/transaction/errors/dashboard', resourceName: 'mftv2TransactionDashboardErrors'},
            {url :'mftv2/transaction/files/:id', resourceName: 'mftv2TransactionFiles', params: {id:'@id'}},
            {url: 'mftv2/agent/search', resourceName:'mftv2AgentSearch'},
            {url: 'mftv2/agent/dashboard', resourceName: 'mftv2AgentDashboard'},
            {url :'mftv2/agent/detail', resourceName: 'mftAgentDetail'},
            {url: 'mftv2/monitor/search', resourceName:'mftv2MonitorSearch'},
            {url: 'mftv2/monitor/dashboard', resourceName: 'mftv2MonitorDashboard'},
            {url :'mftv2/monitor/detail', resourceName: 'mftMonitorDetail'},
            {url :'mftv2/cli', resourceName: 'mftCLIRequest'}


        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });


        //<editor-fold desc="Meta Data & Initialization & General">

        _this.getStatusDesc = function(value) {
            // routine to get the monitor or agent status
            switch (value) {
                case 1:
                    return "Started";
                    break;
                case 2:
                    return "Command Operation Pending";
                    break;
                case 0:
                    return "Stopped";
                    break;
                case 30:
                    return "Paused";
                    break;
                case 90:
                    return "No Communication";
                    break;
                case 98:
                    return "Deleted - Resume Possible";
                    break;
                case 99:
                    return "Deleted";
                    break;
            }
        };

        _this.getBootStrapStatus = function(value)
        {
            // routine to get the bootstrap status for the given monitor or agent status
            switch (value)
            {
                case 1:     /* Started */
                    return 4;
                    break;
                case 2:     /* Operation Pending */
                    return 1;
                    break;
                case 0:     /* Stopped */
                    return 99;
                    break;
                case 99:     /* Deleted */
                    return 99;
                    break;
                case 30:    /* Paused */
                    return 3;
                    break;
                case 98:    /* Deleted with Possible Resume */
                    return 3;
                    break;
                case 90:    /* No Comms */
                    return 3;
                    break;
            }
        };

        _this.getStatus = function(row)
        {
            // routine to get the agent status
            switch (row.status)
            {
                case 1:
                    row.rowStyle = null;
                    break;
                case 2:
                    row.rowStyle = "recordDefault";
                    break;
                case 0:
                    row.rowStyle = "transactionError";
                    break;
                case 30:
                    row.rowStyle = "transactionIssue";
                    break;
                case 98:
                    row.rowStyle = "transactionIssue";
                    break;
                case 90:
                    row.rowStyle = "recordUpdate";
                    break;
                case 99:
                    row.rowStyle = "transactionCancel";
                    break;
            }
            row.status_desc = _this.getStatusDesc(row.status);
       };

        _this.getColorPalette = function()
        {
            // routine to return the color palette for this module
            let baseColors = chartSvc.getColors();
            let colors =  ['#ff8c00', '#715aff', '#5887FF', '#55C1FF', '#102E4F', '#4c4f53'];
            let color =  {error: baseColors.chartError, unk: baseColors.chartUnknown, transfers: colors[1], files: colors[2], bytes: colors[4], agents:colors[5], monitors:colors[5], time: colors[0]};
            return {
                colors: colors,
                color: color
            };
        };
        _this.initializeLists = function()
        {
            var deferred = $q.defer();
            apiProvider.getList('mftv2AgentSearch', {companyId: userSvc.getOrgInfo().companyId}).then(function (results)
            {
                _this.data.agentCache = {};
                _this.data.agentCache.qmanagers = lodash.chain(results).map("queue_manager").uniq("queue_manager").value();
                _this.data.agentCache.hosts = lodash.chain(results).map("host").uniq("host").value();
                _this.data.agentCache.coordinators = lodash.chain(results).map("coordinator").uniq("coordinator").value();
                _this.data.agentCache.agents = lodash.chain(results).map("agent_name").uniq("agent_name").value();
                _this.data.agentCache.osnames = lodash.chain(results).map("osname").uniq("osname").map(function (record) {
                    return {code: record, description: $filter('titleCaseFilter')(record)};
                }).value();
                _this.data.agentCache.agent_status = [{code: 1, description: _this.getStatusDesc(1)},
                    {code: 0, description: _this.getStatusDesc(0)},
                    {code: 90, description: _this.getStatusDesc(90)}];

                _this.data.agentCache.agent_types = [{code: 0, description: _this.getAgentType(0)},
                    {code: 1, description: _this.getAgentType(1)},
                    {code: 2, description: _this.getAgentType(2)},
                    {code: 3, description: _this.getAgentType(3)},
                    {code: 4, description: _this.getAgentType(4)},
                    {code: 401, description: _this.getAgentType(401)},
                    {code: 5, description: _this.getAgentType(5)}];

                _this.data.agentCache.monitor_types = [{code: 0, description: _this.getMonitorType(0)},
                    {code: 1, description: _this.getMonitorType(1)},
                    {code: 2, description: _this.getMonitorType(2)}];

                    _this.data.agentCache.monitor_status = [{code: 0, description: _this.getStatusDesc(0)},
                        {code: 1, description: _this.getStatusDesc(1)},
                        {code: 30, description: _this.getStatusDesc(30)},
                        {code: 99, description: _this.getStatusDesc(99)}

                    ];

                    _this.data.agentCache.agent_at_qm = lodash.map(results, function (row)
                    {
                        let code = row.agent_name + "@" + row.queue_manager;
                        let description = code;
                        if (row.description)
                            description += " (" + row.description + ")";

                        return {code: code, description: description};
                    });
                    deferred.resolve(_this.data.agentCache);

            }).catch(function (err)
            {
                $log.error("Unable to Get Agent Cache", err);
            });
            return deferred.promise;
        };
        _this.getMetaFields = function()
        {
            // routine to return the meta-fields that are searchable
            return lodash.map(_this.data.metaFields, 'id');
        };
        _this.mapMetaField = function(fieldName)
        {
            return transactionReportingSvc.mapMetaField(fieldName, _this.data.metaFields);
        };

        _this.getMetaInputs = function(arr, inputFilter)
        {
            // routine to map the meta-inputs into an array that can be used by the API
            return transactionReportingSvc.getMetaInputs(arr, inputFilter, _this.mapMetaField);
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Reporting">
        _this.buildTransactionExportOperation = function(filter)
        {
            // routine to build the CLI Instruction to perform a transaction listing export for business intelligence
            let args = {savePath:"xlsx", filter: filter};
            let returnData = {record: args, ui: {question: "Export Transaction Listing - Business Intelligence", class: 'txt-color-blue', icon: "fa fa-dashboard", description: "Export Transaction Listing - Business Intelligence"}, operation: _this.cliInstructionEnum.TRANSACTION_EXPORT};
            _this.invokeCLIOperation(returnData);
        };

        _this.showErrorSummary = function(data, drill)
        {
            // routine to show the Error Summary Dialog for the given filterObject and type
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'app/modules/mft_v2/partials/transaction-error-summary-dialog.tpl.html',
                controller: 'mftTransactionErrorSummaryDialogCtrl',
                controllerAs: 'vmDialog',
                size:'lg',
                resolve: {
                    dialogData: data
                }
            });
            modalInstance.result.then(function (modalResult)
            {
                if (modalResult.transactionId)
                {
                    let model = {transactionId: modalResult.transactionId};
                    drill(model);
                }
            }).catch(function (err)
            {
                if (err != "cancel")
                    $log.error("Unable to Display Error Summary", err);
            });
        };
        _this.parseTransactionGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                item = transactionReportingSvc.parseCommonTransaction(item);

                // add the mft specifics
                item.moduleStatusDesc = _this.getIBMStatus(item.module_status);
                if (!item.byte_count)
                    item.byte_count = 0;
                if (!item.item_count)
                    item.item_count = 0;
                if (!item.retries)
                    item.retries = 0;
                if (!item.warnings)
                    item.retries = 0;
                if (!item.progress_perc)
                    item.progress_perc = 100;

                // check for in progress transactions
                if (item.in_progress && item.in_progress.current_item)
                {
                    item.in_progress.current_item.source_type_desc = _this.getStorageType(item.in_progress.current_item.source_type);
                    item.in_progress.current_item.destination_type_desc = _this.getStorageType(item.in_progress.current_item.destination_type);
                    item.in_progress.current_item.elapsed_bytes = $filter("bytesFilter")(item.in_progress.current_elapsed_bytes);
                    item.in_progress.current_item.total_bytes = $filter("bytesFilter")(item.in_progress.current_total_bytes);
                    item.in_progress.current_item.rate = $filter("bytesFilter")((item.byte_count/item.running_time).toFixed(0)) + "/s";
                    item.in_progress.current_item.class = item.in_progress.current_item.result > 0 ? "txt-color-red": "txt-color-green";
                }

                item.transferTypeDesc = _this.getTransferType(item.transfer_type);
                item.templateTypeDesc = _this.getTemplateType(item.template_type);


            });
            return value;
        };


        _this.refreshErrors = function(dataObject)
        {
            // routine to request errors for the given filter object
            return apiProvider.getList(dataObject.apiName, dataObject.filter);
        };

        //</editor-fold>

        //<editor-fold desc="Transaction Functions">
        _this.showMftExitInstructionDialog = function(dataItem)
        {
            // routine to show an exit instruction display dialog for the given dataItem
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/mft_v2/partials/mft-exit-instruction-dialog.tpl.html";
            controlOptions.controller = "mftExitInstructionDialogCtrl";
            controlOptions.controllerAs = "vmDialog";
            controlOptions.size = 'md';
            controlOptions.windowClass = 'xl-modal';
            uiSvc.showDialog(dataItem, controlOptions);
        };

        _this.parseFileSpec = function(data)
        {
            // routine to parse all rows in the given file spec with descriptions
            lodash.forEach(data, function(row)
            {
                row.mode = $filter('titleCaseFilter')(row.mode);
                row.storage_type_desc =  _this.getStorageType(row.source_type) + " To " + _this.getStorageType(row.destination_type);
                if (row.result > 0)
                    row.rowStyle = "transactionError";
            });
        };

        _this.getExtendedFileSpec = function(transactionId, mainFileSpec)
        {
            // routine to return extended file spec information for the given transaction id
            let deferred = $q.defer();
            apiProvider.get("mftv2TransactionFiles", {id: transactionId}).then(function(result)
            {
                // merge the result with the 1st 15 items
                let finalResult = lodash.concat(mainFileSpec, result.items);
                _this.parseFileSpec(finalResult);
                deferred.resolve(finalResult);
            }).catch(function (result)
            {
                $log.error("Unable to retrieve Transaction Extended File Spec", result);
                deferred.reject(result);
            });
            return deferred.promise;
        };



        _this.navigateTransaction = function(id, scope)
        {
            // routine to navigate to the transaction with grid state management
            transactionReportingSvc.transactionDrill({transactionId: id, mqaModule: 0}, scope);
        };

        _this.navigateDashboardTransaction = function(id, baseState)
        {
            // routine to navigate to the transaction from the dashboard
            var currentState = baseState.parent;
            var baseRoute = currentState.name + ".reporting.transactionDetail.baseview.mft_v2";
            if (currentState.name.indexOf("baseview") > -1)
                baseRoute = currentState.name + ".baseview";
            $state.go(baseRoute, {transactionId: id});
        };

        _this.createBaseTransaction = function(data)
        {
            // routine to create the base transaction for an MFT transaction
            let returnObject = transactionReportingSvc.createCommonBaseTransaction(data.transaction);
            returnObject.stats.totalBytes =  data.transaction.module_data.byte_count;
            if (data.transaction.module_data.originator != null)
            {
                returnObject.originatorHost = data.transaction.module_data.originator.host_name;
                returnObject.originatorUser = data.transaction.module_data.originator.user_id;
            }
            data.baseTransaction = returnObject;

            // add the info information
            if (data.transaction != null && data.transaction.module_data != null)
            {
                switch (data.transaction.module_data.transfer_type)
                {
                    case 20:
                        _this.getITXSummaryInfo(data);
                        break;
                    default:
                        _this.getSummaryInfo(data);
                        break;
                }
            }
        };

        _this.getITXSummaryInfo = function(data)
        {
            // TODO: Remove this once all ITX Mongo MFT Transactions have expired as this is deprecated
            // routine to display the ITX Launcher Information
            data.info = {type:"itx_launcher"};
            data.info.status = _this.getIBMStatus(data.transaction.module_data.module_status);
            data.baseTransaction.mqaModuleDesc =  $filter("moduleType")(200);
            if (data.gwidInfo)
                data.gwidInfo.alertClass = "alert-" + $filter("bootStrapStatusFilter")(data.gwidInfo.bootLabel);

            let command = data.transaction.module_data.commands[0];
            if (command.command_details != null)
            {
                let details = lodash.chain(command.command_details.properties).keyBy("name").mapValues("value").value();
                data.info.mapName = details.MapName;
                data.info.systemName = details.SystemName;
                data.info.eventType = details.mqaITXEventType;
            }
            let meta_data = lodash.chain(data.transaction.meta_data).keyBy("key").mapValues("value").value();
            if (meta_data != null)
            {
                if (!meta_data.documentCount)
                    meta_data.documentCount = 0;
                data.info.senderId = meta_data.senderId;
                data.info.receiverId = meta_data.receiverId;
                data.info.docType = meta_data.mqaDocType;
                data.info.transactionCount = parseInt(meta_data.documentCount);
            }

            // setup the balancing information
            if (data.balancing)
            {
                let label = data.balancing.status.toUpperCase() == "SUCCESS" ? 2: 99;
                data.balancing.alertClass = "alert-" + $filter("bootStrapStatusFilter")(label);
            }
        };



        _this.getSummaryInfo = function(data)
        {
            // routine to get the summary info for a standard MFT transaction
            data.info = {type:"default"};
            data.info.source_agent = data.transaction.module_data.source_agent.name + "@" + data.transaction.module_data.source_agent.queue_manager + "(" + _this.getAgentType(data.transaction.module_data.source_agent.agent_type) + ")";
            data.info.destination_agent = data.transaction.module_data.destination_agent.name + "@" + data.transaction.module_data.destination_agent.queue_manager + "(" + _this.getAgentType(data.transaction.module_data.destination_agent.agent_type) + ")";
            data.info.status = _this.getIBMStatus(data.transaction.module_data.module_status);
            data.info.transfer_type = _this.getTransferType(data.transaction.module_data.transfer_type) + " (" + _this.getTemplateType(data.transaction.module_data.template_type) + ")";
            data.info.version = data.transaction.module_data.mft_version;
            if (data.transaction.result && data.transaction.result.fileSpace)
                data.info.fileSpace =  data.transaction.result.fileSpace;

            // TODO: Fix this - the db should have this
            if (data.transaction.progress != null)
                data.info.transfer_rate =  $filter("kbFilter")((data.transaction.progress.total_bytes/data.transaction.running_time).toFixed(2)) + " kB/s";
        };

        _this.transactionSearch = function(filterObject)
        {
            // routine to request a transaction search and return the data
            return apiProvider.getObject('mftv2TransactionSearch', filterObject);
        };
        _this.getIBMStatus = function(value)
        {
            // routine to get the IBM Status
            return cacheDataSvc.getListDescription("0", "IBM_MFT_RC", value);
        };
        _this.getTransferType = function(value)
        {
            // routine to return the transfer type
            switch (value)
            {
                case 0:
                    return "Managed Call";
                case 20:
                    return "ITX Launcher";
                default:
                    return "Managed Transfer";
            }
        };

        _this.getStorageType = function(value)
        {
            // routine to get the storage type for the given value
            switch (value)
            {
                case 0:
                    return "File";
                    break;
                case 1:
                    return "Queue";
                    break;
                case 2:
                    return "File-Space";
                    break;
                case 3:
                    return "Directory";
                    break;
                case 4:
                    return "Dataset";
                    break;
                case 5:
                    return "PDS";
                    break;
                case 6:
                    return "Web-Gateway";
                    break;
                default:
                    return "Queue";
                    break;
            }
        };

        _this.getExitHeader = function(value)
        {
            // routine to return the exit header information
            let returnObject = {title: "", icon: "fa fa-cubes"};
            switch (value)
            {
                case 1:
                    returnObject.title = "Pre-Start Source";
                    break;
                case 2:
                    returnObject.title = "Pre-Start Destination";
                    break;
                case 3:
                    returnObject.title = "Post-End Source";
                    break;
                case 4:
                    returnObject.title = "Post-End Destination";
                    break;
                case 5:
                    returnObject.title = "Managed Source";
                    break;
                case 6:
                    returnObject.title = "Managed Destination";
                    break;
                case 7:
                    returnObject.title = "Monitor";
                    break;
            }
            if (returnObject.title != "")
                returnObject.title += " ";
            returnObject.title += "Exits";
            return returnObject;
        };

        _this.getCallHeader = function(value)
        {
            // routine to return the call header
            let returnObject = {title: "", icon: "icon-shell"};
            switch (value)
            {
                case 1:
                    returnObject.title = "Pre-Start Source";
                    break;
                case 2:
                    returnObject.title = "Pre-Start Destination";
                    break;
                case 3:
                    returnObject.title = "Post-End Source";
                    break;
                case 4:
                    returnObject.title = "Post-End Destination";
                    break;
                case 5:
                    returnObject.title = "Agent";
                    break;
                case 6:
                    returnObject.title = "ITX Launcher";
                    break;
            }
            if (returnObject.title != "")
                returnObject.title += " ";
            returnObject.title += "Call";
            return returnObject;
        };

        _this.getTemplateType = function(value)
        {
            // routine to the template type
            if (value == -1)
                return "Managed Call";
            if (value == 999)
                return  "Mixed Mismatch";
            let destValue = value % 10;
            let sourceValue = value - destValue;
            sourceValue = sourceValue / 10;
            return _this.getStorageType(sourceValue) + " To " + _this.getStorageType(destValue);
        };

        _this.parseCallProperties = function(properties, type)
        {
            // routine to parse the call properties
            let category = type == 3 ? "Invocation" : "ANT";
            category += " Properties";
            return lodash.map(properties, function (row)
            {
                return {name: row.name, key: row.name, value: row.value, category: category}
            });

        }

        _this.parseTransactionCounts = function(result)
        {
            // routine to return the transaction count formatted data
            if (!result.job_count)
                result.job_count = {count: 0};
            if (!result.total)
            {
                result.total  = {transfer_count: 0, failure_count: 0, file_count: 0, byte_count: 0, time_count: 0, avg_time: 0};
            }
            let returnObj =
                {
                    transferCount: {value: $filter("number")(result.total.transfer_count)},
                    errorCount: {value : $filter("number")(result.total.failure_count)},
                    jobCount: {value: $filter("number")(result.job_count.count)},
                    fileCount: {value: $filter("number")(result.total.file_count)},
                    byteCount: {value: $filter("bytesFilter")(result.total.byte_count)},
                    timeCount: {value: $filter("secondsToStringFilter")(result.total.time_count)},
                    avgTimeCount: {value: Number.parseFloat(result.total.avg_time).toFixed(3)},
                    trfRate: {value: 0}
                };
            if (returnObj.timeCount.value > 0)
                returnObj.trfRate.value = (returnObj.byteCount.value/returnObj.timeCount.value);
            returnObj.trfRate.value = $filter("kbFilter")(Number.parseFloat(returnObj.trfRate.value).toFixed(2)) + " kB/s";
            returnObj.avgTimeCount.value = $filter("secondsToStringFilter")(returnObj.avgTimeCount.value);
            return returnObj;
        };


        _this.transactionDrill = function(id)
        {
            // routine to transaction drill to the given transaction saving the grid state
            var record = {transactionId: id, transactionType: 0};
            transactionReportingSvc.navigateTransaction("app.mft_v2.reporting.transactionDetail.baseview", record);
        };

        //</editor-fold>

        //<editor-fold desc="Agent Reporting">
        _this.calcAgentOperations = function(agent)
        {
            // routine to build the available options for the monitor based on its state aswell the agent status
            if (!userSvc.hasFeature(userSvc.commonFeatures.ADMIN_MFT_AGENT))
                return null;

            let record_data =  {agentId: agent._id};

            let question = agent.agent_name + "@" + agent.queue_manager;
            if (agent.coordinator != agent.queue_manager)
                question += "@" + agent.coordinator;

            let returnObj = [];
            if (agent.status != _this.statusEnum.DELETED)
            {
                returnObj.push({
                    description: "Test Connectivity...",
                    click_data: {record: record_data, ui: {question: "Test Connection to " + question, class: 'txt-color-blue', icon: "icon-antenna", description: "Test MFT Agent Connectivity"}, operation: _this.cliInstructionEnum.PING_AGENT},
                    icon: "icon-antenna",
                    tooltip: "click here to Test the Connectivity of the MFT Agent and see if its Reachable"
                });
            }
            return returnObj;
        };

        _this.buildAgentOperations = function(agent)
        {
            // routine to build the available monitor operations based on the given monitor record
            // this returns a promise as it may need to do a read to the agent status
            var deferred = $q.defer();
            let operations = _this.calcAgentOperations(agent);
            deferred.resolve(operations);
            return deferred.promise;
        };

        _this.readAgent = function(id)
        {
            // routine to return the agent document for the given id
            return apiProvider.get("mftAgentDetail",{id: id});
        };
        _this.agentSearch = function(filterObject)
        {
            // routine to request an agent listing with stats and return the data
            return apiProvider.getObject('mftv2AgentDashboard', filterObject);
        };

        _this.parseAgentCountRow = function(row, returnObj)
        {
            switch (row._id)
            {
                case 0:
                    returnObj.down += parseInt(row.count);
                    break;
                case 1:
                    returnObj.up += parseInt(row.count);
                    break;
                case 90:
                    returnObj.no_comms += parseInt(row.count);
                    break;
                case 99:
                    returnObj.deleted += parseInt(row.count);
                    break;
            }
        };

        _this.parseAgentCounts = function(serverData)
        {
            // routine to parse the agent counts received from the server
            let returnObj  = {up: 0, down: 0, no_comms: 0, deleted: 0};
            if (serverData != null)
            {
                lodash.forEach(serverData, function(row)
                {
                    _this.parseAgentCountRow(row, returnObj);
                });

            }
            return returnObj;
        };
        _this.parseAgentGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                let value = null;

                if (item.started_time) {
                    value = $filter("localUTCStringFilter")(item.started_time);
                    item.started_time = $filter("kendoDateFilter")(value);
                }
                if (item.last_publish_date)
                {
                    value = $filter("localUTCStringFilter")(item.last_publish_date);
                    item.last_publish_date = $filter("kendoDateFilter")(value);
                }
                if (item.properties && item.properties.commandTime)
                {
                    value = $filter("localUTCStringFilter")(item.properties.commandTime);
                    item.command_time = $filter("kendoDateFilter")(value);
                }
                item.sys_date = $filter("kendoDateFilter")(item.sys_date);
                item.osname = $filter("titleCaseFilter")(item.osname);

                // update the version info
                if (item.version)
                {
                    item.product_version = item.version.product;
                    item.product_build = item.version.build + " (" + item.version.interface + ")";
                }

                // get the status and update the row-style
                _this.getStatus(item);
                item.type_desc = _this.getAgentType(item.type);

                // get the connection information
                if (item.connection_details)
                {
                    item.connection_port = item.connection_details.port;
                    item.connection_host = item.connection_details.host;
                    item.connection_channel = item.connection_details.channel;
                }

                // get the limits
                if (item.limits)
                {
                    item.limit_queued = item.limits.maxQueuedTransfers;
                    item.limit_source = item.limits.maxSourceTransfers;
                    item.limit_destination = item.limits.maxDestinationTransfers;
                }
                if (item.properties && item.properties.agentStatusPublishRateMin)
                    item.publish_rate = $filter('secondsToStringFilter')(item.properties.agentStatusPublishRateMin);
            });
            return value;
        };

        _this.getAgentTransferState = function(value)
        {
            // routine to return the agent transfer status Explanation
            switch (value)
            {
                case "NEWSENDERTRANSFER":
                    return {desc: "A new transfer from the source agent that the negotiation has not started for", allowCancel: true, allowView: true, queued: true};
                    break;
                case "NEWRECEIVERTRANSFER":
                    return {desc: "A new transfer has been created at the destination agent as part of negotiation, but the transfer is not yet running", allowCancel: true, allowView: true, queued: false};
                    break;
                case "NEGOTIATINGTRANSFER":
                    return {desc: "A source agent is in negotiation with the destination agent before running a transfer", allowCancel: false, allowView: false, queued: false};
                    break;
                case "RUNNINGTRANSFER":
                    return {desc: "A transfer from either a source agent or destination agent that is in the normal running state", allowCancel: true, allowView: true, queued: false};
                    break;
                case "RECOVERINGTRANSFER":
                    return {desc: "When either a source or destination agent starts the recovery process, any transfers in running state are moved into transfer state. Transfers are moved out of this state into ReSynchronisingTransfer state when a resynchronization message is sent to the peer agent.\n" +
                            "For example, if the destination agent starts the recovery process for a running transfer, the transfer is moved into the ReSynchronisingTransfer state when a resynchronization message is sent to its source agent", allowCancel: true, allowView: false, queued: false};
                    break;
                case "RESYNCHRONISINGTRANSFER":
                    return {desc: "A transfer source or destination agent has found a problem and has sent a resynchronization message to its respective destination or source agent", allowCancel: true, allowView: false, queued: false};
                    break;
                case "COMPLETEDTRANSFER":
                    return {desc: "A destination agent has completed the transfer and has sent a completion message to the source agent. The destination agent is waiting for an acknowledgment message from the source agent", allowCancel: false, allowView: true, queued: false};
                    break;
                case "COMPLETERECEIVEDTRANSFER":
                    return {desc: "A source agent has received a completion message from the destination agent and has sent a message back to the destination agent to acknowledge the completion message", allowCancel: false, allowView: true, queued: false};
                    break;
                case "CANCELLEDNEWTRANSFER":
                    return {desc: "A source agent has received a cancel message for a new transfer.", allowCancel: false, allowView: false, queued: false};
                    break;
                case "CANCELLEDINPROGRESSTRANSFER":
                    return {desc: "A source agent has received a cancel message for an in-progress transfer", allowCancel: false, allowView: false, queued: false};
                    break;
                case "RESUMINGTRANSFER":
                    return {desc: "A source agent has received a resynchronize response message and now schedules the transfer to restart", allowCancel: false, allowView: false, queued: false};
                    break;
                case "RESTARTINGTRANSFER":
                    return {desc: "A source or destination agent has received a resynchronize request message and is waiting for the respective destination or source agent to restart", allowCancel: false, allowView: false, queued: false};
                    break;
                case "WAITINGFORDESTINATIONCAPACITY":
                    return {desc: "A source agent has received a DESTINATION_CAPACITY_EXCEEDED error from the destination agent. The transfer is now in a waiting state to be retried after a period", allowCancel: false, allowView: false, queued: true};
                    break;
                case "FAILEDTRANSFERENDING":
                    return {desc: "The transfer has failed but the completion log message has not been published and the transfer has not been removed from the state store", allowCancel: false, allowView: true, queued: false};
                    break;
            }
            return {desc: "Unknown State " + value, allowCancel: false, allowView: true, queued: false};
        };

        _this.parseAgentTransferData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                let stateInfo = _this.getAgentTransferState(item.transfer_state);
                item.allowCancel = stateInfo.allowCancel;
                if (!userSvc.hasFeature(userSvc.commonFeatures.TRANS_CANCEL))
                    item.allowCancel = false;
                item.allowView = stateInfo.allowView;
                item.tip = stateInfo.desc;
            });
            return value;
        };





        _this.getLists = function()
        {
            // routine to return the list used in agent reporting
            if (_this.data.agentCache == null)
            {
                return _this.initializeLists();
            }
            else
            {
                var deferred = $q.defer();
                deferred.resolve(_this.data.agentCache);
                return deferred.promise;
            }
        };



        _this.getAgentType = function(value)
        {
            // routine to get the agent types
            switch (value)
            {
                case 0:
                    return "Standard";
                    break;
                case 1:
                    return "Bridge";
                    break;
                case 2:
                    return "Embedded";
                    break;
                case 3:
                    return "Connect-Direct";
                    break;
                case 4:
                    return "Web-Gateway";
                    break;
                case 401:
                    return "Web User";
                    break;
                case 5:
                    return "Sterling File Gateway";
                    break;
            }
        };
        //</editor-fold>

        //<editor-fold desc="Monitor Reporting">
        _this.calcMonitorOperations = function(monitor, agentStatus)
        {
            // routine to build the available options for the monitor based on its state aswell the agent status
            if (!userSvc.hasFeature(userSvc.commonFeatures.ADMIN_MFT_AGENT) || agentStatus != _this.statusEnum.STARTED)
                return null;

            // no bridge monitors supported yet
            if (monitor.type == 2)
                return null;

            let record_data =  {monitorId: monitor._id};

            let question = monitor.monitor_name + " <br/> on <br>" + monitor.agent_name + "@" + monitor.queue_manager;
            if (monitor.coordinator != monitor.queue_manager)
                question += "@" + monitor.coordinator;

            let returnObj = [];
            if (monitor.status == _this.statusEnum.STARTED)
            {
                returnObj.push({
                    description: "Clear Monitor History and Re-Trigger",
                    click_data: {record: record_data, ui: {question: "Clear History of " + question, class: 'txt-color-blue', icon: "fa fa-clock-o", description: "Clear MFT Monitor History"}, operation: _this.cliInstructionEnum.CLEAR_MONITOR_HISTORY},
                    icon: "fa fa-clock-o",
                    tooltip: "click here to clear Monitor State and Re-Trigger"
                });
            }
            if (monitor.status == _this.statusEnum.STARTED || monitor.status ==_this.statusEnum.STOPPED)
            {
                returnObj.push({
                    description: "Pause Monitor",
                    click_data: {record: record_data, ui: {question: "Pause " + question, class: 'txt-color-orange', icon: "fa fa-pause", description: "Pause Monitor"},  operation: _this.cliInstructionEnum.PAUSE_MONITOR},
                    icon: "fa fa-pause",
                    tooltip: "click here to Pause Monitor for Period, and Resume at a Later Date"
                });
                returnObj.push({
                    description: "Delete Monitor",
                    click_data: {record: record_data, ui: {question: "Delete " + question, class: 'txt-color-red', icon: "fa fa-trash-o", description: "Delete Monitor"}, operation: _this.cliInstructionEnum.DELETE_MONITOR},
                    icon: "fa fa-trash-o",
                    tooltip: "click here to Remove this Monitor from the MFT Agent"
                });
            }

            if (monitor.status == _this.statusEnum.PAUSED || monitor.status == _this.statusEnum.DELETED)
            {
                if (monitor.status == _this.statusEnum.DELETED)
                    monitor.status = _this.statusEnum.DELETE_POSSIBLE_RESUME;
                returnObj.push({
                    description: "Resume Monitor",
                    click_data: {record: record_data, ui: {question: "Resume " + question, class: 'txt-color-magenta', icon: "fa fa-play", description: "Resume Monitor"}, operation: _this.cliInstructionEnum.RESUME_MONITOR},
                    icon: "fa fa-play",
                    tooltip: "click here to Resume the Monitor"
                });
            }
            return returnObj;
        };

        _this.buildMonitorExportOperation = function(filter)
        {
            // routine to build the CLI Instruction to perform a monitor export
            let args = {savePath:"xlsx", filter: filter};
            let returnData = {record: args, ui: {question: "Export Monitor Definitions", class: 'txt-color-blue', icon: "fa fa-excel-o", description: "Export Monitor Definitions"}, operation: _this.cliInstructionEnum.MONITOR_EXPORT};
            _this.invokeCLIOperation(returnData);
        };

        _this.buildMonitorOperations = function(monitor)
        {
            // routine to build the available monitor operations based on the given monitor record
            // this returns a promise as it may need to do a read to the agent status
            var deferred = $q.defer();
            if (monitor.status != _this.statusEnum.STARTED && monitor.status != _this.statusEnum.OPERATION_PENDING)
            {
                // determine if the agent is running
                _this.readAgent(monitor.mftagent_id).then(function(agentRecord)
                {
                    let operations =_this.calcMonitorOperations(monitor, agentRecord.agent.status);
                    deferred.resolve(operations);
                }).catch(function(error)
                {
                    deferred.reject(error);
                })
            }
            else
            {
                let operations = _this.calcMonitorOperations(monitor, _this.statusEnum.STARTED);
                deferred.resolve(operations);
            }
            return deferred.promise;
        };
        _this.readMonitor = function(id)
        {
            // routine to return the agent document for the given id
            return apiProvider.get("mftMonitorDetail",{id: id});
        };

        _this.monitorSearch = function(filterObject)
        {
            // routine to request a monitor listing with stats and return the data
            return apiProvider.getObject('mftv2MonitorDashboard', filterObject);
        };

        _this.parseMonitorCountRow = function(row, returnObj)
        {
            switch (row._id)
            {
                case 0:
                    returnObj.down += parseInt(row.count);
                    break;
                case 1:
                    returnObj.up += parseInt(row.count);
                    break;
                case 30:
                    returnObj.paused += parseInt(row.count);
                    break;
                case 90:
                    returnObj.no_comms += parseInt(row.count);
                    break;
                case 99:
                    returnObj.deleted += parseInt(row.count);
                    break;

            }
        };

        _this.parseMonitorCondition = function(row)
        {
            // routine to parse the monitor conditions and get the condition to parse
            // FIXME: Allow for multiple conditions
            if (!row.trigger || !row.trigger.match_type)
                return null;
            var valueCondition = row.trigger.match_type.conditions;
            var condition = null;
            if (valueCondition.condition)
                condition =  valueCondition.condition;
            else
            {
                if (valueCondition.all_of) {
                    condition = valueCondition.all_of.condition;
                } else
                    condition = valueCondition.any_of.condition;
            }
            if (condition == null)
                return null;
            if (Array.isArray(condition))
                return condition[0];
            else
                return condition;
        };

        _this.parseMonitorTrigger = function(row)
        {
            // routine to parse the trigger information and update the description
            // TODO: More work has to be done here - THIS has to become HTML Eventually
            var value = _this.parseMonitorCondition(row);
            row.batchSize = 0;
            if (value == null)
                return;
            if (value.file_same_size)
            {
                row.triggerDesc = "File Same Size";
                if (value.file_same_size.pattern)
                    row.triggerDesc += " (Pattern: " + value.file_same_size.pattern.value + ")";
                if (value.file_same_size.polls)
                    row.triggerDesc  += " ( " + value.file_same_size.polls + " Polling Cycle)";
                if (value.file_same_size.exclude && value.file_same_size.exclude.value != '')
                    row.triggerDesc += " (Exclude: " + value.file_same_size.exclude.value + ")";
            }
            if (value.file_size_same)
            {
                row.triggerDesc = "File Same Size";
                if (value.file_size_same.pattern)
                    row.triggerDesc += " (Pattern: " + value.file_size_same.pattern.value + ")";
                if (value.file_size_same.polls)
                    row.triggerDesc  += " ( " + value.file_size_same.polls + " Polling Cycle)";
                if (value.file_size_same.exclude && value.file_size_same.exclude.value != '')
                    row.triggerDesc += " (Exclude: " + value.file_size_same.exclude.value + ")";
            }
            if (value.queue_not_empty)
                row.triggerDesc = "Queue Not Empty";
            if (value.complete_groups)
            {
                row.triggerDesc = "Complete Groups";
            }
            if (value.file_match)
            {
                row.triggerDesc = "File Match";
                if (value.file_match.pattern)
                    row.triggerDesc += " (Pattern: " + value.file_match.pattern.value + ")";
                if (value.file_match.exclude && value.file_match.exclude.value != '')
                    row.triggerDesc += " (Exclude: " + value.file_match.exclude.value + ")";
            }
            if (value.file_no_match)
            {
                row.triggerDesc = "File No Match";
                if (value.file_no_match.pattern)
                    row.triggerDesc += " (Pattern: " + value.file_no_match.pattern.value + ")";
                if (value.file_no_match.exclude && value.file_no_match.exclude.value != '')
                    row.triggerDesc += " (Exclude: " + value.file_no_match.exclude.value + ")";
            }
            if (value.file_size)
            {
                row.triggerDesc = "File Size";
                if (value.file_size.compare)
                    row.triggerDesc = " " + value.file_size.compare.operator + " " + value.file_size.compare.units;
                if (value.file_size.pattern)
                    row.triggerDesc += " (Pattern: " + value.file_size.pattern.value + ")";
                if (value.file_size.exclude && value.file_size.exclude.value != '')
                    row.triggerDesc += " (Exclude: " + value.file_size.exclude.value + ")";
            }

            // get the batch size
            row.batchSize = 0;
            if (row.trigger.properties && row.trigger.properties.batchSize)
                row.batchSize = parseInt(row.trigger.properties.batchSize);
            delete row.trigger;

        };

        _this.parseMonitorCounts = function(serverData)
        {
            // routine to parse the agent counts received from the server
            let returnObj  = {up: 0, down: 0, no_comms: 0, deleted: 0, paused: 0};

            if (serverData != null)
            {
                lodash.forEach(serverData, function(row)
                {
                    _this.parseMonitorCountRow(row, returnObj);
                });

            }
            return returnObj;
        };

        _this.parseMonitorGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                let value = null;

                item.sys_date = $filter("kendoDateFilter")(item.sys_date);

                // get the agent details
                item.agentDesc = item.agent_name + "@" + item.queue_manager;


                // get the status and update the row-style
                _this.getStatus(item);
                 item.type_desc = _this.getMonitorType(item.type);

                // get the resource information
                if (item.resource)
                {
                    item.resourceDesc = item.resource.resource;
                    item.pollDesc = "Every " + item.resource.poll_interval + " " + $filter('titleCaseFilter')(item.resource.poll_unit);

                    // TODO: Put ID in ???
                    if (item.type == 0 && item.properties && item.properties.recursionLevel)
                        item.resourceDesc += " Recursion Level: ( " + item.properties.recursionLevel + ")";
                }

                // get the trigger information
               _this.parseMonitorTrigger(item);

                // parse the last information
                if (item.last_activity)
                {
                    if (item.last_activity.check_date)
                    {
                        value = $filter("localUTCStringFilter")(item.last_activity.check_date);
                        item.last_check_date = $filter("kendoDateFilter")(value);
                    }
                    if (item.last_activity.result_code != null)
                        item.last_result_code = parseInt(item.last_activity.result_code);
                    if (item.last_activity.task_message_id)
                        item.last_task_id = item.last_activity.task_message_id;
                }
            });
            return value;
        };

        _this.getMonitorType = function(value)
        {
            // routine to get the monitor
            switch (value)
            {
                case 0:
                    return "Directory";
                    break;
                case 1:
                    return "Queue";
                    break;
                case 2:
                    return "Bridge";
                    break;
            }
        };

        //</editor-fold>

        //<editor-fold desc="Dashboard Functions">
        _this.refreshDashboard = function(filterObject)
        {
            // routine to request iib reporting for the given filter object
            return apiProvider.getObject('mftv2TransactionDashboard', filterObject);
        };

        //</editor-fold>

        //<editor-fold desc="MFT Command Service">
        _this.invokeCLIOperation = function(operationData)
        {
            _this.data.lastCLIRequest = operationData;
            _this.acceptCLIOperation("Yes");
        };

        _this.acceptCLIOperation = function (ButtonPressed)
        {
            // routine to handle the delete request from the user
            if (ButtonPressed == "Yes")
            {
                // get the last CLI Information
                if (!_this.data.lastCLIRequest)
                    return;
                let operationData = _this.data.lastCLIRequest.record;
                let operationAction = _this.data.lastCLIRequest.operation;
                let operationUi = _this.data.lastCLIRequest.ui;
                let requestData = {icon: operationUi.icon, desc: operationUi.description, request:{operation: operationAction, arguments: operationData}};
                _this.initiateCLI(requestData);
            }
        };

        _this.confirmCLIOperation = function(operationData)
        {
            // routine to confirm deletion of of the row
            let html = "<i class='" + operationData.ui.icon + " " + operationData.ui.class + "'></i>&nbsp;<span style='color:white'>" + operationData.ui.description + "</span>";
            _this.data.lastCLIRequest = operationData;
            uiSvc.showSmartAdminBox(html, "Are you sure you wish to " + operationData.ui.question + "?",'[No][Yes]', _this.acceptCLIOperation);
        };
        _this.buildOperations = function(data, type)
        {
            switch (type)
            {
                case _this.operationsEnum.MONITOR:
                    return _this.buildMonitorOperations(data);
                    break;
                case _this.operationsEnum.AGENT:
                    return _this.buildAgentOperations(data);
                    break;

            }
        };

        _this.initiateCLI = function(data)
        {
            // routine to call the progress dialog when initiating a bulk download
            let modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'mftCLICtrl',
                controllerAs: 'vmDialog',
                resolve: {
                    dialogData: data
                }
            });
            modalInstance.result.then(function (modalResult)
            {
                if (modalResult.error)
                    uiSvc.showExtraSmallPopup(data.desc, "Instruction Failed  !<br/>" + modalResult.error, 5000, "#ce2029", "times");
                else
                {
                    // if this was a ping request show the results on success
                    if (data.request.operation == _this.cliInstructionEnum.PING_AGENT)
                        uiSvc.showExtraSmallPopup(data.desc, "Instruction Succeeded  !<br/>" + modalResult, 5000, null, "check");
                }
                if (_this.data.lastCLIRequest.completeFunction)
                    _this.data.lastCLIRequest.completeFunction(modalResult, false);
            }).catch(function (err)
            {
                $log.error("Unable to Perform CLI Invocation", err);
                if (_this.data.lastCLIRequest.completeFunction)
                    _this.data.lastCLIRequest.completeFunction(err, true);
            });
        };


        _this.sendCLIRequest = function(record)
        {
            // routine to send an MFT CLI Request
            record.userId = userSvc.getProfile().id;
            record.loginCode = userSvc.getProfile().login;
            return apiProvider.getObject('mftCLIRequest', record)
        };





        //</editor-fold>

    }]);
});
