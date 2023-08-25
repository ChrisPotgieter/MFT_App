/*
 /// <summary>
 /// app.modules.common.directives.graph - mqaChartjs.js
 /// Angular Directive to implement Chart.JS Graphing capabilities -
 /// The dataset is based on the standard graph concept of
 /// <Array of Series Objects>
 /// Where a seriesObject has the following properties
 /// label: The Label for the series
 /// data: Array of DataPoints where a datapoint is an object with the following
 /// x - the x value
 /// y - the y value
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/9/2015
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment','angular-chartjs'], function(module, lodash, moment)
{
	"use strict";
    moment().format();

    return module.registerDirective('mqaChartjs', ['chartSvc', 'uiSvc', function (chartSvc, uiSvc)
	{
		return {
			restrict: 'EA',
			replace: true,
			templateUrl:"app/modules/common/directives/graphs/mqaChartJs.tpl.html",
			scope:
			{
				dataset: '=',
				options: '=',
				callback: '&',
				updateFlag:'=?',
				maxPoints:'@?',
                zeroFill:'@?',
                refreshFlag:'=?',
				chartType:'@?'

            },
			link: function($scope, $element, $attributes)
			{
				// first thing initialize the objects
                $scope.vm = {};
                let exportOptions = null;
                var _this = $scope.vm;
                _this.rawLabels = [];
				_this.labels = [];
				_this.series = [];
				_this.data = [];
                _this.options = $scope.options || {};
                _this.datasetOverride = [];
                _this.chartType = $scope.chartType != null ? $scope.chartType : "bar";
				if ($attributes.height)
				{
					var value = parseInt($attributes.height);
					if (value > 0)
					{
						_this.height = value;
					}
                }
				var chartObj;
				var maxAllowed = 10;
				if ($scope.maxPoints)
					maxAllowed = parseInt($scope.maxPoints);
				if (!$scope.updateFlag)
					$scope.updateFlag = chartSvc.dashboardStates.CUSTOM;

				// check for an export
				_this.export = {allow: false};
				if (_this.options.export)
				{
					_this.export = _this.options.export;
					_this.export.allow = true;
				}


				var updateChartRef = function(event, chart)
				{
					chartObj = chart;
				};

				var setAnimation = function ()
				{
                    // update the options based on the updateFlag
					if (_this.options.animation == undefined)
						_this.options.animation = {};
                    if ($scope.updateFlag ==  chartSvc.dashboardStates.CUSTOM)
                        _this.options.animation.duration = 1000;
                    else
                        _this.options.animation.duration = 0;
                };

				var buildData = function()
				{
					// routine to update the data when the dataset changes
					_this.noData = true;
                    var realTimeFlag = ($scope.updateFlag > chartSvc.dashboardStates.CUSTOM);
                    var addedLabels = [];
					if (!realTimeFlag)
					{
					    _this.rawLabels = [];
						_this.labels = [];
						_this.series = [];
						_this.data = [];
					}
					lodash.forEach($scope.dataset, function(seriesObject)
					{
						// update the series list
						var seriesIndex = lodash.indexOf(_this.series, seriesObject.label);
						if (seriesIndex == -1)
						{
							// add the series to the series list
							_this.series.push(seriesObject.label);
    						seriesIndex = _this.series.length - 1;
                            _this.data[seriesIndex] = [];
                            if (seriesObject.options && seriesObject.options.chartJS)
                                _this.datasetOverride[seriesIndex] = seriesObject.options.chartJS;
                        }

						// loop through the datapoints
						lodash.forEach(seriesObject.data, function(dataPoint)
						{
							// update the x-label list
                            var xValue; var yValue;
                            if (Array.isArray(dataPoint))
                            {
                                xValue = dataPoint[0];
                                yValue = dataPoint[1];
                            }
                            else
                            {
                                xValue = dataPoint.x;
                                yValue = dataPoint.y;
                            }
                            if (_this.noData)
                            	_this.noData = false;

                            // check if the xvalue is part of the label array, if not add it
							var xIndex = lodash.indexOf(_this.rawLabels, xValue);
							if (xIndex == -1)
							{
								// add the new x value
								if (typeof xValue == 'number')
                                	_this.labels.push(moment(parseInt(xValue)).local().format("LLL"));
								else
                                    _this.labels.push(xValue);

                                _this.rawLabels.push(xValue);
								if (realTimeFlag == 1 && _this.rawLabels.length > maxAllowed)
								{
                                    _this.rawLabels.shift();
                                    _this.labels.shift();
                                }
								xIndex = lodash.indexOf(_this.rawLabels, xValue);
                                addedLabels.push(xIndex);
							}

							// update the data array
							_this.data[seriesIndex][xIndex] = yValue;
							if (realTimeFlag == 1 && _this.data[seriesIndex].length > maxAllowed)
								_this.data[seriesIndex].shift();

						});
					});

                    // now zerofill the added points
                    var zeroFill = $scope.zeroFill == "true";
                    if (zeroFill)
                    {
                        lodash.forEach(addedLabels, function (xindex) {
                            lodash.forEach(_this.data, function (series) {
                                if (!series[xindex])
                                    series[xindex] = 0;
                            })
                        });
                    }
				};

				_this.functions = {};
				_this.functions.onExport = function()
				{
					var base64Url = chartObj.toBase64Image();
					var link = document.createElement("a");
					if (!_this.export.fileName)
						_this.export.fileName = "Chart";
					link.download = _this.export.fileName + ".png";
					link.target = "_blank";

					// Construct the URI
					link.href = base64Url;
					document.body.appendChild(link);
					link.click();

					// Cleanup the DOM
					document.body.removeChild(link);
				};
				_this.onClick = function(points, evt)
				{
					// get the element clicked from the event
					if (chartObj)
						points = chartObj.getElementAtEvent(evt);

					// get the first point in the list
					var firstPoint = points[0];
					if (firstPoint)
					{
						var dataPoint = _this.data[firstPoint._datasetIndex];
                        var dataset = chartObj.data.datasets[firstPoint._datasetIndex];
						var result = {series: dataset.label, seriesIndex: firstPoint._datasetIndex, x: _this.labels[firstPoint._index], y: dataPoint[firstPoint._index]};
						($scope.callback || angular.noop)()(result);

					}
				};

				// listen on the chart events
				$scope.$on("chart-create", updateChartRef);
				$scope.$on("chart-update", updateChartRef);

				// add the dataset watcher
				$scope.$watchCollection("dataset", function(newValue, oldValue)
				{
					if (newValue)
					{
						$scope.dataset = newValue;
                        buildData();
                    }
                }, true);

				// add the updateFlag to update the animation options
				$scope.$watch("updateFlag", function(newValue, oldValue)
				{
					// update the animation flag when the changed
					if (newValue != oldValue)
					{
                        $scope.updateFlag = newValue;
						setAnimation();
					}
				});

                if ($scope.refreshFlag)
                {
                    $scope.$watch('refreshFlag', function()
                    {
                        buildData();
                    }, true);
                }
                setAnimation();

            }

		};
	}])
});
