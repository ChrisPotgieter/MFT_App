/*
 /// <summary>
 /// app.modules.spe.directives - mqaspeCompleteKendoGrid
 /// Directive to display the Last 100 SPE Transactions in a Kendo Grid
 /// I am using Kendo here because DataTable while working it has proved too complicated to setup with customizations

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/01/2017
 /// </summary>
 */

define(['modules/spe/module', 'lodash', 'jszip'], function (module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mqaSpeCompleteKendoGrid', ['$filter', '$state', '$timeout', '$interpolate', 'uiSvc', 'cacheDataSvc', 'transactionReportingSvc', 'userSvc', function ($filter, $state, $timeout, $interpolate, uiSvc, cacheDataSvc, transactionReportingSvc, userSvc) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
                mode: '@', // 0  - transaction (no group), 1 - transaction  (job group), 2 - dashboard view (no group), 3 - dashboard view (job group)
                refreshFlag: '=',
                functionManager: '=?'
            },
            controllerAs: 'vmGridDetail',
            templateUrl: "app/modules/spe/directives/mqaSpeCompleteKendoGrid.tpl.html",
            controller: function ($element, $scope) {

                var _this = this;
                _this.functions = {};
                _this.model = {flags: {watched: false, gridCreated: false}, rebuild: {value: 0}};

                // load the template that will be used for in progress displays
                cacheDataSvc.loadTemplate("app/modules/spe/partials/transaction-grid-itx-info.tpl.html", "transaction-grid-itx-info.tpl.html").then(function (html) {
                    _this.model.dynamicHTML = html;
                });


                //<editor-fold desc="Functions">
                _this.functions.jobHeaderTemplate = function (dataItem) {
                    // routine to show the job name
                     var title = "Job Id: " + dataItem.value;
                     var row = lodash.find(_this.data, {job_id: dataItem.value});
                     if (row)
                     {
                        title += " (" + row.job_name + ")";
                     }
                     return title;
                };

                _this.functions.addITXInfoTooltip = function (grid) {
                    // routine to add a tooltip for in progress records
                    var element = $(grid.wrapper);
                    element.kendoTooltip({
                        filter: ".itxInfo",
                        position: "center",
                        content: function (e) {
                            let dataItem = grid.dataItem(e.target.closest("tr"));
                            let data = {system: dataItem["system"], container: dataItem["container"], map: dataItem["map"]};
                            return _this.functions.compileTooltipContent(data);
                        }
                    }).data("kendoTooltip");
                };

                _this.functions.compileTooltipContent = function (data) {
                    // routine to send the dynamic content for interpolation when the user has requested the tooltop
                    if (_this.model.dynamicHTML) {
                        let dataObject = {data: data};
                        let htmlContent = $interpolate(_this.model.dynamicHTML)(dataObject);
                        return htmlContent;
                    } else
                        return "HTML Template Not Rendered";
                };

                _this.functions.drill = function (model) {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.dashboardDrill = function (model)
                {
                    // routine to navigate to the transaction
                    let baseState = $state.$current.parent;
                    transactionReportingSvc.navigateTransaction(baseState.name + ".reporting.transactionDetail.jobview", {
                        transactionId: model._id,
                        transactionType: 2
                    });
                };

                _this.functions.buildColumns = function () {
                    // set the height
                    _this.height = "500px";

                    // based on the mode set build the right columns
                    // routine to build the required columns based on the mode
                    let identifierColumns = [
                        {
                            field: "file_name",
                            title: "File",
                            width: "400px"
                        },
                        {
                            field: "_id",
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
                            groupHeaderTemplate: _this.functions.jobHeaderTemplate
                        },
                        {
                            field: "department_id",
                            title: "Department",
                            width: "200px",
                            template: function (dataItem) {
                                if (dataItem.department_id) {
                                    return cacheDataSvc.getDepartmentDesc(parseInt(dataItem.department_id));
                                } else
                                    return "Unknown";
                            }
                        },
                        {
                            field: "sla",
                            title: "SLA Class",
                            width: "100px"
                        }
                    ];
                    let statusColumns = [
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
                        }];
                    let itxColumns = null;
                    let mainColumns = null;
                    if (_this.mode <= 1)
                    {

                        itxColumns = [
                            {
                                field: "sender_id",
                                title: "Sender",
                                width: "150px"
                            },
                            {
                                field: "receiver_id",
                                title: "Receiver",
                                width: "150px"
                            },
                            {
                                field: "document_type",
                                title: "Type",
                                width: "150px"
                            },
                            {
                                field: "map",
                                title: "Map Name",
                                width: "200px",

                           },
                            {
                                field: "system",
                                title: "System",
                                width: "300px",
                            },
                            {
                                field: "container",
                                title: "Container",
                                width: "200px"
                            },

                            {
                                field: "envelope_name",
                                title: "Envelope Name",
                                width: "400px"
                            },
                            {
                                field: "envelope_type",
                                title: "Envelope Type",
                                width: "150px"
                            },
                            {
                                field: "direction_disp",
                                title: "Direction",
                                width: "120px"
                            },
                            {
                                field: "interchange_control_number",
                                title: "Interchange Control Num",
                                width: "200px"
                            },
                            {
                                field: "compliance_status",
                                title: "Interchange Status",
                                width: "200px"
                            },
                            {
                                field: "standard",
                                title: "EDI Standard",
                                width: "150px"
                            },
                            {
                                field: "environment",
                                title: "Environment",
                                width: "200px"
                            },
                        ];
                        mainColumns = [
                            {
                                field: "job_name",
                                title: "Job Name",
                                width: "250px"
                            },
                            {
                                field: "transaction_name",
                                title: "Transaction Step",
                                width: "250px"
                            },
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

                        ];
                    }
                    else
                    {
                        itxColumns = [
                            {
                                field: "sender_id",
                                title: "Sender",
                                width: "150px",
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "contains",
                                        inputWidth: 160
                                    }
                                }
                            },
                            {
                                field: "receiver_id",
                                title: "Receiver",
                                width: "150px",
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "contains",
                                        inputWidth: 160
                                    }
                                }

                            },
                            {
                                field: "document_type",
                                title: "Type",
                                width: "150px",
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "contains",
                                        inputWidth: 160
                                    }
                                }
                            },
                            {
                                field: "direction_disp",
                                title: "Direction",
                                width: "120px",
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "eq",
                                        inputWidth: 90
                                    }
                                }
                            },
                            {
                                field: "compliance_status",
                                title: "Compliance",
                                width: "70px",
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "eq",
                                        inputWidth: 60
                                    }
                                }
                            },
                            {
                                field: "interchange_control_number",
                                title: "Control",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                filterable: false,
                                width: "80px"
                            },
                        ];

                        mainColumns = [
                            {
                                field: _this.mode == 2 ? "job_name" : "transaction_name",
                                title: _this.mode == 2 ? "Job Name" : "Transaction Step",
                                width: "220px",
                                attributes:
                                    {
                                        class: "itxInfo"
                                    },
                                filterable: {
                                    cell: {
                                        showOperators: false,
                                        operator: "contains",
                                        inputWidth: 200
                                    }
                                },
                                footerTemplate: "No. of Transactions: #=count#",
                                groupFooterTemplate: "No. of Transactions: #=count#"

                            },
                            {
                                field: "complete_date",
                                title: "Completed",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "200px",
                                filterable: {
                                    cell: {
                                        inputWidth: 180
                                    }
                                }
                            }
                        ];

                        _this.aggregates.push(
                            {
                                field: mainColumns[0].field, aggregate: "count"
                            });
                    }
                    let statsColumns = [
                        {
                            field: "edi_transaction_count",
                            title: "Count",
                            width: "100px",
                            filterable: false,
                            groupable: false,
                            aggregates: ["sum"],
                            format: '{0:n0}',
                            footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                            groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                        }, {
                            field: "edi_transaction_value",
                            title: "Value",
                            width: "150px",
                            filterable: false,
                            groupable: false,
                            aggregates: ["sum"],
                            format: '{0:n2}',
                            footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                            groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"}
                        }, {
                            field: "balance_flag",
                            title: "Balancing",
                            filterable: false,
                            width: "120px",
                            template: function (dataItem)
                            {
                                if (dataItem.balance_flag == 1)
                                    return "Balanced";
                                if (dataItem.balance_flag == 0)
                                    return "Out of Balance";
                                return "N/A";
                            }
                        },
                        {
                            field: "no_files",
                            title: "ST Count",
                            width: "80px",
                            filterable: false,
                            groupable: false,
                            aggregates: ["sum"],
                            footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                            groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"}
                        },
                        {
                            field: "no_bytes",
                            title: "Total Bytes",
                            width: "150px",
                            filterable: false,
                            groupable: false,
                            aggregates: ["sum"],
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                            template: function (dataItem) {
                                return $filter("bytesFilter")(dataItem.no_bytes);
                            },
                            footerTemplate: function (dataItem) {
                                var value;
                                if (dataItem.no_bytes)
                                    value = (dataItem.no_bytes.sum);
                                else
                                    value = dataItem.sum;
                                if (value == null)
                                    return null;
                                return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                            },
                            groupFooterTemplate: function (dataItem) {
                                return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.no_bytes.sum);
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
                    ];

                    if (_this.mode <= 1) {
                        statsColumns.push(
                            {
                                field: "no_acknowledgements",
                                title: "Acknowledgments",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            });
                        statsColumns.push(
                            {
                                field: "no_envelopes",
                                title: "Envelopes",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            });
                        statsColumns.push(
                            {
                                field: "no_transactions",
                                title: "TS Segments",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            });
                        statsColumns.push(
                            {
                                field: "no_groups",
                                title: "GS Segments",
                                width: "150px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            });

                    }

                    // now build the final list of columns and return it
                    let finalColumns = [];

                    // add the main columns
                    finalColumns = lodash.concat(finalColumns, mainColumns);
                    if (_this.mode <= 1) {

                        // transaction view - stats
                        finalColumns.push({title: "Statistics", columns: statsColumns});

                        // transaction view - itxa columns
                        finalColumns.push({title: "ITX Information", columns: itxColumns});

                        // transaction view - stats columns
                        finalColumns.push({title: "Status Information", columns: statusColumns});

                        // transaction view - identifier columns
                        finalColumns.push({title: "Identifier Information", columns: identifierColumns});

                        // add the additional aggregates
                        _this.aggregates.push({field: "no_acknowledgements", aggregate: "sum"});
                        _this.aggregates.push({field: "no_envelopes", aggregate: "sum"});
                        _this.aggregates.push({field: "no_groups", aggregate: "sum"});
                        _this.aggregates.push({field: "no_transactions", aggregate: "sum"});
                    } else
                    {
                        if (_this.mode == 3)
                            finalColumns.push({field: "job_id", title: "Job Id", width: "400px", groupHeaderTemplate: _this.functions.jobHeaderTemplate, hidden: true});

                        // dashboard view - itx columns
                        finalColumns = lodash.concat(finalColumns, itxColumns);

                        // dashboard view - stats columns
                        finalColumns = lodash.concat(finalColumns, statsColumns);

                    }
                    return finalColumns;
                };

                _this.functions.initView = function () {
                    // routine to initialize the view when the directive is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();

                    _this.aggregates = [
                        {field: "no_files", aggregate: "sum"},
                        {field: "no_bytes", aggregate: "sum"},
                        {field: "edi_transaction_count", aggregate: "sum"},
                        {field: "edi_transaction_value", aggregate: "sum"},
                        {field: "_id", aggregate: "count"},
                        {field: "running_time", aggregate: "sum"}
                    ];

                    let columns = _this.functions.buildColumns();
                    let clickEvent = null;
                    if (_this.mode == 0 || _this.mode == 1) // reportview (job or transaction)
                    {
                        clickEvent = _this.functions.drill;
                    } else {
                        clickEvent = _this.functions.dashboardDrill;
                    }
                    ;

                    if (_this.functionManager == null)
                        _this.functionManager = {};



                    _this.gridOptions = {
                        sortable: true,
                        groupable: (_this.mode <= 1),
                        filterable: (_this.mode <= 1) ? true : {mode: "row"},
                        columnMenu: false,
                        resizable: true,
                        scrollable: true,
                        pageable:
                            {
                                pageSizes: pageSizes

                            },
                        selectable: "row",
                        dataSource:
                            {
                                pageSize: pageSizes[0],
                                sort:
                                    [
                                        {field: "action_date", dir: "desc"}
                                    ],
                                schema:
                                    {
                                        model:
                                            {
                                                id: "_id",
                                                uid: "_id",
                                                fields:
                                                    {
                                                        _id: {type: "string"},
                                                        action_date: {type: "date"},
                                                        complete_date: {type: "date"},
                                                        sender_id: {type: "string"},
                                                        receiver_id: {type: "string"},
                                                        document_type: {type: "string"},
                                                        job_name: {type: "string"},
                                                        job_id: {type: "string"},
                                                        is_error: {type: "boolean"},
                                                        envelope_name: {type: "string"},
                                                        envelope_type: {type: "string"},
                                                        environment: {type: "string"},
                                                        standard: {type: "string"},
                                                        interchange_control_number: {type: "string"},
                                                        compliance_status: {type: "string"},
                                                        supplemental: {type: "string"},
                                                        company_id: {type: "number"},
                                                        department_id: {type: "number"},
                                                        sla: {type: "string"},
                                                        status: {type: "number"},
                                                        status_desc: {type: "string"},
                                                        transaction_name: {type: "string"},
                                                        no_acknowledgements: {type: "number"},
                                                        no_bytes: {type: "number"},
                                                        no_envelopes: {type: "number"},
                                                        error_events: {type: "number"},
                                                        exec_time: {type: "number"},
                                                        no_files: {type: "number"},
                                                        no_groups: {type: "number"},
                                                        edi_transaction_count: {type: "number"},
                                                        edi_transaction_value: {type: "number"},
                                                        success_events: {type: "number"},
                                                        total_events: {type: "number"},
                                                        no_transactions: {type: "number"},
                                                        direction_disp: {type: "string"},
                                                        direction: {type: "string"},
                                                        balance_flag: {type: "number"},
                                                        file_name: {type: "string"}
                                                    }
                                            }
                                    },
                                aggregate: _this.aggregates


                            },
                        columns: columns,
                        dataBound: function (e) {
                            var grid = this;
                            uiSvc.dataBoundKendoGrid(grid, clickEvent, true, false, _this.functions.persistState);

                        }
                    };

                    // group by job if applicable
                    if (_this.mode == 1 || _this.mode == 3) {
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
                    if (_this.mode <= 1)
                    {
                        _this.gridOptions.toolbar =  ["excel"];
                        _this.gridOptions.excel =  {
                        fileName: "Transaction Listing.xlsx",
                            allPages: true
                        };
                    }

                    // add the tooltips to the grid
                    _this.functionManager.gridCreate = function (grid)
                    {
                        _this.model.flags.gridCreated = true;
                        uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");
                        _this.functions.addITXInfoTooltip(grid);
                    };

                };


                // when the mode changes we need to redraw
                $scope.$watch("vmGridDetail.mode", function (newValue, oldValue) {
                    // routine to watch the doc type for changes, the moment it changes, redraw the grid
                    if (newValue != oldValue) {
                        _this.functions.initView();
                        _this.model.rebuild.value += 1;
                    }
                });
                //</editor-fold>

                _this.functions.initView();

                // set the rebuild flag
                _this.rebuild = 0;


            }
        }
    }]);
});



