/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardBasicCtrl.js
 /// Controller to manage Company Wizard - Basic Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mohammed Helly
 /// Date: 02/02/2017
 /// Reworked for Stablility By: Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardBasicCtrl', [
		'$scope',
		'$timeout',
		'$log',
		'$element',
		'cacheDataSvc',
		'adminDataSvc',
		'uiSvc',
		function ($scope, $timeout, $log, divElement, cacheDataSvc, adminDataSvc, uiSvc) {
			// setup the form
			var bootValidatorOptions = {
				fields: {
					companyName: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'The Company Name cannot be empty'
							},
							callback: {
								message: 'This Company Is already exists',
								callback: function (value, validator, $field) {
									var companies = cacheDataSvc.getCompanies();
									var found = lodash.find(companies, function (company) {
										return company.name == value && company.id != $scope.vm.model.company.id;
									});
									if (found) {
										return false;
									}
									return true;
								}
							}
						}
					},
					companyPhone: {
						excluded: false,
						group: '.col-sm-6',
						validators: {
							notEmpty: {
								message: 'The Company Phone cannot be empty'
							},
							phone: {
								country: 'US',
								message: 'Please provide a Valid Phone Number '
							}
						}
					},
					companyEmail: {
						excluded: false,
						group: '.col-sm-6',
						validators: {
							notEmpty: {
								message: 'The Email Address cannot be empty'
							},
							emailAddress: {
								message: 'Invalid Email Address'
							}
						}
					},
					companyUrl: {
						excluded: true,
						validators: {
							uri: {
								message: 'The URL is invalid'
							}
						}
					},
					hiddenDept: {
						excluded: false,
						validators: {
							callback: {
								message: 'A Company needs to have at least 1 department',
								callback: function (value, validator, $field) {
									var valid =
										$scope.vm.model.departmentNames != null &&
										$scope.vm.model.departmentNames.length > 0;
									$scope.deptError = valid ? 1 : 99;
									return valid;
								}
							}
						}
					}
				}
			};

			var field_validation = function (isError) {
				// custom validation processing - nothing to do here as bootstrapvalidator will handle everything
			};
			var updateFunction = function () {
				// function to run when in non-new company mode and we want to update the database directly
				var model = {
					basic: {
						id: $scope.vm.model.company.id,
						name: $scope.vm.model.company.name,
						info: $scope.vm.model.company.additional
					},
					departmentNames: $scope.vm.model.departmentNames,
					hasActiveDirectory: $scope.vm.model.hasActiveDirectory,
					isDefault: $scope.vm.model.isDefault,
					audit:{}
				};

				adminDataSvc
					.saveCompanyBasic(model)
					.then(function (result) {

						uiSvc.showExtraSmallPopup(
							'Basic Information',
							'The Basic Information has been Updated Successfully !',
							5000
						);

						// re-initialize the screen
						$scope.vm.functions.initializeStep(
							bootValidatorOptions,
							field_validation,
							updateFunction,
							null,
							null
						);
						var formElement = $(divElement).first();
						$scope.vm.functions.stepContentLoaded(formElement);
					})
					.catch(function (err) {
						$log.error('Unable to Update Basic Information', err);
					});/**/
			};

			// initialize the step
			$scope.deptError = 0;
			$scope.vm.functions.initializeStep(bootValidatorOptions, field_validation, updateFunction, null, null);

			$scope.checkDept = function () {
				// routine to update the value of the hidden field
				$scope.vm.state.step.validator.revalidateField('hiddenDept');
			};

			$scope.$on('$viewContentLoaded', function () {
				// when the DOM has loaded initialize BV
				$timeout(function () {
					let getDepartmentNames = [];
					lodash.map($scope.vm.model.company.departments, function (record) {
						getDepartmentNames.push(record.name);
					});
					$scope.vm.model['departmentNames'] = getDepartmentNames;

					var formElement = $(divElement).first();
					$scope.vm.functions.stepContentLoaded(formElement);
				}, 500);
			});
		}
	]);
});
