/*
 /// <summary>
 /// app.modules.common.services - chartSvc.js
 /// Service to General Charting Functions
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/27/2015
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment','moment-humanize','appConfig'], function(module, lodash, moment, humanize, appConfig){
    "use strict";
    moment().format();
    module.registerService('chartSvc',['$filter', function($filter)
    {
        var _this = this;

        var getHighChartGradientColor =  function(color)
        {
            // routine to return the gradient of the given color in high chart format
            return {
                radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            }
        };

        _this.dashboardStates = {INITIALIZE: -1, CUSTOM: 0, INITIALIZE_COMPLETE: 1, REALTIME: 2};


        _this.colors =
         {
                "chartBorderColor": "#efefef",
                "chartGridColor": "#DDD",
                "chartOrange": "#E24913",     // orange
                "chartBlue": "#6595b4",  // blue
                "chartYellow": "#FF9F01",   // yellow
                "chartGreen": "#7e9d3a",  // green
                "chartDarkGray": "#666",
                "chartLightGray": "#BBB",
                "chartError": "#BD362F",  // reddish
                "chartMono": "#000",
                "chartUnknown":"#525252", // dark gray
                "borderColor": "#000000",
                "backgroundColor": "transparent",

        };

        _this.getTransparencyColor = function(hex, opacity)
        {
            // routine to return a transparency version of the given color
            var c;
            if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex))
            {
                c= hex.substring(1).split('');
                if(c.length== 3){
                    c= [c[0], c[0], c[1], c[1], c[2], c[2]];
                 }
                 c= '0x'+c.join('');
                 return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + opacity + ')';
            }
            return hex;
        };

        _this.highChartGradientColors = function()
        {
            return  Highcharts.map(Highcharts.getOptions().colors, function(color)
            {
                return  getHighChartGradientColor(color);
            });
        };

        this.getDashboardPalette = function() {
            // routine to return the dashboard palette based on the users skin
            var skin = localStorage.getItem('sm-skin') || appConfig.smartSkin;
            var foundSkin = lodash.find(appConfig.skins, {name: skin});
            if (foundSkin && foundSkin.dashboard)
                return foundSkin.dashboard;
            else
                return {colors: [_this.colors.chartBlue, _this.colors.chartGreen, _this.colors.chartDarkGray, _this.colors.chartOrange], opacity: 1};

        };

        _this.calculateMaxFlot = function (seriesArray, valueFunc, rowFunc)
        {
            // routine to calculate the maximum value from a flot series
            var values = lodash.map(seriesArray, function(series)
            {
                var maxInSeries = lodash.maxBy(series.data, valueFunc);
                if (!maxInSeries)
                    return 0;
                return valueFunc(maxInSeries);
            });
            var maxValue = lodash.max(values);
            if (!maxValue)
                maxValue = 0;
            return maxValue;
        };

        _this.morrisDonutPalette = ['#a57225', '#3D52D5', '#B5B1B2'];

        _this.baseDGTimeChartConfig = {
            xRangePad: 10,
            drawPoints: true,
            pointSize: 2,
            //dateWindow: [Date.parse("2015/05/05 7:00:00"), Date.parse("2015/05/06 23:00:00")],
            includeZero: true,
            labels: ["local time", "Count"],
            strokeWidth: 2.5,
            series: {
                Count: {
                    fillGraph: true,
                    drawGapEdgePoints: true
                }

            }

        };
        _this.baseFlotChartConfig = {
            yaxis: {
                min: 0,
                max: 100
            },
            xaxis: {
                min: 0,
                max: 100
            },
            colors: ['rgb(87, 136, 156)'],
            series: {
                lines: {
                    lineWidth: 1,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.4
                            },
                            {
                                opacity: 0
                            }
                        ]
                    },
                    steps: false

                }
            }
        };

        _this.baseHighChartConfig = {
            options: {
                chart: {
                    borderWidth: 1,
                    borderColor: this.colors.borderColor,
                    backgroundColor: this.colors.backgroundColor
                },
                tooltip:
                {
                    pointFormat: '<span style="color:{series.color}; font-weight: bold;">{series.name}</span>: <b>{point.y}</b>',
                    valueDecimals: 0
                },
                scrollbar:
                {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                title: {
                    text: ' '
                },
                credits: {
                    enabled: false
                },
                plotOptions:
                {
                    series:
                    {
                        allowPointSelect: true,
                        cursor: 'pointer'
                    },
                    column:
                    {
                        stacking: 'normal'
                    },
                    area:
                    {
                        stacking: 'normal',
                        marker: {
                            enabled: false
                        }
                    },
                    pie:
                    {
                        colors: this.highChartGradientColors(),
                        dataLabels:
                        {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        tooltip:
                        {
                            pointFormat: '<b>{point.y}</b>'
                        },
                        showInLegend: true
                    },
                    spline:
                    {
                        marker:
                        {
                            enabled: true
                        }
                    }
                }
            },
            noData: 'There is no data to display',
            series:[]
        };


        _this.highZoomConfig = {
            options: {
                subtitle: {
                    text: 'Click and drag to zoom in.'
                },
                chart: {
                    zoomType: 'xy',
                    resetZoomButton:
                    {
                        position:
                        {
                            x: -280,
                            y: 10
                        },
                        relativeTo: 'chart'
                    }
                },
                tooltip: {
                    crosshairs: [
                        {
                            width: 1,
                            dashStyle: 'dash',
                            color: '#898989'
                        },
                        {
                            width: 1,
                            dashStyle: 'dash',
                            color: '#898989'
                        }
                    ]

                },

                navigator: {
                    enabled: true
                },
                scrollbar:
                {
                    enabled: true
                },
                rangeSelector: {

                    enabled: true
                },
                xAxis: [{
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    }
                }],
                useHighStocks: true
            }
        };
        _this.baseHighChartZoomConfig = lodash.merge({}, this.baseHighChartConfig, this.highZoomConfig);
        _this.highChartDataConfig = {
            chart:
            {
                height: undefined
            }
        }
        _this.highChartNoDataConfig =
        {
            chart:
            {
                height: 100
            }
        }
        _this.highChartVLegend =
        {
            options:
            {
                chart:{
                    legend:	{
                        layout: 'vertical',
                            align: 'right',
                            backgroundColor: 'white',
                            verticalAlign: 'top',
                            borderWidth: 1,
                            borderRadius: 5,
                            floating: true,
                            zIndex: 20
                    }
                }

            }
        }

        _this.highChartDefaultHeight = 400;

        _this.easyPieBase = {animate:{duration: 1500, enabled: true}, scaleColor: false, lineCap:'lineCap', rotate: -90};
        _this.n3PieBase = {thickness: 10, mode: "gauge", total: 1 };
        _this.highChartGradient = function(color)
        {
            // routine to return the gradient of the given color in high chart format
            return getHighChartGradientColor(color);
        };

        _this.sparkLineBase =
        {
            // the defaults here are based on the smartadmin sparkline directive
            bar:
            {
                barColor: '#0000f0',
                type: 'bar',
                height: '26px',
                barWidth: 5,
                barSpacing: 2,
                stackedBarColor: ["#A90329", "#0099c6", "#98AA56", "#da532c", "#4490B1", "#6E9461", "#990099", "#B4CAD3"],
                negBarColor: '#A90329',
                zeroAxis: 'false'

            },
            line:
            {
                type: 'line',
                width: '90px',
                height: '20px',
                lineWidth: 1,
                lineColor:  '#0000f0',
                fillColor: '#c0d0f0',
                spotColor: '#f08000',
                minSpotColor: '#ed1c24',
                maxSpotColor: '#f08000',
                highlightSpotColor: '#50f050',
                highlightLineColor: 'f02020',
                spotRadius: 1.5,
                chartRangeMin: 'undefined',
                chartRangeMax: 'undefined',
                chartRangeMinX: 'undefined',
                chartRangeMaxX: 'undefined',
                normalRangeMin: 'undefined',
                normalRangeMax: 'undefined',
                normalRangeColor: '#c0c0c0',
                drawNormalOnTop: false
            },
            pie:
            {
                type: 'pie',
                width: 90,
                height: 90,
                tooltipFormat: '<span style="color: {{color}}">&#9679;</span> ({{percent.1}}%)',
                sliceColors: ["#B4CAD3", "#4490B1", "#98AA56", "#da532c", "#6E9461", "#0099c6", "#990099", "#717D8A"],
                borderWidth: 1,
                offset: 0,
                borderColor: '#45494C'
            },
            box:
            {
                type: 'box',
                width: 'auto',
                height: 'auto',
                raw: false,
                target: 'undefined',
                minValue: 'undefined',
                maxValue: 'undefined',
                showOutliers: true,
                outlierIQR: 1.5,
                spotRadius: 1.5,
                boxLineColor: '#000000',
                boxFillColor: '#c0d0f0',
                whiskerColor: '#000000',
                outlierLineColor: '#303030',
                outlierFillColor: '#f0f0f0',
                medianColor: '#f00000',
                targetColor: '#40a020'

            },
            bullet:
            {
                type: 'bullet',
                height: 'auto',
                targetWidth: 2,
                targetColor: '#ed1c24',
                performanceColor: '#3030f0',
                rangeColors: ["#d3dafe", "#a8b6ff", "#7f94ff"]

            },
            discrete:
            {
                type: 'discrete',
                width: 50,
                height: 26,
                lineColor: '#000000',
                lineHeight: 5,
                thresholdValue: 'undefined',
                thresholdColor: '#ed1c24'
            },
            tristate:
            {
                type: 'tristate',
                height: 26,
                posBarColor: '#60f060',
                negBarColor: '#f04040',
                zeroBarColor: '#909090',
                barWidth: 5,
                barSpacing: 2,
                zeroAxis: false
            }

        };

        _this.addRealTimeDatePoints = function(dataPointArray, dateInterval, addStartPoint)
        {
            // routine to add empty date points for the given array to give the effect of real time
            var returnArray = [];
            var lastDate = null;
            lodash.forEach(dataPointArray, function(dataPoint)
            {
                // check if the lastDate is null if so set the last data point
                if (lastDate)
                {
                    // now compare this point to the last data point if the time difference is greater
                    // create an empty point
                    let endDate = moment(dataPoint[0]);
                    let startDate = moment(lastDate[0]);

                    var duration = moment.duration(endDate.diff(startDate)).asMilliseconds();
                    if (duration < 1000)
                    {
                        // the two times are within the same second so accumulate
                        returnArray[returnArray.length - 1][1] += dataPoint[1];
                        return;
                    }
                    if ((duration > (dateInterval * 1000)) && dataPoint[1] != 0)
                    {
                        // add a new point
                        var nextDate = startDate.add(dateInterval, "seconds").toDate();
                        returnArray.push([nextDate, 0]);
                    }
                }
                else
                {
                    if (addStartPoint)
                        returnArray.push([moment(dataPoint[0]).subtract(dateInterval * 3,  "seconds"), 0]);
                }
                returnArray.push(dataPoint);
                lastDate = dataPoint;
            });
            return returnArray;
        }

        _this.getColors = function()
        {
            return _this.colors;
        }

        _this.buildEasyPieOptions = function(opts)
        {
            // routine to build up the defaults for a easy pie chart
            var returnOptions = angular.copy({}, _this.easyPieBase);
            returnOptions.barColor = opts.color || "green";
            returnOptions.size = opts.size || 25;
            returnOptions.lineSize = parseInt(returnOptions.size / 8.5);
            returnOptions.trackColor =  opts.trackColor || 'rgba(0,0,0,0.04)';
            return returnOptions;
        };

        _this.createZeroData = function(fromDate, toDate, since, rowFunction)
        {
            // routine to create a zero row for a dataset
            var data = [];
            data.push(rowFunction(fromDate));
            if (since.indexOf("m") > -1 || since.indexOf("s") > -1)
            {
                data = [];
                var fromDate = angular.copy(fromDate);
                var toDate = angular.copy(toDate);
                var currentDate = angular.copy(fromDate);
                while (currentDate.unix() < toDate.unix())
                {
                    data.push(rowFunction(currentDate));
                    currentDate = moment(currentDate).add({minutes: 1}).set({second:0, millisecond: 0 });
                };
            }
            return data;
        };



        _this.buildFlotTickSize = function(duration)
        {
            // routine to return a flot time axis tick size for the given duration
            var type = duration.slice(-1);
            var value = parseInt(duration.substr(0, duration.length - 1));
            if (type == "m")
            {
                // minutes
                return [value, "minute"];
            }
            if (type == "h")
            {
                // hours
                return [value, "hour"];
            }
            if (type == "d")
            {
                // days
                return [value, "day"];
            }
            if (type == "w")
            {
                // weeks
                return [value, "month"];
            }
            if (type = "s")
            {
                // seconds
                // hours
                return [value, "second"];
            }
        };

        this.buildFlotTimeAxisFormat = function(duration)
        {
            // routine to return a flot time axis format string based on the given duration
            var type = duration.slice(-1);
            if (type == "m")
            {
                // minutes
                return "%H:%M:%S";
            }
            if (type == "h")
            {
                // hours
                return "%H:00:%P"
            }
            if (type == "d")
            {
                // days
                return "%Y-%m-%d";
            }
            if (type == "w")
            {
                // weeks
                return "%Y-%m-%d";
            }
            if (type = "s")
            {
                // seconds
                return "%H:%M:%S";
            }
        };

        this.calcDiff = function(fromDate, toDate)
        {
            // routine to calculate the difference in days and give you a since for influx
            var DifInSecond = toDate.diff(fromDate, 'second');//34561
            var DifInMinutes = toDate.diff(fromDate, 'minutes');//34561
            var DifInHours = toDate.diff(fromDate, 'hours');//576
            var DifInDays = toDate.diff(fromDate, 'days');//24
            var DifInWeeks = toDate.diff(fromDate, 'weeks');//3
            var since;
            if (DifInDays > 31)
                since = "4w";
            else if (DifInDays <= 31 && DifInDays >= 7 )
                since = "1w";
            else if (DifInDays < 7 && DifInDays >= 1)
                since = "1d";
            else if (DifInDays < 1 && DifInHours >= 12)
                since = "6h";
            else if (DifInHours < 12 && DifInHours >= 6)
                since = "1h";
            else if (DifInHours < 6 && DifInHours >=1)
                since = "15m";
            else if (DifInMinutes >= 15 && DifInMinutes < 60)
                since = "7m";
            else if (DifInMinutes < 15)
                since = "1m";
            else if (DifInSecond >= 100 && DifInSecond < 400)
                since = "20s";
            else
                since = "5s";
            return {seconds: DifInWeeks, minutes: DifInMinutes, hours: DifInHours, days: DifInDays, weeks: DifInWeeks, since: since};
        }

        _this.calculateMorrisDataSet = function(baseData,data)
        {
            // routine to calculate data for a morris chart given its dataset
            lodash.forEach(data, function(dataRow)
            {
                // try and find the record in the current dashboard chart
                var record = lodash.find(baseData, {label: dataRow.label});
                if (record)
                    record.value += dataRow.value;
                else
                    baseData.push({label: dataRow.label, value: dataRow.value});
            });
            return baseData;

        }
    }]);
});


