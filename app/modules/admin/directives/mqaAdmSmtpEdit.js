/*
 /// <summary>
 /// modules.admin.directives - mqaAdmSmtpEdit.js
 /// Administration Module Directive to Manage SMTP Details
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 02/13/2017
   /// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerDirective('mqaAdmSmtpEdit', [
		'uiSvc',
		function (uiSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaAdmSmtpEdit.tpl.html',
				scope: {},
				bindToController: {
					data: '=',
					validation: '='
				},
				controllerAs: 'vmDirective',
				controller: function ($scope, $element) {
					let _this = this;
					_this.functions = {};
					_this.model = {};
					//<editor-fold desc="Validation Functions">
					_this.functions.setupValidator = function () {
						_this.model.fields = {
							fields: {
								port: {
									excluded: false,
									group: '#div_port',
									validators: {
										notEmpty: {
											message: 'The port cannot be empty'
										},
										numeric: {
											message: 'The port is not a number'
										}
									}
								},
								hostName: {
									excluded: false,
									group: '#div_hostName',
									validators: {
										notEmpty: {
											message: 'The server name cannot be empty'
										}
									}
								},
								fromName: {
									excluded: false,
									group: '#div_fromName',
									validators: {
										notEmpty: {
											message: 'The Sender From Name cannot be empty'
										}
									}
								},
								fromAddress: {
									excluded: false,
									group: '#div_fromAddress',
									validators: {
										notEmpty: {
											message: 'The Sender Email Address cannot be empty'
										},
										emailAddress: {
											message: 'Invalid Email Address'
										}
									}
								},

								hiddenValidation: {
									excluded: false,
									validators: {
										callback: {
											message: 'Both Username and Password must be filled if one is filled',
											callback: function (value, validator, $field) {
												if(_this.data.password && _this.data.user_name == ''){return false}
												if( _this.data.user_name && _this.data.password ==''){return false}
												if((_this.data.password && _this.data.user_name) ||(_this.data.password == '' && _this.data.user_name =='')){return true}
											
											}
										}
									}
								}
							}
						};

						// now setup the validator
						let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.model.fields);
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

					_this.functions.init();
				}
			};
		}
	]);
});
