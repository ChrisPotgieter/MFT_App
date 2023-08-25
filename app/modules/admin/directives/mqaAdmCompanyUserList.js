/*
 /// <summary>
 /// modules.admin.directives - mqaAdmCompanyUserList.js
 /// Administration Module Directive to List Company Users in a Kendo Grid
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */

 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';
	module.registerDirective('mqaAdmCompanyUserList', [
		'$timeout',
		'uiSvc',
		'adminDataSvc',
		function ($timeout, uiSvc, adminDataSvc) {
			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					title: '@',
					data: '=',
					gridOptions: '=',
					selections: '=?',
					refreshFlag: '=?'
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/admin/directives/mqaAdmCompanyUserList.tpl.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.functions = {};
					_this.model = { flags: { watched: false, gridRefresh: { value: 0 } } };

					//setup user dialog details
					let dialogUserDetails = {
						template: 'app/modules/admin/partials/company-user-edit-wizard-dialog.tpl.html',
						controller: 'companyWizardUserEditDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showUserDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogUserDetails,
						'User'
					);
				


				
				}
			};
		}
	]);
});


