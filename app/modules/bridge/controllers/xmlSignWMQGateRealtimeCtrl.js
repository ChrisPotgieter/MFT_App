/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateRealtimeCtrl
 /// Controller to manage realtime statistics for the XML Sign WMQ Gateway Bridge
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/04/2022
 /// </summary>
 */
define(['modules/bridge/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('xmlSignWMQGateRealtimeCtrl', ['$scope', '$timeout','$filter', 'chartSvc', 'socketIOSvc', 'bridgeDataSvc', function ($scope, $timeout, $filter, chartSvc, socketIOSvc, bridgeDataSvc) {

		var _this = this;

        _this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.initialize = function()
        {
            // setup the chart configuration for sparkline
            _this.chartConfig = {};
            _this.chartConfig.success = chartSvc.sparkLineBase.bar;
            _this.chartConfig.failures = chartSvc.sparkLineBase.bar;


            // setup the metrics array
            _this.metrics = {total: {}, failures: {chartData: {}}, success: {chartData: {}}, bytes:{}};
            _this.metrics.total.value = 0;
            _this.metrics.failures.value = 0;
            _this.metrics.failures.chartData = [];
            _this.metrics.success.value = 0;
            _this.metrics.success.chartData = [];
            _this.metrics.bytes.value = 0;
            _this.palette = bridgeDataSvc.getXMLSignWMQGateColorPalette();
        };


        _this.functions.statsHandler = function(data)
        {
            // routine to update the header values (counts)
            var metric = lodash.find(data.metrics, {id: "total"});
            if (metric)
                _this.metrics.total.value = $filter("number")(metric.value);
            metric = lodash.find(data.metrics, {id: "failures"});
            if (metric)
            {
                _this.metrics.failures.value = $filter("number")(metric.value);
                _this.metrics.failures.chartData = lodash.map(metric.history, "value");
            }
            metric = lodash.find(data.metrics, {id: "success"});
            if (metric)
            {
                _this.metrics.success.value = $filter("number")(metric.value);
                _this.metrics.success.chartData = lodash.map(metric.history, "value");
            }
            metric = lodash.find(data.metrics, {id: "bytes"});
            if (metric)
                _this.metrics.bytes.value = $filter("bytesFilter")(metric.value);
        };
        //</editor-fold>

        // setup for socket-io use
        $timeout(function()
        {
            socketIOSvc.addListener("xmlsign_wmq_gate.realtime.header", _this.functions.statsHandler);
            socketIOSvc.connectModule("bridge", function(data)
            {
                _this.functions.statsHandler(data);
            });
        }, 1000);

        // initialize the screen
        _this.functions.initialize();

    }]);
});
