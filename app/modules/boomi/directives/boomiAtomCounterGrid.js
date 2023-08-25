/*
 /// <summary>
 /// app.modules.boomi.directives - boomiAtomCounterGrid
 /// Directive to display a Boomi Atom Counter Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/09/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiAtomCounterGrid', ['$state','uiSvc', function($state, uiSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                title:'@',
                refreshFlag:'=',
            },
            controllerAs:'vmGridDetail',
            templateUrl: "app/modules/boomi/partials/atom-detail-grid.tpl.html",
            controller: function($element, $scope)
            {
                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                //<editor-fold desc="Functions">
                _this.functions.initView = function()
                {
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
                                {field: "name", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "name",
                                    uid: "name",
                                    fields:
                                        {
                                            name: {type: "string"},
                                            value: {type: "number"},
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
                                    aggregates:["count"],
                                    footerTemplate:"No. of Counters: #=count#",
                                },
                                {
                                    field: "value",
                                    title: "Value",
                                    filterable: false,
                                    groupable: false,
                                    format: '{0:n2}',
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
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


