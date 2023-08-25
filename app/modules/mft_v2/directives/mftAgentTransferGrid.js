/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftAgentTransferGrid
 /// Directive to display the MFT V2 Agent Source and Destination Transfer Grid

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('mftAgentTransferGrid', ['$state','uiSvc', 'mftv2DataSvc', 'transactionReportingSvc', function($state, uiSvc, mftv2DataSvc, transactionReportingSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                title:'@',
                refreshFlag:'=',
                parentFunctions:'=',
            },
            controllerAs:'vmGridTransferDetail',
            templateUrl: "app/modules/mft_v2/directives/mftAgentTransferGrid.tpl.html",
            controller: function($element, $scope)
            {
                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                //<editor-fold desc="Functions">
                _this.functions.cancelTransactions = function(data) {
                    // routine to initiate a CLI transaction to cancel a given transaction or a set of transactions

                    let click_data = transactionReportingSvc.getCancellationClick(data, _this.title);
                    if (_this.parentFunctions != null && _this.parentFunctions.confirmCLIOperation != null)
                    {
                        _this.parentFunctions.confirmCLIOperation(click_data);
                    }
                    else
                        mftv2DataSvc.confirmCLIOperation(click_data);
                };


                _this.functions.viewTransaction = function(id)
                {
                    // routine to manage the drilling
                    mftv2DataSvc.navigateDashboardTransaction(id, $state.$current);
                };
                _this.functions.initView = function() {
                    // routine to initialize the view when the controller is instantiated
                    _this.gridOptions = {
                        toolbar: [],
                        sortable: true,
                        groupable: false,
                        filterable: true,
                        columnMenu: false,
                        resizable: false,
                        scrollable: true,
                        reorderable: false,
                        pageable: false,
                        selectable: "row",
                        dataSource: {
                            pageSize: 2000,
                            sort: [
                                {field: "transfer_id", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "transfer_id",
                                    uid: "transfer_id",
                                    fields:
                                        {
                                            transfer_id: {type: "string"},
                                            transfer_state: {type: "string"},
                                            allow_view: {type: "boolean"},
                                            allow_cancel: {type: "boolean"},
                                            tip: {type: "string"}
                                        }
                                }
                            },
                                aggregate:
                                    [
                                        {field: "transfer_id", aggregate: "count"}
                                    ]

                        },
                        columns: [
                                {
                                    field: "transfer_id",
                                    title: "Transfer Id",
                                    width: "250px",
                                    aggregates:["count"],
                                    footerTemplate:"No. of Transfers: #=count#",
                                    groupFooterTemplate:"No. of Transfers: #=count#"

                                },
                                {
                                    field: "transfer_state",
                                    title: "State",
                                    width: "250px",
                                    filterable: false,
                                    attributes:
                                    {
                                        class: "supplementalStatus"
                                    }

                                },
                                {
                                    title:"Command Options",
                                    width: "200px",
                                    template: function(dataItem)
                                    {
                                        var commands = [];
                                        if (dataItem.allowCancel)
                                        {
                                            let button = "<button class='margin-left-10 margin-bottom-5 margin-top-10' ng-click=\"functionManager.cancelTransaction(\'" + dataItem.transfer_id + "\');\"><i class='fa fa-minus-circle'></i>&nbsp;Cancel Transfer</button>";
                                            commands.push(button)
                                        }
                                        if (dataItem.allowView)
                                        {
                                            let button = "<button class='margin-left-10 margin-bottom-5 margin-top-10' ng-click=\"functionManager.viewTransaction(\'" + dataItem.transfer_id + "\');\"><i class='fa fa-search'></i>&nbsp;View Transfer</button>";
                                            commands.push(button)
                                        }
                                        var html = lodash.map(commands, function (button)
                                        {
                                            return button + "\n";
                                        });
                                        return html;
                                    }
                                }
                            ],
                            dataBound: function (e) {
                                var grid = this;
                                uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);
                            }

                        };

                    // add the function manager
                    _this.functionManager = {};
                    _this.functionManager.cancelAll = function()
                    {
                        // get a list of transactions
                        let data = lodash.map(_this.data, "transfer_id");
                        _this.functions.cancelTransactions(data);
                    };
                    _this.functionManager.cancelTransaction = function(id)
                    {
                        // routine to invoke the cancellation of the given id
                        var row = lodash.find(_this.data, {transfer_id: id});
                        if (row != null)
                        {
                            _this.functions.cancelTransactions(row.transfer_id);
                        }
                    };
                    _this.functionManager.viewTransaction = function(id)
                    {
                        // routine to invoke the cancellation of the given id
                        var row = lodash.find(_this.data, {transfer_id: id});
                        if (row != null)
                            _this.functions.viewTransaction(row.transfer_id);
                    };

                    _this.functionManager.gridCreate = function(grid)
                    {
                        // add the tooltip to the status column
                        var element = $(grid.wrapper);
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
                $scope.$watch('vmGridTransferDetail.refreshFlag', function()
                {
                    if (!_this.data)
                        return;
                    let has_cancelable = lodash.find(_this.data, {allowCancel: true});
                    _this.gridOptions.toolbar = [];
                    if (has_cancelable != null)
                        _this.gridOptions.toolbar.push({name: "Download", text:"Download", template: kendo.template($("#templateTransaction").html())});
                    else
                        _this.gridOptions.toolbar.push({name: "Download", text:"Download", template: kendo.template($("#templateNoCancel").html())});
                }, true);

                _this.functions.initView();
            }
        }
    }]);

});


