/*
 /// <summary>
 /// app.modules.admin.controllers - adminDocTypeListCtrl.js
 /// Controller to manage Document Type CRUD Initiation
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/4/2016
 /// </summary>
 */
define(['modules/admin/module'], function (module) {

	"use strict";

	module.registerController('adminDocTypeListCtrl', ['$scope', '$state','cacheDataSvc', function ($scope, $state, cacheDataSvc)
	{
		// get all the document types in the system
		$scope.items =  cacheDataSvc.getListForType("1", "DocType");

		$scope.onDrill = function(item)
		{
			// routine to invoke the document type drill
			$state.go("app.admin.docType", {id: item.code});
		}
	}]);
});
