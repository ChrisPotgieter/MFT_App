/*
 /// <summary>
 /// app.modules.boomi.directives - boomiTransactionGrid
 /// Directive to display the Boomi Transaction Grid based on Component Emit Data

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/10/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiTransactionGrid', ['$filter','$state', '$timeout', 'uiSvc', 'boomiDataSvc', function($filter, $state, $timeout, uiSvc, dataSvc)
    {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
                mode:'@', // 0 - transaction reporting, 1 - dashboard , 3 - dashboard (group)
                refreshFlag: '=',
                functionManager: '=?'
            },
            controllerAs: 'vmGridDetail',
            templateUrl: "app/modules/boomi/directives/boomiTransactionGrid.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags: {watched: false}, progressId: "grid"};
                _this.mode = parseInt(_this.mode);

                //<editor-fold desc="Functions">
                _this.functions.footTemplateByteCalc = function(dataItem, fieldname)
                {
                    let value = (dataItem[fieldname]) ? dataItem[fieldname].sum : dataItem.sum;
                    if (value == null)
                        return null;
                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                };

                _this.functions.buildModuleColumns = function()
                {
                    // routine to return the list of columns with module specific information
                    let moduleColumns = [
                        {
                            field: "atom_name",
                            title: "Atom",
                            width: "250px"
                        },
                        {
                            field: "process_name",
                            title: "Process",
                            width: "300px"
                        },
                        {
                            field: "step_count",
                            title: "No. Steps",
                            width: "150px",
                            filterable: true,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },
                        {
                            field: "initial_doc_count",
                            title: "Initial Incoming Docs",
                            width: "200px",
                            filterable: true,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },
                        {
                            field: "total_incoming_docs",
                            title: "Total Incoming Docs",
                            width: "200px",
                            filterable: true,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },
                        {
                            field: "total_outgoing_docs",
                            title: "Total Outgoing Docs",
                            width: "200px",
                            filterable: true,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },
                        {
                            field: "total_error_docs",
                            title: "Total Error Docs",
                            width: "200px",
                            filterable: true,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },
                        {
                            field: "initial_byte_count",
                            title: "Initial Byte Count",
                            width: "150px",
                            filterable: false,
                            groupable: false,
                            aggregates: ["sum"],
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                            template: function (dataItem) {
                                return $filter("bytesFilter")(dataItem.initial_byte_count);
                            },
                            footerTemplate: function (dataItem) {

                                return _this.functions.footTemplateByteCalc(dataItem, "initial_byte_count");
                            },
                            groupFooterTemplate: function (dataItem) {
                                return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.initial_byte_count.sum);
                            }
                        },

                        {
                            field: "byte_count",
                            title: "Total Byte Count",
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

                                return _this.functions.footTemplateByteCalc(dataItem, "byte_count");
                            },
                            groupFooterTemplate: function (dataItem) {
                                return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.byte_count.sum);
                            }
                        },

                        {
                            field: "execution_mode",
                            title: "Execution Mode",
                            width: "200px"
                        },
                        {
                            field: "execution_type",
                            title: "Execution Type",
                            width: "200px"
                        }
                    ];

                    if (_this.mode == 0)
                    {
                        moduleColumns.push(
                            {
                                field: "atom_id",
                                title: "Atom Identifier",
                                width: "200px"
                            }
                        );
                        moduleColumns.push(
                            {
                                field: "process_id",
                                title: "Process Identifier",
                                width: "200px"
                            }
                        );

                        moduleColumns.push(
                            {
                                field: "component_version",
                                title: "Version",
                                width: "100px"
                            }
                        );
                        moduleColumns.push(
                            {
                                field: "account",
                                title: "Account",
                                width: "200px"
                            }
                        );

                    }
                    if (_this.mode == 1 || _this.mode == 3)
                    {
                        moduleColumns.push(
                            {
                                field: "departmentDesc",
                                title: "Department",
                                width: "140px"
                            });
                        moduleColumns.push(
                            {
                                field: "slaClassDesc",
                                title: "SLA Class",
                                width: "200px"
                            });
                    }
                    return moduleColumns;
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
                            title: "Boomi Status",
                            width: "350px",
                            groupable: false,
                            attributes: {
                                style: "text-overflow:ellipsis;white-space:nowrap;",
                                class: "moduleStatusDesc"
                            }

                        }
                    ];
                    return returnColumns;

                };

                _this.functions.buildProgressColumns = function()
                {
                    let columns = [
                        {
                            field: "progress_perc",
                            title: "Progress",
                            width: "370px",
                            template: "<div class=\'progress\' style=\'height:20px;margin: 0px;\'></div>",
                            filterable: false,
                            groupable: false
                        },
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

                                return _this.functions.footTemplateByteCalc(dataItem, "byte_count");
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
                            field: "error_count",
                            title: "No. Errors",
                            width: "150px",
                            filterable: false,
                            groupable: false,
                            aggregates:["sum"],
                            footerTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            groupFooterTemplate:"<div style=\"text-align: right\">#=sum#</div>",
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"}
                        },

                    ];
                    return columns;


                };

                _this.functions.buildColumns = function ()
                {
                    let moduleColumns = _this.functions.buildModuleColumns();
                    let statusColumns = _this.functions.buildStatusColumns();
                    let progressColumns = _this.functions.buildProgressColumns();
                    let columns = [];

                    // routine to build up columns for the grid and return them
                    // build the aggregates
                    _this.aggregates =
                       [
                            {field: "initial_doc_count", aggregate: "sum"},
                            {field: "initial_byte_count", aggregate: "sum"},

                            {field: "total_incoming_docs", aggregate: "sum"},
                            {field: "total_outgoing_docs", aggregate: "sum"},
                            {field: "total_error_docs", aggregate: "sum"},


                            {field: "byte_count", aggregate: "sum"},
                            {field: "error_count", aggregate: "sum"},
                            {field: "step_count", aggregate: "sum"},
                            {field: "running_time", aggregate: "sum"},
                            {field: "transactionId", aggregate: "count"},
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
                    if (_this.mode > 0)
                        columns.push(...progressColumns);

                    let mainField = _this.mode >= 3 ? "name": "job_name";
                    let record = lodash.find(columns, {field: mainField});
                    if (record)
                    {
                        record.aggregates = ["count"];
                        record.footerTemplate =  "No. of Transactions: #=count#";
                        record.groupFooterTemplate = "No. of Transactions: #=count#"
                        _this.aggregates.push({field: mainField, aggregate: "count"});
                    };


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
                        }];
                    additional.push(...moduleColumns);
                    additional.push(...statusColumns);

                    // add the identifiers
                    if (_this.mode == 0)
                    {
                        additional.push(...progressColumns);
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
                        additional.push(...identifiers.columns);
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
                    columns.push(...additional);

                    return columns;
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
                    dataSvc.transactionDrill(model._id);
                };

                _this.functions.initGrid = function(columns)
                {

                    // routine to initialize the grid
                    let pageSizes = uiSvc.getKendoPageSizes();

                    if (_this.functionManager == null)
                        _this.functionManager = {};


                    // determine the click
                    _this.mode = parseInt(_this.mode);
                    let clickEvent = null;
                    if (_this.mode == 0)
                        clickEvent = _this.functions.drill;
                    else
                        clickEvent = _this.functions.dashboardDrill;

                    // set the grid options
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
                                        sys_date: {type: "date"},
                                        action_date: {type: "date"},
                                        complete_date: {type: "date"},


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
                                        error_count: {type: "number"},
                                        byte_count: {type: "number"},

                                        initial_doc_count: {type: "number"},
                                        initial_byte_count: {type: "number"},

                                        total_incoming_docs: {type: "number"},
                                        total_outgoing_docs: {type:"number"},
                                        total_error_docs: {type:"number"},


                                        atom_id: {type: "string"},
                                        atom_name: {type: "string"},
                                        process_id: {type: "string"},
                                        process_name: {type: "string"},
                                        step_count:{type: "number"},
                                        execution_mode: {type:"string"},
                                        execution_type: {type:"string"},
                                        account:{type:"string"},
                                        component_version: {type: "number"}
                                    }
                                }
                            },
                            aggregate: _this.aggregates

                        },
                        columns: columns,
                        dataBound: function (e)
                        {
                            var grid = this;
                            uiSvc.dataBoundKendoGrid(grid, clickEvent, true, true, _this.functions.persistGridState);
                        }
                    };

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
                    };

                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    let columns = _this.functions.buildColumns();
                    dataSvc.filterTransactionColumns(columns).then(function(filteredColumns)
                    {
                        _this.functions.initGrid(filteredColumns);
                        _this.model.rebuild.value += 1;
                    }
                    ).catch(function(err)
                    {

                    });
                };
                //</editor-fold>

                // when the mode changes we need to redraw
                $scope.$watch("vmGridDetail.mode", function (newValue, oldValue) {
                    // routine to watch the doc type for changes, the moment it changes, redraw the grid
                    if (newValue != oldValue)
                    {
                        _this.mode = parseInt(newValue);
                        _this.functions.initView();
                    }
                });

                _this.rebuild = 0;
                _this.functions.initView();
            }
        }
    }]);

});

