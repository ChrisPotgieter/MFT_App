/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.directives - speInstamedClaimPayGrid
 /// SPE InstaMed Extension
 /// Claim Payment Grid Directive

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/04/2020
 /// </summary>
 */

define(['modules/spe/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('speInstamedClaimPayGrid', ['$filter','$state', '$timeout', 'uiSvc', 'speInstamedDataSvc', function($filter, $state, $timeout, uiSvc, speInstamedDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@',
                functionManager:'=?',
            },
            controllerAs:'vm',
            template: '<div kendo-grid="grid" k-options="vm.gridOptions" ng-style="vm.style"/>',
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}};

                //<editor-fold desc="Functions">

                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    _this.functions.persistGridState(model);
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.persistGridState = function(model)
                {
                    // routine to persist the current grid state to the in-memory store
                    if (_this.functionManager != null && _this.functionManager.persistState != null)
                        _this.functionManager.persistState(model, $scope.grid);
                };

                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated
                    var height = _this.mode == 0 ? "500px": "540px";
                    _this.style = {height: height}; // we need a fixed header
                    var titles = speInstamedDataSvc.getProcTitles();

                    var pageSizes = uiSvc.getKendoPageSizes();
                    _this.gridOptions  = {
                        noRecords: true,
                        messages: {
                            noRecords: "No Records Available"
                        },
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Claim Payment Listing.xlsx",
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
                            pageSize: pageSizes[pageSizes.length - 2],
                            sort: [
                                {field: "createDate", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields: {

                                        // base information
                                        _id:{type:"string"},
                                        createDate: {type: "date"},
                                        holdingCompany:{type:"string"},
                                        division:{type: "string"},
                                        subCompany: {type:"string"},
                                        status: {type: "string"},

                                        batchId: {type:"string"},
                                        moduleDesc:{type:"string"},
                                        sysdate: {type: "date"},

                                        // claim information
                                        claimNumber: {type:"string"},
                                        checkEFTNumber: {type: "string"},
                                        providerName: {type:"string"},
                                        providerNPI: {type:"string"},
                                        providerTIN: {type:"string"},
                                        patientLastName: {type:"string"},
                                        patientFirstName: {type:"string"},
                                        policyNumber: {type:"string"},

                                        // payment information
                                        disbursementTraceNumber:{type:"string"},
                                        payMethod:{type:"string"},
                                        payStatus:{type: "string"},
                                        requestedPaidAmount:{type: "number"},
                                        actualPaidAmount:{type: "number"},
                                        paidDate:{type:"date"},
                                        reIssued: {type: "boolean"},
                                        paymentValid: {type: "boolean"},
                                        trn02:{type:"string"},
                                        payFileName: {type: "string"},

                                        // ack information
                                        acceptReject:{type: "string"},
                                        ackTransactionId: {type:"string"},
                                        rejectErrorCode: {type:"string"},
                                        rejectErrorDesc: {type:"string"}
                                    }
                                }
                            },
                            aggregate:
                                [
                                    {field: "_id", aggregate: "count"},
                                    {field: "actualPaidAmount", aggregate: "sum"},
                                    {field: "requestedPaidAmount", aggregate: "sum"}
                                ]
                        },
                        columns: [
                            {
                                title: "Batch Information",
                                columns:[
                                    {
                                        field: "createDate",
                                        title: "Batch Date",
                                        format:"{0:yyyy-MM-dd}",
                                        width: "150px"
                                    },
                                    {
                                        field: "holdingCompany",
                                        title: titles.holdingCompany,
                                        width: "150px"
                                    },
                                    {
                                        field: "division",
                                        title: titles.division,
                                        width: "150px"
                                    },
                                    {
                                        field: "subCompany",
                                        title: titles.subCompany,
                                        width: "150px"
                                    },
                                    {
                                        field: "status",
                                        title: "Processing Status",
                                        width: "200px"
                                    },

                                ]
                            },
                            {
                                title: "Claim Information",
                                columns:[
                                    {
                                        field: "claimNumber",
                                        title: "Claim Number",
                                        width: "150px"
                                   },
                                    {
                                        field: "checkEFTNumber",
                                        title: titles.checkNumber,
                                        width: "200px"
                                    },
                                   {
                                        field: "patientFirstName",
                                        title: "Patient First Name",
                                        width: "200px"
                                   },
                                   {
                                        field: "patientLastName",
                                        title: "Patient Last Name",
                                        width: "200px"
                                   },
                                   {
                                        field: "policyNumber",
                                        title: "Policy Number",
                                        width: "200px"
                                   },
                                   {
                                        field: "providerName",
                                        title: "Provider Name",
                                        width: "200px"
                                    },
                                    {
                                        field: "providerNPI",
                                        title: "Provider NPI",
                                        width: "100px"
                                    },
                                    {
                                        field: "providerTIN",
                                        title: "Provider TIN",
                                        width: "100px"
                                    }
                                ]
                            },
                            {
                                // payment information
                                title: "Payment Information",
                                columns:[
                                    {
                                        field: "disbursementTraceNumber",
                                        title: "Disbursement Trace Number",
                                        width: "200px"
                                    },
                                    {
                                        field: "payMethod",
                                        title: "Payment Method",
                                        width: "150px"
                                    },
                                    {
                                        field: "payStatus",
                                        title: "Payment Status",
                                        width: "150px"
                                    },
                                    {
                                        field: "requestedPaidAmount",
                                        title: "Requested Paid Amount",
                                        aggregates:["sum"],
                                        format:'{0:n2}',
                                        footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                        groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                        filterable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        width: "120px"
                                    },
                                    {
                                        field: "actualPaidAmount",
                                        title: "Actual Paid Amount",
                                        aggregates:["sum"],
                                        format:'{0:n2}',
                                        footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                        groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                        filterable: false,
                                        attributes:{style:"text-align:right;"},
                                        headerAttributes:{style:"text-align:right;"},
                                        width: "120px"
                                    },
                                    {
                                        field: "paidDate",
                                        title: "Processed Date",
                                        format:"{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        width: "150px"
                                    },
                                    {
                                        field: "reIssued",
                                        title: "Re-Issued",
                                        width: "150px",
                                        template: function(dataItem)
                                        {
                                            return uiSvc.displayKendoBoolean(dataItem.reIssued);
                                        }
                                    },

                                    {
                                        field: "payFileName",
                                        title: "IDF File Name",
                                        width: "250px"
                                    },
                                    {
                                        field: "paymentValid",
                                        title: "Payment Mis-Match",
                                        width: "100px",
                                        template: function(dataItem)
                                        {
                                            return uiSvc.displayKendoBoolean(dataItem.paymentValid, true);
                                        }

                                    }
                                ]
                            },
                            {
                                // ack information
                                title: "Acknowledgement Information",
                                // ack information
                                columns:[
                                    {
                                        field: "acceptReject",
                                        title: "Accepted/Rejected",
                                        width: "100px"
                                    },
                                    {
                                        field: "ackTransactionId",
                                        title: "ST Control Number",
                                        width: "200px"
                                    },
                                    {
                                        field: "rejectErrorCode",
                                        title: "Rejection Error Code",
                                        width: "120px"
                                    },
                                    {
                                        field: "rejectErrorDesc",
                                        title: "Rejection Error",
                                        width: "200px",
                                        attributes:{class:"rejectErrorDesc"}

                                    }
                                ]
                            },
                            {
                                title: "Identifier Information",
                                columns:[
                                    {
                                        field: "_id",
                                        title: "Identifer",
                                        width: "300px",
                                        aggregates:["count"],
                                        footerTemplate:"No. of Claim Payments: #=count#",
                                        groupFooterTemplate:"No. of Claim Payments: #=count#"
                                    },
                                    {
                                        field: "batchId",
                                        title: "Batch Identifer",
                                        width: "200px"
                                    },
                                    {
                                        field: "moduleDesc",
                                        title: "Module",
                                        width: "100px"
                                    },
                                    {
                                        field: "sysdate",
                                        title: "Last Updated",
                                        format:"{0:yyyy-MM-dd HH:mm:ss.fff}",
                                        filterable: false,
                                        groupable: false,
                                        width: "200px"
                                    }
                                ]
                            }
                        ],
                        dataBound: function(e)
                        {
                            var grid = this;
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);

                            // attach click events to all transaction grouping elements
                            var groups = grid.table.find("a[id^='group_']");
                            for (var i = 0; i < groups.length; i++)
                            {
                                var element = $(groups[i]);
                                element.click(function ()
                                {
                                    _this.functions.persistGridState();
                                });
                            }
                        }
                    };

                    // check for any grid customizations
                    if (_this.functionManager != null && _this.functionManager.initializeState != null)
                        _this.functionManager.initializeState(_this.gridOptions);
                };
                //</editor-fold>

                $scope.$on("kendoWidgetCreated", function(event, widget)
                {
                    // when the widget gets created set the data or watch the data variable for changes
                    if ($scope.grid === widget)
                    {
                        uiSvc.addKendoGridTooltip("rejectErrorDesc", $scope.grid);

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
                                var newRows = speInstamedDataSvc.parseClaimsKendoGridData(newValue);

                                // update the grid progress
                                $timeout(function(){
                                    if (newValue != null)
                                    {
                                        $scope.grid.dataSource.data(newRows);
                                    }
                                    $scope.grid.dataSource.page(1);

                                    if (_this.functionManager != null && _this.functionManager.loadState != null)
                                    {
                                        _this.functionManager.loadState($scope.grid);
                                    }
                                    uiSvc.displayKendoLoader("#grid", false);
                                })
                            }
                        });
                    }
                });

                _this.functions.initView();
            }
        }
    }]);

});


