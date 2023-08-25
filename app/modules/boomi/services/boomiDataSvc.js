/*
 /// <summary>
 /// app.modules.boomi.services - boomiDataSvc.js
 /// BOOMI Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module', 'lodash', 'moment'], function(module, lodash, moment)
{
    "use strict";
    moment().format();
    module.registerService('boomiDataSvc',['$filter','$q', '$log','$state', '$uibModal', 'apiSvc', 'apiProvider', 'adminDataSvc', 'cacheDataSvc', 'transactionReportingSvc', 'userSvc', 'chartSvc', 'uiSvc', function($filter, $q, $log, $state, $uibModal, apiSvc, apiProvider, adminDataSvc, cacheDataSvc, transactionReportingSvc, userSvc, chartSvc, uiSvc)
    {
        var _this = this;
        _this.data = {metaFields: [], dataCache:null, lastCLIRequest: null, meta_prefix: null};
        _this.operationsEnum = {TRANSACTION: 0, PROCESS: 1, ATOM: 2};
        _this.statusEnum = {STARTED: 1, OPERATION_PENDING: 2, STOPPED: 0, PAUSED: 30, DELETED: 99, DELETE_POSSIBLE_RESUME: 98};
        _this.cliInstructionEnum  = { RESUME_ATOM: 30, STOP_ATOM: 31};

        // add the meta-field mapping
        _this.data.metaFields.push({id:"job_id", field:"job_id"});


        // setup the webservice calls
        var configs = [
            {url: 'boomi/transaction/search', resourceName:'boomiTransactionSearch'},
            {url: 'boomi/transaction/dashboard', resourceName: 'boomiTransactionDashboard'},
            {url: 'boomi/transaction/document/search', resourceName: 'boomiDocumentSearch'},

            {url: 'boomi/atom/search', resourceName:'boomiAtomSearch'},
            {url: 'boomi/atom/dashboard', resourceName: 'boomiAtomDashboard'},
            {url :'boomi/atom/detail', resourceName: 'boomiAtomDetail'},
            {url: 'boomi/atom/monitor/update', resourceName:'boomiAtomMonitorUpdate'},
            {url: 'boomi/atom/threshold/update', resourceName:'boomiAtomThresholdUpdate'},


            {url :'boomi/cli', 'resourceName': 'boomiCLIRequest'}
        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });


        //<editor-fold desc="Initialization & General">
        _this.readModuleConfig = function(refresh)
        {
            // routine to read module config
            let deferred = $q.defer();

            if (_this.moduleConfig == null || refresh)
            {
                adminDataSvc.readModuleParameter("BOOMI").then(function (record)
                {
                    _this.moduleConfig = record;

                    if (_this.moduleConfig.jsonData.settings.transaction && _this.moduleConfig.jsonData.settings.transaction.meta_prefix)
                        _this.data.meta_prefix = _this.moduleConfig.jsonData.settings.transaction.meta_prefix + "_";
                    deferred.resolve(_this.moduleConfig);
                }).catch(function (err)
                {
                    $log.error("Unable to Get Application Cache", err);
                });
            }
            else
            {
                deferred.resolve(_this.moduleConfig);
            }
            return deferred.promise;
        };
        _this.getLists = function()
        {
            // routine to return the list used in agent reporting
            if (_this.data.dataCache == null)
            {
                return _this.initializeLists();
            }
            else
            {
                var deferred = $q.defer();
                deferred.resolve(_this.data.dataCache);
                return deferred.promise;
            }
        };

        _this.getAtomType = function(value)
        {
            // routine to get the atom types
            switch (value)
            {
                case 0:
                    return "Atom";
                    break;
                case 1:
                    return "Molecule";
                    break;
                case 2:
                    return "Cloud";
                    break;
            }
        };
        _this.getAtomStatusDesc = function(value) {
            // routine to get the monitor or agent status
            switch (value) {
                case 1:
                    return "Online";
                    break;
                case 2:
                    return "Command Operation Pending";
                    break;
                case 0:
                    return "Offline";
                    break;
                case 90:
                    return "Problem";
                    break;
                case 99:
                    return "Deleted";
                    break;
                case 98:
                    return "Unknown";
                    break;
            }
        };

        _this.getListenerStatusDesc = function(value) {
            // routine to get the monitor or agent status
            switch (value) {
                case 1:
                    return "Listening";
                    break;
                case 0:
                    return "Paused";
                    break;
                case 90:
                    return "Problem";
                    break;
                case 98:
                case 99:
                    return "Not Applicable";
                    break;
            }
        };
        _this.getBootStrapStatus = function(value)
        {
            // routine to get the bootstrap status for the given listener or schedule status
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

        _this.getClassificationDesc = function(value) {
            // routine to get the environment classification
            switch (value) {
                case 1:
                    return "Production";
                    break;
                case 0:
                    return "Test";
                    break;
                    break;
            }
        };

        _this.getScheduleStatusDesc = function(value) {
            // routine to get the monitor or agent status
            switch (value) {
                case 1:
                    return "Enabled";
                    break;
                case 0:
                    return "Disabled";
                    break;
                case 98:
                    return "Unknown";
                    break;
            }
        };

        _this.getServiceStatusDesc = function(value) {
            // routine to get the monitor or agent status
            switch (value) {
                case 1:
                    return "Running";
                    break;
                case 0:
                    return "Stopped";
                    break;
                case 98:
                    return "Unknown";
                    break;
            }
        };



        _this.getColorPalette = function()
        {
            // routine to return the color palette for this module
            let baseColors = chartSvc.getColors();
            let colors =  ['#ff7f27', '#033d58', '#7bd5ff', '#21839c', '#0085c3', '#ffd02f', '#919191', '#ff7c66'];
            let color =  {error: baseColors.chartError, unk: baseColors.chartUnknown, transfers: colors[4], files: colors[5], bytes: colors[1], documents:colors[0], atoms:colors[6], listeners: colors[2], time: colors[7]};
            return {
                colorArray: colors,
                colorNames: color
            };
        };

        _this.readEnvironments = function()
        {
            // routine to return the environments for this boomi config
            let deferred = $q.defer();

            let environments = ["PROD", "TEST"];
            _this.readModuleConfig(false).then(function(record)
            {
                if (_this.moduleConfig.jsonData.settings && _this.moduleConfig.jsonData.settings.monitor && _this.moduleConfig.jsonData.settings.monitor.environments)
                {
                    environments = _this.moduleConfig.jsonData.settings.monitor.environments;
                }
                deferred.resolve(environments);
            }).catch(function(err)
            {
                deferred.reject(err);
            });
            return deferred.promise;


        };
        _this.initializeLists = function()
        {
            var deferred = $q.defer();
            apiProvider.getList('boomiAtomSearch', {companyId: userSvc.getOrgInfo().companyId}).then(function (results)
            {
                _this.data.dataCache = {};
                _this.data.dataCache.environments = lodash.chain(results).map("environment_name").uniq("environment_name").value();
                _this.data.dataCache.hosts = lodash.chain(results).map("api_info.host_name").uniq("api_info.host_name").value();
                _this.data.dataCache.atoms = lodash.chain(results).map("name").uniq("name").value();
                _this.data.dataCache.osnames = lodash.chain(results).map("properties.os_name").uniq("properties.os_name").map(function (record)
                {
                    return {code: record, description: $filter('titleCaseFilter')(record)};
                }).filter(function(record)
                {
                    return record.description != '';
                }).value();
                _this.data.dataCache.atom_status = [{code: 1, description: _this.getAtomStatusDesc(1)},
                    {code: 0, description: _this.getAtomStatusDesc(0)},
                    {code: 2, description: _this.getAtomStatusDesc(2)},
                    {code: 90, description: _this.getAtomStatusDesc(90)},
                    {code: 98, description: _this.getAtomStatusDesc(98)},
                    {code: 99, description: _this.getAtomStatusDesc(99)}];

                _this.data.dataCache.atom_types = [{code: 0, description: _this.getAtomType(0)},
                    {code: 1, description: _this.getAtomType(1)},
                    {code: 2, description: _this.getAtomType(2)}];

                 _this.data.dataCache.listener_status = [{code: 0, description: _this.getListenerStatusDesc(0)},
                        {code: 1, description: _this.getListenerStatusDesc(1)},
                        {code: 90, description: _this.getListenerStatusDesc(90)},
                        {code: 98, description: _this.getListenerStatusDesc(98)},
                        {code: 99, description: _this.getListenerStatusDesc(99)}
                    ];


                _this.data.dataCache.atom_list = lodash.map(results, function (row)
                {
                    return {code: row.api_id, description: row.name};
                });

                _this.data.dataCache.atom_at_environment = lodash.map(results, function (row)
                    {
                        let code = row.name + "@" + row.environment_name;
                        return {code: code, description: row.name};
                    });
                    deferred.resolve(_this.data.dataCache);

            }).catch(function (err)
            {
                $log.error("Unable to Get Boomi Cache", err);
            });
            return deferred.promise;
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Functions">
        _this.filterTransactionColumns = function(columns)
        {
            // routine to read module config
            let deferred = $q.defer();
            _this.readModuleConfig(false).then(function(record)
            {
                // now see if we have any columns to exclude and exclude them and then return the final columns
                if (record.jsonData.settings.transaction && record.jsonData.settings.transaction.grid && record.jsonData.settings.transaction.grid.exclusions)
                {
                    columns = lodash.filter(columns, function(column)
                    {
                        return !lodash.includes(record.jsonData.settings.transaction.grid.exclusions, column.field);
                    });
                }
                deferred.resolve(columns);
            })
            .catch(function(err)
            {
                deferred.reject(err);
            });
            return deferred.promise;
        };

        _this.parseMetaData = function(meta_records)
        {
            // custom function to loop through the given meta-data and categorize correctly based on the module prefix
            if (!_this.data.meta_prefix)
                return meta_records;

            let meta_prefix = _this.data.meta_prefix;
            lodash.forEach(meta_records, function(record)
            {
                if (record.key.startsWith(meta_prefix))
                {
                    record.key = record.key.replace(meta_prefix, "");
                    record.category = "Filterable";
                }
            });
            return meta_records;
        };
        _this.viewDocument = function(record)
        {
            // routine to view the document linked to the given record
            transactionReportingSvc.viewInLineAttachment(record.attachment_id, record.attachment_format, 3, record.icon);
        };

        _this.showDocumentMeta = function(meta_data)
        {
            // routine to show the document meta-data for the given meta-data
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/common/partials/common-meta-view-dialog.tpl.html";
            controlOptions.controller = "commonMetaDialogCtrl";
            controlOptions.size = 'md';
            // do the mapping
            let record = meta_data;
            let dialogMeta = _this.parseMetaData(record);
            uiSvc.showDialog(dialogMeta, controlOptions);
        };

        _this.mapMetaField = function(fieldName)
        {
            // routine to map meta-data field names
            let foundField = lodash.find(_this.data.metaFields, {id: fieldName});
            if (!foundField)
            {
                if (_this.data.meta_prefix != null)
                    fieldName = _this.data.meta_prefix + fieldName;
                return "meta_data." + fieldName;
            }
            else
                return foundField.field;
        };
        _this.getMetaFields = function()
        {
            // routine to return the meta-fields that are searchable
            return lodash.map(_this.data.metaFields, 'id');
        };

        _this.getTransactionModuleStatus = function(status)
        {
            // routine to return the module statu8s for the the transaction status
            switch (status)
            {
                case 99:
                    return "Errors Found";
                case 0:
                    return "Successful";
                default:
                    return "Unknown";
            }
        };

        _this.getMetaInputs = function(inputFilter)
        {
            // routine to map the meta-inputs into an array that can be used by the API
            let arr = [];
            return transactionReportingSvc.getMetaInputs(arr, inputFilter, _this.mapMetaField);
        };

        _this.createBaseTransaction = function(data)
        {
            // routine to create the base transaction for an BOOMI transaction
            var returnObject = transactionReportingSvc.createCommonBaseTransaction(data);
            data.baseTransaction = returnObject;

            // add the info information
            if (data != null && data.module_data != null)
            {
                _this.getSummaryInfo(data);
            }
        };

        _this.getSummaryInfo = function(data)
        {
            // routine to get the summary info for a standard Boomi transaction
            data.info = {};
            data.info.status = _this.getTransactionModuleStatus(data.module_data.module_status);
        };

        _this.transactionSearch = function(filterObject)
        {
            // routine to request a transaction search and return the data
            return apiProvider.getObject('boomiTransactionSearch', filterObject);
        };

        _this.documentSearch = function(filterObject)
        {
            // routine to request a document search and return the data
            return apiProvider.getObject('boomiDocumentSearch', filterObject);
        };



        _this.parseTransactionCounts = function(result)
        {
            // routine to return the transaction count formatted data
            if (!result)
                result = {requests: 0, total_bytes: 0, failure_count: 0, incoming_docs: 0, time_count: 0};
            let returnObj = {transfer_count:{}, failure_count: {}, doc_count:{}, byte_count:{}, time_count: {}, avg_time_count:{}};
            returnObj.transfer_count.value = $filter("number")(result.requests);
            returnObj.failure_count.value = $filter("number")(result.failure_count);
            returnObj.doc_count.value = $filter("number")(result.incoming_docs);
            returnObj.byte_count.value = $filter("bytesFilter")(result.incoming_bytes);
            returnObj.time_count.value = $filter("secondsToStringFilter")(result.time_count);
            returnObj.avg_time_count = {value: Number.parseFloat(result.avg_runtime).toFixed(3)};
            returnObj.avg_time_count.value = $filter("secondsToStringFilter")(returnObj.avg_time_count.value);
            return returnObj;
        };



        _this.parseTransactionGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                item = transactionReportingSvc.parseCommonTransaction(item);

                // add the boomi specifics
                item.moduleStatusDesc = _this.getTransactionModuleStatus(item.module_status);
                if (!item.error_count)
                    item.error_count = 0;
                if (!item.byte_count)
                    item.byte_count = 0;
                if (!item.initial_doc_count)
                    item.initial_doc_count = 0;
                if (!item.initial_byte_count)
                    item.initial_byte_count = 0;
                if (!item.total_incoming_docs)
                    item.total_incoming_docs = 0;
                if (!item.total_outgoing_docs)
                    item.total_outgoing_docs = 0;
                if (!item.total_error_docs)
                    item.total_error_docs = 0;
                if (!item.step_count)
                    item.step_count = 0;
                if (!item.progress_perc)
                    item.progress_perc = 100;
            });
            return value;
        };

        _this.transactionDrill = function(id)
        {
            // routine to transaction drill to the given transaction saving the grid state
            let record = {transactionId: id, transactionType: 3};
            transactionReportingSvc.navigateTransaction("app.boomi.reporting.transactionDetail.baseview", record);
        };

        _this.navigateTransaction = function(id, scope)
        {
            // routine to navigate to the transaction with grid state management (
            transactionReportingSvc.transactionDrill({transactionId: id, mqaModule: 3}, scope);
        };
        //</editor-fold>

        //<editor-fold desc="Atom Reporting">
        _this.updateAtomMonitoring = function(id, data)
        {
            // routine to update the atom monitoring settings of a given atom
            return apiProvider.getObjectMixed('boomiAtomMonitorUpdate',{id: id}, data);
        };

        _this.updateAtomThreshold = function(id, data)
        {
            // routine to update the atom monitoring settings of a given atom
            return apiProvider.getObjectMixed('boomiAtomThresholdUpdate',{id: id}, data);
        };


        _this.navigateAtom = function(id, grid, scope, filter)
        {
            // routine to navigate to the transaction from the dashboard
            if (grid)
            {
                scope.grid = grid;
                scope.filter = filter;
                transactionReportingSvc.saveGridDrillState(scope, id);
            }
            // routine to invoke the atom drill
            $state.go("app.boomi.atom", {id: id});
        };

        _this.calcAtomOperations = function(atom)
        {
            // routine to build the available options for the monitor based on its state aswell the atom status
            if (!userSvc.hasFeature(userSvc.commonFeatures.ADMIN_BOOMI_ATOM))
                return null;

            let record_data =  {id: atom._id, api_id: atom.api_id};

            let question = atom.name + "@" + atom.environment_name;

            let returnObj = [];
            if (agent.status != _this.statusEnum.DELETED)
            {
                returnObj.push({
                    description: "Test Connectivity...",
                    click_data: {record: record_data, ui: {question: "Test Connection to " + question, class: 'txt-color-blue', icon: "icon-antenna", description: "Test Atom Connectivity"}, operation: _this.cliInstructionEnum.PING_AGENT},
                    icon: "icon-antenna",
                    tooltip: "click here to Test the Connectivity of the Boomi Atom and see if its Reachable"
                });
            }
            return returnObj;
        };

        _this.buildAtomOperations = function(agent)
        {
            // routine to build the available monitor operations based on the given monitor record
            // this returns a promise as it may need to do a read to the agent status
            var deferred = $q.defer();
            let operations = _this.calcAtomOperations(agent);
            deferred.resolve(operations);
            return deferred.promise;
        };

        _this.readAtom = function(id)
        {
            // routine to return the agent document for the given id
            return apiProvider.get("boomiAtomDetail",{id: id});
        };
        _this.atomSearch = function(filterObject)
        {
            // routine to request an agent listing with stats and return the data
            return apiProvider.getObject('boomiAtomDashboard', filterObject);
        };

        _this.parseAtomCountRow = function(row, returnObj)
        {
            // routine to evaluate atom status count information and put it into the right buck
            switch (row._id)
            {
                case 0:
                    returnObj.down += parseInt(row.count);
                    break;
                case 1:
                    returnObj.up += parseInt(row.count);
                    break;
                case 90:
                case 98:
                    returnObj.problem += parseInt(row.count);
                    break;
                case 99:
                    returnObj.deleted += parseInt(row.count);
                    break;
            }
        };


        _this.getAtomStatus = function(row)
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
            row.status_desc = _this.getAtomStatusDesc(row.status);
        };


        _this.getProcessStatus = function(row)
        {
            // routine to color the process based on its status
            switch (row.status_cd)
            {
                case 1:
                    row.rowStyle = null;
                    break;
                case 0:
                    row.rowStyle = "recordUpdate";
                    break;
                case 90:
                    row.rowStyle = "transactionError";
                    break;
                case 98:
                case 99:
                    row.rowStyle = null; // no listener, unsupported
                    break;
            }
        };

        _this.parseAtomCounts = function(serverData)
        {
            // routine to parse the agent counts received from the server
            let returnObj  = {up: 0, down: 0, problem: 0, deleted: 0};
            if (serverData != null)
            {
                lodash.forEach(serverData, function(row)
                {
                    _this.parseAtomCountRow(row, returnObj);
                });

            }
            return returnObj;
        };


        _this.parseAtomGridData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                let parseValue = null;
                item.sys_date = $filter("kendoDateFilter")(item.sys_date);
                item.type_desc = _this.getAtomType(item.type);
                item.classification = _this.getClassificationDesc(item.classification);


                // parse the api info
                if (item.api_info)
                {
                    item.os_name = $filter("titleCaseFilter")(item.os_name);
                    item.host = item.api_info.host_name;
                    item.api_info.purge_history_days = parseInt(item.api_info.purge_history_days);
                    parseValue = $filter('secondsToStringFilter')(parseInt(item.api_info.force_restart_time/1000));
                    item.api_info.force_restart_time = parseValue;
                    parseValue = $filter("localUTCEpochDateFilter")(moment(item.api_info.date_installed), "YYYY-MM-DD HH:mm:ss.SSS");
                    item.date_installed = $filter("kendoDateFilter")(parseValue);
                    if (!item.api_info.current_version)
                        item.api_info.current_version = "";
                }

                // monitoring information
                let monitor_refresh = 20;
                let monitor_stop = 30;
                if (item.monitor)
                {
                    if (item.monitor.url)
                        item.monitoring_url = item.monitor.url;
                    if (item.monitor.timing)
                    {
                        monitor_refresh = item.monitor.timing.atom_refresh;
                        monitor_stop = item.monitor.timing.atom_stopped;
                   }
                }
                item.monitoring_refresh = $filter('secondsToStringFilter')(monitor_refresh * 60);
                item.monitoring_stopped = $filter('secondsToStringFilter')(monitor_stop);


                item.os_name = "";
                if (item.properties)
                    item.os_name = item.properties.os_name;
                if (item.jvm)
                {
                    item.jvm.system_cpu_count = parseInt(item.jvm.system_cpu_count);
                    item.jvm.system_total_memory = $filter('bytesFilter')(parseInt(item.jvm.system_total_memory));
                }
                if (item.status_detail)
                {
                    item.problems = item.status_detail.problems;
                    parseValue = $filter("localUTCStringFilter")(item.status_detail.last_restart_time);
                    item.last_restart = $filter("kendoDateFilter")(parseValue);
                }

                // get the status and update the row-style
                _this.getAtomStatus(item);
            });
            return value;
        };

        _this.parseAtomProcessData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                // parse the api information
                item.description = "";
                if (item.api_info)
                {
                    item.description = item.api_info.name ? item.api_info.description : "";
                }

                // parse the api component meta
                if (item.api_component_meta)
                {
                    let parseValue = $filter("localUTCEpochDateFilter")(moment(item.api_component_meta.created_date), "YYYY-MM-DD HH:mm:ss.SSS");
                    item.created_date = $filter("kendoDateFilter")(parseValue);
                    item.created_by = item.api_component_meta.created_by;
                    if (item.api_component_meta.modified_date) {
                        parseValue = $filter("localUTCEpochDateFilter")(moment(item.api_component_meta.modified_date), "YYYY-MM-DD HH:mm:ss.SSS");
                        item.modified_date = $filter("kendoDateFilter")(parseValue);
                    } else
                        item.modified_date = item.created_date;
                    item.modified_by = (item.api_component_meta.modified_by != null) ? item.api_component_meta.modified_by : item.created_by;
                }

                // determine the status
                item.listener_status = parseInt(item.listener_status);
                item.schedule_status = parseInt(item.schedule_status);
            });
            return value;
        };

        _this.parseAtomServiceRow = function(row)
        {
            // routine to style the row
            switch (row.status)
            {
                case 1:
                    row.rowStyle = null;
                    break;
                case 0:
                    row.rowStyle = "transactionError";
                    break;
                case 98:
                    row.rowStyle = "transactionIssue";
                    break;
            }
            row.status_desc = _this.getServiceStatusDesc(row.status);
        };

        _this.parseAtomCounterRow = function(row)
        {
            // routine to style the row
            row.rowStyle = null;
            if (row.value >= 2147483647)
                row.rowStyle = "transactionError";
            if (row.value > 2147483600 && row.value < 2147483647)
                row.status = "transactionIssue";
        };

        _this.parseAtomConnectorRow = function(row)
        {
            // routine to style the row
            // TODO: Figure out which is the CUSTOM component and color it
            row.rowStyle = null;
        };

        _this.parseAtomCertRow = function(row)
        {
            // routine to style the row
            switch (row.status)
            {
                case 10:
                    row.rowStyle = null;
                    break;
                case 90:
                    row.rowStyle = "transactionError";
                    break;
                case 9:
                    row.rowStyle = "transactionIssue";
                    break;
            }


            if (row.next_check)
            {
                let value = $filter("localUTCStringFilter")(row.next_check);
                row.next_check = $filter("kendoDateFilter")(value);
            }
            else
                row.next_check = "Next Invocation";
            if (row.last_check)
            {
                let value = $filter("localUTCStringFilter")(row.last_check);
                row.last_check = $filter("kendoDateFilter")(value);
            }
        };

        _this.parseAtomQueueRow = function(row)
        {
            // routine to style the row
            if (!row.messages_count)
                row.messages_count = 0;
            if (!row.dead_letters_count)
                row.dead_letters_count = 0;
            row.subscriber_count = 0;
            if (row.topic_subscribers)
                row.subscriber_count = row.topic_subscribers.length;

            row.rowStyle = null;
        };

        _this.parseAtomClusterRow = function(row)
        {
            // routine to style the row
            if (row.status == "STOPPED")
                row.rowStyle = "transactionError";
            else
                row.rowStyle = null;

            if (row.next_check)
            {
                let value = $filter("localUTCStringFilter")(row.next_check);
                row.next_check = $filter("kendoDateFilter")(value);
            }
            else
                row.next_check = "Next Invocation";
            if (row.last_check)
            {
                let value = $filter("localUTCStringFilter")(row.last_check);
                row.last_check = $filter("kendoDateFilter")(value);
            }

        };


        _this.parseAtomServiceData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomServiceRow(item);
            });
            return value;
        };

        _this.parseAtomCounterData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomCounterRow(item);
            });
            return value;
        };

        _this.parseAtomConnectorData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomConnectorRow(item);
            });
            return value;
        };

        _this.parseAtomQueueData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomQueueRow(item);
            });
            return value;
        };

        _this.parseAtomClusterData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomClusterRow(item);
            });
            return value;
        };


        _this.parseAtomCertData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                _this.parseAtomCertRow(item);
            });
            return value;
        };









        //</editor-fold>

        //<editor-fold desc="Dashboard Functions">
        _this.refreshDashboard = function(filterObject)
        {
            // routine to request boomi dashboard for the given filter object
            return apiProvider.getObject('boomiTransactionDashboard', filterObject);
        };

        //</editor-fold>

        //<editor-fold desc="Command Service">
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
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'mftCLICtrl',
                controllerAs: 'vmDialog',
                resolve: {
                    data: data
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

        _this.handleCLIProgressResponse = function(dialog, response)
        {
            // routine to handle cli trigger response
            if (response.record != null)
            {
                dialog.progressInfo.dbId = response.record.id;
                dialog.updateProgress(response.record);
            };
        };
        _this.sendCLIRequest = function(record)
        {
            // routine to send an MFT CLI Request
            record.userId = userSvc.getProfile().id;
            record.loginCode = userSvc.getProfile().login;
            return apiProvider.getObject('boomiCLIRequest', record)
        };





        //</editor-fold>


        // read the config
        _this.readModuleConfig(true);
    }]);
});
