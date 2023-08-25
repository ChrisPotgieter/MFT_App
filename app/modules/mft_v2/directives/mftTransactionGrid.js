/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftTransactionGrid
 /// Directive to display the MFT V2 Transaction Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mftTransactionGrid', ['$filter','$state', '$timeout', '$interpolate', 'uiSvc', 'cacheDataSvc', 'mftv2DataSvc', function($filter, $state, $timeout,  $interpolate, uiSvc, cacheDataSvc, mftv2DataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@', // 0 - transaction reporting, 1 - dashboard last, 2 - dashboard error, 3 - dashboard last (group), 4 - dashboard error (group)
                refreshFlag:'=',
                functionManager:'=?'
            },
            controllerAs:'vmGridDetail',
            templateUrl: "app/modules/mft_v2/directives/mftTransactionGrid.tpl.html",
            controller: function($element, $scope)
            {

                let _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                // load the template that will be used for in progress displays
                cacheDataSvc.loadTemplate("app/modules/mft_v2/partials/transaction-grid-current-progress.tpl.html", "transaction-grid-current-progress.tpl.html").then(function (html)
                {
                    _this.model.inProgressHTML = html;
                });

                //<editor-fold desc="Functions">



                _this.functions.compileTooltipContent = function(data)
                {
                    // routine to send the dynamic content for interpolation when the user has requested the tooltop
                    if (_this.model.inProgressHTML)
                    {
                        let dataObject = {data: data};
                        let htmlContent = $interpolate(_this.model.inProgressHTML)(dataObject);
                        return htmlContent;
                    }
                    else
                        return "HTML Template Not Rendered";
                };

                _this.functions.addInProgressTooltip = function(grid)
                {
                    // routine to add a tooltip for in progress records
                    var element = $(grid.wrapper);
                    element.kendoTooltip({
                        filter: ".inProgress",
                        position: "center",
                        beforeShow: function (e)
                        {
                            var dataItem = grid.dataItem(e.target.closest("tr"));
                            if (!dataItem["in_progress"] || dataItem["in_progress"] == '')
                                e.preventDefault();
                        },
                        content: function(e)
                        {
                            var dataItem = grid.dataItem(e.target.closest("tr"));
                            var data = dataItem["in_progress"];
                            return _this.functions.compileTooltipContent(data);
                        }
                    }).data("kendoTooltip");
                };


                _this.functions.jobHeaderTemplate = function(dataItem)
                {
                    // routine to show the job name
                    var title =  "Job Id: " + dataItem.value;
                    var row = lodash.find(_this.data, {job_id: dataItem.value});
                    if (row)
                    {
                        title +=  " (" + row.job_name + ")";

                    }
                    return title;
                };

                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.dashboardDrill = function(model)
                {
                    // routine to navigate to the transaction
                    mftv2DataSvc.navigateDashboardTransaction(model._id, $state.$current);
                };


                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();

                    let columns = _this.functions.buildColumns();
                    let clickEvent = null;
                    _this.mode = parseInt(_this.mode);

                    if (_this.mode == 0)
                    {
                        clickEvent = _this.functions.drill;
                    }
                    else
                    {
                        clickEvent = _this.functions.dashboardDrill;
                    };

                    if (_this.functionManager == null)
                        _this.functionManager = {};

                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Transaction Listing.xlsx",
                            allPages: true
                        },
                        sortable: true,
                        groupable: _this.mode == 0,
                        filterable: true,
                        columnMenu: true,
                        resizable: true,
                        scrollable: true,
                        reorderable: true,
                        pageable:
                            {
                                pageSizes: pageSizes
                            },
                        selectable: "row",
                        dataSource: {
                            pageSize: pageSizes[0],
                            sort: [
                                {field: "complete_date", dir: "desc"},
                                {field: "transactionId", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "transactionId",
                                    uid: "transactionId",
                                    fields: {
                                        transactionId: {type: "string"},
                                        action_date: {type: "date"},
                                        complete_date: {type: "date"},
                                        sys_date: {type: "date"},
                                        name: {type: "string"},
                                        supplemental: {type: "string"},

                                        status: {type: "number"},
                                        statusDesc: {type: "string"},

                                        transTypeDesc: {type: "string"},
                                        operationDesc: {type: "string"},
                                        trans_type: {type: "number"},

                                        job_id: {type: "string"},
                                        job_name: {type: "string"},

                                        department_id: {type: "number"},
                                        departmentDesc: {type: "string"},

                                        sla: {type: 'string'},
                                        slaClassDesc: {type: "string"},

                                        moduleDesc: {type: "string"},
                                        module: {type: "number"},
                                        module_status: {type: "number"},
                                        moduleStatusDesc: {type: "string"},

                                        running_time: {type: "number"},
                                        progress_perc: {type: "number"},
                                        byte_count: {type: "number"},
                                        item_count: {type: "number"},
                                        transfer_rate: {type: "number"},
                                        retries: {type: "number"},
                                        warnings: {type: "number"},

                                        source_agent: {type: "string"},
                                        destination_agent: {type: "string"},
                                        transfer_type: {type: "number"},
                                        template_type: {type: "number"},
                                        transferTypeDesc: {type: "string"},
                                        templateTypeDesc: {type: "string"},
                                        source_resource: {type: "string"},
                                        destination_resource: {type: "string"},
                                        mft_version: {type: "string"},

                                        originator_user: {type: "string"},
                                        originator_host: {type: "string"},

                                        in_progress: {type: "object"}
                                    }
                                }
                            },
                            aggregate: _this.aggregates,

                        },
                        columns: columns,
                        dataBound: function (e) {
                            var grid = this;

                            // setup the progress bars
                            grid.tbody.find(".progress").each(function () {
                                var row = $(this).closest("tr");
                                var model = grid.dataItem(row);
                                var progress = 0;
                                if (model && model.progress_perc)
                                    progress = model.progress_perc;

                                $(this).kendoProgressBar({

                                    value: progress,
                                    max: 100
                                });
                            });
                            uiSvc.dataBoundKendoGrid(grid, clickEvent, true);


                            // attach click events to all transaction grouping elements
                            var groups = grid.table.find("a[id^='group_']");
                            for (var i = 0; i < groups.length; i++) {
                                var element = $(groups[i]);
                                element.click(function () {
                                    _this.functions.persistGridState();
                                });
                            }
                        }
                    };

                    // see if we need to the BI report option
                    if (_this.mode == 0)
                        _this.gridOptions.toolbar = kendo.template($("#templateToolbar").html());

                    // if this is a group version group
                    if (_this.mode > 2)
                    {
                        // update the grid options to group by job id
                        _this.gridOptions.dataSource.sort = [
                            {field: "job_id", dir: "desc"},
                            {field: "action_date", dir: "desc"},
                            {field: "_id", dir: "desc"}
                        ];
                        _this.gridOptions.dataSource.group = {
                            field: "job_id",
                            dir: "desc",
                            aggregates: _this.aggregates
                        };
                    }

                    // add the tooltips to the grid
                    _this.functionManager.gridCreate = function(grid)
                    {
                        uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");
                        uiSvc.addKendoGridTooltip("moduleStatusDesc", grid, "moduleStatusDesc");
                        _this.functions.addInProgressTooltip(grid);
                    };


                    // set the height
                    _this.height = "500px";
                };

                _this.functions.buildMFTColumns = function()
                {
                    let mftColumns = [
                        {
                            field: "source_agent",
                            title: "Source Agent",
                            width: "200px"
                        },
                        {
                            field: "destination_agent",
                            title: "Destination Agent",
                            width: "200px"
                        },
                        {
                            field: "transferTypeDesc",
                            title: "Transfer Type",
                            width: "250px"
                        },
                        {
                            field: "templateTypeDesc",
                            title: "Template Type",
                            width: "250px"
                        },
                        {
                            field: "source_resource",
                            title: "First Source",
                            width: "250px"
                        },
                        {
                            field: "destination_resource",
                            title: "First Destination",
                            width: "250px"
                        }
                    ];

                    if (_this.mode == 0)
                    {
                        mftColumns.push(
                            {
                                field: "mft_version",
                                title: "Version ",
                                width: "100px"
                            }
                        );
                    }
                    if (_this.mode == 1 || _this.mode == 3)
                    {
                        mftColumns.push(
                            {
                                field: "departmentDesc",
                                title: "Department",
                                width: "140px"
                            });
                        mftColumns.push(
                            {
                                field: "slaClassDesc",
                                title: "SLA Class",
                                width: "200px"
                            });
                    }
                    return mftColumns;
                };

                _this.functions.buildProgressColumns = function(statusGrouping)
                {
                    // routine to build the progress based columns depending on the grid mode and column level
                    let columns = [];
                    // determine if the full progress columns are needed
                    let buildProgress  = (((statusGrouping == true && _this.mode == 0 || _this.mode == 2 || _this.mode == 4)) || statusGrouping == false);

                    if (buildProgress)

                        columns =  [{
                            field: "progress_perc",
                            title: "Progress",
                            width: "370px",
                            template: "<div class=\'progress\' style=\'height:20px;margin: 0px;\'></div>",
                            filterable: false,
                            groupable: false,
                            attributes: {
                                class:"inProgress"
                            }
                        }
                        ];
                    if (statusGrouping == true)
                    {

                        columns.push({
                            field: "item_count",
                            title: "Item Count",
                            width: "150px",
                            filterable: false,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        });
                    }
                    if (buildProgress)
                    {
                        let additional = [

                            {
                                field: "byte_count",
                                title: "Byte Count",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    return $filter("bytesFilter")(dataItem.byte_count);
                                },
                                footerTemplate: function (dataItem) {
                                    var value;
                                    if (dataItem.byte_count)
                                        value = (dataItem.byte_count.sum);
                                    else
                                        value = dataItem.sum;
                                    if (value == null)
                                        return null;
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.byte_count.sum);
                                }
                            },
                            {
                                field: "running_time",
                                title: "Running Time",
                                width: "300px",
                                aggregates: ["sum"],
                                filterable: false,
                                groupable: false,
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    if (dataItem.running_time != null) {
                                        return $filter("secondsToStringFilter")(dataItem.running_time);
                                    } else
                                        return "Unknown";
                                },
                                footerTemplate: function (dataItem) {
                                    var value;
                                    if (dataItem.running_time)
                                        value = dataItem.running_time.sum;
                                    else
                                        value = dataItem.sum;
                                    if (value == null)
                                        return null;
                                    return "<div class=\"truncate\" style=\"text-align:right\">" + $filter("secondsToStringFilter")(value.toFixed(3));
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div class=\"truncate\" style=\"text-align:right;\">" + $filter("secondsToStringFilter")(dataItem.running_time.sum.toFixed(3));
                                }
                            },
                            {
                                field: "transfer_rate",
                                title: "Transfer Rate",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    return $filter("bytesFilter")((dataItem.byte_count / dataItem.running_time).toFixed(0)) + "/s";
                                },
                                footerTemplate: function (dataItem) {
                                    let value = dataItem.byte_count.sum / dataItem.running_time.sum;
                                    if (value == null)
                                        return null;
                                    return "<div style=\"text-align:right;\">" + $filter("bytesFilter")(value.toFixed(0)) + "/s";
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div style=\"text-align:right;\">" + $filter("bytesFilter")((dataItem.byte_count.sum / dataItem.running_time.sum).toFixed(0)) + "/s";
                                }


                            }
                        ];
                        lodash.forEach(additional, function (column) {
                            columns.push(column);
                        })
                    }
                    return columns;
                };

                _this.functions.buildStatusColumns = function()
                {
                    let returnColumns = [
                        {
                            field: "supplemental",
                            title: "Supplemental",
                            width: "700px",
                            groupable: false,
                            attributes: {
                                style: "text-overflow:ellipsis;white-space:nowrap;",
                                class: "supplementalStatus"
                            }
                        },
                        {
                            field: "statusDesc",
                            title: "Status",
                            width: "350px"
                        },
                        {
                            field: "moduleStatusDesc",
                            title: "MFT Status",
                            width: "350px",
                            groupable: false,
                            attributes: {
                                style: "text-overflow:ellipsis;white-space:nowrap;",
                                class: "moduleStatusDesc"
                            }

                        }
                    ];
                    let additional = _this.functions.buildProgressColumns(true);


                    if (_this.mode == 0 || _this.mode == 2 || _this.mode == 4)
                    {
                        additional.push(
                            {
                                field: "retries",
                                title: "Retries",
                                width: "150px",
                                groupable: false,
                                aggregates:["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            },
                        );
                        additional.push(
                            {
                                field: "warnings",
                                title: "Warnings",
                                width: "150px",
                                groupable: false,
                                aggregates:["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            });
                    };
                    lodash.forEach(additional, function(column)
                    {
                        returnColumns.push(column)
                    });
                    return returnColumns;

                };

                _this.functions.buildColumns = function()
                {
                    // routine to build the required columns based on the mode
                    let mftColumns = _this.functions.buildMFTColumns();
                    let statusColumns = _this.functions.buildStatusColumns();
                    let columns = [];

                    // build the aggregates
                    _this.aggregates =
                    [
                        {field: "retries", aggregate: "sum"},
                        {field: "warnings", aggregate: "sum"},
                        {field: "byte_count", aggregate: "sum"},
                        {field: "item_count", aggregate: "sum"},
                        {field: "running_time", aggregate: "sum"},
                        {field: "transactionId", aggregate: "count"},
                        {field: "action_date", aggregate: "count" },
                    ];


                    // add the first two columns with the correct aggregation
                    if (_this.mode <= 2)
                    {
                        columns.push(
                        {
                                field: "job_name",
                                title: "Job Name",
                                width: "250px",
                        });
                    }
                    columns.push(
                    {
                            field: "name",
                            title: "Transaction Step",
                            width: "250px"
                    });
                    let mainField = _this.mode >= 3 ? "name": "job_name";
                    let record = lodash.find(columns, {field: mainField});
                    if (record)
                    {
                        record.aggregates = ["count"];
                        record.footerTemplate =  "No. of Transactions: #=count#",
                        record.groupFooterTemplate = "No. of Transactions: #=count#"
                        _this.aggregates.push({field: mainField, aggregate: "count"});
                    };

                    if (_this.mode == 1 || _this.mode == 3)
                    {
                        var progressColumns = _this.functions.buildProgressColumns(false);
                        lodash.forEach(progressColumns, function(column)
                        {
                            columns.push(column);
                        });
                    }


                    let additional = [
                        {
                            field: "action_date",
                            title: "Started",
                            format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                            width: "200px"
                        },
                        {
                            field: "complete_date",
                            title: "Completed",
                            format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                            width: "200px"
                        },
                        {
                            title: "MFT Information",
                            columns: mftColumns
                        },
                        {
                            title: "Status Information",
                            columns: statusColumns
                        }
                    ];

                    if (_this.mode == 0 || _this.mode == 2 || _this.mode == 4)
                    {
                        additional.push({
                            field: "originator_host",
                            title: "Host",
                            width: "400px"
                        });
                        additional.push({
                            field: "originator_user",
                            title: "User",
                            width: "200px"
                        });
                        let identifiers =  {
                            title: "Identifier Information",
                            columns: [
                                {
                                    field: "transactionId",
                                    title: "Transaction Id",
                                    width: "400px",
                                    aggregates: ["count"],
                                    footerTemplate: "No. of Transactions: #=count#",
                                    groupFooterTemplate: "No. of Transactions: #=count#"
                                },
                                {
                                    field: "job_id",
                                    title: "Job Id",
                                    width: "400px",
                                    groupHeaderTemplate: _this.functions.jobHeaderTemplate,
                                    hidden: _this.mode == 4
                                },
                                {
                                    field: "moduleDesc",
                                    title: "Module",
                                    width: "100px"
                                },
                                {
                                    field: "transTypeDesc",
                                    title: "Type",
                                    width: "200px"
                                },
                                {
                                    field: "operationDesc",
                                    title: "Operation Request",
                                    width: "200px"
                                },
                                {
                                    field: "departmentDesc",
                                    title: "Department",
                                    width: "140px"
                                },
                                {
                                    field: "slaClassDesc",
                                    title: "SLA Class",
                                    width: "200px"
                                },
                                {
                                    field: "sys_date",
                                    title: "Last Updated",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    filterable: false,
                                    groupable: false,
                                    width: "200px"
                                }
                            ]
                        };
                        additional.push(identifiers);
                    }
                    else
                    {
                        additional.push(
                        {

                            field: "job_id",
                            title: "Job Id",
                            width: "400px",
                            groupHeaderTemplate: _this.functions.jobHeaderTemplate,
                            hidden: true
                        });

                    }
                    lodash.forEach(additional, function(column)
                    {
                        columns.push(column)
                    });
                    return columns;
                };

                //</editor-fold>

                // when the mode changes we need to redraw
                $scope.$watch("vmGridDetail.mode", function (newValue, oldValue) {
                    // routine to watch the doc type for changes, the moment it changes, redraw the grid
                    if (newValue != oldValue) {
                        _this.functions.initView();
                        _this.model.rebuild.value += 1;
                    }
                });


                _this.functions.initView();

                // set the rebuild flag
                _this.rebuild = 0;

            }
        }
    }]);

});


