/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.directives - speInstamedTransactionGrid
 /// SPE InstaMed Extension
 /// Core Transaction Listing Kendo Grid Directive
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */

define(['modules/spe/module', 'lodash','jszip'], function(module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('speInstamedTransactionGrid', ['$state','$timeout', 'uiSvc', 'speInstamedDataSvc', function($state,$timeout, uiSvc, speInstamedDataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@', // 0 - transaction reporting, 1 - dashboard
                functionManager:'=?',
            },
            controllerAs:'vm',
            template: '<div kendo-grid="grid" k-options="vm.gridOptions" ng-style="vm.style"/>',
            controller: function($element, $scope)
            {

                var _this = this;
                _this.functions = {};
                _this.model = {flags:{ watched:false}, columns:{}, aggregates:[], fields:[]};
                _this.model.titles = speInstamedDataSvc.getProcTitles();

                //<editor-fold desc="Functions">
                _this.functions.buildColumns = function()
                {
                    // routine to build up the dynamic columns for the partner and response section based on the known payment methods and status
                    _this.model.columns.partner = {total:[],methods:[],status:[]};
                    _this.model.columns.response = {total:[],methods:[],status:[]};
                    _this.model.aggregates = [
                        {field: "transactionId", aggregate: "count"},           // batch id
                        {field: "req_claimCount", aggregate: "sum"},            // request claim payment count
                        {field: "req_claimAmount", aggregate: "sum"},           // request claim payment amount
                        {field: "preEdit_claimCount", aggregate: "sum"},            // pre-edit claim count
                        {field: "preEdit_claimAmount", aggregate: "sum"},           // pre-edit claim amount
                        {field: "pay_claimCount", aggregate: "sum"},            // 835 claim payment count
                        {field: "pay_claimAmount", aggregate: "sum"},           // 835 claim payment amount
                        {field: "pay_tranCount", aggregate: "sum"},             // 835 st value
                        {field: "pay_tranAmount", aggregate: "sum"},            // 835 st count
                        {field: "pay_nc_claimCount", aggregate: "sum"},         // 835 non-compliant count

                    ];
                    _this.model.fields = {

                        // general
                        batch_date: {type: "date"},
                        sys_date: {type: "date"},
                        _id:{type:"string"},
                        transactionId: {type:"string"},
                        holdingCompany:{type:"string"},
                        division:{type: "string"},
                        outOfBalance:{type:"string"},

                        // requests
                        req_claimCount: {type:"number"},
                        req_claimAmount: { type:"number"},

                        //pre-Edits
                        preEdit_claimCount: {type:"number"},
                        preEdit_claimAmount: { type:"number"},

                        // 835
                        pay_claimCount:{type:"number"},
                        pay_claimAmount:{type:"number"},
                        pay_tranCount:{ type:"number"},
                        pay_tranAmount:{type:"number"},
                        pay_nc_claimCount:{type:"number"}
                    };


                    if (_this.mode == 0)
                    {
                        // add the additional fields we need for detail view
                        var additionalFields =
                        {
                            // 835
                            pay_claimCountPaid:{type:"number"},
                            pay_claimCountNPaid:{type:"number"},

                            // acknowlegement
                            ack_incl:{type:"number"},
                            ack_recv:{ type:"number"},
                            ack_acc:{type:"number"},
                            ack_rej:{type:"number"}
                        };
                        _this.model.fields = lodash.merge(_this.model.fields, additionalFields);
                        var additionalAggFields = [

                            {field: "pay_claimCountNPaid", aggregate: "sum"},   // 835 non-paid count
                            {field: "pay_claimCountPaid", aggregate: "sum"},    // 835 paid count

                            {field: "ack_incl", aggregate: "sum"},              // ack included
                            {field: "ack_recv", aggregate: "sum"},              // ack received
                            {field: "ack_acc", aggregate: "sum"},               // ack accepted
                            {field: "ack_rej", aggregate: "sum"}               // ack rejected
                        ];
                        lodash.forEach(additionalAggFields, function (field)
                        {
                            _this.model.aggregates.push(field);
                        })
                    }
                    _this.model.columns.partner.total = [];
                    _this.model.columns.partner.methods = [];

                    _this.model.columns.response.total = [];
                    _this.model.columns.response.methods = [];
                    lodash.forEach(speInstamedDataSvc.getPaymentMethods(), function (method)
                    {
                        _this.model.columns.partner.methods.push(speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.partner.methods.list", "part_pm", method));
                        _this.model.columns.response.methods.push(speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.response.methods.list", "res_pm", method));
                    });
                    _this.model.columns.partner.status = lodash.map(speInstamedDataSvc.getPartnerProcStatusCodes(), function(status)
                    {
                        return speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.partner.status.list", "part_st", status);
                    });
                    _this.model.columns.response.status = lodash.map(speInstamedDataSvc.getResponseStatusCodes(), function(status)
                    {
                        return speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.response.status.list", "res_st", status);
                    });

                    _this.model.columns.partner.dashboardStatus = lodash.map(speInstamedDataSvc.getPartnerProcStatusCodesDashboard(), function(status)
                    {
                        return speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.partner.status.list", "part_st", status);
                    });

                    _this.model.columns.partner.total = lodash.map(speInstamedDataSvc.getTotals(), function(total)
                    {
                        return speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.partner.methods.total", "part_pm", total);
                    });

                    _this.model.columns.response.total = lodash.map(speInstamedDataSvc.getTotals(), function(total)
                    {
                        return speInstamedDataSvc.createBalancingGridColumn(_this.model.fields, _this.model.aggregates, "summary.response.methods.total", "res_pm", total);
                    });
                };

                _this.functions.drill = function(model)
                {
                    // routine to manage the drilling
                    _this.functions.persistGridState(model);
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                };

                _this.functions.dashboardDrill = function(model)
                {
                     // routine to navigate to the transaction
                     speInstamedDataSvc.navigateTransaction(model._id, $state.$current);
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
                    _this.functions.buildColumns();

                    if (_this.mode == 0)
                    {
                        // detailed view
                        _this.style = {height:"500px"}; // we need a fixed header
                        var pageSizes = uiSvc.getKendoPageSizes();

                        _this.gridOptions  = {
                            noRecords: true,
                            messages: {
                                noRecords: "No Records Available"
                            },
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Batch Listing.xlsx",
                                allPages: true
                            },
                            excelExport: uiSvc.excelExport,
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
                                    {field: "batch_date", dir: "desc"}
                                ],
                                schema: {
                                    model: {
                                        id: "_id",
                                        uid: "_id",
                                        fields: _this.model.fields
                                    }
                                },
                                aggregate: _this.model.aggregates,
                                group: [{field: "holdingCompany", dir: "asc", aggregates: _this.model.aggregates }, {field: "division", dir: "asc",  aggregates: _this.model.aggregates}]
                            },
                            columns: [
                                {
                                    title: "Batch Information",
                                    columns:[
                                        {
                                            field: "holdingCompany",
                                            title: _this.model.titles.holdingCompany,
                                            width: "150px",
                                            attributes:{class:"outofBalance"}
                                        },
                                        {
                                            field: "division",
                                            title: _this.model.titles.division,
                                            width: "150px"
                                        },
                                    ]
                                },
                                {
                                    title: _this.model.titles.request,
                                    columns:[
                                        {
                                            field: "batch_date",
                                            title: "Received Date",
                                            format:"{0:yyyy-MM-dd}",
                                            width: "200px",
                                        },
                                        {
                                            field: "req_claimCount",
                                            title: "Total",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "120px"
                                        },
                                        {
                                            field: "req_claimAmount",
                                            title: "Amount",
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
                                            field: "preEdit_claimCount",
                                            title: "Pre-Edit Count",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "150px"
                                        },
                                        {
                                            field: "pay_nc_claimCount",
                                            title: "Non Compliant",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "150px"
                                        }
                                    ]
                                },
                                {
                                    title: _this.model.titles.x12835,
                                    columns:[
                                        {
                                            title: "Claim Payments",
                                            columns: [
                                                {
                                                    field: "pay_claimCountPaid",
                                                    title: "Paid",
                                                    aggregates: ["sum"],
                                                    format: '{0:n0}',
                                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    attributes: {style: "text-align:right;"},
                                                    headerAttributes: {style: "text-align:right;"},
                                                    filterable: false,
                                                    width: "120px"
                                                },
                                                {
                                                    field: "pay_claimCountNPaid",
                                                    title: "Non-Paid",
                                                    aggregates:["sum"],
                                                    format: '{0:n0}',
                                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    attributes:{style:"text-align:right;"},
                                                    headerAttributes:{style:"text-align:right;"},
                                                    filterable: false,
                                                    width: "120px"
                                                },
                                                {
                                                    field: "pay_claimCount",
                                                    title: "Total",
                                                    aggregates:["sum"],
                                                    format: '{0:n0}',
                                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    attributes:{style:"text-align:right;"},
                                                    headerAttributes:{style:"text-align:right;"},
                                                    filterable: false,
                                                    width: "120px"
                                                },
                                                {
                                                    field: "pay_claimAmount",
                                                    title: "Amount",
                                                    aggregates:["sum"],
                                                    format:'{0:n2}',
                                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                                    filterable: false,
                                                    attributes:{style:"text-align:right;"},
                                                    headerAttributes:{style:"text-align:right;"},
                                                    width: "120px"
                                                }
                                            ]
                                        },
                                        {
                                            title: "X12 Transactions",
                                            columns: [
                                                {
                                                    field: "pay_tranCount",
                                                    title: "ST Total",
                                                    aggregates:["sum"],
                                                    format: '{0:n0}',
                                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                                    attributes:{style:"text-align:right;"},
                                                    headerAttributes:{style:"text-align:right;"},
                                                    filterable: false,
                                                    width: "120px"
                                                },
                                                {
                                                    field: "pay_tranAmount",
                                                    title: "ST Amount",
                                                    aggregates:["sum"],
                                                    format:'{0:n2}',
                                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                                    filterable: false,
                                                    attributes:{style:"text-align:right;"},
                                                    headerAttributes:{style:"text-align:right;"},
                                                    width: "120px"
                                                }
                                            ]
                                        },
                                    ]
                                },
                                {
                                    title: _this.model.titles.x12999,
                                    columns:[
                                        {
                                            field: "ack_incl",
                                            title: "Included",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "120px"
                                        },
                                        {
                                            field: "ack_recv",
                                            title: "Received",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "120px"
                                        },
                                        {
                                            field: "ack_acc",
                                            title: "Accepted",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "120px"
                                        },
                                        {
                                            field: "ack_rej",
                                            title: "Rejected",
                                            aggregates:["sum"],
                                            format: '{0:n0}',
                                            footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                            attributes:{style:"text-align:right;"},
                                            headerAttributes:{style:"text-align:right;"},
                                            filterable: false,
                                            width: "120px"
                                        }
                                    ]
                                },
                                {
                                    title: _this.model.titles.partner,
                                    columns:[
                                        {
                                            title: "Total",
                                            columns: _this.model.columns.partner.total
                                        },
                                        {
                                            title: "Payment Method",
                                            columns: _this.model.columns.partner.methods
                                        },
                                        {
                                            title: "Payment Status",
                                            columns: _this.model.columns.partner.status
                                        }
                                    ]
                                },
                                {
                                    title: _this.model.titles.response,
                                    columns:[
                                        {
                                            title: "Total",
                                            columns: _this.model.columns.response.total
                                        },
                                        {
                                            title: "Payment Method",
                                            columns: _this.model.columns.response.methods
                                        },
                                        {
                                            title: "Payment Status",
                                            columns: _this.model.columns.response.status
                                        }
                                    ]
                                },
                                {
                                    title: "Identifier Information",
                                    columns:[
                                        {
                                            field: "transactionId",
                                            title: "Batch Number",
                                            width: "250px",
                                            aggregates:["count"],
                                            footerTemplate:"No. of Transactions: #=count#",
                                            groupFooterTemplate:"No. of Transactions: #=count#"
                                        },
                                        {
                                            field: "moduleDesc",
                                            title: "Module",
                                            width: "100px"
                                        },
                                        {
                                            field: "departmentDesc",
                                            title: "Department",
                                            width: "140px"
                                        },
                                        {
                                            field: "sys_date",
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

                    }
                    if (_this.mode == 1)  // dashboard view
                    {
                        var pageSizes = uiSvc.getKendoPageSizes(true);
                        _this.gridOptions = {
                            sortable: true,
                            groupable: false,
                            filterable: true,
                            columnMenu: false,
                            resizable: false,
                            scrollable: true,
                            reorderable: false,

                            selectable: "row",
                            pageable:
                                {
                                    pageSizes: pageSizes
                                },
                            dataSource: {
                                sort: [
                                    {field: "batch_date", dir: "desc"}
                                ],
                                pageSize: pageSizes[0],
                                schema: {
                                    model: {
                                        id: "_id",
                                        uid: "_id",
                                        fields: _this.model.fields
                                    }
                                },
                                aggregate: _this.model.aggregates
                            },
                            columns: [

                                {
                                    field: "batch_date",
                                    title: "Received Date",
                                    format: "{0:yyyy-MM-dd}",
                                    width: "200px"
                                },
                                {
                                    field: "holdingCompany",
                                    title: _this.model.titles.holdingCompany,
                                    width: "150px",
                                    attributes:{class:"outofBalance"}
                                },
                                {
                                    field: "division",
                                    title: _this.model.titles.division,
                                    width: "150px"
                                },
                                {
                                    field: "req_claimCount",
                                    title: _this.model.titles.backend + " Total",
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    filterable: false,
                                    width: "120px"
                                },
                                {
                                    field: "req_claimAmount",
                                    title: _this.model.titles.backend + " Amount",
                                    aggregates: ["sum"],
                                    format: '{0:n2}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                    filterable: false,
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
                                },
                                {
                                    field: "preEdit_claimCount",
                                    title: _this.model.titles.preEdit + " Total",
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    filterable: false,
                                    width: "150px"
                                },
                                {
                                    field: "pay_nc_claimCount",
                                    title: "Non Compliant",
                                    aggregates:["sum"],
                                    format: '{0:n0}',
                                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    attributes:{style:"text-align:right;"},
                                    headerAttributes:{style:"text-align:right;"},
                                    filterable: false,
                                    width: "150px"
                                },
                                {
                                    field: "pay_claimCount",
                                    title: _this.model.titles.ediType + " Total",
                                    aggregates: ["sum"],
                                    format: '{0:n0}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    filterable: false,
                                    width: "120px"
                                },
                                {
                                    field: "pay_claimAmount",
                                    title: _this.model.titles.ediType + " Amount",
                                    aggregates: ["sum"],
                                    format: '{0:n2}',
                                    footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                    groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                                    filterable: false,
                                    attributes: {style: "text-align:right;"},
                                    headerAttributes: {style: "text-align:right;"},
                                    width: "120px"
                                },
                                {
                                    title: _this.model.titles.partner,
                                    columns:[
                                        {
                                            title: "Total",
                                            columns: _this.model.columns.partner.total
                                        },
                                        {
                                            title: "Payment Method",
                                            columns: _this.model.columns.partner.methods
                                        },
                                        {
                                            title: "Payment Status",
                                            columns: _this.model.columns.partner.dashboardStatus
                                        }
                                    ]
                                },
                                {
                                    title: _this.model.titles.response,
                                    columns:[
                                        {
                                            title: "Total",
                                            columns: _this.model.columns.response.total
                                        },
                                        {
                                            title: "Payment Method",
                                            columns: _this.model.columns.response.methods
                                        },
                                        {
                                            title: "Payment Status",
                                            columns: _this.model.columns.response.status
                                        }
                                    ]
                                }
                            ],
                            dataBound: function (e)
                            {
                                var grid = this;
                                uiSvc.dataBoundKendoGrid(grid, _this.functions.dashboardDrill);
                            }
                        };
                    }

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
                        uiSvc.addKendoGridTooltip("outofBalance", $scope.grid, "outofBalance");

                        if (_this.functionManager != null)
                        {
                            _this.functionManager.grid = $scope.grid;
                        }

                        // when the widget gets created set the data or watch the data variable for changes
                        $scope.$watchCollection("vm.data", function(newValue, oldValue)
                        {
                            // update the grid the moment the data changes - no need for observable array
                            if (newValue != oldValue || !_this.model.flags.watched)
                            {
                                _this.model.flags.watched = true;
                                uiSvc.displayKendoLoader("#grid", true);

                                var newRows = speInstamedDataSvc.parseBalancingKendoGridData(newValue);

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


