/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardADUserCtrl.js
 /// Controller to manage Company Wizard -  User Add and Edit (Active Directory)
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mac Bhyat
 /// Date: 22/02/2017
 /// Modified by Chris more modern version
 /// Date : 09/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardADUserCtrl', [
		'$scope',
		'$timeout',
		'$element',
		'$log',
		'$uibModal',
		'uiSvc',
		'adminDataSvc',
		'cacheDataSvc',
		function ($scope, $timeout, divElement, $log, $uibModal, uiSvc, adminDataSvc, cacheDataSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { gridData: [] };
			var _parentModel = null;

			//<editor-fold desc="Validate Function">
			_this.functions.checkInsertDepts = function () {
				// routine to revalidate the field on bv when the departments changes
				if (
					$scope.$parent.vm.state &&
					$scope.$parent.vm.state.step.validator &&
					_this.model.domainRecord.insertedUsers.length > 0
				) {
					$scope.$parent.vm.state.step.validator.revalidateField('hiddenDept');
				}
			};
			_this.functions.checkInsertRoles = function () {
				// routine to revalidate the field on bv when the departments changes
				if (
					$scope.$parent.vm.state &&
					$scope.$parent.vm.state.step.validator &&
					_this.model.domainRecord.insertedUsers.length > 0
				) {
					$scope.$parent.vm.state.step.validator.revalidateField('hiddenRole');
				}
			};

			_this.functions.onFieldValidated = function (isError) {
				// tell the wizard that the form has changed
				$scope.$parent.vm.state.form.hasChanged = true;
			};

			_this.functions.changeDomain = function (flag) {
				// routine to trigger when the user has changed the domain
				if ($scope.$parent.vm.state.step.validator && flag > 0) {
					// if the validator has been initialized check it
					$scope.$parent.vm.state.step.validator.revalidateField('domainSelect');
					var valid = scope.$parent.vm.state.step.validator.isValid();
					if (!valid) return;
				}
				if (!_this.model.domainSelect) return;
				_this.model.domainRecord = lodash.find(_this.model.domains, { id: _this.model.domainSelect });

				// rebuild the current list
				_this.functions.updateCurrentUserList();
			};
			//</editor-fold>

			_this.functions.updateCurrentUserList = function () {
				// routine to update the current user list when the domain changes or the current list is edited
				_this.model.currentUserList = lodash.filter(_this.model.users, { domain: _this.model.domainRecord.id });
				_this.model.flags.currentUsersFlag.value += 1;
			};
			//<editor-fold desc="Initializing functions">
			_this.functions.initialize = function () {
				// routine to initialize the screen

				_this.model = {
					lastRowId: -1,
					flags: { showAddUser: false, adLoading: false },
					counts: { deleted: 0, inserted: 0, invalid: 0, updated: 0 },
					domains: [],
					addMessage: 'Add Users...',
					domainSelect: null,
					insertSelector: {}
				};

				_parentModel = $scope.$parent.vm.model;
				// create the domain objects
				if (_parentModel.company.active_directory_domains) {
					_this.model.domains = lodash.map(_parentModel.company.active_directory_domains, function (domain) {
						return {
							id: domain.domain,
							roles: [],
							departments: [],
							insertedUsers: [],
							invalidUsers: [],
							userList: []
						};
					});
				}

				// get the roles for this company
				_this.model.roleList = cacheDataSvc.getListForType('1', 'ROLE', _parentModel.company.id);
				_this.model.departmentList = $scope.$parent.vm.functions.getDepartments();
				_this.model.users = _parentModel.users;

				// update the last ids
				_this.model.lastRowId = -1;
				lodash.forEach(_this.model.users, function (record) {
					_this.model.lastRowId++;
					record.rowId = _this.model.lastRowId;
					record.rowStyle = null;
				});

				// update the grid options
				_this.model.flags.currentUsersFlag = { value: 0 };
				_this.model.currentUserGridOptions = {
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
									emailAddress: { type: 'string' },
									domain: { type: 'string' }
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
							field: 'userId',
							title: 'Login Code',
							template: function (dataItem) {
								if (dataItem.domain && dataItem.domain != '')
									return dataItem.domain + '\\' + dataItem.user_id;
								else return dataItem.user_id;
							}
						},
						{
							field: 'roles',
							title: 'Roles',
							template: function (dataItem) {
								if (dataItem.roles) {
									var html = "<ul style='list-style-type: disc'>";
									lodash.forEach(dataItem.roles, function (roleItem) {
										var role = lodash.find(_this.model.roleList, { id: roleItem });
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

				// select the first domain
				if (
					_parentModel.company.active_directory_domains &&
					_parentModel.company.active_directory_domains.length > 0
				) {
					_this.model.domainSelect = _parentModel.company.active_directory_domains[0].domain;
					_this.functions.changeDomain(0);
				}

				_this.functions.buildAddUserList();
			};

			_this.functions.buildAddUserList = function () {
				// routine to rebuild the add user selection list when the the user selects "Add User"
				_this.model.domainRecord.userList = [];
				_this.model.flags.adLoading = true;
				_this.model.adMessage = 'Please Wait...';
				var domain = lodash.find(_parentModel.company.active_directory_domains, {
					domain: _this.model.domainSelect
				});

				_this.model.addGridTitle = ' - [LDAP Filter: ' + domain.search_string + ']';

				// update the add user departments and roles
				adminDataSvc
					.getADUsers(domain, _parentModel.company.id, true)
					.then(function (result) {
						_this.model.domainRecord.userList = result;
						// update the insert selector
						_this.model.insertSelector = {};
						lodash.forEach(_this.model.domainRecord.insertedUsers, function (user) {
							_this.model.insertSelector[user.userId] = true;
						});
						_this.model.addMessage = 'Hide Users...';
						//_this.model.flags.showAddUser = true;
					})
					.catch(function (err) {
						$log.error('Unable to retrieve a List of AD Users', err);
					})
					.finally(function () {
						_this.model.flags.adLoading = false;
					}); /**/
			};
			//</editor-fold>

				var updateFunction = function() {
				// function to run when in non-new company mode and we want to update the database directly
				_this.model.expectedPostCount = _this.model.domains.length;
				_this.model.successPostCount = 0;
				lodash.forEach(_this.model.domains, function (domain) {
					var apiCallModel = {
						users: lodash.filter(_this.model.users, { domain: domain.id }),
						departments: domain.departments,
						roles: domain.roles
					};
					lodash.forEach(domain.insertedUsers, function (user) {
						user.recordStatus = uiSvc.editModes.INSERT; // inserted
						user.domain = domain.id;
						user.id = 0;
						apiCallModel.users.push(user);
					});

				
				
				
				adminDataSvc
						.saveADUsers(_parentModel.company.id, apiCallModel)
						.then(function (result) {
							uiSvc.showExtraSmallPopup(
								'Active Directory Users',
								'The User List for domain ' + domain.id + ' been Updated Successfully !',
								5000
							);

							// check if we can refresh the screen
						//	_this.model.userList = lodash.remove(_this.model.userList, { domain: domain.id });
						//	_this.model.userList = lodash.concat(_this.model.userList, result);
						/*	_this.model.successPostCount++;
							if (_this.model.successPostCount == _this.model.expectedPostCount) {
								_parentModel.users = _this.model.userList;
								$scope.$parent.vm.state.form.hasChanged = false;
								$scope.$parent.vm.state.form.flag = uiSvc.formStates.INDETERMINATE;
								_this.functions.initialize();
							}*/
						})
						.catch(function (err) {
							_this.model.successPostCount++;
							$log.error('Unable to Update Active Directory Users for Domain ' + domain.id, err);
							if (_this.model.successPostCount == _this.model.expectedPostCount) {
								_parentModel.users = _this.model.userList;
								_this.functions.initialize();
							}
						});
				});
				
			};

			//<editor-fold desc="Setting up dialog function">
			//setup user dialog details
			let dialogUserDetails = {
				template: 'app/modules/admin/partials/company-ad-users-wizard-dialog.tpl.html',
				controller: 'companyWizardADUserDialogCtrl',
				alias: 'vmDialog'
			};
			_this.functions.showUserDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogUserDetails,
				'User List'
			);
			_this.functions.insertRecord = function () {
				let users = _this.model.domainRecord.userList;
				_this.functions.buildAddUserList();
				_this.model.gridData = _this.model.currentUserList;
				// routine to add a new row
				let record = {
					newRecord: true,
					recordStatus: uiSvc.editModes.INSERT,
					model: _this.model,
					userList: users
				};
				_this.functions.showUserDialog(record);
			};

			
			_this.functions.showDialog = function (record) {
				// routine to bring up the editing dialog
				var dialogData = {};
				_this.model.gridData = _this.model.currentUserList;
				dialogData = {
					code: record.name,
					recordStatus: uiSvc.editModes.UPDATE,
					rowId: record.rowId,
					users: _this.model.userList,
					roles: _this.model.roleList,
					departments: _this.model.departmentList
				};

				dialogData.record = angular.copy(record);
				dialogData.flags = { allowUserId: record.userId == null, allowRoles: true, adUser: true };

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

			_this.functions.editUser = function (record) {
				// routine to edit the existing user
				record.recordStatus = uiSvc.editModes.UPDATE;
				_this.functions.showDialog(record);
			};

			//</editor-fold>

			$scope.$on('$viewContentLoaded', function () {
				// when the DOM has loaded initialize BV
				$timeout(function () {
					var formElement = $(divElement).first();
					$scope.vm.functions.stepContentLoaded(formElement);
				}, 500);
			});

			$scope.vm.functions.initializeStep(
				_this.functions.onFieldValidated,
				_this.functions.checkInsertDepts,
				_this.functions.checkInsertRoles,
				updateFunction,
				null
			);

			_this.functions.initialize();
		}
	]);
});
