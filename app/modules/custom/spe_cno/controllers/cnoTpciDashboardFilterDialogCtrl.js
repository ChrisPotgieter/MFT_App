/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciDashboardFilterDialogCtrl.js
 /// CNO Third Party Commission Intake Dashboard Filter Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/05/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('cnoTpciDashboardFilterDialogCtrl', ['$uibModalInstance', '$log', 'uiSvc', 'dashboardSvc', 'speCNODataSvc','cacheDataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, dashboardSvc, dataSvc, cacheDataSvc, dialogData)
    {
        var _this = this;

        // initialize this as a dashboard dialog controller
        let transLimit = {
            fields: {
                txtTransLimit: {
                    excluded: false,
                    group: "#div_transLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Transactions to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Transactions to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 5000,
                            message: 'The No. of Transactions to Display must be between 1 and 5000'
                        }
                    }
                }
            }
        };

        let barLimit = {
            fields: {
                txtJobLimit: {
                    excluded: false,
                    group: "#div_barLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Top X to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Top X to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 10,
                            message: 'The No. of Top X to Display must be between 1 and 10'
                        }
                    }
                }
            }
        };

        let validator = {};
        validator = lodash.merge({}, transLimit, barLimit);
        let options = {settingsTab:"app/modules/custom/spe_cno/partials/tcpi-dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);
    }]);
});
