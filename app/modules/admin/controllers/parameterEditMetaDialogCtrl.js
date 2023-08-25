/*
 /// <summary>
 /// app.modules.admin.controllers - parameterEditMetaDialogCtrl
 /// Common Admin Controller to Manage Editing of Meta-Data Definitions in various configurations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/05/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('parameterEditMetaDialogCtrl', ['$uibModalInstance', '$scope', '$log', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $log, $timeout, uiSvc, dialogData)
    {
        var _this = this;
        _this.model = {title: "Add Meta-Data Definition", buttonText:"Create"};
        _this.dataModel = dialogData.row;
        if (_this.dataModel.filter && _this.dataModel.filter.filter_type != null)
            _this.dataModel.filter.filter_type = _this.dataModel.filter.filter_type.toString();
        _this.modalResult = null;

        // setup bootstrap validator
        var innerForm = null;
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered

            innerForm = $(document.getElementById('frmConfigMetaDataEdit'));
            var fields = {
                fields: {

                    name: {
                        excluded: false,
                        group: "#div_name",
                        validators: {
                            notEmpty: {
                                message: "Field Name Mapping is Required"
                            },
                            regexp: {
                                regexp:"^[a-zA-Z0-9_]{1,}$",
                                message:"Field Name must contain no spaces or special characters and must be a minimum of 1"
                            },

                            callback: {
                                message: 'Field Name  Already Exists',
                                callback: function (value, validator, $field) {
                                    var found = lodash.find(dialogData.rows, function (record) {
                                        return (record.name === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found)
                                    {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    width: {
                        excluded: false,
                        group: "#div_width",
                        validators: {
                            notEmpty: {
                                message: "Width is Required"
                            },
                            integer: {
                                message: 'Width must be numeric'
                            },
                            callback: {
                                message: 'Width must be between 1 and 1000',
                                callback: function (value, validator, $field) {
                                    // percentage the value must be between 1 and 100
                                    if (value < 0 || value > 1000)
                                        return false;
                                    return true;
                                }
                            }
                        }
                    },
                    caption: {
                        excluded: false,
                        group: "#div_caption",
                        validators: {
                            notEmpty: {
                                message: 'Caption is Required'
                            }
                        }
                    },
                    filter_type: {
                        excluded: false,
                        group: "#div_filter",
                        validators: {
                            callback: function (value, validator, $field) {
                                return _this.functions.validateCombo(_this.dataModel.filter.filter_type, "Filter Type Must be Selected");
                            }
                        }

                    }
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            var fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');

            _this.functions.onChangeRecord();

            if (_this.dataModel.recordStatus != uiSvc.editModes.INSERT)
            {
                _this.model.title = "Edit Meta-Data Definition";
                _this.model.buttonText = "Save";

                // validate the form on edit
                $timeout(function () {
                    _this.form.validate();
                }, 500);
            }

        });

        // create the functions
        _this.functions = {};
        _this.functions.onChangeRecord = function()
        {
            // routine to change the record when the id changes
            _this.form.resetForm();
            _this.functions.onDispToggle(_this.dataModel.filter.show);
        };

        _this.functions.onComboChange = function()
        {
            // routine to revalidate the field when a combo Changes
            _this.form.revalidateField("filter_type");

        };

        _this.functions.onDispToggle = function(dispOn)
        {
            // routine to update the limit type when the flag is switched
            _this.dataModel.filter.show = dispOn;
            if (dispOn)
            {
                if (!_this.dataModel.filter.filter_type)
                    _this.dataModel.filter.filter_type = "8";
            }
            _this.form.enableFieldValidators("filter_type", dispOn);
            if (!dispOn)
            {
                _this.form.resetField("filter_type");
            }

        };

        _this.functions.userDelete = function()
        {
            // routine to confirm deletion of of the row
            var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.name + "</span> ?";
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
            if (_this.dataModel.displayName == "")
                _this.dataModel.displayName = null;
            if (_this.dataModel.filter && _this.dataModel.filter.filter_type != null)
                _this.dataModel.filter.filter_type = parseInt(_this.dataModel.filter.filter_type);

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
