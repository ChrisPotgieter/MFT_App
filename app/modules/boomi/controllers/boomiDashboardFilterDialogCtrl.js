/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiDashboardFilterDialogCtrl
 /// Controller to Manage Dashboard Filtering for the Boomi Dashboard
 ///
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/09/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('boomiDashboardFilterDialogCtrl', ['$uibModalInstance', '$log', 'uiSvc', 'dashboardSvc', 'boomiDataSvc','cacheDataSvc', 'dialogData', function ($uibModalInstance, $log, uiSvc, dashboardSvc, dataSvc, cacheDataSvc, dialogData)
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
        let processLimit = {
            fields: {
                txtProcLimit: {
                    excluded: false,
                    group: "#div_procLimit",
                    validators: {
                        notEmpty: {
                            message: 'The No. of Processes to Display Cannot be Empty'
                        },
                        integer: {
                            message: 'The No. of Processes to Display should be a numeric'
                        },
                        between: {
                            min: 1,
                            max: 10,
                            message: 'The No. of Processes to Display must be between 1 and 10'
                        }
                    }
                }
            }
        };

        let validator = {};
        validator = lodash.merge({}, transLimit, processLimit);

        // initialize this as a dashboard dialog controller
        let options = {settingsTab:"app/modules/boomi/partials/dashboard-filter.tpl.html", validator: validator};
        dashboardSvc.functions.initializeDashboardDialogController(_this, dialogData, $uibModalInstance, options);
        _this.functions.onSaveDefault = function(defaults, model)
        {
            defaults.filter.tableType = parseInt(defaults.filter.tableType);
        };

        // get the lists for the dropdowns
        _this.model.lists = {agent_at_qm :[]};
        dataSvc.getLists().then(function(result)
        {
            _this.model.lists = result;
        }).catch(function(err)
        {
            $log.error("Unable to get Boomi Lists", err);
        });


    }]);
});
