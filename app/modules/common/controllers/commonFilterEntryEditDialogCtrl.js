/*
 /// <summary>
 /// app.modules.common.controllers - commonFilterEntryEditDialogCtrl
 /// Common Dialog Controller to Manage Edit of Filter Entry
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('commonFilterEntryEditDialogCtrl', ['$uibModalInstance', '$scope', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $timeout, uiSvc, dialogData)
    {
        const _this = this;
        _this.model = {mainTitle: dialogData.title, title: "Add "  + dialogData.title, icon: dialogData.icon, buttonText:"Create", rows: dialogData.rows, keyOptions: dialogData.keyOptions};
        _this.functions = {};
        _this.dataModel = dialogData.row;
        _this.modalResult = null;


        //<editor-fold desc="Functions">
        _this.functions.initialize = function()
        {
            // routine invoked on the render to initialize the form
            const innerForm = $(document.getElementById('frmFilterEntryEdit'));
            const fields = {
                fields: {
                    hidden_name: {
                        excluded: false,
                        group: "#div_name",
                        validators: {
                            callback: {
                                message: 'Field Condition already exists',
                                callback: function (value, validator, $field) {
                                    const response = _this.functions.validateCombo(_this.dataModel.name, "Field Must be Selected");
                                    if (!response.valid)
                                        return response;

                                    const found = lodash.find(_this.model.rows, function (record) {
                                        return (record.name === _this.dataModel.name && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    input_values: {
                        excluded: false,
                        group: "#div_values",
                        validators: {
                            callback: {
                                message: 'Values must be specified',
                                callback: function (value, validator, $field) {
                                    if (_this.dataModel.values == null || _this.dataModel.values.length == 0)
                                        return false;
                                    const blankValue = lodash.find(_this.dataModel.values, function (value) {
                                        return value == '';
                                    });
                                    if (blankValue)
                                        return false;
                                    return true;
                                }
                            }
                        }
                    }
                }
            };
            const formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            const fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');

            // update the data
            _this.functions.onChangeRecord();


            // watch the data
            $scope.$watchCollection("vmDialog.dataModel.key", function (newValue)
            {
                if (!newValue)
                    return;
                if (newValue.length <= 1)
                {
                    _this.dataModel.name = (newValue.length == 0) ? null : newValue[0];
                    _this.form.revalidateField("hidden_name");
                }
                _this.dataModel.key = _this.dataModel.name != null ?  [_this.dataModel.name] : null;
            });


            // revalidate the form as required
            if (_this.dataModel.recordStatus == uiSvc.editModes.UPDATE)
            {
                _this.model.title = "Edit " + dialogData.title;
                _this.model.buttonText = "Save";

                // validate the form on edit
                $timeout(function () {
                    _this.form.validate();
                }, 500);
            }
        };
        _this.functions.validateCombo = function(modelValue, message)
        {
            // routine to validate the ui- select combo and return the result to bv
            const returnObj = {message: message, valid: true};
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
            _this.dataModel.key = _this.dataModel.name != null ?  [_this.dataModel.name] : null;
            _this.dataModel.operator = parseInt(_this.dataModel.operator).toString();
            _this.form.resetForm();
        };


        _this.functions.onComboChange = function(fieldName)
        {
            // routine to revalidate the field when a combo Changes
            _this.form.revalidateField(fieldName);

        };


        _this.functions.userDelete = function()
        {
            // routine to confirm deletion of of the row
            const html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.key + "</span> ?";
            uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this " + _this.model.mainTitle + "  ? ", '[No][Yes]', _this.functions.confirmDelete)

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
            const valid = _this.form.isValid();
            if (!valid)
                return;
            _this.dataModel.operator = parseInt(_this.dataModel.operator);

            // close the window
            $uibModalInstance.close(_this.dataModel);
        };

        _this.functions.cancelRecord = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>

        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered
            _this.functions.initialize();

        });

    }]);
});
