/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardADDialog.js
 /// Controller popup dialog for Active directory edit
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Chris Potgieter
 /// Date: 24/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('companyWizardADDialog', [
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
			_this.dataModel = _this.dialogData;

			_this.stateInfo = {};
			_this.stateInfo.elementId = 'adForm';

			_this.stateInfo.fields = {
				fields: {
					domain: {
						excluded: false,
						group: '#div_domain',
						validators: {
							notEmpty: {
								message: 'Domain cannot be empty'
							},
							callback: {
								message: 'Domain already already exists on this Company',
								callback: function (value, validator, $field) {
									var found = lodash.find(_this.dialogData.rows, function (dataObject) {
										return dataObject.domain === value && _this.dataModel.newRecord;
									});
									if (found) {
										return false;
									}
									return true;
								}
							}
						}
					},
					host: {
						excluded: false,
						group: '#div_host',
						validators: {
							notEmpty: {
								message: 'Host cannot be empty'
							}
						}
					},
					nameString: {
						excluded: false,
						group: '#div_nameString',
						validators: {
							notEmpty: {
								message: 'Distinguished Name cannot be empty'
							}
						}
					},
					searchString: {
						excluded: false,
						group: '#div_searchString',
						validators: {
							notEmpty: {
								message: 'User Search Criteria cannot be empty'
							}
						}
					},
					ldapLogin: {
						excluded: false,
						group: '#div_ldapLogin',
						validators: {
							notEmpty: {
								message: 'LDAP Login cannot be empty'
							}
						}
					},
					ldapPassword: {
						excluded: false,
						group: '#div_ldapPassword',
						validators: {
							notEmpty: {
								message: 'LDAP Password cannot be empty'
							}
						}
					},
					hiddenValidation: {
						excluded: true
					}
				}
			};

			_this.functions.onSaveRecord = function (record) {
				record.code = _this.dataModel.domain;
				return record;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Active Directory Domain');
		}
	]);
});
