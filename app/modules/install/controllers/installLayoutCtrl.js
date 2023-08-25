/*
 /// <summary>
 /// app.modules.install.controllers - installLayoutCtrl.js
 /// Base Layout Controller
 /// Controller to manage the layout of the install wizards
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/02/2017
 /// </summary>
 */
define(['modules/install/module','appCustomConfig', 'moment'], function (module, appCustomConfig, moment) {

	"use strict";

    moment().format();

	module.registerController("installLayoutCtrl", ['$scope',  'uiSvc', function ($scope, uiSvc)
	{

		$scope.copyright = "© Copyright " + moment().format("YYYY") + " " + appCustomConfig.product.company;
		$scope.productName = appCustomConfig.product.name;
		
	}]);
});
