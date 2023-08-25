/*
 /// <summary>
 /// app.modules.admin.controllers - parameterEditEnvCtrl.js
 /// Controller to manage Environment Settings parameter editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Mac Bhyat
 /// Date: 22/02/2017
 /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'moment', 'lodash', 'bootstrap-validator' ], function (module, moment, lodash) {
	'use strict';
	moment().format();
	module.registerController('parameterEditEnvCtrl', [
		'$filter',
		'$scope',
		'$timeout',
		'$element',
		'$log',
		'uiSvc',
		'adminDataSvc',
		function ($filter, $scope, $timeout, $element, $log, uiSvc, adminDataSvc) {
			// initialize the variables
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { loaded: 0 }, data: {} };

			_this.validator = { watchFlag: { value: -1 }, bv: {} };

			//<editor-fold desc="Validation">
			_this.validator.onValidation = function (isError) {
				// tell the wizard that the form has changed
				$scope.vm.state.form.hasChanged = true;
			};

			_this.functions.getValidator = function () {
				// routine to return the validator for this form
				return _this.validator.bv;
			};
			//</editor-fold>

			_this.functions.initialize = function (checkVal) {
				_this.functions.getServerData(checkVal);
			};

			//<editor-fold desc="Processing Functions">
			_this.functions.getServerData = function (checkVal) {
				// routine to get the server data for environment and productRelease Data

				//checkVal(if the screen should validate again)
				//Get ENVIRONMENT data
				adminDataSvc
					.readEnvironment()
					.then(function (result) {
						var value = $filter('localUTCEpochDateFilter')(
							result.licensing.expiry_date,
							'YYYY-MM-DD HH:mm:ss.SSS'
						);
						result.licensing.expiry_date = $filter('kendoDateFilter')(value);

						_this.model.data = result;

						//After ENVIRONMENT data get PRODUCT Version data
						//Get product version data
						adminDataSvc
							.readAuditParameter('PRODUCT_RELEASE')
							.then(function (result) {
								_this.model.data['productVersions'] = result;
							})
							.catch(function (err) {
								$log.error('PRODUCT_RELEASE Initialization Error', err);
							});

						if (!checkVal) {
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
								var formElement = $($element).first();
								$scope.vm.functions.stepContentLoaded(formElement);
							}
							_this.model.flags.loaded = 1;
						}
					})
					.catch(function (err) {
						$log.error('Environment Settings Initialization Error', err);
					});
			};

			_this.functions.update = function () {
				let envData = _this.model.data
				delete envData.productVersions
				// function to update the record to the database
				adminDataSvc
					.saveEnvironment(envData)
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'Environment Settings',
							'The Environment Details have been updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
							5000,
							null,
							'fa-exclamation-triangle bounce animated'
						);

						if ($scope.vm.wizard) $scope.vm.functions.moveNext();
						//Cal data make sure everything is refreshed and correct
						_this.functions.initialize(true);
					})
					.catch(function (err) {
						$log.error('Unable to Update Environment Settings', err);
					});
			};
			//</editor-fold>
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
				}, 300);
			});

			_this.functions.initialize();
		}
	]);
});
