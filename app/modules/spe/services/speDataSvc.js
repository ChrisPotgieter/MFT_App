/*
 /// <summary>
 /// app.modules.spe.services - speDataSvc.js
 /// SPE Module Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/05/2016
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'file-saver','appCustomConfig'], function(module, lodash, filesaver, appCustomConfig)
{
    "use strict";
    module.registerService('speDataSvc',['$filter','$log', '$timeout', '$state','$q', '$uibModal', 'uiSvc','apiSvc', 'apiProvider', 'chartSvc', 'transactionReportingSvc','cacheDataSvc','userSvc', 'adminDataSvc', function($filter, $log, $timeout, $state, $q, $uibModal, uiSvc, apiSvc, apiProvider, chartSvc, transactionReportingSvc, cacheDataSvc, userSvc, adminDataSvc) {
        var _this = this;
        _this.data = {metaFields: [], dataCache:{}, lastCLIRequest: null, lastGWIDFilter: {}};

        _this.cliInstructionEnum  = { SENDER_PROFILE_IMPORT: 1, SENDER_PROFILE_EXPORT: 2, DE_ENVELOPE: 10,  SENDER_PROFILE_ENVELOPE_SYNC: 11, ELIGIBILITY_DEMO: 81};


        // add the meta-field mapping
        _this.data.metaFields.push({id:"job_id", field:"job_id"});


        // setup the webservice calls
        var configs = [
            {url: 'client/cno/spe/profile/sender/import', resourceName:'speCNOSenderImport'},
            {url: 'client/cno/spe/profile/sender/export', resourceName:'speCNOSenderExport'},
            {url :'spe/transaction/dashboard', 'resourceName': 'speDashboardSearch'},
            {url :'spe/transaction/search', 'resourceName': 'speTransactionSearch'},
            {url :'spe/gwid/searchTransactionIds', 'resourceName': 'speGwidSearchTransactionIds'},
            {url :'spe/gwid/searchTransaction', 'resourceName': 'speGwidSearchTransaction'},
            {url :'spe/gwid/search', 'resourceName': 'speGwidSearch'},
            {url :'spe/gwid/read/:id/:mode', 'resourceName': 'speGwidRead', params: {id: '@id', mode:'@mode'}},
            {url: 'spe/gwid/doc', resourceName:'speGwidDownload'},
            {url: 'spe/gwid/update', resourceName:'speGwidUpdate'},
            {url: 'spe/gwid/validate', resourceName:'speGwidValidate'},
            {url :'spe/gwid/:userId/download', resourceName: 'speGwidBulkDownload', params:{id:'@userId'}},
            {url: '/spe/transaction/operation', resourceName:'speResubmit'},
            {url: '/spe/profile/sender/import', resourceName:'speSenderImport'},
            {url: '/spe/profile/sender/export', resourceName:'speSenderExport'},
            {url: '/spe/profile/sender/sync', resourceName:'speSenderSync'},
            {url :'/spe/cli', resourceName: 'speCLIRequest'}
        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });
        adminDataSvc.setupCLI(_this, 'speCLIRequest', 'itxCLICtrl');



        //<editor-fold desc="Initialization & General">
        _this.getColorPalette = function()
        {
            // routine to return the color palette for this module
            // initialize the theme

            let baseColors = chartSvc.getColors();
            let colorArray =  ['#27187E', '#758BFD', '#AEB8FE', '#FF8600', '#F1F2F6', '#A9A9AC'];
            let colorNames =  {error: baseColors.chartError, unk: baseColors.chartUnknown, envelope: colorArray[1], de_envelope: colorArray[2], transform: colorArray[0], ack: colorArray[3], ts_segment:colorArray[4], gs_segment:colorArray[5]};
            return {
                colorArray: colorArray,
                colorNames: colorNames
            };
        };

        _this.getDirection = function (direction)
        {
            switch (direction)
            {
                case 0:
                    return "INBOUND";
                    break;
                case 2:
                    return "TRANSFORM";
                    break;
                default:
                    return "OUTBOUND";
                    break;
            }
        };

        _this.getEventIcon = function (id) {
            // routine to return the SPE Event Icon based on its type
            switch (id) {
                case 0:
                    return "fa fa-file-o";      // X12 Transaction
                    break;
                case 1:
                    return "fa fa-folder-open"; // DE-ENVELOPE
                    break;
                case 2:
                    return "fa fa-exchange";    // INTERCHANGE
                    break;
                case 3:
                    return "fa fa-cube";        // GROUP
                    break;
                case 4:
                    return "fa fa-reply";       // 999
                    break;
                case 5:
                    return "fa fa-asterisk";    // ENCODE
                    break;
                case 6:
                    return "fa fa-filter";      // TRANSLATE
                    break;
                case 7:
                    return "fa fa-reply";      // TA1
                    break;
                case 8:
                    return "fa fa-envelope-o";  // ENVELOPE
                    break;
                case 9:
                    return "fa fa-code";        // RESOURCE
                    break;
                case 10:
                    return "fa fa-envelope-o";  // ENVELOPE
                    break;
                case 11:
                    return "fa fa-reply";       // 997
                    break;
                case 12:
                    return "fa fa-asterisk";    // ENCODE IMMEDIATE
                    break;
                case 13:
                    return "fa fa-cubes";       // TRANSFORM
                    break;
                default:
                    return "fa fa-exchange";
                    break;
            }
        };

        _this.getEventDescription = function (id) {
            // routine to return the SPE Event Description based on its type
            switch (id) {
                case 0:
                    return "X12 Transaction";
                    break;
                case 1:
                    return "De-Envelope";
                    break;
                case 2:
                    return "X12 Interchange";
                    break;
                case 3:
                    return "X12 Grouping";
                    break;
                case 4:
                    return "X12 999";
                    break;
                case 5:
                    return "EDI Encoding";
                    break;
                case 6:
                    return "Translation";
                    break;
                case 7:
                    return "TA 1";
                    break;
                case 8:
                    return "X12 Envelope";
                    break;
                case 9:
                    return "Resource";
                    break;
                case 10:
                    return "Envelope";
                    break;
                case 11:
                    return "X12 997";
                    break;
                case 12:
                    return "Encode Immediate";
                    break;
                case 13:
                    return "Transform";
                    break;
                default:
                    return "Unknown";
                    break;
            }
        };

        _this.getOperationInfo = function (operation) {
            // routine to get the operation informattion
            let operationInfo = {};
            switch (operation) {
                case 1:
                    operationInfo.desc = "De-Enveloping";
                    operationInfo.icon = "fa fa-folder-open";
                    break;
                case 2:
                    operationInfo.desc = "Enveloping";
                    operationInfo.icon = "fa fa-envelope";
                    break;
                case 3:
                    operationInfo.desc = "Translation";
                    operationInfo.icon = "fa fa-exchange";
                    break;
                case 4:
                    operationInfo.desc = "Transformation";
                    operationInfo.icon = "fa fa-cubes";
                    break;
                default:
                    operationInfo.desc = "Unknown";
                    operationInfo.icon = "fa fa-question";
                    break;
            }
            return operationInfo;
        };


        //</editor-fold>

        //<editor-fold desc="Transaction Reporting">
        _this.getDocumentMetaFields = function(docType, companyId)
        {
            // routine to get the document-meta-data fields for the given document type
            let documentRecord = cacheDataSvc.getListRecord("1", cacheDataSvc.getEDIListType(), docType, companyId);
            let returnarr = [];
            if (documentRecord != null)
            {
                if (documentRecord.jsonData.data && documentRecord.jsonData.data.metadata) {
                    returnarr = documentRecord.jsonData.data.metadata;
                }
                else
                {
                    if (documentRecord.jsonData.metadata)
                        returnarr = documentRecord.jsonData.metadata;
                    else
                    {
                        if (documentRecord.jsonData.data)
                            returnarr = documentRecord.jsonData.data;
                    }

                }
            }
            return returnarr;
        };
        _this.findTransactionsForGWID = function(filterObject, promise)
        {
            // routine to return the transaction ids for a given list of gwid ids
            apiProvider.getList("speGwidSearchTransactionIds", filterObject.gwidIds).then(function(result)
            {
                // now merge the transaction ids with the current transaction ids
                delete filterObject["gwidIds"];

                // loop and update the transactions
                if (filterObject.transactionIds == null)
                    filterObject.transactionIds = [];

                lodash.forEach(result, function(transactionId)
                {
                    var found = lodash.find(filterObject.transactionIds, function(id)
                    {
                        return id == transactionId;
                    });
                    if (!found)
                        filterObject.transactionIds.push(transactionId);
                });
                if (result.length > 0)
                {
                    filterObject.fromDate = null;
                    filterObject.toDate = null;
                }
                _this.findData(filterObject, promise)
            })

        };
        _this.refreshData = function(filterObject)
        {
            // routine to request transaction reporting for the given filter object and call the callback
            var deferred = $q.defer();
            if (filterObject.gwidIds != null && filterObject.gwidIds.length > 0)
            {
                // first get the transaction ids for the GWID's selected
                _this.findTransactionsForGWID(filterObject, deferred);
            }
            else
                _this.findData(filterObject, deferred);
            return deferred.promise;
        };


        //</editor-fold>

        //<editor-fold desc="Transaction Functions">

        //<editor-fold desc="Balancing">
        _this.balancing = {};
        _this.setBalancing = function(balancingObject)
        {
            _this.balancing = balancingObject;
        };
        _this.getBalancing = function()
        {
            return _this.balancing;
        };
        _this.viewBalancing = function(record)
        {
            // Routine to bring up balancing information
            if (!record.titleData)
                record.titleData =  {description: "Balancing Summary", icon:"fa fa-money"};
            let controlOptions = {};
            controlOptions.templateUrl = 'app/modules/spe/partials/transaction-balancing-dialog.tpl.html';
            controlOptions.controller = "itxTransactionBalancingDialogCtrl";
            controlOptions.controllerAs = "vmDetail";
            controlOptions.size = 'lg';

            // find the record
            uiSvc.showDialog(record, controlOptions);
        };

        //</editor-fold>

        //<editor-fold desc="ITX Launcher">
        _this.buildITXCardGrid = function(data, direction)
        {
            // routine to parse the given data and return a updated dataset that is transformed for kendo grid use
            return lodash.map(data, function(record)
            {
                let returnRecord = {"_id": parseInt(record.card), adapter: record.adapter.toUpperCase(), return_code: record.return_code};
                returnRecord.supplemental = record.supplemental;
                if (record.exec_date)
                {
                    let value = $filter("localUTCEpochDateFilter")(record.exec_date, "YYYY-MM-DD HH:mm:ss.SSS");
                    returnRecord.exec_date = $filter("kendoDateFilter")(value);
                }
                returnRecord.byte_count = record.byte_count;
                returnRecord.rowStyle = returnRecord.return_code > 0 ? "transactionError": null;
                returnRecord.direction = direction;
                return returnRecord;
            });

        };


        _this.showITXCardDialog = function(record, direction)
        {
            // routine to show the ITX Card Information in a Dialog Control
            let controlOptions = {};
            record.direction = direction;
            controlOptions.templateUrl = 'app/modules/spe/partials/transaction-detail-map-audit-card-dialog.tpl.html';
            controlOptions.controller = "itxTransactionMapAuditCardDialogCtrl";
            controlOptions.size =  'lg';
            uiSvc.showDialog(record, controlOptions);
        };
        //</editor-fold>


        _this.showGWID = function(id)
        {
            // Routine to bring up a given GWID ID
            let controlOptions = {};
            controlOptions.templateUrl = 'app/modules/spe/partials/transaction-gwid-detail-dialog.tpl.html';
            controlOptions.controller = "itxTransactionGWIDDetailDialogCtrl";
            controlOptions.controllerAs = "vmDialog";
            controlOptions.size =  'lg';
            controlOptions.windowClass =  'xl-modal';
            // find the record
            uiSvc.showDialog({id: id}, controlOptions);
        };


        _this.showGWIDList = function(id, document_type, status)
        {
            // routine to show the list for the given id and type and status
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/spe/partials/transaction-gwid-list-dialog.tpl.html";
            controlOptions.controller = "itxTransactionGWIDListDialogCtrl";
            controlOptions.size = 'lg';

            // find the record
            let record = {filter: {transaction_id: id, document_type: document_type, status: status}};
            uiSvc.showDialog(record, controlOptions);
        };

        _this.showITXAEventDetail = function(eventList, eventIndex)
        {
            // routine to display a single ITXA Event of the given index
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/spe/partials/itxa-event-dialog.tpl.html";
            controlOptions.controller = "itxaEventDialogCtrl";
            controlOptions.size = 'lg';

            // find the record
            if (eventList.length > eventIndex)
            {
                let record = eventList[eventIndex];
                uiSvc.showDialog(record, controlOptions);
            }
        };

        _this.mapMetaField = function(fieldName)
        {
            return transactionReportingSvc.mapMetaField(fieldName, _this.data.metaFields);
        };
        _this.getMetaInputs = function(inputFilter)
        {
            // routine to map the meta-inputs into an array that can be used by the API
            let arr = [];
            return transactionReportingSvc.getMetaInputs(arr, inputFilter, _this.mapMetaField);
        };

        _this.getMetaFields = function()
        {
            // routine to return the meta-fields that are searchable
            return lodash.map(_this.data.metaFields, 'id');
        };

        _this.getTransactionModuleStatus = function(status, execution)
        {
            // routine to return the module statu8s for the the transaction status
            let desc = "";
            switch (status)
            {
                case 96:
                    desc = "ITXA Event Failure";
                    break;
                case 97:
                    desc = "Complete Failure - No Error Code";
                    break;
                case 98:
                    desc = "Complete Failure";
                    break;
                case 99:
                    desc =  "Errors Found";
                    break;
                case 0:
                    return "Successful";
                default:
                    desc =  "Unknown";
            }
            if (execution.error_code)
                desc += "(" + execution.error_code + ")";
            return desc;
        };


        _this.createBaseTransaction = function(data)
        {
            // routine to create the base transaction for an BOOMI transaction
            var returnObject = transactionReportingSvc.createCommonBaseTransaction(data.transaction);
            data.baseTransaction = returnObject;
            // add the info information
            if (data != null && data.transaction && data.transaction.module_data)
            {
                _this.getSummaryInfo(data);
            }
        };

        _this.getSummaryBalancing = function(module_data)
        {
            // routine to get balancing summary
            if (module_data.balance_type == 99)
                return null;
            let result = {};
            result.status = module_data.balance_type === 0 ? "Unbalanced": "Balanced";
            result.class = module_data.balance_type === 0 ? "label-danger": "label-success";

            // check if we have a balancing report
            result.link = false;
            if (module_data.balancing)
                result.link = true;
            return result;
        };

        _this.getSummaryGWID = function(gwid_summary, document_type)
        {
            // routine to parse the GWID Summary for the server for UI display
            if (!gwid_summary)
                return null;
            let result = {total: gwid_summary.total, failed: gwid_summary.failed};
            result.success = result.total - result.failed;
            return result;
        };
        _this.getSummaryHeaderInfo = function(data)
        {
            // work out the headers for the given data
            let module_data = data.transaction.module_data;
            let result = {};
            result.balancing = _this.getSummaryBalancing(module_data);
            result.gwid_summary = _this.getSummaryGWID(data.gwid_summary, data.transaction.document_type);
            if (!result.balancing  && !result.gwid_summary)
                result = null;
            return result;
        };

        _this.getSummaryInfo = function(data)
        {
            // routine to get the summary info for a standard Boomi transaction
            data.info = {};
            let module_data = data.transaction.module_data;
            data.info.status = _this.getTransactionModuleStatus(module_data.module_status, module_data.execution);
            data.info.direction = _this.getDirection(module_data.direction);
            data.info.document = cacheDataSvc.getListDescription("1", cacheDataSvc.getEDIListType(),  data.transaction.document_type);
            if (data.info.document === "Unknown")
                data.info.document = cacheDataSvc.getListDescription("0", cacheDataSvc.getEDIListType(),data.transaction.document_type, 0);

            // determine the transaction type as this will tell us what type of transaction it is
            data.info.transaction_type = module_data.transaction_type;
            let operation = null;
            if (data.info.transaction_type == 0)
            {
                operation = data.operation;
                data.info.transaction_type_desc = "ITX/A";
            }
            if (data.info.transaction_type == 20)
            {
                data.info.transaction_type_desc = "ITX Launcher";
                operation = module_data.execution.launcher.event_type;
                switch (operation)
                {
                    case 13:
                        operation  = 4;
                        break;
                    case 1:
                        operation = 1;
                        break;
                    case 10:
                        operation = 2;
                }
            }
            data.info.operation = _this.getOperationInfo(operation);
        };

        _this.findData = function(filterObject, promise)
        {
            apiProvider.getObject('speTransactionSearch', filterObject).then(function (result)
            {
                // update the transaction filter
                _this.currentFilter = filterObject;
                promise.resolve(result);
            }).catch(function (result)
            {
                $log.error("Unable to retrieve Transaction Data", result);
                promise.reject(result);
            });
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


        _this.parseKendoGridData = function(value)
        {
            // routine to massage the data for grid use
            var parseData = lodash.clone(value, true);
            lodash.forEach(parseData, function(item)
            {
                item = transactionReportingSvc.parseCommonTransaction(item);

                if (!item.direction)
                    item.direction = 0;
                item.direction_disp = _this.getDirection(item.direction);
                if (item.status >= 90)
                {
                    if (item.compliance_status == "OK" && item.balance_flag == 0)
                        item.rowStyle = "transactionCancel";
                }
                else
                {
                    // out of balance make it orange
                    if (item.balance_flag == 0)
                        item.rowStyle = "recordUpdate";
                }
                // update the statistics
                if (item.statistics != null)
                {
                    lodash.forOwn(item.statistics, function (value, key) {
                        item[key] = value;
                    });
                }
            });
            return parseData;
        };

        _this.transactionDrill = function(id)
        {
            // routine to transaction drill to the given transaction saving the grid state
            let record = {transactionId: id, transactionType: 2};
            transactionReportingSvc.navigateTransaction("app.spe.reporting.transactionDetail.baseview", record);
        };

        _this.navigateTransaction = function(id, scope)
        {
            // routine to navigate to the transaction with grid state management (
            transactionReportingSvc.transactionDrill({transactionId: id, mqaModule: 2}, scope);
        };
        //</editor-fold>

        //<editor-fold desc="Dashboard">
        _this.refreshDashboard = function(filterObject)
        {
            // routine to request iib reporting for the given filter object
            return apiProvider.getObject('speDashboardSearch', filterObject);
        };
        //</editor-fold>


        //<editor-fold desc="GWID Processing">

        _this.readGWID = function (id, rawMode, applyDefault)
        {
            // routine to read the blob record as a string and return to the callback
            var mode = 0;
            if (!rawMode)
                mode = 1;
            if (mode == 0 && applyDefault)
                mode = 0; // Raw mode with defaults
            if (mode == 0 && !applyDefault)
                mode = 3; // Raw mode without Defaults;
            return apiProvider.get('speGwidRead', {id: id, mode: mode});
        };

        _this.updateGWID = function(model)
        {
            // routine to request an update of a gwid payload and a status change
            return apiProvider.getObject("speGwidUpdate", model);
        };

        _this.validatePayload = function (model)
        {
            // routine to request a validation of a EDI Payload
            return apiProvider.getObject("speGwidValidate", model);
        };

        _this.downloadGWIDPayload = function(id)
        {
            // routine to retrieve and attachment from a transaction given its id
            apiProvider.getBlob('speGwidDownload', {id: id}).then(function (response)
            {
                var file = new Blob([response.blob], {type: response.blob.type});
                if (response.blob.type == "application/octet-stream")
                    filesaver(response.blob, response.fileName);
                else
                {
                    uiSvc.openBlob(file);
                }
            }).catch(function (result)
            {
                $log.error("Unable to download EDI Document", result);
            });
        };

        _this.initiateBulkGWIDDownload = function()
        {
            // routine to call the progress dialog when initiating a bulk download
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'speGwidDownloadCtrl',
                controllerAs: 'vmDialog',
                resolve: {
                    dialogData: _this.data.lastGWIDFilter
                }
            });
            modalInstance.result.then(function (modalResult)
            {

            }).catch(function (err)
            {
                $log.error("Unable to Perform ITXA - EDI Document Download", err);
            });
        };


        _this.prepareBulkGWIDDownload = function(model)
        {
            // routine to prepare for bulk gwid download
            return apiProvider.getObjectMixed("speGwidBulkDownload", {userId: userSvc.getProfile().id}, model);
        };


        _this.GWIDSearch = function(filterObject)
        {
            // routine to request gwid reporting for the given filter object and call the callback
            _this.data.lastGWIDFilter = filterObject;

            // add the operational stuff
            let orgInfo = userSvc.getOrgInfo();
            if (!filterObject.companyId)
                filterObject.companyId = orgInfo.companyId;
            if (!filterObject.departments)
            {
                filterObject.departments = [];
                if (!userSvc.hasFeature("FILTERALL"))
                    lodash.merge(filterObject.departments, orgInfo.departments);
            }


            var deferred = $q.defer();
            apiProvider.getList('speGwidSearch', filterObject).then(function (result)
            {
                // update the transaction filter
                _this.currentFilter = filterObject;

                // convert all dates to local dates
                var dateFormat = "YYYY-MM-DD HH:mm:ss.SSS";

                lodash.forEach(result, function(item)
                {
                    item.transDate = $filter("localUTCDateFilter")(item.transDate, dateFormat);
                    item.completeDate = $filter("localUTCDateFilter")(item.completeDate, dateFormat);
                    item.lastUpdate = $filter("localUTCDateFilter")(item.lastUpdate, dateFormat);
                });
                deferred.resolve(result);
            }).catch(function (result)
            {
                $log.error("Unable to retrieve GWID Detail Data", result);
                deferred.reject(result);
            });
            return deferred.promise;
        };

        _this.parseGWIDMetaData = function (rows)
        {
            // format the result from a GWID Meta-Search
            var dateFormat = "YYYY-MM-DD HH:mm:ss.SSS";
            lodash.forEach(rows, function(item)
            {
                item.transactionDate = $filter("localUTCDateFilter")(item.transactionDate, dateFormat);
                item.statusDesc = $filter("speGwidStatusFilter")(item.status);
                if (item.supplemental)
                    item.supplemental = "<strong>" + item.statusDesc + "</strong><br>" + item.supplemental.replace("\n","<br/>");

                item.rowStyle = $filter("speGwidRowStyleFilter")(item.status);
            });

        };


        _this.findGWIDForTransaction = function(id)
        {
            // routine to return the transaction ids for a given list of gwid ids
            return apiProvider.list("speGwidSearchTransaction", {id: id});
        };

        //</editor-fold>


        //<editor-fold desc="DeEnvelop">
        _this.viewComplianceReport = function(report, type)
        {
            // routine to manage the creation of the compliance report from the result set
            if (report)
            {
                let fileObject = new Blob([report], {type: type });
                uiSvc.openBlob(fileObject);
            }
            else
            {
                uiSvc.showError("De-Envelop Compliance Report", "Unable to find Output Document");
            }
        };

        _this.prepareDeEnvelopeDialog = function(dialog)
        {
            // routine to prepare the given dialog for de-envelope
            dialog.progressInfo.viewComplianceReport = function()
            {
                _this.viewComplianceReport(dialog.lastProgress.info.report, dialog.lastProgress.info.report_type);
            };
            dialog.progressInfo.viewReport = function()
            {
                _this.viewComplianceReport(dialog.lastProgress.info.report, dialog.lastProgress.info.report_type);
            };

            dialog.progressInfo.buttons = [];
            dialog.progressInfo.buttons.push({
                name: "output",
                class: "primary",
                action: dialog.progressInfo.viewComplianceReport,
                caption: "View Compliance Report...",
                visible: false
            });

            dialog.progressInfo.onProgressUpdateComplete = function(status)
            {
                if (status == uiSvc.backgroundProcessStates.COMPLETED || status == uiSvc.backgroundProcessStates.INERROR)
                {
                    if (dialog.lastProgress.info.report != null)
                    {
                        if (dialog.lastProgress.info.report_button)
                            dialog.progressInfo.buttons[0].caption = dialog.lastProgress.info.report_button;
                        dialog.progressInfo.buttons[0].visible = true;
                    }
                }
                if (status == uiSvc.backgroundProcessStates.COMPLETED)
                {
                    dialog.modalResult = true;
                }
                if (status == uiSvc.backgroundProcessStates.INERROR)
                {
                    dialog.modalResult = false;
                }
            };
        };

        //</editor-fold>


        //<editor-fold desc="OLD CLI - to be Deprecated">
        _this.performTransactionOperation = function (stateId, transactionId, operation, customData) {
            // routine to perform a resubmit, repair or cancellation of a a given transaction
            var model = {};
            model.userLogin = userSvc.getProfile().name;
            model.userId = userSvc.getProfile().id;
            model.module = 2; // SPE
            model.operation = operation; // (1) resubmit (2) - repair, (3) - cancellation,
            model.stateId = stateId;
            model.transactionId = transactionId;
            if (customData)
                model.customData = customData;
            else
                model.customData = {};
            return apiProvider.getObject("speResubmit", model);
        };

        //</editor-fold>

        //<editor-fold desc="Sender Profile">
        _this.requestBaseSenderExport = function()
        {
            apiProvider.getBlob('speCNOSenderExport',{id: userSvc.getOrgInfo().companyId}).then(function (response)
            {
                filesaver(response.blob, response.fileName);
            }).catch(function (result)
            {
                $log.error("Unable to download Sender Export", result);
            });
        };

        _this.senderImport = function(model)
        {
            // routine to prepare for sender imports
            return apiProvider.getObject("speSenderImport", model);
        };


        _this.updateSenderProfileBulkFunction = function(vm)
        {
            // routine to post the updates to the server
            adminDataSvc.saveCustomerLists(userSvc.getOrgInfo().companyId, vm.data).then(function(result) {
                uiSvc.showExtraSmallPopup("ITXA Sender Profiles", "All the Profiles have been updated successfully !", 5000);
                _this.assignSenderProfileIds(vm, result);
            }).catch(function(err)
            {
                $log.error("Unable to Update Sender Profiles", err);
            });
        };



        //<editor-fold desc="DEPRECATED - CNO AND HCN ONLY">

        _this.requestSenderProfileSync = function(vm)
        {
            // open the dialog that will initiate a mass syncronization of all Senders Defined
            vm.senderId = "ALL";
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'speSenderSyncCtrl',
                controllerAs: 'vmDialog',
                scope: vm
            });
            modalInstance.result.then(function (result)
            {
                // refresh the data
                vm.initialize();
            }, function ()
            {
            });
        };

        _this.senderSync = function(model)
        {
            // routine to prepare for sender syncronizations
            return apiProvider.getObject("speSenderSync", model);
        };

        _this.requestSenderProfileImport = function(vm)
        {
            // open the dialog that will upload the file, start and complete the import process and return the result of the import
            // DEPRECATED - USED ONLY BY CNO AND HCN
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'speSenderImportCtrl',
                controllerAs: 'vmDialog',
                scope: vm
            });
            modalInstance.result.then(function (result)
            {
                // update the result
                if (result.length > 0)
                {
                    lodash.forEach(result, function(row)
                    {
                        if (row.recordStatus == uiSvc.editModes.INSERT)
                            row.rowStyle = "recordInsert";
                        if (row.recordStatus == uiSvc.editModes.UPDATE)
                            row.rowStyle = "recordUpdate";
                    });
                    _this.assignSenderProfileIds(vm, result);
                    vm.allowSave = true;
                    vm.refreshGrid();
                }
            }, function () {
            });
        };

        _this.assignSenderProfileIds = function(vm, result)
        {
            // routine to assign ids to each row read by the server
            // DEPRECATED - USED ONLY BY CNO AND HCN
            vm.allowSave = false;
            lodash.forEach(result, function(item, index)
            {
                item.rowId = index;
            });
            vm.data = result;
            vm.refreshGrid();
        };

        _this.initializeSenderProfile = function(vm)
        {
            // routine to initialize sender profile list screens
            // DEPRECATED - USED ONLY BY CNO AND HCN
            vm.gridSetup();
            let model = {companyId: userSvc.getOrgInfo().companyId, type: "ITX_SENDER"};
            adminDataSvc.readCustomerLists(model).then(function(result)
            {
                _this.assignSenderProfileIds(vm, result);

            }).catch(function(err)
            {
                $log.error("Unable to Retrieve Sender Profile List", err);
            })
        };
        _this.insertSenderProfile = function(vm)
        {
            vm.editRow = {rowId: "new_" + (vm.data.length + 1),type:"ITX_SENDER",recordStatus:uiSvc.editModes.INSERT, isNew: true, jsonData:{}, companyId: userSvc.getOrgInfo().companyId};
            vm.editRow.jsonData.metadata = {};
            vm.showEdit = true;
            vm.editRow.rowStyle = "recordInsert";
        };
        _this.editSenderProfile = function(vm, row)
        {
            // routine to manage the editing of a sender profile
            vm.showEdit = true;
            vm.editRow = angular.copy(row);
            if (!vm.editRow.jsonData.metadata)
                vm.editRow.jsonData.metadata = {};
            vm.editRow.isNew = false;
            vm.editRow.recordStatus = uiSvc.editModes.UPDATE;
        };

        _this.deleteSenderProfile = function(vm)
        {
            // routine to be called when the user chooses to delete a record
            if(vm.editRow.isNew)
            {
                // remove the entry from the list as it was an add then a delete
                var entry = {rowId:vm.editRow.rowId};
                lodash.remove(vm.data, entry);
            }
            else
            {

                var record = lodash.find(vm.data, {rowId: vm.editRow.rowId});
                if (record)
                    record.recordStatus = uiSvc.editModes.DELETE;
            }
            vm.allowSave = true;
            vm.refreshGrid();
        };

        _this.saveSenderProfile = function(vm)
        {
            // save the record
            vm.editRow.description = vm.editRow.jsonData.sender_name;
            vm.editRow.code = vm.editRow.code.toUpperCase();
            if (vm.editRow.isNew)
            {
                vm.editRow.isNew = false;
                vm.data.push(vm.editRow);
            }
            else
            {
                // update the existing row
                if (!vm.editRow.rowStyle)
                    vm.editRow.rowStyle = "recordUpdate";
                var recordIndex = lodash.findIndex(vm.data, {rowId: vm.editRow.rowId});
                if (recordIndex >= -1)
                {
                    vm.data.splice(recordIndex, 1,vm.editRow);
                }
            }
            vm.allowSave = true;
            vm.refreshGrid();
        };
        //</editor-fold>



        //</editor-fold>
    }]);

});
