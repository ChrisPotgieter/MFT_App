/*
 /// <summary>
 /// app.modules.spe.controllers - itxTransactionGWIDListDialogCtrl.js
 /// Controller for ITX Transaction GWID List Dialog
 /// This replaces the V1 version speGwidReportingTransactionViewCtrl which was a non-dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/10/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('itxTransactionGWIDListDialogCtrl', ['$uibModalInstance', '$timeout', 'speDataSvc', 'dialogData', function ($uibModalInstance, $timeout, dataSvc, dialogData)
    {
        // initialize variables
        let _this = this;
        _this.model = {grid:[], filter: {}};


        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.init = function()
        {
            // get the filter that we will use based of the dialog data
            _this.model.filter.topCount = 5000;
            _this.model.filter.docType = dialogData.filter.document_type;
            _this.model.filter.status = dialogData.filter.status;
            _this.model.filter.transactionIds = [];
            _this.model.filter.transactionIds.push(dialogData.filter.transaction_id);


            // work out the title and icon
            _this.model.icon = "fa fa-files-o";
            _this.model.title = "EDI Documents for Transaction " + dialogData.filter.transaction_id;
            if (_this.model.filter.status > 0)
                _this.model.title += _this.model.filter.status == 90 ? " - Failed" : " - Successful";

            _this.functionManager = {};
            _this.functionManager.drill = function(model)
            {
                // routine to manage the drill on the grid
                dataSvc.showGWID(model.oid);
            };

            // perform the search once the screen loads and without this the grouping causes issues with the display
            $timeout(function()
            {
                dataSvc.GWIDSearch(_this.model.filter).then(function(result)
                {
                    dataSvc.parseGWIDMetaData(result);
                    _this.model.grid = result;
                }).catch(function(err)
                {
                });
            }, 1000)
        };
        //</editor-fold>

        // initialize the controller
        _this.functions.init();
    }]);
});
