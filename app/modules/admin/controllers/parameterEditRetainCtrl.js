/*
 /// <summary>
 /// app.modules.install.controllers - parameterEditRetainCtrl.js
 /// Controller to manage Data Retention parameter editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Mac Bhyat
 /// Date: 18/01/2021
 /// </summary>
 */

define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterEditRetainCtrl', [
		'$scope',
		'$timeout',
		'$element',
		'$log',
		'$state',
		'uiSvc',
		'cacheDataSvc',
		'adminDataSvc',
		function ($scope, $timeout, $element, $log, $state, uiSvc, cacheDataSvc, adminDataSvc) {
			// initialize the variables
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { loaded: 0 }, data: {} };

			// setup the validator
			_this.validator = { watchFlag: { value: -1 }, bv: {} };
			_this.validator.onValidation = function (isError) {
				// tell the wizard that the form has changed
				$scope.vm.state.form.hasChanged = true;
			};

			//<editor-fold desc="Functions">
			_this.functions.getValidator = function () {
				// routine to return the validator for this form
				return _this.validator.bv;
			};

			_this.functions.update = function () {
				// routine to save the details to the database
			/**/	adminDataSvc
					.saveAuditParameter(_this.model.data, 'UI Update', 'PURGE_DAYS', 'record')
					.then(function () {
						uiSvc.showExtraSmallPopup(
							'Data Retention',
							'The configuration has updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
							5000
						);

						// if we are not in wizard mode, warn the user
						if (!$scope.vm.wizard)
							{}
						else {
							// wizard mode - navigate to the appropriate step
							let result = cacheDataSvc.getCompanies();
							if (result == null || result.length == 0) $state.go('install.companywiz', { id: 0 });
							else $state.go('login');
						}
					})
					
					.catch(function (err) {
						$log.error('Unable to Update Data Retention Configuration', err);
					}); 
			};

			// manage the wizard mode
			$scope.$on('$viewContentLoaded', function () {
				_this.validator.watchFlag.value = 3;
				// when the DOM has loaded initialize BV
				$timeout(function () {
					if (_this.model.flags.loaded == 1) {
						// read has been read
						let formElement = $($element).first();
						$scope.vm.functions.stepContentLoaded(formElement);
					}
					else _this.model.flags.loaded = 2; // screen has load but the model has not
				}, 600);
			});

			_this.functions.initialize = function (checkVal) {
					//checkVal(if the screen should validate again)
				// routine to initialize the controller
				adminDataSvc
					.readAuditParameter('PURGE_DAYS')
					.then(function (result) {
						if (result == null || !result.jsonData) {
							result = {
								id: 'PURGE_DAYS',
								description: 'Data Retention Settings',
								jsonData: { purge_complete: 90, purge_progress: 5 }
							};
							result.value = JSON.stringify(result.jsonData);
						}
						_this.model.data = result;

						// now setup the form
						if ($scope.vm.wizard)
							$scope.vm.functions.initializeStep(
								result,
								_this.functions.getValidator,
								_this.functions.update
							);
						else
							$scope.vm.functions.initializeSettingWithModel(
								result,
								_this.functions.getValidator,
								_this.functions.update
							);
						if (_this.model.flags.loaded == 2) {
							// form has already loaded
							// initialize the form
							let formElement = $($element).first();
							$scope.vm.functions.stepContentLoaded(formElement);
						}
						_this.model.flags.loaded = 1;
					})
					.catch(function (err) {
						$log.error('Data Retention Settings Initialization Error', err);
					});
			};

			// initialize
			_this.functions.initialize();
		}
	]);
});
