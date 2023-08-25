/*
 /// <summary>
 /// app.modules.iib_v2.services - iibv2DataSvc.js
 /// Mongo IIB Module Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/11/2018
 /// </summary>
 */
define(['modules/iib_v2/module', 'lodash', 'appCustomConfig'], function(module, lodash, appCustomConfig)
{
    "use strict";
    module.registerService('iibv2DataSvc',['$filter','$q', '$log','$state', '$uibModal', 'apiSvc', 'apiProvider', 'cacheDataSvc', 'transactionReportingSvc', 'userSvc', 'uiSvc', 'chartSvc', 'adminDataSvc', function($filter, $q, $log, $state, $uibModal, apiSvc, apiProvider, cacheDataSvc, transactionReportingSvc, userSvc, uiSvc, chartSvc, adminDataSvc)
    {
        var _this = this;
        _this.data = {applicationCache:null, lastCLIRequest: null, metaFields:[]};

        // add the meta-field mapping
        _this.data.metaFields.push({id:"job_id", field:"job_id"});

        // setup the webservice calls
        var configs = [
            {url: 'iib/transaction/search', resourceName:'iibv2TransactionSearch'},
            {url: 'iib/transaction/dashboard', resourceName: 'iibv2TransactionDashboard'},
            {url:'/client/ncl/dashboard/trip', resourceName:'iibNCLTripDashboard'},
            {url: 'iib/transaction/errors/search', resourceName: 'iibv2TransactionErrors'},
            {url: 'iib/transaction/errors/dashboard', resourceName: 'iibv2TransactionDashboardErrors'},
            {url :'/iib/cli', resourceName: 'iibCLIRequest'}
        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });
        adminDataSvc.setupCLI(_this, 'iibCLIRequest');
        _this.moduleConfig = adminDataSvc.readCachedModuleParameter("IIB");

        //<editor-fold desc="Transaction Functions">
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
        _this.showErrorSummary = function(data, drill)
        {
            // routine to show the Error Summary Dialog for the given filterObject and type
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: 'app/modules/iib_v2/partials/transaction-error-summary-dialog.tpl.html',
                controller: 'iibTransactionErrorSummaryDialogCtrl',
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

        _this.refreshErrors = function(dataObject)
        {
            // routine to request errors for the given filter object
            return apiProvider.getList(dataObject.apiName, dataObject.filter);
        };

        _this.parseTransactionCounts = function(resultObject)
        {
            // routine to parse the transaction totals and transaction operation groupings returned by the server
            if (!resultObject.total && !resultObject.type_count)
                return null;
            let data = {};
            if (resultObject.total)
                data = resultObject.total;

            // format the totals
            data.failures = $filter('number')(data.failures);
            data.transaction_count = $filter('number')(data.transaction_count);
            data.time_count = $filter('number')(data.time_count, 2);
            data.avg_time = $filter('number')(data.avg_time, 2);

            data.resubmit_count = 0;
            data.repair_count = 0;
            data.cancel_count = 0;
            if (resultObject.type_count)
            {
                lodash.forEach(resultObject.type_count, function(obj)
                {
                    let type = parseInt(obj._id);
                    switch (type)
                    {
                        case 0:
                            break;
                        case 1:
                            data.resubmit_count = parseInt(obj.count);
                            break;
                        case 2:
                            data.repair_count = parseInt(obj.count);
                            break;
                        case 3:
                            data.cancel_count = parseInt(obj.count);
                            break;
                    }
                });
                data.resubmit_count = $filter('number')(data.resubmit_count);
                data.repair_count = $filter('number')(data.repair_count);
                data.cancel_count = $filter('number')(data.cancel_count);
            }

            return data;
        };
        _this.transactionSearch = function(filterObject)
        {
            // routine to request a transaction search and return the data
            var deferred = $q.defer();
            apiProvider.getObject('iibv2TransactionSearch', filterObject).then(function (result)
            {
                deferred.resolve(result);
            }).catch(function (result)
            {
                $log.error("Unable to retrieve Transaction Results", result);
                deferred.reject(result);
            });
            return deferred.promise;
        };


        _this.parseTransactionGridData = function(value)
        {
            // routine to massage the data for grid use
            let userSecurity = userSvc.getUserTransactionSecurity();

            let parseData = lodash.clone(value, true);
            lodash.forEach(parseData, function(item)
            {
                // update the transaction
                item = transactionReportingSvc.parseCommonTransaction(item);

                // add the resubmit payload count
                if (!item.resubmit_payloads)
                    item.resubmit_payloads = 0;
                if (!item.payload_count)
                    item.payload_count = 0;

                // add the meta-data
                if (!item.meta_data)
                    item.meta_data = [];
                transactionReportingSvc.setSecurity(item, userSecurity);
            });
            _this.setListDescriptions(parseData);
            return parseData;
        };

        _this.transactionDrill = function(record, baseState, view)
        {
            // routine to transaction drill to the given transaction
            if (baseState == undefined)
                baseState = $state.$current;
            if (view == undefined)
                view = "baseview";
            transactionReportingSvc.navigateTransaction(baseState.parent.name + ".reporting.transactionDetail." + view, {transactionId: record._id, transactionType: 102});
        };

        _this.createBaseTransaction = function(data)
        {
            // routine to create the base transaction for an IIB transaction
            let returnObject = transactionReportingSvc.createCommonBaseTransaction(data);
            data.baseTransaction = returnObject;
        };

        _this.updateTimeEventsViewModel = function(events)
        {
            // routine to update the IIB Events with view specific information
            lodash.forEach(events, function (evt)
            {
                uiSvc.getAttachmentStyle(evt);
            });
        };

        //</editor-fold>

        //<editor-fold desc="Dashboard">
        _this.getColorPalette = function()
        {
            // routine to return the color palette for this module
            let baseColors = chartSvc.getColors();
            let colorArray =  ['#0066FF', '#009933', '#5887FF', '#FF5A09','#55C1FF', '#102E4F'];
            let colorNames =  {error: baseColors.chartError, unk: baseColors.chartUnknown, request: colorArray[0], time: colorArray[1], resubmit: colorArray[2], repair: colorArray[3]};
            return {
                colorArray: colorArray,
                colorNames: colorNames
            };
        };

        _this.parseTransactionDashboardData = function(rows)
        {
            lodash.forEach(rows, function(item)
            {
                var value = $filter("localUTCEpochDateFilter")(item.action_date, "YYYY-MM-DD HH:mm:ss.SSS");
                item.action_date = $filter("kendoDateFilter")(value);
                transactionReportingSvc.mapMongoStatus(item, item.status);
            });
            _this.setListDescriptions(rows);
            return rows;
        };


        _this.refreshNCLTripDashboard = function(filterObject)
        {
            // routine to request iib reporting for the NCL IIB Shipping Dashboard
            return apiProvider.getObject('iibNCLTripDashboard', filterObject);
        };

        _this.refreshTransactionDashboard = function(filterObject)
        {
            // routine to request iib reporting for the given filter object
            return apiProvider.getObject('iibv2TransactionDashboard', filterObject);
        };
        //</editor-fold>

        //<editor-fold desc="Lists and Configuration">
        _this.getLists = function()
        {
            // routine to return the list used in agent reporting
            if (_this.data.appicationCache == null)
            {
                return _this.initializeLists();
            }
            else
            {
                var deferred = $q.defer();
                deferred.resolve(_this.data.appicationCache);
                return deferred.promise;
            }
        };

        _this.setTransactionDescriptions = function(applicationList, record, type)
        {
            // routine to set the given application, flow and node descriptions based on the config
            let code = type == 0 ? record.reference_info.application_id : record.application_id;
            if (type == 0)
                record.reference_info.flow_name = record.flow_info.name;
            let appRecord = lodash.find(applicationList, {code: code.toUpperCase()});
            if (appRecord != null)
            {
                // set the application to its description
                if (type == 0)
                    record.reference_info.application_id = appRecord.description;
                else
                    record.application_id = appRecord.description;

                // find the flow
                if (appRecord.jsonData && appRecord.jsonData.flows)
                {
                    code = type == 0 ? record.flow_info.name: record.flow_name;
                    let flowRecord = lodash.find(appRecord.jsonData.flows, {code: code.toUpperCase()});
                    if (flowRecord != null)
                    {
                        if (type == 0)
                            record.reference_info.flow_name = flowRecord.description;
                        else
                            record.flow_name = flowRecord.description;

                        if (type == 0 && flowRecord.nodes)
                        {
                            // now get the node descriptions
                            let nodes = record.nodes;
                            lodash.forEach(nodes, function(node)
                            {
                                switch (node.node_type)
                                {
                                    case 0:
                                        let nodeRecord = lodash.find(flowRecord.nodes, {code: node.name.toUpperCase()});
                                        node.description = (nodeRecord != null ? nodeRecord.description : node.type);
                                        break;
                                    case 1:
                                        node.description = "Meta-Data Emit";
                                        break;
                                    case 2:
                                        node.description = "Payload Emit";
                                        if (node.info && node.info.length > 0)
                                        {
                                            lodash.forEach(node.info, function(payloadNode)
                                            {
                                                // find the lookup code for the description (stupid prolifics folks that don't assign unique codes)
                                                let nodeCode = payloadNode.event;
                                                if (payloadNode.code)
                                                    nodeCode += "_" + payloadNode.code;
                                                nodeCode = nodeCode.toUpperCase();
                                                let nodeRecord = lodash.find(flowRecord.nodes, {code: nodeCode});
                                                if (nodeRecord != null && nodeRecord.description.toUpperCase() !== nodeCode)
                                                    payloadNode.description = nodeRecord.description;
                                            });
                                        }
                                        break;
                                }
                            });
                        }
                    }
                }
            }
        };

        _this.setListDescriptions = function(data)
        {
            // routine to set the appropriate transaction descriptions for the given data set
            _this.getLists().then(function(result)
            {
                lodash.forEach(data, function(item)
                {
                    _this.setTransactionDescriptions(result, item, 1);
                });
            }).catch(function(err)
            {
                $log.error("Unable to get List Descriptions", err);
            });

        };
        _this.initializeLists = function()
        {
            // routine to return a list of IIB apps
            let deferred = $q.defer();
            let listModel = {company_id: userSvc.getOrgInfo().companyId, type: "IIB_APP"};
            adminDataSvc.readCustomerListAudit(listModel).then(function(result)
            {
                _this.data.appicationCache = result;
                deferred.resolve(_this.data.appicationCache);
            }).catch(function (err)
            {
                $log.error("Unable to Get Application Cache", err);
            });
            return deferred.promise;
        };

        _this.getTitle = function()
        {
            return cacheDataSvc.getModuleDesc("iib");
        };
        _this.getModuleConfig = function()
        {
            return _this.moduleConfig;
        };
        //</editor-fold>

        //<editor-fold desc="CLI">
        _this.setupCLIFunctions = function(parent)
        {
            // routine to return the standard cli functions
            let cliFunctions = {};
            cliFunctions.responseFunction = function(dialog, result)
            {
                _this.handleCLIProgressResponse(dialog, result);
            };
            cliFunctions.errorFunction = function(err)
            {
                if (err === 'cancel')
                    return;
                uiSvc.showExtraSmallPopup(data.desc, "Instruction Failed  !<br/>" + err, 5000, "#ce2029", "times");
            };
            return cliFunctions;
        };

        _this.initiateCLI = function(data)
        {
            // routine to initiate a cli request
            adminDataSvc.initiateCLI(data, _this, 'iibCLICtrl', function (modalResult)
            {
                if (modalResult.error)
                    uiSvc.showExtraSmallPopup(data.desc, "Instruction Failed  !<br/>" + modalResult.error, 5000, "#ce2029", "times");
                else if (_this.lastCLIRequest.completeFunction)
                    _this.lastCLIRequest.completeFunction(modalResult, false);

            }, function (err)
            {
                $log.error("Unable to Perform CLI Invocation", err);
                if (_this.lastCLIRequest.completeFunction)
                    _this.lastCLIRequest.completeFunction(err, true);
            });
        };

        //</editor-fold>

    }]);
});
