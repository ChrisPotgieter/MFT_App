/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.directives - speInstamedPaymentCharts
 // SPE Instamed Extension
 /// Directive to display Payment Method and Payment Status Charts based on the given data

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/04/2020
 /// </summary>
 */

define(['modules/spe/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('speInstamedPaymentCharts', ['chartSvc', 'uiSvc', 'speInstamedDataSvc', function(chartSvc, uiSvc, speInstamedDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@',
            },
            controllerAs:'vm',
            templateUrl:"app/modules/spe/extensions/instamed/directives/speInstamedPaymentCharts.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {statusBar:{}, methodBar:{}};

                //<editor-fold desc="Functions">

                _this.functions.initializeChart = function(data, options)
                {
                    // initialize the base chart information
                    var modelObj = {updateFlag: chartSvc.dashboardStates.CUSTOM, refreshFlag: {value: 0}};
                    modelObj.options = {
                        responsive: true,
                        hoverMode: 'index',
                        stacked: false,
                        legend: {
                            display: true,
                        },
                        scales: {
                            yAxes: [
                                {
                                    id: 'y-axis-1',
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    ticks: {
                                        beginAtZero: true   // minimum value will be 0.
                                    }

                                }
                            ]
                        }
                    };

                    // initialize the data series
                    var series = {label: options.title, data:data, options:{}};
                    series.options.chartJS = {
                        label: options.title,
                        borderColor: options.color,
                        backgroundColor: options.color,
                        fill: false
                    };
                    modelObj.series = [series];
                    modelObj.refreshFlag.value += 1;
                    return modelObj;
                };

                _this.functions.buildData = function(dataObj, descFunction, keyId, valueId)
                {
                    // routine to build up the data based on the given parameters and the mode
                    var returnData = [];

                    lodash.forEach(dataObj, function(arrayObject)
                    {

                        var desc = descFunction(arrayObject[keyId]);
                        var value = parseInt(arrayObject[valueId]);
                        if (value > 0)
                            returnData.push({x: desc, y: value});
                    });

                    return returnData;
                };

                _this.functions.init = function()
                {
                    // initialize the method chart
                    let pal = speInstamedDataSvc.getColorPalette();
                    if (_this.data == undefined)
                        return;

                    let data = _this.functions.buildData(_this.data.methodCounts, speInstamedDataSvc.getPaymentMethod, "paymentMethod", "claimCount");
                    _this.model.methodBar = _this.functions.initializeChart(data, {title:"Payment Methods", color: pal.colorNames.paymentMethods});

                    // initialize the status chart
                    data = _this.functions.buildData(_this.data.statusCounts, speInstamedDataSvc.getPaymentStatus , "paymentStatus", "claimCount");
                    _this.model.statusBar = _this.functions.initializeChart(data, {title:"Payment Status", color: pal.colorNames.paymentStatus});
                };
                //</editor-fold>

                $scope.$watch("vm.data", function(newValue, oldValue)
                {
                    if (oldValue != newValue)
                        _this.functions.init();
                });


                _this.functions.init();
            }
        }
    }]);

});


