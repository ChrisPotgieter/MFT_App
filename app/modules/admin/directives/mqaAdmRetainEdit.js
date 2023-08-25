/*
 /// <summary>
 /// modules.admin.directives - mqaAdmRetainEdit
 /// Directive to Manage Capturing of Data Retention Details for Modules in the system
 /// This will be invoked as part of Initial System Setup or through System Parameters
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/01/2021
 /// </summary>
 */

define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';
	module.registerDirective('mqaAdmRetainEdit', [
		'cacheDataSvc',
		'uiSvc',
		function (cacheDataSvc, uiSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaAdmRetainEdit.tpl.html',
				scope: {},
				bindToController: {
					data: '=',
					validation: '='
				},
				controllerAs: 'vmRetainDetail',
				controller: function ($element, $scope) {
					let _this = this;
					_this.fields = {};
					_this.functions = {};
					_this.model = { tabs: [] };

					_this.functions.addModuleParameter = function (code, paths, defaultValue, foundFunction) {
						// routine to see if the given module is valid for this installation and update the tab list and default value
						let moduleActive = lodash.find(_this.model.features, { code: code.toUpperCase() });
						if (moduleActive != null) {
							let moduleRecord = lodash.find(_this.model.modules, { code: code });
							if (moduleRecord != null) {
								_this.model.tabs.push({ active: false, id: code, name: moduleRecord.description });
								lodash.forEach(paths, function (obj) {
									_this.functions.validateModuleData(obj.path, obj.defaultValue);
								});
								if (foundFunction != null) foundFunction();
							}
						}
					};

					_this.functions.validateModuleData = function (path, defaultValue) {
						//  check if the module property exists otherwise add it
						let modulePath = 'jsonData.modules.' + path;
						let has = lodash.has(_this.data, modulePath);
						if (!has) lodash.set(_this.data, modulePath, defaultValue);
					};
					_this.functions.calculateTabs = function () {
						// routine to determine the tabs to be shown based on the available features
						let txtPurgeCompleted = {
							fields: {
								txtPurgeComplete: {
									excluded: false,
									group: '#div_txtPurgeComplete',
									validators: {
										notEmpty: {
											message: 'The No. of Days to Retain Completed Cannot be Empty'
										},
										integer: {
											message: 'The No. of Days to Retain Completed should be a numeric'
										}
									}
								}
							}
						};

						let txtPurgeProgress = {
							fields: {
								txtPurgeProgress: {
									excluded: false,
									group: '#div_txtPurgeProgress',
									validators: {
										notEmpty: {
											message: 'The No. of Days to Retain In Progress Cannot be Empty'
										},
										integer: {
											message: 'The No. of Days to Retain In Progress should be a numeric'
										}
									}
								}
							}
						};
						_this.fields = lodash.merge({}, txtPurgeCompleted, txtPurgeProgress);

						_this.model.tabs = [];
						_this.model.tabs.push({ active: true, id: 'transaction', name: 'General' });

						// determine what modules and features
						_this.model.features = cacheDataSvc.getListForType('0', 'Feature');
						_this.model.modules = cacheDataSvc.getBaseModules();

						_this.functions.addModuleParameter(
							'spe',
							[ { path: 'itx.gwid', defaultValue: 365 }, { path: 'itx.complete', defaultValue: 365 } ],
							function () {
								let txtPurgeSPEGWID = {
									fields: {
										txtPurgeSPEGWID: {
											excluded: false,
											group: '#div_txtPurgeSPEGWID',
											validators: {
												notEmpty: {
													message: 'The No. of Days to Retain GWID Documents Cannot be Empty'
												},
												integer: {
													message:
														'The No. of Days to Retain GWID Documents should be a numeric'
												}
											}
										}
									}
								};
								let txtPurgeSPEComplete = {
									fields: {
										txtPurgeSPEGWID: {
											excluded: false,
											group: '#div_txtPurgeSPEComplete',
											validators: {
												notEmpty: {
													message:
														'The No. of Days to Retain Completed ITX Transactions Cannot be Empty'
												},
												integer: {
													message:
														'The No. of Days to Retain Completed ITX Transactions should be a numeric'
												}
											}
										}
									}
								};
								_this.fields = lodash.merge(_this.fields, txtPurgeSPEGWID, txtPurgeSPEComplete);
							}
						);
					};

					_this.functions.init = function () {
						// routine to initialize the directive
						if (!_this.data || !_this.data.jsonData) return;
						_this.functions.calculateTabs();

						// now setup the validator
						let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.fields);
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

						// setup the validator watch
						$scope.$watch('vmRetainDetail.validation.watchFlag', function (newValue, oldValue) {
							//	if (!_this.validation.bv) return;
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
									_this.functions.calculateTabs();
									break;
								default:
							}
						});
					};

					// watch for a data change
					$scope.$watch(
						'vmRetainDetail.data',
						function (newValue) {
							if (newValue) {
								_this.data = newValue;
								_this.functions.init();
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
