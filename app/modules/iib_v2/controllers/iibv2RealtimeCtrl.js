/*
 /// <summary>
 /// app.modules.iibv2.controllers - iibv2RealtimeCtrl.js
 /// Controller to manage realtime statistics for the IIB V2 Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/11/2018
 /// </summary>
 */
define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('iibv2RealtimeCtrl', ['$scope', '$timeout','$filter', 'chartSvc', 'iibv2DataSvc', 'socketIOSvc', function ($scope, $timeout, $filter,chartSvc, iibv2DataSvc, socketIOSvc) {


        // declare the update functions
        var _this = this;

        _this.functions = {};

        //<editor-fold desc="Functions">

        _this.functions.initialize = function()
        {
            // setup the chart configuration for sparkline
            _this.chartConfig = {};
            _this.chartConfig.files = chartSvc.sparkLineBase.bar;
            _this.chartConfig.total = chartSvc.sparkLineBase.bar;
            _this.chartConfig.failures = chartSvc.sparkLineBase.bar;


            // setup the metrics array
            _this.metrics = {total: {chartData: {}}, failures: {chartData: {}}};
            _this.metrics.total.value = 0;
            _this.metrics.total.chartData = [];
            _this.metrics.failures.value = 0;
            _this.metrics.failures.chartData = [];

            _this.palette = iibv2DataSvc.getColorPalette();
        };

        _this.functions.updateHandler = function(data)
        {
            // routine to update the header values
            var metric = lodash.find(data.metrics, {id: "total"});
            if (metric)
            {
                _this.metrics.total.value = $filter("number")(metric.value);
                _this.metrics.total.chartData = lodash.map(metric.history, "value");
            }
            metric = lodash.find(data.metrics, {id: "failures"});
            if (metric)
            {
                _this.metrics.failures.value = $filter("number")(metric.value);
                _this.metrics.failures.chartData = lodash.map(metric.history, "value");
            }
        };
        //</editor-fold>

        // setup for socket-io use
        $timeout(function()
        {
            socketIOSvc.addListener("iib.realtime.header", _this.functions.updateHandler);
            socketIOSvc.connectModule("iib", function(data)
            {
                _this.functions.updateHandler(data);
            });
        }, 1000);

        // initialize the screen
        _this.functions.initialize();
    }]);
});
