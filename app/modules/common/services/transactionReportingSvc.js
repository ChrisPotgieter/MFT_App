/*
 /// <summary>
 /// app.modules.common.services - transactionReportingSvc
 /// Transaction Service - Service to handle all General Functions required to Manage Transaction Reporting across all modules
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/5/2016
 /// </summary>
 */
define(['modules/common/module','lodash','file-saver', 'moment', 'appCustomConfig'], function(module, lodash,filesaver, moment, appCustomConfig)
{
    "use strict";
    moment().format();

    module.registerService('transactionReportingSvc',['$q', '$state', '$stateParams','$log', '$filter','cacheDataSvc', 'adminDataSvc', 'apiSvc','apiProvider', 'uiSvc', 'userSvc',  function($q, $state, $stateParams, $log, $filter, cacheDataSvc, adminDataSvc, apiSvc, apiProvider, uiSvc, userSvc)
    {
        // declare private variables
        let _this = this;


        // declare the public constants
        _this.transactionStatusEnum  = { STARTED: 1, IN_PROGRESS: 2, COMPLETED: 10, PARTIALLY_COMPLETED: 30, COMPLETED_WITHIN_SLA: 11, COMPLETED_OUTSIDE_SLA: 12, PARTIALLY_COMPLETED_WITHIN_SLA: 31,  PARTIALLY_COMPLETED_OUTSIDE_SLA: 32, IN_PROGRESS_ERRORS: 9, FAILED: 90, CANCELLED: 91};
        _this.moduleEnum = {ADMIN: 999, MFT: 0, IIB: 1, IIB_V2: 101, ACE: 102, ACE_V2:103, ITXA:2, INSTAMED: 210, BOOMI: 3, BRIDGE: 4, CUSTOM: 99};
        _this.transCliInstructionEnum  = {  CANCEL_TRANSACTION: 29, REPAIR_TRANSACTION: 21, RESUBMIT_TRANSACTION: 20, FORCE_COMPLETE: 28};
        _this.moduleRoutes = { DETAIL: "commonTransDetail", JOB_TREE: "commonTransDetailJobMenu", DOC_TREE : "commonTransDetailDocMenu"}; // routing keywords

        _this.reportingInfo = {};
        _this.currentFilter = {};

        //<editor-fold desc="Attachments & Repair">
        _this.retrieveAttachment = function(id, module, mode)
        {
            // routine to retrieve and attachment from a transaction for a given module
            return apiProvider.getBlob('commonTransDetailAttachment', {id: id, module: module, mode: mode});
        };

        _this.retrieveTableAttachment = function(id, module, mode, table)
        {
            // routine to retrieve and attachment from a given table
            return apiProvider.getBlob('commonAttachmentTable', {id: id, module: module, mode: mode, table: table});
        };

        _this.viewInLineAttachment = function(id, format, module, icon, options)
        {
            // routine to provide either an inline attachment or a download (this is based on the type of file)
            let show = (cacheDataSvc.data.allowedViewTypes.includes(format.toLowerCase()));
            if(show)
            {
                let controlOptions =
                    {
                        templateUrl: 'app/modules/common/partials/dialog-code-mirror.tpl.html',
                        controller: 'commonCodeMirrorDialogCtrl',
                    };
                let record =  {title:"Attachment", icon:"fa " + icon, data: {contentType: format, id: id, module: module, options: options}, cm: {}};
                uiSvc.showDialog(record, controlOptions);
            }
            else
            {
                _this.getAttachment(id, module, options);
            }
        };


        _this.getAttachmentContent = function(elementId, model, options)
        {
            // routine to return PARTIAL content from the server for display in the UI
            // this happens after the extension is matched against available view types
            if (elementId)
                uiSvc.displayKendoLoader('#' + elementId, true);

            let promise = null;
            if (options && options.tableName)
                promise = _this.retrieveTableAttachment(model.id, model.module, 1, options.tableName);
            else
                promise = _this.retrieveAttachment(model.id, module.module, 1);
            promise.then(function (response)
            {
                let file = new Blob([response.blob], {type: response.blob.type});
                file.text().then(function(content)
                {
                    if (content == null)
                        return;
                    model.content = content;
                    model.fileName = response.fileName;

                    // update the partial display
                    if (response.partial && response.total)
                        model.partialDesc = $filter('bytesFilter')(response.partial) + " Of " + $filter('bytesFilter')(response.total);

                    if (options && options.displayFunction)
                    {
                        options.displayFunction(response.blob.type);
                    }

                });
            }).catch(function (result)
            {
                uiSvc.showError("Attachment Viewer", "Unable to download Content");
                $log.error("Unable to download Document", result);
            }).finally(function()
            {
                if (elementId)
                    uiSvc.displayKendoLoader('#' + elementId, false);
            });
        };


        _this.getAttachment = function(id, module, options)
        {
            // routine to return full attachment content for the given id and module and download it
            // this is invoked by the user or the attachment does not match known edit types
            let promise = null;
            if (options && options.tableName)
                promise = _this.retrieveTableAttachment(id, module, 0, options.tableName);
            else
                promise = _this.retrieveAttachment(id, module, 0);
            promise.then(function(response)
            {
                const file = new Blob([response.blob], {type: response.blob.type});
                if (response.blob.type == "application/octet-stream" || ((options && options.downloadAlways)))
                {
                    let fileName = response.fileName;
                    if (options && options.fileName)
                        fileName = options.fileName;
                    filesaver(response.blob, fileName);
                }
                else {
                    uiSvc.openBlob(file);
                }
            }).catch(function (result)
            {
                $log.error("Unable to download Document", result);
            })
        };


        _this.getRepair = function(id, module, mode)
        {
            // routine to retrieve and attachment repair from a transaction for a given module
            let params = {id: id, module: module, mode: mode};
            if (mode == 0)
                return apiProvider.getBlob('commonTransRepairAttachment', params);
            else
                return apiProvider.get('commonTransRepairAttachment', params);
        };



        _this.showRepair = function(title, repairResponse, content, functions)
        {
            // routine to show the repair dialog and return the modal instance
            // functions needs to have the following functions
            // confirmFunction(data) - when the user says ok
            // responseFunction(dialog, progressInfo) - when the progress info has come back
            // completeFunction(result, isError) - when the operation is complete
            // errorFunction(err) - when there is an error

            let controlOptions =
                {
                    templateUrl: 'app/modules/common/partials/dialog-repair.tpl.html',
                    controller: 'commonRepairDialogCtrl',
                    size: 'lg',
                    windowClass: 'xl-modal'
                };
            let destination = {param: repairResponse.destination, typeDesc: _this.getRepairDestinationType(repairResponse.destinationType)};
            let record =  {title:title, icon:"fa fa-wrench", data: {content: content, contentType: repairResponse.format}, cm: {}, headers: repairResponse.headers, functions: functions, destination: destination};
            let modalInstance = uiSvc.showDialog(record, controlOptions);
            modalInstance.result.then(functions.completeFunction).catch(functions.errorFunction);
        };


        _this.viewRepair = function(title, id, format, module, functions)
        {
            // routine to provide either an inline attachment or a download
            let show = (cacheDataSvc.data.allowedViewTypes.includes(format));

            // get the attachment content
            _this.getRepair(id, module, 0).then(function (response)
            {
                _this.getRepair(id, module, 1).then(function(responseData)
                {
                    responseData.format = format;
                    if (show)
                    {
                        let file = new Blob([response.blob], {type: response.blob.type});
                        file.text().then(function(content)
                        {
                            return _this.showRepair(title, responseData, content, functions);
                        });
                    }
                    else
                    {
                        return _this.showRepair(title, responseData, null, functions);
                    }

                });
            }).catch(function (result)
            {
                $log.error("Unable to Retrieve Repair Payload", result);
            });
        };

        _this.getRepairDestinationType = function(type)
        {
            switch (type)
            {
                case 0:
                    return "WMQ Message Put";
            }
        };


        //</editor-fold>

        //<editor-fold desc="Custom Reporting State Management">
        _this.saveGridDrillState = function ($scope, selectedId)
        {
            // routine to handle a transaction drill on a grid view
            _this.saveBaseReportingInfo($scope);

            // now save the current state of the grid so that we restore when the user uses the back button
            const reportingInfo = _this.reportingInfo[$scope.filterName];
            if ($scope.grid)
            {
                reportingInfo.gridState = {};
                const gridState = uiSvc.saveKendoGridState($scope.grid);
                if (gridState)
                {
                    reportingInfo.gridState.grid = gridState;
                    reportingInfo.gridState.selectedRow = selectedId;
                }
            }
        };

        _this.saveBaseReportingInfo = function(scope)
        {
            // routine to save the current base reporting information
            const name = scope.filterName;
            _this.reportingInfo[name] = {};
            _this.reportingInfo[name].filterObject = {};
            _this.reportingInfo[name].data = [];
            _this.reportingInfo[name].dateRange = {};
            if (scope.filter)
                angular.copy(scope.filter, _this.reportingInfo[name].filterObject);
            if (scope.dateRange)
                angular.copy(scope.dateRange, _this.reportingInfo[name].dateRange);
            if (scope.data)
            {
                angular.copy(scope.data, _this.reportingInfo[name].data)
            }
        };

        _this.loadBaseReportingInfo = function(scope)
        {
            // routine to load Reporting Info into the given scope using the filterName
            let stateObject = _this.reportingInfo[scope.filterName];
            scope.reportName = $state.current.data.title;


            if (stateObject == null)
            {
               // check if this is a customized report
                if ($stateParams.settingId)
                {
                    let setting = userSvc.getUserTemplate( $stateParams.settingId, $state.$current.data.settings);
                    if (setting != null && setting.info != null) {
                        stateObject = setting.info;
                        stateObject.reset = false;
                        scope.reportName =  setting.description;
                    }
                }
            }
            else
            {
                stateObject.reset = true;
            }
            if (stateObject == null)
                return null;

            if (stateObject.filterObject)
            {
                angular.copy(stateObject.filterObject, scope.filter);
                if (stateObject.reset)
                    stateObject.filterObject = undefined;
            }
            if (stateObject.dateRange)
            {
                angular.copy(stateObject.dateRange, scope.dateRange);
                if (stateObject.reset)
                    stateObject.dateRange = undefined;
            }
            if (stateObject.data && stateObject.data.length > 0)
            {
                angular.copy(stateObject.data, scope.data);
                if (stateObject.reset)
                    stateObject.data = [];
            }
            if (stateObject.reset)
                _this.reportingInfo[scope.filterName] = null;
        };

        _this.getBaseReportingInfo = function(name)
        {
            // routine to return the base reporting info for the given name from the cached data
            let reportingInfo = _this.reportingInfo[name];
            if (reportingInfo == null)
            {
                // check if this is a customized report
                if ($stateParams.settingId) {
                    let record = userSvc.getUserTemplate($stateParams.settingId, $state.$current.data.settings);
                    if (record != null && record.info != null) {
                        reportingInfo = record.info;
                        reportingInfo.reset = false;
                    }
                }
            }
            else
                reportingInfo.reset = true;
            if (reportingInfo == null)
                reportingInfo = {reset:true};
            return reportingInfo;
        };

        _this.initializeDefaultStateManager = function(scope, stateManager)
        {
            // routine to initialize provided state manager with the default functions
            stateManager.persistState = function(model, grid)
            {
                // routine to persist the current grid state to the in-memory store
                const filterName = scope.vm.model.filterName;
                _this.saveBaseReportingInfo(scope.vm.model);

                // now save the current state of the grid so that we restore when the user uses the back button
                const reportingInfo = _this.getBaseReportingInfo(filterName);
                reportingInfo.gridState = {};
                const gridState = uiSvc.saveKendoGridState(grid);

                if (gridState)
                {
                    reportingInfo.gridState.grid = gridState;
                    if (model != null)
                        reportingInfo.gridState.selectedRow = model.oid;
                    else
                        reportingInfo.gridState.selectedRow = null;
                }
            };

            stateManager.loadState = function(grid)
            {
                // routine to load the active state for the grid
                const reportingInfo = _this.getBaseReportingInfo(scope.vm.model.filterName);
                if (reportingInfo == null)
                    return;
                if (reportingInfo.gridState && reportingInfo.gridState.selectedRow)
                {
                    const item = scope.grid.dataSource.get(reportingInfo.gridState.selectedRow);
                    if (item != null) {
                        const tr = $("[data-uid='" + item.uid + "']", grid.tbody);
                        grid.select(tr);
                    }
                    reportingInfo.gridState.selectedRow = null;
                }
            };

            stateManager.initializeState = function(options)
            {
                // routine to manage the grid state initialization
                const reportingInfo = _this.getBaseReportingInfo(scope.vm.model.filterName);
                if (reportingInfo == null)
                    return;
                if (reportingInfo.gridState && reportingInfo.gridState.grid)
                {
                    uiSvc.loadKendoGridState(options, reportingInfo.gridState.grid);
                    if (reportingInfo.reset)
                        reportingInfo.gridState.grid = null;
                }
            };
            stateManager.persistUserState = function (settingsObject)
            {
                // routine to persist the filter and grid information to a user settings object
                const grid = stateManager.grid;
                const state = uiSvc.saveKendoGridState(grid);
                settingsObject.info = {filterObject: scope.vm.model.filter, gridState: {grid: state}};
            };

        };
        //</editor-fold>

        //<editor-fold desc="Route Management">


        _this.reset = function(dataModule)
        {
            // routine to initialize variables when the module has changed
            _this.reportingInfo = {};
            _this.filter = {};
        };

        _this.buildStates = function($couchPotatoProvider)
        {
            // routine to return the detail states for the modules
            const detailStates = [];

            // add the detail event info states

            detailStates.push({ id: "reporting", viewType: 0, state:
                    {
                        abstract: true,
                        url: '/reporting',
                        data:
                            {
                                title: 'Reporting'
                            }
                    }
            });

            detailStates.push({id:"reporting.transactionDetail", viewType: 0, state:
                    {
                        abstract: true,
                        url: '/transactionDetail/:transactionId',
                        views: {
                            "innerContent@content": {
                                controller: 'transactionDetailCtrl',
                                templateUrl: 'app/modules/transaction-reporting/partials/transaction-detail.tpl.html',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/transaction-reporting/controllers/transactionDetailCtrl',
                                        'modules/iib_v2/services/iibv2DataSvc',
                                        'modules/spe/services/speDataSvc',
                                        'modules/common/directives/ui/mqaAttachmentButton',
                                        'modules/common/directives/graphs/mqaChartjs'
                                    ])
                                }
                            },

                            "widgetContent@content": {
                                template:"<div></div>"
                            },
                            "detailOuterContent@content":{
                                templateUrl:'app/modules/transaction-reporting/partials/transaction-detail-drill-outer.tpl.html'
                            }
                        },
                        data:
                            {
                                title:'End to End Tracking',
                                titleIcon: 'sort-amount-asc',
                                requiresAuth: false
                            }
                    }
            });


            detailStates.push({id:"reporting.transactionDetail.jobview", viewType:1, state:
                    {
                        abstract: true,
                        url: '/jobview',
                        views:
                            {
                                "tabContent@content":
                                    {
                                        controller: 'transactionDetailJobViewCtrl',
                                        template: '<div smart-include=\"app/modules/transaction-reporting/partials/transaction-detail-tree.tpl.html\"></div>',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/transaction-reporting/controllers/transactionDetailJobViewCtrl'
                                            ])
                                        }
                                    }
                            }
                    }});
            detailStates.push({id:"reporting.transactionDetail.baseview", viewType:1, state:
                    {
                        abstract: true,
                        url: '/transactionView',
                        views:
                            {
                                "tabContent@content":
                                    {
                                        controller: 'transactionDetailBaseViewCtrl',
                                        template: '<div></div>',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/transaction-reporting/controllers/transactionDetailBaseViewCtrl'
                                            ])
                                        }
                                    }
                            }
                    }});

            // module states
            detailStates.push({id:"iib_v2", viewType:2, state:
                    {
                        url: '/iib_v2',
                        views:
                            {
                                "widgetContent@content":
                                    {
                                        controller: 'iibv2TransactionDetailCtrl',
                                        controllerAs: 'vmDetail',
                                        templateUrl: 'app/modules/iib_v2/partials/transaction-detail.tpl.html',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/iib_v2/controllers/iibv2TransactionDetailCtrl',
                                                'modules/common/controllers/commonCommandInfoDialogCtrl',
                                                'modules/common/controllers/commonTimeLineDialogCtrl',
                                                'modules/common/directives/ui/mqaCommandItem'
                                            ])
                                        }
                                    },
                                "detailOuterContent@content":
                                    {
                                        // there is no detail panel on IIB
                                        template:"<div></div>"
                                    },
                                "infoContent@content":
                                    {
                                        templateUrl: 'app/modules/iib_v2/partials/transaction-detail-summary-info.tpl.html'
                                    }
                            },
                        data:
                            {
                                subTitle: "IIB Events",
                                splitHeight: "800px",
                                treeHeight:"800px",
                                infoHeight:"900",
                                infoPanelHeight: "500"
                            }
                    }});

            detailStates.push({
                id: "mft_v2", viewType: 2, state:
                    {
                        url: '/mft_v2',
                        views:
                            {
                                "widgetContent@content":
                                    {
                                        templateUrl: 'app/modules/mft_v2/partials/transaction-detail-diagram.tpl.html',
                                        controller: 'mftTransactionDetailCtrl',
                                        controllerAs: 'vmDetail',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/mft_v2/services/mftv2DataSvc',
                                                'modules/mft_v2/controllers/mftTransactionDetailCtrl',
                                                'modules/mft_v2/controllers/mftTransactionItemDialogCtrl',
                                                'modules/mft_v2/controllers/mftTransactionItemDrillDialogCtrl',
                                                'modules/common/controllers/commonMetaDialogCtrl',
                                                'modules/common/controllers/commonCommandInfoDialogCtrl',
                                                //'modules/mft_v2/controllers/mftTransactionCommandCtrl,',
                                                'modules/mft_v2/controllers/mftExitDialogCtrl',
                                                'modules/mft_v2/controllers/mftExitInstructionDialogCtrl',
                                                'modules/mft_v2/directives/mftTransactionItem',
                                                'modules/mft_v2/directives/mftTransactionItemResource',
                                                'modules/mft_v2/directives/mftExitItem',
                                                'modules/mft_v2/directives/mftExitInstruction',
                                                'modules/common/directives/ui/mqaCommandItem',
                                            ])
                                        }

                                    },
                                "detailOuterContent@content":
                                    {
                                        // there is no detail panel on MFT
                                        //TODO: Remove this panel when MFT is switched over
                                        template: "<div></div>"
                                    },
                                "infoContent@content":
                                    {
                                        templateUrl: 'app/modules/mft_v2/partials/transaction-detail-summary-info.tpl.html'
                                    },
                                "operations@content":
                                    {

                                        controller: 'mftTransactionDetailOperationsCtrl',
                                        controllerAs: 'vmOperations',
                                        templateUrl: 'app/modules/mft_v2/partials/transaction-detail-operations.tpl.html',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/mft_v2/controllers/mftTransactionDetailOperationsCtrl'
                                            ])
                                        }
                                    }

                            },
                        data:
                            {
                                infoHeight:"540"
                            }

                    }
            });

            detailStates.push({
                id: "spe", viewType: 2, state:
                    {
                        url: '/spe',
                        views:
                            {
                                "widgetContent@content":
                                    {
                                        templateUrl: 'app/modules/spe/partials/transaction-detail.tpl.html',
                                        controller: 'itxTransactionDetailCtrl',
                                        controllerAs: 'vmDetail',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/spe/services/speDataSvc',
                                                'modules/spe/controllers/itxTransactionDetailCtrl',
                                                'modules/spe/controllers/itxTransactionBalancingDialogCtrl',
                                                'modules/spe/controllers/itxTransactionGWIDListDialogCtrl',
                                                'modules/spe/controllers/itxTransactionGWIDDetailDialogCtrl',
                                                'modules/spe/controllers/itxCLICtrl',
                                                'modules/spe/controllers/itxaEventDialogCtrl',
                                                'modules/spe/controllers/itxaEventListDialogCtrl',
                                                'modules/spe/controllers/speGwidDownloadCtrl',
                                                'modules/common/controllers/commonMetaDialogCtrl',
                                                'modules/common/controllers/commonCommandInfoDialogCtrl',
                                                'modules/spe/filters/speFilters',
                                                'modules/spe/directives/mqaSpeGwidGrid',
                                                'modules/spe/directives/itxGwidPayloadEditor'

                                            ])
                                        }

                                    },
                                "detailOuterContent@content":
                                    {
                                        template: "<div></div>"
                                    },
                                "infoContent@content":
                                    {
                                        templateUrl: 'app/modules/spe/partials/transaction-detail-summary-info.tpl.html'
                                    },
                                "operations@content":
                                    {
                                        /*
                                        controller: 'speTransactionDetailOperationsCtrl',
                                        templateUrl: 'app/modules/spe/partials/transaction-detail-operations.tpl.html',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([
                                                'modules/spe/controllers/speTransactionDetailOperationsCtrl'
                                            ])
                                        }

                                         */
                                        template: "<div></div>"
                                    }

                            },
                        data:
                            {
                                infoHeight:"540"
                            }

                    }
            });


            detailStates.push({id:"boomi", viewType:2, state:
                    {
                        url: '/boomi',
                        views:
                            {
                                "widgetContent@content":
                                    {
                                        controller: 'boomiTransactionDetailCtrl',
                                        controllerAs: 'vmDetail',
                                        templateUrl: 'app/modules/boomi/partials/transaction-detail.tpl.html',
                                        resolve: {
                                            deps: $couchPotatoProvider.resolveDependencies([

                                                'modules/boomi/controllers/boomiTransactionDetailCtrl',
                                                'modules/boomi/controllers/boomiTransactionDocumentListDialogCtrl',
                                                'modules/common/controllers/commonCommandInfoDialogCtrl',
                                                'modules/common/controllers/commonTimeLineDialogCtrl',
                                                'modules/common/directives/ui/mqaCommandItem',
                                                'modules/common/controllers/commonFilterListDialogCtrl',
                                                'modules/common/controllers/commonFilterEntryEditDialogCtrl',
                                                'modules/common/directives/input/mqaFilterEntryList',
                                                'modules/common/directives/input/mqaFilterEntry',
                                                'modules/boomi/services/boomiDataSvc'
                                            ])
                                        }
                                    },
                                "detailOuterContent@content":
                                    {
                                        // there is no detail panel on Boomi
                                        template:"<div></div>"
                                    },
                                "infoContent@content":
                                    {
                                        templateUrl: 'app/modules/boomi/partials/transaction-detail-summary-info.tpl.html'
                                    }
                            },
                        data:
                            {
                                infoPanelHeight: "350"
                            }
                    }});


            // return the state array
            return detailStates;
        };

        _this.createDetailRoutes = function(modulePrefix, $stateProvider, $couchProvider, baseStates)
        {
            // routine to create transaction detail routes for the given route prefix and view type
            if (!baseStates)
                 baseStates = _this.buildStates($couchProvider);

            // get the base states (abstract)
            const abstractStates = lodash.filter(baseStates, {viewType: 0});
            uiSvc.createViewStates(modulePrefix, $stateProvider, abstractStates);

            // now create the container states (jobview, docView, transactionView)
            const containers = lodash.filter(baseStates, {viewType: 1});
            uiSvc.createViewStates(modulePrefix, $stateProvider, containers);

            // now add detail the sub-detail states (meta, files, etc)
            const details = lodash.filter(baseStates, {viewType: 2});
            lodash.forEach(containers, function (containerState)
            {
                lodash.forEach(details, function (detailState)
                {
                    $stateProvider.state(modulePrefix + "." + containerState.id + "." + detailState.id, lodash.extend({}, detailState.state));
                });
            });

            // add the module event states/sub views
            const detailStates = lodash.filter(baseStates, {viewType: 3});
            lodash.forEach(detailStates, function(event)
            {
                const detailState = lodash.find(baseStates, {viewType: 2, id: event.id});
                lodash.forEach(containers, function (containerState)
                {
                    $stateProvider.state(modulePrefix + "." + containerState.id + "." + detailState.id + "." + event.stateName, lodash.extend({}, event.state));
                });

            });
        };
        //</editor-fold>

        //<editor-fold desc="Transaction">
        _this.readCommonTransaction = function(transactionId)
        {
            // routine to read the given transaction from the transaction db using its id
            return apiProvider.get(_this.moduleRoutes.DETAIL,{transactionId : transactionId})
        };

        _this.setSecurity = function(transactionRow, userSecurity)
        {
            // routine to set the security options on the given transaction based on the module and user security provided
            transactionRow.security = {repair: userSecurity.repair, resubmit: userSecurity.resubmit, cancel: userSecurity.cancel, mark: userSecurity.mark, export: userSecurity.resubmit};
            if ((transactionRow.department_id > 0) && (!userSecurity.repair && userSecurity.withinDept))
            {
                let isMember = userSvc.isMemberOfDepartment(transactionRow.department_id);
                if (isMember)
                {
                    transactionRow.security.repair = true;
                    transactionRow.security.resubmit = true;
                    transactionRow.security.export = true;

                }
            }

            // now check if should allow a repair
            if (transactionRow.security.repair)
                transactionRow.security.repair = _this.isRepairAllowed(transactionRow);
            if (transactionRow.security.resubmit)
                transactionRow.security.resubmit = _this.isResubmitAllowed(transactionRow);
            if (transactionRow.security.export)
                transactionRow.security.export = _this.isResubmitAllowed(transactionRow);

            if (transactionRow.security.cancel)
                transactionRow.security.cancel = _this.isCancelAllowed(transactionRow);
            if (transactionRow.security.mark)
                transactionRow.security.mark = _this.isMarkAllowed(transactionRow);

            // check for module specific settings
            switch (transactionRow.module)
            {

                // IIB ensure there are payloads
                case _this.moduleEnum.ACE_V2:
                case _this.moduleEnum.ACE:
                case _this.moduleEnum.IIB:
                    if (transactionRow.security.resubmit || transactionRow.security.repair || transactionRow.security.export)
                    {
                        if (transactionRow.security.resubmit)
                            transactionRow.security.resubmit = (transactionRow.resubmit_payloads > 0);
                        if (transactionRow.security.repair)
                            transactionRow.security.repair = (transactionRow.resubmit_payloads > 0);
                        if (transactionRow.security.export)
                            transactionRow.security.export = (transactionRow.payload_count > 0);
                    }
                    break;
            }
        };

        _this.calcTransactionOperations = function(transactionRow)
        {
            // routine to build the available options for the a transaction based on user permissions and status of the given transaction
            let transactionSecurity = lodash.clone(userSvc.getUserTransactionSecurity());

            if ((transactionRow.department_id > 0) && (!transactionSecurity.repair && transactionSecurity.withinDept))
            {
                let isMember = userSvc.isMemberOfDepartment(transactionRow.department_id);
                if (isMember)
                {
                    transactionSecurity.repair = true;
                    transactionSecurity.resubmit = true;
                }
            }

            // now check if should allow a repair
            if (transactionSecurity.repair)
                transactionSecurity.repair = _this.isRepairAllowed(transactionRow);
            if (transactionSecurity.resubmit)
                transactionSecurity.resubmit = _this.isResubmitAllowed(transactionRow);
            if (transactionSecurity.cancel)
                transactionSecurity.cancel = _this.isCancelAllowed(transactionRow);
            if (transactionSecurity.mark)
                transactionSecurity.mark = _this.isMarkAllowed(transactionRow);

            // now build up the operations allowed based on the module and the flags
            let returnObj = [];

            if (transactionSecurity.repair)
            {
                let click_data = {
                    ui:
                        {
                            question: "Repair Transaction " + transactionRow.transactionId,
                            class: 'text-warning',
                            icon: "fa fa-wrench",
                            description: "Repair Transaction..."
                        },
                    operation: _this.transCliInstructionEnum.REPAIR_TRANSACTION
                };
                returnObj.push(click_data);
            }
            if (transactionSecurity.resubmit)
            {
                let click_data = {
                    ui:
                        {
                            question: "Resubmit Transaction " + transactionRow.transactionId,
                            class: 'text-primary',
                            icon: "fa fa-recycle",
                            description: "Re-Submit Transaction..."
                        },
                    operation: _this.transCliInstructionEnum.RESUBMIT_TRANSACTION
                };
                returnObj.push(click_data);
            }
            if (transactionSecurity.cancel)
            {
                let click_data = _this.getCancellationClick(transactionRow.transactionId);
                returnObj.push(click_data);
            }
            if (transactionSecurity.mark)
            {
                let click_data = {
                    ui:
                        {
                            question: "Force Complete Transaction " + transactionRow.transactionId,
                            class: 'text-blueDark',
                            icon: "fa fa-minus-square",
                            description: "Force Complete Transaction..."
                        },
                    operation: _this.transCliInstructionEnum.FORCE_COMPLETE
                };
                returnObj.push(click_data);
            }
            return returnObj;
        };

        _this.getCancellationClick = function(transactionObj, title)
        {
            // routine to return the cancellation click cli request for all modules
            let click_data = {
                ui:
                    {
                        question: "Cancel Transaction",
                        class: 'txt-color-red',
                        icon: "fa fa-times-circle",
                        description: "Cancel Transaction"
                    },
                operation: _this.transCliInstructionEnum.CANCEL_TRANSACTION
            };
            let transactionIds = [];
            if (Array.isArray(transactionObj))
            {
                click_data.ui.question = "Cancel All " + title;
                click_data.ui.description = "Cancel All Transfers";
                transactionIds = transactionObj;
            }
            else
            {
                transactionIds.push(transactionObj);
                click_data.ui.question = "Cancel Transaction " + transactionObj;
                click_data.ui.description = "Cancel Transaction";

            }
            click_data.record = {transactionIds: transactionIds};
            return click_data;
        };

        _this.isCancelAllowed = function(row)
        {
            // routine to determine if transaction cancellation is allowed for the given row

            return  (row.originalStatus >= _this.transactionStatusEnum.STARTED && row.originalStatus <= _this.transactionStatusEnum.IN_PROGRESS_ERRORS)
        };
        _this.isRepairAllowed = function(row)
        {
            // routine to determine if transaction repair is allowed for the given row
            // TODO: Fix this once the rules for MFT is defined
            let baseRepair = (row.originalStatus >= _this.transactionStatusEnum.PARTIALLY_COMPLETED && row.originalStatus != _this.transactionStatusEnum.CANCELLED);
            if (!baseRepair)
            {
                if (row.mqaModule === _this.moduleEnum.ACE || row.mqaModule === _this.moduleEnum.ACE_V2 || row.mqaModule === _this.moduleEnum.IIB)
                    baseRepair = true;
            }
            return baseRepair;
        };
        _this.isResubmitAllowed = function(row)
        {
            // routine to determine if transaction resubmit is allowed for the given row
            return  (((row.originalStatus >= _this.transactionStatusEnum.COMPLETED) && (row.originalStatus < _this.transactionStatusEnum.PARTIALLY_COMPLETED)) || (row.originalStatus >= _this.transactionStatusEnum.FAILED));
        };
        _this.isMarkAllowed = function(row)
        {
            // routine to determine if force mark is allowed for the given row
            return  (row.originalStatus >= _this.transactionStatusEnum.PARTIALLY_COMPLETED && row.originalStatus != _this.transactionStatusEnum.CANCELLED);
        };
        _this.createCommonBaseTransaction = function(data)
        {
            // routine to create the base transaction for any transaction
            // this will be called by all data services when the entire transaction is read
            const returnObject = {transactionId: data.transactionId, mqaModule: data.module};
            _this.mapMongoStatus(returnObject, data.status);
            returnObject.stats = { progress: data.progress.progress_perc, totalBytes: 0, currentBytes: 0};
            returnObject.mqaTransType = data.trans_type;
            returnObject.operationType = data.operation_type;
            returnObject.mqStatus = 0;
            returnObject.totalBytes = 0;
            returnObject.stats.currentTime = data.running_time;
            returnObject.currentTime = data.running_time;
            returnObject.runTime = data.running_time;
            returnObject.sla_Class = data.sla;
            returnObject.completeDate = data.complete_date;
            returnObject.departmentId = data.department_id;
            returnObject.companyId = data.company_id;
            returnObject.transDate = data.action_date;
            returnObject.supplementalStatus = data.supplemental;
            returnObject.jobId = data.job_id;
            returnObject.originatorHost = undefined;
            returnObject.originatorUser = undefined;
            returnObject.jobName = data.name;
            if (data.module_id)
                returnObject.module_id = data.module_id;
            if (data.job && data.job.length > 0)
            {
                returnObject.jobName = data.job[0].name;
                if (data.job[0].originator) {
                    returnObject.originatorHost = data.job[0].originator.host;
                    returnObject.originatorUser = data.job[0].originator.user_id;
                }

            }
            // check for a doc type and id
            if (data.document_type && data.document_id)
            {
                returnObject.docId = data.document_id;
                returnObject.docType = data.document_type;
            }

            // check for attachments
            if (data.attachments)
            {
                returnObject.attachments = data.attachments;
            }
            returnObject.lastUpdate = data.sys_date;
            return returnObject;
        };
        _this.parseCommonTransaction = function(item)
        {
            // routine to parse a transaction for grid use across modules
            let value = null;
            if (item.action_date) {
                value = $filter("localUTCEpochDateFilter")(item.action_date, "YYYY-MM-DD HH:mm:ss.SSS");
                item.action_date = $filter("kendoDateFilter")(value);
            }
            if (item.complete_date) {
                value = $filter("localUTCStringFilter")(item.complete_date);
                item.complete_date = $filter("kendoDateFilter")(value);
            }
            if (item.sys_date) {

                value = $filter("localUTCStringFilter")(item.sys_date);
                item.sys_date = $filter("kendoDateFilter")(value);
            }

            // update the status
            _this.mapMongoStatus(item, item.status);

            // get the descriptions
            item.moduleDesc =  $filter("moduleType")(item.module);
            item.statusDesc = cacheDataSvc.getListDescription("0","TRANS_STATUS", item.status);
            item.departmentDesc = cacheDataSvc.getDepartmentDesc(item.department_id);
            item.transTypeDesc =  $filter("transType")(item.trans_type);
            item.operationDesc = $filter("operationType")(item.operation_type);

            // work out the sla
            if (item.sla)
               item.slaClassDesc = cacheDataSvc.getListDescription("1", "SLA_RULE", item.sla);
            if (!item.transactionId && item._id)
                item.transactionId = item._id;
            return item;
        };

        _this.getMongoStatus = function (status)
        {
            // routine to map the new mongo statuses to the current Status
            switch (status) {
                case _this.transactionStatusEnum.COMPLETED:
                    return 3;       // completed no SLA
                case _this.transactionStatusEnum.COMPLETED_WITHIN_SLA:
                    return 5;       // completed within SLA
                case _this.transactionStatusEnum.COMPLETED_OUTSIDE_SLA:
                    return 6;       // completed outside SLA
                case _this.transactionStatusEnum.PARTIALLY_COMPLETED:
                    return 4;       // partially completed NO SLA
                case _this.transactionStatusEnum.COMPLETED_WITHIN_SLA:
                    return 7;       // partially completed within SLA
                case _this.transactionStatusEnum.PARTIALLY_COMPLETED_OUTSIDE_SLA:
                    return 8;       // partially completed outside SLA
                default:
                    return status;
            }
        };
        _this.getMongoTransactionStatus = function(value)
        {
            // routine to return the transaction status for transactions
            const newStatus = _this.getMongoStatus(value);
            return cacheDataSvc.getListDescription("0","TRANS_STATUS", newStatus);
        };

        _this.mapMongoStatus = function (returnObject, status)
        {
            // routine to map the new mongo statuses to the current FTE Status
            returnObject.originalStatus = status;
            returnObject.status = _this.getMongoStatus(status);
            return _this.calcBootLabel(returnObject);
        };
        //</editor-fold>

        //<editor-fold desc="General Functions">
        _this.getMetaInputs = function(arr, inputFilter, mapFunction)
        {
            // routine to map the meta-inputs into an array that can be used by the API
            if (!inputFilter || !inputFilter.data || inputFilter.data.length == 0)
                return arr;
            lodash.forEach(inputFilter.data, function(row)
            {
                let mapFieldName = mapFunction(row.name);
                let metaData = {values: row.values, name: mapFieldName, operator: row.operator};
                arr.push(metaData)
            });
            return arr;
        };

        _this.mapMetaField = function(fieldName, metaFields)
        {
            // routine to return the correct meta fields
            let foundField = lodash.find(metaFields, {id: fieldName});
            if (!foundField)
                return "meta_data." + fieldName;
            else
                return foundField.field;
        };
        _this.setFilterDates = function(filterObject)
        {
            // routine used by grid reporting screens to set the dates correctly when loading from profiles
            if (typeof filterObject.startDate === 'string')
                filterObject.startDate = moment(filterObject.startDate);
            if (typeof filterObject.endDate === 'string')
                filterObject.endDate = moment(filterObject.endDate);

            if (appCustomConfig.runMode === 1)
            {
                filterObject.startDate =  moment("2022-01-06 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999});
                filterObject.endDate = moment("2012-09-07 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999});
            }

        };

        _this.transactionDrill = function(model, $scope)
        {
            // routine to handle a transaction drill on a grid view

            // save the grid state
            const record = {transactionId: model.transactionId, transactionType: model.mqaModule};
            _this.saveGridDrillState($scope, model.transactionId);

            // invoke the transaction drill
            const baseState = $state.$current.parent.parent;
            _this.navigateTransaction(baseState.name + ".transactionDetail.baseview", record);
        };

        _this.navigateTransaction = function(baseRoute, record) {
            // routine to navigate the user to the correct state for the transaction
            switch (record.transactionType)
            {
                case _this.moduleEnum.MFT:
                    $state.go(baseRoute + ".mft_v2", {transactionId: record.transactionId});
                    break;
                case _this.moduleEnum.IIB:
                case _this.moduleEnum.ACE: // IIB-V2 Transaction
                case _this.moduleEnum.ACE_V2: // IIB-V2-Meta Transaction
                    $state.go(baseRoute + ".iib_v2", {transactionId: record.transactionId});
                    break;
                case _this.moduleEnum.ITXA:
                    $state.go(baseRoute + ".spe", {transactionId: record.transactionId});
                    break;
                case _this.moduleEnum.BOOMI:
                    $state.go(baseRoute + ".boomi", {transactionId: record.transactionId});
                    break;
                default: // MFT Transaction
                    $state.go(baseRoute + ".mft_v2", {transactionId: record.transactionId});
            }
        };

        _this.updateTransactionViewModel = function(baseTransaction)
        {
            // routine to update the transaction with data specific for viewing
            baseTransaction.alertClass = "alert-" +  $filter("bootStrapStatusFilter")(baseTransaction.bootLabel);
            baseTransaction.labelClass = "label-" + $filter("bootStrapStatusFilter")(baseTransaction.bootLabel);
            baseTransaction.progressClass = "progress-bar-" + $filter("bootStrapStatusFilter")(baseTransaction.bootLabel);
            baseTransaction.progressStyle = {'width': baseTransaction.stats.progress + '%'};
            baseTransaction.statusIcon = $filter("bootStrapStatusIconFilter")(baseTransaction.bootLabel);
            baseTransaction.mqaTransTypeDesc =  $filter("transType")(baseTransaction.mqaTransType);
            baseTransaction.operationDesc = $filter('operationType')(baseTransaction.operationType);
            if (!baseTransaction.mqaModuleDesc)
            {
                baseTransaction.mqaModuleDesc = $filter("moduleType")(baseTransaction.mqaModule);
                if (baseTransaction.mqaModule == 9999 && baseTransaction.module_id != null)
                    baseTransaction.mqaModuleDesc = cacheDataSvc.getCustomModuleDesc(parseInt(baseTransaction.module_id));
            }
            baseTransaction.statusDesc = cacheDataSvc.getListDescription("0","TRANS_STATUS", baseTransaction.status);

            // work out the bytes and the rate
            baseTransaction.displayRate = $filter("kbFilter")((baseTransaction.totalBytes/baseTransaction.currentTime).toFixed(2)) + " kB/s";
            baseTransaction.runTime = $filter("secondsToStringFilter")(baseTransaction.stats.currentTime.toFixed(3));
            if (baseTransaction.completeDate)
            {
                baseTransaction.displayBytes = $filter("bytesFilter")(baseTransaction.stats.totalBytes);
            }
            else
            {
                baseTransaction.displayBytes = $filter("bytesFilter")(baseTransaction.stats.currentBytes);
            }
            if (baseTransaction.sla_Class)
                 baseTransaction.slaClassDesc = cacheDataSvc.getListDescription("1", "SLA_RULE", baseTransaction.sla_Class);
        };
        //</editor-fold>

        //<editor-fold desc="Styling">
        _this.calcBootLabel = function(returnObject)
        {
            // routine to calculate the boot label of a transaction
            returnObject.bootLabel = 3;
            if (returnObject.status >= 90)
                returnObject.bootLabel = 99;
            if (returnObject.status === 1 || returnObject.status === 2)
                returnObject.bootLabel = 1;
            if (returnObject.status === 3 || returnObject.status === 5)
                returnObject.bootLabel = 2;
            if (returnObject.status === 6)
                returnObject.bootLabel = 4;
            _this.calcRowStyle(returnObject)
        };

        _this.calcRowStyle = function (returnObject)
        {
            // routine to calculate the row style
            if (returnObject.status >= 90)
                returnObject.rowStyle = "transactionError";
            if ((returnObject.status === 4) || (returnObject.status === 7) || (returnObject.status === 8)) // partially completed
                returnObject.rowStyle = "recordUpdate";
            if (returnObject.trans_type && returnObject.trans_type > 0)
            {
                switch (returnObject.trans_type) {
                    case 1:
                        returnObject.rowStyle = "transactionResubmit";
                        break;
                    case 2:
                        returnObject.rowStyle = "transactionRepair";
                        break;
                    case 3:
                        returnObject.rowStyle = "transactionCancel";
                        break;
                }
            }
        };
        //</editor-fold>

        //<editor-fold desc="API">
        let configs = [
            {url :'common/transaction/detail', resourceName: 'commonTransDetail'},
            {url: 'common/transaction/detail/jobTree', resourceName: 'commonTransDetailJobMenu'},
            {url: 'common/transaction/detail/docTree', resourceName: 'commonTransDetailDocMenu'},
            {url: 'common/transaction/detail/attachment/:module/:mode/:id', resourceName: 'commonTransDetailAttachment', params: { module:'@module', id: '@id'}},
            {url: 'common/attachment/:module/:mode/:table/:id', resourceName: 'commonAttachmentTable', params: { module:'@module', id: '@id', table:"@table"}},
            {url: 'common/transaction/repair/attachment/:module/:mode/:id', resourceName: 'commonTransRepairAttachment', params: { module:'@module', mode: '@mode', id: '@id'}}



        ];

        angular.forEach(configs, function(value){
            apiSvc.add(value);
        });
        //</editor-fold>

    }]);
});
