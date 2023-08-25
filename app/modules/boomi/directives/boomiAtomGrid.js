/*
 /// <summary>
 /// app.modules.boomi.directives - boomiAtomGrid
 /// Directive to display the BOOMI Atom Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */

define(['modules/boomi/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiAtomGrid', ['$filter','$state', '$timeout', 'uiSvc', 'boomiDataSvc', function($filter, $state, $timeout, uiSvc, boomiDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                refreshFlag:'=',
                functionManager:'=?',
                options:'=?',
            },
            controllerAs:'vmGridDetail',
            templateUrl: "app/modules/boomi/directives/boomiAtomGrid.tpl.html",
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
                    else
                    {
                        boomiDataSvc.navigateAtom(model._id);
                    }
                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes = uiSvc.getKendoPageSizes();
                    if (_this.functionManager == null)
                        _this.functionManager = {};

                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Boomi Atom Listing.xlsx",
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
                                {field: "name", dir: "desc"},
                                {field: "environment_name", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields: {
                                        _id: {type: "string"},
                                        sys_date: {type: "date"},
                                        last_restart: {type: "date"},
                                        date_installed: {type: "date"},
                                        api_id:{type:"string"},
                                        name: {type: "string"},
                                        environment_name: {type: "string"},
                                        classification: {type: "string"},
                                        type: {type: "number"},
                                        type_desc: {type: "string"},
                                        status: {type: "number"},
                                        status_desc: {type: "string"},
                                        host: {type: "string"},
                                        properties:{type: "object"},

                                        api_info:{type: "object"},
                                        jvm:{type:"object"},

                                        monitoring_url:{type: "string"},
                                        monitoring_refresh:{type: "string"},
                                        monitoring_stopped:{type:"string"},


                                        system_cpu: {type: "number"},
                                        system_total_memory: {type: "number"},
                                        problem:{type: "string"},

                                    }
                                }
                            },
                            aggregate:
                                [
                                    {field: "name", aggregate: "count"}
                                ]

                        },
                        columns: [
                            {
                                field: "name",
                                title: "Name",
                                width: "250px",
                                aggregates:["count"],
                                footerTemplate:"No. of Atoms: #=count#",
                                groupFooterTemplate:"No. of Atoms: #=count#"
                            },
                            {
                                field: "api_id",
                                title: "Api Id",
                                width: "250px",
                            },

                            {
                                field: "environment_name",
                                title: "Environment",
                                width: "200px"
                            },
                            {
                                field: "classification",
                                title: "Classification",
                                width: "150px"
                            },
                            {
                                field: "status_desc",
                                title: "Status",
                                width: "100px"
                            },
                            {
                                field: "type_desc",
                                title: "Type",
                                width: "100px"
                            },
                            {
                                field: "host",
                                title: "Host",
                                width: "250px"
                            },
                            {
                                field: "time_zone",
                                title: "Time Zone",
                                width: "200px",
                                template: function (dataItem) {
                                    if (!dataItem.properties || !dataItem.properties.timezone_id)
                                        return "";
                                    return dataItem.properties.timezone_id;
                                }
                            },
                            {
                                title: "Monitoring",
                                columns: [
                                    {
                                        field: "problem",
                                        title: "Supplemental",
                                        width: "300px",
                                        groupable: false,
                                        attributes: {
                                            style: "text-overflow:ellipsis;white-space:nowrap;",
                                            class: "problem"
                                        }
                                    },

                                    {
                                        field: "monitoring_url",
                                        title: "URL",
                                        filterable: false,
                                        groupable: false,
                                        width: "300px"
                                    },
                                    {
                                        field: "monitoring_refresh",
                                        title: "Standard Refresh Interval",
                                        filterable: false,
                                        groupable: false,
                                        width: "150px"
                                    },
                                    {
                                        field: "monitoring_stopped",
                                        title: "Stopped Refresh Interval",
                                        filterable: false,
                                        groupable: false,
                                        width: "150px"
                                    },
                                    {
                                        field: "last_restart",
                                        title: "Last Restarted",
                                        format: "{0:yyyy-MM-dd HH:mm:ss}",
                                        filterable: false,
                                        groupable: false,
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
                            },
                            {
                                title: "Limits",
                                columns: [
                                    {
                                        field: "purge_history_days",
                                        title: "Purge History",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        template: function (dataItem)
                                        {
                                            if (!dataItem.api_info)
                                                return "";
                                            if (dataItem.api_info.purge_history_days == 0)
                                                return "Disabled";
                                            return dataItem.api_info.purge_history_days + " days";
                                        }
                                    },
                                    {
                                        field: "force_restart_time",
                                        title: "Force Restart",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        template: function (dataItem)
                                        {
                                            if (!dataItem.api_info)
                                                return "";
                                            if (dataItem.api_info.force_restart_time == "0")
                                                return "Never";
                                            return dataItem.api_info.force_restart_time;
                                        }
                                    },
                                    {
                                        field: "purge_immediate",
                                        title: "Purge Data Immediately",
                                        width: "200px",
                                        template: function (dataItem)
                                        {
                                            if (!dataItem.api_info)
                                                return "";
                                            return dataItem.api_info.purge_immediate;
                                        }

                                    }
                                ]
                            },
                            {
                                title: "Hardware/Software",
                                columns: [
                                    {
                                        field: "date_installed",
                                        title: "Installation Date",
                                        format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        filterable: false,
                                        groupable: false,
                                        width: "200px",
                                    },
                                    {
                                        field: "OS",
                                        title: "Operating System",
                                        width: "300px",
                                        template: function (dataItem) {
                                            if (!dataItem.properties || !dataItem.properties.os_name)
                                                return "";
                                            return dataItem.properties.os_name;
                                        }
                                    },
                                    {
                                        field: "product_version",
                                        title: "Product Version",
                                        width: "200px",
                                        template: function (dataItem)
                                        {
                                            if (!dataItem.api_info)
                                                return "";
                                            return dataItem.api_info.current_version
                                        }
                                   },
                                    {
                                        field: "product_build",
                                        title: "Product Build",
                                        width: "200px",
                                        template: function (dataItem) {
                                            if (!dataItem.properties || !dataItem.properties.build_number)
                                                return "";
                                            return dataItem.properties.build_number;
                                        }
                                    },
                                    {
                                        field: "system_cpu",
                                        title: "CPU",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        template: function (dataItem) {
                                            if (!dataItem.jvm || !dataItem.jvm.system_cpu_count)
                                                return "";
                                            return dataItem.jvm.system_cpu_count;
                                        }
                                    },
                                    {
                                        field: "system_memory",
                                        title: "Memory",
                                        width: "100px",
                                        filterable: false,
                                        groupable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        template: function (dataItem) {
                                            if (!dataItem.jvm || !dataItem.jvm.system_total_memory)
                                                return "";
                                            return dataItem.jvm.system_total_memory;
                                        }
                                    },
                                    {
                                        field: "base_directory",
                                        title: "Installation Directory",
                                        width: "300px",
                                        template: function (dataItem) {
                                            if (!dataItem.jvm || !dataItem.jvm.base_directory_path)
                                                return "";
                                            return dataItem.jvm.base_directory_path;
                                        }

                                    },

                                ]
                            }
                        ],
                        dataBound: function (e) {
                            var grid = this;

                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);


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

                    _this.functionManager.gridCreate = function(grid)
                    {
                        uiSvc.addKendoGridTooltip("problem", grid, "problem");
                    };

                };


                //</editor-fold>


                _this.functions.initView();
            }
        }
    }]);

});


