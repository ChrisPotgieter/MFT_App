/*
 /// <summary>
 /// app.modules.spe.controllers - itxTransactionBalancingDialogCtrl
 /// Dialog Controller to Manage ITX Transaction Balancing Dialog - JSON Version
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/10/2021
 /// </summary>
 */

define(['modules/spe/module', 'lodash', 'chart', 'chartjs-datalabels'], function (module, lodash, chart, labelplugin) {

    "use strict";
    //chart.plugins.register(labelplugin);
    module.registerController('itxTransactionBalancingDialogCtrl', ['$uibModalInstance', '$filter', '$q', 'adminDataSvc', 'uiSvc', 'speDataSvc', 'dialogData', function ($uibModalInstance, $filter, $q, adminDataSvc, uiSvc, speDataSvc, dialogData)
    {
        var _this = this;


        // types
        // 0 - dialog popup grid
        // 1 - nested grid
        // 2 - dialog popup chart


        // initialize the dialog
        _this.dialogData = dialogData;

        _this.functions = {};


        //<editor-fold desc="Dialog Functions">
        _this.functions.editRecord = function(row)
        {
            // routine to manage the click on a row
            if (!row.click || !row.click.info || row.click.type == 1)
                return;

            let click_data = row.click;

            if (click_data.info.detail)
            {
                // detail data (dialog or table)
                let tableData = speDataSvc.getBalancing();
                let nodeData = tableData.detail[click_data.info.detail];
                if (nodeData)
                {
                    if (click_data.type == 0 || click_data.type == 2)
                    {
                        // nested dialog
                       if (!nodeData.overrides || !nodeData.overrides.drill_type)
                       {
                           if (!nodeData.overrides)
                               nodeData.overrides = {};
                           nodeData.overrides.drill_type = click_data.type;
                        }
                        let dialogData  = {titleData: {description: row.description + " Summary"}, nodeData: nodeData};
                        speDataSvc.viewBalancing(dialogData);
                    }
                }
            }
        };

        _this.functions.cancelRecord = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };

        _this.functions.chartClick = function(data)
        {
            // routine to handle the chart click when the view is chart
            let series = lodash.find(_this.model.chartSeries, {label: data.series});
            if (series != null)
            {
                _this.functions.editRecord(series);
            }
        };

        //</editor-fold>


        //<editor-fold desc="Core Functions">
        _this.functions.init = function()
        {
            // routine to parse the data in the dialog and create a grid options and grid data
            _this.model = {};


            let drill_type = 2; // default is chart view
            let icon = "fa fa-money";

            // check for overrides
            if (dialogData.nodeData && dialogData.nodeData.overrides)
            {
                if (dialogData.nodeData.overrides.drill_type != null)
                    drill_type = dialogData.nodeData.overrides.drill_type;
                if (dialogData.nodeData.overrides.icon)
                    icon = dialogData.nodeData.overrides.icon;
            }
            _this.model.titleData = dialogData.titleData;
            _this.model.titleData.icon = icon;

            if (drill_type == 2)
            {
                // for a chart make sure that the number of properties does not exceed 7
                let props = lodash.pickBy(dialogData.nodeData, function(value, key)
                {
                    return key != "overrides";
                });
                if (lodash.size(props) > 7)
                    drill_type = 0;
            }
            if (drill_type == 2)
            {
                // build a chart
                let returnObject = _this.functions.buildChartObject(dialogData.nodeData);
                _this.model.chartSeries = returnObject.series;
                _this.model.chartOptions = returnObject.options;
                _this.model.chartOptions.plugins = [labelplugin];
                _this.model.flags = returnObject.flags;
                _this.model.display_type = 1;
            }
            else
            {
                // build a grid (0, 1)
                let returnObject = _this.functions.buildGridObject(dialogData.nodeData, true);
                _this.model.gridData = returnObject.data;
                _this.model.gridOptions = returnObject.options;
                _this.model.flags = returnObject.flags;
                _this.model.display_type = 0;
            }
        };

        _this.functions.buildGridObject = function(rawData, isParent)
        {
            // routine to build a grid object given the data
            let nested = false;
            let returnObject =  {data:[], options: {}, flags:{gridRefresh: {value: 0}}};
            let data = lodash.cloneDeep(rawData);
            let columns = [];

            // now loop through the keys in the node data - this will be rows for the grid
            let rowIndex = -1;
            lodash.forOwn(data, function(dataRow, key)
            {
                if (!dataRow.values)
                    return;

                // get the columns
                lodash.forOwn(dataRow.values, function(rowValue, colName)
                {
                    columns.push(colName);
                });

                let row = dataRow.values;
                row.rowId = rowIndex++;
                row.description = lodash.startCase(key);
                row.hasDetail = false;

                // add the click override for this series
                if (dataRow.overrides && dataRow.overrides.drill_info)
                {
                    row.click = {type: 2, info: dataRow.overrides.drill_info};

                    if (dataRow.overrides.drill_type != null)
                          row.click.type = dataRow.overrides.drill_type;
                    row.hasDetail = row.click.type == 1; // nested table

                }
                returnObject.data.push(row);
            });

            // build the final columns
            columns = lodash.uniq(columns);
            columns = lodash.map(columns, function(column)
            {
                let columnObject = {field: column, type: "number", tooltip: false, title: lodash.upperCase(column), filterable: false, width: 100};
                columnObject.attributes = {style:"text-align:right;"};
                columnObject.headerAttributes = {style:"text-align:right;font-weight: bold"};

                // check for a column override at the series level
                if (data.overrides && data.overrides.columns && data.overrides.columns[column])
                {
                    lodash.merge(columnObject, data.overrides.columns[column]);
                }
                return columnObject;
            });

            // add the additional columns
            columns.splice(0, 0, {field: "description", type: "string", width:"200px", tooltip: false, filterable: false, title:"Description"});
            columns.splice(0, 0, {field: "rowId", type: "string", tooltip: false, hidden: true});

            // now build the final grid options
            returnObject.options = {
                resizable: false,
                selectable: "row",
                filterable: false,
                columnMenu: false,
                noRecords: true,
                pageable: false,
                messages: {
                    noRecords: "No Records Available"
                },
                dataSource: {
                    schema: {
                        model: {
                            id: "rowId",
                            uid:"rowId"
                        }
                    }
                },
                columns: columns,
                dataBound: function(e)
                {
                    var items = e.sender.items();
                    items.each(function(){
                        var row = $(this);
                        var dataItem = e.sender.dataItem(row);
                        if(!dataItem.hasDetail){
                            row.find(".k-hierarchy-cell").html("");
                        }
                    })
                }
            };
            if (isParent)
            {
                returnObject.options.toolbar = ["excel"];
                returnObject.options.excel = {
                fileName: "Balancing.xlsx",
                    allPages: true
                };
                returnObject.options.excelExport = _this.functions.excelExport
            }

            // see if we have nested
            if (nested)
                returnObject.options.detailInit = _this.functions.buildNestedGrid;

            return returnObject;
        };

        _this.functions.buildNestedGrid = function(e)
        {

            // routine to build a nested grid if applicable (will be called by kendo grid)
            let returnObject = _this.functions.buildNestedGridObject(e.data.click.info.detail);
            if (returnObject != null)
            {
                $("<div/>").appendTo(e.detailCell).kendoGrid(returnObject.options);
            };
        };


        _this.functions.buildNestedGridObject = function(detailName)
        {
            // routine to get the nested grid information for the given detail name
            let tableData = speDataSvc.getBalancing();
            let nodeData = tableData.detail[detailName];
            let returnObject = null;
            if (nodeData)
            {
                returnObject = _this.functions.buildGridObject(nodeData, false);
                returnObject.options.dataSource = {
                    data: returnObject.data
                };
            };
            return returnObject;
        };

        _this.functions.buildChartObject = function(rawData)
        {
            // routine to build a grid object given the data
            let colors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];

            let returnObject =  {series:[], options: {}, flags:{chartRefresh: {value: 0}, chartUpdate: {value: 0}}};
            let data = lodash.cloneDeep(rawData);


            let seriesIndex = -1;
            let scales = {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                            callback: function(label, index, labels)
                            {
                                return $filter('number')(label);
                            }
                        }

                    },
                ]
            };

            // now loop through the keys in the node data - this will be series for the chart
            lodash.forOwn(data, function(dataRow, key)
            {
                if (!dataRow.values)
                    return;

                seriesIndex++;
                let label = lodash.startCase(key);
                let series = {options:{}, data:[], label: label};



                series.options.chartJS = {
                    label: label,
                    fill: false,
                    borderColor: colors[seriesIndex],
                    backgroundColor: colors[seriesIndex],
                    scales: scales,
                    datalabels: {
                            align: 'end',
                            anchor: 'end',
                            padding: {top: 20},
                            display: function(context) {
                                return context.dataset.data[context.dataIndex] !== 0; // or >= 1 or ...
                            },
                            font:
                                {
                                    weight: 'bold'
                                },
                            formatter: Math.round
                        }
                };
                series.hasDetail = false;
                series.description = label;


                // add the series overrides
                if (dataRow.overrides)
                {
                    // check for a sub drill
                    if (dataRow.overrides && dataRow.overrides.drill_info)
                    {
                        series.click = {type: 2, info: dataRow.overrides.drill_info};
                        if (dataRow.overrides.drill_type != null)
                            series.click.type = dataRow.overrides.drill_type;
                        if (series.click.type == 1)
                            series.click.type = 0;
                    }
                    // check for chart overrides
                    if (dataRow.overrides.chart)
                        lodash.merge(series.options.chartJS, dataRow.overrides.chart);

                }

                // figure out the data
                lodash.forOwn(dataRow.values, function(rowValue, colName)
                {
                    series.data.push({x: lodash.upperCase(colName), y: rowValue});
                });

                // finally push the series
                returnObject.series.push(series);
            });


            // set the options
            returnObject.options = {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                legend: {
                    display: true,
                },
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                beginAtZero: true   // minimum value will be 0.
                            }

                        }
                    ]
                }
            };
            returnObject.options.tooltips = {
                callbacks:{
                    label: function(tooltipItem, data)
                    {
                        var label = data.datasets[tooltipItem.datasetIndex].label;
                        if (label) {
                            label += ': ';
                        }

                        label += $filter("number")(isNaN(tooltipItem.yLabel) ? '0': tooltipItem.yLabel);
                        return label;
                    }
                }
            };
            returnObject.options.export = {allow: true, fileName: _this.dialogData.titleData.description};

            // check for chart overrides
            if (data.overrides && data.overrides.chart)
            {
                lodash.merge(returnObject.options, data.overrides.chart);
            }
            return returnObject;
        };



        //</editor-fold>

        //<editor-fold desc="Excel Export">

        _this.functions.excelExport = function(e)
        {
            // routine to export all tables including nested sub tables
            e.preventDefault();
            let workbook = e.workbook;
            _this.model.exportPromises = [];
            let masterData = e.data;
            let tableIndex = -1;
            for (let rowIndex = 0; rowIndex < masterData.length; rowIndex++)
            {
                let dataItem = masterData[rowIndex];
                if (dataItem.hasDetail)
                {
                    tableIndex++;
                    let returnObject  = _this.functions.buildNestedGridObject(dataItem.click.info.detail);
                    if (returnObject != null)
                    {
                        let gridData = {columns: returnObject.options.columns, rows: returnObject.data, title: lodash.startCase(dataItem.click.info.detail)};
                        _this.functions.exportChildData(gridData, tableIndex);
                    }
                }
            }
            $q.all(_this.model.exportPromises).then(function(results)
            {
                _this.functions.combineResults(results, workbook);
            });
        };

        _this.functions.exportChildData = function (table, rowIndex)
        {
            // routine to export the given table - this will update the promise array
            var deferred = $q.defer();

            _this.model.exportPromises.push(deferred.promise);

            var exporter = new kendo.ExcelExporter({
                columns: table.columns,
                dataSource: table.rows
            });

            exporter.workbook().then(function(book, data)
            {
                book.sheets[0].title = table.title + " Detail";
                deferred.resolve({
                    masterRowIndex: rowIndex,
                    sheet: book.sheets[0]
                });
            });
        };

        _this.functions.combineResults = function(detailExports, workbook)
        {
            // routine to combine the sheets from the nested grids into the current workbook
            detailExports.sort(function (a, b) {
                return a.masterRowIndex - b.masterRowIndex;
            });

            // combine all the sheets into one
            var sheets = [];
            workbook.sheets[0].title = dialogData.titleData.description;
            sheets.push(workbook.sheets[0]);
            for (var i = 0; i < detailExports.length; i++)
            {
                sheets.push(detailExports[i].sheet)
            }
            // save the workbook
            kendo.saveAs({
                dataURI: new kendo.ooxml.Workbook({
                    sheets: sheets
                }).toDataURL(),
                fileName: "Balancing.xlsx"
            });
        };
        //</editor-fold>

        _this.functions.init();
    }]);
});
