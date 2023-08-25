/*
 /// <summary>
 /// app.modules.common.controllers - commonCommandInfoDialogCtrl
 /// Common Command Information Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/07/2020
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    "use strict";

	module.registerController('commonCommandInfoDialogCtrl', ['$uibModalInstance', '$scope', 'dialogData', function ($uibModalInstance, $scope, dialogData)
    {

        // initialize the object
        const _this = this;
        _this.functions = {};
        _this.model = {};

        //<editor-fold desc="Functions">

        _this.functions.initialize = function()
        {
            // routine to prepare the view for display
            _this.model = dialogData;
        };
        _this.functions.confirmDialog = function()
        {
            // close the window
            $uibModalInstance.close(_this.model.data);
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
