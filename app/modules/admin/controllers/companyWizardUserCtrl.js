/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardUserCtrl.js
 /// Controller to manage Company Wizard - Administration User Selection - Non-Active Directory
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Chris Potgieter
 /// Date: 25/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardUserCtrl', [
		'$scope',
		'$log',
		'$timeout',
		'$element',
		'$uibModal',
		'uiSvc',
		'cacheDataSvc',
		'adminDataSvc',
		function ($scope, $log, $timeout, divElement, $uibModal, uiSvc, cacheDataSvc, adminDataSvc) {
			var _this = this;
			_this.functions = {};

			_this.functions.update = function () {
				// function to run when in non-new company mode and we want to update the database directly
				adminDataSvc
					.saveUsers($scope.vm.model.company.id, _this.model.users)
					.then(function (result) {
						$scope.$parent.vm.model.users = result;
						uiSvc.showExtraSmallPopup('Users', 'The User List has been Updated Successfully !', 5000);

						// re-initialize the screen
						$scope.$parent.vm.state.form.hasChanged = false;
						$scope.$parent.vm.state.form.flag = uiSvc.formStates.INDETERMINATE;
						_this.functions.initialize();
					})
					.catch(function (err) {
						$log.error('Unable to Update Users', err);
					});
			};
			_this.functions.validateForm = function () {
				// tell the wizard that the form has changed
				$scope.$parent.vm.state.form.hasChanged = true;
				$scope.$parent.vm.state.form.flag = uiSvc.formStates.VALID;
			};

			_this.functions.addUser = function () {
				// routine to add a new user
				var record = {
					userId: null,
					recordStatus: uiSvc.editModes.INSERT,
					password: null,
					roles: [],
					departments: []
				};
				_this.functions.showDialog(record);
			};

			_this.functions.editUser = function (record) {
				// routine to edit the existing user
				record.recordStatus = uiSvc.editModes.UPDATE;
				_this.functions.showDialog(record);
			};

			_this.functions.showDialog = function (record) {
				// routine to bring up the editing dialog
				var dialogData = {};
				_this.model.gridData = _this.model.users;
				dialogData = {
					code: record.name,
					recordStatus: uiSvc.editModes.UPDATE,
					rowId: record.rowId,
					users: _this.model.users,
					roles: _this.model.roles,
					departments: _this.model.departments
				};

				dialogData.record = angular.copy(record);
				dialogData.flags = { allowUserId: record.userId == null, allowRoles: true, adUser: false };

				//setup user dialog details
				let dialogUserDetails = {
					template: 'app/modules/admin/partials/company-user-edit-wizard-dialog.tpl.html',
					controller: 'companyWizardUserEditDialogCtrl',
					alias: 'vmDialog'
				};
				_this.functions.showUserEditDialog = adminDataSvc.listFunctions.initializeEditDialog(
					_this,
					dialogUserDetails,
					'User List'
				);
				_this.functions.showUserEditDialog(dialogData);
			};

			_this.functions.initialize = function () {
				// routine to initialize the screen
				_this.model = { flags: { userRefreshFlag: { value: 0 } } };
				_this.model.departments = $scope.$parent.vm.functions.getDepartments();
				_this.model.roles = cacheDataSvc.getListForType('1', 'ROLE', $scope.$parent.vm.model.company.id);
				_this.model.users = $scope.$parent.vm.model.users;
				_this.model.lastId = -1;

				//remove user that are not in the same company
				lodash.remove(_this.model.users, function (user) {
					return user.company_id != $scope.$parent.vm.model.company.id;
				});

				lodash.forEach(_this.model.users, function (item, index) {
					_this.model.lastId++;
					item.rowId = index;
					item.rowStyle = null;
				});

				// setup the grid options
				_this.model.userGridOptions = {
					sortable: true,
					groupable: true,
					filterable: true,
					pageable: {
						pageSizes: true
					},
					dataSource: {
						data: [],
						pageSize: 10,
						schema: {
							model: {
								id: 'id',
								uid: 'id',
								fields: {
									id: { type: 'number' },
									userId: { type: 'string' },
									name: { type: 'string' },
									emailAddress: { type: 'string' }
								}
							}
						}
					},

					columns: [
						{
							field: 'id',
							title: 'Id',
							hidden: true
						},
						{
							field: 'name',
							title: 'Name'
						},
						{
							field: 'emailAddress',
							title: 'Email Address'
						},
						{
							field: 'user_id',
							title: 'Login Code'
						},
						{
							field: 'roles',
							title: 'Roles',
							template: function (dataItem) {
								if (dataItem.roles) {
									var html = "<ul style='list-style-type: disc'>";
									lodash.forEach(dataItem.roles, function (roleItem) {
										var role = lodash.find(_this.model.roles, { id: roleItem });
										if (role != null) html += '<li>' + role.description + '</li>';
									});
									html += '</ul>';
									return html;
								}
							}
						}
					],
					dataBound: function (e) {
						var grid = this;
						uiSvc.dataBoundKendoGrid(grid, _this.functions.editUser);
					}
				};
			};

			// initialize the step
			$scope.$on('$viewContentLoaded', function () {
				// when the DOM has loaded initialize BV
				$timeout(function () {
					$scope.$parent.vm.functions.initializeStep(
						null,
						null,
						_this.functions.update,
						_this.functions.validateForm
					);
					var formElement = $(divElement).first();
					$scope.$parent.vm.functions.stepContentLoaded(formElement);
				}, 500);
			});
			_this.functions.initialize();
		}
	]);
});
