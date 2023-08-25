/*
 /// <summary>
 /// app.modules.admin.directives - mqaAdmDynTableColumnEditDialogCtrl
 /// Admin Controller to Manage Editing of Column Definitions when Create a Dynamic Table Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/04/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash','bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('mqaAdmDynTableColumnEditDialogCtrl', ['$uibModalInstance', '$scope', '$log', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $log, $timeout, uiSvc, dialogData)
    {
       var _this = this;

       _this.model = {title: "Create Column", buttonText:"Create"};
       _this.dataModel = dialogData.row;
       if (_this.dataModel.aggregate != null)
           _this.dataModel.aggregate = _this.dataModel.aggregate.toString();
       _this.modalResult = null;                var model = {};
        model.items = angular.copy($scope.record.jsonData.metaIndexes);
        model.item = angular.copy(editRecord);


        // setup bootstrap validator
        var innerForm = null;
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered

            innerForm = $(document.getElementById('frmDynTableColumnEdit'));
            var fields = {
                fields: {
                    source: {
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: "Source Mapping is Required"
                            },
                            regexp: {
                                    regexp:"^[a-zA-Z0-9_]{1,}$",
                                    message:"Source must contain no spaces or special characters and must be a minimum of 1"
                                },
                            callback: {
                                message: 'Source Mapping already exists',
                                callback: function (value, validator, $field) {
                                    var found = lodash.find(dialogData.baseColumns, function (record)
                                    {
                                        return (record.source === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    destination: {
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: "Destination Mapping is Required"
                            },
                            regexp: {
                                regexp:"^[a-zA-Z0-9_]{1,}$",
                                message:"Source must contain no spaces or special characters and must be a minimum of 1"
                            },

                            callback: {
                                message: 'Destination Mapping already exists',
                                callback: function (value, validator, $field) {
                                    var found = lodash.find(dialogData.baseColumns, function (record)
                                    {
                                        return (record.destination === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
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
                    },
                    input_width:
                        {
                            feedbackIcons: false,
                            groupId:"#div_width",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Width cannot be Empty'
                                },
                                integer: {
                                    message: 'Width must be numeric'
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


        // create the functions
       _this.functions = {};

       _this.functions.userDelete = function()
       {
           // routine to confirm deletion of of the row
           var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.description + "</span> ?";
           uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Column ? ", '[No][Yes]', _this.functions.confirmDelete)

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
