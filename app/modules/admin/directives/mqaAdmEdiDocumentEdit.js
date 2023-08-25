/*
 /// <summary>
 /// modules.admin.directives - mqaAdmEdiDocumentEdit.js
 /// Administration Module Directive to Control EDI Document Configuration Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/05/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash', 'moment'], function(module, lodash,  moment) {
  "use strict";
  moment().format();


  module.registerDirective('mqaAdmEdiDocumentEdit', ['$timeout', '$uibModal', 'uiSvc', 'adminDataSvc', 'cacheDataSvc', function($timeout, $uibModal, uiSvc, adminDataSvc, cacheDataSvc)
  {

    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmEdiDocumentEdit.tpl.html",
        replace: true,
        controllerAs:'vm',
        controller: function($element, $scope)
        {
            var _this = this;
            _this.functions = {};
            _this.model = {metaGrid:{}, flags:{gridRefresh: {value: 0}}};
            _this.forms = {};


            var editFormSetup = function ()
            {
                var innerForm = $($($element).find("#frmEdiDocumentEdit")[0]);
                // routine to setup the queue editor form
                var fields = {
                    fields: {
                        code: {
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Document Code is Required'
                                },
                                regexp: {
                                    regexp:"^[a-zA-Z0-9_-]{3,}$",
                                    message:"Document Code must contain no spaces or special characters and must be a minimum of 3"
                                },

                                callback: {
                                    message: 'Document Code already exists',
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
                        hiddenValidation: {
                            excluded: false,
                            validators: {
                                callback: {
                                    message: 'An EDI Document Configuration requires at least one Meta-Data Definition',
                                    callback: function (value, validator, $field)
                                    {
                                        var valid = ($scope.editRow.jsonData.data.length) > 0;
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

                // set the column data grid options
                assignIds();
                _this.model.metaGrid.dataOptions = {
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
                                            name: {type: "string"},
                                            caption: {type: "string"},
                                            filterable: {type: "boolean"},
                                            filterType: {type: "number"}
                                        }
                                }
                        },
                    columns: [
                        {field: "rowId", type: "string", tooltip: false,hidden: true},
                        {field: "name", title: "Field Name", type: "string", tooltip: false},
                        {
                            field:"caption",
                            type:"string", tooltip: true,  title:"Caption",
                            template: function(dataItem)
                            {
                                var entry = lodash.find($scope.editRow.jsonData.data, {rowId: dataItem.rowId});
                                if (entry != null && entry.filter)
                                    return entry.filter.caption;
                                return "";
                            },
                        },
                        {
                            field: "filterable",
                            title: "Filterable",
                            width:"140px",
                            template: function(dataItem)
                            {
                                var entry = lodash.find($scope.editRow.jsonData.data, {rowId: dataItem.rowId});
                                if (entry != null && entry.filter && (entry.filter.show == 1))
                                    return "<i class='fa fa-check'/>";
                                return "";
                            }
                        },
                        {
                            field:"filterType",
                            title:"Filter Type",
                            template: function(dataItem)
                            {

                                var entry = lodash.find($scope.editRow.jsonData.data, {rowId: dataItem.rowId});
                                if (entry != null && entry.filter && (entry.filter.show == 1))
                                {
                                    var value = entry.filter.filterType.toString();
                                    switch (value)
                                    {
                                        case "0":
                                            return "Equals";
                                        case "1":
                                            return "Starts With";
                                        case "2":
                                            return "Ends With";
                                        case "3":
                                            return "Contains";
                                        case "4":
                                            return "Not Equal";
                                        case "5":
                                            return "Not Starts With";
                                        case "6":
                                            return "Not Ends With";
                                        case "7":
                                            return "Not Contains";
                                        case "8":
                                            return "Equals Case-Insensitive";
                                        default:
                                            return "None"
                                    }
                                }
                                else
                                    return "Not Applicable";

                            }
                        }

                    ]
                };
            };

            var assignIds = function ()
            {
                lodash.forEach($scope.editRow.jsonData.data, function(item, index)
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
                uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this EDI Document Configuration ? ", '[No][Yes]', confirmDelete)
            };

            _this.functions.metaDataDialog = function(record)
            {
                // routine to bring up the dialog for meta data entry
                var dialogData = {};
                dialogData.row = angular.copy(record);
                dialogData.baseColumns = $scope.editRow.jsonData.data;
                var modalInstance = $uibModal.open({
                    animation: true,
                    backdrop: 'static',
                    templateUrl: 'app/modules/admin/directives/mqaAdmEdiDocumentMetaEditDialog.tpl.html',
                    controller: 'mqaAdmEdiDocumentMetaEditDialogCtrl',
                    controllerAs: 'vmDialog',
                    resolve:
                        {
                            dialogData: dialogData
                        }
                });
                modalInstance.result.then(function (result)
                {
                    // update the criteria object
                    var dbType = 0;
                    var record = cacheDataSvc.getParameter("GWIDStorage");
                    if (record.length > 0)
                    {
                        var value = parseInt(record[0].value);
                        if (value == 1)
                            dbType = 3;     // mongodb
                    }
                    result.criteria = [];
                    result.criteria.push({fieldName: result.name, type: dbType});

                    // now update the main object
                    var type = result.recordStatus;
                    if (type == uiSvc.editModes.INSERT)
                    {
                        // insert the column
                        result.rowId = $scope.editRow.jsonData.data.length + 1;
                        $scope.editRow.jsonData.data.push(result);
                    }
                    if (type == uiSvc.editModes.DELETE)
                    {
                        // remove the column
                        var entry = {rowId:result.rowId};
                        lodash.remove($scope.editRow.jsonData.data, entry);
                    }
                    if (type == uiSvc.editModes.UPDATE)
                    {
                        // update the record
                        var recordIndex = lodash.findIndex($scope.editRow.jsonData.data, {rowId: result.rowId});
                        if (recordIndex >= -1)
                            $scope.editRow.jsonData.data.splice(recordIndex, 1,result);
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

            _this.functions.onEditMetaData = function(record)
            {
                // routine to bring up the meta-data editor form to allow the user to edit the meta-data entry they have selected
                record.recordStatus = uiSvc.editModes.UPDATE;
                _this.functions.metaDataDialog(record);
            };

            _this.functions.onNewMetaData = function()
            {
                var record = {filter: {show: false, caption: "", filterType:"99"}, criteria:[], name:"", rowId: $scope.editRow.jsonData.data.length + 1, recordStatus: uiSvc.editModes.INSERT }
                _this.functions.metaDataDialog(record);
            };


            //</editor-fold>

            // initialize the directive
            initialize();
        }
    }
  }]);

});


