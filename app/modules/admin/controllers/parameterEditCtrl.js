/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardMainCtrl.js
 /// Controller to manage Company Wizard
 /// This state is the base state for the company wizard and will manage all data and functions for the entire company wizard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/02/2017
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'appCustomConfig', 'bootstrap-validator' ], function (
	module,
	lodash,
	appCustomConfig
) {
	'use strict';
	module.registerController('parameterEditCtrl', [
		'$scope',
		'$state',
		'$stateParams',
		'$log',
		'cacheDataSvc',
		'adminDataSvc',
		'uiSvc',
		'userSvc',
		function ($scope, $state, $stateParams, $log, cacheDataSvc, adminDataSvc, uiSvc, userSvc) {
			// setup the options available for configuration
			var _this = this;

			// add the initial data
			_this.model = {};
			_this.selector = { record: null, selected: null, options: [] };
			_this.state = { form: { hasChanged: false } };

			var options = [];
			options.push({
				code: 'PurgeDays',
				description: 'Data Retention Settings',
				state: 'retention',
				title: 'Data Retention Settings',
				info: 'Data Retention Settings - These settings describe How long to Retain Data Prior to Purging',
				icon: 'fa-archive',
				allowSave: true,
				height: '430px'
			});
			options.push({
				code: 'CustomerInfo',
				description: 'Environment Settings',
				state: 'env',
				title: 'Environment Information',
				info: 'These settings describe the current System Environment',
				icon: 'fa-cogs',
				allowSave: true,
				height: '370px'
			});
			options.push({
				code: 'EmailInfo',
				description: 'SMTP Settings',
				state: 'smtp',
				title: 'SMTP Information',
				info:
					'Please provide your mail-server connectivity Information so that Mail Notifications can be Delivered',
				icon: 'fa-envelope',
				allowSave: true,
				height: '250px'
			});
			options.push({
				code: 'WMQ',
				description: 'Default WMQ Connection Settings',
				state: 'wmq',
				title: 'Default Websphere MQ Information',
				info: 'Please provide the default WMQ Connection Details',
				icon: 'desktop',
				allowSave: true
			});
			options.push({
				code: 'SPEServer',
				description: 'ITXA Connection Settings',
				state: 'spe',
				title: 'ITXA Connection Information',
				info: 'Please provide the Connection Information to connect to ITXA',
				icon: 'fa-exchange',
				allowSave: true,
				security: [ 'spe' ]
			});
			options.push({
				code: 'TemplateGroup',
				description: 'Notification Templates',
				state: 'templateGroup',
				title: 'Notification Template Groups',
				info: 'Please configure Notification Template Groups',
				icon: 'fa-file-text',
				allowSave: false
			});
			options.push({
				code: 'NotificationGroup',
				description: 'Notification Recipients',
				state: 'notifyGroup',
				title: 'Notification Recipient Groups',
				info: 'Please configure Notification Recipient Groups',
				icon: 'fa-bell-o',
				allowSave: false
			});
			options.push({
				code: 'NotificationRule',
				description: 'Notification Rules',
				state: 'notifyRule',
				title: 'Notification Rules',
				info: 'Please configure Notification Rules',
				icon: 'fa-bell',
				allowSave: false
			});
			options.push({
				code: 'DynamicTable',
				description: 'Dynamic Table Configurations',
				state: 'dynamicTable',
				title: 'Dynamic Table Configurations',
				info: 'Please configure Dynamic Table Configurations',
				icon: 'fa-table',
				allowSave: false,
				security: [ 'spe' ]
			});
			options.push({
				code: 'IIBJob',
				description: '[Module_Desc] Jobs',
				state: 'iib_job',
				title: '[Module_Desc] Job Configurations',
				info: 'Please configure [Module_Desc] Job Name Settings',
				icon: 'fa-list-alt',
				allowSave: false,
				security: [ 'iib' ]
			});
			//options.push({code:"IIBApplication", description:"[Module_Desc] Applications", state:"iib_app", title:"[Module_Desc] Application Configurations", info:"Please configure [Module_Desc] Application Settings", icon:"fa-list-alt", allowSave: false, security:["iib"]});
			options.push({
				code: 'EDIDocument',
				description: 'EDI Document Meta-Data Configurations',
				state: 'ediDocument',
				title: 'EDI Document Meta-Data Configurations',
				info: 'Please configure EDI Document Meta-Data Settings',
				icon: 'fa-book',
				allowSave: false,
				security: [ 'spe' ]
			});
			options.push({
				code: 'SLA',
				description: 'Service Level Agreements',
				state: 'sla',
				title: 'Service Level Agreement Classes',
				info: 'Please configure SLA Settings',
				icon: 'fa-book',
				allowSave: false
			});

			// add the custom options
			var record = cacheDataSvc.getParameter('CompanyParameterEdit');
			if (record != null && record.length > 0 && record[0].jsonData.rows.length > 0)
				options = lodash.concat(options, record[0].jsonData.rows);

			// update the module descriptions
			var modules = cacheDataSvc.getBaseModules();
			lodash.forEach(options, function (row) {
				if (!row.security) return;
				var moduleId = row.security[0];
				var module = lodash.find(modules, { code: moduleId });
				if (module != null) {
					var findStr = '[Module_Desc]';
					row.description = row.description.replace(findStr, module.description);
					row.title = row.title.replace(findStr, module.description);
					row.info = row.info.replace(findStr, module.description);
				}
			});

			_this.selector.options = lodash.filter(options, function (row) {
				if (row.security) return userSvc.isAllowed(row.security);
				else return true;
			});

			// add the functions
			_this.functions = {};
			_this.functions.onOptionSelect = function () {
				// routine to manage the users selection of another option
				if (!_this.state.form.hasChanged) {
					// now validation necessary - just go back to the previous step
					_this.functions.navigate();
					return;
				}
				else {
					var confirmAbandon = function (ButtonPressed) {
						// routine to handle the logout request from the user
						if (ButtonPressed == 'Yes') {
							_this.functions.navigate();
						}
						else {
							// set things back
							_this.selector.selected = _this.selector.record.code;
						}
					};

					// ask if the user wishes to discard changes
					var html =
						"<i class='fa fa-sign-out txt-color-red'></i>Abort <span class='.txt-color-white'>  Changes </span>";
					uiSvc.showSmartAdminBox(
						html,
						'Are you sure you wish to abandon the Changes made ?',
						'[No][Yes]',
						confirmAbandon
					);
				}
			};
			_this.functions.navigate = function () {
				// routine to navigate when the user has selected a new option
				var record = lodash.find(_this.selector.options, { code: _this.selector.selected });
				_this.selector.record = record;
				var inParent = $state.is('app.admin.parameters');
				if (inParent) $state.go('.' + record.state);
				else $state.go('^.' + record.state);
			};

			_this.functions.initializeSettingWithModel = function (
				model,
				fieldValidationCallback,
				updateCallback,
				formValidationCallback
			) {
				// override for initialization of the the variables required
				_this.model = model;
				_this.state = { form: { hasChanged: false } };
				_this.state.fieldValidationCallback = fieldValidationCallback;
				_this.state.formValidationCallback = formValidationCallback;
				_this.state.updateCallback = updateCallback;
			};
			_this.functions.initializeSettingWithValidator = function (
				bvRules,
				fieldValidationCallback,
				updateCallback,
				formValidationCallback
			) {
				// function called by every step in a company parameter update
				_this.state = { form: { hasChanged: false } };
				_this.state.bvRules = bvRules;
				_this.state.fieldValidationCallback = fieldValidationCallback;
				_this.state.formValidationCallback = formValidationCallback;
				_this.state.updateCallback = updateCallback;
			};

			_this.functions.stepContentLoaded = function (element) {
				// routine to initialize the bootstrap validator once the step content has been loaded and any other form initialization functions
				_this.state.element = element;
				_this.state.form.hasChanged = false;
				if (_this.state.bvRules) {
					_this.state.validator = uiSvc.setupBootstrapValidator(
						_this.state.element,
						_this.state.bvRules,
						function (isError) {
							// if the validator has run the form has changed in some way
							_this.state.form.hasChanged = true;
							_this.state.fieldValidationCallback(isError);
						}
					);
				}
				else _this.state.validator = _this.state.fieldValidationCallback();
			};

			_this.functions.validateForm = function () {
				// routine to validate the form
				_this.state.validator.validate();
				var isValid = _this.state.validator.isValid();
				if (isValid) _this.state.form.flag = uiSvc.formStates.VALID;
				else _this.state.form.flag = uiSvc.formStates.INVALID;
			};

			_this.functions.onSave = function () {
				// routine to manage the saving of the record
				if (_this.state.formValidationCallback) _this.state.formValidationCallback();
				else _this.functions.validateForm();

				// check if the form is valid
				if (_this.state.form.flag == uiSvc.formStates.INVALID) return;

				// call the update
				if (_this.state.updateCallback) _this.state.updateCallback();
				_this.state.form.hasChanged = false;
			};

			_this.functions.initialize = function () {
				// navigate the user to the first step in the wizard
				var inChild = lodash.find(_this.selector.options, function (step) {
					return $state.includes('^.' + step.state);
				});
				if (inChild != null) {
					// navigate to that state
					_this.selector.selected = inChild.code;
					_this.functions.navigate();
				}
			};
			_this.functions.initialize();
		}
	]);
});
