/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftAgentGrid
 /// Directive to display the MFT V2 Agent Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mftAgentGrid', ['$filter','$state', '$timeout', 'uiSvc', function($filter, $state, $timeout, uiSvc)
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
            templateUrl: "app/modules/mft_v2/directives/mftAgentGrid.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                //<editor-fold desc="Functions">
                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();
                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "MFT Agent Listing.xlsx",
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
                                        started_time: {type: "date"},
                                        agent_name: {type: "string"},
                                        queue_manager: {type: "string"},
                                        coordinator: {type: "string"},
                                        host: {type: "string"},
                                        description: {type: "string"},
                                        osname: {type: "string"},
                                        product_version: {type: "string"},
                                        product_build: {type: "string"},
                                        time_zone: {type:"string"},


                                        status: {type: "number"},
                                        statusDesc: {type: "string"},

                                        type: {type: "number"},
                                        typeDesc: {type: "string"},

                                        connection_port: {type: "number"},
                                        connection_host: {type: "string"},
                                        connection_channel: {type: "string"},

                                        last_publish_date: {type: "date"},
                                        publish_rate: {type: "string"},
                                        command_time: {type: "date"},

                                        limit_queued: {type: "number"},
                                        limit_destination: {type: "number"},
                                        limit_source: {type: "number"}
                                    }
                                }
                            },
                            aggregate:
                                [
                                    {field: "agent_name", aggregate: "count"}
                                ]

                        },
                        columns: [
                            {
                                field: "agent_name",
                                title: "Name",
                                width: "250px",
                                aggregates:["count"],
                                footerTemplate:"No. of Agents: #=count#",
                                groupFooterTemplate:"No. of Agents: #=count#"
                            },
                            {
                                field: "queue_manager",
                                title: "Queue Manager",
                                width: "250px"
                            },
                            {
                                field: "description",
                                title: "Description",
                                width: "300px"
                            },
                            {
                                field: "status_desc",
                                title: "Status",
                                width: "300px"
                            },
                            {
                                field: "type_desc",
                                title: "Type",
                                width: "200px"
                            },
                            {
                                field: "host",
                                title: "Host",
                                width: "200px"
                            },
                            {
                                field: "time_zone",
                                title: "Time Zone",
                                width: "250px"
                            },
                            {
                                title: "Limits",
                                columns: [
                                    {
                                        field: "limit_queued",
                                        title: "Queued",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        width: "100px"
                                    },
                                    {
                                        field: "limit_source",
                                        title: "Max Source",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        width: "150px"
                                    },
                                    {
                                        field: "limit_source",
                                        title: "Max Dest.",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        width: "150px"
                                    }
                                ]
                            },

                            {
                                title: "MQ Connection Information",
                                columns: [
                                    {
                                        field: "coordinator",
                                        title: "Co-ordinator",
                                        width: "200px"
                                    },
                                    {
                                        field: "connection_host",
                                        title: "Host",
                                        width: "200px"
                                    },
                                    {
                                        field: "connection_port",
                                        title: "Port",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"}
                                    },
                                    {
                                        field: "connection_channel",
                                        title: "Channel",
                                        width: "200px"
                                    },

                                ]
                            },

                            {
                                title: "Publish Information",
                                columns: [
                                    {
                                        field: "started_time",
                                        title: "Last Started",
                                        format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        width: "200px",
                                        groupable: false
                                    },

                                    {
                                        field: "last_publish_date",
                                        title: "Last Publication",
                                        format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        width: "200px",
                                        groupable: false

                                    },
                                    {
                                        field: "command_time",
                                        title: "Command Time",
                                        format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        width: "200px",
                                        filterable: false,
                                        groupable: false,

                                    },
                                    {
                                        field: "publish_rate",
                                        title: "Rate",
                                        width: "200px",
                                        filterable: false,
                                        groupable: false,
                                    },
                                    {
                                        field: "product_version",
                                        title: "Product Version",
                                        width: "200px"
                                    },
                                    {
                                        field: "product_build",
                                        title: "Product Build",
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
                            }
                        ],
                        dataBound: function (e) {
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

                    // show all the agents
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


