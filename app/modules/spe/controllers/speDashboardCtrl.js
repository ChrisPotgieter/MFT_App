/*
 /// <summary>
 /// app.modules.spe.controllers - speDashboardCtrl.js
 /// Controller to manage ITXA Transaction Dashboard using the new Framework
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'moment'], function (module, lodash, moment) {

    "use strict";
    moment().format();

    module.registerController('speDashboardCtrl', ['$scope', '$filter', '$log',  '$timeout', 'dashboardSvc', 'chartSvc', 'speDataSvc', 'uiSvc', function ($scope, $filter, $log, $timeout, dashboardSvc, chartSvc, speDataSvc, uiSvc)
    {
        var _this = this;
        _this.functions = {};

        // user config variables
        const  _dashboardLimitConfig = "lastLimit";
        const  _dashboardGroupConfig = "groupType";

        // instantiate this as dashboard controller
        let dashboardConfig = {module: "spe", code:"transaction", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};

        dashboardConfig.selector = {time: 3};   // Default is Current Day


        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "speDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);

        //<editor-fold desc="Dashboard Framework Overrides">
        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return speDataSvc.refreshDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.functions.buildCounts(serverData, period);
            _this.functions.buildDonuts(serverData, period);
            if (period == 1)
            {
                _this.functions.buildTransactionTable(serverData);
                _this.functions.buildMapChartWidget(serverData);
                _this.functions.buildEventChart(serverData);
                _this.functions.buildEventBar(serverData);
            }
        };
        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = speDataSvc.getColorPalette();
            _this.model.theme.colorArray = pal.colorArray;
            _this.model.theme.colorNames = pal.colorNames;
            _this.model.groups = {};
            _this.model.groups.colorList = _this.model.theme.colorArray;
        };

        _this.functions.onInitializeWidgets = function (initialLoad)
        {

            //<editor-fold desc="Counts">
            if (initialLoad)
            {
                _this.model.currentData.sender_receiver_counts = {senders: {caption: "Senders", value: 0, class:"col-md-6"}, receivers:{caption: "Receivers", value: 0, class:"col-md-6"}};
                _this.model.currentData.map_doc_counts = {maps: {caption: "Maps", value: 0, class:"col-md-6"}, documents:{caption: "Document Types", value: 0, class:"col-md-6"}};


                _this.model.compareData.sender_receiver_counts = {senders: {caption: "Senders", value: 0, class:"col-md-6"}, receivers:{caption: "Receivers", value: 0, class:"col-md-6"}};
                _this.model.compareData.map_doc_counts = {maps: {caption: "Maps", value: 0, class:"col-md-6"}, documents:{caption: "Document Types", value: 0, class:"col-md-6"}};

                _this.model.compareData.counts = {transfer_count: {value: 0}, failure_count: {value: 0}, sender_receiver_count:{value:[_this.model.compareData.sender_receiver_counts.senders, _this.model.compareData.sender_receiver_counts.receivers]}, map_doc_count:{value:[_this.model.compareData.map_doc_counts.maps, _this.model.compareData.map_doc_counts.documents]}};

            }
            _this.model.currentData.counts = {transfer_count: {value: 0}, failure_count: {value: 0}, sender_receiver_count:{value:[_this.model.currentData.sender_receiver_counts.senders, _this.model.currentData.sender_receiver_counts.receivers]}, map_doc_count:{value:[_this.model.currentData.map_doc_counts.maps, _this.model.currentData.map_doc_counts.documents]}};
            //</editor-fold>


            //<editor-fold desc="Event Bar">
            if (initialLoad) {
                _this.model.eventBar = {series: [], update: {value: 0}, options: {}};
                _this.model.eventBar.series.push({
                    label: "Acknowledgements",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.ack}},
                    serverCode: "ack"
                });
                _this.model.eventBar.series.push({
                    label: "Envelopes",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.envelope}},
                    serverCode: "envelopes"
                });
                _this.model.eventBar.series.push({
                    label: "De-Envelopes",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.de_envelope}},
                    serverCode: "denvelopes"
                });
                _this.model.eventBar.series.push({
                    label: "Transforms",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.transform}},
                    serverCode: "transforms"
                });
                _this.model.eventBar.series.push({
                    label: "Errors",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.error}},
                    serverCode: "errors"
                });
                _this.model.eventBar.series.push({
                    label: "TS Segments",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.ts_segment}},
                    serverCode: "ts_segments"
                });
                _this.model.eventBar.series.push({
                    label: "GS Segments",
                    data: [],
                    options: {flotJS: {color: _this.model.theme.colorNames.gs_segment}},
                    serverCode: "gs_segments"
                });

                _this.model.eventBar.options = {
                    bars: {
                        show: true,
                        barWidth: 0.5,
                        align: "center",
                        lineWidth: 2,
                        fill: 1.0
                    },

                    grid: {
                        show: true,
                        hoverable: true,
                        clickable: true,
                        tickColor: "#efefef",
                        borderWidth: 0,
                        borderColor: "#DDD"
                    },
                    legend: false,
                    tooltip: true,
                    tooltipOpts: {
                        content: "<b>%x</b> = <span>%y</span>",
                        defaultTheme: false
                    }
                };
                _this.model.eventBar.options.xaxis = function () {
                    var returnObject = {ticks: []};
                    returnObject.ticks = lodash.map(_this.model.eventBar.series, function (series, index) {
                        return [index, series.label];
                    });
                    return returnObject;
                }();
            }
            //</editor-fold>

            //<editor-fold desc="Top Maps">
            _this.model.eventGroupings = {maps:[]};
            //</editor-fold>

            //<editor-fold desc="Donuts">
            _this.functions.initializeDonuts(_this.model.currentData);
            if (initialLoad)
                _this.functions.initializeDonuts(_this.model.compareData);
            //</editor-fold>

            //<editor-fold desc="Transaction Table">
            if (initialLoad)
                _this.model.transactionTable = {desc: "Transactions", mode: 2};
            _this.model.transactionTable.refresh = {value: 0};
            _this.model.transactionTable.data = [];

            //</editor-fold>

            //<editor-fold desc="Event Feed">

            //<editor-fold desc="Event Feed Chart">


            // initialize the charting on the event feed
            if (initialLoad)
            {
                _this.model.eventFeed = {};

                // initialize the overall metrics on the event feed

                //<editor-fold desc="Event Feed Metrics">
                _this.model.eventFeed.metrics = {};
                _this.model.eventFeed.metrics.total = {value: 0};
                _this.model.eventFeed.metrics.outbound = {value: 0, progressStyle: "width:0px"};
                _this.model.eventFeed.metrics.inbound = {value: 0, progressStyle: "width:0px"};
                _this.model.eventFeed.metrics.errors = {value: 0, progressStyle: "width:0px"};
                _this.model.eventFeed.metrics.success = {value: 0, progressStyle: "width:0px"};
                //</editor-fold>

                _this.model.eventFeed.chart = {};
                _this.model.eventFeed.chart.series = [];
                _this.model.eventFeed.chart.options = {


                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1,
                            fill: false,
                            fillColor: {
                                colors: [
                                    {
                                        opacity: 0.4
                                    },
                                    {
                                        opacity: 0.8
                                    }
                                ]
                            },
                            steps: false

                        },
                        points: {
                            show: true
                        }
                    },
                    grid: {
                        hoverable: true,
                        clickable: true
                    },
                    tooltip : true,
                    tooltipOpts : {
                        content : "<span style='color: %c;'><b>%s</b></span>  on %x was %y",
                        xDateFormat : "%Y-%m-%d-%H:%M:%S",
                        defaultTheme : false
                    },
                    xaxis: {
                        mode: "time",
                        timezone: "browser",
                        axisLabel: "Time",
                        timeFormat: chartSvc.buildFlotTimeAxisFormat("1m")
                    },
                    yaxis: {
                        min: 0,
                        max: 15,
                        axisLabel: "Event"
                    },
                    legend: {
                        labelBoxBorderColor: chartSvc.colors.chartBorderColor,
                        margin:3
                    }
                };

                _this.model.eventFeed.chart.options.colors = _this.model.theme.colorArray;
                _this.model.eventFeed.chart.update = {value: 0};

                // envelope series
                _this.model.eventFeed.chart.envelope = {label: "Envelopes", options:{}, data:[]};
                _this.model.eventFeed.chart.envelope.options.flotJS = {color: _this.model.theme.colorNames.envelope};
                _this.model.eventFeed.chart.series.push(_this.model.eventFeed.chart.envelope);

                // de-envelope series
                _this.model.eventFeed.chart.denvelop = {label: "De-Envelopes", options:{}, data:[]};
                _this.model.eventFeed.chart.denvelop.options.flotJS = {color: _this.model.theme.colorNames.de_envelope};
                _this.model.eventFeed.chart.series.push(_this.model.eventFeed.chart.denvelop);

                //  error series
                _this.model.eventFeed.chart.error = {label: "Errors", options:{}, data:[]};
                _this.model.eventFeed.chart.error.options.flotJS = { color: _this.model.theme.colorNames.error };
                _this.model.eventFeed.chart.series.push(_this.model.eventFeed.chart.error);

                // acknowledgement series
                //_this.model.eventFeed.chart.ack = {label: "Acknowledgements", options:{}, data:[]};
                //_this.model.eventFeed.chart.ack.options.flotJS = {color: _this.model.theme.colorNames.ack};
                //_this.model.eventFeed.chart.series.push(_this.model.eventFeed.chart.ack);

                // acknowledgement series
                _this.model.eventFeed.chart.transforms = {label: "Transforms", options:{}, data:[]};
                _this.model.eventFeed.chart.transforms.options.flotJS = {color: _this.model.theme.colorNames.transform};
                _this.model.eventFeed.chart.series.push(_this.model.eventFeed.chart.transforms);

                //</editor-fold>

                //<editor-fold desc="Event Feed Dials">
                _this.model.eventFeed.dials = [];
                var baseConfig =  {
                    innerStyle: "percent percent-sign",
                    changeIcon: "fa fa-minus",
                    inner:  $filter("number")(0, 0),
                    change: {lastValue: 0, value: 0, perc: $filter("number")(0, 0) + "%", labelStyle:"label bg-color-blueDark", style:"fa fa-minus"},
                    chartData: [], chartConfig:{}
                };
                angular.copy(chartSvc.sparkLineBase.line, baseConfig.chartConfig);
                baseConfig.chartConfig.height = "33px";
                baseConfig.chartConfig.type = "line";
                baseConfig.chartConfig.width = "70px";
                baseConfig.chartConfig.fillColor = "transparent";


                var dialObject = {"title": "ERRORS", style: {color: _this.model.theme.colorNames.error}, color: _this.model.theme.colorNames.error};
                angular.merge(dialObject, baseConfig);
                _this.model.eventFeed.dials.push(dialObject);
                dialObject = {"title": "ENVELOPE", style: {color: _this.model.theme.colorNames.envelope}, color: _this.model.theme.colorNames.envelope};
                angular.merge(dialObject, baseConfig);
                _this.model.eventFeed.dials.push(dialObject);
                dialObject = {"title": "DE-ENVELOPE", style: {color: _this.model.theme.colorNames.de_envelope}, color: _this.model.theme.colorNames.de_envelope};
                angular.merge(dialObject, baseConfig);
                _this.model.eventFeed.dials.push(dialObject);
                //dialObject = {"title": "ACKNOWLEDGE", style: {color: _this.model.theme.colorNames.ack}, color: _this.model.theme.colorNames.ack};
                dialObject = {"title": "TRANSFORMS", style: {color: _this.model.theme.colorNames.transform}, color: _this.model.theme.colorNames.transform};
                angular.merge(dialObject, baseConfig);
                _this.model.eventFeed.dials.push(dialObject);

            }
            else
            {
                // reset the values
                lodash.forEach(_this.model.eventFeed.dials, function(dial)
                {
                    dial.change.lastValue = 0;
                    dial.change.value = 0;
                    dial.chartData = [];
                });
                lodash.forOwn(_this.model.eventFeed.metrics, function(prop)
                {
                    if (prop.value)
                        prop.value = 0;
                });

            }
            //</editor-fold>

            //</editor-fold>
        };

        _this.functions.onLoad = function (userConfig)
        {
            // routine to initialize user settings for this dashboard based on the given user config at 1st load
            if (_this.model.dialogData.filter.topCount == undefined)
                _this.model.dialogData.filter.topCount = _this.functions.getUserSetting(userConfig, _dashboardLimitConfig, 100);
            if (_this.model.dialogData.filter.jobGroup == undefined)
                _this.model.dialogData.filter.jobGroup = _this.functions.getUserSetting(userConfig, _dashboardGroupConfig, false);   // type of grid grouping display (job vs transaction)
            _this.functions.setTableMode();
        };

        _this.functions.onUserSettings = function()
        {
            // routine to set the update the table type when the user may have changed in the dialog
            _this.functions.setTableMode();
        };

        _this.functions.onRequestFilter = function(currentFilter)
        {
            // set the dynamic filter
            if (!_this.model.dynamicFilterObject)
                _this.model.dynamicFilterObject = {};
            _this.model.dynamicFilterObject.fromDate = currentFilter.fromDate;
            _this.model.dynamicFilterObject.toDate =  currentFilter.toDate;

            if (currentFilter.lastFromDate != null)
                currentFilter.lastToDate = moment().set({second: 59, millisecond: 999});
        };

        _this.functions.onServerRequestComplete = function(currentFilter)
        {
            // routine to set the last from date after a successful refresh
            _this.model.dialogData.filter.lastFromDate = moment();
            _this.model.updateType = dashboardSvc.dashboardStates.REALTIME;
        };

        //</editor-fold>

        //<editor-fold desc="Widget Management">

        //<editor-fold desc="Counts">
        _this.functions.buildCounts = function (data, period)
        {
            // update the counts
            if (data.totals == undefined || data.totals.length == 0 )
                data.totals = [{transfer_count: 0, failure_count: 0}];
            if (!data.groups)
                data.groups = {docTypes:[], senders:[], receivers:[]};
            if (!data.map)
                data.map = [];

            let updateObject = _this.model.currentData;
            if (period == 2)
                updateObject = _this.model.compareData;

            updateObject.counts.transfer_count.value = $filter("number")(data.totals[0].transfer_count);
            updateObject.counts.failure_count.value = $filter("number")(data.totals[0].failure_count);
            updateObject.sender_receiver_counts.senders.value = $filter('number')(data.groups.senders.length);
            updateObject.sender_receiver_counts.receivers.value = $filter('number')(data.groups.receivers.length);
            updateObject.map_doc_counts.documents.value = $filter('number')(data.groups.docTypes.length);
            if (data.map.length == 1 && data.map[0].total == 0)
                updateObject.map_doc_counts.maps.value = 0;
            else
                updateObject.map_doc_counts.maps.value = $filter('number')(data.map.length);
        };
        //</editor-fold>


        //<editor-fold desc="Event Bar">
        _this.functions.buildEventBar = function(serverData)
        {
            // now loop through the data and create a flot bar data structure -
            if (serverData.events != null)
            {
                // update each series
                lodash.forEach(_this.model.eventBar.series, function(series, index)
                {
                    // update the data element
                    series.data = [];
                    var value = [index, 0];
                    var serverValue = serverData.events[series.serverCode];
                    if (serverValue)
                        value[1] = parseInt(serverValue);
                    series.data.push(value);
                });
            }
            _this.model.eventBar.update.value += 1;
        };
        //</editor-fold>


        //<editor-fold desc="Top Maps">
        _this.functions.buildMapChartWidget = function (serverData)
        {
            // routine to manage the refresh of the application chart
            _this.model.eventGroupings.maps = lodash.take(serverData.map, 10);
        };
        //</editor-fold>

        //<editor-fold desc="Donuts">

        _this.functions.initializeDonuts = function(dataObject)
        {
            // routine to initialize the data objects
            dataObject.groups = {data: []};
            dataObject.groups.data.push({title:"Senders", serverProperty:"senders", chartData:[]});
            dataObject.groups.data.push({title:"Receivers", serverProperty:"receivers", chartData:[]});
            dataObject.groups.data.push({title:"Document Types", serverProperty: "docTypes", chartData:[]});
            dataObject.groups.update = {value: 0};

        }
        _this.functions.switchTab = function(tabid)
        {
            // invoke a redraw of the event feeds
            $timeout(function()
            {
                if (tabid == "metrics")
                    _this.model.eventFeed.chart.update.value += 1;
                if (tabid == "groups")
                    _this.model.currentData.groups.update.value += 1;
            },300);
        };

        _this.functions.buildDonuts = function(serverData, period)
        {
            // routine to merge the different grouping data
            var updateObject = _this.model.currentData.groups;
            if (period == 2)
                updateObject = _this.model.compareData.groups;

            lodash.forEach(updateObject.data, function(group)
            {
                //  get the data for the server property
                var serverCollection = serverData.groups[group.serverProperty];
                if (serverCollection)
                {
                    // we have data for the selected property now update the chart data
                    group.chartData = [];
                    lodash.forEach(serverCollection, function(dataRow)
                    {
                        // try and find the record in the current dashboard chart
                        if (dataRow.value > 0)
                             group.chartData.push({label: dataRow.label, value: dataRow.value});
                    });
                }
            });
            updateObject.update.value += 1;
        };
        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.setTableMode = function()
        {
            // routine to set the table description based on the table type
            _this.model.transactionTable.mode = _this.model.dialogData.filter.jobGroup ? 3: 2;
            _this.model.dialogData.filter.lastFromDate = null;  // get the full period
            _this.model.updateType = dashboardSvc.dashboardStates.INITIALIZE;
        };

        _this.functions.buildTransactionTable = function(serverData)
        {
            // routine to massage the data for dashboard grid use
            var data = speDataSvc.parseKendoGridData(serverData.records);
            _this.model.transactionTable.data = data;
        };
        //</editor-fold>

        //<editor-fold desc="Event Feed">
        _this.functions.buildEventChart = function(serverData)
        {
            // routine to append or redraw the event chart
            var varianceData = serverData.timeline;
            var eventData = serverData.events;
            var total = eventData.total;
            if (!total)
                total = 100;

           // update the chart series
           lodash.forEach(varianceData, function(varianceRecord)
           {
               var unixDate = uiSvc.getUnixDate(varianceRecord._id);
               _this.model.eventFeed.chart.envelope.data.push({x: unixDate, y: parseInt(varianceRecord.envelopes)});
               _this.model.eventFeed.chart.denvelop.data.push({x: unixDate, y: parseInt(varianceRecord.denvelopes)});
               _this.model.eventFeed.chart.error.data.push({x: unixDate, y: parseInt(varianceRecord.errors)});
               _this.model.eventFeed.chart.transforms.data.push({x: unixDate, y: parseInt(varianceRecord.transforms)});
               //_this.model.eventFeed.chart.ack.data.push({x: unixDate, y: parseInt(varianceRecord.ack)});
           }) ;

            _this.model.eventFeed.chart.update.value += 1;

            // update the dials
          _this.functions.updateDial("ERRORS", parseInt(eventData.errors), total);
          _this.functions.updateDial("ENVELOPE", parseInt(eventData.envelopes), total);
          _this.functions.updateDial("DE-ENVELOPE", parseInt(eventData.denvelopes), total);
          _this.functions.updateDial("TRANSFORMS", parseInt(eventData.transforms), total);
          //_this.functions.updateDial("ACKNOWLEDGE", parseInt(eventData.ack), total);

            // update the metrics
            _this.model.eventFeed.metrics.total.value = total;
            _this.functions.updateMetric(_this.model.eventFeed.metrics.outbound, eventData.outbound, total);
            _this.functions.updateMetric(_this.model.eventFeed.metrics.inbound, eventData.inbound, total);
            _this.functions.updateMetric(_this.model.eventFeed.metrics.errors, eventData.errors, total);
            _this.functions.updateMetric(_this.model.eventFeed.metrics.success, eventData.success, total);
        };

        _this.functions.updateMetric = function (dataObject, value, total)
        {
            // routine to sum up all the data in the given series and then add this summed value to the dataObject based on real-time flag
            dataObject.value = value;
            if (total)
            {
                var perc = $filter("number")(((dataObject.value / total) * 100), 2);
                dataObject.progressPerc = perc + '%';
            }
        };


        _this.functions.updateDial = function (name, value, totalValue)
       {
            // routine to update the dial for a given metric as a percentage of the total value
            // also update the change information
            var dialObject = lodash.find(_this.model.eventFeed.dials, {title: name});
            if (dialObject == null)
                return;

            // now work out the percentage of the total
            dialObject.perc = $filter("number")(((value / totalValue) * 100), 0);
            dialObject.inner = dialObject.perc;


            // now update the change information
            if (dialObject.lastValue != undefined) {
                dialObject.change.value = value - dialObject.lastValue;
                if (dialObject.change.value > 0) {
                    dialObject.changeIcon = "fa fa-caret-up";
                    dialObject.change.labelStyle = "label bg-color-green";
                    dialObject.change.style = "fa fa-caret-up icon-color-good";
                }
                if (dialObject.change.value == 0)
                {
                    dialObject.changeIcon = "fa fa-minus";
                    dialObject.change.labelStyle = "label bg-color-blueDark";
                    dialObject.change.style = "fa fa-minus";
                }
                if (dialObject.change.value < 0)
                {
                    dialObject.changeIcon = "fa fa-caret-down";
                    dialObject.change.labelStyle = "label bg-color-red";
                    dialObject.change.style = "fa fa-caret-down icon-color-bad";
                }
                if (dialObject.title == "ERRORS" && dialObject.change.value > 0)
                {
                    dialObject.change.labelStyle = "label bg-color-red";
                    dialObject.change.style = "fa fa-caret-up icon-color-bad";
                }


                // update the chart against this dial
                if (dialObject.chartData) {
                    if (dialObject.chartData.length > 10)
                        dialObject.chartData.shift();
                    dialObject.chartData.push(dialObject.change.value);
                }

                // work out the perc change since the last value
                dialObject.change.perc = $filter("number")(((dialObject.change.value / dialObject.lastValue) * 100), 0) + "%";
            }
            dialObject.lastValue = value;
        };
        //</editor-fold>

        //</editor-fold>

        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();
    }]);
});
