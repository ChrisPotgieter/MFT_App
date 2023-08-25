/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateDetailDialogCtrl
 /// XML Sign WMQ Gateway Detail Dialog Controller to Manage Displaying of a Request Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/04/2022
 /// </summary>
 */

define(['modules/bridge/module', 'lodash'], function (module, lodash)
{
    "use strict";
    module.registerController('xmlSignWMQGateDetailDialogCtrl', ['$filter','$uibModalInstance', 'bridgeDataSvc', 'uiSvc', 'dialogData', function ($filter, $uibModalInstance, bridgeDataSvc, uiSvc, dialogData)
    {
        var _this = this;
        _this.model = {flags: {showMeta: false}, messageGrid:{data:[], options:{propertyView: true, allowExport: true}}, requestGrid:{data:[], options:{propertyView: true, allowExport: true}}, metaGrid:{data:[], options:{propertyView: true, allowExport: true}}};

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };

        _this.functions.buildHeader = function()
        {

            _this.model.status = {};
            _this.model.status.alertClass = "alert-" + $filter('bootStrapStatusFilter')(bridgeDataSvc.getBootStrapStatus(_this.model.record.status));
            _this.model.status.icon = $filter('bootStrapStatusIconFilter')(bridgeDataSvc.getBootStrapStatus(_this.model.record.status));
        };


        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            if (dialogData.module_data && dialogData.module_data.message_descriptor)
            {
                _this.model.messageGrid.data = bridgeDataSvc.buildMessagePropertyGrid(dialogData.module_data.message_descriptor);
            }
            // setup the meta-data grid data
            if (dialogData.meta_data)
            {
                _this.model.flags.showMeta = true;
                _this.model.metaGrid.data =  uiSvc.parseMetaGridData(dialogData.meta_data, null, bridgeDataSvc.parseMetaData);
            }

            // setup the bridge data
            _this.model.requestGrid.data = bridgeDataSvc.buildBridgeGrid(dialogData);

            // setup the header
            _this.model.record = dialogData;
            if (!_this.model.record.supplemental || _this.model.record.supplemental == '' )
                _this.model.record.supplemental = "Completed with No Errors";
            _this.functions.buildHeader();
        };


        _this.functions.initialize();
        //</editor-fold>
    }]);
});
