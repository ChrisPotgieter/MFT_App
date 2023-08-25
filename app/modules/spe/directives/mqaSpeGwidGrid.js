/*
 /// <summary>
 /// app.modules.spe.directives - mqaSpeGwidGrid
 /// Directive to display the SPE GWID Meta-Data Table Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/08/2017
 /// </summary>
 */

define(['modules/spe/module', 'lodash','jszip', 'appCustomConfig'], function(module, lodash, jszip, appCustomConfig) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mqaSpeGwidGrid', ['$filter','$state', '$timeout', 'uiSvc', 'cacheDataSvc', 'speDataSvc', function($filter, $state, $timeout, uiSvc, cacheDataSvc, speDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                docType:'@',
                functionManager:'=?',
                pageSize:'@?',
                mode:'@?' // 0 - default (multiple transaction), 1 - single transaction
            },
            controllerAs:'vm',
            templateUrl: "app/modules/spe/directives/mqaSpeGwidGrid.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                if (!_this.pageSize)
                    _this.pageSize = 15;
                else
                    _this.pageSize = parseInt(_this.pageSize);

                _this.model = {flags:{allowDownload: false, watched:false, showDownload: false, mode: 0}, summary: {}, metaFields:{}};
                _this.functions = {};


                if (_this.mode)
                    _this.model.flags.mode = parseInt(_this.mode);
                // check the state settings for the allow download
                var state = $state.get($state.current);
                if (state != null && state.data != null && state.data.settings)
                    _this.model.flags.allowDownload = state.data.settings.allowDownload;
                if (appCustomConfig.runMode == uiSvc.modes.DEMO)
                    _this.model.flags.allowDownload = true;

                //<editor-fold desc="Functions">
                _this.functions.buildMetaIndexColumns = function()
                {
                    // routine to update the grid with meta-index model and column definitions
                    if (_this.docType == null || _this.docType == '')
                        return;

                    var columns = [];
                    var title = "Meta-Data";

                    var documentRecord = cacheDataSvc.getListRecord("1", cacheDataSvc.getEDIListType(), _this.docType, null);
                    if (documentRecord != null)
                    {
                        _this.model.metaFields = documentRecord.jsonData.metadata;
                        lodash.forEach(_this.model.metaFields, function(field)
                        {
                            _this.gridOptions.dataSource.schema.model.fields[field.name] = {type:"string"};
                            if (!field.width)
                                field.width = 300;
                            columns.push(
                                {
                                    field: "metaData." + field.name,
                                    title: field.filter.caption,
                                    width: field.width + "px"
                                })
                        });
                    }
                    if (columns.length > 0) {
                        _this.gridOptions.columns.splice(5, 1, {title: title, columns: columns});
                        _this.columnRebuild += 1; // force grid rebuild

                        // reinitialize the state if the column rebuild is the first one
                        // this is so that the grid state can be loaded if this is a saved report
                        if (_this.columnRebuild == 1)
                        {
                            // force a timing based column rebuild when initialially coming into the screen for the first time incase kendo is still initializing
                            $timeout(function ()
                            {
                                if (_this.functionManager != null && _this.functionManager.initializeState != null)
                                {
                                    _this.functionManager.initializeState(_this.gridOptions);
                                }
                                _this.columnRebuild += 1; // force grid rebuild
                            }, 500);

                        }

                    }
                };

                _this.functions.buildSummaryStats = function(data)
                {
                    // routine to build the summary stats used in grouping as kendo is to unreliable when grouping the items
                    _this.model.summary = {};
                    _this.model.summary.transactions = lodash.chain(data).groupBy("transactionId").map(function(values, transactionId)
                    {
                        return {transactionId: transactionId, summaryValue: _this.functions.groupByStatus(values, "Transaction Id: " + transactionId)};
                    }).value();
                    _this.model.summary.final = _this.functions.groupByStatus(data, "Total Payloads: " + data.length);
                };
                _this.functions.groupByStatus = function(items, caption)
                {
                    var groupArray = lodash.chain(items).groupBy("status").map(function (values, statusId)
                    {
                        return  $filter("speGwidStatusFilter")(parseInt(statusId)) + " (" +  lodash.reduce(values, function (sumValue) {
                            return sumValue + 1;
                        }, 0) + ")";
                    }).value();
                    if (groupArray.length > 0)
                        return caption + " [" + lodash.join(groupArray, ",") + "]";
                    else
                        return caption;
                };


                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    _this.functions.persistGridState(model);

                    // manage the gwid drill
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.persistGridState = function(model)
                {
                    // routine to persist the current grid state to the in-memory store
                    if (_this.functionManager != null && _this.functionManager.persistState != null)
                        _this.functionManager.persistState(model, $scope.grid);
                };

                _this.functions.navigateTransaction = function(id)
                {
                    // routine to call the parent controller to navigate this transaction
                    if (_this.functionManager != null && _this.functionManager.navigateTransaction != null)
                        _this.functionManager.navigateTransaction(id);
                };

                _this.functions.groupTemplate =  function(dataItem)
                {
                    // calculate the breakdown per status
                    if (_this.model.summary.transactions != null)
                    {
                        var foundItem = lodash.find(_this.model.summary.transactions, {transactionId: dataItem.value});
                        var item;
                        if (foundItem)
                            item = foundItem.summaryValue;
                        else
                            item = "Transaction Id: " + dataItem.value;

                    }
                    if (_this.functionManager != null && _this.functionManager.navigateTransaction)
                        return "<a href=javascript:void(0); title=\"click here to View Transaction Details for Transaction Id " + dataItem.value + "\" id=\"group_" + dataItem.value + "\">" + item + "</a>";
                    else
                        return item;
                };

                _this.functions.footerTemplate = function(dataItem)
                {
                    if (_this.model.summary.final)
                        return _this.model.summary.final;
                    else
                        return "No. of Payloads: " + dataItem.count;
                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var pageSizes  = uiSvc.getKendoPageSizes();
                    _this.gridOptions  = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "GWID Listing.xlsx",
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
                                {field:"oid", dir:"desc"},
                                {field: "transactionDate", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "oid",
                                    uid: "oid",
                                    fields: {
                                        oid: {type: "string"},
                                        transactionId: {type: "string"},
                                        transactionDate: {type: "date"}
                                    }
                                }
                            },
                            aggregate: [ { field: "transactionId", aggregate: "count" }
                            ]
                        },
                        columns: [
                            {
                                field:"oid",
                                title:"GWID",
                                width: "100px"
                            },
                            {
                                field: "transactionDate",
                                title: "Transaction Date",
                                format:"{0:yyyy-MM-dd HH:mm:ss.fff}",
                                width: "200px"
                            },
                            {
                                field: "transactionId",
                                title: "Transaction Id",
                                width: "400px",
                                aggregates:["count"],
                                groupable: _this.model.flags.mode === 0,
                                groupHeaderTemplate:  _this.functions.groupTemplate,
                                footerTemplate: _this.functions.footerTemplate,
                                groupFooterTemplate:"No. of Payloads: #=count#"
                            },
                            {
                                field:"statusDesc",
                                title:"Status",
                                width:"350px",
                                attributes:{style:"text-overflow:ellipsis;white-space:nowrap;", class:"statusDesc"}

                            },
                            {
                                title: "Identifier Information",
                                columns:[
                                    {
                                        field: "departmentDesc",
                                        title: "Department",
                                        width: "200px"
                                    }
                                ]
                            }
                        ],
                        dataBound: function(e)
                        {
                            var grid = this;
                            let groupingFunction = null;
                            if (_this.model.flags.mode === 0)
                            {
                                groupingFunction = function (id)
                                {
                                    _this.functions.persistGridState();
                                    _this.functions.navigateTransaction(id.replace("group_", ""));
                                }
                            }
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true, false, groupingFunction);
                            _this.model.flags.showDownload = e.sender.dataSource.total() > 0;
                        }
                    };

                    // add the grouping
                    if (_this.model.flags.mode === 0)
                    {
                        _this.gridOptions.dataSource.group =  {
                        field: "transactionId",
                            dir:"desc",
                            aggregates: [
                            {
                                field: "transactionId",
                                aggregate: "count"}
                        ]
                        };
                    }
                    if (_this.model.flags.mode === 1)
                    {
                        _this.gridOptions.pageable = true;
                        _this.gridOptions.dataSource.pageSize = _this.pageSize;
                    }

                    if (_this.model.flags.allowDownload)
                        _this.gridOptions.toolbar.push({name: "Download", text:"Download", template: kendo.template($("#templateTransaction").html())});


                    // merge the additional options
                    _this.columnRebuild = 0;
                };

                _this.functions.download = function ()
                {
                    // routine to allow the user to download all records in the last filter
                    speDataSvc.initiateBulkGWIDDownload();

                };
                //</editor-fold>

                //<editor-fold desc="Watches">
                $scope.$watch("vm.docType", function(newValue, oldValue)
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
                        uiSvc.addKendoGridTooltip("statusDesc", $scope.grid, "supplemental");

                        if (_this.functionManager != null)
                            _this.functionManager.grid = $scope.grid;

                        // when the widget gets created set the data or watch the data variable for changes
                        $scope.$watchCollection("vm.data", function(newValue, oldValue)
                        {
                            // update the grid the moment the data changes - no need for observable array
                            if (newValue != oldValue || !_this.model.flags.watched)
                            {
                                _this.model.flags.watched = true;
                                uiSvc.displayKendoLoader("#grid", true);

                                // update the grid progress
                                $timeout(function(){
                                    if (newValue != null)
                                    {
                                        _this.functions.buildSummaryStats(newValue);
                                        $scope.grid.dataSource.data(newValue);
                                    }
                                    $scope.grid.dataSource.page(1);

                                    // load the state
                                    if (_this.functionManager != null && _this.functionManager.loadState != null)
                                        _this.functionManager.loadState($scope.grid);

                                    uiSvc.displayKendoLoader("#grid", false);
                                })
                            }
                        });
                    }
                });
                //</editor-fold>

                _this.functions.initView();
            }
        }
    }]);

});


