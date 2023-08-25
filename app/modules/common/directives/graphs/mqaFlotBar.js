/*
 /// <summary>
 /// app.modules.common.directives.graph - mqaFlotBar.js
 /// Angular Directive to implement Flot Bar Graphing capabilities
 /// This is similair to the mqa-flot-line except its specifically designed for bar charts
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/01/2017
 /// </summary>
 */
define(['modules/common/module','lodash', 'flot','flot-fillbetween','flot-orderBar','flot-pie', 'flot-time','flot-tooltip', 'flot-spline', 'flot-curved', 'flot-selection'], function(module, lodash)
{
    "use strict";

    return module.registerDirective('mqaFlotBar', ['chartSvc', function (chartSvc)
    {
        return {
            restrict: 'A',
            replace: true,
            template: '<div></div>',
            scope:
                {
                    dataset: '=',
                    options: '=',
                    refreshFlag:'=',
                    callback: '=?'
                },
            link: function($scope, $element, $attributes)
            {

                // initialize variables
                var settings = {};
                var _this = settings;
                var lastData = [];

                var init = function()
                {
                    // routine to initialize the data
                    buildDataset();
                    var plotObj = $.plot(plotArea, lastData, $scope.options);
                    if ($scope.callback) {
                        $scope.callback(plotObj);
                    }
                    return plotObj;
                };


                // initialize the charting variables
                var plot = null;
                var plotArea = $($element);
                var height = $attributes.height || '400';
                plotArea.css("height", height);

                var redraw = function()
				{
                    // routine to redraw the chart
					if (!plot)
						return;
                    buildDataset();
                    plot.setData(lastData);
                    plot.resize();
                    plot.setupGrid();
                    return plot.draw();
                };

                var addSeries = function(seriesObject)
                {
                    // routine to formulate a flot series object that will be push on the array
                    var returnObject = {label: seriesObject.label, data:seriesObject.data};
                    if (seriesObject.options && seriesObject.options.flotJS)
                    {
                        lodash.merge(returnObject, seriesObject.options.flotJS);
                    }
                    return returnObject;
                };
                var buildDataset = function()
                {
                    // routine to build the dataset based on the data provided
                    // the data provided should confirm to the V2 structure for time based graphs
                     lastData = [];

                    // update the data for the series
                    lodash.forEach($scope.dataset, function(seriesObject)
                    {
                        // check if this series exists
                        var seriesArray = lodash.find(lastData, {label: seriesObject.label});
                        if (seriesArray == null)
                        {
                            seriesArray = addSeries(seriesObject);
                            lastData.push(seriesArray);
                        }

                        // replace the data in its a bar chart - so we don't know if we need to add or subtract, we leave that up to the caller
                        seriesArray.data = seriesObject.data;
                    });
                };


				// setup the watches - don't watch the data because for this type of chart a watch on the collection will not work because
				// you typically don't repush to the source - so we have introduced an object watch
                $scope.$watch('refreshFlag', redraw, true);

                // add an options watch
                return $scope.$watch('options', function()
                {
                    return plot = init();
                }, true);

                // initialize the chart
                plot = init();

            }
        };
    }])
});
