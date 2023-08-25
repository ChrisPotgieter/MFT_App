/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - aegfTransactionGrid.js
 /// Directive to Manage Display of Transactions for the Automated Employer Group Files Sub-System
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/06/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('aegfTransactionGrid', ['$filter', '$compile', 'uiSvc', 'cacheDataSvc', 'speCNODataSvc', function($filter, $compile, uiSvc, cacheDataSvc, dataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@', // 0 - transaction reporting, 1 - dashboard
                refreshFlag:'=',
                functionManager:'=?'
            },
            controllerAs:'vmGridDetail',
            templateUrl: 'app/modules/custom/spe_cno/directives/aegfTransactionGrid.tpl.html',
            controller: function($element, $scope)
            {

                let _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                // load the template that will be used for in progress displays
                cacheDataSvc.loadTemplate("app/modules/custom/spe_cno/partials/aegf-transaction-grid-current-progress.tpl.html", "aegf-transaction-grid-current-progress.tpl.html").then(function (html)
                {
                    _this.model.inProgressHTML = html;
                });



                //<editor-fold desc="Functions">
                _this.functions.compileContent = function(dataItem, type)
                {
                    let template = null;
                    if (type == 0)
                    {
                        template = "<span><a class=\"txt-color-blueDark\" style=\"text-decoration: underline\" ng-click=\"functionManager.viewPayload('" + dataItem.payload_id + "', '" + dataItem.payload_format + "');\" title=\"click here to View the Report\" >View " + dataItem.payload_format + "</a></span>";
                    }
                    else
                    {
                        template = "<span><a class=\"txt-color-blueDark\" style=\"text-decoration: underline\" ng-click=\"functionManager.viewDefinition('" + dataItem.definition_id + "');\" title=\"click here to View the Definition\" >View</a></span>";
                    }
                    let linkFn = $compile(template)($scope);
                    return linkFn[0].outerHTML;
                };

                _this.functions.compileTooltipContent = function(dataItem)
                {
                    // routine to send the dynamic content for interpolation when the user has requested the tooltop
                    if (_this.model.inProgressHTML)
                    {
                        let dataObject = {data: {supplemental: dataItem["in_progress"].supplemental, perc: dataItem["progress_perc"]}};
                        let htmlContent = $interpolate(_this.model.inProgressHTML)(dataObject);
                        return htmlContent;
                    }
                    else
                        return "HTML Template Not Rendered";
                };

                _this.functions.addInProgressTooltip = function(grid)
                {
                    // routine to add a tooltip for in progress records
                    let element = $(grid.wrapper);
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
                            let dataItem = grid.dataItem(e.target.closest("tr"));
                            return _this.functions.compileTooltipContent(dataItem);
                        }
                    }).data("kendoTooltip");
                };


                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                    else
                    {
                        dataSvc.aegf.functions.showDetail(model._id).then(function (result) {
                            _this.functionManager.refresh();
                        });
                    }
                };

                _this.functions.buildDataColumns = function()
                {
                    // routine to build the columns that will be returned
                    let returnColumns = [
                        {
                            field: "employer_desc",
                            title: "Employer Group",
                            width: "400px",
                            aggregates: ["count"],
                            footerTemplate: "No. of Executions: #=count#",
                            groupFooterTemplate: "No. of Executions: #=count#"

                        },
                        {
                            field: "employer_code",
                            title: "CRS Code",
                            width: "150px"
                        },

                        {
                            field: "sub_group_desc",
                            title: "Sub Group",
                            width: "400px"
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
                        {
                            field: "payload_id",
                            title: "View",
                            width: "180px",
                            template: function(dataItem)
                            {
                                if ((dataItem.payload_id) && (dataItem.payload_id != null && dataItem.payload_id!= ''))
                                    return _this.functions.compileContent(dataItem, 0);
                                return "";
                            }
                        },
                        {
                            field: "running_time",
                            title: "Running Time",
                            width: "250px",
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
                                let value;
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
                            field: "execution_type_desc",
                            title: "Execution Type",
                            width: "200px"
                        },
                        {
                            field: "statusDesc",
                            title: "Status",
                            width: "200px",
                            attributes: {
                                style: "text-overflow:ellipsis;white-space:nowrap;",
                                class: "statusDesc"
                            }
                        },
                        {
                            field: "moduleStatusDesc",
                            title: "Processing Status",
                            width: "200px",
                            attributes: {
                                style: "text-overflow:ellipsis;white-space:nowrap;",
                                class: "supplementalStatus"
                            }
                        },
                        {
                            field: "definition_id",
                            title: "Definition",
                            width: "200px",
                            template: function(dataItem)
                            {
                                return _this.functions.compileContent(dataItem, 1);
                            }
                        },
                        {
                            field: "transactionId",
                            title: "Transaction Id",
                            width: "300px"
                        },
                    ];
                    return returnColumns;
                }

                _this.functions.buildColumns = function()
                {
                    // routine to build up the columns used in the display
                    let dataColumns = _this.functions.buildDataColumns();
                    return dataColumns;
                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    let pageSizes = dataSvc.aegf.functions.getPageSizes();
                    if (_this.functionManager == null)
                        _this.functionManager = {};

                    let columns = _this.functions.buildColumns();

                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Request Listing.xlsx",
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
                                {field: "action_date", dir: "desc"},
                                {field: "transaction_id", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "transactionId",
                                    uid: "transactionId",
                                    fields: {
                                        transaction_id: {type: "string"},
                                        action_date: {type: "date"},
                                        complete_date: {type: "date"},
                                        sys_date: {type: "date"},
                                        supplemental: {type: "string"},

                                        status: {type: "number"},
                                        statusDesc: {type: "string"},
                                        module_status: {type: "number"},
                                        moduleStatusDesc: {type:"string"},

                                        employer_id: {type: "number"},
                                        employer_desc: {type:"string"},
                                        employer_code: {type:"string"},
                                        sub_group_id: {type: "number"},
                                        sub_group_desc: {type:"desc"},

                                        execution_type: {type: "number"},
                                        execution_type_desc: {type:"string"},

                                        definition_id:{type:"string"},
                                        payload_id: {type:"string"},
                                        payload_format: {type: "string"},

                                        progress_perc: {type: "number"},
                                        running_time: {type: "number"},

                                        in_progress: {type: "object"}
                                    }
                                }
                            },
                            aggregate:
                                [
                                    {field: "employer_desc", aggregate: "count"},
                                    {field: "running_time", aggregate: "sum"}
                                ]
                        },
                        columns: columns,
                        dataBound: function (e) {
                            let grid = this;
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true, true);
                        }
                    };


                    // add the tooltips to the grid
                    _this.functionManager.gridCreate = function(grid)
                    {
                        uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");
                        uiSvc.addKendoGridTooltip("statusDesc", grid, "statusDesc");
                    };


                    // set the height
                    _this.height = "500px";
                };


                //</editor-fold>

                _this.functions.initView();

                // set the rebuild flag
                _this.rebuild = 0;

            }
        }
    }]);

});


