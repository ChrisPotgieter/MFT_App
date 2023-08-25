/*
 /// <summary>
 /// app.modules.bridge.directives - xmlsignWmqGateTransactionGrid
 /// Directive to display the XML Sign WMQ Gateway Transaction Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/04/2022
 /// </summary>
 */

define(['modules/bridge/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('xmlsignWmqGateTransactionGrid', ['$filter','uiSvc', 'bridgeDataSvc', function($filter, uiSvc, bridgeDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                refreshFlag:'=',
                functionManager:'=?'
            },
            controllerAs:'vmGridDetail',
            templateUrl: "app/modules/bridge/directives/xmlsignWmqGateTransactionGrid.tpl.html",
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
                        bridgeDataSvc.showXMLSignWMQGateDetail(model._id);
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
                            fileName: "Request Listing.xlsx",
                            allPages: true
                        },
                        sortable: true,
                        groupable: _this.mode == 0,
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
                                {field: "_id", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields: {
                                        _id: {type: "string"},
                                        action_date: {type: "date"},
                                        complete_date: {type: "date"},
                                        processing_started: {type: "date"},
                                        processing_completed: {type: "date"},
                                        sys_date: {type: "date"},

                                        supplemental: {type: "string"},

                                        sender: {type: "string"},
                                        source_queue: {type: "string"},
                                        source_size: {type: "number"},

                                        receiver: {type: "string"},
                                        destination_queue: {type: "string"},
                                        destination_size: {type: "number"},

                                        status: {type: "number"},
                                        status_desc: {type: "string"},

                                        running_time: {type: "number"},
                                        processing_time: {type: "number"},

                                        bridge_name: {type: "string"},
                                        parties: {type: "string"},
                                        attempts: {type: "number"},
                                    }
                                }
                            },
                            aggregate:
                                [
                                    {field: "attempts", aggregate: "sum"},
                                    {field: "source_size", aggregate: "sum"},
                                    {field: "destination_size", aggregate: "sum"},
                                    {field: "processing_time", aggregate: "sum"},
                                    {field: "running_time", aggregate: "sum"},
                                    {field: "_id", aggregate: "count"},
                                ]
                        },
                        columns: [

                            {
                                field: "_id",
                                title: "Message Id",
                                width: "370px",
                                aggregates: ["count"],
                                footerTemplate: "No. of Messsages: #=count#",
                                groupFooterTemplate:"No. of Messages: #=count#",
                                groupable: false
                            },
                            {
                                field: "action_date",
                                title: "Request Date",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "170px"
                            },
                            {
                                field: "complete_date",
                                title: "Complete Date",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "170px"
                            },
                            {
                                field: "sender",
                                title: "Sender",
                                width: "100px"
                            },
                            {
                                field: "receiver",
                                title: "Receiver",
                                width: "100px"
                            },
                            {
                                field: "source_queue",
                                title: "Source",
                                width: "250px"
                            },
                            {
                                field: "destination_queue",
                                title: "Destination",
                                width: "250px"
                            },
                            {
                                field: "status_desc",
                                title: "Status",
                                width: "150px",
                                groupable: false,
                                attributes: {
                                    style: "text-overflow:ellipsis;white-space:nowrap;",
                                    class: "statusDesc"
                                }

                            },
                            {
                                field: "supplemental",
                                title: "Supplemental",
                                width: "300px",
                                groupable: false,
                                attributes: {
                                    style: "text-overflow:ellipsis;white-space:nowrap;",
                                    class: "supplementalStatus"
                                }
                            },
                            {
                                field: "running_time",
                                title: "Running Time",
                                width: "200px",
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
                                field: "processing_time",
                                title: "Processing Time",
                                width: "200px",
                                aggregates: ["sum"],
                                filterable: false,
                                groupable: false,
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    if (dataItem.running_time != null) {
                                        return $filter("secondsToStringFilter")(dataItem.processing_time);
                                    } else
                                        return "Unknown";
                                },
                                footerTemplate: function (dataItem) {
                                    var value;
                                    if (dataItem.processing_time)
                                        value = dataItem.processing_time.sum;
                                    else
                                        value = dataItem.sum;
                                    if (value == null)
                                        return null;
                                    return "<div class=\"truncate\" style=\"text-align:right\">" + $filter("secondsToStringFilter")(value.toFixed(3));
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div class=\"truncate\" style=\"text-align:right;\">" + $filter("secondsToStringFilter")(dataItem.processing_time.sum.toFixed(3));
                                }
                            },
                            {
                                field: "attempts",
                                title: "Attempts",
                                aggregates:["sum"],
                                format: '{0:n0}',
                                footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                attributes:{style:"text-align:right;"},
                                headerAttributes:{style:"text-align:right;"},
                                filterable: false,
                                groupable: false,
                                width: "100px"
                            },
                            {
                                field: "bridge_name",
                                title: "Bridge Name",
                                width: "200px"
                            },
                            {
                                field: "parties",
                                title: "Parties",
                                width: "150px"
                            },
                            {
                                field: "source_size",
                                title: "Source Size",
                                width: "200px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    return $filter("bytesFilter")(dataItem.source_size);
                                },
                                footerTemplate: function (dataItem) {
                                    var value;
                                    if (dataItem.source_size)
                                        value = (dataItem.source_size.sum);
                                    else
                                        value = dataItem.sum;
                                    if (value == null)
                                        return null;
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.source_size.sum);
                                }
                            },
                            {
                                field: "destination_size",
                                title: "Destination Size",
                                width: "200px",
                                filterable: false,
                                groupable: false,
                                aggregates: ["sum"],
                                attributes: {style: "text-align:right;"},
                                headerAttributes: {style: "text-align:right;"},
                                template: function (dataItem) {
                                    return $filter("bytesFilter")(dataItem.destination_size);
                                },
                                footerTemplate: function (dataItem) {
                                    var value;
                                    if (dataItem.destination_size)
                                        value = (dataItem.destination_size.sum);
                                    else
                                        value = dataItem.sum;
                                    if (value == null)
                                        return null;
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                                },
                                groupFooterTemplate: function (dataItem) {
                                    return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.destination_size.sum);
                                }
                            },
                            {
                                field: "processing_started",
                                title: "Processing Started",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "170px",
                                filterable: false,
                                groupable: false

                            },
                            {
                                field: "processing_completed",
                                title: "Processing Completed",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "190px",
                                filterable: false,
                                groupable: false
                            },
                            {
                                field: "sys_date",
                                title: "Last Update Date",
                                format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "170px",
                                filterable: false,
                                groupable: false,
                            },
                        ],

                        dataBound: function (e) {
                            var grid = this;
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true);
                        }
                    };


                    // add the tooltips to the grid
                    _this.functionManager.gridCreate = function(grid)
                    {
                        uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");
                        uiSvc.addKendoGridTooltip("statusDesc", grid, "statusDesc");
                    };


                    // set the height
                    _this.height = "500px";
                };


                //</editor-fold>

                _this.functions.initView();

                // set the rebuild flag
                _this.rebuild = 0;

            }
        }
    }]);

});


