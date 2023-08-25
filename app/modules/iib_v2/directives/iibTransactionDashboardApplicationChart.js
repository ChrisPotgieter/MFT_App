
/*
 /// <summary>
 /// modules.iib_v2.directives - iibTransactionDashboardApplicationChart.js
 /// Directive to Manage Application Chart for the IIB Transaction Dashboard
 /// This uses chart-js implementation
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/01/2020
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('iibTransactionDashboardApplicationChart', ['$filter', 'iibv2DataSvc', 'chartSvc', function($filter, iibv2DataSvc, chartSvc)
    {
    return  {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/modules/iib_v2/directives//iibTransactionDashboardApplicationChart.tpl.html',
        scope:{},
        bindToController: {
            data:"=",
            height:'@',
        },
        controllerAs:'vmChart',
        controller: function ($scope)
        {
           var _this = this;
           let palette = iibv2DataSvc.getColorPalette();
            $scope.$watchCollection("vmChart.data", function(newValue)
            {
                if (newValue)
                {
                    _this.functions.setData(newValue);
                }
            });
            _this.functions = {};
            _this.functions.setData = function(data)
            {
                // routine to setup the dataset for the chart
                _this.model.requestSeries.data = [];
                _this.model.failureSeries.data = [];
                _this.model.runTimeSeries.data = [];


                // only take the top 5 applications - the back end would have already sorted it by failures, requests
                lodash.forEach(data, function(historyRecord)
                {
                    let application = lodash.find(_this.model.apps, {code: historyRecord._id.toUpperCase()});
                    if (application != null)
                        historyRecord._id = application.description;
                    _this.model.requestSeries.data.push({x: historyRecord._id, y: historyRecord.requests});
                    _this.model.failureSeries.data.push({x: historyRecord._id, y: historyRecord.failures});
                    _this.model.runTimeSeries.data.push({x: historyRecord._id, y: $filter('number')(historyRecord.run_time, 2)});
                });
                _this.model.refreshFlag.value += 1;
            };

            _this.functions.setupChartSeries = function()
            {
                // routine to setup the 3 series objects that will be used in this chart

                _this.model.series = [];

                // request series
                _this.model.requestSeries = {label: "Requests", options:{}, data:[]};
                _this.model.requestSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Requests", borderColor: palette.colorNames.request, backgroundColor: chartSvc.getTransparencyColor(palette.colorNames.request, 0.5), fill: false, type: 'bar' };
                _this.model.series.push(_this.model.requestSeries);

                // run-time
                _this.model.runTimeSeries = {label: "Running Time", options:{}, data:[]};
                _this.model.runTimeSeries.options.chartJS = { yAxisID:'y-axis-2', label:"Running Time", borderColor: palette.colorNames.time, backgroundColor: chartSvc.getTransparencyColor(palette.colorNames.time, 0.5), fill: false, type: 'bar' };
                _this.model.series.push(_this.model.runTimeSeries);

                // error series
                _this.model.failureSeries = {label: "Errors", options:{}, data:[]};
                _this.model.failureSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Failures", borderColor: palette.colorNames.error, backgroundColor: chartSvc.getTransparencyColor(palette.colorNames.error, 0.5), fill: true, type: 'bar'};
                _this.model.series.push(_this.model.failureSeries);

            };


            _this.functions.initializeWidget = function()
            {
                // routine to setup the widget on initial loading
                _this.model = {updateFlag: chartSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}, apps:[]};

                iibv2DataSvc.getLists().then(function(result)
                {
                    _this.model.apps = lodash.map(result, function(record)
                    {
                        return {code: record.code, description: record.description};
                    });
                }).catch(function(err)
                {
                    $log.error("Unable to get Application Lists", err);
                });


                // set the chart options
                _this.model.options =  {
                        responsive: true,
                        hoverMode: 'index',
                        stacked: false,
                        legend: {
                            display: true,
                            labels: {
                                fontColor: 'rgb(255, 99, 132)'
                            }
                        },
                        scales: {
                            yAxes: [
                                {
                                    id: 'y-axis-1',  // requests and errors
                                    type: 'linear',
                                    display: true,
                                    position: 'left'
                                },
                                {
                                    id: 'y-axis-2', // run time
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    gridLines: {
                                        drawOnChartArea: false // only want the grid lines for one axis to show up
                                    },
                                    ticks: {
                                        beginAtZero: true   // minimum value will be 0.
                                    }
                                }
                            ]
                        }
                    };

                // set the series up
                _this.functions.setupChartSeries();
            };


            _this.functions.initializeWidget();
        }
    }
  }]);

});


