/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - cnoTpciTransactionGrid.js
 /// Directive to Manage Transaction Grid for CNO Third Party Commission Intake
 /// Works for both Enrollments and Commissions based on State
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/05/2022
 /// </summary>
 */


define(['modules/custom/spe_cno/module', 'lodash', 'jszip'], function (module, lodash, jszip) {

    "use strict";
    window.JSZip = jszip;
    module.registerDirective('cnoTpciTransactionGrid', ['$filter', 'uiSvc', 'speCNODataSvc', function ($filter, uiSvc, dataSvc) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
                module: '@',     // 0 - enrollment, 1 - commissions
                mode: '@',       // 0 - dashboard, 1 - grid view, 2 - widget drill
                refreshFlag: '=',
                functionManager: '=?'
            },
            controllerAs: 'vmGridDetail',
            templateUrl: 'app/modules/custom/spe_cno/directives/cnoTpciTransactionGrid.tpl.html',
            controller: function ($element, $scope) {

                let _this = this;
                _this.functions = {};
                _this.model = {flags: {watched: false}, progressId: "grid"};
                _this.mode = parseInt(_this.mode);


                //<editor-fold desc="Functions">
                _this.functions.buildColumns = function () {


                    // routine to build up columns for the grid and return them

                    // build up fields
                    let supplemental = {
                        field: "supplemental",
                        title: "Message",
                        width: "300px",
                        groupable: false,
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "supplementalStatus"
                        }
                    };
                    let kfaPolicyNumber = {
                        field: "kfa_policy",
                        title: "KFA Policy",
                        width: "150px"
                    };
                    let policyEffectDate = {
                        field: "policy_effective_date",
                        title: "Effective Date",
                        width: "130px",
                        format: "{0:yyyy-MM-dd}",
                    };
                    let plan_code = {field: "plan_code", title: "Plan", width: "100px"};
                    let product_code = {field: "product_code", title: "Product", width: "100px"};
                    let system = {
                        field: "system",
                        title: "System",
                        width: "100px"
                    };
                    let status_desc = {
                        field: "status_desc",
                        title: "Status",
                        width: "200px",
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "statusDesc"
                        }
                    };
                    let processing_status_desc = {
                        field: "processing_status_desc",
                        title: "Processing Status",
                        width: "200px",
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "statusDesc"
                        }
                    };
                    let source_system_id = {
                            field: "source_system_id",
                            title: "Source",
                            width: "100px"
                        };
                    let policy_status = {
                        field: "policy_status",
                        title: "Policy Status",
                        width: "150px",
                        filterable: false,
                        template: function (dataItem) {
                            if (!dataItem.policy || !dataItem.policy.status)
                                return "";
                            return dataItem.policy.status;
                        }
                    };

                    let termFields = [{

                        field: "policy_termination_date",
                        title: "Term Date",
                        width: "150px",
                        format: "{0:yyyy-MM-dd}",
                    },
                        {
                            field: "policy_termination_reason",
                            title: "Term Reason",
                            width: "150px",
                            filterable: false,
                            template: function (dataItem) {
                                if (!dataItem.policy || !dataItem.policy.termination_reason)
                                    return "";
                                return dataItem.policy.termination_reason;
                            }
                        }];

                    let agent_id = {
                        field: "agent_number",
                        title: "Agent ID",
                        width: "100px"
                    };
                    let agent_san  =                         {
                            field: "agent_san",
                            title: "WA SAN/NPN",
                            width: "150px"
                        };
                    let agent_ssn =
                        {
                        field: "agent_ssn",
                        title: "WA SSN",
                        width: "120px"
                    };
                    let agentInd = {
                        field: "agent_indicator",
                        title: "WA Ind.",
                        width: "100px"
                    };

                    let insured_DOB = {
                        field: "insured_dob",
                        title: "Insured DOB",
                        width: "130px",
                        format: "{0:yyyy-MM-dd}",
                    };
                    let insured_state = {field: "insured_state", title: "Member ST", width: "150px"};
                    let insured_id = {field: "insured_id", title: "Member ID", width: "150px"};
                    let insured_name =  {
                        field: "insured_name",
                        title: "Insured",
                        width: "300px"
                    };
                    let medicare_id =                         {
                        field: "insured_medicare_id",
                        title: "Medicare Id",
                        width: "150px"
                    };

                    let commissionAmount =
                        {
                            field: "commission_amount",
                            title: "Commission Amount",
                            filterable: false,
                            aggregates: ["sum"],
                            format: '{0:n2}',
                            footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                            groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'N2') #</div>",
                            attributes: {style: "text-align:right;"},
                            headerAttributes: {style: "text-align:right;"},
                            width: "120px"
                        };


                    // now start building the grid
                    let columns = [

                        {
                            field: "_id",
                            title: "Transaction Id",
                            width: "300px",
                            aggregates: ["count"],
                            footerTemplate: "No. of Transactions: #=count#",
                            groupFooterTemplate: "No. of Transactions: #=count#",
                            groupable: false
                        },
                        {
                            field: "received_date",
                            title: "Received Date",
                            format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                            width: "170px",
                            groupable: false
                        },
                        supplemental,
                        status_desc,
                        processing_status_desc,
                        system,
                        {
                            field: "vendor_name",
                            title: "Company",
                            width: "200px"
                        },
                        kfaPolicyNumber
                    ];

                    let additionalFields = [];

                    // now add fields based on the mode and dashboard type
                    if (_this.mode == 2)
                    {
                        // dashboard drill view
                        _this.model.progressId = "dialogGrid";
                        additionalFields.push(product_code);
                        additionalFields.push(plan_code);
                        additionalFields.push(agent_id);
                        additionalFields.push(insured_id);
                        additionalFields.push(insured_state);
                        additionalFields.push(policyEffectDate);
                    }

                    if (_this.mode == 0)
                    {
                        // dashboard summary view
                        additionalFields.push(agent_san);
                        additionalFields.push(agent_id);
                        additionalFields.push(plan_code);
                        if (_this.module == dataSvc.tpciModules.COMMISSION)
                            additionalFields.push(commissionAmount);
                        additionalFields.push(policyEffectDate);
                        additionalFields.push(medicare_id);
                        additionalFields.push(insured_name);
                        additionalFields.push(insured_DOB);
                    }

                    if (_this.mode == 1)
                    {
                        // normalized view

                        if (_this.module == dataSvc.tpciModules.ENROLLMENT)
                        {
                            additionalFields.push(plan_code);
                            additionalFields.push(policyEffectDate);
                            additionalFields.push(policy_status);
                            additionalFields.push(...termFields);
                            additionalFields.push(agent_id);
                            additionalFields.push(medicare_id);
                            additionalFields.push(insured_name);
                            additionalFields.push(insured_DOB);
                            additionalFields.push(insured_state);


                            // add the other canonicial fields as needed
                            additionalFields.push(
                                {
                                    field: "insured_address1",
                                    title: "Address 1",
                                    width: "300px"
                                });
                            additionalFields.push(
                                {
                                    field: "insured_address2",
                                    title: "Address 2",
                                    width: "300px"
                                });
                            additionalFields.push(
                                {
                                    field: "insured_city",
                                    title: "City",
                                    width: "200px"
                                });
                            additionalFields.push(
                                {
                                    field: "insured_zip",
                                    title: "Zip Code",
                                    width: "200px"
                                });
                            additionalFields.push(
                                {
                                    field: "insured_phone",
                                    title: "Phone Number",
                                    width: "200px"
                                });
                            additionalFields.push({

                                field: "policy_signed_date",
                                title: "Policy Signed",
                                width: "130px",
                                format: "{0:yyyy-MM-dd}",
                            });
                            additionalFields.push(agent_ssn);
                            additionalFields.push(agentInd);

                        }

                        if (_this.module == dataSvc.tpciModules.COMMISSION)
                        {
                            additionalFields.push(agent_san);
                            additionalFields.push(agent_id);
                            additionalFields.push(plan_code);
                            additionalFields.push(commissionAmount);
                            additionalFields.push(policyEffectDate);
                            additionalFields.push(medicare_id);
                            additionalFields.push(insured_name);
                            additionalFields.push(insured_DOB);
                            additionalFields.push(insured_state);


                            // add the other canonicial fields as needed
                            additionalFields.push({

                                field: "policy_original_eff_date",
                                    title: "Policy Original Effective",
                                width: "130px",
                                format: "{0:yyyy-MM-dd}"
                            });
                            additionalFields.push({

                                field: "commission_eff_date",
                                title: "Commission Effective",
                                width: "130px",
                                format: "{0:yyyy-MM-dd}",
                            });
                            additionalFields.push({
                                field: "transaction_code",
                                title: "Transaction Code",
                                width: "100px",
                                filterable: false,
                                template: function (dataItem) {
                                    if (!dataItem.commission || !dataItem.commission.transaction_code)
                                        return "";
                                    return dataItem.commission.transaction_code;
                                }
                            });
                            additionalFields.push(agent_ssn);
                            additionalFields.push(agentInd);
                        }

                        additionalFields.push(source_system_id);
                        additionalFields.push({field: "batch_id", title: "Batch ID", width: "100px"});
                    }
                    columns.push(...additionalFields);
                    return columns;

                };
                _this.functions.drill = function (model) {
                    // routine to manage the drilling
                    if (_this.functionManager != null && _this.functionManager.drill != null)
                        _this.functionManager.drill(model);
                    else
                        dataSvc.showTCPIDetail(model);
                };
                _this.functions.initView = function () {
                    // routine to initialize the view when the controller is instantiated
                    let aggregates =
                        [
                            {field: "_id", aggregate: "count"},
                            {field: "commission_amount", aggregate: "sum"}
                        ];
                    let pageSizes = uiSvc.getKendoPageSizes();
                    if (_this.functionManager == null)
                        _this.functionManager = {};

                    let columns = _this.functions.buildColumns();


                    // set the grid options
                    _this.gridOptions = {
                        toolbar: ["excel"],
                        excel: {
                            fileName: "Transaction Listing.xlsx",
                            allPages: true
                        },
                        sortable: true,
                        groupable: _this.mode > 0,
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
                                {field: "received_date", dir: "desc"},
                                {field: "_id", dir: "desc"}
                            ],
                            schema: {
                                model: {
                                    id: "_id",
                                    uid: "_id",
                                    fields: {
                                        _id: {type: "string"},
                                        batch_id: {type: "string"},
                                        job_id: {type: "string"},
                                        processing_id: {type: "string"},
                                        record_index: {type: "number"},
                                        received_date: {type: "date"},
                                        system: {type: "string"},
                                        source_system_id: {type:"string"},

                                        status: {type: "number"},
                                        status_desc: {type: "string"},
                                        processing_status: {type: "number"},
                                        processing_status_desc: {type: "string"},


                                        supplemental: {type: "string"},

                                        vendor_code: {type: "string"},
                                        vendor_name: {type: "string"},
                                        vendor_uid: {type: "string"},

                                        insured_name: {type: "string"},
                                        insured_dob: {type: "date"},
                                        insured_state: {type: "string"},
                                        insured_medicare_id: {type: "string"},
                                        insured_id: {type: "string"},
                                        insured_address1: {type: "string"},
                                        insured_address2: {type: "string"},
                                        insured_city: {type: "string"},
                                        insured_zip: {type: "string"},
                                        insured_phone: {type: "string"},

                                        agent_id: {type: "string"},
                                        agent_name: {type:"string"},
                                        agent_number: {type: "string"},
                                        agent_ssn: {type: "string"},
                                        agent_san: {type: "string"},
                                        agent_indicator: {type: "string"},

                                        product_code: {type: "string"},
                                        plan_code: {type: "string"},
                                        commission_applicable: {type: "string"},

                                        policy: {type: "object"},
                                        policy_effective_date: {type:"date"},
                                        policy_signed_date: {type:"date"},
                                        policy_original_eff_date: {type:"date"},

                                        kfa_policy: {type: "string"},

                                        commission: {type: "object"},
                                        commission_eff_date: {type: "date"},
                                        commission_amount: {type: "number"},

                                        other_agent: {type: "object"}
                                    }
                                }
                            },
                            aggregate: aggregates
                        },
                        columns: columns,
                        dataBound: function (e) {
                            let grid = this;
                            uiSvc.dataBoundKendoGrid(grid, _this.functions.drill, true);
                        }
                    };


                    // add the tooltips to the grid
                    _this.functionManager.gridCreate = function (grid) {
                        uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");
                        uiSvc.addKendoGridTooltip("statusDesc", grid, "statusDesc");

                    };

                    // as per specification if its the dashboard view group it
                    if (_this.mode == 0) {
                        // group it by vendor code
                        // update the grid options to group by vendor
                        _this.gridOptions.dataSource.sort =
                            [
                                {field: "vendor_code", dir: "desc"},
                                {field: "received_date", dir: "desc"},
                                {field: "_id", dir: "desc"}
                            ];
                        _this.gridOptions.dataSource.group = {
                            field: "vendor_name",
                            dir: "desc",
                            aggregates: aggregates
                        };
                    }

                    // add the appropriate columns based on the module

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


