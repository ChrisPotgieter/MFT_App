/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedTransactionDetailPayViewCtrl
 /// SPE InstaMed Extension
 /// Detail Claims View Controller to manage the Payment View at a Summary Level
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 05/04/2020
 /// </summary>
 */
define(['modules/spe/module'], function (module) {

    "use strict";

	module.registerController('speInstaMedTransactionDetailPayViewCtrl', ['$scope', '$log', 'speInstamedDataSvc',function ($scope, $log, speInstamedDataSvc)
    {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {partner:{}, response:{isAvailable: false}};

        //<editor-fold desc="Functions">

        _this.functions.init = function()
        {
            // routine prepare the view for display
            if ($scope.vmDetailAbstract.model.balancingRecord == undefined || $scope.vmDetailAbstract.model.balancingRecord.eftkey == undefined)
                return; // the tasks have not yet initialized

            // prepare the data as required by the payment directive
            var summaryRecord = $scope.vmDetailAbstract.model.balancingRecord.summary;

            _this.model.partner.title = speInstamedDataSvc.getProcTitles().partner;
            _this.model.partner.data = {methodCounts: summaryRecord.idf.idfSummary.paymentMethodSummary.paymentMethod, statusCounts: summaryRecord.idf.idfSummary.paymentStatusSummary.paymentStatus};

            _this.model.response.title = speInstamedDataSvc.getProcTitles().response;
            _this.model.response.isAvailable = (summaryRecord.idfResponse != undefined && summaryRecord.idfResponse.idfResponseSummary != undefined && summaryRecord.idfResponse.idfResponseSummary.paymentMethodSummary != undefined);
            if (_this.model.response.isAvailable)
                _this.model.response.data = {methodCounts: summaryRecord.idfResponse.idfResponseSummary.paymentMethodSummary.paymentMethod, statusCounts: summaryRecord.idfResponse.idfResponseSummary.paymentStatusSummary.paymentStatus};

        };

        //</editor-fold>

        $scope.$on("instamed-balancing-changed", function()
        {
            // build the screen when we have been told we have data from the parent
            _this.functions.init();
        });
        _this.functions.init();
    }]);
});
