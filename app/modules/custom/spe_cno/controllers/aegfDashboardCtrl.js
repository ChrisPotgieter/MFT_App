/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfDashboardCtrl.js
 /// CNO Automated Employer Group Dashboard Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/06/2023
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('aegfDashboardCtrl', ['$scope', '$filter', '$state', 'dashboardSvc','speCNODataSvc', function ($scope, $filter, $state, dashboardSvc, dataSvc)
    {

        let _this = this;

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

        // user config variables
        const _tableLimitConfig = "lastLimit";
        const _procChartLimitConfig = "chartLimit";


        // instantiate this as dashboard controller
        let dashboardConfig = {module: "aegf", code: "core", hasCompare: false};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};
        dashboardConfig.timeButtons = _this.functions.getDateSelectorOptions();
        dashboardConfig.selector = {refresh: 0, time: 0, compare: 0};
        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "aegfDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };

        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);


        //<editor-fold desc="Dashboard Framework Overrides">
        _this.functions.onRequestFilter = function(currentFilter)
        {
            // set the grouping filter correctly
            currentFilter.masterGroup = currentFilter.grouping.group;
            currentFilter.sub_groups = currentFilter.grouping.sub_groups;
            delete  currentFilter.grouping;
        };


        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return dataSvc.aegf.functions.refreshDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.updateCounts(serverData.totals, period);

            // build the donuts
            _this.functions.buildDonut(serverData.by_status, 0, dashboardSvc.functions.getTransactionStatus, _this.functions.getStatusColor, period);
            _this.functions.buildDonut(serverData.by_module_status, 1, dataSvc.aegf.functions.getModuleStatus, null, period);
            _this.functions.buildDonut(serverData.by_execution, 2, dataSvc.aegf.functions.getExecutionType, null, period);

            // build the bars
            _this.functions.buildBar(_this.model.currentData.employerBar, serverData.by_employer, period);

            // build the tables
            if (period == 1)
            {
                _this.functions.buildTables(serverData.records, serverData.scheduled, serverData.pay_expire);
            }


        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = dataSvc.aegf.functions.getColorPalette();
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
                            position: 'bottom',
                            ticks: {
                                beginAtZero: true,
                                callback: function(label, index, labels)
                                {
                                    return label
                                }
                            }

                        },
                    ]
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
            _this.model.currentData.counts = {requests: {value: 0}, successful: {value: 0}, failed: {value: 0}, scheduled: {value: 0}};
            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {requests: {value: 0}, successful: {value: 0}, failed: {value: 0}};
            //</editor-fold>

            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
                _this.model.transactionTable = {};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.refresh = {value: 0};
            _this.model.transactionTable.functionManager = {};
            _this.model.transactionTable.functionManager.viewPayload = function(id, format)
            {
                let record = {attachment_id: id, attachment_format: format, icon: "fa-paperclip"};
                dataSvc.aegf.functions.viewDocument(record);

            };
            _this.model.transactionTable.functionManager.refresh = function()
            {
                _this.functions.refreshData();
            };
            _this.model.transactionTable.functionManager.viewDefinition = function(id)
            {
                // routine to navigate the user to the definition
                dataSvc.aegf.functions.viewDefinition(id);
            };
            //</editor-fold>

            //<editor-fold desc="Scheduled Table Widget">
            if (initialLoad)
                _this.model.scheduleTable = {};
            _this.model.scheduleTable.data = [];
            _this.model.scheduleTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Pay Period Table Widget">
            if (initialLoad)
                _this.model.payPeriodTable = {};
            _this.model.payPeriodTable.data = [];
            _this.model.payPeriodTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Employer Bar">
            _this.model.currentData.employerBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.employerBar.options = {
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                tooltips: _this.chartTooltips,
                scales: _this.chartScales
            };


            _this.functions.initializeBar(_this.model.currentData.employerBar, false);
            if (initialLoad)
            {
                _this.model.compareData.employerBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.employerBar.options = lodash.cloneDeep(_this.model.currentData.employerBar.options);
                _this.model.compareData.employerBar.options.tooltips.callbacks.label = function(tooltipItem, data)
                {
                    return _this.functions.getChartLabel(_this.model.compareData.employerBar, tooltipItem, data, false);
                };
                _this.functions.initializeBar(_this.model.compareData.employerBar, false);
            }

            //</editor-fold>

            //<editor-fold desc="Donuts">
            let donuts = ["Status", "Processing Status","Execution Type"];
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
                _this.model.dialogData.filter.topCount = _this.functions.getUserSetting(userConfig, _tableLimitConfig, 100);

            if (_this.model.dialogData.filter.barLimit == undefined)
                _this.model.dialogData.filter.barLimit = _this.functions.getUserSetting(userConfig, _procChartLimitConfig, 5);

            if (_this.model.dialogData.filter.errors == undefined)
                _this.model.dialogData.filter.errors = false;
            if (_this.model.dialogData.filter.grouping == undefined)
                _this.model.dialogData.filter.grouping = {group: null, sub_groups:[]};
            _this.functions.setTableDescription();
        };
        _this.functions.onUserSettings = function()
        {
            // routine to set the update the table type when the user may have changed in the dialog
            _this.functions.setTableDescription();
        };


        //</editor-fold>

        //<editor-fold desc="Widget Management">

        //<editor-fold desc="All Widgets">
        _this.functions.getChartLabel = function(tooltipItem, data, vertical)
        {
            let label = data.datasets[tooltipItem.datasetIndex].label;
            let chartValue = vertical ? tooltipItem.yLabel : tooltipItem.xLabel;
            let value = null;
            let otherValue = null;
            switch (label)
            {
                case "Executions":
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
                let descObj = dataSvc.aegf.functions.getGroupDescriptions(record._id.toString(), null);
                let name = descObj.groupDesc;
                modelObj.requestSeries.data.push({x: name, y: record.count});
                modelObj.succeedSeries.data.push({x: name, y: record.successful});
                modelObj.failedSeries.data.push({x: name, y: record.failed});
            });
            modelObj.refreshFlag.value += 1;
        };

        _this.functions.initializeBar = function (modelObj, horiz)
        {
            // routine to initialize the bar graph model object
            let initVars = [
                {label: "Executions", seriesName:"requestSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.requests},
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

            return null;
        };

        _this.functions.onCountDrill = function(data)
        {
            // routine to manage the count drill on the current data
            return null;
        };
        _this.functions.updateCounts = function (data, period)
        {
            // routine to update the counts
            let updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;
            dataSvc.aegf.functions.parseCountData(data, 0, updateObject);
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.setTableDescription = function()
        {
            // routine to set the table description based on the table type
            _this.model.transactionTable.desc =  _this.model.dialogData.filter.errors ? "Errors": "Executions";
        };

        _this.functions.buildTables = function (transactionData, scheduleData, periodData)
        {
            if (!scheduleData)
                scheduleData = [];
            if (!periodData)
                periodData = [];
            dataSvc.aegf.functions.getLists().then(function()
            {

                _this.model.transactionTable.data = dataSvc.aegf.functions.parseExecutionData(transactionData);
                _this.model.transactionTable.refresh.value += 1;

                _this.model.scheduleTable.data = dataSvc.aegf.functions.parseScheduledGridData(scheduleData);
                _this.model.scheduleTable.refresh.value += 1;
                _this.model.currentData.counts.scheduled.value = $filter("number")(scheduleData.length);


                _this.model.payPeriodTable.data = dataSvc.aegf.functions.parsePayPeriodGridData(periodData);
                _this.model.payPeriodTable.refresh.value += 1;
            });

        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});

