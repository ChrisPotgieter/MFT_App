/*
 /// <summary>
  /// app.modules.custom.spe_cno.controllers - cnoTpciReportingGridViewCtrl.js
 /// CNO Third Party Commission Intake Reporting Controller - GridView
 /// Handles both Enrollments and Commissions
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/05/2022
 /// </summary>
 */
define(['modules/custom/spe_cno/module'], function (module)
{
    "use strict";
    module.registerController('cnoTpciReportingGridViewCtrl', ['$scope', 'transactionReportingSvc', 'speCNODataSvc', function ($scope, transactionReportingSvc, dataSvc)
    {
        var _this = this;
        _this.flags = {userSave: false};



        //<editor-fold desc="State Manager">
        _this.stateManager = {};

        // initialize the default custom report
        transactionReportingSvc.initializeDefaultStateManager($scope, _this.stateManager);
        //</editor-fold>

        //<editor-fold desc="Functions">
        _this.functions = {};

        _this.functions.onCountDrill = function(data)
        {
            // routine to handle drills on the counts for both the comparision filter and the standard filter
            return dataSvc.onTPCICountDrill(data, $scope.vm.functions.getFilter());
        };

        //</editor-fold>

    }]);
});
