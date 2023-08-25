/*
 /// <summary>
 /// app.modules.common.directives.graph - mqaFlotLine.js
 /// Angular Directive to implement Flot Line Graphing capabilities - This is a more generic version of the Smart Admin Version based on
 /// https://github.com/develersrl/angular-flot
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/20/2015
 /// </summary>
 */
define(['modules/common/module','lodash', 'flot','flot-fillbetween','flot-orderBar','flot-pie', 'flot-time','flot-tooltip', 'flot-spline', 'flot-curved', 'flot-selection'], function(module, lodash)
{
	"use strict";

	return module.registerDirective('mqaFlotLine', ['$timeout', 'chartSvc', function ($timeout, chartSvc)
	{
		return {
			restrict: 'EA',
			replace: true,
			template: '<div></div>',
			scope:
			{
				dataset: '=',
				options: '=',
				callback: '=?',
				updateFlag:'=?',
				maxPoints:'@?',
				zeroFill:'@?',
                refreshFlag:'=?'

            },
			link: function($scope, $element, $attributes)
			{

				// initialize variables
				var settings = {};
				var _this = settings;
				var lastData = [];

				_this.width = $attributes.width || '100%';
				_this.height = $attributes.height || '100%';
				_this.maxAllowed = 10;
				if ($scope.maxPoints)
					_this.maxAllowed = parseInt($scope.maxPoints);
				if (!$scope.updateFlag)
					$scope.updateFlag = chartSvc.dashboardStates.CUSTOM;

				if (!$scope.dataset) {
					$scope.dataset = [];
				}

				// initialize the charting variables
				var plot = null;
				var plotArea = $($element);
				/*
				plotArea.css({
					width: width,
					height: height
				});
				*/
				// set the properties of the plot
				//plotArea.css("height", "100%");
               // plotArea.css("height", "200");
				//plotArea.css("width", "100%");
				plotArea.bind("dblclick", function ()
				{
					// set back the zoom
					$.each(plot.getXAxes(), function(_, axis) {
						var opts = axis.options;
						opts.min = null;
						opts.max = null;
					});
					$.each(plot.getYAxes(), function(_, axis) {
						var opts = axis.options;
						opts.min = null;
						opts.max = null;
					});
					plot.setupGrid();
					plot.draw();
					plot.clearSelection();
				});
				plotArea.bind("plotselected", function (event, ranges) {

					// clamp the zooming to prevent eternal zoom

					if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
						ranges.xaxis.to = ranges.xaxis.from + 0.00001;
					}

					if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
						ranges.yaxis.to = ranges.yaxis.from + 0.00001;
					}

					// do the zooming
					$.each(plot.getXAxes(), function(_, axis) {
						var opts = axis.options;
						opts.min = ranges.xaxis.from;
						opts.max = ranges.xaxis.to;
					});
					$.each(plot.getYAxes(), function(_, axis) {
						var opts = axis.options;
						opts.min = ranges.yaxis.from;
						opts.max = ranges.yaxis.to;
					});
					plot.setupGrid();
					plot.draw();
					plot.clearSelection();
				});

				var redraw = function()
				{
					// routine to redraw the chart
                    if (!plot)
                        return;
                    plot.resize();
                    plot.setupGrid();
                    return plot.draw();
                };

                var redrawFull = function()
                {
                    // routine to redraw the chart
					plot = init();
					redraw();
                };

                var addPoint = function(seriesObject, dataPoint)
				{
					// shift the points if we are about to exceed the max allowed
					if (!dataPoint)
						return;
					if (seriesObject.data.length + 1 > _this.maxAllowed)
						seriesObject.data.shift();


					// add the new point
					if (Array.isArray(dataPoint))
						seriesObject.data.push(dataPoint);
					else
					{
						seriesObject.data.push([dataPoint.x, dataPoint.y]);
					}
				};


                var addDataPoints = function(seriesObject, dataPointsArray, realTime)
				{
					// routine to add the given data points array to the given series object checking the max points
					if (realTime && seriesObject.data.length > 0)
					{
						// just take the last point
						addPoint(seriesObject, lodash.last(dataPointsArray));
					}
					else {
						lodash.forEach(dataPointsArray, function (dataPoint) {
							addPoint(seriesObject, dataPoint)
						});
					}
				};

				var addSeries = function(seriesObject)
				{
					// routine to formulate a flot series object that will be push on the array
					var returnObject = {label: seriesObject.label, data:[]};
					if (seriesObject.options && seriesObject.options.flotJS)
					{
						lodash.merge(returnObject, seriesObject.options.flotJS);
					}
					return returnObject;
				};
				var buildDataset = function(dataset)
				{
					// routine to build the dataset based on the data provided
					// the data provided should confirm to the V2 structure for time based graphs
					var realTime = ($scope.updateFlag > chartSvc.dashboardStates.CUSTOM);
					var zeroFill = $scope.zeroFill == "true";
					if (!realTime)
						lastData = [];

					// Real Time Processing append the data
					lodash.forEach(dataset, function(seriesObject)
					{
						// check if this series exists
						var seriesArray = lodash.find(lastData, {label: seriesObject.label});
						if (seriesArray == null)
						{
							seriesArray = addSeries(seriesObject);
							lastData.push(seriesArray);
						}
						addDataPoints(seriesArray, seriesObject.data, realTime);
					});

					// work out the maximum for the y-axis
                    var values = lodash.map(lastData, function(series)
                    {
                        var maxInSeries = lodash.maxBy(series.data, function (values)
                        {
                            return values[1];
                        });
                        if (!maxInSeries)
                            return 0;
                        return maxInSeries[1];
                    });
                    var maxValue = lodash.max(values);
                    if (!maxValue)
                    	maxValue = 0;
//                    if ($scope.options.yaxis.max < maxValue)
                        $scope.options.yaxis.max = maxValue + 10;

                    if ($scope.updateFlag == chartSvc.dashboardStates.CUSTOM)
					{
                        // work out the tick length
                        var values = lodash.map(dataset, function(series)
                        {
                        	return series.data.length;
                        });
                        $scope.options.xaxis.ticks = lodash.max(values);
					}
					// TODO: Check the zero fill if need be we need to determine the series with the longest array of data and fill in the blanks

				};

				var init = function()
				{
					// routine to initialize the data
					buildDataset($scope.dataset);
					var plotObj = $.plot(plotArea, lastData, $scope.options);
					if ($scope.callback) {
						$scope.callback(plotObj);
					}
					return plotObj;
				};
				var onDatasetChanged = function(newData, oldData)
				{
					// update the dataset based on the data object
					if (newData != oldData)
					{
						// update the chart
						buildDataset(newData);
                        plot.setData(lastData);
                        redraw();
					}
				};

				// setup the watches
				$scope.$watchCollection('dataset', onDatasetChanged, true);

				// add an options watch
				 $scope.$watch('options', function(newValue, oldValue)
				{
					return plot = init();
				}, true);

                // setup the watches - don't watch the data because for this type of chart a watch on the collection will not work because
                // you typically don't repush to the source - so we have introduced an object watch
				if ($scope.refreshFlag)
				{
                    $scope.$watch('refreshFlag', function()
					{
						redrawFull();
                   	}, true);
                }


                // initialize the chart
				init();

			}
		};
	}])
});
