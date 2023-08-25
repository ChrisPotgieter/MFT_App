/*
 /// <summary>
 /// app.modules.spe.controllers - speTransactionDetailOperationsCtrl.js
 /// Controller for Managing the SPE Operations Panel
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/03/2017
 /// </summary>
 */

define(['modules/spe/module'], function (module) {

    "use strict";

    module.registerController('speTransactionDetailOperationsCtrl', ['$scope', '$log', '$filter','$state','$uibModal','speDataSvc', 'uiSvc', function ($scope, $log, $filter, $state, $uibModal, speDataSvc, uiSvc)
    {

        var confirmResubmit = function(ButtonPressed)
        {
            // routine to handle the resubmission request from the user


            if (ButtonPressed == "Yes")
            {
                // routine to resubmit the transaction for processesing
                if (!$scope.data.baseTransaction.stateId)
                    return;
                $scope.data.flags.inProgress = true;
                speDataSvc.performTransactionOperation($scope.data.baseTransaction.stateId, $scope.data.baseTransaction.transactionId, 1).then(function(result)
                {
                    var promiseApi = $scope.refreshBaseTransaction(true);
                    promiseApi.then(function (result2)
                    {
                        $scope.changeTransaction(result2);
                        uiSvc.showExtraSmallPopup("Resubmission Request", "The Transaction has been queued for Resubmission - " + result.publicationId + "!", 5000);
                    }).catch(function (result)
                    {
                        $log.error("Unable to retrieve Transaction Detail Data", result);
                    });

                }).catch(function (err)
                {
                    $log.error("Unable to Perform Resubmission Request", err);
                }).finally(function()
                {
                    $scope.data.flags.inProgress = false;
                });
            };
        };

        var confirmCancel = function(ButtonPressed)
        {
            // routine to handle the cancellation request from the user
            if (ButtonPressed == "Yes")
            {
                // routine to resubmit the transaction for processesing
                if (!$scope.data.baseTransaction.stateId)
                    return;
                $scope.data.flags.inProgress = true;
                speDataSvc.performTransactionOperation($scope.data.baseTransaction.stateId, $scope.data.baseTransaction.transactionId, 3).then(function(result)
                {
                    var promiseApi = $scope.refreshBaseTransaction(true);
                    promiseApi.then(function (result2)
                    {
                        $scope.changeTransaction(result2);
                        uiSvc.showExtraSmallPopup("Cancellation Request", "The Transaction has been Marked as Cancelled", 6000,  "#ce2029", "fa-times bounce animated");
                    }).catch(function (result)
                    {
                        $log.error("Unable to retrieve Transaction Detail Data", result);
                    });

                }).catch(function (err)
                {
                    $log.error("Unable to Perform Cancellation Request", err);
                })
                .finally(function ()
                {
                    $scope.data.flags.inProgress = false;
                });
            };
        };

        $scope.requestRepair = function()
        {
            $scope.data.flags.inProgress = true;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'speGwidRepairCtrl',
                controllerAs: 'vmDialog',
                scope: $scope
            });
            modalInstance.result.then(function (modalResult)
            {
                  // re-read the transaction
                  $scope.refreshBaseTransaction(true).then(function (result)
                  {
                        $scope.changeTransaction(result);
                        uiSvc.showExtraSmallPopup("Repair Request", "The Transaction has been queued for Repair - " + modalResult + "!", 5000);
                  }).catch(function (result)
                  {
                    $log.error("Unable to retrieve Transaction Detail Data", result);
                  });
            }).catch(function (err)
            {
               $log.error("Unable to Perform Repair Request", err);
            }).finally(function()
            {
                $scope.data.flags.inProgress = false;
            });

        };


        $scope.requestResubmit = function()
        {
            // routine to confirm resubmission
            var html = "<i class='fa fa-recycle' style='color:green'></i>   Resubmit Transaction <span style='color:white'>" + $scope.data.baseTransaction.transactionId + "</span> ?";
            uiSvc.showSmartAdminBox(html,"Are you sure you wish to commence Resubmission ? ",'[No][Yes]',confirmResubmit);
        };

        $scope.requestCancellation = function()
        {
            // routine to confirm cancellation
            var html = "<i class='fa fa-times' style='color:#ce2029'></i>   Force Cancel Transaction <span style='color:white'>" + $scope.data.baseTransaction.transactionId + "</span> ?";
            uiSvc.showSmartAdminBox(html,"Are you sure you wish to commence Force Cancellation ? ",'[No][Yes]',confirmCancel);
        };
    }]);
});
