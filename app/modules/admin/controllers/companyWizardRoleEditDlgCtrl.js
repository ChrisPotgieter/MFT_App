/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardRoleEditDlgCtrl.js
 /// Controller to manage Company Wizard - Role Information Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
/// Created By: Chris Potgieter
 /// Date: 24/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardRoleEditDlgCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',

		function ($uibModalInstance, cacheDataSvc, dialogData, uiSvc, $scope, adminDataSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };
			_this.dialogData = dialogData;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmRole';

			_this.functions.initializeGrid = function () {
				_this.model.featureGridOptions = {
					sortable: false,
					groupable: false,
					filterable: false,
					selectable: 'row',
					dataSource: {
						data: [],
						group: [
							{
								field: 'module',
								dir: 'desc'
							}
						],
						schema: {
							model: {
								id: 'code',
								uid: 'code',
								fields: {
									module: { type: 'string' },
									code: { type: 'string' },
									description: { type: 'string' },
									additional: { type: 'string' },
									notes: { type: 'string' }
								}
							}
						}
					},

					columns: [
						{
							field: 'select',
							title: 'Select',
							width: '80px',
							template: function (record) {
								return (
									'<input type="checkbox" name="rolesCheckbox[]" ng-model="vmDialog.model.selectedFeatures[\'' +
									record.code +
									'\']">'
								);
							}
						},
						{
							field: 'module',
							title: 'Module',
							width: '300px',
							hidden: true,
							groupHeaderTemplate: _this.functions.moduleHeaderTemplate
						},
						{
							field: 'code',
							title: 'Code',
							hidden: true
						},
						{
							field: 'description',
							title: 'Description'
						},

						{
							field: 'notes',
							title: 'Notes',
							width: '300px',
							groupable: false,
							attributes: {
								style: 'text-overflow:ellipsis;white-space:nowrap;',
								class: 'notesStatus'
							}
						}
					]
				};
			};

			//validate fields
			_this.stateInfo.fields = {
				fields: {
					code: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Role Code is Required'
							},
							regexp: {
								regexp: '^[a-zA-Z0-9_]{4,}$',
								message: 'Role must contain no spaces or special characters and must be a minimum of 4'
							},
							callback: {
								message: 'Role Code already exists',
								callback: function (value, validator, $field) {
									var found = lodash.find(dialogData.rows, function (record) {
										return (
											record.code.toUpperCase() === value.toUpperCase() &&
											record.recordStatus != uiSvc.editModes.DELETE &&
											record.rowId != _this.dataModel.rowId
										);
									});
									if (found) {
										return false;
									}
									return true;
								}
							}
						}
					},
					description: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Role Name is Required'
							}
						}
					},
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								message: 'A Role requires at least 1 Feature',
								callback: function (value, validator, $field) {
									lodash.forOwn(lodash.pickBy(_this.model.selectedFeatures), function (value, key) {
										_this.dataModel.jsonData.features.push(key);
										if (value === false) {
											const findFeature = _this.dataModel.jsonData.features.indexOf(key);
											_this.dataModel.jsonData.features.splice(
												findFeature,
												findFeature !== -1 ? 1 : 0
											);
										}
									});

									var valid = _this.dataModel.jsonData.features.length > 0;
									return valid;
								}
							}
						}
					}
				}
			};

			// add the tooltips to the grid
			$scope.$on('kendoWidgetCreated', function (event, widget) {
				// when the widget gets created set the data and add the tool tips
				// this cannot use mqa-kendo-grid as for some reason the checkbox binding does not work when using mqa-kendo-grid
				if ($scope.featureGrid === widget) {
					let grid = $scope.featureGrid;
					let licenseData = [];
					 //Filter "licenseData" based on module in license
					 //Loop features and license Modules
					lodash.forEach(_this.model.newFeatureList, function (feature, featureIndex) {
						lodash.forEach(_this.dialogData.row.rolesModulesList, function (roleModule, roleModuleIndex) {
							if (
								feature.module == roleModule.code ||
								feature.module == 'GENERAL' 
								||	feature.module == 'MODULE_AEGF'
							) {
								if (licenseData.filter((e) => e.id === feature.id).length > 0) {
									/*If feature already in licenseData */
								}
								else {
									/* */
									licenseData.push(feature);
								}
							}
						});
					});

					grid.dataSource.data(licenseData);

					uiSvc.addKendoGridTooltip('notesStatus', grid, 'notes');
					uiSvc.addKendoGridTooltip('notesDesc', grid, 'notesDesc');

				}
			});

			//Build Module header , group all by modules
			_this.functions.moduleHeaderTemplate = function (dataItem) {
				let moduleType = cacheDataSvc.getListForType('0', 'MODULE');

				let customModuleType = cacheDataSvc.getListForType('1', 'MODULE', 0);
				//Exclude overrides else add new moduleHeader
				moduleType.map(function (moduleT, indexT) {
					customModuleType.map(function (moduleC, indexC) {
						if (moduleC.code === moduleT.code) {
							moduleType.splice(indexT, 0);
						}
						else {
							//Add custom module if module not exist
							moduleType.push(customModuleType[indexC]);
							if (!moduleType.includes(customModuleType[indexC])) {
								moduleType.push(customModuleType[indexC]);
							}
							return;
						}
					});
				});

				var title = 'Module: ';
				// routine to compare module codes and show the module description
				if (_this.model.newFeatureList.length > 1) {
					moduleType.map(function (module, index) {
						if (!title.includes(module.description)) {
							//Check all variations of module code(Module code in different places in data)

							if (
								(module.code === dataItem.value && dataItem.value != '') ||
								module.jsonData.security[0] === dataItem.value ||
								module.jsonData.security[0] === 'MODULE_' + dataItem.value ||
								'MODULE_' + module.code === dataItem.value
							) {
								title += module.description;
								return;
							}
						}

						if (dataItem.value === 'GENERAL') {
							title = 'Module: Transaction Operation';
						}
					});

					return title;
				}
			};

			//Check Fetures modules/notes and edit
			_this.functions.sortFeatures = function () {
				_this.model.features = cacheDataSvc.getListForType('0', 'FEATURE');

				//custom features and product features combined
				_this.model.newFeatureList = _this.model.features.concat(
					cacheDataSvc.getListForType('1', 'FEATURE', 0)
				);
				_this.model.newFeatureList.map(function (feature, index) {
					if (feature.jsonData != null && feature.jsonData.modules) {
						let module = feature.jsonData.modules[0];
						_this.model.newFeatureList[index]['module'] = module;
					}
					else {
						let module = 'GENERAL';
						_this.model.newFeatureList[index]['module'] = module;
					}

					if (feature.jsonData != null && feature.jsonData.notes) {
						let note = feature.jsonData.notes;
						_this.model.newFeatureList[index]['notes'] = note;
					}
					else {
						_this.model.newFeatureList[index]['notes'] = '';
					}
				});
			};

			_this.functions.initializeRecord = function () {
				// get the selected features
				_this.functions.sortFeatures();
				_this.functions.initializeGrid();
				_this.model.selectedFeatures = {};
				if (_this.dataModel.jsonData.features && !_this.dataModel.jsonData.features != null) {
					lodash.forEach(_this.dataModel.jsonData.features, function (item) {
						_this.model.selectedFeatures[item] = true;
					});
				}
			};

			_this.functions.onSaveRecord = function (record) {
				record.jsonData.features = [];
				lodash.forOwn(lodash.pickBy(_this.model.selectedFeatures), function (value, key) {
					record.jsonData.features.push(key);
				});
				return record;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Role');
			_this.functions.initialize();
		}
	]);
});
