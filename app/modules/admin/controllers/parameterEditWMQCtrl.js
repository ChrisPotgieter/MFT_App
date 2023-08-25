/*
 /// <summary>
 /// app.modules.install.controllers - parameterEditWMQCtrl.js
 /// Controller to manage Default Websphere Message Queuing parameter editing
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

	module.registerController('parameterEditWMQCtrl', [
		'$scope',
		'$timeout',
		'$element',
		'$log',
		'$state',
		'uiSvc',
		'cacheDataSvc',
		'adminDataSvc',
		function ($scope, $timeout, $element, $log, $state, uiSvc, cacheDataSvc, adminDataSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { gridData: [], flags: { loaded: 0 }, data: {} };

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
				if (_this.model.data.binding == 1) {
					_this.model.data.hosts = [];
					//	_this.model.data.hosts[0].port = '';
					_this.model.data.channel = '';
				}

				// routine to save the details to the database
				adminDataSvc
					.saveDefaultMQ(_this.model.data)
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'WMQ Connectivity Settings',
							'The WMQ Connectivity Details have been updated successfully ! <br/> Please Restart your Services for Changes to take Effect !',
							5000,
							null,
							'fa-exclamation-triangle bounce animated'
						);

						if ($scope.vm.wizard) $scope.vm.functions.moveNext();
					})
					.catch(function (err) {
						$log.error('Unable to Update WMQ Settings', err);
					});
			};
			//</editor-fold>

			//<editor-fold desc="Initializations">
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
					else {// screen has load but the model has not
						_this.model.flags.loaded = 2;
						_this.functions.initialize();
					} 
				}, 300);
			});

			_this.functions.initialize = function () {
				adminDataSvc
					.readDefaultMQ()
					.then(function (result) {
						result.mqm_user = 'MacTest';
						//add rowIds to list
						for (var i = 0; i < result.hosts.length; i++) {
							result.hosts[i].rowId = i;
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
							var formElement = $($element).first();
							$scope.vm.functions.stepContentLoaded(formElement);
						}
						_this.model.flags.loaded = 1;
					})
					.catch(function (err) {
						$log.error('WMQ Connectivity Settings Initialization Error', err);
					});
			};
			//</editor-fold>

			// initialize
			_this.functions.initialize();
		}
	]);
});
