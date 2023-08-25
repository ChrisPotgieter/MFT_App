/*
 /// <summary>
 /// app.modules.boomi.directives - boomiProcessGrid
 /// Directive to display the BOOMI Process Grid for all Atoms or a given Atom

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */

define(['modules/boomi/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiProcessGrid', ['$state','uiSvc', function($state, uiSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:
            {
                data:'=',
                mode:'@', // 0 - listener, 1 - schedule
                title:'@',
                refreshFlag:'='
            },
            controllerAs:'vmGridProcessDetail',
            templateUrl: "app/modules/boomi/directives/boomiProcessGrid.tpl.html",
            controller: function($element, $scope)
            {
                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                //<editor-fold desc="Functions">

                _this.functions.addDescriptionTooltip = function (grid) {
                    // routine to add a tooltip for in progress records
                    var element = $(grid.wrapper);
                    element.kendoTooltip({
                        filter: ".description",
                        position: "left",
                        beforeShow: function (e) {
                            var dataItem = grid.dataItem(e.target.closest("tr"));
                            if (!dataItem || !dataItem["description"] || dataItem["description"] == '')
                                e.preventDefault();
                        },
                        content: function (e) {
                            let dataItem = grid.dataItem(e.target.closest("tr"));
                            let data = dataItem["description"];
                            return data;
                        }
                    }).data("kendoTooltip");
                };
                _this.functions.drill = function(id)
                {
                };
                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    _this.aggregates = [];
                    _this.aggregates.push({field: "name", aggregate: "count"});
                    _this.gridOptions = {
                        toolbar: [],
                        sortable: true,
                        groupable: true,
                        filterable: true,
                        columnMenu: false,
                        resizable: true,
                        scrollable: true,
                        reorderable: false,
                        pageable: false,
                        selectable: "row",
                        dataSource: {
                            pageSize: 2000,
                            sort: [
                                {field: "name", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields:
                                        {
                                            _id: {type: "string"},
                                            name: {type: "string"},
                                            description: {type: "string"},
                                            deployment_id: {type: "string"},
                                            last_check: {type: "date"},

                                            listener_status: {type: "number"},
                                            status_desc: {type: "string"},

                                            created_date: {type: "date"},
                                            modified_date: {type: "date"},
                                            created_by: {type: "string"},
                                            modified_by: {type: "string"},

                                            api_component_meta: {type: "object"},
                                            schedule: {type: "object"}

                                        }
                                }
                            },
                            aggregate: _this.aggregates,
                            group: {
                                field: "folder",
                                dir: "desc",
                                aggregates: _this.aggregates
                            }
                        },
                        columns:
                        [
                                {
                                    field: "name",
                                    title: "Name",
                                    width: "500px",
                                    aggregates:["count"],
                                    footerTemplate:"No. of Processes: #=count#",
                                    groupFooterTemplate:"No. of Processes: #=count#",
                                    attributes:
                                        {
                                            class: "description"
                                        },


                                },
                                {
                                    field: "status_desc",
                                    title: "Status",
                                    width: "200px",
                                },
                                {
                                    field: "_id",
                                    title: "Api Id",
                                    width: "300px",
                                },
                                {
                                    field: "last_check",
                                    title: "Last Check Date",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    filterable: false,
                                    groupable: false,
                                    width: "200px"
                                },
                                {
                                    field: "deployment_id",
                                    title: "Deployment Id",
                                    width: "250px",
                                },
                                {
                                    field: "version",
                                    title: "Version",
                                    width: "100px",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    filterable: false,
                                    groupable: false,
                                    template: function (dataItem)
                                    {
                                        if (!dataItem.api_component_meta || !dataItem.api_component_meta.version)
                                            return "";
                                        return dataItem.api_component_meta.version;
                                    }
                                },
                                {
                                    field: "folder",
                                    title: "Folder",
                                    width: "200px"
                                },
                                {
                                    field: "modified_date",
                                    title: "Modified",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    filterable: false,
                                    groupable: false,
                                    width: "200px",
                                },
                                {
                                    field: "modified_by",
                                    title: "Modified By",
                                    width: "250px",
                                },
                                {
                                    field: "created_date",
                                    title: "Created",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    filterable: false,
                                    groupable: false,
                                    width: "200px",
                                },
                                {
                                    field: "created_by",
                                    title: "Created By",
                                    width: "250px",
                                }
                            ],
                            dataBound: function (e) {
                                var grid = this;
                                uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);
                            }

                        };

                    // add the function manager
                    _this.functionManager = {};

                    _this.functionManager.gridCreate = function(grid)
                    {
                        // add the tooltip to the status column
                        var element = $(grid.wrapper);
                        _this.functions.addDescriptionTooltip(element)
                        element.kendoTooltip({
                            filter: ".supplementalStatus",
                            position: "left",
                            beforeShow: function (e)
                            {
                                var dataItem = grid.dataItem(e.target.closest("tr"));
                                if (!dataItem.transfer_state || dataItem.transfer_state == '')
                                    e.preventDefault();
                            },
                            content: function(e)
                            {
                                var dataItem = grid.dataItem(e.target.closest("tr"));
                                var content = dataItem.tip;
                                return content;
                            }
                        }).data("kendoTooltip");
                    }

                };
                //</editor-fold>
                _this.functions.initView();
            }
        }
    }]);

});


