/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardADCtrl.js
 /// Controller to manage Company Wizard - Active Directory Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mohammed Helly
 /// Date: 02/02/2017
 /// Reworked for Stablility By: Mac Bhyat
 /// Date: 12/02/2017
  /// Updated to modern version By:Chris Potgieter
 /// Date: 24/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardADCtrl', [
		'$scope',
		'$timeout',
		'$element',
		'$compile',
		'$log',
		'uiSvc',
		'adminDataSvc',
		'cacheDataSvc',
		function ($scope, $timeout, divElement, $compile, $log, uiSvc, adminDataSvc, cacheDataSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { loaded: 0 }, data: {} };

			_this.functions.initialize = function () {
				//Build the grid
				_this.functions.initializeGrid();

				//add rowIds to GridData
				for (var i = 0; i < $scope.vm.model.company.active_directory_domains.length; i++) {
					$scope.vm.model.company.active_directory_domains[i].rowId = i;
				}
				_this.model.gridData = $scope.vm.model.company.active_directory_domains;
			};

			// setup the form
			var bootValidatorOptions = {
				fields: {
					hiddenDomains: {
						excluded: false,
						validators: {
							callback: {
								message: ' ',
								callback: function (value, validator, $field) {
									var valid = $scope.vm.model.domains != null && $scope.vm.model.domains.length > 0;
									if (valid) $scope.formErrorMessage = null;
									else
										$scope.formErrorMessage =
											'At least One Domain is Required for a Company using Active Directory Validation';
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

			var form_validation = function () {
				// reset the hidden field and call it again
				$scope.vm.state.step.validator.revalidateField('hiddenDomains');
				$scope.vm.functions.validateForm();
			};

			var updateFunction = function () {
				// function to run when in non-new company mode and we want to update the database directly
				// routine to post the updates to the server
				let rows = lodash.filter(_this.model.gridData, function (record) {
					return record.recordStatus != 99;
				});
				console.log(rows)
				adminDataSvc
					.saveCompanyAD($scope.vm.model.company.id, rows)
					.then(function (result) {
						$scope.vm.model.domains = result;
						//	_this.functions.updateDisplay();
						uiSvc.showExtraSmallPopup(
							'Active Directory Information',
							'The Active Directory Information has been Updated Successfully !',
							5000
						);

						// re-initialize the form
						$scope.vm.functions.initializeStep(
							bootValidatorOptions,
							field_validation,
							updateFunction,
							form_validation,
							null
						);
						var formElement = $(divElement).first();
						$scope.vm.functions.stepContentLoaded(formElement);
					})
					.catch(function (err) {
						$log.error('Unable to Update Active Directory Information', err);
					});
			};

			// initialize the variables
			_this.functions.initializeGrid = function () {
				_this.model.formErrorMessage = null;
				_this.model.adGridOptions = {
					sortable: true,
					groupable: false,
					filterable: true,
					resizable: true,
					selectable: 'row',
					noRecords: true,
					pageable: {
						pageSizes: true
					},
					dataSource: {
						data: [],
						pageSize: 10,
						schema: {
							model: {
								id: 'domain',
								uid: 'domain',
								fields: {
									domain: { type: 'string' },
									connection: { type: 'string' }
								}
							}
						}
					},

					columns: [
						{
							field: 'domain',
							title: 'Domain',
							width: '200px'
						},
						{
							field: 'connection',
							title: 'LDAP Connection',
							template: function (dataItem) {
								return 'LDAP://' + dataItem.host + '/' + dataItem.name_string;
							}
						}
					],
					dataBound: function (e) {
						var grid = this;

						uiSvc.dataBoundKendoGrid(grid, $scope.editRecord);
					}
				};
			};

			$scope.vm.functions.initializeStep(
				bootValidatorOptions,
				field_validation,
				updateFunction,
				form_validation,
				null
			);
			// setup Active Directory dialog
			let dialogActiveDirectoryDetails = {
				template: 'app/modules/admin/partials/company-ad-wizard-dialog.tpl.html',
				controller: 'companyWizardADDialog',
				alias: 'vmDialog'
			};
			_this.functions.showActiveDirectoryDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogActiveDirectoryDetails,
				'Active Directory'
			);

			_this.functions.insertRecord = function () {
				// routine to add a new row
				_this.model.lastId = _this.model.gridData.length;
				let record = {
					//    searchString: cacheDataSvc.getParameter('DefaultADSearchString')[0].value,
					newRecord: true,
					recordStatus: uiSvc.editModes.INSERT
				};
				_this.functions.showActiveDirectoryDialog(record);
			};

			_this.functions.editRecord = function (record) {
				// routine to edit the row
				record.newRecord = false;
				record.code = record.domain;
				record.recordStatus = uiSvc.editModes.UPDATE;
				_this.functions.showActiveDirectoryDialog(record);
			};

			//</editor-fold>

			$scope.$on('$viewContentLoaded', function () {
				// when the DOM has loaded initialize BV
				$timeout(function () {
					var formElement = $(divElement).first();
					$scope.vm.functions.stepContentLoaded(formElement);
				}, 500);
			});

			$scope.$on('kendoWidgetCreated', function (event, widget) {
				// when the widget gets created set the data or watch the data variable for changes
				if ($scope.adGrid === widget) {
					if ($scope.vm.model) _this.functions.updateDisplay();
				}
			});

			_this.functions.updateDisplay = function () {
				// routine to update the grid display
				$scope.adGrid.dataSource.data($scope.vm.model.domains);
			};

			_this.functions.initialize();
		}
	]);
});
