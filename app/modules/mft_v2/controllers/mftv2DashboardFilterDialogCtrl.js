/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftv2DashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the MFT Dashboard
 ///
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('mftv2DashboardFilterDialogCtrl', ['$uibModalInstance', '$log', 'uiSvc', 'dashboardSvc', 'mftv2DataSvc','cacheDataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, dashboardSvc, mftv2DataSvc, cacheDataSvc, dialogData)
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

        let validator = {};
        validator = lodash.merge({}, transLimit, jobLimit);

        // initialize this as a dashboard dialog controller
        let options = {settingsTab:"app/modules/mft_v2/partials/dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);
        _this.functions.onSaveDefault = function(defaults, model)
        {
            defaults.filter.tableType = parseInt(defaults.filter.tableType);
        };

        // get the lists for the dropdowns
        _this.model.lists = {agent_at_qm :[]};
        mftv2DataSvc.getLists().then(function(result)
        {
            _this.model.lists = result;
        }).catch(function(err)
        {
            $log.error("Unable to get MFT Lists", err);
        });

    }]);
});
