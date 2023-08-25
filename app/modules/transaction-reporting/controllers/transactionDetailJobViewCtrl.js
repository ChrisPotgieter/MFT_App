/*
 /// <summary>
 /// app.modules.transaction-reporting.controllers - transactionDetailJobViewCtrl.js
 /// Controller for Transaction Detail - Job View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 5/31/2015
 /// </summary>
 */

define(['modules/transaction-reporting/module'], function (module) {

	"use strict";

	module.registerController('transactionDetailJobViewCtrl', ['$scope', '$log', 'apiProvider','userSvc', 'transactionReportingSvc', function ($scope, $log, apiProvider, userSvc, transactionReportingSvc)
	{

		let _this = this;
		_this.functions = {};

		_this.functions.refreshNavigation = function()
		{
			// routine to rebuild the navigation
			if ($scope.data.baseTransaction && $scope.data.baseTransaction.jobId)
			{
				let orgInfo = userSvc.getOrgInfo();
				let queryObject = {jobId: $scope.data.baseTransaction.jobId, companyId: orgInfo.companyId};
				if (!userSvc.hasFeature(userSvc.commonFeatures.TRANS_FILTER_ALL))
                    queryObject.departments =  orgInfo.departments;

                apiProvider.getObject(transactionReportingSvc.moduleRoutes.JOB_TREE, queryObject).then(function (result)
				{
					$scope.refreshTree(result);
					return result;
				}).catch(function (result) {
					$log.error("Unable to retrieve Transaction Detail Job Menu", result);
				});
			}
		};
		// update the navigation mechanism
		$scope.setNavigation(_this.functions.refreshNavigation);

	}]);
});
