/*
 /// <summary>
 /// app.modules.admin.controllers - parameterEditSMTPCtrl.js
 /// Controller to manage SMTP Settings parameter editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Mac Bhyat
 /// Date: 22/02/2017
/// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterEditSMTPCtrl', [
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
			_this.validator = { watchFlag: { value: -1 }, bv: {}, startValidate: true };
			_this.validator.onValidation = function (isError) {
				// tell the wizard that the form has changed
				$scope.vm.state.form.hasChanged = true;
			};

			_this.functions.getValidator = function () {
				_this.validator.startValidate === false;
				// routine to return the validator for this form
				return _this.validator.bv;
			};

			_this.functions.update = function () {
				// routine to save the details to the database
				adminDataSvc
					.saveSMTP(_this.model.data)
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'SMTP Settings',
							'The SMTP Details have been updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
							5000,
							null,
							'fa-exclamation-triangle bounce animated'
						);

						if ($scope.vm.wizard) $scope.vm.functions.moveNext();
						//Cal data make sure everything is refreshed and correct
						_this.functions.initialize(true);
						_this.validator.watchFlag.value = 3;
					})
					.catch(function (err) {
						$log.error('Unable to Update SMTP Settings', err);
					}); 
					_this.validator.watchFlag.value = 2;
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
				}, 300);
			});

			_this.functions.initialize = function (checkVal) {
				//checkVal(if the screen should validate again)
				// routine to initialize the controller
				adminDataSvc
					.readSMTP()
					.then(function (result) {
						_this.model.data = result;
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
						$log.error('SMTP Settings Initialization Error', err);
					});
			};

			
			//initialize
			_this.functions.initialize();
		}
	]);
});
