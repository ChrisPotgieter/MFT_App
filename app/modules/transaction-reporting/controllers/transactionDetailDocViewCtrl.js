/*
 /// <summary>
 /// app.modules.transaction-reporting.controllers - transactionDetailDocViewCtrl.js
 /// Controller for Transaction Detail - Document View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 6/10/2015
 /// </summary>
 */

define(['modules/transaction-reporting/module'], function (module) {

	"use strict";

	module.registerController('transactionDetailDocViewCtrl', ['$scope', '$log', 'apiProvider', 'userSvc', 'transactionReportingSvc', function ($scope, $log, apiProvider, userSvc, transactionReportingSvc)
	{

		let _this = this;
		_this.functions = {};

		_this.functions.refreshNavigation = function()
		{
			// routine to rebuild the navigation
			if ($scope.data.baseTransaction && $scope.data.baseTransaction.docId && $scope.data.baseTransaction.docType)
			{
				let orgInfo = userSvc.getOrgInfo();

				// send dates with the document menu build
				let currentFilter = transactionReportingSvc.currentFilter;
				let queryObject = {docId : $scope.data.baseTransaction.docId, docType: $scope.data.baseTransaction.docType, companyId: orgInfo.companyId, fromDate: null, toDate: null};
				if (!userSvc.hasFeature(userSvc.commonFeatures.TRANS_FILTER_ALL))
                    queryObject.departments =  orgInfo.departments;

                if (currentFilter)
				{
					queryObject.fromDate = currentFilter.fromDate;
					queryObject.toDate = currentFilter.toDate;
				}

				apiProvider.getObject(transactionReportingSvc.moduleRoutes.DOC_TREE, queryObject).then(function (result)
				{
					$scope.refreshTree(result);
				}).catch(function (result)
				{
					$log.error("Unable to retrieve Transaction Detail Document Menu", result);
				});
			}
		};

		// update the navigation mechanism
		$scope.setNavigation(_this.functions.refreshNavigation);
	}]);
});
