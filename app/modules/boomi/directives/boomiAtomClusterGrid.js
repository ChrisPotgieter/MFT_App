/*
 /// <summary>
 /// app.modules.boomi.directives - boomiAtomClusterGrid
 /// Directive to display a Boomi Atom Cluster Grid on a Molecule

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/09/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash', 'jszip'], function (module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiAtomClusterGrid', ['$state', 'uiSvc', function ($state, uiSvc) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
                title: '@',
                refreshFlag: '=',
            },
            controllerAs: 'vmGridDetail',
            templateUrl: "app/modules/boomi/partials/atom-detail-grid.tpl.html",
            controller: function ($element, $scope) {
                var _this = this;
                _this.functions = {};
                _this.functionManager = {};
                _this.model = {flags: {watched: false}};

                //<editor-fold desc="Functions">
                _this.functions.initView = function () {
                    // routine to initialize the view when the controller is instantiated
                    _this.gridOptions = {
                        toolbar: [],
                        sortable: true,
                        groupable: false,
                        filterable: false,
                        columnMenu: false,
                        resizable: false,
                        scrollable: true,
                        reorderable: false,
                        pageable: false,
                        selectable: "row",
                        dataSource: {
                            pageSize: 2000,
                            sort: [
                                {field: "node_id", dir: "desc"},
                            ],
                            schema: {
                                model: {
                                    id: "node_id",
                                    uid: "node_id",
                                    fields:
                                        {
                                            node_id: {type: "string"},
                                            host_name: {type: "string"},
                                            status: {type: "string"},
                                            problem: {type:"string"},
                                            last_check: {type: "date"},
                                            next_check: {type: "date"}
                                        }
                                }
                            },
                            aggregate:
                                [
                                    {field: "node_id", aggregate: "count"}
                                ]
                        },
                        columns:
                            [
                                {
                                    field: "node_id",
                                    title: "Node",
                                    width: "200px",
                                    aggregates: ["count"],
                                    footerTemplate: "No. In Cluster: #=count#",
                                },
                                {
                                    field: "host_name",
                                    title: "Host",
                                    width: "200px",
                                },
                                {
                                    field: "status",
                                    title: "Status",
                                    width: "200px"
                                },
                                {
                                    field: "problem",
                                    title: "Problems",
                                    width: "200px",
                                    attributes: {
                                        style: "text-overflow:ellipsis;white-space:nowrap;",
                                        class: "supplementalStatus"
                                    }
                                },
                                {
                                    field: "last_check",
                                    title: "Last Checked",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    width: "170px",
                                    filterable: false,
                                    groupable: false
                                },
                                {
                                    field: "next_check",
                                    title: "Next Check",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    width: "170px",
                                    filterable: false,
                                    groupable: false
                                }
                            ],
                        dataBound: function (e) {
                            var grid = this;
                            uiSvc.dataBoundKendoGrid(grid);
                        }
                    };

                    // add the function manager
                    _this.functionManager = {};
                };

                _this.functionManager.gridCreate = function (grid)
                {
                    uiSvc.addKendoGridTooltip("supplementalStatus", grid, "problem");
                };


                //</editor-fold>


                _this.functions.initView();
            }
        }
    }]);

});


