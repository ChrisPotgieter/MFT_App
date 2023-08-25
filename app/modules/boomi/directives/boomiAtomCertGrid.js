/*
 /// <summary>
 /// app.modules.boomi.directives - boomiAtomCertGrid
 /// Directive to display a Boomi Atom Certificate Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/09/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash', 'jszip'], function (module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiAtomCertGrid', ['$state', 'uiSvc', function ($state, uiSvc) {
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
                                {field: "expiration_date", dir: "desc"},
                            ],
                            schema: {
                                model: {
                                    id: "api_id",
                                    uid: "api_id",
                                    fields:
                                        {
                                            api_id: {type: "string"},
                                            name: {type: "string"},
                                            type: {type: "string"},
                                            location: {type: "string"},
                                            expiration_date: {type: "date"},
                                            last_check: {type: "date"},
                                            next_check: {type: "date"}
                                        }
                                }
                            },
                            aggregate:
                                [
                                    {field: "name", aggregate: "count"}
                                ]
                        },
                        columns:
                            [
                                {
                                    field: "name",
                                    title: "Name",
                                    width: "200px",
                                    aggregates: ["count"],
                                    footerTemplate: "No. of Certificates: #=count#",
                                },
                                {
                                    field: "type",
                                    title: "Type",
                                    width: "200px",
                                },
                                {
                                    field: "location",
                                    title: "Location",
                                    width: "200px"
                                },
                                {
                                    field: "expiration_date",
                                    title: "Expiration Date",
                                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                    width: "170px",
                                    groupable: false
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
                //</editor-fold>


                _this.functions.initView();
            }
        }
    }]);

});


