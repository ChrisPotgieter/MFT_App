/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfEmpCodeListCtrl.js
 /// Controller to manage Employee Code to SSN Map Listing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companie
 /// Written By :Chris Potgieter
 /// Date :22/03/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash)
{
    'use strict';
    module.registerController('aegfEmpCodeListCtrl', ['$scope', '$stateParams', 'uiSvc', 'adminDataSvc', 'speCNODataSvc', function ($scope, $stateParams, uiSvc, adminDataSvc, dataSvc)
	{
        // initialize the screen
        let _this = this;
        _this.functions = {};


		//<editor-fold desc="Group Select Directive Functions">
		_this.functions.onChangeGroup = function (employeeGroup) {
            //Called when user changes the group, to update the data
            _this.model.subGroupDropDown = employeeGroup.jsonData.sub_groups;
            _this.functions.getServerData();
        };

        _this.functions.onChangeSubGroup = function ()
        {
            _this.functions.getServerData();
        };
		//</editor-fold>

		//<editor-fold desc="Processing Functions">

        _this.functions.requestSync = function(value)
        {
            // open the dialog that will initiate a sync of the Employer SSN Data
            let cliOperation = {
                ui:
                    {
                        question: "Refresh SSN for Employee Groups from CRS",
                        class: "txt-color-teal",
                        icon: "fa fa-refresh",
                        description: "Sync Employee SSN for Employee Groups"
                    },
                operation: dataSvc.cliInstructionEnum.AEGF_SSN_SYNC,
                class: 'txt-color-teal'
            };
            cliOperation.record = {master_group: _this.model.groupFilter.group};
            //cliOperation.record = {master_group: "all"};
            cliOperation.completeFunction = function (result, instructionData, isError)
            {
                // create a complete function
                if (!isError)
                {
                    uiSvc.showExtraSmallPopup("Employer SSN Sync", 'Sync Completed successfully !',	5000);
                }
                _this.functions.initialize(true);
            };
            dataSvc.confirmCLIOperation(cliOperation);
        };

        _this.functions.updateSubDescriptions = function(row)
        {
            // routine to get the sub descriptions for all records in the dataset
            row.subDescription =  dataSvc.aegf.functions.getGroupDescriptions(_this.model.groupFilter.group, row.jsonData.sub_group).subGroup;
        };
		_this.functions.getServerData = function ()
		{
			// routine to get the server data when either the group or sub group changes
			let model = {
				type: _this.model.base_code,
				'data.group': _this.model.groupFilter.group
			};
			if (_this.model.groupFilter.sub_groups != null && _this.model.groupFilter.sub_groups > 0)
				model["data.sub_group"] = {$in: _this.model.groupFilter.sub_groups};
            adminDataSvc.readCustomerListAudit(model).then(function (result)
			{
                adminDataSvc.listFunctions.initializeRecords(result, _this);
                _this.model.gridData = result;
            });
        };
		//</editor-fold>

		//<editor-fold desc="Admin Framework Overrides">
		//New Record before dialog
		_this.functions.initializeNewRecord = function (row) {
			row.subGroupDropDown = _this.model.subGroupDropDown;

			// get the sub group descriptions all of all sub groups in this record
			return row;
		};
		_this.functions.onCloseDialog = function(row)
        {
            // update the sub descriptions
            _this.functions.updateSubDescriptions(row)
        };

		// set the record initializer
		_this.functions.initializeRecord = function (item)
		{

			item.subGroupDropDown = _this.model.subGroupDropDown;
            _this.functions.updateSubDescriptions(item);
            item.initialized = true;
        };

		_this.functions.initialize = function (serverPost)
		{
            // override default initialize to NOT refresh data
            _this.model.flags.allowSave = false;
            _this.model.lastId = -1;
            if (!_this.model.groupFilter)
            {
                _this.model.groupFilter = {group: null, sub_groups: []};

                if ($stateParams.group_id != null)
                {
                    _this.model.groupFilter.group = parseInt($stateParams.group_id);
                    serverPost = true;
                }
                if ($stateParams.sub_group_id != null)
                {
                    _this.model.groupFilter.sub_groups = [parseInt($stateParams.sub_group_id)];
                    serverPost = true;
                }


            }
            if (serverPost) {
                // refresh the data only if the user has updated
                _this.functions.getServerData();
            }
        };

        // routine to remove all unnecessary data from the item prior to post
        _this.functions.onPostRecord = function (item) {
            let updatedRecord = {
                recordStatus: item.recordStatus,
                companyId: item.companyId,
                type: item.type,
                code: item.code,
                description: item.description
            };
            updatedRecord.jsonData =
            {
                emp_code: item.jsonData.emp_code,
                ssn: item.jsonData.ssn,
                sub_group: item.jsonData.sub_group,
                group: item.jsonData.group,
                status: item.jsonData.status
            };
            return updatedRecord;
        };
		//</editor-fold>

		//<editor-fold desc="Initialization">
		// initialize the controller as a list editor controller
        _this.functions.initializeAdminFramework = function () {
            // initialize the admin framework
            let titleData = {title: 'Employee Code Listing'};
            let dialogData = {
                template: 'app/modules/custom/spe_cno/partials/aegf-emp-code-dialog.tpl.html',
                controller: 'aegfEmpCodeEditDialogCtrl',
                alias: 'vmDialog'
            };

            let base_code = "AEGF_EMP_CODE";
            adminDataSvc.listFunctions.initializeListController(_this, base_code, dialogData, titleData);
            _this.model.base_code = base_code;
            _this.model.flags.allowAdd = true;
            _this.model.flags.allowId = false;

            // setup the grid options
            let pageSizes = dataSvc.aegf.functions.getPageSizes();
            _this.model.gridOptions = {
                sortable: false,
                groupable: false,
                filterable: true,
                columnMenu: false,
                resizable: false,
                pageable: {
                    pageSizes: pageSizes
                },
                selectable: 'row',
                dataSource: {
                    data: [],
                    pageSize: pageSizes[1],
                    sort: [],
                    schema: {
                        model: {
                            id: 'id',
                            uid: 'id',
                            fields: {
                                id: {type: 'string', from: 'id'},
                                code: {type: 'string', from: 'code'},
                                ssn: {type: 'string', from: 'ssn'},
                                fullName: {type: 'string', from: 'fullName'},
                                group: {type: 'string', from: 'group'},
                                status: {type: 'string', from: 'status'}
                            }
                        }
                    }
                },
                columns: [
                    {field: 'id', type: 'string', tooltip: false, hidden: true},
                    {field: 'jsonData.emp_code', title: 'Employee Code', type: 'string', tooltip: false},
                    {field: 'jsonData.ssn', title: 'SSN', type: 'string', tooltip: false},
                    {field: 'description', title: 'Full Name', type: 'string', tooltip: false},
                    {
                        field: 'jsonData.sub_group',
                        title: 'Sub-Groups',
                        filterable: false,
                        template: function (dataItem) {
                            return  "<ul class='list-inline'> <li><span class='badge bg-color-blueDark text-color-white'>" + dataItem.subDescription + "</span> </li></ul>";
                        }
                    },
                    {
                        field: 'status',
                        title: 'Status',
                        filterable: false,
                        template: function (dataItem) {
                            var html = "<ul class='list-inline'>";
                            if (dataItem.jsonData.status === 1) {
                                html +=
                                    "<li> <span class='badge bg-color-green txt-color-white'>Active</span></li>";
                            } else {
                                html +=
                                    "<li> <span class='badge bg-color-red txt-color-white'>InActive</span></li>";
                            }

                            return html;
                        }
                    }
                ],
                dataBound: function (e) {
                    let grid = this;
                    uiSvc.dataBoundKendoGrid(grid, _this.functions.editRecord);
                }
            };
        };

        _this.initialize = function () {
            _this.functions.initializeAdminFramework();
            _this.functions.initialize(false);
        };
		//</editor-fold>

        // initialize the screen
        _this.initialize();
    }
    ]);
});
