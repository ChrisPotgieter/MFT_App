define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyRolesEditDialogCtrl', [
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
			_this.stateInfo.elementId = 'roleSelected';

			_this.functions.initializeRecord = function () {
				_this.model.selectedRoles = {};
				_this.functions.initializeGrid();
				_this.functions.checkForDuplicates();
			};

			_this.stateInfo.fields = {
				hiddenValidation: {
					excluded: true
				}
			};

			_this.functions.initializeGrid = function () {
				if(_this.dataModel.rowId === -1){
				_this.model.roleGridOptions = {
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
							field: 'select',
							title: 'Select',
							width: '80px',
							template: function (record) {
								console.log(record);
								return (
									'<input type="checkbox" name="roleCheckbox[]" ng-model="vmDialog.model.selectedRoles[\'' +
									record.id +
									'\']">'
								);
							}
						},
						{
							field: 'caption',
							title: 'Roles Available',
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
				if ($scope.roleGrid === widget) {
					let grid = $scope.roleGrid;
					grid.dataSource.data(_this.dataModel.excludedRoles);
				}
			});

			//remove all duplicate that are in exluded roles from list of roles
			_this.functions.checkForDuplicates = function () {
				dialogData.rows.map(function (role, index) {
					var element = lodash.find(_this.dataModel.excludedRoles, { id: role.id });
					if (element != null && element.id === role.id) {
						lodash.remove(_this.dataModel.excludedRoles, { id: role.id });
					}
				});
			};

			_this.functions.userDelete = function () {
				// routine to confirm deletion of of the row
				console.log(_this.dataModel);
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
					_this.dataModel.caption +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to remove this role ?',
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
				console.log(_this.model.selectedRoles);
				const rolesSelected = Object.entries(_this.model.selectedRoles);

				rolesSelected.map(function (roleS, indexU) {
					var element = lodash.find(_this.dataModel.excludedRoles, { id: roleS[0] });
					_this.dialogData.rows.push(element);
				});
				_this.functions.checkForDuplicates();
				_this.functions.cancelRecord();
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Roles');
		}
	]);
});
