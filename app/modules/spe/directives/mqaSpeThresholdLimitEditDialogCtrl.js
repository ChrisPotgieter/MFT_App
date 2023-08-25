/*
 /// <summary>
 /// app.modules.spe.directives - mqaSpeThresholdLimitEditDialogCtrl
 /// SPE Controller to Manage Edit of SPE Threshold Limits
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2019
 /// </summary>
 */

define(['modules/spe/module', 'lodash','bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('mqaSpeThresholdLimitEditDialogCtrl', ['$uibModalInstance', '$scope', '$log', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $log, $timeout, uiSvc,dialogData)
    {
        var _this = this;

        _this.model = {title: "Add Threshold", buttonText:"Create", rows: dialogData.rows};
        _this.dataModel = dialogData.row;
        _this.modalResult = null;

        // setup bootstrap validator
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered
            var innerForm = $(document.getElementById('frmThresholdEdit'));
            var fields = {
                fields: {
                    key: {
                        excluded: false,
                        group:"#div_key",
                        validators: {
                            callback: {
                                message: 'Threshold already exists',
                                callback: function (value, validator, $field) {
                                    var response = _this.functions.validateCombo(_this.dataModel.key, "Threshold Must be Selected");
                                    if (!response.valid)
                                        return response;

                                    var found = lodash.find(_this.model.rows, function (record)
                                    {
                                        return (record.key === _this.dataModel.key && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    action: {
                        excluded: false,
                        group: "#div_action",
                        validators: {
                            callback: {
                                callback: function (value, validator, $field) {
                                    return _this.functions.validateCombo(_this.dataModel.action, "Action Must be Selected");
                                }
                            }

                        }
                    },
                    limit: {
                        excluded: false,
                        group:"#div_limit",
                        validators: {
                            notEmpty: {
                                message: "Limit is Required"
                            },
                            integer: {
                                message: 'Limit must be numeric'
                            },
                            callback: {
                                message: 'Limit must be between 1 and 100',
                                callback: function (value, validator, $field) {
                                    if (_this.dataModel.limitType == 1)
                                    {
                                        // percentage the value must be between 1 and 100
                                        if (value < 0 || value > 100)
                                            return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    }
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            var fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');

            // update the data
            _this.functions.onChangeRecord();

            // revalidate the form as required
            if (_this.dataModel.recordStatus == uiSvc.editModes.UPDATE)
            {
                _this.model.title = "Edit Threshold";
                _this.model.buttonText = "Save";

                // validate the form on edit
                $timeout(function () {
                    _this.form.validate();
                }, 500);
            }

        });


        // create the functions
        _this.functions = {};

        _this.functions.validateCombo = function(modelValue, message)
        {
            // routine to validate the ui- select combo and return the result to bv
            var returnObj = {message: message, valid: true};
            if (modelValue)
            {
                returnObj.valid = (modelValue !== "");
            }
            else
                returnObj.valid = false;
            return returnObj;
        };

        _this.functions.onChangeRecord = function()
        {
            // routine to change the record when the id changes
            _this.form.resetForm();
            _this.functions.onAppToggle(_this.dataModel.applicable);
            _this.functions.onPercToggle(_this.dataModel.limitType == 1);
        };


        _this.functions.onComboChange = function(fieldName)
        {
            // routine to revalidate the field when a combo Changes
            _this.form.revalidateField(fieldName);

        };

        _this.functions.onPercToggle = function(percOn)
        {
            // routine to update the limit type when the flag is switched
            _this.model.perc = percOn;
            _this.dataModel.limitType = percOn ? 1 : 0;
            _this.form.revalidateField('limit');

        };

        _this.functions.onAppToggle = function(applicable)
        {
            // routine to handle the switch for applying this threshold or not
            if (!applicable)
            {
                // disable the fields and clear the json
                _this.dataModel = {applicable: applicable, key: _this.dataModel.key};
            }
            else
            {
                _this.dataModel.applicable = applicable;
            }

            // update the field validators
            _this.form.enableFieldValidators("action", applicable);
            _this.form.enableFieldValidators("limit", applicable);

            if (!applicable)
            {
                _this.form.resetField("action");
                _this.form.resetField("limit");
            }
        };

        _this.functions.userDelete = function()
        {
            // routine to confirm deletion of of the row
            var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.key + "</span> ?";
            uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Threshold ? ", '[No][Yes]', _this.functions.confirmDelete)

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
