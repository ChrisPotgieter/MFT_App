/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionDashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the IIB Transaction Dashboard
 ///
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/01/2022
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('iibv2TransactionDashboardFilterDialogCtrl', ['$uibModalInstance', 'uiSvc', 'dashboardSvc', 'cacheDataSvc', 'dialogData', function ($uibModalInstance, uiSvc, dashboardSvc, cacheDataSvc, dialogData)
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
        let appLimit = {
            fields: {
                txtAppLimit: {
                    excluded: false,
                    group: "#div_appLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Applications to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Applications to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 10,
                            message: 'The No. of Applications to Display must be between 1 and 10'
                        }
                    }
                }
            }
        };
        let validator = {};
        validator = lodash.merge({}, transLimit, appLimit);

        // initialize this as a dashboard dialog controller
        let options = {settingsTab:"app/modules/iib_v2/partials/dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);

        // build the application list
        _this.model.applications = cacheDataSvc.getListForType("1", "IIB_APP", _this.dataModel.filter.companyId);
        _this.model.applications.unshift({code: null, description: "All Applications"});

        // build the execution group list
        _this.model.executionGroups = cacheDataSvc.getListForType("1", "IIB_EG", _this.dataModel.filter.companyId);
        _this.model.executionGroups.unshift({code: null, description: "All Servers"});
    }]);
});
