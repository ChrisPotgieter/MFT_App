/*
 /// <summary>
 /// app.modules.iib_v2.controllers - parameterIIBAppFlowNodeEditDialogCtrl
 /// Dialog Controller to Manage Edit of IIB Application Flow Node Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2021
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('parameterIIBAppFlowNodeEditDialogCtrl', ['$uibModalInstance', 'adminDataSvc', 'uiSvc', 'dialogData', function ($uibModalInstance, adminDataSvc, uiSvc, dialogData)
    {
        var _this = this;

        // initialize the dialog
        _this.dialogData = dialogData;
        _this.stateInfo = {};
        _this.stateInfo.elementId = 'frmIIBNodeConfigEdit';
        _this.stateInfo.fields =   {
            fields: {
                code: {
                    group:"#div_code",
                    excluded: false,
                    validators: {
                        notEmpty: {
                            message: 'Node Identifier Required'
                        },
                        callback: {
                            message: 'Node Identifier already exists',
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
            if (record.audit)
            {
                record.payload_mandatory = false;
                record.payload = false;
            }
            if (record.payload_mandatory)
                record.payload = true;
            record.code = record.code.toUpperCase();
            return record;
        };
        adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance,"Node Definition");


    }]);
});
