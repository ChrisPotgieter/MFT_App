/*
 /// <summary>
 /// app.modules.iib_v2.controllers - parameterIIBAppFlowEditDialogCtrl
 /// Dialog Controller to Manage Edit of IIB Application Flow Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2021
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('parameterIIBAppFlowEditDialogCtrl', ['$uibModalInstance', 'adminDataSvc', 'uiSvc', 'dialogData', function ($uibModalInstance, adminDataSvc, uiSvc, dialogData)
    {
        var _this = this;

        // initialize the dialog
        _this.dialogData = dialogData;
        _this.stateInfo = {};
        _this.stateInfo.elementId = 'frmIIBAppFlowConfigEdit';
        _this.stateInfo.fields =   {
            fields: {
                code: {
                    group:"#div_code",
                    excluded: false,
                    validators: {
                        notEmpty: {
                            message: 'Flow Identifier Required'
                        },
                        regexp:
                            {
                                regexp: "^[a-zA-Z0-9_.]{1,100}$",
                                message: "Flow Identifier must contain no spaces or special characters and must be a minimum of 1 and maximum of 100"

                            },
                        callback: {
                            message: 'Flow Identifier already exists',
                            callback: function (value, validator, $field) {
                                var found = lodash.find(dialogData.rows, function (record)
                                {
                                    return (record.code === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
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
                            callback: function (value, validator, $field)
                            {
                                var valid = true;
                                return valid;
                            }
                        }
                    }
                }
            }
        };

        // initialize the record save to update to upper case
        _this.functions = {};
        _this.functions.onSaveRecord = function(record)
        {
            record.code = record.code.toUpperCase();
            return record;
        };

        adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance,"Flow Definition");
    }]);
});
