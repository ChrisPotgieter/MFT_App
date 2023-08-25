/*
 /// <summary>
 /// app.modules.spe.controllers - speGwidViewCtrl
 /// SPE Controller for Managing the GWID Display in a Dialog Window
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/03/2017
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('speGwidViewCtrl', ['$uibModalInstance', 'id', '$timeout',function ($uibModalInstance, id, $timeout)
    {
        var _this = this;
        _this.id = id;

        _this.ok = function()
        {
            $uibModalInstance.close();
        };

        _this.cancel = function()
        {
            $uibModalInstance.dismiss('cancel');
        };


    }]);
});
