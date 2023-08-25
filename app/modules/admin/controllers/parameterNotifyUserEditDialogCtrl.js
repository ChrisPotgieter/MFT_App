define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyUserEditDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',
		'dialogData',

		function (
			$uibModalInstance,
			cacheDataSvc,
			uiSvc,
			$scope,
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
			_this.stateInfo.elementId = 'userSelected';

			//field validation
			_this.stateInfo.fields = {
				fields: {
					hiddenValidation: {
						excluded: true
					}
				}
			};

			_this.functions.initializeRecord = function () {
				_this.functions.initializeGrid();
				_this.functions.checkForDuplicates();
			};

			//remove all duplicate that are in exluded users from list of users
			_this.functions.checkForDuplicates = function () {
				dialogData.rows.map(function (user, index) {
					var element = lodash.find(_this.dataModel.excludedUsers, { id: user.id });
					if (element != null && element.id === user.id) {
						lodash.remove(_this.dataModel.excludedUsers, { id: user.id });
					}
				});
			};

			_this.functions.initializeGrid = function () {
				_this.model.selectedUsers = {};
				//populate grid options
				if (_this.dataModel.rowId === -1) {
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
								field: 'select',
								title: 'Select',
								width: '80px',
								template: function (record) {
									return (
										'<input type="checkbox" name="userCheckbox[]" ng-model="vmDialog.model.selectedUsers[\'' +
										record.id +
										'\']">'
									);
								}
							},
							{
								field: 'caption',
								title: 'Users Available',
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
				}
			};

			$scope.$on('kendoWidgetCreated', function (event, widget) {
				// when the widget gets created set the data
				// this cannot use mqa-kendo-grid as for some reason the checkbox binding does not work when using mqa-kendo-grid
				if ($scope.userGrid === widget) {
					let grid = $scope.userGrid;
					grid.dataSource.data(_this.dataModel.excludedUsers);
				}
			});

			_this.functions.userDelete = function () {
				// routine to confirm deletion of of the row
				console.log(_this.dataModel);
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
					_this.dataModel.caption +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to remove this User ?',
					'[No][Yes]',
					_this.functions.confirmDelete
				);
			};

			_this.functions.confirmDelete = function (ButtonPressed) {
				// routine to handle the delete request from the user
				if (ButtonPressed == 'Yes') {
					var element = lodash.find(_this.dialogData.rows, { id: _this.dataModel.id });
					lodash.remove(_this.dialogData.rows, { id: element.id });
					_this.functions.cancelRecord();
				}
			};

			_this.functions.saveRecord = function () {
				const usersSelected = Object.entries(_this.model.selectedUsers);

				usersSelected.map(function (userS, indexU) {
					var element = lodash.find(_this.dataModel.excludedUsers, { id: parseInt(userS[0]) });
					_this.dialogData.rows.push(element);
				});

				_this.functions.cancelRecord();
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'User');
		}
	]);
});
