/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionDashboardCtrl.js
 /// Controller to manage IIB Transaction Dashboard using the new Framework
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/01/2022
 /// </summary>
 */
define(['modules/iib_v2/module', 'moment', 'lodash'], function (module, moment, lodash) {

    "use strict";
    moment().format();

    module.registerController('iibv2TransactionDashboardCtrl', ['$scope', '$filter', '$state', 'dashboardSvc', 'iibv2DataSvc', 'uiSvc', 'cacheDataSvc', function ($scope, $filter, $state, dashboardSvc, iibv2DataSvc, uiSvc)
    {
        var _this = this;

        // user config variables
        const _tableLimitConfig = "lastLimit";
        const _appChartLimitConfig = "appChartLimit";

        // instantiate this as dashboard controller
        let dashboardConfig = {module: "iib", code:"transaction", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#transactionGrid"]};
        let dialogDetails =
        {
            templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
            controller: "iibv2TransactionDashboardFilterDialogCtrl",
            size:'lg',
            controllerAs: "vmDialog"
        };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);

        //<editor-fold desc="Dashboard Framework Overrides">
        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return iibv2DataSvc.refreshTransactionDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.buildTotalsWidget(serverData, period);
            _this.functions.buildApplicationChartWidget(serverData, period);
            if (period == 1)
                _this.functions.buildTransactionTable(serverData);
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = iibv2DataSvc.getColorPalette();
            _this.model.theme.colorArray = pal.colorArray;
            _this.model.theme.colorNames = pal.colorNames;
            //</editor-fold>
        };

        _this.functions.onInitializeWidgets = function (initialLoad)
        {
            // routine to initialize widget state variables based on load flag
            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
            {
                let pageSizes = uiSvc.getKendoPageSizes();
                _this.model.transactionTable = {label: "Jobs"};
                _this.model.transactionTable.data = [];
                _this.model.transactionTable.update = {value: 0};
                _this.model.transactionTable.options = {
                    resizable: false,
                    selectable: "row",
                    sortable: true,
                    groupable: false,
                    filterable: true,
                    columnMenu: true,
                    scrollable: true,
                    reorderable: false,
                    noRecords: true,
                    messages: {
                        noRecords: "No Records Available"
                    },
                    dataSource: {
                        pageSize: pageSizes[0],
                        sort: [
                            {field: "action_date", dir: "desc"}
                        ],
                        schema:
                            {
                                model:
                                    {
                                        id: "_id",
                                        uid: "_id",
                                        job_id: {type: "string"},
                                        job_name: {type: "string"}
                                    }
                            },
                        group: {
                            field: "job_id",
                            dir: "desc",
                            aggregates: [
                                {field: "node_count", aggregate: "sum"},
                                {field: "action_date", aggregate: "count"},
                                {field: "running_time", aggregate: "sum"}]

                        },
                        aggregate: [
                            {field: "node_count", aggregate: "sum"},
                            {field: "action_date", aggregate: "count"},
                            {field: "running_time", aggregate: "sum"}]

                    },
                    pageable:
                        {
                            pageSizes: pageSizes
                        },
                    columns: [
                        {
                            field: "job_id",
                            hidden: true,
                            groupHeaderTemplate: _this.functions.jobHeaderTemplate
                        },

                        {
                            field: "action_date",
                            title: "Transaction Date",
                            format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                            width: "200px",
                            footerTemplate: "No. of Transactions: #=count#",
                            groupFooterTemplate: "No. of Transactions: #=count#"
                        },
                        {
                            field: "name",
                            title: "Transaction Name",
                            width: "250px"
                        },
                        {
                            field: "broker_id",
                            title: "Container",
                            filterable: {
                                cell: {
                                    showOperators: false,
                                    operator: "contains",
                                    inputWidth: 160
                                }
                            }
                        },
                        {
                            field: "execution_group_id",
                            title: "Integration Server",
                            filterable: {
                                cell: {
                                    showOperators: false,
                                    operator: "contains",
                                    inputWidth: 160
                                }
                            }

                        },
                        {
                            field: "application_id",
                            title: "Application",
                            width: "250px",
                            filterable: {
                                cell: {
                                    showOperators: false,
                                    operator: "contains",
                                    inputWidth: 160
                                }
                            }

                        },
                        {
                            field: "flow_name",
                            title: "Flow",
                            filterable: {
                                cell: {
                                    showOperators: false,
                                    operator: "contains",
                                    inputWidth: 160
                                }
                            }
                        },
                        {
                            field: "node_count",
                            title: "N. Count",
                            width: "100px",
                            aggregates: ["sum"],
                            footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                            filterable: false
                        },
                        {
                            field: "running_time",
                            title: "Running Time (seconds)",
                            aggregates: ["sum"],
                            width: "250px",
                            filterable: false,
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                            footerTemplate: function (dataItem) {
                                var value;
                                if (dataItem.running_time)
                                    value = dataItem.running_time.sum;
                                else
                                    value = dataItem.sum;
                                if (value == null)
                                    return null;
                                return "<div class=\"truncate\" style=\"text-align:right\">" + $filter("secondsToStringFilter")(value.toFixed(3));
                            },
                            groupFooterTemplate: function (dataItem) {
                                var value;
                                if (dataItem.running_time)
                                    value = dataItem.running_time.sum;
                                else
                                    value = dataItem.sum;
                                if (value == null)
                                    return null;
                                return "<div class=\"truncate\" style=\"text-align:right\">" + $filter("secondsToStringFilter")(value.toFixed(3));
                            }

                        }
                    ],
                    dataBound: function (e) {
                        _this.model.transactionTable.grid = this;
                        uiSvc.dataBoundKendoGrid(_this.model.transactionTable.grid, null);

                        // remove the vertical scroll bar
                        var gridWrapper = e.sender.wrapper;
                        gridWrapper.toggleClass("no-scrollbar", true);
                    }

                };

                let moduleConfig = iibv2DataSvc.getModuleConfig();
                if (moduleConfig != null && moduleConfig.settings != null && moduleConfig.settings.loader != null && moduleConfig.settings.loader.lock_type != null && moduleConfig.settings.loader.lock_type == 0)
                {
                    _this.model.transactionTable.label = "Transactions";
                }
            }
            //</editor-fold>

            //<editor-fold desc="Counts">
            _this.model.currentData = {total: {requests: 0, run_time: 0, avg_runtime: 0, failures: 0}, history: []};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.update.value += 1;


            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData = {total: {requests: 0, run_time: 0, avg_runtime: 0, failures: 0}, history: []};
            //</editor-fold>
        };


        _this.functions.onLoad = function (userConfig)
        {
            // routine to initialize user settings for this dashboard based on the given user config at 1st load
            if (_this.model.dialogData.filter.applicationLimit == undefined)
                _this.model.dialogData.filter.applicationLimit = _this.functions.getUserSetting(userConfig, _appChartLimitConfig, 5);
            if (_this.model.dialogData.filter.recordLimit == undefined)
                _this.model.dialogData.filter.recordLimit = _this.functions.getUserSetting(userConfig, _tableLimitConfig, 20);
            if (_this.model.dialogData.filter.application == undefined)
                _this.model.dialogData.filter.application = null;
            if (_this.model.dialogData.filter.executionGroup == undefined)
                _this.model.dialogData.filter.executionGroup = null;
        };
        //</editor-fold>

        //<editor-fold desc="Widget  Management">

        //<editor-fold desc="Transaction Table">
        _this.functions.jobHeaderTemplate = function (dataItem) {
            if (_this.model.transactionTable.grid) {
                var groupRow = lodash.find(_this.model.transactionTable.grid.dataSource.view(), function (row) {
                    return row.value == dataItem.value;
                });
                return "Job Id: " + dataItem.value + " (" + groupRow.items[0].job_name + ")";
            }
        };

        _this.functions.buildTransactionTable = function(serverData)
        {
            // routine to update the transaction table
            _this.model.transactionTable.data = iibv2DataSvc.parseTransactionDashboardData(serverData.records);
        };

        _this.functions.viewTransaction  = function(record)
        {
            // routine to invoke the transaction drill
            var baseState = $state.$current.parent;
            record._id = record.transactionId;
            iibv2DataSvc.transactionDrill(record, baseState, "jobview");
        };
        //</editor-fold>

        //<editor-fold desc="Counters">
        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill
            if (data.caption == "Total Failures")
            {
                let data = {apiName:"iibv2TransactionDashboardErrors", filter: _this.functions.getCurrentFilter(), listCode: ""};
                iibv2DataSvc.showErrorSummary(data, _this.functions.viewTransaction);
            }
        };
        _this.functions.onCompareCountDrill = function(data)
        {
            // routine to manage the count drill
            if (data.caption == "Total Failures")
            {
                let data = {apiName:"iibv2TransactionDashboardErrors", filter: _this.functions.getCompareFilter(), listCode: ""};
                iibv2DataSvc.showErrorSummary(data, _this.functions.viewTransaction);
            }
        };
        _this.functions.buildTotalsWidget = function (serverData, period)
        {
            // routine to manage the refresh of the totals widget
            var updateObject = _this.model.currentData;
            if (period == 2)
                updateObject = _this.model.compareData;
            if (serverData.total == undefined)
                serverData.total = {requests: 0, run_time: 0, avg_runtime: 0, failures: 0};

            updateObject.total.requests = $filter('number')(serverData.total.requests);
            updateObject.total.run_time = $filter('number')(serverData.total.run_time, 2);
            updateObject.total.avg_runtime = $filter('number')(serverData.total.avg_runtime,2);
            updateObject.total.failures = $filter('number')(serverData.total.failures);
        };

        //</editor-fold>

        //<editor-fold desc="Application Chart">
        _this.functions.buildApplicationChartWidget = function (serverData, period)
        {
            // routine to manage the refresh of the application chart
            var updateObject = _this.model.currentData;
            if (period == 2)
                updateObject = _this.model.compareData;
            updateObject.history = serverData.history;
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
