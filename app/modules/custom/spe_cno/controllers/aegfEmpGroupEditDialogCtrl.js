/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfEmpGroupEditDialogCtrl.js
 /// Dialog Controller to manage Employer Group Viewing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:24/03/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {
    'use strict';

    module.registerController('aegfEmpGroupEditDialogCtrl', ['$scope', '$uibModalInstance', 'uiSvc', 'dialogData', function ($scope, $uibModalInstance, uiSvc, dialogData) {
        let _this = this;
        _this.functions = {};

		//<editor-fold desc="Functions">
		_this.functions.init = function () {

            // initialize the controller
            _this.model = {flags: {refresh: {value: 0}}};

            _this.dialogData = dialogData;
            _this.dataModel = dialogData.row;

            // assign the ids
            if (_this.dataModel.jsonData.sub_groups == null)
                _this.dataModel.jsonData.sub_groups = [];
            lodash.forEach(_this.dataModel.jsonData.sub_groups, function (row, index) {
                row.id = index;
            });

            // set the status
            _this.model.isActive = _this.dataModel.jsonData.status == 1;

            // setup the grid options for subgroup List
            _this.model.subGridOptions = {
                sortable: false,
                groupable: false,
                filterable: false,
                columnMenu: false,
                resizable: false,
                pageable: true,
                selectable: 'row',
                dataSource: {
                    data: [],
                    sort: [{field: 'code', dir: 'asc'}],
                    pageSize: 10,
                    schema: {
                        model: {
                            id: 'id',
                            uid: 'id',
                            fields: {
                                id: {type: 'string', from: 'id'},
                                code: {type: 'string', from: 'code'},
                                description: {type: 'string', from: 'description'},
                                crs_number: {type: "string"}

                            }
                        }
                    }
                },
                columns: [
                    {field: 'id', type: 'string', tooltip: false, hidden: true},
                    {field: 'code', title: 'CRS Code', type: 'string', tooltip: false},
                    {field: 'description', title: 'Description', type: 'string', tooltip: false, width: "300px"},
                    {field: 'crs_number', title: 'CRS Number', type: 'string', tooltip: false},
                    {
                        field: 'status',
                        title: 'Status',
                        filterable: false,
                        template: function (dataItem) {
                            let html = "<ul class='list-inline'>";
                            if (dataItem.status === 1) {
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
                    uiSvc.dataBoundKendoGrid(grid, null, true);
                }
            };

            // set the title
            _this.model.icon = "fa fa-group";
            _this.model.title = "View Employer Group Information";
        };

        _this.functions.cancelDialog = function () {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.confirmDialog = function () {
            $uibModalInstance.dismiss('cancel');
        };
		//</editor-fold>

        _this.functions.init();
    }
    ]);
});
