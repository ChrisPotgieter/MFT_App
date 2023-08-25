/*
 /// <summary>
 /// app.modules.admin.controllers - parameterThresholdEntryEditDialogCtrl
 /// Common Parameter Dialog Controller to Manage Edit of a Threshold Metric
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07/09/2022
 /// </summary>
 */

define(['modules/admin/module', 'lodash',], function (module, lodash) {

    "use strict";
    module.registerController('parameterThresholdEntryEditDialogCtrl', ['$uibModalInstance', '$scope', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $timeout, uiSvc, dialogData)
    {
        var _this = this;

        _this.model = {mainTitle: dialogData.title, title: "Add "  + dialogData.title + " Threshold", icon: dialogData.icon, buttonText:"Create"};
        _this.functions = {};

        _this.modalResult = null;

        // setup bootstrap validator
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered
            var innerForm = $(document.getElementById('frmThresholdEntryEdit'));
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.model.fields);
            var fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');

            // revalidate the form as required
            if (_this.dataModel.recordStatus == uiSvc.editModes.UPDATE)
            {
                _this.model.title = "Edit " + dialogData.title + "Threshold";
                _this.model.buttonText = "Save";

                // validate the form on edit
                $timeout(function () {
                    _this.form.validate();
                }, 500);
            }

        });

        //<editor-fold desc="Functions">
        _this.functions.readRecord = function()
        {
            // routine to see if a record has been provided or if not create it
            _this.dataModel = {};
            let code = dialogData.options.code;
            let type = dialogData.options.type;

            // try and find the record
            _this.dataModel = lodash.find(dialogData.rows, {code: code, type: type});
            if (!_this.dataModel)
                _this.dataModel = {code: code, type: type, next_check: null, exceeded: false, value: 0, recordStatus: uiSvc.editModes.INSERT};
            else
                _this.dataModel.recordStatus = uiSvc.editModes.UPDATE;

            _this.functions.updateStatus();
        };

        _this.functions.updateStatus = function()
        {
            // routine to update the status object based on the dataModel
            if (_this.dataModel.recordStatus == uiSvc.editModes.INSERT)
                return;
            _this.model.status = {};
            if (_this.dataModel.exceeded)
            {
                _this.model.status.class = "alert-danger";
                _this.model.status.icon = "times";
                _this.model.status.caption = "Threshold Has Been Exceeded";
                _this.model.status.message = "The Defined Threshold has been Exceeded and currently is defined at " + _this.dataModel.current_value;
            }
            else
            {
                _this.model.status.class = "alert-success";
                _this.model.status.icon = "check";
                _this.model.status.caption = "Threshold is within Limits";
                _this.model.status.message = "The Defined Threshold is operating within acceptable limits " + _this.dataModel.current_value;
            }
            if (_this.dataModel.last_check != null)
                _this.model.status.last_check_date =  uiSvc.formatDate(_this.dataModel.last_check);
            if (_this.dataModel.next_check != null)
                _this.model.status.next_check_date =  uiSvc.formatDate(_this.dataModel.next_check);
        }
        _this.functions.initializeFields = function()
        {
            // routine to initialize the caption and range values
            _this.model.fields = {
                fields: {
                    hidden_record: {
                        excluded: false,
                        group:"#div_code",
                        validators: {
                            callback: {
                                message: 'Threshold already exists',
                                callback: function (value, validator, $field) {
                                    var response = _this.functions.validateCombo(_this.dataModel.name, "Field Must be Selected");
                                    if (!response.valid)
                                        return response;

                                    var found = lodash.find(dialogData.rows, function (record)
                                    {
                                        return (record.code === _this.dataModel.code && record.type == _this.dataModel.type && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    input_value: {
                        excluded: false,
                        group:"#div_value",
                        validators: {
                        }
                    }
                }
            };

            // update the value field based on the options
            if (dialogData.options.perc)
            {
                dialogData.options.min = 1;
                dialogData.options.max = 100;
            }
            if (dialogData.options.min != null && dialogData.options.max != null)
                _this.model.fields.fields.input_value.validators.between = {min: dialogData.options.min, max: dialogData.options.max}
            _this.model.caption = "Please enter a threshold value";
            if (dialogData.options.caption)
                _this.model.caption =  dialogData.options.caption;
        };

        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            _this.functions.readRecord();
            _this.functions.initializeFields();
        };


        _this.functions.userDelete = function()
        {
            // routine to confirm deletion of of the row
            var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + _this.dataModel.code + "</span> ?";
            uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this " + _this.model.mainTitle + "  Threshold ? ", '[No][Yes]', _this.functions.confirmDelete)
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
            _this.form.revalidateField("hidden_record");
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
        //</editor-fold>

        _this.functions.initialize();

    }]);
});
