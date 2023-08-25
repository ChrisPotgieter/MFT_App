/*
 /// <summary>
 /// modules.admin.directives - mqaAdmEnvironmentEdit.js
 /// Administration Module Directive to Manage Customer Environment Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 02/17/2017
  /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */

define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';
	module.registerDirective('mqaAdmEnvironmentEdit', [
		'uiSvc',
		'$filter',
		'cacheDataSvc',
		function (uiSvc, $filter, cacheDataSvc) {
			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					data: '=',
					validation: '='
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/admin/directives/mqaAdmEnvironmentEdit.tpl.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.fields = {};
					_this.functions = {};
					_this.model = {};

					//<editor-fold desc="Setup Validation">
					_this.functions.setupValidator = function () {
						//setup validator
						var bvOptions = {
							fields: {
								tenant: {
									excluded: false,
									group: '#div_name',
									validators: {
										notEmpty: {
											message: 'The Name Cannot be empty'
										}
									}
								}
							}
						};

						var bvOption = {
							fields: {
								name: {
									group: '#div_name',
									excluded: false,
									validators: {
										notEmpty: {
											message: 'The Tenant Name cannot be empty'
										}
									}
								}
							}
						};
						_this.fields = lodash.merge(bvOption);

						let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.fields);
						var innerForm = $(document.getElementById('frmEnvSettings'));
						let form = $($element);
						let fv = form
							.bootstrapValidator(formOptions)
							.on('error.field.bv', function (e) {
								if (_this.validation.onValidation) {
									// call the validation function
									_this.validation.onValidation(false);
								}
							})
							.on('success.field.bv', function (e, data) {
								if (_this.validation.onValidation) {
									// call the validation function
									_this.validation.onValidation(true);
								}
							});
						_this.validation.bv = form.data('bootstrapValidator');
					};
					//Validation license view
					_this.functions.setupLicenseValidation = function (licenseData) {
						_this.model.licenseMessage = licenseData.licensing.status;
						switch (licenseData.licensing.status) {
							case 'License Valid':
								_this.model.messageClass = 'success';
								_this.model.caption = 'success';
								_this.model.icon = 'check';
								break;
							case 'License is Expired':
							case 'TRIAL':
							case 'Trial':
								_this.model.messageClass = 'warning';
								_this.model.caption = 'Warning';
								_this.model.icon = 'warning';
								break;
							default:
								_this.model.messageClass = 'error';
								_this.model.caption = 'error';
								_this.model.icon = 'error';
						}
					};
					//</editor-fold>

					_this.functions.init = function () {
						// setup the validator watch
						$scope.$watch('vmDirective.validation.watchFlag', function (newValue, oldValue) {
							switch (_this.validation.watchFlag.value) {
								case 1:
									// validate the form
									_this.validation.bv.validate();
									break;
								case 2:
									// revalidate the form
									_this.validation.bv.resetForm();
									_this.validation.bv.validate();
									break;
								case 3:
									// revalidate the form
									_this.functions.setupValidator();
									break;
								default:
							}
						});
					};

					// watch for a data change
					$scope.$watch(
						'vmDirective.data',
						function (newValue) {
							_this.model.modules = [];
							if (newValue != null && newValue.licensing != null) {
								_this.functions.setupLicenseValidation(newValue);
								_this.model.data = newValue.jsonData;

								//Setup the descriptions for modules
								//loop through baseModules(with cacheData) to get description

								lodash.forEach(cacheDataSvc.getBaseModules(), function (moduleItem, moduleIndex) {
									lodash.forEach(newValue.licensing.modules, function (item, index) {
										if (moduleItem.jsonData.identifier == item) {
											_this.model.modules.push(moduleItem.description);
											return;
										}
									});
									if (
										!_this.model.modules.includes(moduleItem.description) &&
										moduleItem.jsonData.identifier == 9999
									) {
										_this.model.modules.push(moduleItem.description);
										return;
									}
								});
							}
						},
						true
					);

					_this.functions.init();
				}
			};
		}
	]);
});
