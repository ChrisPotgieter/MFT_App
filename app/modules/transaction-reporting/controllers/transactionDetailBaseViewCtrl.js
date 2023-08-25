/*
 /// <summary>
 /// app.modules.transaction-reporting.controllers - transactionDetailBaseViewCtrl.js
 /// Controller for Transaction Detail - Base View (Transaction Viewer)
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 6/8/2015
 /// </summary>
 */

define(['modules/transaction-reporting/module'], function (module) {

	"use strict";

	module.registerController('transactionDetailBaseViewCtrl', ['$scope',function ($scope)
    {
        // update the navigation mechanism
		$scope.setNavigation(null);

   }]);
});
