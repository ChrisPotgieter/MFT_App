/*
 /// <summary>
 /// app.modules.spe.controllers - speRealtimeCtrl.js
 /// Controller to manage realtime statistics for the SPE Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/05/2016
 /// </summary>
 */
define(['modules/spe/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('speRealtimeCtrl', ['$scope', '$filter','$timeout','chartSvc', 'socketIOSvc', 'speDataSvc', function ($scope, $filter, $timeout, chartSvc, socketIOSvc, speDataSvc)
	{

		var _this = this;

		_this.functions = {};

		//<editor-fold desc="Functions">

		_this.functions.initialize = function()
		{
			// update the chart config 
			_this.chartConfig = {};
			_this.chartConfig.failures = chartSvc.sparkLineBase.bar;
			_this.chartConfig.transforms = chartSvc.sparkLineBase.bar;
			_this.chartConfig.events = chartSvc.sparkLineBase.bar;

			// setup the metrics array 
			_this.metrics = {events: {chartData: {}}, failures: {chartData: {}}, envelop:{}, deenvelope:{}, transforms:{chartData: {}}};
			_this.metrics.events.value = 0;
			_this.metrics.events.chartData = [];
			_this.metrics.envelop.value = 0;
			_this.metrics.deenvelope.value = 0;
			_this.metrics.transforms.value = 0;
			_this.metrics.transforms.chartData = [];
			_this.metrics.failures.value = 0;
			_this.metrics.failures.chartData = [];

			_this.palette = speDataSvc.getColorPalette();
		};

		_this.functions.updateHandler = function(data)
		{
			// update the scope with data from header update send it via socket-io
			if (!data || !data.metrics)
				return;
			var metric = lodash.find(data.metrics, {id: "total"});
			if (metric)
			{
				_this.metrics.events.value = $filter("number")(metric.value);
				_this.metrics.events.chartData = lodash.map(metric.history, "value");
			}
			metric = lodash.find(data.metrics, {id: "failures"});
			if (metric)
			{
				_this.metrics.failures.value = $filter("number")(metric.value);
				_this.metrics.failures.chartData = lodash.map(metric.history, "value");
			}
			metric = lodash.find(data.metrics, {id: "transform"});
			if (metric)
			{
				_this.metrics.transforms.value = $filter("number")(metric.value);
				_this.metrics.transforms.chartData = lodash.map(metric.history, "value");
			}
			metric = lodash.find(data.metrics, {id: "envelope"});
			if (metric)
				_this.metrics.envelop.value = $filter("number")(metric.value);

			metric = lodash.find(data.metrics, {id: "deenvelop"});
			if (metric)
				_this.metrics.deenvelope.value = $filter("number")(metric.value);
		};
		//</editor-fold>


		// setup for socket-io use
		$timeout(function()
		{
            socketIOSvc.addListener("spe.realtime.header", _this.functions.updateHandler);
            socketIOSvc.connectModule("spe", function(data)
            {
                _this.functions.updateHandler(data);
            });
        }, 1000);

		// initialize the screen
		_this.functions.initialize();

	}]);
});
