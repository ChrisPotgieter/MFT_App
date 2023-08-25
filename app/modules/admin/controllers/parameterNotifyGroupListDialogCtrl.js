define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyGroupListDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',

		function (
			$uibModalInstance,
			cacheDataSvc,
			dialogData,
			uiSvc,
			$scope,
			adminDataSvc,
			$timeout,
			userSvc
		) {
			var _this = this;
			_this.functions = {};
			_this.model = { gridData: [], flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmGroupCode';
			var companyId = userSvc.getOrgInfo().companyId;

			_this.stateInfo.fields = {
				fields: {
					code: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Code is Required'
							},
							callback: {
								message: 'Code already exists',
								callback: function (value, validator, $field) {
									var found = lodash.find(dialogData, function (record) {
										return record.code === value && record.recordStatus != uiSvc.editModes.DELETE;
									});
									if (found) {
										return true;
									}
									return false;
								}
							}
						}
					},
					description: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Description is Required'
							}
						}
					},
					hiddenValidation: {
						excluded: false,
						validators: {
							callback: {
								message: 'A Notification Group requires at least one Receipient',
								callback: function (value, validator, $field) {
									var valid =
										dialogData.row.jsonData.endPoints.length +
											dialogData.row.jsonData.queues.length +
											dialogData.row.jsonData.roles.length +
											dialogData.row.jsonData.users.length >
										0;
									return valid;
								}
							}
						}
					}
				}
			};

			_this.functions.checkUpdateUsers = function () {
				var modelInclude = {
					listFilterType: 1, //users in the list and in the company
					companyId: companyId,
					userList: _this.dataModel.jsonData.users
				};
				//get all user assigned, compare and take away
				adminDataSvc
					.findUsers(modelInclude)
					.then(function (result) {
						_this.model.includedUsersServer = result;
						_this.model.users = lodash.map(result, function (user) {
							console.log(user);
							return { id: user.id, caption: user.name, emailAddress: user.emailAddress };
						});
					})
					.catch(function (err) {
						$log.error('Unable to find users for Company', err);
					});

				var modelExclude = {
					listFilterType: 0, //users in company but not in list
					companyId: companyId,
					userList: _this.dataModel.jsonData.users
				};
				//Get all users excluded ,campare and takeaway
				adminDataSvc
					.findUsers(modelExclude)
					.then(function (result) {
						_this.model.excludedUsersServer = result;
						_this.model.excludedUsers = lodash.map(result, function (user) {
							return { id: user.id, caption: user.name, emailAddress: user.emailAddress };
						});
					})
					.catch(function (err) {
						$log.error('Unable to find users for Company', err);
					});
			};

			//Check available roles ,assigned roles ,capare and remove
			_this.functions.checkUpdateRole = function () {
				_this.model.allRoles = cacheDataSvc.getListForType('1', 'ROLE');
				// update the role lists
				_this.model.roles = lodash.map(_this.dataModel.jsonData.roles, function (role) {
					var record = lodash.find(_this.model.allRoles, { code: role });
					//Get index for all roles to use description in roles
					let findRoleIndex = lodash.findIndex(_this.model.allRoles, function (o) {
						return o.additional == role;
					});
					console.log( _this.model.allRoles)
					return { id: role, caption: _this.model.allRoles[findRoleIndex].description };
				});
				var exclusions = lodash.filter(_this.model.allRoles, function (role) {
					var record = lodash.find(_this.model.roles, { id: role.code });
					return record == null;
				});
				// update the role lists
				_this.model.excludedRoles = lodash.map(exclusions, function (role) {
					return { id: role.code, caption: role.description };
				});
			};

			_this.functions.swap = function (id, removeList1, addList1, removeList2, addList2) {
				// routine to manage the list swaps
				var element = lodash.find(removeList1, { id: id });
				if (element != null) {
					addList1.push(element); // add to the server included list
					if (addList2) {
						if (element.name)
							addList2.push({ id: element.id, caption: element.name }); // add to the client included list
						else addList2.push({ id: element.id, caption: element.description }); // add to the client included list
					}
					lodash.remove(removeList1, { id: id }); // remove the client excluded list
					if (removeList2) lodash.remove(removeList2, { id: id }); // remove from the server excluded list
				}
			};

			// setup Users dialog
			let dialogUserDetails = {
				template: 'app/modules/admin/partials/parameter-notify-userEditDialog.tpl.html',
				controller: 'parameterNotifyUserEditDialogCtrl',
				alias: 'vmDialog'
			};
			_this.functions.showUserDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogUserDetails,
				'User'
			);

			// setup Roles dialog
			let dialogRolesDetails = {
				template: 'app/modules/admin/partials/parameter-notify-rolesEditDialog.tpl.html',
				controller: 'parameterNotifyRolesEditDialogCtrl',
				alias: 'vmDialog',
				size: 'sm'
			};
			_this.functions.showRoleDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogRolesDetails,
				'Roles'
			);

			//OPen user dialog
			_this.functions.insertUserRecord = function () {
				var record = {
					excludedUsersServer: _this.model.excludedUsersServer,
					includedUsersServer: _this.model.includedUsersServer,
					excludedUsers: _this.model.excludedUsers,
					users: _this.model.users,
					rowId: -1,
					recordStatus: uiSvc.editModes.INSERT,
					isNew: true,
					newRecord: true
				};
				_this.model.gridData = _this.model.users;
				_this.functions.showUserDialog(record);
			};

			_this.functions.editUserRecord = function (record) {
				record.rowId = 2;
				record.code = record.caption;
				 _this.functions.showUserDialog(record);
			};

			//OPen role dialog
			_this.functions.addRolesRecord = function () {
				var record = {
					excludedRoles: _this.model.excludedRoles,
					roles: _this.model.roles,
					recordStatus: uiSvc.editModes.INSERT,
					rowId : -1
				};

				_this.model.gridData = _this.model.roles;
				_this.functions.showRoleDialog(record);
			};

			_this.functions.editRolesRecord = function (record) {
				record.code = record.caption;
				record.rowId = 2;
				_this.functions.showRoleDialog(record);
			};

			_this.functions.initializeGrid = function () {
				_this.model.userGridOptions = {
					sortable: true,
					groupable: false,
					filterable: true,
					columnMenu: true,
					resizable: false,
					pageable: {
						pageSizes: true
					},
					selectable: 'row',

					dataSource: {
						data: [],
						pageSize: 10,
						sort: [ { field: 'caption' } ],
						schema: {
							model: {
								id: 'id',
								uid: 'id',
								fields: {
									id: { type: 'string', from: 'id' },
									caption: { type: 'string', from: 'caption' },
									emailAddress: { type: 'string', from: 'emailAddress' }
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
							field: 'caption',
							title: 'User',
							hidden: false
						},
						{
							field: 'emailAddress',
							title: 'Email Address',
							hidden: false
						}
					],

					dataBound: function (e) {
						var grid = this;
						uiSvc.dataBoundKendoGrid(grid);
					}
				};

				_this.model.rolesGridOptions = {
					sortable: true,
					groupable: false,
					filterable: true,
					columnMenu: true,
					resizable: false,
					pageable: {
						pageSizes: true
					},
					selectable: 'row',

					dataSource: {
						data: [],
						pageSize: 10,
						sort: [ { field: 'caption' } ],
						schema: {
							model: {
								id: 'id',
								uid: 'id',
								fields: {
									id: { type: 'string', from: 'id' },
									caption: { type: 'string', from: 'caption' }
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
							field: 'caption',
							title: 'Roles Currently Assigned',
							hidden: false
						}
					],
					dataBound: function (e) {
						var grid = this;
						uiSvc.dataBoundKendoGrid(grid);
					}
				};
			};

			_this.functions.initializeRecord = function () {
				_this.dataModel = dialogData.row;
				_this.functions.initializeGrid();
				//_this.functions.checkUpdateUsers();
			//	_this.functions.checkUpdateRole();
			};


			_this.functions.onSaveRecord = function () {
				// update the row
				_this.dataModel.jsonData.users = lodash.map(_this.model.users, function (user) {
					return user.id;
				});

				_this.dataModel.jsonData.roles = lodash.map(_this.model.roles, function (role) {
					return role;
				});
				return _this.dataModel;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Notification Recipients');
		}
	]);
});
