/*
 /// <summary>
 /// app.modules.common.controllers - commonMetaEntryEditDialogCtrl
 /// Common Dialog Controller to Manage Edit of Meta-Data Entry
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/05/2021
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('commonMetaEntryEditDialogCtrl', ['$uibModalInstance', '$scope', '$timeout','uiSvc', 'dialogData', function ($uibModalInstance, $scope, $timeout, uiSvc, dialogData)
    {
        const _this = this;

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.onRender = function()
        {
            // setup bootstrap validator when the form is rendered
            const innerForm = $(document.getElementById('frmMetaEntryEdit'));
            const fields = {
                fields: {
                    code: {
                        group: "#div_key",
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: 'Key is Required'
                            },
                            regexp: {
                                regexp: "[a-zA-Z0-9_]{1,20}$",
                                message: "Key must contain no spaces or special characters and must be a minimum of 1 and maximum of 20"
                            },
                            callback: {
                                message: 'Key already exists',
                                callback: function (value, validator, $field) {
                                    if (!_this.model.flags.allowKey)
                                        return true;
                                    const found = lodash.find(dialogData.rows, function (record) {
                                        return (record.code === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
                                    });
                                    if (found)
                                        return false;
                                    return true;
                                }
                            }
                        }
                    },
                    description: {
                        group: "#div_value",
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: 'Value is Required'
                            }
                        }
                    }
                }
            };
            const formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            const fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');


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

        }
        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            _this.model = {mainTitle: dialogData.title, title: "Add "  + dialogData.title, icon: dialogData.icon, buttonText:"Create", rows: dialogData.rows, flags: {allowKey: true}};
            _this.dataModel = dialogData.row;

            // set up the render function
            $uibModalInstance.rendered.then(function()
            {
                _this.functions.onRender();
            });



            // determine if the key needs to be disabled
            if (_this.dataModel.key != undefined && _this.dataModel.recordStatus == uiSvc.editModes.INSERT)
                _this.model.flags.allowKey  = false;
           _this.modalResult = null;
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

            // close the window
            $uibModalInstance.close(_this.dataModel);
        };

        _this.functions.cancelRecord = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };


        _this.functions.initialize();
        //</editor-fold>
    }]);
});
