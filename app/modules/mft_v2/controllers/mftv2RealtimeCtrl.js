/*
 /// <summary>
 /// app.modules.mft.controllers - mftv2RealtimeCtrl.js
 /// Controller to manage realtime statistics for the MFT V2 Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */
define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('mftv2RealtimeCtrl', ['$scope', '$timeout','$filter', 'chartSvc', 'socketIOSvc', 'mftv2DataSvc', function ($scope, $timeout, $filter, chartSvc, socketIOSvc, mftv2DataSvc) {

		var _this = this;

        _this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.initialize = function()
        {
            // setup the chart configuration for sparkline
            _this.chartConfig = {};
            _this.chartConfig.files = angular.copy(chartSvc.sparkLineBase.bar);
            _this.chartConfig.bytes = chartSvc.sparkLineBase.bar;
            _this.chartConfig.total = chartSvc.sparkLineBase.bar;
            _this.chartConfig.failures = chartSvc.sparkLineBase.bar;


            // setup the metrics array
            _this.metrics = {total: {chartData: {}}, failures: {chartData: {}}, bytes:{}, files:{}, agents:{}};
            _this.metrics.total.value = 0;
            _this.metrics.total.chartData = [];
            _this.metrics.failures.value = 0;
            _this.metrics.failures.chartData = [];
            _this.metrics.bytes.value = 0;
            _this.metrics.files.value = 0;
            _this.metrics.agents.valueUp = 0;
            _this.metrics.agents.valueDown = 0;
            _this.metrics.agents.valueNoComms = 0;

            _this.palette = mftv2DataSvc.getColorPalette();
        };

        _this.parseAgentCounts = function(serverData)
        {
            // routine to parse the agent counts received from the server
            let returnObj  = {up: 0, down: 0, no_comms: 0, deleted: 0};
            if (serverData != null)
            {
                if (serverData[1] != undefined)
                    returnObj.up = parseInt(serverData[1]);
                if (serverData[0] != undefined)
                    returnObj.down = parseInt(serverData[0]);
                if (serverData[90] != undefined)
                    returnObj.no_comms = parseInt(serverData[90]);
                if (serverData[99] != undefined)
                    returnObj.deleted = parseInt(serverData[99]);
            }
            return returnObj;
        };
        _this.functions.agentHandler = function (serverData)
        {
            // routine to update the realtime header when agent stats change
            let parsedData  = {up: 0, down: 0, no_comms: 0, deleted: 0};
            if (serverData != null)
            {
                if (serverData[1] != undefined)
                    parsedData.up = parseInt(serverData[1]);
                if (serverData[0] != undefined)
                    parsedData.down = parseInt(serverData[0]);
                if (serverData[90] != undefined)
                    parsedData.no_comms = parseInt(serverData[90]);
                if (serverData[99] != undefined)
                    parsedData.deleted = parseInt(serverData[99]);
            }
            _this.metrics.agents.valueUp = $filter("number")(parsedData.up);
            _this.metrics.agents.valueDown = $filter("number")(parsedData.down);
            _this.metrics.agents.valueNoComms = $filter("number")(parsedData.no_comms);
        };

        _this.functions.statsHandler = function(data)
        {
            // routine to update the header values (counts)
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
            metric = lodash.find(data.metrics, {id: "bytes"});
            if (metric)
                _this.metrics.bytes.value = $filter("bytesFilter")(metric.value);
            metric = lodash.find(data.metrics, {id: "files"});
            if (metric)
                _this.metrics.files.value = $filter("number")(metric.value);
        };
        //</editor-fold>

        // setup for socket-io use
        $timeout(function()
        {
            socketIOSvc.addListener("mft.realtime.header", _this.functions.statsHandler);
            socketIOSvc.addListener("mft.realtime.agents", _this.functions.agentHandler);
            socketIOSvc.connectModule("mft", function(data)
            {
                _this.functions.statsHandler(data);
            });
        }, 1000);

        // initialize the screen
        _this.functions.initialize();

    }]);
});
