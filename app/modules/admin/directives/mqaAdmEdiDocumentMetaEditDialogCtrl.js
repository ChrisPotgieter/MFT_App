/*
 /// <summary>
 /// app.modules.admin.directives - mqaAdmEdiDocumentMetaEditDialogCtrl
 /// Admin Controller to Manage Editing of Meta-Data Defintions in an EDI Document Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/05/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('mqaAdmEdiDocumentMetaEditDialogCtrl', ['$uibModalInstance', '$scope', '$log', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $log, $timeout, uiSvc, dialogData)
    {
       var _this = this;

       _this.model = {title: "Meta-Data Definition", buttonText:"Create"};
       _this.dataModel = dialogData.row;
       if (_this.dataModel.filter && _this.dataModel.filter.filterType != null)
           _this.dataModel.filter.filterType = _this.dataModel.filter.filterType.toString();
       _this.dataModel.filter.allowDrill = false;
       if (_this.dataModel.filter && _this.dataModel.filter.show)
           _this.dataModel.filter.allowDrill = parseInt(_this.dataModel.filter.show) > 0;

       _this.modalResult = null;

       // setup bootstrap validator
        var innerForm = null;
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered

            innerForm = $(document.getElementById('frmEdiDocumentMetaDataEdit'));
            var fields = {
                fields: {
                    name: {
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: "Field Name Mapping is Required"
                            },
                            callback: {
                                message: 'Field Name  Already Exists',
                                callback: function (value, validator, $field) {
                                    var found = lodash.find(dialogData.baseColumns, function (record)
                                    {
                                        return (record.name === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    caption: {
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: 'Caption is Required'
                            }
                        }
                    }
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            var fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');



            if (_this.dataModel.recordStatus == uiSvc.editModes.UPDATE)
            {
                _this.model.buttonText = "Save";

                // validate the form on edit
                $timeout(function () {
                    _this.form.validate();
                }, 500);
            }

        });


        // create a watch on the filter show to change the view
        $scope.$watch("vmDialog.dataModel.filter.show", function(newValue, oldValue)
        {

            _this.dataModel.filter.allowDrill = parseInt(newValue) > 0;
        }, true);


        // create the functions
       _this.functions = {};


       _this.functions.userDelete = function()
       {
           // routine to confirm deletion of of the row
           var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.description + "</span> ?";
           uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Meta-Data Definition ? ", '[No][Yes]', _this.functions.confirmDelete)

       };

       _this.functions.confirmDelete = function (ButtonPressed) {
            // routine to handle the delete request from the user
            if (ButtonPressed == "Yes")
            {
                _this.dataModel.recordStatus = uiSvc.editModes.DELETE;
                $uibModalInstance.close(_this.dataModel);
            }
        };
        _this.functions.saveRecord = function()
        {

            // routine to save the entry
            _this.form.validate();
            var valid = _this.form.isValid();
            if (!valid)
                return;


            // close the window
            $uibModalInstance.close(_this.dataModel);
        };

        _this.functions.cancelRecord = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
    }]);
});
