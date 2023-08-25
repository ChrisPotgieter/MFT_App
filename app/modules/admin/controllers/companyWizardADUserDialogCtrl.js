define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardADUserDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'$scope',
		'uiSvc',
		'adminDataSvc',
		'$timeout',
		'userSvc',
		'dialogData',

		function (
			$uibModalInstance,
			cacheDataSvc,
			$scope,
			uiSvc,
			adminDataSvc,
			$timeout,
			userSvc,
			dialogData
		) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = _this.dialogData.row;

			_this.stateInfo = {};
			_this.stateInfo.elementId = 'adUserInsertForm';

			// setup bootstrap validator
			var innerForm = null;
			$uibModalInstance.rendered.then(function () {
				innerForm = $(document.getElementById('adUserInsertForm'));
				var fields = {
					fields: {
						hiddenDept: {
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									message: 'Users must be assigned to at least 1 Department',
									callback: function (value, validator, $field) {
										if (!_this.dataModel.model.domainRecord) return true;
										if (_this.dataModel.model.domainRecord.departments.length > 0) {
											return true;
										}
										else {
											return false;
										}
									}
								}
							}
						},
						hiddenRole: {
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									message: 'Users must be assigned to at least 1 Role',
									callback: function (value, validator, $field) {
										if (!_this.dataModel.model.domainRecord) return true;
										if (_this.dataModel.model.domainRecord.roles.length > 0) {
											return true;
										}
										else {
											return false;
										}
									}
								}
							}
						},

						domainSelect: {
							group: '#div_domain',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Please Select a Domain'
								},
								callback: {
									message: 'Departments or Roles Invalid',
									callback: function (value, validator, $field) {
										// check that there is depts and roles for the if there are users inserted
										var insertCount = _this.dataModel.model.domainRecord.insertedUsers.length > 0;
										if (
											insertCount > 0 &&
											_this.dataModel.model.domainRecord.departments.length == 0
										) {
											return false;
										}
										if (insertCount > 0 && _this.dataModel.model.domainRecord.roles.length == 0) {
											return false;
										}
										return true;
									}
								}
							}
						},
						hiddenValidation: {
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									message: 'At leasts one user must be selected to add',
									callback: function (value, validator, $field) {
										const usersSelected = Object.entries(_this.model.selectedUsers);
										if (usersSelected.length > 0) {
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

				var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
				var fv = innerForm.bootstrapValidator(formOptions);
				_this.form = innerForm.data('bootstrapValidator');
			});

			_this.functions.initializeRecord = function () {
				_this.functions.initializeGrid();
				_this.functions.checkForDuplicates();
			};

			_this.functions.initializeGrid = function () {
				_this.model.selectedUsers = {};

				//populate grid options
				_this.model.addUserGridOptions = {
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
							field: 'select',
							title: 'Select',
							width: '80px',
							template: function (dataItem) {
								return (
									'<input type="checkbox" name="rolesCheckbox[]" ng-model="vmDialog.model.selectedUsers[\'' +
									dataItem.user_id +
									'\']">'
								);
							}
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
						}
					]
				};
			};

			$scope.$on('kendoWidgetCreated', function (event, widget) {
				// when the widget gets created set the data
				// this cannot use mqa-kendo-grid as for some reason the checkbox binding does not work when using mqa-kendo-grid
				if ($scope.addUserGrid === widget) {
					let grid = $scope.addUserGrid;
					grid.dataSource.data(_this.dialogData.row.userList);
				}
			});

			//remove all duplicate that are in currentUsers from list of users
			_this.functions.checkForDuplicates = function () {
				dialogData.rows.map(function (user, index) {
				
					var element = lodash.find(_this.dialogData.row.userList, { emailAddress: user.emailAddress });
					if (element != null && element.emailAddress === user.emailAddress) {
						lodash.remove(_this.dialogData.row.userList, { emailAddress: user.emailAddress });
					}
				});
			};

			_this.functions.updateCounts = function (inserts) {
				if (inserts) {
					// routine to update the insert and invalid counts
					_this.dataModel.model.counts.inserted = 0;
					_this.dataModel.model.counts.invalid = 0;
					lodash.forEach(_this.dataModel.model.domains, function (domain) {
						_this.dataModel.model.counts.inserted += domain.insertedUsers.length;
						_this.dataModel.model.counts.invalid += domain.invalidUsers.length;
					});
				}
			};

			_this.functions.updateInsertList = function (usersChecked) {
				// routine to update the inserted and invalid users as the user chooses from the grid
				_this.dataModel.model.domainRecord.insertedUsers = [];
				_this.dataModel.model.domainRecord.invalidUsers = [];

				lodash.map(usersChecked, function (user) {
					var userRecord = lodash.find(_this.dialogData.row.userList, { user_id: user[0] });

					if (!userRecord.emailAddress || !userRecord.name)
						_this.dataModel.model.domainRecord.invalidUsers.push({ userId: user });
					else {
						_this.dataModel.model.domainRecord.insertedUsers.push(userRecord);
					}
				});

				_this.functions.updateCounts(true);
			};

			//Call function when users checked
			$scope.$watch(
				'vmDialog.model.selectedUsers',
				function (newValue) {
					// work out the insert users and invalid users when the user selection changes
					if (!newValue) return;
					_this.functions.updateInsertList(Object.entries(_this.model.selectedUsers));
				},
				true
			);

			_this.functions.saveRecord = function () {
				// validate entry
				_this.form.validate();
				var valid = _this.form.isValid();
				if (!valid) return;

				const usersSelected = Object.entries(_this.model.selectedUsers);

				usersSelected.map(function (userS, indexU) {
					var userRecord = lodash.find(_this.dialogData.row.userList, { user_id: userS[0] });
					//Update roles and departments
					userRecord.departments = _this.dataModel.model.domainRecord.departments;
					userRecord.roles = _this.dataModel.model.domainRecord.roles;
					userRecord.rowStyle = 'recordInsert';
					if (!userRecord.emailAddress || !userRecord.name) {
						//Dont add anything
					}
					else {
						_this.dialogData.rows.push(userRecord);
					}
				});

				//Remove from one list users
				_this.functions.checkForDuplicates();

				// close the window
				_this.functions.cancelRecord();
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'User');
		}
	]);
});
