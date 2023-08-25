/*
 /// <summary>
 /// app.modules.common.controllers - commonFilterListDialogCtrl
 /// Common Dialog Controller to Manage Listing of Filter Entries
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/common/module'], function (module) {
    "use strict";

    module.registerController('commonFilterListDialogCtrl', ['$uibModalInstance', 'uiSvc', 'dialogData', function ($uibModalInstance, uiSvc, dialogData)
    {
        let _this = this;
        _this.functions = {};
        _this.model = {title: dialogData.title, icon: dialogData.icon, data: dialogData.data, keyOptions: dialogData.keyOptions, flags:{refresh: {value: 0}}};

        //<editor-fold desc="Functions">
        _this.functions.confirmDelete = function (ButtonPressed) {
            if (ButtonPressed == "Yes")
            {
                _this.model.data.length = 0;
                //_this.model.flags.refresh.value += 1;
            }
        };


        _this.functions.userDelete = function (editRow) {
            // routine to confirm deletion of of the row
            const html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear <span style='color:white'>" + _this.model.title + "</span> ?";
            uiSvc.showSmartAdminBox(html, "Are you sure you want to Clear All Entries ? ", '[No][Yes]', _this.functions.confirmDelete);
        };

        _this.functions.onCancel = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };

        _this.functions.onSave = function ()
        {
            // validate that the form is correct before saving
            $uibModalInstance.close(_this.model.data);
        };
        //</editor-fold>

    }]);

});

