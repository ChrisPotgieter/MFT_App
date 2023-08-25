/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - aegfConfigGrid.js
 /// Directive to Manage Display of the Configuration Grid in various forms for the Automated Employer Group Files Sub-System
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/08/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module'], function(module) {

    "use strict";
    module.registerDirective('aegfConfigGrid', ['$filter', '$timeout', 'uiSvc', 'speCNODataSvc', function($filter, $timeout, uiSvc, dataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
                mode:'@', // 0 - config reporting, 1 - dashboard (scheduled), 2 - dashboard(pay period)
                refreshFlag:'=',
                functionManager:'=?'
            },
            controllerAs:'vmGridConfig',
            templateUrl: 'app/modules/custom/spe_cno/directives/aegfConfigGrid.tpl.html',
            controller: function($element, $scope)
            {

                let _this = this;
                _this.functions = {};
                _this.model = {height: null, rebuild:{value: 0}};

                //<editor-fold desc="Functions">
                _this.functions.buildConfigViewColumns = function()
                {
                    // routine to build the standard mode columns and add the bar
                    $timeout(function()
                    {
                        _this.model.options.toolbar.push({name: "Add", text:"Add Definition", template: kendo.template($("#templateAdd").html())});
                        _this.model.rebuild.value += 1;
                    }, 500);
                    let fields =  [
                          { field: "_id", type: "string", tooltip: false, hidden: true },
                          {
                              field: "action",
                              title: "Action",
                              sortable: false,
                              columnMenu: false,
                              filterable: false,
                              resizable: false,
                              width: "70px",
                              template: function (dataItem) {
                                  let button = "<button class='btn btn-default' ng-click=\"functionManager.insertRecord(\'" + dataItem._id + "\');\"><i class=\"fa fa-copy\"></i></button>";
                                  return button;
                              }
                          },
                          {
                              field: "groupDesc",
                              title:"Employer Group",
                              type: "string",
                              tooltip: false,
                              width: "300px",
                              aggregates:["count"],
                              footerTemplate: "No. of Employers: #=count#",
                              groupFooterTemplate: "No. of Employers: #=count#"
                          },
                          {
                              field: "groupCode",
                              title:"CRS Code ",
                              type: "string",
                              tooltip: false,
                              width: "150px"
                          },

                          {
                              field: "subGroupDesc",
                              title:"Sub Group",
                              type: "string",
                              tooltip: false,
                              width: "400px"
                          },
                          {
                              field: 'last_execution.transaction_id',
                              title: 'Last Execution Id',
                              type: 'string',
                              sortable: false,
                              groupable: false,
                          },
                          {
                              field: 'last_execution.mft_id',
                              title: 'Delivery Transaction',
                              type: 'string',
                              tooltip: false,
                              sortable: false,
                              groupable: false,

                          },
                          {
                              field: 'supplemental',
                              title: 'Supplemental',
                              type: 'string',
                              tooltip: false,
                              sortable: false,
                              groupable: false,
                              width: "200px",
                              attributes: {
                                  style: "text-overflow:ellipsis;white-space:nowrap;",
                                  class: "supplementalTooltip"
                              }
                          },
                          {
                              field: "last_execution.date",
                              title: 'Date Last Executed',
                              format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                              width: "200px",
                              sortable: false,
                              groupable: false,
                          },
                          {
                              field: "status_desc",
                              title: 'Status',
                              attributes: {
                                  style: "text-overflow:ellipsis;white-space:nowrap;",
                                  class: "statusTooltip"
                              }

                          }
                    ]
                    return fields;
                };

                _this.functions.buildPayPeriodColumns = function() {
                    // routine to return the scheduled columns
                    _this.model.options.dataSource.schema.model.fields = {
                        _id: {type: "string"},
                        groupDesc: {type: "string"},
                        groupCode: {type: "string"},
                        subGroupDesc: {type: "string"},
                        pay_period_start: {type: "date"},
                        pay_period_expire: {type: "date"}
                    };
                    _this.model.options.dataSource.sort = [
                        {field: "pay_period_expire", dir: "asc"},
                    ];

                    let fields =  [
                        { field: "_id", type: "string", tooltip: false, hidden: true },
                        {
                            field: "groupDesc",
                            title:"Employer Group",
                            type: "string",
                            tooltip: false,
                            width: "300px",
                            aggregates:["count"],
                            footerTemplate: "No. of Pay Period Expiration(s): #=count#",
                            groupFooterTemplate: "No. of Pay Period Expiration(s): #=count#"

                        },
                        {
                            field: "groupCode",
                            title:"CRS Code ",
                            type: "string",
                            tooltip: false,
                            width: "150px"
                        },

                        {
                            field: "subGroupDesc",
                            title:"Sub Group",
                            type: "string",
                            tooltip: false,
                            width: "300px"
                        },
                        {
                            field: "payroll_type",
                            title: 'Pay Period Type',
                            width: "100px"
                        },
                        {
                            field: "pay_period_start",
                            title: 'Period Start',
                            format: "{0:yyyy-MM-dd}",
                            width: "200px",
                            groupable: false,
                        },
                        {
                            field: "pay_period_expire",
                            title: 'Period End',
                            format: "{0:yyyy-MM-dd}",
                            width: "200px",
                            groupable: false,
                        }


                    ];
                    return fields;
                };

                _this.functions.buildScheduledColumns = function() {
                    // routine to return the scheduled columns
                    _this.model.options.dataSource.schema.model.fields = {
                        _id: {type: "string"},
                        groupDesc: {type: "string"},
                        groupCode: {type: "string"},
                        subGroupDesc: {type: "string"},
                        next_run: {type: "date"}
                    };
                    _this.model.options.dataSource.sort = [
                        {field: "next_run", dir: "asc"},
                    ];

                    let fields =  [
                        { field: "_id", type: "string", tooltip: false, hidden: true },
                        {
                            field: "groupDesc",
                            title:"Employer Group",
                            type: "string",
                            tooltip: false,
                            width: "300px",
                            aggregates:["count"],
                            footerTemplate: "No. of Schedule(s): #=count#",
                            groupFooterTemplate: "No. of Schedule(s): #=count#"

                        },
                        {
                            field: "groupCode",
                            title:"CRS Code ",
                            type: "string",
                            tooltip: false,
                            width: "150px"
                        },

                        {
                            field: "subGroupDesc",
                            title:"Sub Group",
                            type: "string",
                            tooltip: false,
                            width: "300px"
                        },
                        {
                            field: "schedule_type",
                            title: 'Schedule Type',
                            width: "100px"
                        },
                        {
                            field: "next_run",
                            title: 'Next Scheduled Run',
                            format: "{0:yyyy-MM-dd HH:mm tt}",
                            width: "200px",
                            groupable: false,
                        }
                    ];
                    return fields;
                };


                _this.functions.buildColumns = function()
                {
                    // routine to build the columns that will be returned
                    // this will be based on the mode of the grid
                    let mode = parseInt(_this.mode);

                    switch (mode)
                    {
                        case 1:
                            _this.model.options.columns = _this.functions.buildScheduledColumns();
                            break;
                        case 2:
                            _this.model.options.columns = _this.functions.buildPayPeriodColumns();
                            break;
                        default:
                            _this.model.options.columns = _this.functions.buildConfigViewColumns();
                            break;
                    }
                };


                _this.functions.initView = function()
                {
                    // routine to initialize the view when the controller is instantiated

                    // check for a function-manager
                    if (!_this.functionManager)
                        _this.functionManager = {};

                    if (!_this.functionManager.editRecord)
                    {
                        _this.functionManager.editRecord = function (id)
                        {
                            dataSvc.aegf.functions.viewDefinition(id);

                        }
                    };


                    let pageSizes = dataSvc.aegf.functions.getPageSizes();
                    _this.model.options =  {
                        sortable: true,
                        groupable: false,
                        filterable: true,
                        columnMenu: true,
                        resizable: true,
                        pageable: {
                            pageSizes: pageSizes
                        },

                        toolbar: ["excel"],
                        excel: {
                            fileName: "Configurations.xlsx",
                            allPages: true
                        },
                        selectable: "row",
                        dataSource: {
                            pageSize: pageSizes[0],
                            sort: [
                                {field: "group", dir: "desc"},
                                {field: "sub_group", dir: "desc"},
                            ],
                            schema: {
                                model: {
                                    id: '_id',
                                    uid: '_id',
                                    fields:
                                        {
                                            _id: { type: "string" },
                                            groupDesc: {type:"string"},
                                            groupCode: {type:"string"},
                                            subGroupDesc: {type:"string"}
                                        }
                                }
                            },
                            aggregate:
                                [
                                    {field: "groupDesc", aggregate: "count"}
                                ]
                        },
                        dataBound: function (e)
                        {
                            let grid = this;
                            uiSvc.dataBoundKendoGrid(grid, _this.functionManager.editRecord, true);
                        }
                    };
                    _this.functions.buildColumns();
                };


                //</editor-fold>

                _this.functions.initView();
            }
        }
    }]);

});


