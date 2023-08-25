/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfEmpCodeEditDialogCtrl.js
 /// Dialog Controller to manage Employee Code to SSN Mapping
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:23/03/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash', 'bootstrap-validator'], function (module, lodash)
{
    'use strict';

    module.registerController('aegfEmpCodeEditDialogCtrl', ['$scope', '$uibModalInstance', 'uiSvc', 'adminDataSvc', 'dialogData', function ($scope, $uibModalInstance, uiSvc, adminDataSvc, dialogData)
	{
        let _this = this;
        _this.functions = {};
        _this.model = {};
        _this.dialogData = dialogData;

        //<editor-fold desc="Initialization and Dialog Control">
        _this.functions.init = function ()
		{
			// routine to initialize the screen
            _this.stateInfo = {};
            _this.stateInfo.elementId = 'frmEdit';

            _this.stateInfo.fields = {
                fields: {
                    emp_code: {
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: 'Code is Required'
                            },
                            regexp: {
                                regexp: '^[a-zA-Z0-9_]{3,}$',
                                message: 'Code must contain no spaces or special characters and must be a minimum of 3'
                            },
                            callback: {
                                message: 'Code already exists',
                                callback: function (value, validator, $field) {

                                    let found = lodash.find(dialogData.rows, function (record) {
                                        let matches = record.jsonData.emp_code != null && record.jsonData.emp_code.toUpperCase() === value.toUpperCase() && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != _this.dataModel.rowId;
                                        return matches;
                                    });
                                    if (found) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    hiddenValidation: {
                        excluded: true
                    }
                }
            };
            adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, "SSN To Employee Map");

            _this.model.isActive = _this.dataModel.jsonData.status == 1;

            if (_this.dataModel.jsonData.sub_group)
            {
                _this.model.sub_group = _this.dataModel.jsonData.sub_group;
                let sub_record = lodash.find(_this.dataModel.subGroupDropDown, {code: _this.model.sub_group.toString()});
                if (sub_record != null)
                    _this.model.sub_group = sub_record.description;
            }
        };

        _this.functions.cancelDialog = function()
        {
            // close the window
            _this.functions.cancelRecord();
        };
        _this.functions.confirmDialog = function()
        {
            _this.functions.saveRecord();
        };
        //</editor-fold>

        //<editor-fold desc="Admin Framework Overrides">
        //save record
        _this.functions.onSaveRecord = function (record)
		{
            record.code = _this.dataModel.code;
            return record;
        };
        //</editor-fold>


        // initialize the screen
        _this.functions.init();
    }
    ]);
});
