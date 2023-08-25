/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateDashboardCtrl.js
 /// Controller to manage XML Sign WMQ Gateway Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2022
 /// </summary>
 */

define(['modules/bridge/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('xmlSignWMQGateDashboardCtrl', ['$scope', '$filter', '$timeout', 'dashboardSvc','bridgeDataSvc', function ($scope, $filter, $timeout, dashboardSvc, bridgeDataSvc)
    {
        var _this = this;

        // user config variables
        const _dashboardLimitConfig = "lastLimit";


        // instantiate this as dashboard controller
        let dashboardConfig = {module: "bridge.xmlsign_wmq_gate", code:"core", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};
        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "xmlSignWMQGateDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);

        //<editor-fold desc="Dashboard Framework Overrides">

        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            requestFilter.direction = 1;
            return bridgeDataSvc.refreshXMLSignWMQGateDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.updateCounts(serverData.totals, period);

            // build the donuts
            _this.functions.buildDonut(serverData.status, 0, bridgeDataSvc.getTransactionStatus, _this.functions.getStatusColor, period);
            _this.functions.buildDonut(serverData.by_party, 1, null, null, period);

            if (period == 1)
                _this.functions.buildBar(_this.model.currentData.listenerBar, serverData.by_listener, period);
            else
               _this.functions.buildBar(_this.model.compareData.listenerBar, serverData.by_listener, period);
            if (period == 1)
            {
                _this.functions.buildTransactionTable(serverData.records);
            }
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = bridgeDataSvc.getXMLSignWMQGateColorPalette();
            _this.model.theme.colorArray = pal.colorArray;
            _this.model.theme.colorNames = pal.colorNames;
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

            //<editor-fold desc="Counts">
            _this.model.currentData.counts = {requests: {value: 0}, succeeded: {value: 0}, failed: {value: 0}, run_time: {value: 0}, avg_runtime: {value: 0}};
            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {requests: {value: 0}, succeeded: {value: 0}, failed: {value: 0}, run_time: {value: 0}, avg_runtime: {value: 0}};
            //</editor-fold>

            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
                _this.model.transactionTable = {};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Listener Bar">

            _this.model.currentData.listenerBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.listenerBar.options = {
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
            _this.model.currentData.listenerBar.options.scales = {
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

            _this.functions.initializeBar(_this.model.currentData.listenerBar, true);
            if (initialLoad)
            {
                _this.model.compareData.listenerBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.listenerBar.options = lodash.cloneDeep(_this.model.currentData.listenerBar.options);
                _this.functions.initializeBar(_this.model.compareData.listenerBar, true);
            }

            //</editor-fold>

            //<editor-fold desc="Donuts">
            let donuts = ["Status", "Party"];
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
            if (_this.model.dialogData.filter.topCount == undefined)
                _this.model.dialogData.filter.topCount = _this.functions.getUserSetting(userConfig, _dashboardLimitConfig, 100);
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
                case "Requests":
                case "Succeeded":
                case "Failed":
                    value = $filter("number")(chartValue);
                    break;
                case "Sent Bytes":
                case "Received Bytes":
                    value = $filter('bytesFilter')(chartValue * 1024);
                    break;
                case "Run-Time":
                case "Processing-Time":
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

        _this.functions.buildBar = function (modelObj, data) {
            // routine to setup the dataset for the bar chart
            modelObj.requestSeries.data = [];
            modelObj.succeedSeries.data = [];
            modelObj.failedSeries.data = [];
            modelObj.sentBytesSeries.data = [];
            modelObj.receivedBytesSeries.data = [];
            modelObj.runTimeSeries.data = [];
            modelObj.procTimeSeries.data = [];

            // build the data
            lodash.forEach(data, function (record)
            {
                modelObj.requestSeries.data.push({x: record._id, y: record.count});
                modelObj.succeedSeries.data.push({x: record._id, y: record.succeeded});
                modelObj.failedSeries.data.push({x: record._id, y: record.failed});
                modelObj.sentBytesSeries.data.push({x: record._id, y: record.sent_bytes/1024});
                modelObj.receivedBytesSeries.data.push({x: record._id, y: record.received_bytes/1024});
                modelObj.runTimeSeries.data.push({x: record._id, y: record.run_time});
                modelObj.procTimeSeries.data.push({x: record._id, y: record.processing_time});
            });
            modelObj.refreshFlag.value += 1;
        };

        _this.functions.initializeBar = function (modelObj, horiz)
        {
            // routine to initialize the bar graph model object
            let initVars = [
                {label: "Requests", seriesName:"requestSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.requests},
                {label: "Succeeded", seriesName:"succeedSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.success},
                {label: "Failed", seriesName:"failedSeries", color: _this.model.theme.colorNames.error, axis:"y-axis-1"},
                {label: "Sent Bytes", seriesName:"sentBytesSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.send_bytes},
                {label: "Received Bytes", seriesName:"receivedBytesSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.receive_bytes},
                {label: "Run-Time", seriesName:"runTimeSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.time},
                {label: "Processing-Time", seriesName:"procTimeSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.proc_time}
            ];
            _this.functions.initializeBarSeries(initVars, modelObj, horiz);
        };
        //</editor-fold>

        //<editor-fold desc="Counters">
        _this.functions.updateCounts = function (arrData, period)
        {
            // routine to update the counts
            let updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;
            let data = undefined;
            if (arrData.length > 0)
                data = arrData[0];
            if (data == undefined)
                data = {count: 0, succeeded: 0, failed: 0, run_time: 0, avg_runtime: 0};
            bridgeDataSvc.parseXMLSignCountData(data, updateObject);
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.buildTransactionTable = function (data)
        {
            _this.model.transactionTable.data = bridgeDataSvc.parseXMLSignWMQGateGridData(data);
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
