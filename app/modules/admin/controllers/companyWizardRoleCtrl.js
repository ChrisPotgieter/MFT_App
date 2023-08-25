/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardRoleCtrl.js
 /// Controller to manage Company Wizard - Role Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mohammed Helly
 /// Date: 02/02/2017
 /// Reworked for Stablility By: Mac Bhyat
 /// Date: 10/02/2017
/// Made more modern By: Chris Potgieter
 /// Date: 24/01/2023
 /// </summary>
 */
 define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function(module, lodash) {
    'use strict';

    module.registerController('companyWizardRoleCtrl', [
        '$scope',
        '$log',
        '$timeout',
        '$element',
        '$filter',
        'uiSvc',
        'adminDataSvc',
        'cacheDataSvc',
        function($scope, $log, $timeout, divElement, $filter, uiSvc, adminDataSvc, cacheDataSvc) {
            var _this = this;
            _this.model = {
                correctModules: [],
                newFeatureList: []
            };
            _this.functions = {};
            //<editor-fold desc="Validation">
            var field_validation = function(isError) {
                // custom validation processing - nothing to do here as bootstrapvalidator will handle everything
            };

            var form_validation = function() {
                // reset the hidden field and call it again
                $scope.vm.state.step.validator.revalidateField('hiddenRoles');
                $scope.vm.functions.validateForm();
            };

            // setup the form
            var bootValidatorOptions = {
                fields: {
                    hiddenRoles: {
                        excluded: false,
                        validators: {
                            callback: {
                                message: ' ',
                                callback: function(value, validator, $field) {
                                    var valid =
                                        $scope.vm.model.company.roles != null &&
                                        $scope.vm.model.company.roles.length > 0;
                                    if (valid) $scope.formErrorMessage = null;
                                    else $scope.formErrorMessage = 'At least 1 Role is Required for a Company';
                                    return valid;
                                }
                            }
                        }
                    }
                }
            };

            $scope.vm.functions.initializeStep(
                bootValidatorOptions,
                field_validation,
                updateFunction,
                form_validation,
                null
            );

            //</editor-fold>

            //<editor-fold desc="Initialization">
            _this.functions.initializeAdminFramework = function() {
                _this.functions.getCorrectModules();

                //After licensed modules configured , set records
                //New Record before dialog
                _this.functions.initializeNewRecord = function(row) {
                    if (!row.jsonData) row.jsonData = {};
                    if (!row.jsonData.features) row.jsonData.features = [];
                    row.newRecord = true;
                    row.rolesModulesList = _this.model.correctModules;
                    return row;
                };

                // set the record initializer
                _this.functions.initializeRecord = function(item) {
                    if (item.jsonData == null) item.jsonData = {};
                    if (item.jsonData.features == null) item.jsonData.features = [];
                    item.initialized = true;
                    item.rolesModulesList = _this.model.correctModules;
                };




                let titleData = {
                    title: 'Roll List'
                };
                let dialogData = {
                    template: 'app/modules/admin/partials/company-role-wizardDialog.tpl.html',
                    controller: 'companyWizardRoleEditDlgCtrl',
                    alias: 'vmDialog'
                };


                adminDataSvc.listFunctions.initializeListController(_this, 'ROLE', dialogData, titleData);
                _this.model.flags.allowAdd = true;
                _this.model.flags.allowId = false;


                // setup the grid options
                _this.model.gridOptions = {
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
                                    id: {
                                        type: 'number'
                                    },
                                    description: {
                                        type: 'string'
                                    },
                                    items: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    },

                    columns: [{
                            field: 'id',
                            title: 'Id',
                            hidden: true
                        },
                        {
                            field: 'description',
                            title: 'Descriptions'
                        },
                        {
                            field: 'items',
                            title: 'Permissions',
                            template: function(dataItem) {
                                let data = [];
                                let groupByCode;
                                // routine to compare module codes and create new array
                                _this.model.newFeatureList.map(function(f, fIndex) {
                                    dataItem.jsonData.features.map(function(listDataF, index) {
                                        if (listDataF === f.code) {
                                            if (f.jsonData != null && f.jsonData.modules) {
                                                let code = f.jsonData.modules[0];
                                                let moduleCode = f.code;
                                                data.push({
                                                    code: code,
                                                    module: moduleCode
                                                });
                                            } else if ((f.module = "GENERAL")) {
                                                data.push({
                                                    code: "GENERAL",
                                                    module: "GENERAL"
                                                });
                                                return;
                                            } else {
                                                let moduleCode = f.code;
                                                data.push({
                                                    code: "AEGF",
                                                    module: moduleCode
                                                });
                                            }
                                        }
                                    });
                                });

                                //Group array by codes
                                groupByCode = data.reduce((group, data) => {
                                    const {
                                        code
                                    } = data;
                                    group[code] = group[code] ?? [];
                                    group[code].push(data);
                                    return group;
                                }, {});
                                var html = "<ul class='list-inline'>";

                                lodash.forEach(_this.model.correctModules, function(licenseItem, licenseIndex) {
                                    switch (licenseItem.code) {
                                        case "ADMIN":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-blue txt-color-white'>" + (groupByCode.ADMIN ? (groupByCode["ADMIN"].length) : (0)) + '</span></li>';
                                            break;
                                        case "BOOMI":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-blueDark txt-color-white'>" + (groupByCode.BOOMI ? (groupByCode["BOOMI"].length) : (0)) + '</span></li>';

                                            break;
                                        case "IIB":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-purpleDark txt-color-white'>" + (groupByCode.IIB ? (groupByCode["IIB"].length) : (0)) + '</span></li>';

                                            break;
                                        case "MFT":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-orange txt-color-white'>" + (groupByCode.MFT ? (groupByCode["MFT"].length) : (0)) + '</span></li>';

                                            break;
                                        case "SPE":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-orangeDark txt-color-white'>" + (groupByCode.SPE ? (groupByCode["SPE"].length) : (0)) + '</span></li>';

                                            break;
                                        case "AEGF":
                                            html += "<li>" + licenseItem.description + " <span class='badge bg-color-grey txt-color-white'>" + (groupByCode.MODULE_AEGF ? (groupByCode["MODULE_AEGF"].length) : (0)) + '</span></li>';

                                            break;
                                        default:
                                    }
                                });


                                html +=
                                    "<li>Transaction Operations <span class='badge bg-color-purple txt-color-white'>" + (groupByCode.GENERAL ? (groupByCode["GENERAL"].length) : (0)) + '</span></li>';

                                return html;
                            }
                        }

                    ],
                    dataBound: function(e) {
                        var grid = this;
                        uiSvc.dataBoundKendoGrid(grid, _this.functions.editRecord);
                    }
                };
            };

            _this.initialize = function() {
                _this.functions.initializeAdminFramework()
                _this.functions.initialize(false);
            };


            //Get modules that are correspondent to the license
            _this.functions.getCorrectModules = function() {
				adminDataSvc.readEnvironment(null).then(function(promiseResults) {
					_this.licensedModules = promiseResults.licensing.modules;

                    _this.functions.parseModules();
				}).catch(function(err){

				})
            };

			_this.functions.parseModules = function(){
								let correctModules = [];
								//get normal modules
								_this.normalModules = cacheDataSvc.getListForType('0', 'MODULE');
								//get custom Modules
								_this.customModuleType = cacheDataSvc.getListForType('1', 'MODULE', 0);
				
								//loop the license modules and match with cache modules
								//then add to roleModuleList
								lodash.forEach(_this.licensedModules, function(licenseItem, licenseIndex) {
									// normal modules
									lodash.forEach(_this.normalModules, function(normalModuleItem, moduleIndex) {
										if (licenseItem == normalModuleItem.jsonData.identifier) {
											if (
												!correctModules.filter(
													(e) => e.jsonData.identifier === normalModuleItem.jsonData.identifier
												).length > 0
											) {
												correctModules.push(normalModuleItem);
											}
										} /**/
									});
				
									//custom modules
									lodash.forEach(_this.customModuleType, function(customModuleItem, customModuleIndex) {
										//add custom modules to rolesModulesList, if module not there
										if (
											!correctModules.filter(
												(e) => e.jsonData.identifier === customModuleItem.jsonData.identifier
											).length > 0
										) {
											correctModules.push(customModuleItem);
										}
									});
								});
				
								_this.model.features = cacheDataSvc.getListForType("0", "FEATURE");
								_this.model.customFeatures = cacheDataSvc.getListForType("1", "FEATURE", 0, );
				
								_this.model.newFeatureList = _this.model.features.concat(
									cacheDataSvc.getListForType("1", "FEATURE", 0),
								);
				
								_this.model.correctModules = correctModules;
			}




			var updateFunction = function () {
				// function to run when in non-new company mode and we want to update the database directly
                // routine to post the updates to the server
                let rows = lodash.filter(_this.model.gridData, function(record) {
                    return record.rowStyle != undefined && record.rowStyle != null;
                });
                //if nothing saved dont update the system
                if (!rows.length) {
                    return;
                }
            
                adminDataSvc.saveRoles($scope.vm.model.company.id, rows).then(function(result) {
                    uiSvc.showExtraSmallPopup('Role Update', 'The Role(s) been Updated Successfully !', 5000);
            
                    cacheDataSvc.initializeLists(true).then(function(result) {}).catch(function(err) {
                        $log.error('Unable to Update Cache List', err);
                    });
                });
			};

			$scope.$on('$viewContentLoaded', function () {
				// when the DOM has loaded initialize BV
				$timeout(function () {
					var formElement = $(divElement).first();
					$scope.vm.functions.stepContentLoaded(formElement);_this.functions.getCorrectModules();
				}, 500);
                
			});

			$scope.vm.functions.initializeStep(
				bootValidatorOptions,
				field_validation,
				updateFunction,
				form_validation,
				null
			);

			// initialize the screen
			_this.initialize();
 

        }
    ]);
});
