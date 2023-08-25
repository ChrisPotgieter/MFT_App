/*
 /// <summary>
 /// app.modules.iib_v2.controllers - parameterIIBJobEditDialog
 /// Dialog Controller to Manage Edit of IIB Job Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2021
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('parameterIIBJobEditDialogCtrl', ['$uibModalInstance', 'adminDataSvc', 'uiSvc', 'iibv2DataSvc', 'dialogData', function ($uibModalInstance, adminDataSvc, uiSvc, iibv2DataSvc, dialogData)
    {
        var _this = this;

        // initialize the dialog
        _this.dialogData = dialogData;
        _this.stateInfo = {};
        _this.stateInfo.elementId = 'frmIIBJobConfigEdit';
        _this.stateInfo.fields =   {
            fields: {
            code: {
                group:"#div_code",
                excluded: false,
                validators: {
                    notEmpty: {
                        message: 'Code is Required'
                    },
                    regexp:
                        {
                            regexp: "^[a-zA-Z0-9_.]{1,100}$",
                            message: "Code must contain no spaces or special characters and must be a minimum of 1 and maximum of 100"

                        },
                    callback: {
                        message: 'Code already exists',
                        callback: function (value, validator, $field) {
                            var found = lodash.find(dialogData.rows, function (record)
                            {
                                return (record.code.toUpperCase() === value.toUpperCase() && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId);
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
                        message: "An Application Requires at Least One Meta-Data Definition",
                        callback: function (value, validator, $field)
                        {
                            var valid = (_this.dataModel.jsonData.metadata.length) > 0;
                            return valid;
                        }
                    }
                }
            }
        }
        };
       adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, iibv2DataSvc.getTitle() + " Job");

    }]);
});
