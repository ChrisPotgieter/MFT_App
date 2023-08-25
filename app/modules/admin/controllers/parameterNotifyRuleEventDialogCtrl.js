define([ 'modules/admin/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyRuleEventDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		function (
			$uibModalInstance,
			cacheDataSvc,
			dialogData,
			uiSvc,
			$scope,
			adminDataSvc
		) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = dialogData.row;

			//Add "Create Template" option to template groups
			var createTemplateDropdownOption = [
				{ code: 'Create a New Template Group', description: 'Create a New Template Group' }
			];
			_this.dataModel.lists.templateGroups.unshift.apply(
				_this.dataModel.lists.templateGroups,
				createTemplateDropdownOption
			);

			//Add "Create New Group Code" option to template groups
			var createNotifyGroupDropdownOption = [
				{ code: 'Create New Group Code', description: 'Create New Group Code' }
			];
			_this.dataModel.lists.notificationGroups.unshift.apply(
				_this.dataModel.lists.notificationGroups,
				createNotifyGroupDropdownOption
			);

			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEventEdit';
			_this.stateInfo.fields = {
				fields: {
					template_select: {
						group: '#div_template',
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Template Group Must be Selected'
							}
						}
					},

					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								message: 'An Event must have at least 1 Notification Group',
								callback: function (value, validator, $field) {
									return _this.dataModel.editRow.notifyGroups.length > 0;
								}
							}
						}
					}
				}
			};

			// setup Templates dialog
			let dialogTemplateDetails = {
				template: 'app/modules/admin/partials/parameter-template-group-list-dialog.tpl.html',
				controller: 'parameterTemplateGroupListDialogCtrl',
				alias: 'vmDialog'
			};
			_this.functions.showTemplateDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogTemplateDetails,
				'Templates'
			);

			_this.functions.createTemplate = function () {
				let record = { isDuplicate: false };
				_this.functions.showTemplateDialog(record);
			};

			//Check if template group drop down changes
			$scope.$watch(
				'vmDialog.dataModel.editRow.templateGroup',
				function (newValue, oldValue) {
					if (newValue === 'Create a New Template Group') {
						_this.dataModel.editRow.templateGroup = '';
						_this.functions.createTemplate();
					}
				},
				true
			);


					// setup Templates dialog
					let dialogNotifyGroupDetails = {
						template: 'app/modules/admin/partials/parameter-notify-groupListDialog.tpl.html',
						controller: 'parameterNotifyGroupListDialogCtrl',
						alias: 'vmDialog'
					};
					_this.functions.showNotifyDialog = adminDataSvc.listFunctions.initializeEditDialog(
						_this,
						dialogNotifyGroupDetails,
						'Notification Group'
					);

			_this.functions.createNotifyGroup= function () {
				let record = { };
				_this.functions.showNotifyDialog(record);
			}

			//Check if group code drop down changes
			$scope.$watch(
				'vmDialog.dataModel.editRow.notifyGroups',
				function (newValue, oldValue) {
					//When create group code selected open dialog and clear notifyGroups
					if (newValue.includes('Create New Group Code')) {
						_this.dataModel.editRow.notifyGroups = [];
						_this.functions.createNotifyGroup();
					}
				},
				true
			);

			//Clear rule event(Delete Option)
			_this.functions.confirmDeleteEvent = function (ButtonPressed) {
				if (ButtonPressed == 'Yes') {
					// routine to clear the current event
					var entry = lodash.find(_this.dialogData.rows, {
						eventCode: _this.dataModel.editRow.eventCode
					});
					if (entry != null) {
						entry.notifyGroups = [];
						entry.templateGroup = null;
					}
					_this.functions.cancelRecord();
				}
			};

			//Confirm clear of rule event
			_this.functions.userDelete = function () {
				// routine to confirm clearing of content
				var html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear ?";
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to Clear this Event ? ',
					'[No][Yes]',
					_this.functions.confirmDeleteEvent
				);
			};

			//Save Changes made to record
			_this.functions.onSaveRecord = function () {
				var entry = lodash.find(_this.dialogData.rows, { eventCode: _this.dataModel.editRow.eventCode });
				if (entry) {
					entry.notifyGroups = _this.dataModel.editRow.notifyGroups;
					entry.templateGroup = _this.dataModel.editRow.templateGroup;
				}
				_this.functions.cancelRecord();
			};
			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Rule Event');
		}
	]);
});

