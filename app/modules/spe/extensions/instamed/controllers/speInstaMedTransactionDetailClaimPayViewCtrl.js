/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedTransactionDetailClaimPayViewCtrl
 /// SPE InstaMed Extension
 /// Detail Claim Payments View Controller to manage the Claims Display at a Individual Batch Level
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 05/04/2020
 /// </summary>
 */
define(['modules/spe/module', 'moment', 'lodash'], function (module, moment, lodash) {

    "use strict";

	module.registerController('speInstaMedTransactionDetailClaimPayViewCtrl', ['$scope', '$log', 'speInstamedDataSvc', 'uiSvc',function ($scope, $log, speInstamedDataSvc, uiSvc)
    {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {data:[]};

        _this.functions.drill = function(model)
        {
            // TBA TODO: write Claim Record Drill
        };

        //<editor-fold desc="Functions">

        _this.functions.init = function()
        {
            // routine to search for claims for the current balancing eft key
            if ($scope.vmDetailAbstract.model.balancingRecord == undefined || $scope.vmDetailAbstract.model.balancingRecord.eftkey == undefined)
                return; // the tasks have not yet initialized
            var filter = {eftKey: $scope.vmDetailAbstract.model.balancingRecord.eftkey};
            filter.topCount = 300;
            speInstamedDataSvc.claimsSearch(filter).then(function (result)
            {
                _this.model.data = result.records;
            }).catch(function (result)
            {
                $log.error("Unable to retrieve Claim Payment List Information", result);
            });
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
