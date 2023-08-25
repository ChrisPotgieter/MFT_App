/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftMonitorGrid
 /// Directive to display the MFT V2 Monitor Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mftMonitorGrid', ['$compile', '$filter','$state', '$timeout', 'uiSvc', function($compile, $filter, $state, $timeout, uiSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                refreshFlag:'=',
                functionManager:'=',
                options:'=?',
            },
            controllerAs:'vmGridDetail',
            templateUrl: "app/modules/mft_v2/directives/mftMonitorGrid.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}, rebuild:{value: 0}};

                //<editor-fold desc="Functions">
                $scope.$watch("vmGridDetail.refreshFlag", function(newValue, oldValue)
                {
                    // this resolve a bug where kendo messes up the monitor grid heading on the agent detail
                    // the agent detail will tell this directive to refresh and then that will force a grid rebuild and a data set
                    _this.model.rebuild.value += 1;
                    $timeout(function () {
                        _this.data = lodash.cloneDeep(_this.data);
                    }, 500);
                }, true);

                _this.functions.compileContent = function(id)
                {
                    let template = "<span><a ng-click=\"functionManager.navigateTransaction('" + id + "');\" title=\"click here to navigate to the Transaction\" >{{dataItem.last_task_id}}</a></span>";
                    var linkFn = $compile(template)($scope);
                    return linkFn[0].outerHTML;
                };

                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };


                _this.functionManager.navigateTransaction = function(id)
                {
                    // routine to manage the navigation of the last transaction in a monitor

                    // manage the drill
                    if (_this.functionManager != null && _this.functionManager.transactionDrill != null)
                        _this.functionManager.transactionDrill(id, _this.functionManager.grid);
                };
                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();
                    _this.gridOptions = {
                        toolbar: kendo.template($("#templateToolbar").html()),
                        excel: {
                            fileName: "MFT Monitor Listing.xlsx",
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
                                {field: "monitor_name", dir: "desc"},
                                {field: "agent_name", dir: "desc"},
                                {field: "queue_manager", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields: {
                                        _id: {type: "string"},
                                        sys_date: {type: "date"},
                                        monitor_name: {type: "string"},
                                        agent_name: {type:"string"},
                                        queue_manager: {type: "string"},
                                        coordinator: {type: "string"},
                                        job_name: {type: "string"},
                                        description: {type: "string"},
                                        version: {type: "string"},

                                        agentDesc: {type: "string"},

                                        status: {type: "number"},
                                        statusDesc: {type: "string"},

                                        type: {type: "number"},
                                        typeDesc: {type: "string"},

                                        pollDesc: {type: "string"},
                                        resourceDesc: {type: "string"},
                                        triggerDesc: {type: "string"},
                                        batchSize: {type:"number"},

                                        last_check_date: {type: "date"},
                                        last_task_id: {type: "string"},
                                        last_result_code: {type: "number"}
                                    }
                                }
                            },
                            aggregate: [
                                    {field: "_id", aggregate: "count"}
                                ]

                        },
                        columns: [
                            {
                                field: "monitor_name",
                                title: "Name",
                                width: "350px"
                            },
                            {
                                field: "status_desc",
                                title: "Status",
                                width: "150px"
                            },
                            {
                                field: "type_desc",
                                title: "Type",
                                width: "200px"
                            },
                            {
                                title: "Resource Information",
                                columns: [

                                    {
                                        field: "resourceDesc",
                                        title: "Resource",
                                        width: "350px"
                                    },
                                    {
                                        field: "pollDesc",
                                        title: "Polling Interval",
                                        width: "350px"
                                    },
                                    {
                                        field: "triggerDesc",
                                        title: "Trigger Conditions",
                                        width: "500px"
                                    },
                                    {
                                        field: "batchSize",
                                        title: "Batch Size",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"}
                                    },
                                ]

                            },

                            {
                                title: "Last Activity",
                                columns: [
                                    {
                                        field: "last_check_date",
                                        title: "Last Checked",
                                        format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        width: "200px",
                                        groupable: false
                                    },
                                    {
                                        field: "last_task_id",
                                        title: "Last Transaction",
                                        width: "350px",
                                        template: function(dataItem)
                                        {
                                            if ((dataItem.last_task_id) && (dataItem.last_task_id != null && dataItem.last_task_id != ''))
                                                return _this.functions.compileContent(dataItem.last_task_id);
                                            return "";
                                        }
                                    },
                                    {
                                        field: "last_result_code",
                                        title: "Result",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"}
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
                            },
                            {
                                title: "MFT Information",
                                columns: [
                                    {
                                        field: "agent_name",
                                        title: "MFT Agent Name",
                                        width: "250px"
                                    },
                                    {
                                        field: "queue_manager",
                                        title: "Queue Manager",
                                        width: "250px"
                                    },
                                    {
                                        field: "coordinator",
                                        title: "Co-ordinator",
                                        width: "200px"
                                    },
                                    {
                                        field: "agentDesc",
                                        title: "Agent",
                                        width: "250px"
                                    },
                                    {
                                        field: "version",
                                        title: "Version",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                    },

                                ]
                            },
                            {
                                title: "Identifier Information",
                                columns: [
                                    {
                                        field: "description",
                                        title: "Description",
                                        width: "400px"
                                    },
                                    {
                                        field: "job_name",
                                        title: "Job Name",
                                        width: "300px"
                                    },

                                ]
                            }
                        ],
                        dataBound: function (e)
                        {
                            var grid = this;

                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true);


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
                    // set the height
                    _this.height = "500px";
                    if (_this.options && _this.options.height == 0)
                    {
                        _this.gridOptions.pageable = true;
                        _this.gridOptions.dataSource.pageSize = 2000;
                        _this.height = null;
                    }
                };


                //</editor-fold>
                _this.functions.initView();
            }
        }
    }]);

});


