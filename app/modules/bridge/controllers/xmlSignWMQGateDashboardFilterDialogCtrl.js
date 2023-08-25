/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateDashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the XML Sign WMQ Gateway Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2022
 /// </summary>
 */

define(['modules/bridge/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('xmlSignWMQGateDashboardFilterDialogCtrl', ['$uibModalInstance', '$log', 'uiSvc', 'dashboardSvc', 'bridgeDataSvc','cacheDataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, dashboardSvc, bridgeDataSvc, cacheDataSvc, dialogData)
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
        let validator = {};
        validator = lodash.merge({}, transLimit);
        let options = {settingsTab:"app/modules/bridge/partials/xmlsign-wmq-gate-dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);

        let jobLimit = {
            fields: {
                txtJobLimit: {
                    excluded: false,
                    group: "#div_jobLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Jobs to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Jobs to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 10,
                            message: 'The No. of Jobs to Display must be between 1 and 10'
                        }
                    }
                }
            }
        };


    }]);
});
