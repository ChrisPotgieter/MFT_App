
/*
 /// <summary>
 /// modules.spe.directives - speTransactionDashboardGroupingChart.js
 /// Directive to Manage various Groupings (MAP, Container, System) for the ITX Transaction Dashboard
 /// This uses chart-js implementation
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07/04/2021
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('speTransactionDashboardGroupingChart', ['$filter', 'dashboardSvc', 'speDataSvc', function($filter, dashboardSvc, speDataSvc)
    {
    return  {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/modules/spe/directives/speTransactionDashboardGroupingChart.tpl.html',
        scope:{},
        bindToController: {
            data:"=",
            height:'@',
        },
        controllerAs:'vmChart',
        controller: function ($scope)
        {
           var _this = this;
            $scope.$watchCollection("vmChart.data", function(newValue)
            {
                if (newValue)
                {
                    _this.functions.setData(newValue);
                }
            });
            let palette = speDataSvc.getColorPalette();
            _this.functions = {};
            _this.functions.setData = function(data)
            {
                // routine to setup the dataset for the chart
                _this.model.envelopeSeries.data = [];
                _this.model.deenvelopeSeries.data = [];
                _this.model.transformSeries.data = [];
                //_this.model.totalSeries.data = [];
                _this.model.errorSeries.data = [];


                // only take the top 5 applications - the back end would have already sorted it by failures, requests
                lodash.forEach(data, function(historyRecord)
                {
                    _this.model.envelopeSeries.data.push({x: historyRecord._id, y: historyRecord.envelopes});
                    _this.model.deenvelopeSeries.data.push({x: historyRecord._id, y: historyRecord.denvelopes});
                    _this.model.transformSeries.data.push({x: historyRecord._id, y: historyRecord.transforms});
                    //_this.model.totalSeries.data.push({x: historyRecord._id, y: historyRecord.total});
                    _this.model.errorSeries.data.push({x: historyRecord._id, y: historyRecord.errors});

                });
                _this.model.refreshFlag.value += 1;
            };

            _this.functions.setupChartSeries = function()
            {
                // routine to setup the 3 series objects that will be used in this chart
                _this.model.series = [];

                // total series
                /*
                _this.model.totalSeries = {label: "Total", options:{}, data:[]};
                _this.model.totalSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Total", borderColor:  _this.model.colors[2], backgroundColor:  _this.model.colors[2], fill: false, type: 'bar' };
                _this.model.series.push(_this.model.totalSeries);

                 */




                // envelopes series
                _this.model.envelopeSeries = {label: "Envelopes", options:{}, data:[]};
                _this.model.envelopeSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Envelopes", borderColor: palette.colorNames.envelope, backgroundColor:  palette.colorNames.envelope, fill: false, type: 'bar' };
                _this.model.series.push(_this.model.envelopeSeries);

                // de-envelopes series
                _this.model.deenvelopeSeries = {label: "De-Envelopes", options:{}, data:[]};
                _this.model.deenvelopeSeries.options.chartJS = { yAxisID:'y-axis-1', label:"De-Envelopes", borderColor: palette.colorNames.de_envelope, backgroundColor:palette.colorNames.de_envelope, fill: false, type: 'bar' };
                _this.model.series.push(_this.model.deenvelopeSeries);

                // transform series
                _this.model.transformSeries = {label: "Transforms", options:{}, data:[]};
                _this.model.transformSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Transforms", borderColor: palette.colorNames.transform, backgroundColor: palette.colorNames.transform, fill: false, type: 'bar' };
                _this.model.series.push(_this.model.transformSeries);


                // error series
                _this.model.errorSeries = {label: "Errors", options:{}, data:[]};
                _this.model.errorSeries.options.chartJS = { yAxisID:'y-axis-1', label:"Failures", borderColor: palette.colorNames.error, backgroundColor: palette.colorNames.error, fill: true, type: 'bar'};
                _this.model.series.push(_this.model.errorSeries);

            };


            _this.functions.initializeWidget = function()
            {
                // routine to setup the widget on initial loading
                _this.model = {updateFlag: dashboardSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};

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
                                    id: 'y-axis-1',
                                    type: 'linear',
                                    display: true,
                                    position: 'left'
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


