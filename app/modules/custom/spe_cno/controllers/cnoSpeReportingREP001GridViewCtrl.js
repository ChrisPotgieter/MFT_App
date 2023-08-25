/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoSpeReportingREP001GridViewCtrl.js
 /// Controller to Manage CNO Report REP001 - GridView
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/04/2018
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash', 'jszip'], function (module, lodash)
{
    "use strict";
    module.registerController('cnoSpeReportingREP001GridViewCtrl', ['$scope', '$state','$filter','uiSvc','transactionReportingSvc',function ($scope, $state, $filter,uiSvc, transactionReportingSvc)
    {
        var _this = this;
        _this.widget = {};
        _this.flags = {userSave: false};

        // add the functions
        _this.functions = [];
        _this.functions.findSubmitter = function(group)
        {

            var name = group.value;
            if (name.startsWith("ZTOTAL"))
                return "Grand Total - All Companies";
            if (name.startsWith("ZMATCH"))
                return "Grand Total Company - " + name.split("!")[1];


            // get the right code (receiver or submitter)
            var values = name.split('_');
            var name = values[0];
            var type = parseInt(values[1]);
            var record = lodash.find($scope.vm.model.lists.submitters, function(item)
            {
                if (type == 0)
                    return item.jsonData.receiver_p_id == name;
                else
                    return item.jsonData.submitter_id == name;
            });
            if (record)
            {
                name = "Company - " + record.jsonData.match_company + " (";
                if (type == 0)
                    name += record.jsonData.receiver_p_id;
                else
                    name += record.jsonData.submitter_id;
                name += ")";
            }
            return name;
        }


        _this.initializeState = function(options)
        {
            // routine to manage the grid state initialization
            var reportingInfo = transactionReportingSvc.getBaseReportingInfo($scope.vm.model.filterName);
            if (reportingInfo == null)
                return;
            if (reportingInfo.gridState && reportingInfo.gridState.grid)
            {
                uiSvc.loadKendoGridState(options, reportingInfo.gridState.grid);
                if (reportingInfo.reset)
                    reportingInfo.gridState.grid = null;
            }
        };


        _this.persistUserState = function (settingsObject)
        {
            // routine to persist the filter and grid information to a user settings object
            var grid = _this.widget;
            var state = uiSvc.saveKendoGridState(grid);
            settingsObject.info = {filterObject: $scope.vm.model.filter, gridState: {grid: state}};
        }


        // set the options
        _this.gridOptions  = {
            toolbar: ["excel"],
            excel: {
                fileName: "REP001.xlsx",
                allPages: true,
            },
            excelExport: function(e)
            {

                var rows = e.workbook.sheets[0].rows;
                for (var ri = 0; ri < rows.length; ri++) {
                    var row = rows[ri];

                    if (row.type == "group-footer" || row.type == "footer")   {
                        for (var ci = 0; ci < row.cells.length; ci++) {
                            var cell = row.cells[ci];
                            if (cell.value)
                            {
                                // Use jQuery.fn.text to remove the HTML and get only the text
                                if (cell.value.startsWith("<div"))
                                    cell.value = $(cell.value).text();
                                cell.value = cell.value.replace(/,/g , "");
                                if (!isNaN(cell.value))
                                    cell.value = parseInt(cell.value);
                                // Set the alignment
                                cell.hAlign = "right";
                            }
                        }
                    }
                    if (row.type == "header")
                    {
                        for (var ci = 0; ci < row.cells.length; ci++)
                        {
                            var cell = row.cells[ci];
                            if (cell.value != null)
                            {
                                cell.hAlign = "right";
                                if (cell.value !== "Total" && cell.value !== "Information" && cell.value != "Successful")
                                    cell.background = "#ff0000";
                                if (cell.value == "Successful")
                                    cell.background = "#008000";
                                if (cell.value == "Information")
                                {
                                    cell.hAlign = "left";
                                }
                                if (cell.value == "Errors Encountered") {
                                    cell.hAlign = "center";
                                }
                            }

                        }
                    }
                }

                // add the title
                var docType = lodash.find($scope.vm.model.lists.documentTypes, {code: $scope.vm.model.filter.docType});
                var rows = e.workbook.sheets[0].rows;
                rows.unshift({cells:[ { value: "",colSpan: 7 }]});
                rows.unshift({cells:[ { value: "Type: " + docType.description , bold: true, colSpan: 7 }]});
                rows.unshift({cells:[ { value: "Period:" + $filter("localUTCDateFilter")($scope.vm.model.dateRange.startDate) + " To " + $filter("localUTCDateFilter")($scope.vm.model.dateRange.endDate)  , bold: true, colSpan: 7 }]});
                rows.unshift({cells: [{ value: "Document Status Report (REP001)", bold: true, colSpan: 7 }]});
                e.workbook.sheets[0].freezePane = {rowSplit:6, colSplit: 2};

            },
            sortable: true,
            groupable: false,
            filterable: true,
            columnMenu: true,
            resizable: true,
            scrollable: true,
            reorderable: true,
            selectable: "row",
            dataSource: {
                sort: [
                    {field:"submitterID", dir:"asc"},
                    {field: "oid", dir: "asc"}
                ],
                schema: {
                    model: {
                        id: "oid",
                        uid: "oid",
                        fields: {
                            oid: {type: "number"},
                            submitterID: {type: "string"},
                            docSubType: {type: "string"},
                            total: {type: "number"},
                            successful: {type: "number"},
                            complianceErrors: {type: "number"},
                            ccnDupErrors: {type: "number"},
                            preEditErrors: {type: "number"}

                        }

                    }
                },
                group: {
                    field: "submitterID",
                    dir:"asc",
                    aggregates: [
                        {
                            field: "total",
                            aggregate: "sum"
                        },
                        {
                            field: "successful",
                            aggregate: "sum"
                        },
                        {
                            field:"complianceErrors",
                            aggregate: "sum"
                        },
                        {
                            field:"ccnDupErrors",
                            aggregate: "sum"
                        },
                        {
                            field:"preEditErrors",
                            aggregate:"sum"
                        }
                    ]
                },
                aggregate:[
                    {
                        field: "total",
                        aggregate: "sum"
                    },
                    {
                        field: "successful",
                        aggregate: "sum"
                    },
                    {
                        field:"complianceErrors",
                        aggregate: "sum"
                    },
                    {
                        field:"ccnDupErrors",
                        aggregate: "sum"
                    },
                    {
                        field:"preEditErrors",
                        aggregate:"sum"
                    }
                ]
            },
            columns: [
                {
                    field:"oid",
                    title:"Id",
                    hidden: true
                },
                {
                    field:"submitterID",
                    hidden:true,
                    groupHeaderTemplate: _this.functions.findSubmitter
                },
                {
                    field: "docSubType",
                    title: "Information",
                    width: "200px",
                    groupFooterTemplate: "Total",
                    filterable: true

                },
                {
                    filterable: false,
                    field: "total",
                    title: "Total",
                    width: "100px",
                    attributes:{style:"text-align:right;"},
                    headerAttributes:{style:"text-align:right;"},
                    format:"{0:n0}",
                    aggregates:["sum"],
                    groupFooterTemplate: "<div style='text-align:right'>#= kendo.toString(sum, 'n0') #</div>"
                },
                {
                    filterable: false,
                    field: "successful",
                    title: "Successful",
                    width: "100px",
                    attributes:{style:"text-align:right;"},
                    headerAttributes:{style:"text-align:right;"},
                    format:"{0:n0}",
                    aggregates:["sum"],
                    groupFooterTemplate: "<div style='text-align:right'>#= kendo.toString(sum, 'n0') #</div>"

                },
                {
                    title: "Errors Encountered",
                    columns:[
                        {
                            filterable: false,
                            field: "complianceErrors",
                            title: "Compliance",
                            width: "100px",
                            aggregates:["sum"],
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"},
                            format:"{0:n0}",
                            groupFooterTemplate: "<div style='text-align:right'>#= kendo.toString(sum, 'n0') #</div>"
                        },
                        {
                            field: "ccnDupErrors",
                            filterable: false,
                            title: "CCN Dup",
                            width: "100px",
                            aggregates:["sum"],
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"},
                            format:"{0:n0}",
                            groupFooterTemplate: "<div style='text-align:right'>#= kendo.toString(sum, 'n0') #</div>"
                        },
                        {
                            field: "preEditErrors",
                            filterable: false,
                            title: "Pre-Edit",
                            width: "100px",
                            aggregates:["sum"],
                            attributes:{style:"text-align:right;"},
                            headerAttributes:{style:"text-align:right;"},
                            format:"{0:n0}",
                            groupFooterTemplate: "<div style='text-align:right'>#= kendo.toString(sum, 'n0') #</div>"
                        }
                    ]
                }
            ]
        };

        // check for custom options
        _this.initializeState(_this.gridOptions);

        // add custom functions have might have been lost
        var submitterField = lodash.find(_this.gridOptions.columns, {field:"submitterID"});
        if (submitterField != null)
            submitterField.groupHeaderTemplate = _this.functions.findSubmitter;


    }]);
});
