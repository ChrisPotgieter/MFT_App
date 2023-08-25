/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfDashboardFilterDialogCtrl
 /// CNO Automated Employer Group Dashboard Filter Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 26/06/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('aegfDashboardFilterDialogCtrl', ['$uibModalInstance','uiSvc', 'dashboardSvc', 'dialogData', function ($uibModalInstance,uiSvc, dashboardSvc, dialogData)
    {
        let _this = this;
        _this.functions = {};

        // initialize the custom form validation
        let transLimit = {
            fields: {
                txtTransLimit: {
                    excluded: false,
                    group: "#div_transLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Executions to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Executions to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 5000,
                            message: 'The No. of Executions to Display must be between 1 and 5000'
                        }
                    }
                }
            }
        };
        let barLimit = {
            fields: {
                txtBarLimit: {
                    excluded: false,
                    group: "#div_procLimit",
                    validators: {
                        notEmpty: {
                            message: 'The Top X Employer Groups to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The Top X Employer Groups to Display should be a numeric'
                        },
                        between: {
                            min: 2,
                            max: 10,
                            message: 'The Top X Employer Groups to Display must be between 2 and 10'
                        }
                    }
                }
            }
        };

        let validator = {};
        validator = lodash.merge({}, transLimit, barLimit);
        //</editor-fold>


        // initialize this as a dashboard dialog controller
        let options = {settingsTab:"app/modules/custom/spe_cno/partials/aegf-dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);
    }]);
});
