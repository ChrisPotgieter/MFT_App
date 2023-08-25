/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedDashboardCtrl
 /// SPE InstaMed Extension
 /// Core Dashboard Controller to Manage the Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 05/04/2020
 /// </summary>
 */

define(['modules/spe/module', 'moment', 'lodash', 'appCustomConfig'], function (module, moment, lodash) {

    "use strict";
    moment().format();

    module.registerController('speInstaMedDashboardCtrl', ['$scope', '$filter',  'dashboardSvc','speInstamedDataSvc', function ($scope, $filter,  dashboardSvc, speInstamedDataSvc) {
        let _this = this;


        //<editor-fold desc="Dashboard Framework Selectors">
        // setup the custom date selectors
        _this.functions = {};

        _this.functions.getDateSelectorOptions = function()
        {
            // routine to return the date selector options
            let returnarr = [];
            returnarr.push({caption: "Current Week", value: {time: 0, measure: 'minutes', allowChange: false, startDay: true, endDay: true, preventRefresh: false, startWeek: -2}});
            returnarr.push({caption: "Custom", value: {time: 0, measure: 'day', allowChange: true, startDay: false, endDay: false, preventRefresh: true}});
            return returnarr;
        };

        _this.functions.getCompareOptions = function()
        {
            // routine to return the comparision selector options
            let returnarr = [];
            returnarr.push({caption: "No Comparison", value: {time: -1, measure: 'days', allowChange: false, startDay: true, endDay: true}});
            returnarr.push({caption: "Last Week", value: {time: 7, measure: "days", allowChange: false, startDay: true, endDay: true, type: "Last Week", startWeek: -2, endWeek: -3, subtractEnd: true}});
            returnarr.push({caption: "Custom", value: {time: 0, measure: 'day', allowChange: true}});
            return returnarr;
        };
        //</editor-fold>

        // user config variables
        const _dashboardLimitConfig = "lastLimit";
        let titles = speInstamedDataSvc.getProcTitles();


        // instantiate this as dashboard controller
        let dashboardConfig = {module: "spe_instamed", code:"core", hasCompare: true};
        dashboardConfig.widgetStatus = {current:["#griddisplay"]};
        dashboardConfig.timeButtons = _this.functions.getDateSelectorOptions();
        dashboardConfig.compareButtons = _this.functions.getCompareOptions();
        dashboardConfig.selector = {refresh: 0, time: 0, compare: 0};
        let dialogDetails =
            {
                templateUrl:"app/modules/common/partials/common-dashboard-filter-dialog.tpl.html",
                controller: "speInstaMedDashboardFilterDialogCtrl",
                size:'lg',
                controllerAs: "vmDialog"
            };
        dashboardSvc.functions.initializeDashboardController(_this, $scope, dashboardConfig, dialogDetails);


        //<editor-fold desc="Dashboard Framework Overrides">

        _this.functions.performServerRequest = function (requestFilter)
        {
            // routine to return a promise of the request a refresh of the data from the server
            return speInstamedDataSvc.refreshDashboard(requestFilter);
        };

        _this.functions.parseServerData = function (serverData, period)
        {
            // routine to parse the data received from the server into a dataobject required for the view
            _this.model.orgDesc = (_this.model.dialogData.filter.holdingCompany != null) ? titles.division: titles.holdingCompany;

            _this.functions.updateCounts(serverData.total, period);
            _this.functions.buildDonut(serverData.p_status, 1, speInstamedDataSvc.getPaymentStatus, null, period);
            _this.functions.buildDonut(serverData.p_method, 0, speInstamedDataSvc.getPaymentMethod, null, period);
            if (period == 1)
            {
                _this.functions.buildBar(_this.model.currentData.periodBar, serverData.by_day, period);
                _this.functions.buildBar(_this.model.currentData.orgBar, serverData.by_org, period);
                _this.functions.buildTransactionTable(serverData.records);
            }
            else
            {
                _this.functions.buildBar(_this.model.compareData.periodBar, serverData.by_day, period);
                _this.functions.buildBar(_this.model.compareData.orgBar, serverData.by_org, period);
            }
        };

        _this.functions.onInitializeTheme = function()
        {
            // initialize the theme
            let pal = speInstamedDataSvc.getColorPalette();
            _this.model.theme.colorArray = pal.colorArray;
            _this.model.theme.colorNames = pal.colorNames;
            //</editor-fold>
        };

        _this.functions.onInitializeWidgets = function (initialLoad) {

            // routine to initialize the widget objects

            //<editor-fold desc="Counts">
            _this.model.currentData.counts = {claimCount: {value: 0}, paidCount: {value: 0}, rejectCount: {value: 0}, responseCount: {value: 0}, nonComplianceCount: {value: 0}, preEditClaimCount: {value: 0}, idfToBeReceivedCount: {value: 0}, paymentCount:{value: 0}};
            if (initialLoad) // only during initial load not during dashboard refresh's
                _this.model.compareData.counts = {claimCount:{value :0}, paidCount: {value: 0}, rejectCount: {value: 0}, responseCount: {value: 0}, nonComplianceCount: {value: 0}, preEditClaimCount: {value: 0}, idfToBeReceivedCount: {value: 0}, paymentCount:{value: 0}};
            //</editor-fold>

            //<editor-fold desc="Transaction Table">
            if (initialLoad)
                _this.model.transactionTable = {};
            _this.model.transactionTable.data = [];
            //</editor-fold>

            //<editor-fold desc="Period Bar">
            if (initialLoad)
            {
                _this.model.currentData.periodBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.currentData.periodBar.options = {
                    responsive: true,
                    hoverMode: 'index',
                    stacked: false,
                    legend: {
                        display: true,
                    },
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-1',  // requests and errors
                                type: 'linear',
                                display: true,
                                position: 'left',
                                ticks: {
                                    beginAtZero: true   // minimum value will be 0.
                                }

                            }
                        ]
                    },
                    tooltips: {
                        callbacks:{
                            label: function(tooltipItem, data)
                            {
                                return _this.functions.getChartLabel(_this.model.currentData.periodBar, tooltipItem, data);
                            }
                        }
                    }
                };
                _this.functions.initializeBar(_this.model.currentData.periodBar);

                _this.model.compareData.periodBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.periodBar.options = lodash.cloneDeep(_this.model.currentData.periodBar.options);
                _this.model.compareData.periodBar.options.tooltips = {
                    callbacks:{
                        label: function(tooltipItem, data)
                        {
                            return _this.functions.getChartLabel(_this.model.compareData.periodBar, tooltipItem, data);
                        }
                    }
                };

                _this.functions.initializeBar(_this.model.compareData.periodBar);
            }

            //</editor-fold>

            //<editor-fold desc="Org Bar">
            if (initialLoad)
            {
                _this.model.currentData.orgBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.currentData.orgBar.options = {
                    responsive: true,
                    hoverMode: 'index',
                    stacked: false,
                    legend: {
                        display: true,
                    },
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-1',  // requests and errors
                                type: 'linear',
                                display: true,
                                position: 'left',
                                ticks: {
                                    beginAtZero: true   // minimum value will be 0.
                                }

                            }
                        ]
                    },
                    tooltips: {
                        callbacks:{
                            label: function(tooltipItem, data)
                            {
                                return _this.functions.getChartLabel(_this.model.currentData.orgBar, tooltipItem, data);
                            }
                        }
                    }

                };
                _this.functions.initializeBar(_this.model.currentData.orgBar);

                _this.model.compareData.orgBar = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                _this.model.compareData.orgBar.options = lodash.cloneDeep(_this.model.currentData.periodBar.options);
                _this.model.compareData.periodBar.options.tooltips = {
                    callbacks:{
                        label: function(tooltipItem, data)
                        {
                            return _this.functions.getChartLabel(_this.model.compareData.orgBar, tooltipItem, data);
                        }
                    }
                };

                _this.functions.initializeBar(_this.model.compareData.orgBar);
            }
            //</editor-fold>

            //<editor-fold desc="Donuts">
            /*
            _this.model.paymentPie = {data:[], labels:[], options:{
                    legend: {
                        display: true,
                        labels: {
                            fontColor: 'rgb(255, 99, 132)'
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true,
                    segmentShowStroke: true,
                    segmentStrokeColor: "#fff",
                    segmentStrokeWidth: 2,
                    animationSteps: 100,
                    animationEasing: "easeOutBounce",
                    animateRotate: true,
                    animateScale: false,
                    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
                }};
            */

            // set the colors
            if (initialLoad)
            {
                _this.model.groups = {};
                _this.model.groups.colorList = lodash.cloneDeep(_this.model.theme.colorArray);
                _this.model.groups.colorList.push(_this.model.theme.colorNames.error);
                _this.model.groups.colorList.push(_this.model.theme.colorNames.unk);

                _this.model.currentData.groups = {data: []};
                _this.model.currentData.groups.update = {value: 0};

                _this.model.currentData.groups.data.push({title: "Payments", chartData: []});
                _this.model.currentData.groups.data.push({title: "Status", chartData: []});

                _this.model.compareData.groups = {data: []};
                _this.model.compareData.groups.data.push({title: "Payments", chartData: []});
                _this.model.compareData.groups.data.push({title: "Status", chartData: []});
                _this.model.compareData.groups.update = {value: 0};
            }
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

        //<editor-fold desc="Counts">
        _this.functions.updateCounts = function (data, period)
        {
            // update the counts
            if (data == undefined)
                data = {claimCount: 0, partnerCount: 0, rejectCount: 0, responseCount: 0, nonComplianceCount: 0, preEditClaimCount: 0, paymentCount: 0, paymentNCount: 0, idfToBeReceivedCount:0};
            var updateObject = _this.model.currentData.counts;
            if (period == 2)
                updateObject = _this.model.compareData.counts;

            updateObject.claimCount.value = $filter("number")(data.claimCount);
            updateObject.claimCount.tooltip = "Claim Amount: " +  $filter("currency")(data.claimAmount);
            updateObject.paidCount.value = $filter("number")(data.partnerCount);
            updateObject.paidCount.tooltip = "Charged: " + $filter("currency")(data.partnerCharged) + "\n" + "Paid: " + $filter("currency")(data.partnerPaid);
            updateObject.responseCount.value = $filter("number")(data.responseCount);
            updateObject.responseCount.tooltip = "Charged: " + $filter("currency")(data.responseCharged) + "\n" + "Paid: " + $filter("currency")(data.responsePaid);
            updateObject.rejectCount.value = $filter("number")(data.rejectCount);
            updateObject.rejectCount.tooltip = "Included: "+$filter("number")(data.ackIncludedCount)+". Received: "+$filter("number")(data.ackReceivedCount)+". Accepted: "+$filter("number")(data.ackAcceptedCount);
            updateObject.paymentCount.value =  $filter("number")(data.paymentCount);
            updateObject.nonComplianceCount.value = $filter("number")(data.nonComplianceCount);
            updateObject.nonComplianceCount.tooltip = "Amount: " +  $filter("currency")(data.nonComplianceAmount);
            updateObject.preEditClaimCount.value = $filter("number")(data.preEditClaimCount);
            updateObject.preEditClaimCount.tooltip = "Amount: " +  $filter("currency")(data.preEditClaimAmount);
            updateObject.idfToBeReceivedCount.value = $filter("number")(data.idfToBeReceivedCount);
            updateObject.idfToBeReceivedCount.tooltip = "Amount: " +  $filter("currency")(data.idfToBeReceivedAmount);
        };

        //</editor-fold>

        //<editor-fold desc="Transaction Table">
        _this.functions.buildTransactionTable = function (data) {
            _this.model.transactionTable.data = data;
        };
        //</editor-fold>


        //<editor-fold desc="Bars">

        _this.functions.getChartLabel = function(sourceData, tooltipItem, data)
        {
            var label = data.datasets[tooltipItem.datasetIndex].label;
            var series;
            var value = null;
            switch (label)
            {
                case "Requests":
                    series = sourceData.requestSeries.data;
                    value = series[tooltipItem.index].amount;
                    break;
                case "Paid":
                    series = sourceData.paidSeries.data;
                    value = series[tooltipItem.index].paid;
                    break;
                case "Processed":
                    series = sourceData.responseSeries.data;
                    value = series[tooltipItem.index].paid;
                    break;
                case "Non-Compliant":
                    series = sourceData.rejectSeries.data;
                    value = series[tooltipItem.index].amount;
            }
            if (label)
                label += ': ';
            label += $filter("number")(tooltipItem.yLabel);
            if (value != undefined)
            {

                label += " (" + $filter("currency")(value) + ")";
            }
            return label;
        };

        _this.functions.initializeHorizBar = function (modelObj) {
            // routine to initialize the bar graph model object
            modelObj.seriesLabels = ["Requests", "Paid", "Rejections"];
            modelObj.datasetOverride = [{
                label: "Requests",
                borderColor: _this.model.theme.colorNames.request,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.request, _this.model.theme.opacity),
                fill: false
            }, {
                label: "Paid",
                borderColor: _this.model.theme.colorNames.paid,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.paid, _this.model.theme.opacity),
                fill: false
            }, {
                label: "Rejections",
                borderColor: _this.model.theme.colorNames.error,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.error, _this.model.theme.opacity),
                fill: false
            }];
            modelObj.requestSeries = {data: []};
            modelObj.paidSeries = {data: []};
            modelObj.rejectSeries = {data: []};
        };

        _this.functions.initializeBar = function (modelObj) {
            // routine to initialize the bar graph model object
            modelObj.series = [];

            // request series
            modelObj.requestSeries = {label: "Requests", options: {}, data: []};
            modelObj.requestSeries.options.chartJS = {
                label: "Requests",
                borderColor: _this.model.theme.colorNames.request,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.request, _this.model.theme.opacity),
                fill: false
            };
            modelObj.series.push(modelObj.requestSeries);

            // paid series
            modelObj.paidSeries = {label: "Paid", options: {}, data: []};
            modelObj.paidSeries.options.chartJS = {
                label: "Paid",
                borderColor: _this.model.theme.colorNames.paid,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.paid, _this.model.theme.opacity),
                fill: false
            };
            modelObj.series.push(modelObj.paidSeries);

            // response series
            modelObj.responseSeries = {label: "Processed", options: {}, data: []};
            modelObj.responseSeries.options.chartJS = {
                yAxisID: 'y-axis-1',
                label: "Processed",
                borderColor: _this.model.theme.colorNames.processed,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.processed, _this.model.theme.opacity),
                fill: false,
                type: 'bar',

            };
            modelObj.series.push(modelObj.responseSeries);

            // reject series
            modelObj.rejectSeries = {label: "Non-Compliant", options: {}, data: []};
            modelObj.rejectSeries.options.chartJS = {
                label: "Non-Compliant",
                borderColor: _this.model.theme.colorNames.error,
                backgroundColor: dashboardSvc.functions.getTransparencyColor(_this.model.theme.colorNames.error, _this.model.theme.opacity),
                fill: false
            };
            modelObj.series.push(modelObj.rejectSeries);
        };

        _this.functions.buildHorizBar = function(modelObj, data)
        {
            // routine to setup the dataset for the bar chart by day or company
            modelObj.requestSeries.data = [];
            modelObj.paidSeries.data = [];
            modelObj.responseSeries.data = [];
            modelObj.rejectSeries.data = [];
            modelObj.xLabels = [];


            // build the data
            lodash.forEach(data, function(record)
            {
                modelObj.xLabels.push(record._id);
                modelObj.requestSeries.data.push(record.claimCount);
                modelObj.paidSeries.data.push(record.payCount);
                modelObj.rejectSeries.data.push(record.rejections);
            });
            modelObj.data = [];
            modelObj.data.push(modelObj.requestSeries.data);
            modelObj.data.push(modelObj.paidSeries.data);
            modelObj.data.push(modelObj.rejectSeries.data);
        };

        _this.functions.buildBar = function (modelObj, data ) {
            // routine to setup the dataset for the bar chart by day or company
            modelObj.requestSeries.data = [];
            modelObj.paidSeries.data = [];
            modelObj.responseSeries.data = [];
            modelObj.rejectSeries.data = [];

            // build the data
            lodash.forEach(data, function (record)
            {
                modelObj.requestSeries.data.push({x: record._id, y: record.claimCount, amount: record.claimAmount});
                modelObj.paidSeries.data.push({x: record._id, y: record.partnerCount, charged: record.partnerCharged, paid: record.partnerPaid});
                modelObj.responseSeries.data.push({x: record._id, y: record.responseCount, charged: record.responseCharged, paid: record.responsePaid});
                modelObj.rejectSeries.data.push({x: record._id, y: record.nonComplianceCount, amount: record.nonComplianceAmount});
            });
            modelObj.refreshFlag.value += 1;
        };

        //</editor-fold>

        //</editor-fold>



        // initialize the dashboard and do the initial refresh
        _this.functions.initialize();

    }]);
});
