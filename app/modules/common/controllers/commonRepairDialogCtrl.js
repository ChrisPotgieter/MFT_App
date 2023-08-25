/*
 /// <summary>
 /// app.modules.common.controllers - commonRepairDialogCtrl
 /// Generic Controller to Manage Transaction Repair Initiation
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/05/2021
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('commonRepairDialogCtrl', ['$scope', '$uibModalInstance', '$timeout', 'adminDataSvc', 'uiSvc', 'dialogData', function ($scope, $uibModalInstance, $timeout, adminDataSvc, uiSvc, dialogData)
    {
        const _this = this;

        // add the base model
        _this.model = {title: dialogData.title, icon: dialogData.icon, data: dialogData.data, cm: dialogData.cm, headers: dialogData.headers, destination: dialogData.destination, headerGrid:{}};
        _this.model.flags = {submitted: false};
        _this.model.buttons = [];
        _this.functions = {};


        // initialize this for CLI
        adminDataSvc.initializeCLI(_this, dialogData, $uibModalInstance);
        _this.initialize();
        _this.progressInfo.inProgress = false;


        //<editor-fold desc="Functions">
        _this.functions.initialize = function()
        {
            // initialize code mirror when the screen first loads
            $timeout(function () {
                _this.functions.setupCM(_this.model.cm, false);
            }, 200);
            _this.functions.initializeHeaderView();

        }
        _this.functions.initializeHeaderView = function()
        {
            // routine to initialize the header view
            _this.model.headerGrid = {data:[], options: {}};
            _this.model.headerGrid.options = {editView: true, title:"Resubmission Header"};
            if (!dialogData.headers)
                return;
            lodash.forOwn(dialogData.headers, function(value, key)
            {
               _this.model.headerGrid.data.push({category: "Repair Header", key: key, value: value});
            });
        };
        _this.functions.setupCM = function(editor, performFold)
        {
            // routine to adjust the code mirror on display of tabs
            editor.setCursor({line: 0, ch: 0});
            if (performFold)
                editor.foldCode(CodeMirror.Pos(3, 0));
        };

        _this.functions.switchTab = function(tabid)
        {
            // invoke a redraw of the submission tab
            if (tabid == 'submission')
            {
                if (_this.model.cm && _this.model.cm.setCursor)
                {
                    $timeout(function () {
                        _this.functions.setupCM(_this.model.cm, false);
                    }, 200);
                }
            }
        };

        _this.functions.confirmDialog = function()
        {
            // create the cli Request
            let response = {content: null, headers: {}};
            if (_this.model.cm && _this.model.cm.getContent != null)
                response.content = _this.model.cm.getContent();
            if (_this.model.headerGrid.data)
            {
                response.headers = {};
                lodash.forEach(_this.model.headerGrid.data, function(row)
                {
                    response.headers[row.key] = row.value;
                });

            }
            if (dialogData.functions.confirmFunction)
            {
                dialogData.functions.confirmFunction(response).then(function(result)
                {
                    _this.model.flags.submitted = true;
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
                    uiSvc.showError("Transaction Repair Initiation", "Failed " + err);
                });
            }
        };
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});
