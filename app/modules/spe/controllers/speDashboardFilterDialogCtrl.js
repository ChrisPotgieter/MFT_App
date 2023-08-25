/*
 /// <summary>
 /// app.modules.spe.controllers - speDashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the ITX/A Dashboard
 ///
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('speDashboardFilterDialogCtrl', ['$uibModalInstance', 'uiSvc', 'dashboardSvc', 'cacheDataSvc', 'dialogData', function ($uibModalInstance, uiSvc, dashboardSvc, cacheDataSvc, dialogData)
    {
        var _this = this;

        // initialize the custom form validation
        let transLimit = {
            fields: {
                txtTransLimit: {
                    excluded: false,
                    group: "#div_transLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Active Transactions to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Active Transactions to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 5000,
                            message: 'The No. of Active Transactions to Display must be between 1 and 5000'
                        }
                    }
                }
            }
        };
        let validator = {};
        validator = lodash.merge({}, transLimit);

        // initialize this as a dashboard dialog controller
        let options = {settingsTab:"app/modules/spe/partials/dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);

        // map list
        _this.model.maps = cacheDataSvc.getListForType("1", "ITX_MAP", _this.dataModel.filter.companyId);
        _this.model.maps.unshift({code: null, description: "All Maps"});

        // system list
        _this.model.systems = cacheDataSvc.getListForType("1", "ITX_SYSTEM", _this.dataModel.filter.companyId);
        _this.model.systems.unshift({code: null, description: "All Systems"});

        // container list
        _this.model.containers = cacheDataSvc.getListForType("1", "ITX_CONTAINER",  _this.dataModel.filter.companyId);
        _this.model.containers.unshift({code:null, description:"All Containers"});
    }]);
});
