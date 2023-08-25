/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftv2DashboardCtrl
 /// MFT v2 Dashboard Controller
 /// Controller to manage MFT Transaction Dashboard using the new Framework
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('mftv2DashboardCtrl', ['$scope', '$state', '$filter', '$timeout', 'dashboardSvc','mftv2DataSvc', function ($scope, $state, $filter, $timeout, dashboardSvc, mftv2DataSvc)
    {
        let _this = this;

        // user config variables
        const _dashboardLimitConfig = "lastLimit";


        // instantiate this as dashboard controller
        let dashboardConfig = {module: "mft", code:"core", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};

        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "mftv2DashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);

        //<editor-fold desc="Dashboard Framework Overrides">

        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return mftv2DataSvc.refreshDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.updateCounts(serverData.totals, period);

            // build the donuts
            _this.functions.buildDonut(serverData.status, 0, dashboardSvc.functions.getTransactionStatus, _this.functions.getStatusColor, period);
            _this.functions.buildDonut(serverData.template_type, 1, mftv2DataSvc.getTemplateType, null, period);
            _this.functions.buildDonut(serverData.transfer_type, 2, mftv2DataSvc.getTransferType, null, period);

            if (period == 1)
            {
                _this.functions.buildBar(_this.model.currentData.jobBar, serverData.by_job, period);
                _this.functions.buildBar(_this.model.currentData.sourceBar, serverData.by_source, period);
                _this.functions.buildBar(_this.model.currentData.destBar, serverData.by_destination, period);

            }
            else
            {
               _this.functions.buildBar(_this.model.compareData.jobBar, serverData.by_job, period);
            }
            if (period == 1)
            {
                _this.functions.buildTransactionTable(serverData.records);
                _this.functions.buildMonitorTable(serverData.monitors);
                _this.functions.buildAgentTable(serverData.agents);
                //_this.functions.buildAgentCapicity(serverData.agents);
            }
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = mftv2DataSvc.getColorPalette();
            _this.model.theme.colorArray = pal.colors;
            _this.model.theme.colorNames = pal.color;
            //</editor-fold>
        };

        _this.functions.onInitializeWidgets = function (initialLoad) {

            // routine to initialize the widget objects

            //<editor-fold desc="Common">
            if (initialLoad)
            {

                _this.chartScales = {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                callback: function(label, index, labels)
                                {
                                    return $filter('number')(label);
                                }
                            }

                        },
                        {
                            id: 'y-axis-2',  // bytes and time
                            type: 'linear',
                            display: true,
                            position: 'right',
                            ticks: {
                                beginAtZero: true,   // minimum value will be 0.
                                callback: function(label, index, labels)
                                {
                                    return $filter('number')(label);
                                }
                            }

                        }

                    ],
                };
                _this.chartTooltips = {
                    callbacks:
                        {
                            label: function(tooltipItem, data)
                            {
                                return _this.functions.getChartLabel(tooltipItem, data, true);
                            }
                        }
                };

                _this.model.groups = {};
            }
            //</editor-fold>


            //<editor-fold desc="Counts">
            _this.model.agent_counts = {started: {caption: "Running", value: 0, class:"col-md-6"}, non_started:{caption: "Not Running", value: 0, class:"col-md-6"}};
            _this.model.monitor_counts = {started: {caption: "Running", value: 0, class:"col-md-6"}, non_started:{caption: "Not Running", value: 0, class:"col-md-6"}};

            _this.model.currentData.counts = {transfer_count: {value: 0}, byte_count: {value: 0}, failure_count: {value: 0}, file_count: {value: 0}, time_count: {value: 0}, monitor_count:{value:[_this.model.monitor_counts.started, _this.model.monitor_counts.non_started]}, agent_count:{value:[_this.model.agent_counts.started, _this.model.agent_counts.non_started]}};
            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {transfer_count: {value: 0}, byte_count: {value: 0}, failure_count: {value: 0}, file_count: {value: 0}, time_count: {value: 0}};
            //</editor-fold>

            //<editor-fold desc="Capacity">
            _this.model.capacity = {source: {max: 0, value: 0}, destination: {max: 0, value: 0}, queued: {max: 0, value: 0}};
            //</editor-fold>

            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
                _this.model.transactionTable = {desc: "Transactions"};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Stopped Agent Table Widget">
            _this.model.agentTable = {};
            _this.model.agentTable.data = [];
            //</editor-fold>

            //<editor-fold desc="Stopped Monitor Table Widget">
            _this.model.monitorTable = {};
            _this.model.monitorTable.data = [];
            //</editor-fold>

            //<editor-fold desc="Job Bar">

            _this.model.currentData.jobBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.jobBar.options = {
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                tooltips: {
                    callbacks:
                        {
                            label: function(tooltipItem, data)
                            {
                                return _this.functions.getChartLabel(tooltipItem, data, false);
                            }
                        }
                }
            };
            _this.model.currentData.jobBar.options.scales = {
                xAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'bottom',
                        ticks: {
                            beginAtZero: true,
                            callback: function(label, index, labels)
                            {
                                return $filter('number')(label);
                            }
                        }

                    },
                    {
                        id: 'y-axis-2',  // bytes and time
                        type: 'linear',
                        display: true,
                        position: 'top',
                        ticks: {
                            beginAtZero: true,   // minimum value will be 0.
                            callback: function(label, index, labels)
                            {
                                return $filter('number')(label);
                            }
                        }

                    }

                ],
            };

            _this.functions.initializeBar(_this.model.currentData.jobBar, true);
            if (initialLoad)
            {
                _this.model.compareData.jobBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.jobBar.options = lodash.cloneDeep(_this.model.currentData.jobBar.options);
                _this.functions.initializeBar(_this.model.compareData.jobBar, true);
            }

            //</editor-fold>

            //<editor-fold desc="Source Agent Bar">
            _this.model.currentData.sourceBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};

            _this.model.currentData.sourceBar.options = {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                scales: _this.chartScales,
                tooltips: _this.chartTooltips

            };

            _this.functions.initializeBar(_this.model.currentData.sourceBar);
            //</editor-fold>

            //<editor-fold desc="Destination Agent Bar">
            _this.model.currentData.destBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.destBar.options = {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                scales: _this.chartScales,
                tooltips: _this.chartTooltips
            };
            _this.functions.initializeBar(_this.model.currentData.destBar);
            //</editor-fold>

            //<editor-fold desc="Donuts">
            let donuts = ["Status", "Template Type", "Transfer Type"];
            _this.model.groups.colorList = _this.model.theme.colorArray;
            _this.model.groups.colorList.push(_this.model.theme.colorNames.error);
            _this.functions.initializeDonuts(_this.model.currentData, donuts);
            if (initialLoad)
                _this.functions.initializeDonuts(_this.model.compareData, donuts);
            //</editor-fold>
        };


        _this.functions.onLoad = function (userConfig)
        {
            // routine to initialize user settings for this dashboard based on the given user config at 1st load
            if (_this.model.dialogData.filter.errors == undefined)
                _this.model.dialogData.filter.errors = false;
            if (_this.model.dialogData.filter.topCount == undefined)
                _this.model.dialogData.filter.topCount = _this.functions.getUserSetting(userConfig, _dashboardLimitConfig, 100);
            if (_this.model.dialogData.filter.tableType == undefined)
                _this.model.dialogData.filter.errors = false;   // type of grid tab to display (standard vs error)
            if (_this.model.dialogData.filter.tableType != undefined)
            {
                let tableType =  _this.model.dialogData.filter.tableType;
                if (typeof tableType === 'string')
                    tableType = parseInt(tableType);
                _this.model.dialogData.filter.errors = (tableType == 0) ? false : true;
                _this.model.dialogData.filter.tableType = undefined;
            }
            if (_this.model.dialogData.filter.barLimit == undefined)
                _this.model.dialogData.filter.barLimit = 5;
            _this.functions.setTableDescription();
        };

        _this.functions.onUserSettings = function()
        {
            // routine to set the update the table type when the user may have changed in the dialog
            _this.model.dialogData.filter.tableType = parseInt(_this.model.dialogData.filter.tableType);
            _this.functions.setTableDescription();
        };

        //</editor-fold>

        //<editor-fold desc="Widget Management">

        //<editor-fold desc="All Widgets">


        _this.functions.getChartLabel = function(tooltipItem, data, vertical)
        {
            let label = data.datasets[tooltipItem.datasetIndex].label;
            let chartValue = vertical ? tooltipItem.yLabel : tooltipItem.xLabel;
            var value = null;
            switch (label)
            {
                case "Files":
                case "Transfers":
                case "Failures":
                    value = $filter("number")(chartValue);
                    break;
                case "Bytes":
                    value = $filter('bytesFilter')(chartValue * 1024);
                    break;
                case "Run-Time":
                    value = $filter("secondsToStringFilter")(chartValue);
                    break;
            }
            if (label)
                label += ': ';
            label += value;
            return label;
        };
        //</editor-fold>

        //<editor-fold desc="Bar Chart Widgets">
        _this.functions.buildHorizBar = function(modelObj, data)
        {
            // routine to setup the dataset for the bar charts
            modelObj.transferSeries.data = [];
            modelObj.timeSeries.data = [];
            modelObj.bytesSeries.data = [];
            modelObj.errorSeries.data = [];
            modelObj.filesSeries.data = [];

            modelObj.xLabels = [];

            // build the data
            lodash.forEach(data, function(record)
            {
                modelObj.xLabels.push(record._id);
                modelObj.transferSeries.data.push(record.transfer_count);
                modelObj.timeSeries.data.push(record.time_count);
                modelObj.bytesSeries.data.push(record.byte_count);
                modelObj.errorSeries.data.push(record.failure_count);
                modelObj.filesSeries.data.push(record.file_count);
            });
            modelObj.refreshFlag.value += 1;
        };

        _this.functions.buildBar = function (modelObj, data) {
            // routine to setup the dataset for the bar chart
            modelObj.transferSeries.data = [];
            modelObj.timeSeries.data = [];
            modelObj.bytesSeries.data = [];
            modelObj.errorSeries.data = [];
            modelObj.filesSeries.data = [];

            // build the data
            lodash.forEach(data, function (record)
            {
                modelObj.transferSeries.data.push({x: record._id, y: record.transfer_count});
                modelObj.timeSeries.data.push({x: record._id, y: record.time_count});
                modelObj.bytesSeries.data.push({x: record._id, y: record.byte_count/1024});
                modelObj.errorSeries.data.push({x: record._id, y: record.failure_count});
                modelObj.filesSeries.data.push({x: record._id, y: record.file_count});
            });
            modelObj.refreshFlag.initializeBarSeriesvalue += 1;
        };

        _this.functions.initializeBar = function (modelObj, horiz)
        {
            // routine to initialize the bar graph model object
            let initVars = [
                {label: "Files", seriesName:"filesSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.files},
                {label: "Bytes", seriesName:"bytesSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.bytes},
                {label: "Run-Time", seriesName:"timeSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.time},
                {label: "Transfers", seriesName:"transferSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.transfers},
                {label: "Failures", seriesName:"errorSeries", color: _this.model.theme.colorNames.error, axis:"y-axis-1"},
            ];
            _this.functions.initializeBarSeries(initVars, modelObj, horiz);
        };
        //</editor-fold>


        //<editor-fold desc="Counters">
        _this.functions.onCountErrorDrill = function(model)
        {
            mftv2DataSvc.navigateDashboardTransaction(model.transactionId, $state.$current);
        };

        _this.functions.errorCountDrill = function(filter)
        {
            let data = {apiName:"mftv2TransactionDashboardErrors", filter: filter};
            mftv2DataSvc.showErrorSummary(data, _this.functions.onCountErrorDrill);
        };

        _this.functions.onCompareCountDrill = function(data, isCompare)
        {
            // routine to manage the count drill on the comparision side
            if (data.caption == "Total Errors")
            {
                _this.functions.errorCountDrill(_this.functions.getCompareFilter());
            }
        };

        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill on the current data
            if (data.caption == "Total Errors")
            {
                _this.functions.errorCountDrill(_this.functions.getRequestFilter());
            }
        };
        _this.functions.updateCounts = function (data, period)
        {
            // update the counts
            if (data == undefined)
                data = {transfer_count: 0, byte_count: 0, failure_count: 0, file_count: 0, time_count: 0};
            var updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;

            updateObject.transfer_count.value = $filter("number")(data.transfer_count);
            updateObject.failure_count.value = $filter("number")(data.failure_count);
            updateObject.file_count.value = $filter("number")(data.file_count);
            updateObject.byte_count.value = $filter("bytesFilter")(data.byte_count);
            updateObject.time_count.value = $filter("secondsToStringFilter")(data.time_count);
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.buildTransactionTable = function (data)
        {
            _this.model.transactionTable.data = mftv2DataSvc.parseTransactionGridData(data);
        };
        _this.functions.switchTab = function(errors)
        {
            // invoke a redraw of the main transaction tab
            $timeout(function()
            {
                _this.model.dialogData.filter.errors = errors;
                _this.functions.setTableDescription();
                _this.functions.refreshData();
            },300);
        };
        _this.functions.setTableDescription = function()
        {
            // routine to set the table description based on the table type
            _this.model.transactionTable.desc = _this.model.dialogData.filter.errors ? "Errors" : "Transactions";

            // update the table type
            _this.model.tableType = 0;
            if (!_this.model.dialogData.filter.errors)
                _this.model.tableType = 1;
            if (_this.model.dialogData.filter.errors)
                _this.model.tableType = 2;
            if (_this.model.dialogData.filter.jobGroup)
                _this.model.tableType = _this.model.tableType + 2;
            _this.model.dialogData.filter.tableType = _this.model.dialogData.filter.errors ? 1 : 0;
        }
        //</editor-fold>

        //<editor-fold desc="Monitor Widgets">
        _this.functions.buildMonitorTable = function(serverData)
        {
            // routine to look at the monitor data from the server and break it down by status and give only the errors
            let deleted  = lodash.find(serverData, {id:"99"});
            let started = lodash.find(serverData, {id: "1"});
            let total = lodash.sumBy(serverData, function(o)
            {
                return o.count;
            });
            if (!started)
                started = {count: 0};
            if (!deleted)
                deleted = {count: 0};
            _this.model.monitor_counts.non_started.value = $filter('number')(total - started.count - deleted.count);
            _this.model.monitor_counts.started.value = $filter('number')(started.count);

            // filter out the monitors that are stopped
            /*
            _this.model.monitorTable.data = lodash.filter(serverData, function(row)
            {
                return row.status != 1 && row.status != 99;     // exclude started or deleted;
            });
             */
        };
        //</editor-fold>

        //<editor-fold desc="Agent Widgets">
        _this.functions.buildAgentTable = function(serverData)
        {
            // routine to look at the agent data from the server and break it down by status and give only the errors
            let deleted  = lodash.find(serverData, {id:"99"});
            let started = lodash.find(serverData, {id: "1"});
            let total = lodash.sumBy(serverData, function(o)
            {
                return o.count;
            });
            if (!started)
                started = {count: 0};
            if (!deleted)
                deleted = {count: 0};
            _this.model.agent_counts.non_started.value = $filter('number')(total - started.count - deleted.count);
            _this.model.agent_counts.started.value = $filter('number')(started.count);

            // filter out the agents that are stopped
            /*
            _this.model.agentTable.data = lodash.filter(serverData, function(row)
            {
                return row.status != 1 && row.status != 99;     // exclude started or deleted;
            });
             */


        };
        _this.functions.buildAgentCapacity = function(serverData)
        {
            // routine to determine the agent capacity and see if the capacity is amount to be exceeded
            let updateObject = _this.model.capacity;

            updateObject.source.max = 0;
            updateObject.source.value = 0;
            updateObject.destination.max = 0;
            updateObject.destination.value = 0;
            updateObject.queued.max = 0;
            updateObject.queued.value = 0;
            lodash.forEach(serverData, function(agentRow)
            {
                if (agentRow.limits)
                {
                    if (agentRow.maxQueuedTransfers)
                        updateObject.queued.max += parseInt(agentRow.maxQueuedTransfers);
                    if (agentRow.maxSourceTransfers)
                        updateObject.source.max += parseInt(agentRow.maxSourceTransfers);
                    if (agentRow.maxDestinationTransfers)
                        updateObject.destination.max += parseInt(agentRow.maxDestinationTransfers);
                    if (agentRow.source_transfers != null)
                    {
                        updateObject.source.value += agentRow.source_transfers.length;
                        updateObject.queued.value += lodash.filter(function(row)
                        {
                            return row.transfer_state === "WaitingForDestinationCapacity";
                        }).length;
                    }
                    if (agentRow.destination_transfers != null)
                        updateObject.destination.value += agentRow.destination_transfers.length;
                }
            })
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
