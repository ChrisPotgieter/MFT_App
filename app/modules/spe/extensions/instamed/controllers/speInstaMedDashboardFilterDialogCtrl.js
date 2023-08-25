/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.controllers - speInstaMedDashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the ITX/A InstaMed Extension Dashboard
 ///
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('speInstaMedDashboardFilterDialogCtrl', ['$uibModalInstance', 'speInstamedDataSvc', 'dashboardSvc', 'cacheDataSvc', 'dialogData', function ($uibModalInstance, speInstamedDataSvc, dashboardSvc, cacheDataSvc, dialogData)
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
        let options = {settingsTab:"app/modules/spe/extensions/instamed/partials/dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);

        // holding company list
        var titles = speInstamedDataSvc.getProcTitles();
        _this.model.holdingCompany = {};
        _this.model.holdingCompany.options = cacheDataSvc.getListForType("1", "HoldingCompany", _this.dataModel.filter.companyId);
        _this.model.holdingCompany.options.unshift({code: null, description: "All Companies"});
        _this.model.holdingCompany.caption = titles.holdingCompany;
    }]);
});
