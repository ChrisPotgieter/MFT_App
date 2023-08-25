/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibBulkExportDialogCtrl
 /// Controller to Manage Bulk Export/Resubmit of Payloads in the IIB Module
 /// The caller will be responsible for providing the view
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/05/2021
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function (module, lodash)
{

    "use strict";

    module.registerController('iibBulkExportDialogCtrl', ['$scope', '$uibModalInstance', '$timeout', 'adminDataSvc', 'uiSvc', 'dialogData', function ($scope, $uibModalInstance, $timeout, adminDataSvc, uiSvc, dialogData)
    {
        var _this = this;

        // add the base model
        _this.model = {title: dialogData.title, icon: dialogData.icon, data: dialogData.data};
        _this.model.data.resubmitType = '1';
        _this.model.buttons = [];

        // initialize this for CLI
        adminDataSvc.initializeCLI(_this, dialogData, $uibModalInstance);
        _this.initialize();
        _this.progressInfo.inProgress = false;

        // setup bootstrap validator
        $uibModalInstance.rendered.then(function()
        {
            // setup bootstrap validator when the form is rendered
            var innerForm = $(document.getElementById('frmBulkExport'));
            var fields = {
                fields: {
                    destination: {
                        group:"#div_destination",
                        excluded: false,
                        validators: {
                            notEmpty: {
                                message: 'Destination is Required'
                            },
                        }
                    },
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            var fv = innerForm.bootstrapValidator(formOptions);
            _this.form = innerForm.data('bootstrapValidator');
        });



        //<editor-fold desc="Functions">
        _this.functions = {};

        _this.functions.confirmDialog = function()
        {
            // routine to save the form
            _this.form.enableFieldValidators("destination", _this.model.data.resubmitType == '1');
            _this.form.validate();
            var valid = _this.form.isValid();
            if (!valid)
                return;
            dialogData.title = _this.model.data.resubmitType == '0' ? "Export Payloads" : "Re-Submit Payloads";

            // create the cli Request
            if (dialogData.functions.confirmFunction)
            {
                dialogData.functions.confirmFunction(_this.model).then(function(result)
                {
                    _this.progressInfo.description = "Processing...";
                    _this.progressInfo.perc = "1%";
                    _this.progressInfo.inProgress = true;
                    _this.progressInfo.showHeader = false;
                    _this.progressInfo.buttons = [];

                    // set the response and start the timer
                    if (dialogData.functions.responseFunction)
                        dialogData.functions.responseFunction(_this, result);
                    _this.startTimer();
                }).catch(function(err)
                {
                    uiSvc.showError(dialogData.title + "Failed " + err);
                });
            }
        };
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>


    }]);
});
