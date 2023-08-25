/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiDashboardCtrl
 /// Controller to manage BOOMI Dashboard using the new Framework
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */

define(['modules/boomi/module', 'moment', 'lodash'], function (module, moment, lodash) {

    "use strict";
    moment().format();

    module.registerController('boomiDashboardCtrl', ['$scope', '$filter', '$state', 'dashboardSvc', 'boomiDataSvc', function ($scope, $filter, $state, dashboardSvc, dataSvc)
    {
        var _this = this;
        _this.functions = {};

        // user config variables
        const _tableLimitConfig = "lastLimit";
        const _procChartLimitConfig = "procChartLimit";


        // instantiate this as dashboard controller
        let dashboardConfig = {module: "boomi", code: "core", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};
        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "boomiDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);

        //<editor-fold desc="Dashboard Framework Overrides">
        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return dataSvc.refreshDashboard(requestFilter);
        };
        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.updateCounts(serverData.total, period);
            if (period == 1)
            {
                _this.functions.buildTransactionTable(serverData);
                _this.functions.refreshAtomWidgets(serverData.atoms);

                _this.functions.buildBar(_this.model.currentData.processBar, serverData.by_process, period);
                _this.functions.buildBar(_this.model.currentData.atomBar, serverData.by_atom, period);
            }
            else
            {
                _this.functions.buildBar(_this.model.compareData.processBar, serverData.by_process, period);
                _this.functions.buildBar(_this.model.compareData.atomBar, serverData.by_atom, period);
            }
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            var pal = dataSvc.getColorPalette();
            _this.model.theme.colorArray = pal.colorArray;
            _this.model.theme.colorNames = pal.colorNames;
        };
        _this.functions.onInitializeWidgets = function (initialLoad)
        {
            // routine to initialize the widget objects

            //<editor-fold desc="Common">
            if (initialLoad)
            {
                _this.model.tableType = 1;
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
            _this.model.atom_counts = {started: {caption: "Online", value: 0, class:"col-md-4"}, non_started:{caption: "Offline", value: 0, class:"col-md-4"}, errored:{caption: "Problem", value: 0, class:"col-md-4"}};
            _this.model.process_counts = {started: {caption: "Listening", value: 0, class:"col-md-4"}, non_started:{caption: "Paused", value: 0, class:"col-md-4"}, errored:{caption: "In-Error", value: 0, class:"col-md-4"}};

            _this.model.currentData.counts = {transfer_count: {value: 0}, byte_count: {value: 0}, doc_count: {value: 0}, failure_count: {value: 0},  time_count: {value: 0}};
            _this.model.currentData.counts.atom_count = {value:[_this.model.atom_counts.started, _this.model.atom_counts.non_started, _this.model.atom_counts.errored]};
            _this.model.currentData.counts.process_count = {value:[_this.model.process_counts.started, _this.model.process_counts.non_started, _this.model.process_counts.errored]};

            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {transfer_count: {value: 0}, byte_count: {value: 0}, doc_count: {value: 0}, failure_count: {value: 0},  time_count: {value: 0}};
            //</editor-fold>

            //<editor-fold desc="Atom Table Widget">
            if (initialLoad)
                _this.model.atomTable = {};
            _this.model.atomTable.data = [];
            _this.model.atomTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Process Table Widget">
            if (initialLoad)
                _this.model.processTable = {};
            _this.model.processTable.data = [];
            _this.model.processTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Transaction Table Widget">
            if (initialLoad)
                _this.model.transactionTable = {desc: "Transactions"};
            _this.model.transactionTable.data = [];
            _this.model.transactionTable.refresh = {value: 0};
            //</editor-fold>

            //<editor-fold desc="Process Bar">

            _this.model.currentData.processBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.processBar.options = {
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
            _this.model.currentData.processBar.options.scales = {
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

            _this.functions.initializeBar(_this.model.currentData.processBar, true);
            if (initialLoad)
            {
                _this.model.compareData.processBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.processBar.options = lodash.cloneDeep(_this.model.currentData.processBar.options);
                _this.functions.initializeBar(_this.model.compareData.processBar, true);
            }

            //</editor-fold>

            //<editor-fold desc="Atom Bar">
            _this.model.currentData.atomBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
            _this.model.currentData.atomBar.options = {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                scales: _this.chartScales,
                tooltips: _this.chartTooltips

            };
            _this.functions.initializeBar(_this.model.currentData.atomBar);
            if (initialLoad)
            {
                _this.model.compareData.atomBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.atomBar.options = lodash.cloneDeep(_this.model.currentData.atomBar.options);
                _this.functions.initializeBar(_this.model.compareData.atomBar, true);
            }
            //</editor-fold>

            //<editor-fold desc="Donuts">
            let donuts = ["Atom Type"];
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
            if (_this.model.dialogData.filter.recordLimit == undefined)
                _this.model.dialogData.filter.recordLimit = _this.functions.getUserSetting(userConfig, _tableLimitConfig, 100);

            if (_this.model.dialogData.filter.processLimit == undefined)
                _this.model.dialogData.filter.processLimit = _this.functions.getUserSetting(userConfig, _procChartLimitConfig, 5);
            _this.functions.setTableDescription();
        };
        _this.functions.onUserSettings = function()
        {
            // routine to set the update the table type when the user may have changed in the dialog
            _this.functions.setTableDescription();
        };


        //</editor-fold>

        //<editor-fold desc="Widget Data Management">

        //<editor-fold desc="All Widgets">


        _this.functions.getChartLabel = function(tooltipItem, data, vertical)
        {
            let label = data.datasets[tooltipItem.datasetIndex].label;
            let chartValue = vertical ? tooltipItem.yLabel : tooltipItem.xLabel;
            var value = null;
            switch (label)
            {
                case "Transactions":
                case "Failures":
                case "Documents":
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

        _this.functions.buildBar = function (modelObj, data) {
            // routine to setup the dataset for the bar chart
            modelObj.transactionSeries.data = [];
            modelObj.timeSeries.data = [];
            modelObj.bytesSeries.data = [];
            modelObj.errorSeries.data = [];
            modelObj.docsSeries.data = [];

            // build the data

            lodash.forEach(data, function (record)
            {
                let id = record._id;
                modelObj.transactionSeries.data.push({x: id, y: record.requests});
                modelObj.timeSeries.data.push({x: record._id, y: record.time_count});
                modelObj.bytesSeries.data.push({x: record._id, y: record.incoming_bytes/1024});
                modelObj.errorSeries.data.push({x: record._id, y: record.failure_count});
                modelObj.docsSeries.data.push({x: record._id, y: record.incoming_docs});
            });
            modelObj.refreshFlag.value += 1;
        };

        _this.functions.initializeBar = function (modelObj, horiz)
        {
            // routine to initialize the bar graph model object
            let initVars = [
                {label: "Documents", seriesName:"docsSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.documents},
                {label: "Bytes", seriesName:"bytesSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.bytes},
                {label: "Run-Time", seriesName:"timeSeries", axis: "y-axis-2",  color: _this.model.theme.colorNames.time},
                {label: "Transactions", seriesName:"transactionSeries", axis:"y-axis-1", color: _this.model.theme.colorNames.transfers},
                {label: "Failures", seriesName:"errorSeries", color: _this.model.theme.colorNames.error, axis:"y-axis-1"},
            ];
            _this.functions.initializeBarSeries(initVars, modelObj, horiz);
        };
        //</editor-fold>


        //<editor-fold desc="Counters">
        _this.functions.updateCounts = function (data, period)
        {
            // update the counts
            if (data == undefined)
                data = {requests: 0, total_bytes: 0, failure_count: 0, incoming_docs: 0, time_count: 0};
            var updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;

            updateObject.transfer_count.value = $filter("number")(data.requests);
            updateObject.failure_count.value = $filter("number")(data.failure_count);
            updateObject.doc_count.value = $filter("number")(data.incoming_docs);
            updateObject.byte_count.value = $filter("bytesFilter")(data.total_bytes);
            updateObject.time_count.value = $filter("secondsToStringFilter")(data.time_count);
        };
        //</editor-fold>


        //<editor-fold desc="Transaction Table">
        _this.functions.buildTransactionTable = function(serverData)
        {
            // routine to update the transaction table
            _this.model.transactionTable.data = dataSvc.parseTransactionGridData(serverData.records);
        };
        _this.functions.setTableDescription = function()
        {
            // routine to set the table description based on the table type
            _this.model.transactionTable.desc = "Transactions";

            // update the table type
            _this.model.tableType = 1;
            if (_this.model.dialogData.filter.jobGroup)
                _this.model.tableType = 3;
        };

        //</editor-fold>

        //<editor-fold desc="Atom Widgets">
        _this.functions.refreshAtomDonut = function(serverData)
        {

            let atomTypes = lodash.chain(serverData).groupBy('type').map(function (items, type)
            {
                return {_id: parseInt(type), count: items.length};
            }).value();
            _this.functions.buildDonut(atomTypes, 0, dataSvc.getAtomType, null, 1);
        };

        _this.functions.buildAtomProcessTable = function(serverData)
        {
            // next build up a list of processes from atom data
            let processes = [];
            let processAtoms = lodash.filter(serverData, function(record)
            {
                return record.processes != null;
            });
            lodash.forEach(processAtoms, function (record)
            {
                processes = lodash.concat(processes, record.processes);
            });

            let processData = dataSvc.parseAtomProcessData(processes);
            _this.functions.buildAtomDataTable(processData, _this.model.process_counts, _this.model.processTable);
            _this.model.processTable.refresh.value += 1;
        };

        _this.functions.buildAtomTable = function(serverData)
        {
            // routine to build atom list as a table
            let atomData = dataSvc.parseAtomGridData(serverData);
            _this.functions.buildAtomDataTable(atomData, _this.model.atom_counts, _this.model.atomTable);
            _this.model.atomTable.refresh.value += 1;
        };

        _this.functions.refreshAtomWidgets = function(serverData)
        {
            // routine to refresh all atom based widgets with the given data
            _this.functions.refreshAtomDonut(serverData);
            _this.functions.buildAtomProcessTable(serverData);
            _this.functions.buildAtomTable(serverData);
        };

        _this.functions.buildAtomDataTable = function(serverData, countObj, tableObject, filterFunction)
        {
            // routine to look at the atom deployed process data monitor data from the server and break it down by status and give only the errors
            let online = lodash.filter(serverData, {status: 1}).length;
            let offline = lodash.filter(serverData, {status: 0}).length;
            let warning = lodash.filter(serverData, {status: 90}).length;

            countObj.started.value = $filter('number')(online);
            countObj.non_started.value = $filter('number')(offline);
            countObj.errored.value = $filter('number')(warning);

            // filter out the processes that are not listening
            tableObject.data = serverData;
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
