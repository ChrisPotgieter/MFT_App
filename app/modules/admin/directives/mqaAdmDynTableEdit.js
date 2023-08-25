/*
 /// <summary>
 /// modules.admin.directives - mqaAdmDynTableEdit.js
 /// Administration Module Directive to Control Individual Dynamic Table Configuration Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash','appCustomConfig', 'moment', 'bootstrap-validator'], function(module, lodash,  appCustomConfig, moment) {
  "use strict";
  moment().format();


  module.registerDirective('mqaAdmDynTableEdit', ['$timeout', '$uibModal', 'uiSvc', , 'adminDataSvc', 'cacheDataSvc', function($timeout, $uibModal, uiSvc, adminDataSvc, cacheDataSvc)
  {

    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmDynTableEdit.tpl.html",
        replace: true,
        controllerAs:'vm',
        controller: function($element, $scope)
        {
            var _this = this;
            _this.functions = {};
            _this.model = {columnGrid:{}, dashboardOptions:[], flags:{gridRefresh: {value: 0}, showInsert: appCustomConfig.runMode == 4}};
            _this.forms = {};


            var editFormSetup = function ()
            {
                var innerForm = $($($element).find("#frmDynTableEdit")[0]);
                // routine to setup the queue editor form
                var fields = {
                    fields: {
                        code: {
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Metric Name is Required'
                                },
                                regexp: {
                                    regexp:"^[a-zA-Z0-9_]{1,}$",
                                    message:"Metric Name must contain no spaces or special characters and must be a minimum of 1"
                                },

                                callback: {
                                    message: 'Metric Name  already exists',
                                    callback: function (value, validator, $field) {
                                        var found = lodash.find($scope.vm.model.data, function (record)
                                        {
                                            return (record.code === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != $scope.editRow.rowId);
                                        });
                                        if (found) {
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            }
                        },
                        description: {
                            group:"#div_desc",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Description is Required'
                                }
                            }
                        },
                        period:
                            {
                                group:"#div_retention",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The Retention Period cannot be Empty'
                                },
                                integer: {
                                    message: 'The Retention Period must be numeric'
                                }
                            }
                        },
                        limit:
                            {
                                group:"#div_limit",
                                excluded: false,
                                validators: {
                                    notEmpty: {
                                        message: 'The Display Top Cannot be Empty'
                                    },
                                    integer: {
                                        message: 'The Display Top must be numeric'
                                    }
                                }
                            },
                        dashboard:
                            {
                                group:"#div_dashboard",
                                excluded: false,
                                validators: {
                                    notEmpty: {
                                        message: 'The Dashboard Cannot be Empty'
                                    }
                                }
                            },


                        hiddenValidation: {
                            excluded: false,
                            validators: {
                                callback: {
                                    message: 'A Dynamic Table  Group requires at least one Column Definition',
                                    callback: function (value, validator, $field)
                                    {
                                        var valid = ($scope.editRow.jsonData.columns.length) > 0;
                                        return valid;
                                    }
                                }
                            }
                        }
                    }
                };
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
                var fv = innerForm.bootstrapValidator(formOptions);
                _this.forms.topForm = innerForm.data('bootstrapValidator');
            };




            var initialize = function()
            {
                // routine to initialize the form
                editFormSetup();
                _this.model.buttonText = "Create";

                if ($scope.editRow.recordStatus == uiSvc.editModes.UPDATE)
                {
                    _this.model.buttonText = "Save";

                    // validate the form on edit
                    $timeout(function () {
                        _this.forms.topForm.validate();

                    }, 500);
                }
                if ($scope.editRow.jsonData && $scope.editRow.jsonData.retentionType != null)
                    $scope.editRow.jsonData.retentionType = $scope.editRow.jsonData.retentionType.toString();
                if ($scope.editRow.jsonData && $scope.editRow.jsonData.limit == null)
                    $scope.editRow.jsonData.limit = 100;


                // get the dashboard options
                _this.model.dashboardOptions = [];
                lodash.forEach(cacheDataSvc.getBaseModules(), function(module)
                {
                   _this.model.dashboardOptions.push({code: module.code, description: module.description});
                });
                _this.model.dashboardOptions.push({code:"inline", description:"In-Line"});



                // set the column data grid options
                assignIds();
                _this.model.columnGrid.dataOptions = {
                    resizable: false,
                    selectable: "row",
                    dataSource:
                        {
                            sort:
                                [

                                    {field:	"rowId", dir:"asc"}
                                ],
                            schema:
                                {
                                    model:
                                        {
                                            id: "rowId",
                                            uid:"rowId",
                                            source: {type: "string"},
                                            destination: {type: "string"},
                                            caption: {type: "string"},
                                            width: {type: "number"},
                                            mandatory: {type: "boolean"},
                                            aggregate: {type: "number"}
                                        }
                                }
                        },
                    columns: [
                        {field: "rowId", type: "string", tooltip: false,hidden: true},
                        {field:"caption", type:"string", tooltip: true,  title:"Caption"},
                        {field: "source", title: "REST Call", type: "string", tooltip: false},
                        {field: "destination", title: "Storage", type: "string", tooltip: false},
                        {field: "width", title:"Width", type: "number", tooltip: false},
                        {
                            field: "mandatory",
                            title: "Mandatory",
                            width:"140px",
                            template: function(dataItem)
                            {
                                var entry = lodash.find($scope.editRow.jsonData.columns, {rowId: dataItem.rowId});
                                if (entry != null && entry.mandatory)
                                    return "<i class='fa fa-check'/>";
                                return "";
                            }
                        },
                        {
                            field:"aggregate",
                            title:"Aggregation",
                            template: function(dataItem)
                            {
                                var value = dataItem.aggregate.toString();
                                switch (value)
                                {
                                    case "0":
                                        return "Sum";
                                    case "1":
                                        return "Average";
                                    case "2":
                                        return "Count";
                                    default:
                                        return "None"
                                }
                            }
                        }

                    ]
                };
            };

            var assignIds = function ()
            {
                lodash.forEach($scope.editRow.jsonData.columns, function(item, index)
                {
                    item.rowId = index;
                    item.rowStyle = null;
                });
            };



            //<editor-fold desc="Editing Functions">

            var confirmDelete = function (ButtonPressed) {
                // routine to handle the delete request from the user
                if (ButtonPressed == "Yes") {
                    $scope.deleteRecord();
                }
            };

            _this.functions.onSave = function ()
            {
                // routine to validate the form and pass control back to the controller to save the record
                _this.forms.topForm.revalidateField("hiddenValidation");
                _this.forms.topForm.validate();
                var valid = _this.forms.topForm.isValid();
                if (!valid)
                    return;

                // now save the record
                $scope.saveRecord();
            };

            _this.functions.cancelRecord = function()
            {
                $scope.cancelRecord();
            };



            _this.functions.userDelete = function () {
                // routine to confirm deletion of of the row
                var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Dynamic Table Definition ? ", '[No][Yes]', confirmDelete)
            };

            _this.functions.columnDialog = function(record)
            {
                // routine to bring up the dialog for column field entry
                var dialogData = {};
                dialogData.row = angular.copy(record);
                dialogData.baseColumns = $scope.editRow.jsonData.columns;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/modules/admin/directives/mqaAdmDynTableColumnEditDialog.tpl.html',
                    controller: 'mqaAdmDynTableColumnEditDialogCtrl',
                    controllerAs: 'vmDialog',
                    resolve:
                        {
                            dialogData: dialogData
                        }
                });
                modalInstance.result.then(function (result)
                {
                    // refresh the data
                    var type = result.recordStatus;
                    if (type == uiSvc.editModes.INSERT)
                    {
                        // insert the column
                        result.rowId = $scope.editRow.jsonData.columns.length + 1;
                        $scope.editRow.jsonData.columns.push(result);
                    }
                    if (type == uiSvc.editModes.DELETE)
                    {
                        // remove the column
                        var entry = {rowId:result.rowId};
                        lodash.remove($scope.editRow.jsonData.columns, entry);
                    }
                    if (type == uiSvc.editModes.UPDATE)
                    {
                        // update the record
                        var recordIndex = lodash.findIndex($scope.editRow.jsonData.columns, {rowId: result.rowId});
                        if (recordIndex >= -1)
                            $scope.editRow.jsonData.columns.splice(recordIndex, 1,result);
                    }

                    // update the overall record status
                    if (!$scope.editRow.recordStatus)
                        $scope.editRow.recordStatus = uiSvc.editModes.UPDATE;//"Update"
                    if (!$scope.editRow.rowStyle || $scope.editRow.rowStyle == null)
                        $scope.editRow.rowStyle = "recordUpdate";

                    _this.model.flags.gridRefresh.value += 1;
                }, function ()
                {
                });
            };

            _this.functions.onEditColumn = function(record)
            {
                // routine to bring up the column editor form to allow the user to edit the column they have selected
                record.recordStatus = uiSvc.editModes.UPDATE;
                _this.functions.columnDialog(record);
            };

            _this.functions.onNewColumn = function()
            {
                var record = {aggregate:"99", mandatory: false, rowId: $scope.editRow.jsonData.columns.length + 1, recordStatus: uiSvc.editModes.INSERT, width:50 }
                _this.functions.columnDialog(record);
            };

            _this.functions.simulateInsert = function()
            {
                // routine to simulate an insert point request to the server
                var eventTime = moment().subtract({days: 2});
                var model = {configCode: $scope.editRow.code, company: "CNO Financial", eventTime: eventTime.toDate(), columns:{"FIELD1": "AGENT1", "FIELD2": "AGENT2", "NUM1":"100", "NUM2": "200"}};

                adminDataSvc.insertDynamicTable(model).then(function(result)
                {
                }).catch(function(err)
                {
                    console.error("There was an error Posting the Insert Request", err);
                })
            }


            //</editor-fold>

            // initialize the directive
            initialize();
        }
    }
  }]);

});


