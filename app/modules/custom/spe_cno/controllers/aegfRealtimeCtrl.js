/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfRealtimeCtrl
 /// CNO Automated Employer Group Real-Time Statistics Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/06/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash)
{
	"use strict";

	module.registerController('aegfRealtimeCtrl', ['$scope', '$timeout','$filter', '$rootScope', 'chartSvc', 'socketIOSvc', 'speCNODataSvc', function ($scope, $timeout, $filter, $rootScope, chartSvc, socketIOSvc, dataSvc)
    {
        let _this = this;

        _this.functions = {};

        //<editor-fold desc="Component Statistics">
        _this.functions.statsHandler = function(data)
        {
            // routine to update the header values (counts)
            if (!data || !data.metrics)
                return;
            let metric = lodash.find(data.metrics, {id: "total"});
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

        //<editor-fold desc="Initialization">
        _this.functions.initialize = function()
        {
            // setup the chart configuration for sparkline
            _this.chartConfig = {};
            _this.chartConfig.total = chartSvc.sparkLineBase.bar;
            _this.chartConfig.failures = chartSvc.sparkLineBase.bar;


            // setup the metrics array
            _this.metrics = {total: {chartData: {}}, failures: {chartData: {}}};
            _this.metrics.total.value = 0;
            _this.metrics.total.chartData = [];
            _this.metrics.failures.value = 0;
            _this.metrics.failures.chartData = [];


            // setup the palette
            _this.palette = dataSvc.aegf.functions.getColorPalette();
        };

        $timeout(function()
        {
            // setup for socket-io use
            socketIOSvc.addListener("aegf.realtime.header", _this.functions.statsHandler);
            socketIOSvc.connectModule("aegf", function(data)
            {
                _this.functions.statsHandler(data);
            });
        }, 1000);
        //</editor-fold>

        // initialize the screen
        _this.functions.initialize();

    }]);
});
