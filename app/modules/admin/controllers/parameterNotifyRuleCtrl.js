/*
 /// <summary>
 /// app.modules.admin.controllers - parameterNotifyRuleCtrl.js
 /// Controller to manage Editing of Notification Rules in a Stand-alone mode
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/07/2017
/// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
 define([ 'modules/admin/module', 'lodash', 'bootstrap-validator' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterNotifyRuleCtrl', [
		'$scope',
		'$log',
		'$timeout',
		'adminDataSvc',
		'uiSvc',
		'userSvc',
		'cacheDataSvc',
		function ($scope, $log, $timeout, adminDataSvc, uiSvc, userSvc, cacheDataSvc) {
			var _this = this;

			// add the initial data
			_this.model = {
				gridData: [],
				data: { companyId: userSvc.getOrgInfo().companyId, bvEvent: {} },
				lists: { groupType: [], groupCode: [] },
				flags: { showEdit: false, showGroupCodeSelect: false, eventEdit: false }
			};
			_this.functions = [];

			var confirmDelete = function (ButtonPressed) {
				// routine to handle the delete request from the user
				if (ButtonPressed == 'Yes') {
					_this.functions.deleteRecord();
				}
			};

			var initialize = function () {
				// initialize the the list to display

				var parameters = cacheDataSvc.getParameter('NotificationRuleList');
				if (parameters.length == 0) {
					uiSvc.showError('Notification System', 'Notification Rule List not Configured');
					return;
				}
				_this.model.data.notificationRules = lodash.cloneDeep(parameters[0]);

				// add any "system based" notification rules
				let systemList = cacheDataSvc.getListForType('0', 'NotificationRuleList');
				lodash.remove(systemList, { code: 'TRANSACTION' });
				lodash.forEach(systemList, function (record) {
					lodash.forEach(record.jsonData.rules, function (ruleRecord) {
						_this.model.data.notificationRules.jsonData.rules.push(ruleRecord);
					});
				});

				// now remove the rules that don't match the modules
				_this.model.data.notificationRules.jsonData.rules = lodash.filter(
					_this.model.data.notificationRules.jsonData.rules,
					function (row) {
						if (row.security) return userSvc.isAllowed(row.security);
						else return true;
					}
				);
				_this.model.lists.groupType = lodash.map(_this.model.data.notificationRules.jsonData.rules, function (
					rule
				) {
					return { code: rule.code, description: rule.description };
				});
			};

			_this.functions.getSubGroups = function (search) {
				// routine to allow the sub groups to have free text
				var newSubGroup = _this.model.lists.groupCode.slice();
				if (search && newSubGroup.indexOf(search) === -1) {
					newSubGroup.unshift(search);
				}
				return newSubGroup;
			};

			_this.functions.onGroupTypeChange = function () {
				// routine to build up the selector for the group code based on the group type
				_this.model.data.record = null;
				_this.model.data.groupCode = null;

				if (_this.model.data.groupType == null) {
					_this.model.flags.showEdit = false;
					_this.model.flags.showGroupCodeSelect = false;
					_this.model.flags.eventEdit = false;
					return;
				}
				var selectedGroup = lodash.find(_this.model.data.notificationRules.jsonData.rules, {
					code: _this.model.data.groupType
				});
				if (selectedGroup != null) {
					if (selectedGroup.groupInfo != null) {
						_this.model.lists.groupCode = [];
						if (selectedGroup.groupInfo.additionalOptions) {
							lodash.forEach(selectedGroup.groupInfo.additionalOptions, function (option) {
								_this.model.lists.groupCode.push({ code: option, description: option });
							});
						}
						if (selectedGroup.groupInfo.companyId && selectedGroup.groupInfo.listType) {
							var items = [];
							if (selectedGroup.groupInfo.companyId == -1)
								items = cacheDataSvc.getListForType('1', selectedGroup.groupInfo.listType);
							else
								items = cacheDataSvc.getListForType(
									'1',
									selectedGroup.groupInfo.listType,
									selectedGroup.groupInfo.companyId
								);
							lodash.forEach(items, function (item) {
								_this.model.lists.groupCode.push({ code: item.code, description: item.description });
							});
						}

						// finally add the existing rules
						var items = cacheDataSvc.getListForType(
							'1',
							'NotificationRule',
							selectedGroup.groupInfo.companyId
						);
						items = lodash.filter(items, function (record) {
							return record.code.startsWith(selectedGroup.code);
						});
						lodash.forEach(items, function (item) {
							var code = item.code.replace(selectedGroup.code + '@', '');
							var found = lodash.find(_this.model.lists.groupCode, { code: code });
							if (found == undefined) _this.model.lists.groupCode.push({ code: code, description: code });
						});
					}
				}
				_this.model.flags.showEdit = false;
				_this.model.flags.showGroupCodeSelect = true;

				// if there is only one option select it and move on
				if (_this.model.lists.groupCode.length == 1) {
					_this.model.data.groupCode = _this.model.lists.groupCode[0].code;
					_this.functions.onGroupCodeChange();
				}
			};

			_this.functions.updateRecordDisplay = function () {
				// routine to update the record display
				_this.model.data.record.isNew = _this.model.data.record.recordStatus == uiSvc.editModes.INSERT;

				// update the button text
				_this.model.data.buttonText = 'Create';
				if (_this.model.data.record.recordStatus == uiSvc.editModes.UPDATE)
					_this.model.data.buttonText = 'Save';

				// set the flags
				_this.model.flags.eventEdit = false;
				_this.model.flags.showEdit = true;
			};

			_this.functions.onGroupCodeChange = function (value) {
				// manage the screen
				_this.model.data.record = null;
				if (_this.model.data.groupCode == null) {
					_this.model.flags.showEdit = false;
					_this.model.flags.eventEdit = false;
					return;
				}
				console.log(	_this.model.data.companyId,
					_this.model.data.groupType,
					_this.model.data.groupCode)
				// get the event list
				adminDataSvc
					.readNotificationRule(
						_this.model.data.companyId,
						_this.model.data.groupType,
						_this.model.data.groupCode
					)
					.then(function (result) {
						// update the display
						var isShown = _this.model.flags.showEdit;
						_this.model.data.record = result;
						_this.functions.updateRecordDisplay();

						// trigger a refresh if the grid is already shown (this will force a grid recreate)
						if (isShown) {
							_this.model.flags.showEdit = false;
							$timeout(function () {
								_this.model.flags.showEdit = true;
							}, 500);
						}
					})
					.catch(function (err) {
						$log.error('Unable to read Notification Rule', err);
					});
			};

			_this.functions.toggleEventEdit = function (isEditing) {
				_this.model.flags.eventEdit = isEditing;
			};

			//<editor-fold desc="Record Management Functions">
			_this.functions.cancelRecord = function () {
				// clear the screen
				_this.model.data.groupType = null;
				_this.model.data.groupCode = null;
				_this.model.flags.showEdit = false;
				_this.model.flags.showGroupCodeSelect = false;
				_this.model.flags.eventEdit = false;
				_this.model.data.record = null;
			};

			_this.functions.userDelete = function () {
				// routine to confirm deletion of of the record
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete Rule <span style='color:white'>" +
					_this.model.data.record.code +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to delete this Notification Rule ? ',
					'[No][Yes]',
					confirmDelete
				);
			};

			_this.functions.saveRecord = function () {
				// post the current record
				var parsedEvents = lodash.filter(_this.model.data.record.jsonData.events, function (event) {
					return event.templateGroup != null;
				});
				var pushRecord = angular.copy(_this.model.data.record);
				if (parsedEvents.length > 0) pushRecord.jsonData = { events: parsedEvents };
				else pushRecord.jsonData = null;
				pushRecord.description = 'Notification Rule for ' + pushRecord.code;
				var recordArr = [];
				recordArr.push(pushRecord);
				adminDataSvc
					.saveCustomerLists(_this.model.data.companyId, recordArr)
					.then(function (result) {
						// re-initialize the lists
						cacheDataSvc
							.initializeLists()
							.then(function (result) {
								uiSvc.showExtraSmallPopup(
									'Notification System',
									'Notification Rule Update Successful !',
									5000
								);

								// update the display
								_this.model.data.record.recordStatus = uiSvc.editModes.UPDATE;
								_this.functions.updateRecordDisplay();
							})
							.catch(function (err) {
								$log.error('Unable to Refresh Company List', err);
							});
					})
					.catch(function (err) {
						$log.error('Unable to Update Notification Rule', err);
					});
			};

			_this.functions.deleteRecord = function () {
				// routine to be called when the user chooses to delete a record
				_this.model.data.record.recordStatus = uiSvc.editModes.DELETE;
				var recordArr = [];
				recordArr.push(_this.model.data.record);
				adminDataSvc
					.saveCustomerLists(_this.model.data.companyId, recordArr)
					.then(function (result) {
						_this.functions.cancelRecord();

						// re-initialize the lists
						cacheDataSvc
							.initializeLists()
							.then(function (result) {
								uiSvc.showExtraSmallPopup(
									'Notification System',
									'Notification Rule Delete Successful !',
									5000
								);
							})
							.catch(function (err) {
								$log.error('Unable to Refresh Company List', err);
							});
					})
					.catch(function (err) {
						$log.error('Unable to Delete Notification Rule', err);
					});
			};

			//</editor-fold>

			initialize();
		}
	]);
});
