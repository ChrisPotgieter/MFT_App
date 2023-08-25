/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfLOBListCtrl.js
 /// Controller to manage  Line of Business Short to Long Code Listing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By :Chris Potgieter
 /// Date :22/03/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {
    'use strict';

    module.registerController('aegfLOBListCtrl', ['$scope', '$stateParams', 'adminDataSvc', 'uiSvc', 'speCNODataSvc', function ($scope, $stateParams, adminDataSvc, uiSvc, dataSvc) {

        // initialize the screen
        let _this = this;
        _this.functions = {};

        //<editor-fold desc="Group Select Directive Functions">
        _this.functions.onChangeGroup = function ()
        {
            //Called when user changes the group, to update the data
            _this.functions.getServerData();
        };
        //</editor-fold>


        //<editor-fold desc="Processing Functions">
        _this.functions.parseServerData = function(value)
        {
            // routine to parse the record the data for grid use
            lodash.forEach(value, function(item)
            {
                item.product_lob = item.jsonData.product_lob;
                item.carrier_id = parseInt(item.jsonData.carrier_id);
                return item;
            });
            return value;
        };

        _this.functions.requestSync = function(value)
        {
            // open the dialog that will initiate a sync of the Employer SSN Data
            let cliOperation = {
                ui:
                    {
                        question: "Refresh Lines of Business for Employee Groups from CRS",
                        class: "txt-color-teal",
                        icon: "fa fa-refresh",
                        description: "Sync Lines of Business for Employee Groups"
                    },
                operation: dataSvc.cliInstructionEnum.AEGF_LOB_SYNC,
                class: 'txt-color-teal'
            };
            cliOperation.record = {master_group: _this.model.groupFilter.group};
            //cliOperation.record = {master_group: "all"};
            cliOperation.completeFunction = function (result, instructionData, isError)
            {
                // create a complete function
                if (!isError)
                {
                    uiSvc.showExtraSmallPopup("Line of Business Short to Long Mapping", 'Sync Completed successfully !',	5000);
                }
                _this.functions.initialize(true);
            };
            dataSvc.confirmCLIOperation(cliOperation);
        };


        _this.functions.getServerData = function () {

            // routine to get the server data when either the group or sub group changes
            let model = {
                type: _this.model.base_code,
                'data.group': _this.model.groupFilter.group
            };
            adminDataSvc.readCustomerListAudit(model).then(function (result) {
                adminDataSvc.listFunctions.initializeRecords(result, _this);
                _this.model.gridData = _this.functions.parseServerData(result);
            });
        };
        //</editor-fold>

        //<editor-fold desc="Admin Framework Overrides">
        //New Record before dialog
        _this.functions.initializeNewRecord = function (row) {
            if (!row.jsonData) row.jsonData = {};
            if (!row.jsonData.group) row.jsonData.group = _this.model.groupFilter.group;
            row.newRecord = true;
            row.jsonData.status = 1;
            return row;
        };

        // set the record initializer
        _this.functions.initializeRecord = function (item) {
            if (item.jsonData == null) item.jsonData = {};
            item.flags = _this.model.flags;
            item.initialized = true;
        };

        _this.functions.initialize = function (serverPost) {
            //overide default initialize to NOT refresh data
            _this.model.flags.allowSave = false;
            if (!_this.model.groupFilter)
            {
                // check for overrides of the group filter
                _this.model.groupFilter = {group: null, sub_groups: []};
                if ($stateParams.group_id != null)
                {
                    _this.model.groupFilter.group = parseInt($stateParams.group_id);
                    serverPost = true;
                }
            }
            _this.model.lastId = -1;
            if (serverPost) {
                _this.functions.getServerData();
            }
        };

        _this.functions.onPostRecord = function (item) {
            // routine to remove all unnecessary data from the item prior to post
            let updatedRecord = {
                recordStatus: item.recordStatus,
                companyId: item.companyId,
                type: item.type,
                code: item.code,
                description: item.description
            };
            updatedRecord.jsonData =
                {
                    product_lob: item.jsonData.product_lob,
                    group: item.jsonData.group,
                    carrier_id: item.jsonData.carrier_id,
                    coverage_code: item.jsonData.coverage_code,
                    mapping_code: item.jsonData.mapping_code,
                    crs_description: item.jsonData.crs_description,
                    deduction: item.jsonData.deduction
                };
            return updatedRecord;
        };
        //</editor-fold>

        //<editor-fold desc="Initialization">
        _this.functions.initializeAdminFramework = function () {
            // initialize the admin framework
            let titleData = {title: 'Line of Business Short to Long Mapping'};
            let dialogData = {
                template: 'app/modules/custom/spe_cno/partials/aegf-lob-dialog.tpl.html',
                controller: 'aegfLOBEditDialogCtrl',
                alias: 'vmDialog'
            };
            let base_code = "AEGF_LOB";
            adminDataSvc.listFunctions.initializeListController(_this, base_code, dialogData, titleData);
            _this.model.base_code = base_code;
            _this.model.flags.allowAdd = true;
            _this.model.flags.allowId = false;


            // setup the grid options
            let pageSizes = dataSvc.aegf.functions.getPageSizes();
            _this.model.gridOptions = {
                sortable: true,
                groupable: false,
                filterable: true,
                columnMenu: true,
                resizable: false,
                pageable: {
                    pageSizes: pageSizes
                },
                selectable: 'row',
                excel: {
                    allPages: true
                },
                excelExport: function (e) {
                    e.workbook.fileName = "LOBMap_" + kendo.toString(new Date, "dd/MM/yyyy") + "_" + _this.model.groupFilter.group + " .xlsx";
                },
                dataSource:
                    {
                        data: [],
                        pageSize: pageSizes[0],
                        sort: [
                            {field: "carrier_id", dir: "desc"},
                            {field: "product_lob", dir: "desc"}
                        ],

                        schema: {
                            model: {
                                id: 'id',
                                uid: 'id',
                                fields: {
                                    id: {type: 'string'},
                                    jsonData: {type: "object"},
                                    carrier_id: {type:"number"},
                                    product_lob: {type:"string"},
                                    description: {type: 'string', from: 'description'},
                                }
                            }
                        }
                    },
                columns: [
                    {field: 'id', type: 'string', tooltip: false, hidden: true},
                    {
                        field: 'jsonData.mapping_code',
                        title: 'Short Code',
                        type: 'string',
                        width: "150px"
                    },
                    {field: 'description', title: 'Long Description', type: 'string', tooltip: false},
                    {
                        field: 'jsonData.deduction',
                        title: 'Deduction Code',
                        type: 'string',
                        tooltip: false,
                        width: "200px"
                    },
                    {field: 'jsonData.coverage_code', title: 'CRS Coverage', type: 'string', tooltip: false, width: "150px"},
                    {field: 'product_lob', title: 'Product', type: 'string', tooltip: false, width: "200px"},
                    {field: 'carrier_id',
                        title: 'Carrier',
                        type: 'string',
                        width: "200px",
                        attributes:{style:"text-align:right;"},
                        headerAttributes:{style:"text-align:right;"}
                    }

                ],
                dataBound: function (e) {
                    let grid = this;
                    uiSvc.dataBoundKendoGrid(grid, _this.functions.editRecord, true);
                }
            };
        };

        _this.initialize = function () {
            _this.functions.initializeAdminFramework();
            _this.functions.initialize();
        };
        //</editor-fold>

        // initialize the screen
        _this.initialize();
    }
    ]);
});
