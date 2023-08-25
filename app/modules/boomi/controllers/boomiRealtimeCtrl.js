/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiRealtimeCtrl.js
 /// Controller to manage realtime statistics for the BOOMI Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module', 'lodash'], function (module, lodash)
{
	"use strict";

	module.registerController('boomiRealtimeCtrl', ['$scope', '$timeout','$filter', '$compile', '$rootScope', 'cacheDataSvc', 'chartSvc', 'socketIOSvc', 'boomiDataSvc', function ($scope, $timeout, $filter, $compile, $rootScope, cacheDataSvc, chartSvc, socketIOSvc, boomiDataSvc)
    {
		var _this = this;

        _this.functions = {};
        _this.tooltipTemplateHTML = null;
        _this.tooltipHTML = null;


        //<editor-fold desc="Atom Statistics">
        _this.functions.addLegend = function(caption, up, down, paused)
        {

            if (up != null)
                up = $filter("number")(up);
            if (down != null)
                down = $filter("number")(down);
            if (paused != null)
                paused = $filter("number")(paused);
            _this.metrics.atoms.legend.push({caption: caption, up: up, down: down, paused: paused});
        };
        _this.functions.buildLegend = function()
        {
            // routine to build up the legend information needed for the tooltip
            _this.metrics.atoms.legend = [];
            let stats = _this.metrics.atoms.serverData.statistics[0];

            _this.functions.addLegend("Atoms", _this.metrics.atoms.status.valueUp, _this.metrics.atoms.status.valueDown, _this.metrics.atoms.status.valueProblem);

            // add the scheduled process count
            _this.functions.addLegend("Schedules", stats.schedule_enabled, stats.schedule_disabled, null);

            // add the listener  count
            _this.functions.addLegend("Listeners", stats.listener_enabled, stats.listener_disabled, null);
        };
        _this.functions.compileAtomTooltipContent = function()
        {
            // routine to send the dynamic content for interpolation when the user has requested the tooltop
            _this.functions.buildLegend();
            if (_this.tooltipTemplateHTML)
            {
                let scope = $rootScope.$new();
                scope.data = {rows: _this.metrics.atoms.legend};
                scope.data.process_count  = $filter("number")(_this.metrics.atoms.serverData.statistics[0].process_count);

                scope.data.styles = {};
                scope.data.styles.up =  {"background-color": _this.palette.colorNames.bytes};
                scope.data.styles.down =  {"background-color": _this.palette.colorNames.error};
                scope.data.styles.paused =  {"background-color": _this.palette.colorNames.documents};
                scope.data.styles.process =  {"background-color": _this.palette.colorNames.transfers};
                let link = $compile(_this.tooltipTemplateHTML)(scope);
                scope.$digest();
                return  link[0].outerHTML;
            }
            else
                return "HTML Template Not Rendered";
        };

        _this.functions.addAtomTooltip = function()
        {
            // routine to add a tooltip for in progress records
            let element = $(document.getElementById('atom_stats'));
            let tooltip = element.kendoTooltip({
                position: "left",
                beforeShow: function (e)
                {
                    if (_this.metrics.atoms.serverData == null)
                        e.preventDefault();
                },
                show: function(e)
                {
                    this.refresh();
                },
                content: function(e)
                {
                    var value = _this.tooltipHTML;
                    return value;
                }
            }).data("kendoTooltip");

        };
        _this.functions.atomParser = function(serverData)
        {
            // routine to manage parsing of atom based real-time updates
            serverData = JSON.parse(serverData);
            _this.metrics.atoms.serverData = serverData;


            // determine the correct atom status stats
            let parsedData  = {up: 0, down: 0, problem: 0, deleted: 0};
            if (serverData != null && serverData.status != null)
            {
                // find the atoms that are up
                let record = lodash.find(serverData.status, {_id: 1});
                if (record != null)
                    parsedData.up = parseInt(record.count);

                // find the atoms that are down
                record = lodash.find(serverData.status, {id: 0});
                if (record != null)
                    parsedData.down = parseInt(record.count);

                // find the atoms that are in a warning state
                record = lodash.find(serverData.status, {id: 90});
                if (record != null)
                    parsedData.problem += parseInt(record.count);
                record = lodash.find(serverData.status, {id: 98});
                if (record != null)
                    parsedData.problem += parseInt(record.count);

                // find the atoms that are in deleted
                record = lodash.find(serverData.status, {id: 99});
                if (record != null)
                    parsedData.deleted = parseInt(record.count);
            }

            // format the result
            _this.metrics.atoms.status.valueUp = $filter("number")(parsedData.up);
            _this.metrics.atoms.status.valueDown = $filter("number")(parsedData.down);
            _this.metrics.atoms.status.valueProblem = $filter("number")(parsedData.problem);
            _this.tooltipHTML = _this.functions.compileAtomTooltipContent();
        };



        _this.functions.atomHandler = function (serverData)
        {
            // routine to update the realtime header when agent stats change
            _this.functions.atomParser(serverData);
        };
        //</editor-fold>

        //<editor-fold desc="Component Statistics">
        _this.functions.statsHandler = function(data)
        {
            // routine to update the header values (counts)
            if (!data || !data.metrics)
                return;
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

            metric = lodash.find(data.metrics, {id: "documents"});
            if (metric)
                _this.metrics.documents.value = $filter("number")(metric.value);

        };
        //</editor-fold>


        //<editor-fold desc="Initialization">
        _this.functions.initialize = function()
        {
            // setup the chart configuration for sparkline
            _this.chartConfig = {};
            _this.chartConfig.files = angular.copy(chartSvc.sparkLineBase.bar);
            _this.chartConfig.documents = angular.copy(chartSvc.sparkLineBase.bar);
            _this.chartConfig.bytes = chartSvc.sparkLineBase.bar;
            _this.chartConfig.total = chartSvc.sparkLineBase.bar;
            _this.chartConfig.failures = chartSvc.sparkLineBase.bar;


            // setup the metrics array
            _this.metrics = {total: {chartData: {}}, failures: {chartData: {}}, bytes:{}, files:{}, documents:{}, atoms:{}};
            _this.metrics.total.value = 0;
            _this.metrics.total.chartData = [];
            _this.metrics.failures.value = 0;
            _this.metrics.failures.chartData = [];
            _this.metrics.bytes.value = 0;
            _this.metrics.files.value = 0;
            _this.metrics.documents.value = 0;


            // atoms
            _this.metrics.atoms.status = {};
            _this.metrics.atoms.legend = [];
            _this.metrics.atoms.status.valueUp = 0;
            _this.metrics.atoms.status.valueDown = 0;
            _this.metrics.atoms.status.valueProblem = 0;
            _this.metrics.atoms.serverData = null;

            // setup the palette
            _this.palette = boomiDataSvc.getColorPalette();

            // cache the tooltip html
            cacheDataSvc.loadTemplate("app/modules/boomi/partials/realtime-header-tooltip.tpl.html", "boomi-realtime-header-tooltip.tpl.html").then(function (html)
            {
                _this.tooltipTemplateHTML = html;
            });

        };

        $timeout(function()
        {
            // setup for socket-io use
            _this.functions.addAtomTooltip();
            socketIOSvc.addListener("boomi.realtime.header", _this.functions.statsHandler);
            socketIOSvc.addListener("boomi.realtime.atoms", _this.functions.atomHandler);
            socketIOSvc.connectModule("boomi", function(data)
            {
                _this.functions.statsHandler(data);
            });
        }, 1000);
        //</editor-fold>

        // initialize the screen
        _this.functions.initialize();

    }]);
});
