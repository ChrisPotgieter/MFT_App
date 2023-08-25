/*
 /// <summary>
 /// app.modules.admin.controllers - parameterEditSpeCtrl.js
 /// Controller to manage SPE Configuration Settings parameter editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Mac Bhyat
 /// Date: 07/06/2017
 /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterEditSpeCtrl', [
		'$scope',
		'$timeout',
		'$element',
		'$log',
		'uiSvc',
		'adminDataSvc',
		'$http',
		function ($scope, $timeout, $element, $log, uiSvc, adminDataSvc, $http) {
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

			_this.functions.getValidator = function () {
				// routine to return the validator for this form
				return _this.validator.bv;
			};

			_this.functions.update = function () {
				// function to update the record to the database
				// routine to save the details to the database
				adminDataSvc
					.saveAuditParameter(_this.model.data, 'UI Update','parameter', 'spe')
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'ITXA Configuration',
							'The configuration has updated successfully !',
							5000,
							null,
							'fa-exclamation-triangle bounce animated'
						);

						if ($scope.vm.wizard) $scope.vm.functions.moveNext();
					})
					.catch(function (err) {
						$log.error('Unable to Update ITXA Configuration', err);
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
				}, 300);
			});

			_this.functions.initialize = function () {
				// routine to initialize the controller
				adminDataSvc
					.readModuleParameter('SPE')
					.then(function (result) {
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
							var formElement = $($element).first();
							$scope.vm.functions.stepContentLoaded(formElement);
						}
						_this.model.flags.loaded = 1;
					})
					.catch(function (err) {
						$log.error('Spe Settings Initialization Error', err);
					});
			};

			_this.functions.initialize();
		}
	]);
});

