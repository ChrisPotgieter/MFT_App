/*
 /// <summary>
 /// app.modules.boomi.directives - boomiAtomQueueGrid
 /// Directive to display a Boomi Atom Queue Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/09/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash', 'jszip'], function (module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('boomiAtomQueueGrid', ['$state', 'uiSvc', function ($state, uiSvc) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
                thresholds:'=',
                title: '@',
                refreshFlag: '=',
                functionManager:'=?'
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
                        groupable: true,
                        filterable: true,
                        columnMenu: false,
                        resizable: false,
                        scrollable: true,
                        reorderable: false,
                        pageable: false,
                        selectable: "cell",
                        dataSource: {
                            pageSize: 2000,
                            sort: [
                                {field: "queue_name", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "queue_name",
                                    uid: "queue_name",
                                    fields:
                                        {
                                            queue_name: {type: "string"},
                                            queue_type: {type: "string"},
                                            messages_count: {type: "number"},
                                            dead_letters_count: {type: "number"},
                                            subscriber_count: {type: "number"}
                                        }
                                }
                            },
                            aggregate:
                                [
                                    {field: "queue_name", aggregate: "count"},
                                    {field: "messages_count", aggregate: "sum"},
                                    {field: "dead_letters_count", aggregate: "sum"},
                                    {field: "subscriber_count", aggregate: "sum"}
                                ]
                        },
                        columns:
                            [
                                {
                                    field: "queue_name",
                                    title: "Name",
                                    width: "200px",
                                    aggregates: ["count"],
                                    groupable: false,
                                    footerTemplate: "No. of Queues: #=count#",
                                    attributes: {
                                        "class": "k-group-cell" //Same idea with the class attribute
                                    }
                                },
                                {
                                    field: "queue_type",
                                    title: "Type",
                                    width: "200px",
                                    attributes: {
                                        "class": "k-group-cell" //Same idea with the class attribute
                                    }
                                },
                                {
                                    field: "messages_count",
                                    title: "Messages",
                                    groupable: false,
                                    filterable: false,
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
                                },
                                {
                                    field: "dead_letters_count",
                                    title: "Dead Letters",
                                    filterable: false,
                                    groupable: false,
                                    selectable: false,
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
                                },
                                {
                                    field: "subscriber_count",
                                    title: "Topic Subscribers",
                                    filterable: false,
                                    groupable: false,
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
                                }
                            ],
                        dataBound: function (e)
                        {
                            var grid = this;
                            _this.functions.dataBoundGrid(grid, e);
                        }
                    };
                };

                _this.functions.styleThreshold = function(cell, dataModel, config)
                {
                    // routine to style the given cell as a threshold cell
                    let threshold = lodash.find(_this.thresholds, {type: config.type, code: dataModel.id});
                    if (threshold != null)
                    {
                        // there is a threshold linked to this cell
                        if (threshold.exceeded)
                            cell.addClass("transactionError");
                        else
                            cell.addClass("recordInsert");

                        // add a tooltip
                        cell.kendoTooltip({
                            position: "left",
                            beforeShow: function(e)
                            {
                            },
                            content: function(e)
                            {
                                if (threshold.last_check)
                                {
                                    let supplemental = "Threshold";
                                    if (threshold.exceeded)
                                        supplemental += " Exceeded";
                                    else
                                        supplemental += " Within Limits";
                                    return "<div>" + supplemental + "<br/>Current: " + threshold.current_value + "<br/>Expected:" + threshold.expected_value + "</div>"
                                }
                                else
                                    return "<span>Threshold Pending Check</span>";
                            }
                        }).data("kendoTooltip");
                    }

                    // add a double click event
                    cell.dblclick(dataModel, function (event)
                    {
                        if (_this.functionManager.cellClick != null)
                        {
                            _this.functionManager.cellClick(dataModel, config.type)
                        }
                    });
                };

                _this.functions.dataBoundGrid = function(grid, e)
                {
                    // routine to customize the grid because we need to color cells based on thresholds and attach a dbl-click event to threshold cells
                    let columns = e.sender.columns;
                    let fields = [{name: "messages_count", type: 2}, {name: "dead_letters_count", type: 3}, {name:"subscribers_count", type: 4}];
                    lodash.forEach(fields, function (value)
                    {
                        value.index = lodash.findIndex(columns, {field: value.name});
                    });
                    var gridData = grid.table.find("tr[data-uid]");
                    for (var i = 0; i < gridData.length; i++)
                    {
                        var model = grid.dataItem(gridData[i]);
                        var row = $(gridData[i]);
                        if (model.rowStyle)
                            row.addClass(model.rowStyle);
                        lodash.forEach(fields, function(value)
                        {
                            _this.functions.styleThreshold(row.children().eq(value.index), model, value);
                        });
                    }
                };
                //</editor-fold>


                _this.functions.initView();
            }
        }
    }]);

});


