/*
 /// <summary>
 /// modules.admin.directives - mqaAdmSpeEdit.js
 /// Administration Module Directive to Manage SPE Connection Details
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 30/05/2017
/// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerDirective('mqaAdmSpeEdit', [
		'$log',
		'uiSvc',
		function ($log, uiSvc) {
			return {
				restrict: 'E',
				templateUrl: 'app/modules/admin/directives/mqaAdmSpeEdit.tpl.html',
				scope: {},
				bindToController: {
					data: '=',
					validation: '='
				},
				controllerAs: 'vmDirective',
				controller: function ($scope, $element) {
					let _this = this;
					_this.fields = {};
					_this.functions = {};
					_this.model = {};

					_this.functions.setupValidator = function () {
						// setup the bootstrap validator fields
						// setup the bootstrap validator fields
						var urlTxt = {
							fields: {
								url: {
									excluded: false,
									group: '#div_url',
									validators: {
										notEmpty: {
											message: 'The Server URL cannot be empty'
										},
										callback: {
											message: 'Url must end in svc ',
											callback: function (value, validator, $field) {
												let checkUrl = value.substring(value.lastIndexOf('/') + 1);
												console.log(checkUrl);
												if (checkUrl === 'svc') {
													return true;
												}
												else {
													return false;
												}
											}
										}
									}
								}
							}
						};
						var userTxt = {
							fields: {
								userName: {
									excluded: false,
									group: '#div_user',
									validators: {
										notEmpty: {
											message: 'The User cannot be empty'
										}
									}
								}
							}
						};
						var passwordTxt = {
							fields: {
								userPassword: {
									group: '#div_password',
									excluded: false,
									validators: {
										notEmpty: {
											message: 'The Password cannot be empty'
										}
									}
								}
							}
						};

						var senderIDTxt = {
							fields: {
								senderID: {
									excluded: false,
									group: '#div_senderID',
									validators: {
										notEmpty: {
											message: 'The Template Sender ID cannot be empty'
										}
									}
								}
							}
						};
						_this.fields = lodash.merge(urlTxt, userTxt, passwordTxt, senderIDTxt);

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
					};

					_this.functions.init = function () {
						// setup the validator watch
						$scope.$watch('vmDirective.validation.watchFlag', function (newValue, oldValue) {
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
