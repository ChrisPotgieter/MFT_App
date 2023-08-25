/*
 /// <summary>
 /// app.modules.iib_v2.directives - iibTransactionGrid
 /// Directive to display the IIB/ACE Transaction Grid based on MongoDB

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/03/2019
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('iibTransactionGrid', ['$filter','$state', '$timeout', 'uiSvc', 'cacheDataSvc', 'iibv2DataSvc', function($filter, $state, $timeout, uiSvc, cacheDataSvc, iibv2DataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                listCode:'@',
                gridType:'@',
                functionManager:'=?'
            },
            controllerAs:'vm',
            templateUrl: "app/modules/iib_v2/directives/iibTransactionGrid.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false, showExport: false, allSelected: false}, metaFields:{}, selectedRows:[]};


                //<editor-fold desc="Functions">
                _this.functions.jobHeaderTemplate = function(dataItem)
                {
                    // routine to show the job name
                    if ($scope.grid)
                    {
                        var title =  "Job Id: " + dataItem.value;
                        var row = lodash.find($scope.vm.data, {job_id: dataItem.value});
                        if (row)
                        {
                            title +=  " (" + row.job_name + ")";

                        }
                        return title;
                    }
                };

                _this.functions.buildMetaIndexColumns = function()
                {
                    // routine to update the grid with meta-index model and column definitions
                    if (_this.listCode == null || _this.listCode == '')
                        return;

                    var columns = [];
                    var title = "Meta-Data";
                    var listType = _this.gridType == "1" ? "IIB_APP" : "IIB_JOB";

                    var documentRecord = cacheDataSvc.getListRecord("1", listType, _this.listCode, null);
                    if (documentRecord != null)
                    {
                        _this.model.metaFields = documentRecord.jsonData.metadata;
                        lodash.forEach(_this.model.metaFields, function(field)
                        {
                            var schema_name = lodash.camelCase(field.name);
                            _this.gridOptions.dataSource.schema.model.fields[schema_name] = {type:"string"};
                            if (!field.width)
                                field.width = 300;
                            var modelName = field.name;
                            if (field.displayName)
                                modelName = field.displayName;
                            columns.push(
                                {
                                    field: "meta_data." + modelName,
                                    title: field.filter.caption,
                                    width: field.width + "px"
                                })
                        });
                    }
                    if (columns.length > 0) {
                        _this.gridOptions.columns.splice(2, 1, {title: title, columns: columns});
                        _this.columnRebuild += 1; // force grid rebuild

                    }
                };

                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    _this.functions.persistGridState(model);

                    // manage the gwid drill
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.export = function()
                {
                    // manage the export
                    let exportRows = [];
                    let resubmitRows = [];
                    lodash.forIn(_this.model.selectedRows, function (value, key)
                    {
                        if (value && value.export)
                            exportRows.push(key);
                        if (value && value.resubmit)
                            resubmitRows.push(key);

                    });
                    if (_this.functionManager != null && _this.functionManager.export != null)
                        _this.functionManager.export({export: exportRows, resubmit: resubmitRows});
                };

                _this.functions.persistGridState = function(model)
                {
                    // routine to persist the current grid state to the in-memory store
                    if (_this.functionManager != null && _this.functionManager.persistState != null)
                        _this.functionManager.persistState(model, $scope.grid);
                };



                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();
                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Transaction Listing.xlsx",
                            allPages: true
                        },
                        sortable: true,
                        groupable: true,
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
                                        job_id: {type: "string"},
                                        department_id: {type: "number"},
                                        broker_id: {type: "string"},
                                        execution_group_id: {type: "string"},
                                        application_id: {type: "string"},
                                        flow_name: {type: "string"},
                                        flow_uuid: {type: "string"},
                                        flow_thread_id: {type: "string"},
                                        running_time: {type: "number"},
                                        node_count: {type: "number"},
                                        module: {type: "string"},
                                        sla: {type: 'string'},
                                        action_date: {type: "date"},
                                        complete_date: {type: "date"},
                                        sys_date: {type: "date"},
                                        status: {type: "string"},
                                        trans_type: {type: "string"},
                                        module_status: {type: "number"},
                                        name: {type: "string"},
                                        supplemental: {type: "string"},
                                        transTypeDesc: {type: "string"},
                                        operationDesc: {type: "string"},
                                        moduleDesc: {type: "string"},
                                        slaClassDesc: {type: "string"},
                                        job_name: {type: "string"},
                                        departmentDesc: {type: "string"},
                                        originatorUser: {type: "string"},
                                        originatorHost: {type: "string"},
                                        progress_perc: {type: "number"},
                                    }
                                }
                            },
                            aggregate:
                                [   {field: "node_count", aggregate: "sum"},
                                    {field: "transactionId", aggregate: "count"},
                                    {field: "running_time", aggregate: "sum"},
                                    { field: "action_date", aggregate: "count" }

                                ]

                        },
                        columns: [
                            {
                                field: "job_name",
                                title: "Job Name",
                                width: "250px"
                            },
                            {
                                field: "name",
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
                            {
                                field: "broker_id",
                                title: "Node",
                                width: "200px"
                            },
                            {
                                field: "execution_group_id",
                                title: "Int. Server",
                                width: "200px"
                            },
                            {
                                field: "application_id",
                                title: "Application",
                                width: "250px"
                            },
                            {
                                field: "flow_name",
                                title: "Name",
                                width: "200px"
                            },
                            {
                                field: "flow_uuid",
                                title: "UUID",
                                width: "300px"
                            },
                            {
                                field: "flow_thread_id",
                                title: "Thread",
                                width: "100px",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            },
                            {
                                field: "node_count",
                                title: "Node Count",
                                width: "150px",
                                groupable: false,
                                aggregates: ["sum"],
                                footerTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                groupFooterTemplate: "<div style=\"text-align: right\">#=sum#</div>",
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"}
                            },
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
                                field: "module_status",
                                title: "Error Code",
                                width: "150px",
                                groupable: false,
                                attributes: {
                                    style: "text-overflow:ellipsis;white-space:nowrap;",
                                }
                            },
                            {
                                field: "progress_perc",
                                title: "Progress",
                                width: "370px",
                                template: "<div class=\'progress\' style=\'height:20px;margin: 0px;\'></div>",
                                filterable: false,
                                groupable: false
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
                                field: "originatorHost",
                                title: "Host",
                                width: "400px"
                            },
                            {
                                field: "originatorUser",
                                title: "User",
                                width: "200px"
                            },
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
                                width: "300px",
                                groupHeaderTemplate: _this.functions.jobHeaderTemplate
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
                        ],
                        dataBound: function (e) {
                            var grid = this;

                            // setup the progress bars and resubmit count
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true, true, _this.functions.persistGridState);
                        }
                    };

                    if (_this.gridType == "2")
                    {
                        // update the grid options to group by job id
                        _this.gridOptions.sort = [
                            {field: "job_id", dir: "desc"},
                            {field: "complete_date", dir: "desc"},
                            {field: "transactionId", dir: "desc"}
                        ];
                        _this.gridOptions.excel.fileName = "Job Transaction Listing.xlsx";
                        _this.gridOptions.dataSource.group = {
                            field: "job_id",
                            dir:"desc",
                            aggregates: [
                                { field: "node_count", aggregate: "sum" },
                                { field: "action_date", aggregate: "count" },
                                {field: "transactionId", aggregate: "count"},
                                { field: "running_time", aggregate: "sum" }
                            ]
                        };
                    }
                    else
                    {
                        _this.gridOptions.columns.unshift(
                        {
                            field: "select",
                            title: "Select",
                            width: "60px",
                            filterable: false,
                            groupable: false,
                            sortable: false,
                            scrollable: true,
                            menu: false,
                            resizable: false,
                            reorderable: false,
                            //hidden: !_this.model.flags.showExport,
                            sticky: true,
                            stickable: true,
                            headerTemplate: function()
                            {
                                return 'Select <input type="checkbox" name="headerCheck" ng-change="vm.functions.selectAll();", ng-model="vm.model.flags.allSelected">';
                            },
                            template: function(dataItem)
                            {
                                if (dataItem.security.resubmit || dataItem.security.export)
                                {
                                    return '<input type="checkbox" name="transactionCheckbox[]" ng-change="vm.functions.selectTransaction(dataItem);" ng-model="vm.model.selectedRows[\'' + dataItem.transactionId + '\']">';
                                }
                                else
                                    return '<span></span>';
                            }
                        });
                        _this.gridOptions.toolbar.push({name: "Export", text:"Export Payloads", template: kendo.template($("#templateExport").html())});
                    }

                    // merge the additional options
                    _this.columnRebuild = 0;

                    // force a timing based column rebuild when initialially coming into the screen for the first time incase kendo is still initializing
                    $timeout(function ()
                    {
                        if (_this.functionManager != null && _this.functionManager.initializeState != null)
                        {
                            _this.functionManager.initializeState(_this.gridOptions);
                            var identifiers = lodash.find(_this.gridOptions.columns, {title:"Identifier Information"});
                            if (identifiers != null)
                            {
                                 var jobIdfield = lodash.find(identifiers.columns, {field:"job_id"});
                                 if (jobIdfield != null)
                                    jobIdfield.groupHeaderTemplate = _this.functions.jobHeaderTemplate;
                            }
                        }
                        //_this.columnRebuild += 1; // force grid rebuild
                    }, 500);
                };

                _this.functions.selectAll = function()
                {
                    let selected = _this.model.flags.allSelected;
                    if (!selected)
                    {
                        _this.model.selectedRows = {};
                        return;
                    }
                    _this.model.selectedRows = {};
                    let grid = $scope.grid;
                    var gridData = grid.dataSource.data();
                    for (var i = 0; i < gridData.length; i++)
                    {

                        let model = gridData[i];
                        if (model.security.resubmit || model.security.export)
                            _this.model.selectedRows[model.transactionId] = {export: model.security.export, resubmit: model.security.resubmit};
                    }
                };
                //</editor-fold>

                // When the Meta Data Trigger changes we need to change the meta-data
                $scope.$watch("vm.listCode", function(newValue, oldValue)
                {
                    // routine to watch the doc type for changes, the moment it changes, redraw the grid
                    if ((newValue != oldValue) || (newValue && _this.columnRebuild == 0))
                    {
                        _this.functions.buildMetaIndexColumns();
                    }
                });

                $scope.$on("kendoWidgetCreated", function(event, widget)
                {
                    // when the widget gets created set the data or watch the data variable for changes
                    if ($scope.grid === widget)
                    {
                        uiSvc.addKendoGridTooltip("supplementalStatus", $scope.grid, "supplemental");

                        if (_this.functionManager != null)
                            _this.functionManager.grid = $scope.grid;

                        // when the widget gets created set the data or watch the data variable for changes
                        $scope.$watchCollection("vm.data", function(newValue, oldValue)
                        {
                            // update the grid the moment the data changes - no need for observable array
                            if (!_this.model.flags.watched)
                                _this.model.flags.watched = true;
                            uiSvc.displayKendoLoader("#grid", true);

                            // update the export flag and if necessary rebuild the columns
                            if (_this.gridType != "2")
                            {
                                _this.model.flags.allSelected = false;
                                _this.model.selectedRows = {};
                                let prevFlag = _this.model.flags.showExport;
                                let hasResubmit = lodash.find(newValue, function(o)
                                {
                                    return (o.security.resubmit === true || o.security.export === true);
                                });
                                _this.model.flags.showExport = (hasResubmit != null);
                                if (prevFlag != _this.model.flags.showExport)
                                {
                                    //_this.gridOptions.columns[0].hidden = !_this.model.flags.showExport;
                                    _this.gridOptions.columns[0].locked = hasResubmit != null;
                                    _this.columnRebuild += 1;
                                }
                            }

                            // update the grid progress
                            $timeout(function ()
                            {
                                if (newValue != null) {
                                    $scope.grid.dataSource.data(newValue);
                                    _this.model.flags.watched = false;
                                }
                                $scope.grid.dataSource.page(1);

                                if (_this.functionManager != null && _this.functionManager.loadState != null)
                                {
                                    _this.functionManager.loadState($scope.grid);
                                }
                                uiSvc.displayKendoLoader("#grid", false);
                            });
                        }, true);
                    }
                });

                _this.functions.initView();
            }
        }
    }]);

});

