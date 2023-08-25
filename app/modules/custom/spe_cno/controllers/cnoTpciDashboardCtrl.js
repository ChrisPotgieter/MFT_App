/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciDashboardCtrl.js
 /// CNO Third Party Commission Intake Dashboard Controller
 /// Handles both Enrollments and Commissions

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/05/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('cnoTpciDashboardCtrl', ['$scope', '$filter', 'dashboardSvc','speCNODataSvc', function ($scope, $filter, dashboardSvc, dataSvc)
    {

        let _this = this;

        // module
        let _module = dataSvc.getTPCIDepartment();
        _this.functions = {};
        _this.functions.getDateSelectorOptions = function()
        {
            // routine to return the date selector options
            let returnarr = [];
            returnarr.push({caption: "Current Day", value: {time: 0, measure: 'minutes', allowChange: false, startDay: true, endDay: true, preventRefresh: false}});
            returnarr.push({caption: "Yesterday", value: {time: 1, measure: "days", allowChange: false, startDay: true, subtractEnd: true, endDay: true, preventRefresh: true}});
            returnarr.push({caption: "Custom", value: {time: 0, measure: 'day', allowChange: true, startDay: false, endDay: false, preventRefresh: true}});
            return returnarr;
        };



        // user config variable
        const _dashboardLimitConfig = "lastLimit";

        // instantiate this as dashboard controller
        let dashboardConfig = {module: "cno_tpci", code: _module.code, hasCompare: true};
        dashboardConfig.timeButtons = _this.functions.getDateSelectorOptions();
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};
        dashboardConfig.selector = {refresh: 0, time: 0, compare: 0};
        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "cnoTpciDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);
        _this.model.module = _module.id;

        //<editor-fold desc="Dashboard Framework Overrides">

        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return dataSvc.refreshTPCIDashboard(requestFilter, _module.id);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.updateCounts(serverData.total, serverData.by_vendor, period);

            // build the donuts
            _this.functions.buildDonut(serverData.by_vendor, 0, null, null, period);
            _this.functions.buildDonut(serverData.by_status, 1, dataSvc.getTPCITransactionStatus, _this.functions.getStatusColor, period);
            _this.functions.buildDonut(serverData.by_system, 2, null, null, period);

            if (period == 1)
            {
                _this.functions.buildBar(_this.model.currentData.vendorBar, serverData.by_vendor, period);
                _this.functions.buildBar(_this.model.currentData.stateBar, serverData.by_state, period);
            }
            else
            {
                _this.functions.buildBar(_this.model.compareData.vendorBar, serverData.by_vendor, period);
                _this.functions.buildBar(_this.model.compareData.stateBar, serverData.by_state, period);
            }
            if (period == 1)
            {
                _this.functions.buildTransactionTable(serverData.records);
            }
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = dataSvc.getTPCIDashboardColorPalette(_module.id);
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
                            id: 'y-axis-2',  // value
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
            _this.model.currentData.counts = {requests: {value: 0}, successful: {value: 0}, failed: {value: 0}, vendors: {value: 0}, premium: {value: 0}, amount:{value: 0}};
            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {requests: {value: 0}, successful: {value: 0}, failed: {value: 0}, vendors: {value: 0}, premium: {value: 0}, amount:{value: 0}};
            //</editor-fold>

            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
                _this.model.transactionTable = {};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Vendor Bar">

            _this.model.currentData.vendorBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.vendorBar.options = {
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
                                return _this.functions.getChartLabel(_this.model.currentData.vendorBar, tooltipItem, data, false);
                            }
                        }
                }
            };
            _this.model.currentData.vendorBar.options.scales = {
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
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'top',
                        ticks: {
                            beginAtZero: true,
                            callback: function(label, index, labels)
                            {
                                return $filter('number')(label);
                            }
                        }

                    }

                ]
            };

            _this.functions.initializeBar(_this.model.currentData.vendorBar, true);
            if (initialLoad)
            {
                _this.model.compareData.vendorBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.vendorBar.options = lodash.cloneDeep(_this.model.currentData.vendorBar.options);
                _this.model.compareData.vendorBar.options.tooltips.callbacks.label = function(tooltipItem, data)
                {
                    return _this.functions.getChartLabel(_this.model.compareData.vendorBar, tooltipItem, data, false);
                };
                _this.functions.initializeBar(_this.model.compareData.vendorBar, true);
            }

            //</editor-fold>

            //<editor-fold desc="State Bar">

            _this.model.currentData.stateBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.stateBar.options = {
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
                                return _this.functions.getChartLabel(_this.model.currentData.stateBar, tooltipItem, data, false);
                            }
                        }
                }
            };
            _this.model.currentData.stateBar.options.scales = {
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
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'top',
                        ticks: {
                            beginAtZero: true,
                            callback: function(label, index, labels)
                            {
                                return $filter('number')(label);
                            }
                        }

                    }
                ]
            };

            _this.functions.initializeBar(_this.model.currentData.stateBar, true);
            if (initialLoad)
            {
                _this.model.compareData.stateBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.stateBar.options = lodash.cloneDeep(_this.model.currentData.stateBar.options);
                _this.model.compareData.stateBar.options.tooltips.callbacks.label = function(tooltipItem, data)
                {
                    return _this.functions.getChartLabel(_this.model.compareData.stateBar, tooltipItem, data, false);
                };

                _this.functions.initializeBar(_this.model.compareData.stateBar, true);
            }

            //</editor-fold>


            //<editor-fold desc="Donuts">
            let donuts = ["Company", "Status", "System"];
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
            if (_this.model.dialogData.filter.barLimit == undefined)
                _this.model.dialogData.filter.barLimit = 5;
            if (_this.model.dialogData.filter.errors == undefined)
                _this.model.dialogData.filter.errors = true;
            _this.model.dialogData.filter.module = _module.id;
        };


        //</editor-fold>

        //<editor-fold desc="Widget Management">

        //<editor-fold desc="All Widgets">
        _this.functions.getChartLabel = function(sourceData, tooltipItem, data, vertical)
        {
            let label = data.datasets[tooltipItem.datasetIndex].label;
            let chartValue = vertical ? tooltipItem.yLabel : tooltipItem.xLabel;
            let value = null;
            let otherValue = null;
            switch (label)
            {
                case "Transactions":
                case "Succeeded":
                case "Errors":
                    value = $filter("number")(chartValue);
                    break;
            }
            if (label)
                label += ': ';
            label += value;
            if (otherValue != null)
                label += " (" + otherValue + ")";
            return label;
        };
        //</editor-fold>

        //<editor-fold desc="Bar Chart Widgets">

        _this.functions.buildBar = function (modelObj, data) {
            // routine to setup the dataset for the bar chart
            modelObj.requestSeries.data = [];
            modelObj.succeedSeries.data = [];
            modelObj.failedSeries.data = [];

            // build the data
            lodash.forEach(data, function (record)
            {
                modelObj.requestSeries.data.push({x: record._id, y: record.count});
                modelObj.succeedSeries.data.push({x: record._id, y: record.successful});
                modelObj.failedSeries.data.push({x: record._id, y: record.failed});
            });
            modelObj.refreshFlag.value += 1;
        };

        _this.functions.initializeBar = function (modelObj, horiz)
        {
            // routine to initialize the bar graph model object
            let initVars = [
                {label: "Transactions", seriesName:"requestSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.requests},
                {label: "Succeeded", seriesName:"succeedSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.success},
                {label: "Errors", seriesName:"failedSeries", color: _this.model.theme.colorNames.error, axis:"y-axis-1"}
            ];

            _this.functions.initializeBarSeries(initVars, modelObj, horiz);
        };
        //</editor-fold>

        //<editor-fold desc="Counters">
        _this.functions.onCompareCountDrill = function(data)
        {
            // routine to manage the count drill on the comparision side
            return dataSvc.onTPCICountDrill(data, _this.functions.getCompareFilter());
        };

        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill on the current data
            return dataSvc.onTPCICountDrill(data, _this.functions.getRequestFilter());
        };
        _this.functions.updateCounts = function (data, vendorData, period)
        {
            // routine to update the counts
            let updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;
            dataSvc.parseTPCICountData(data, vendorData, updateObject, _module.id);
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.buildTransactionTable = function (data)
        {
            _this.model.transactionTable.data = dataSvc.parseTPCIGridData(data, _module.id);
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
