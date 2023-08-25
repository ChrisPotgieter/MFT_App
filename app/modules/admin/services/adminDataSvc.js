/*
 /// <summary>
 /// app.modules.admin.services - adminDataSvc.js
 /// Admin Module Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash', 'file-saver' ], function (module, lodash, filesaver) {
	'use strict';
	module.registerService('adminDataSvc', [
		'$filter',
		'$log',
		'$q',
		'$uibModal',
		'$state',
		'$stateParams',
		'$timeout',
		'apiSvc',
		'apiProvider',
		'cacheDataSvc',
		'userSvc',
		'uiSvc',
		function (
			$filter,
			$log,
			$q,
			$uibModal,
			$state,
			$stateParams,
			$timeout,
			apiSvc,
			apiProvider,
			cacheDataSvc,
			userSvc,
			uiSvc
		) {
			let _this = this;
			_this.listFunctions = {};

			//<editor-fold desc="List Management Framework">

			_this.listFunctions.initializeListController = function (controller, type, dialogDetails, titleDetails) {
				// generic routine to initialize a list controller to edit for a given type (all existing list controllers need to be reworked to use this model)
				controller.stateInfo = {
					companyId: userSvc.getOrgInfo().companyId,
					type: type,
					subTitle: 'List Entry',
					title: 'List Capture',
					menuIcon: 'fa fa-cog'
				};

				// check if there is router config
				var config = $state.get($state.current).data;
				if (config) {
					if (config.subTitle) controller.stateInfo.subTitle = config.subTitle;
					if (config.title) controller.stateInfo.title = config.title;
					if (config.menuIcon) controller.stateInfo.menuIcon = config.menuIcon;
				}
				if (titleDetails) {
					if (titleDetails.title) controller.stateInfo.title = titleDetails.title;
					if (titleDetails.module) titleDetails.title = titleDetails.module + ' ' + titleDetails.title;
					if (titleDetails.subTitle) controller.stateInfo.subTitle = titleDetails.subTitle;
				}
				controller.model = {
					gridData: [],
					flags: { gridRefresh: { value: 0 } },
					lastId: -1,
					allowSave: false,
					allowAdd: true,
					allowId: true
				};

				// setup the functions
				if (!controller.functions) controller.functions = {};

				// function to initialize the screen
				if (!controller.functions.initialize) {
					controller.functions.initialize = function (serverPost) {
						// see if we have to force an ID
						if ($stateParams.id && controller.model.flags.allowId)
							controller.model.editCode = $stateParams.id;
						controller.model.flags.allowSave = false;
						controller.model.lastId = -1;

						// now read the records from the server
						let listModel = {
							company_id: controller.stateInfo.companyId,
							type: controller.stateInfo.type.toUpperCase()
						};
						_this
							.readCustomerListAudit(listModel)
							.then(function (result) {
								console.log(result)
								_this.listFunctions.initializeRecords(result, controller);

								// see if we have an editRecord
								if ($stateParams.id && controller.model.flags.allowId) {
									let id = $stateParams.id.toUpperCase();
									let editRecord = lodash.find(controller.model.gridData, { code: id });
									if (editRecord == null) controller.functions.insertRecord(id);
									else controller.functions.editRecord(editRecord);
								}
							})
							.catch(function (err) {
								$log.error(
									'Unable to Read Company List ' + controller.model.type,
									controller.model,
									err
								);
							});
					};
				}

				// function to handle the final post to the server
				if (!controller.functions.updateFunction) {
					controller.functions.updateFunction = function () {
						// routine to post the updates to the server
						var stateInfo = controller.stateInfo;
						let rows = lodash.filter(controller.model.gridData, function (record) {
							return record.rowStyle != undefined && record.rowStyle != null;
						});

						// now see if there is custom post login
						if (controller.functions.onPostRecord != null) {
							rows = lodash.map(rows, function (row) {
								return controller.functions.onPostRecord(row);
							});
						}
						let audit = controller.stateInfo.subTitle + ' Update';
						_this
							.updateCustomerListAudit(rows, audit)
							.then(function (result) {
								uiSvc.showExtraSmallPopup(
									stateInfo.title,
									'All the Configurations have been updated successfully !',
									5000
								);
								if (controller.model.editCode)
									$state.transitionTo(
										$state.current,
										{},
										{
											reload: $state.current.name,
											inherit: false,
											notify: true
										}
									);
								else controller.functions.initialize(true);
							})
							.catch(function (err) {
								$log.error('Unable to Update ' + stateInfo.title + ' Configurations', err);
							});
					};
				}

				// function to handle the dialog display
				if (!controller.functions.showDialog)
					controller.functions.showDialog = _this.listFunctions.initializeEditDialog(
						controller,
						dialogDetails
					);

				// function to handle user request to insert a row
				if (!controller.functions.insertRecord) {
					controller.functions.insertRecord = function (code) {
						// generic routine to initialize a a new list record and allow for additional overrides
						let listInfo = controller.stateInfo;
						let row = {
							recordStatus: uiSvc.editModes.INSERT,
							jsonData: {},
							companyId: listInfo.companyId,
							id: 0,
							type: listInfo.type
						};
						if (code) row.code = code;

						if (controller.functions.initializeNewRecord != null)
							row = controller.functions.initializeNewRecord(row);
						row.initialized = true;

						// show the dialog
						controller.functions.showDialog(row);
					};
				}

				// function to handle user request to edit an existing row
				if (!controller.functions.editRecord) {
					controller.functions.editRecord = function (record) {
						if (!record.initialized) {
							if (controller.functions.initializeNewRecord != null)
								record = controller.functions.initializeNewRecord(record);
							record.initialized = true;
						}

						controller.functions.showDialog(record);
					};
				}
			};

			_this.listFunctions.initializeRecords = function (recordList, controller) {
				// routine to initialize the records read by the server with basic flags
				controller.model.allowSave = false;
				lodash.forEach(recordList, function (item, index) {
					item.rowId = index;
					item.rowStyle = null;
					item.newRecord = false;
					item.recordStatus = uiSvc.editModes.UPDATE;
					item.initialized = false;
					if (!item.jsonData) item.jsonData = {};
					controller.model.lastId++;

					if (controller.functions.initializeRecord != null) controller.functions.initializeRecord(item);
				});
				controller.model.gridData = recordList;
			};
			_this.listFunctions.initializeEditDialog = function (controller, dialogDetails) {
				// routine to attach a dialog to the controller using the details specified
				return function (record) {
					// routine to bring up the editing dialog
					const dialogData = {};
					dialogData.row = angular.copy(record);
					dialogData.rows = controller.model.gridData;
					if (controller.functions.onShowDialog != null) controller.functions.onShowDialog(dialogData);

					let modalInstance = $uibModal.open({
						animation: true,
						templateUrl: dialogDetails.template,
						controller: dialogDetails.controller,
						controllerAs: dialogDetails.alias,
						backdrop: 'static',
						size: dialogDetails.size != null ? dialogDetails.size : 'lg',
						resolve: {
							dialogData: dialogData
						}
					});
					modalInstance.result.then(
						function (result) {
							// refresh the data
							let type = result.recordStatus;
							result.initialized = true;
							if (controller.functions.onCloseDialog != null) controller.functions.onCloseDialog(result);
							if (
								type == uiSvc.editModes.INSERT &&
								(!result.rowId || result.rowId == 0 || result.rowId == -1)
							) {
								// insert the column
								controller.model.lastId++;
								result.rowId = controller.model.lastId;
								result.rowStyle = 'recordInsert';
								result.recordStatus = uiSvc.editModes.INSERT;
								result.newRecord = true;
								controller.model.gridData.push(result);
							}
							if (type == uiSvc.editModes.DELETE) {
								// remove the entry
								if (result.newRecord) {
									// remove the entry from the list as it was an add then a delete
									result = lodash.find(controller.model.gridData, { rowId: result.rowId });

									const entry = { rowId: result.rowId };
									lodash.remove(controller.model.gridData, entry);
								}
								else {
									var recordIndex = lodash.findIndex(controller.model.gridData, {
										rowId: result.rowId
									});
									if (recordIndex > -1) {
										result.recordStatus = uiSvc.editModes.DELETE;
										result.rowStyle = 'recordDelete';
										controller.model.gridData.splice(recordIndex, 1, result);
									}
								}
							}
							if (type == uiSvc.editModes.UPDATE) {
								// update the record
								let recordIndex = lodash.findIndex(controller.model.gridData, { rowId: result.rowId });
								if (recordIndex >= -1) controller.model.gridData.splice(recordIndex, 1, result);
							}

							// update the overall record status
							controller.model.flags.allowSave = true;
							//controller.model.flags.gridRefresh.value += 1;

							if (!result.recordStatus) result.recordStatus = uiSvc.editModes.UPDATE; //"Update"
							if (!result.rowStyle || result.rowStyle == null) result.rowStyle = 'recordUpdate';

							// close the dialog
							modalInstance.close();
						},
						function () {}
					);
				};
			};

			_this.listFunctions.initializeDialogController = function (controller, modalInstance, subTitle) {
				// routine to initialize a generic dialog edit box
				if (!controller.functions) controller.functions = {};
				if (!controller.model) controller.model = {};
				controller.model.subTitle = subTitle;

				controller.functions.onChangeRecord = function () {
					// routine to change the record when the id changes
					controller.form.resetForm();
				};

				// setup a rendered function
				if (!controller.functions.rendered) {
					controller.functions.rendered = function () {
						// setup bootstrap validator when the form is rendered
						const innerForm = $(document.getElementById(controller.stateInfo.elementId));
						let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), controller.stateInfo.fields);
						const fv = innerForm.bootstrapValidator(formOptions);

						controller.form = innerForm.data('bootstrapValidator');

						// update the data
						controller.functions.onChangeRecord();

						// revalidate the form as required
						if (controller.dataModel.rowId > -1) {
							controller.model.title = 'Edit ' + controller.model.subTitle;
							controller.model.buttonText = 'Save';

							// validate the form on edit
							$timeout(function () {
								controller.form.validate();
							}, 500);

							if (controller.functions.onRender) controller.functions.onRender();
						}
					};
				}

				// setup a user delete function
				if (!controller.functions.userDelete) {
					controller.functions.userDelete = function () {
						// routine to confirm deletion of of the row
						let code = controller.dataModel.code != null ? controller.dataModel.code : '';
						const html =
							"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
							code +
							'</span> ?';
						uiSvc.showSmartAdminBox(
							html,
							'Are you sure you want to delete this ' + controller.model.subTitle + ' ? ',
							'[No][Yes]',
							controller.functions.confirmDelete
						);
					};
				}

				// setup a user confirmation delete
				if (!controller.functions.confirmDelete) {
					controller.functions.confirmDelete = function (ButtonPressed) {
						// routine to handle the delete request from the user
						if (ButtonPressed == 'Yes') {
							controller.dataModel.recordStatus = uiSvc.editModes.DELETE;
							modalInstance.close(controller.dataModel);
						}
					};
				}

				// setup a save function
				if (!controller.functions.saveRecord) {
					controller.functions.saveRecord = function () {
						// routine to save the entry
						controller.form.revalidateField('hiddenValidation');
						controller.form.validate();
						const valid = controller.form.isValid();
						if (!valid) return;

						// see if the is custom save logic overrides
						if (controller.functions.onSaveRecord)
							controller.dataModel = controller.functions.onSaveRecord(controller.dataModel);

						// close the window
						modalInstance.close(controller.dataModel);
					};
				}

				// setup a cancel function
				if (!controller.functions.cancelRecord) {
					controller.functions.cancelRecord = function () {
						// close the window
						modalInstance.dismiss('cancel');
					};
				}

				// setup an initialize function
				if (!controller.functions.initialize) {
					controller.functions.initialize = function () {
						controller.dataModel = controller.dialogData.row;
						controller.model = { buttonText: 'Create', flags: { allowCode: true }, subTitle: subTitle };
						controller.model.title = 'Add ' + controller.model.subTitle;

						// determine if the code needs to be disabled
						if (controller.dataModel.newRecord != undefined && !controller.dataModel.newRecord)
							controller.model.flags.allowCode = false;
						if (
							controller.dataModel.code != undefined &&
							controller.dataModel.recordStatus == uiSvc.editModes.INSERT
						)
							controller.model.flags.allowCode = false;
						controller.modalResult = null;

						if (controller.functions.initializeRecord != null) controller.functions.initializeRecord();
					};
				}

				// hook up the rendered function
				modalInstance.rendered.then(controller.functions.rendered);

				// initialize the form
				controller.functions.initialize();
			};

			//</editor-fold>

			//<editor-fold desc="Long Run Process Framework">
			_this.readProgress = function (id) {
				// routine to return the progress status from the background process with the id
				return apiProvider.get('readProgress', { id: id });
			};

			_this.deleteProgress = function (id) {
				// routine to remove a progress record given its id
				return apiProvider.get('deleteProgress', { id: id });
			};

			_this.handleLongRunCancel = function (dialog) {
				// routine to handle long run progress dialog Cancel confirmations
				if (dialog.progressInfo.dbId) {
					_this
						.deleteProgress(dialog.progressInfo.dbId)
						.then(function () {
							dialog.modalInstance.dismiss('cancel');
						})
						.catch(function () {
							dialog.modalInstance.dismiss('cancel');
						});
				}
				else {
					dialog.modalInstance.dismiss('cancel');
				}
			};

			_this.handleLongRunOK = function (dialog) {
				// routine to handle long run progress dialog OK confirmations
				if (dialog.progressInfo.dbId) {
					_this
						.deleteProgress(dialog.progressInfo.dbId)
						.then(function () {
							dialog.modalInstance.close(dialog.modalResult);
						})
						.catch(function () {
							dialog.modalInstance.close(dialog.modalResult);
						});
				}
				else {
					dialog.modalInstance.close(dialog.modalResult);
				}
			};

			_this.refreshLongRunProcess = function (dialog) {
				// routine to handle refresh of long running processing
				_this
					.readProgress(dialog.progressInfo.dbId)
					.then(function (result) {
						// now update the progress information
						dialog.updateProgress(result);
					})
					.catch(function (result) {
						$log.error('Unable to retrieve Progress Update from Server', result);
					});
			};

			//Get CRS SSN Data
			_this.readSSN = function (controller, type) {
				let listModel = {
					company_id: controller.stateInfo.companyId,
					type: controller.stateInfo.type.toUpperCase()
				};
				_this.readCustomerListAudit(listModel).then(function (result) {
					//controller.gridData = result
					return result;
				});
			};

			//</editor-fold>

			//<editor-fold desc="Company and User Management">
			_this.readCompanyProfile = function (id) {
				// routine to read the full company profile from the server
				return apiProvider.get('readCompanyProfile', id);
			};

			_this.saveCompanyProfile = function (record) {
				// routine to commit the new company to the server
				return apiProvider.getObject('updateCompanyProfile', record);
			};

			_this.saveCompanyBasic = function (record) {
				// routine to save the given list of customer list records with audit information
				record.audit =  _this.createAudit('CompanyBasic', 0);
				// routine to commit the updates to the basic info to the server
				return apiProvider.getObject('updateCompanyBasic', record);
			};

			_this.saveCompanyAD = function (id, record) {
				// routine to save the given list of customer list records with audit information
				let model = { domains: record, audit: _this.createAudit('CompanyAD', 0) };
				// routine to save the active directory details to the database
				return apiProvider.getListMixed('updateCompanyAD', { id: id }, model);
			};

			_this.saveRoles = function (id, record) {
				// routine to save the given list of customer list records with audit information

				let model = { records: record, audit: _this.createAudit('CompanyRoles', 0) };
				// routine to save the role details to the database
				return apiProvider.getListMixed('updateRoles', { id: id }, model);
			};

			_this.updateUserRecord = function (result, userList, lastId) {
				// routine to update the given user list when a user record changes
				const type = result.recordStatus;
				if (type == uiSvc.editModes.INSERT && (!result.rowId || result.rowId == 0)) {
					lastId++;
					result.id = 0;
					result.rowId = lastId;
					result.rowStyle = 'recordInsert';
					result.recordStatus = uiSvc.editModes.INSERT;
					result.newRecord = true;
					userList.push(result);
				}
				if (type == uiSvc.editModes.DELETE) {
					// remove the entry
					if (result.newRecord) {
						// remove the entry from the list as it was an add then a delete
						const entry = { userId: result.userId };
						lodash.remove(userList, entry);
					}
					else {
						var recordIndex = lodash.findIndex(userList, { userId: result.userId });
						if (recordIndex > -1) {
							result.recordStatus = uiSvc.editModes.DELETE;
							result.rowStyle = 'recordDelete';
							userList.splice(recordIndex, 1, result);
						}
					}
				}
				if (type == uiSvc.editModes.UPDATE) {
					// update the record
					var recordIndex = lodash.findIndex(userList, { userId: result.userId });
					if (recordIndex >= -1) userList.splice(recordIndex, 1, result);
				}

				// update the overall record status
				if (!result.recordStatus) result.recordStatus = uiSvc.editModes.UPDATE; //"Update"
				if (!result.rowStyle || result.rowStyle == null) result.rowStyle = 'recordUpdate';
				return lastId;
			};

			_this.findUsers = function (model) {
				// routine to find users that match the given model
				if (model.companyId == null || model.companyId == undefined) {
					var orgInfo = userSvc.getOrgInfo();
					model.companyId = orgInfo.companyId;
				}

				// check that we have a list
				if (!model.userList) model.userList = [];

				// return the promise
				return apiProvider.getList('filterUserList', model);
			};

			_this.saveUsers = function (id, records) {
				// routine to save the given list of customer list records with audit information
				let model = { users: records, audit: _this.createAudit('updateUsers', 0) };
				// routine to save non-ad users to the database
				return apiProvider.getListMixed('updateUsers', { id: id }, model);
			};

			_this.readCompanies = function () {
				// routine to return all active companies
				return apiProvider.list('readCompanies');
			};

			_this.validateADConnection = function (record) {
				// routine to validate the active directory connection details
				return apiProvider.save('validateAD', record);
			};

			_this.saveADUsers = function (id, record) {
				// routine to save the users to the database for a given company id
				return apiProvider.getListMixed('updateADUsers', { id: id }, record);
			};

			_this.getADUsers = function (record, companyId, excludeActive) {
				// routine to get all users against the given AD domain
				const sendRecord = { domain: record };
				if (companyId) sendRecord.companyId = companyId;
				if (excludeActive) sendRecord.excludeActive = excludeActive;
				return apiProvider.getList('readADUsers', sendRecord);
			};

			//</editor-fold>

			//<editor-fold desc="Customer Lists">
			_this.readCustomerListAudit = function (model, limit) {
				// routine to return customer lists with audit that match the given filter
				let obj = { filter: model };
				if (limit != null) obj.limit = parseInt(limit);
				return apiProvider.getList('filterCustomerListAudit', obj);
			};

			_this.updateCustomerListAudit = function (records, description) {
				// routine to save the given list of customer list records with audit information
				let model = { records: records, audit: _this.createAudit(description, 0) };
				return apiProvider.getList('updateCustomerListAudit', model);
			};

			_this.readCustomerListAuditRecords = function (id) {
				// routine to return the audit records for the given customer list iden
				return apiProvider.get('readCustomerListAudit', { id: id });
			};

			//</editor-fold>

			//<editor-fold desc="Customers">
			_this.readDynamicTable = function (model) {
				return apiProvider.getList('readDynamicTable', model);
			};
			//</editor-fold>

			//<editor-fold desc="SMTP">
			_this.readSMTP = function () {
				// routine to read the smtp information from the server
				return apiProvider.get('readSMTP');
			};

			_this.saveSMTP = function (record) {
					// routine to save smtp to db
					let model = { smtp: record, audit: _this.createAudit('SMTP', 0) };
					// routine to commit the SMTP Information
					return apiProvider.getObject('updateSMTP', model);
			};
			//</editor-fold>

			//<editor-fold desc="Environment">
			_this.readEnvironment = function (reread)
			{
				// routine to read the environment information from the server or the cached version if applicable
				let deferred = $q.defer();
				let environment = cacheDataSvc.getTenantEnvironment();
				if (environment == null || (reread != null && reread == true))
				{
					// reread from server
					apiProvider.get('readEnv').then(function(result)
					{
						cacheDataSvc.setTenantEnvironment(result);
						deferred.resolve(result)
					}).catch(function(err)
					{
						deferred.reject(err);
					});
				}
				else
				{
					deferred.resolve(environment)
				}
				return deferred.promise;
			};

			_this.saveEnvironment = function (record) {
				// routine to save the given list of customer list records with audit information
				let model = { data: record, audit: _this.createAudit('Environment', 0) };
				// routine to commit the Environment Information
				return apiProvider.getObject('updateEnv', model);
			};

			_this.validateModule = function (module) {
				let licensedModules ;
				let rolesModulesList;
				//get normal modules
					 let normalModules = cacheDataSvc.getListForType('0', 'MODULE');
					//get custom Modules
					let customModuleType = cacheDataSvc.getListForType('1', 'MODULE', 0);
				_this.readEnvironment().then(function (result) {
					licensedModules = result.licensing.modules;
					
					
				});

				//loop the license modules and match with cache modules
				//then add to roleModuleList
				
				lodash.forEach(licensedModules, function (licenseItem, licenseIndex) {
					// normal modules
					console.log("Check")
					lodash.forEach(normalModules, function (normalModuleItem, moduleIndex) {
						if (licenseItem == normalModuleItem.jsonData.identifier) {
							if (
								!rolesModulesList.filter(
									(e) => e.jsonData.identifier === normalModuleItem.jsonData.identifier
								).length > 0
							) {
								
								rolesModulesList.push(normalModuleItem);
							}
						} /**/
					});

					//custom modules
					lodash.forEach(customModuleType, function (customModuleItem, customModuleIndex) {
						//add custom modules to rolesModulesList, if module not there
						if (
							!rolesModulesList.filter(
								(e) => e.jsonData.identifier === customModuleItem.jsonData.identifier
							).length > 0
						) {
							rolesModulesList.push(customModuleItem);
						}
					});
				});
				
			};

			//</editor-fold>

			//<editor-fold desc="Notifications">
			_this.buildTemplateList = function (companyId, code) {
				// routine to build the template list for a Template Group
				const model = { companyId: companyId, type: 'TEMPLATE_GROUP' };
				if (code != null) model.code = code.toUpperCase();
				return apiProvider.getList('readTemplateGroup', model);
			};

			_this.saveTemplateGroup = function (record) {
				// routine to commit Template Group Information
				return apiProvider.getObject('updateTemplateGroup', record);
			};

			_this.readNotificationRule = function (companyId, code, subCode) {
				// routine to return a notification rule with its code and subCode
				const model = {
					companyId: companyId,
					type: 'NOTIFICATION_RULE',
					code: code.toUpperCase() + '@' + subCode.toUpperCase()
				};
				return apiProvider.getObject('readNotificationRule', model);
			};

			_this.saveNotificationRule = function (company, record) {
				// routine to update or delete notification rules for the company
				let pushRecord = angular.copy(record);
				if (record.recordStatus != uiSvc.editModes.DELETE) {
					// post the current record
					const parsedEvents = lodash.filter(record.jsonData.events, function (event) {
						return event.templateGroup != null;
					});
					if (parsedEvents.length > 0) pushRecord.jsonData = { events: parsedEvents };
					else pushRecord.jsonData = null;
					pushRecord.description = 'Notification Rule for ' + pushRecord.code;
				}
				const deferred = $q.defer();
				let recordArr = [];
				recordArr.push(pushRecord);
				let msg = record.recordStatus == uiSvc.editModes.DELETE ? 'Delete' : 'Update';

				_this
					.updateCustomerListAudit(recordArr, 'Rule Changed')
					.then(function () {
						// re-initialize the lists
						cacheDataSvc
							.initializeLists()
							.then(function (result) {
								msg = 'Notification Rule ' + msg + ' Successful !';
								uiSvc.showExtraSmallPopup(
									'Notification System',
									msg + '\nPlease restart Services to Take Effect',
									5000
								);
								deferred.resolve(pushRecord);
							})
							.catch(function (err) {
								$log.error('Unable to Refresh Cache List', err);
								deferred.resolve(pushRecord);
							});
					})
					.catch(function (err) {
						msg = 'Unable to ' + msg + ' Notification Rule';
						$log.error(msg, err);
						deferred.reject(err);
					});
				return deferred.promise;
			};
			//</editor-fold>

			//<editor-fold desc="Dynamic Table">
			_this.saveDynamicTable = function (id, records) {
				return apiProvider.getListMixed('updateDynamicTable', { id: id }, records);
			};
			//</editor-fold>

			//<editor-fold desc="WMQ Settings">
			_this.readDefaultMQ = function () {
				// routine to read the default WMQ information from the server
				// specific read as this has some defaults
				return apiProvider.get('readWMQDefault');
			};

			_this.saveDefaultMQ = function (record) {
				let model = { connection: record, audit: _this.createAudit('wmq', 0) };
				// routine to commit the Default WMQ Connection Information
				// this is there because the save needs to also update the config file
				return apiProvider.getObject('updateWMQDefault', model);
			};
			//</editor-fold>

			//<editor-fold desc="Parameter Management">

			_this.readAuditParameter = function (id) {
				// routine to read an audited parameter given its id
				return apiProvider.get('readAuditParameter', { id: id });
			};
			_this.saveAuditParameter = function (record, description, id) {
				// routine to update an audit parameter with the given model
				let model = { record: record, audit: _this.createAudit(description, 0) };
				return apiProvider.getObject('saveAuditParameter', model, { id: id });
			};
			//</editor-fold>

			//<editor-fold desc="Module Configuration">

			_this.readModuleParameter = function (module) {
				// routine to return the module parameter for the given module
				return apiProvider.get('readModuleParameter', { id: module });
			};
			_this.updateModuleParameter = function (module, record, description) {
				// routine to save the given list of customer list records with audit information
				record.company_id = 0;
				let model = { records: [ record ], audit: _this.createAudit(description, 0) };
				return apiProvider.getObjectMixed('updateModuleParameter', { id: module }, model);
			};

			_this.readCachedModuleParameter = function (module) {
				// routine to read the module parameter for the given module
				let record = cacheDataSvc.getListRecord('1', 'MODULE', module, 0);
				if (record != null && record.jsonData) return record.jsonData;
				return null;
			};
			//</editor-fold>

			//<editor-fold desc="SLA Management">
			_this.readSLA = function (model) {
				// routine to return a notification rule with its code and subCode
				return apiProvider.getList('readSLA', model);
			};
			_this.initializeSLA = function (model) {
				// routine to return a notification rule with its code and subCode
				return apiProvider.getObject('initializeSLA', model);
			};

			_this.updateSLA = function (records) {
				let model = { records: records, audit: _this.createAudit('SLA UI Update', 0) };
				return apiProvider.getList('updateSLA', model);
			};
			//</editor-fold>

			//<editor-fold desc="CLI Functions">
			_this.initializeCLI = function (dialog, dialogData, modalInstance) {
				// routine to prepare the a cli dialog controller progress info and title information
				dialog.initialize = function () {
					dialog.titleData = { icon: dialogData.icon, desc: dialogData.desc };
					dialog.modalInstance = modalInstance;
					dialog.modalResult = null;
					dialog.progressInfo = {
						icon: 'fa fa-cog',
						showProgress: true,
						showHeader: true,
						inProgress: true,
						title: dialogData.desc,
						description: 'Preparing...',
						perc: '1%',
						allowOK: false,
						allowCancel: false,
						showLineDisplay: true,
						showOK: true,
						showCancel: false,
						initialized: false,
						OKText: 'OK'
					};
					dialog.progressInfo.onProgressUpdate = function (model) {
						dialog.lastProgress = model;
					};
					dialog.progressInfo.onProgressUpdateComplete = function (status) {
						if (status == uiSvc.backgroundProcessStates.COMPLETED) {
							if (dialog.lastProgress.info.result) dialog.modalResult = dialog.lastProgress.info.result;
							else dialog.modalResult = true;
						}
						if (status == uiSvc.backgroundProcessStates.INERROR) {
							dialog.modalResult = { error: dialog.lastProgress.info.error };
						}
					};
				};

				dialog.ok = function () {
					// close the window
					_this.handleLongRunOK(dialog);
				};

				dialog.cancel = function () {
					// close the window
					_this.handleLongRunCancel(dialog);
				};

				dialog.startTimer = function () {
					// routine to manage the timer
					uiSvc.startLongRunTimer(dialog);
				};
				dialog.stopTimer = function () {
					// stop the timer
					uiSvc.stopLongRunTimer(dialog);
				};

				dialog.updateProgress = function (model) {
					// routine to update the progress object when the server has sent us a new model
					uiSvc.updateLongRunProgress(model, dialog);
				};

				dialog.refreshProgress = function () {
					// routine to refresh the progress
					_this.refreshLongRunProcess(dialog);
				};
			};

			_this.handleCLIProgressResponse = function (dialog, response) {
				// routine to handle cli trigger response
				if (response.record != null) {
					dialog.progressInfo.dbId = response.record.id;
					dialog.updateProgress(response.record);
				}
			};
			_this.sendCLIRequest = function (record, moduleUrl) {
				// routine to send a module CLI Request
				record.userId = userSvc.getProfile().id;
				record.loginCode = userSvc.getProfile().login;
				return apiProvider.getObject(moduleUrl, record);
			};
			_this.initiateCLI = function (dialogData, serviceObj, controller, completeFunction, errorFunction) {
				// routine to initiate a CLI function
				let modalInstance = $uibModal.open({
					animation: true,
					backdrop: 'static',
					templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
					controller: controller,
					controllerAs: 'vmDialog',
					resolve: {
						dialogData: dialogData
					}
				});
				modalInstance.result.then(completeFunction).catch(errorFunction);
			};

			_this.setupCLI = function (serviceObj, apiCall, apiController) {
				// routine to setup the given service object with default cli methods
				serviceObj.acceptCLIOperation = function (ButtonPressed) {
					// routine to handle the delete request from the user
					if (ButtonPressed == 'Yes') {
						// get the last CLI Information
						if (!serviceObj.lastCLIRequest) return;
						let operationData = serviceObj.lastCLIRequest.record;
						let operationAction = serviceObj.lastCLIRequest.operation;
						let operationUi = serviceObj.lastCLIRequest.ui;
						let requestData = {
							icon: operationUi.icon,
							desc: operationUi.description,
							request: { operation: operationAction, arguments: operationData }
						};

						// see if operating in silent mode
						if (operationUi.silentFunc != null) {
							requestData.request.silent = true;
							serviceObj.sendCLIRequest(requestData.request).then(function (result) {
								operationUi.silentFunc(result);
							});
						}
						else serviceObj.initiateCLI(requestData);
					}
				};
				serviceObj.invokeCLIOperation = function (operationData) {
					// routine to invoke a CLI operation without question
					serviceObj.lastCLIRequest = operationData;
					serviceObj.acceptCLIOperation('Yes');
				};
				serviceObj.setCLIRequest = function (operationData) {
					// routine to set the last CLI request against the service object and return server data to send to the api call
					serviceObj.lastCLIRequest = operationData;

					// send the correct request to the server
					let serverData = { arguments: operationData.record, operation: operationData.operation };
					return serverData;
				};

				serviceObj.sendCLIRequest = function (record) {
					// routine to send an CLI Request
					if (serviceObj.lastCLIRequest.apiCall != null)
						return _this.sendCLIRequest(record, serviceObj.lastCLIRequest.apiCall);
					else return _this.sendCLIRequest(record, apiCall);
				};
				serviceObj.confirmCLIOperation = function (operationData) {
					_this.confirmCLIOperation(serviceObj, operationData);
				};
				serviceObj.handleCLIProgressResponse = function (dialog, result) {
					_this.handleCLIProgressResponse(dialog, result);
				};
				if (apiController) {
					serviceObj.initiateCLI = function (data) {
						// routine to initiate a cli request - this will be called by the admin service when a CLI is initiated and
						// will bring up the dialog controller mentioned which will inturn send the request to the server
						_this.initiateCLI(
							data,
							serviceObj,
							apiController,
							function (modalResult) {
								if (modalResult.error)
									uiSvc.showExtraSmallPopup(
										data.desc,
										'Instruction Failed  !<br/>' + modalResult.error,
										5000,
										'#ce2029',
										'times'
									);
								else if (serviceObj.lastCLIRequest.completeFunction)
									serviceObj.lastCLIRequest.completeFunction(modalResult, false);
							},
							function (err) {
								$log.error('Unable to Perform CLI Invocation', err);
								if (serviceObj.lastCLIRequest.completeFunction)
									serviceObj.lastCLIRequest.completeFunction(err, true);
							}
						);
					};
				}
			};
			_this.confirmCLIOperation = function (serviceObj, operationData) {
				// routine to confirm a given cli operation on a given service object
				let html =
					"<i class='" +
					operationData.ui.icon +
					' ' +
					operationData.ui.class +
					"'></i>&nbsp;<span style='color:white'>" +
					operationData.ui.description +
					'</span>';
				serviceObj.lastCLIRequest = operationData;
				if (operationData.ui.no_question == null) operationData.ui.question += '?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you wish to ' + operationData.ui.question + '?',
					'[No][Yes]',
					serviceObj.acceptCLIOperation
				);
			};

			//</editor-fold>

			//<editor-fold desc="General Common Functions">

			_this.readConfigRecord = function (code, type, options) {
				// routine to a given code record and return it (could be a prm list record or a prm main record)
				let deferred = $q.defer();
				if (type == 0) {
					// prm_main
					_this
						.readAuditParameter(code.toUpperCase())
						.then(function (result) {
							// see in the result where there is list
							if (_this.config.propertyName)
								deferred.resolve(lodash.get(result, _this.config.propertyName));
							else deferred.resolve(result);
						})
						.catch(function (err) {
							deferred.reject(err);
						});
				}
				if (type == 1) {
					// prm_list
					_this
						.readCustomerListAudit({
							type: _this.config.code.toUpperCase(),
							company_id: userSvc.getOrgInfo().companyId
						})
						.then(function (result) {
							deferred.resolve(result);
						})
						.catch(function (err) {
							deferred.reject(err);
						});
				}
			};

			_this.createAudit = function (description, auditType) {
				return { user: userSvc.getUserAudit(), auditType: auditType, description: description };
			};

			_this.downloadDocument = function (fileName, extension) {
				// routine to download a document from the server
				apiProvider
					.getBlob('userDownloadDoc', { id: fileName, extension: extension })
					.then(function (response) {
						var file = new Blob([ response.blob ], { type: response.blob.type });
						if (response.blob.type == 'application/octet-stream')
							filesaver(response.blob, response.fileName);
						else {
							uiSvc.openBlob(file);
						}
					})
					.catch(function (result) {
						$log.error('Unable to download Document', result);
					});
			};

			//</editor-fold>

			// setup the api
			var configs = [
				{ url: 'admin/customerList/filter', resourceName: 'filterCustomerListAudit', params: {} },
				{ url: 'admin/customerList/update', resourceName: 'updateCustomerListAudit', params: {} },
				{ url: 'admin/customerList/audit/:id', resourceName: 'readCustomerListAudit', params: { id: '@id' } },

				{ url: 'admin/companyprofile/read', resourceName: 'readCompanyProfile' },
				{ url: 'admin/companyprofile/insert', resourceName: 'updateCompanyProfile' },
				{
					url: 'admin/companyProfile/update/:id/users/ad',
					resourceName: 'updateADUsers',
					params: { id: '@id' }
				},
				{ url: 'admin/companyProfile/update/:id/ad', resourceName: 'updateCompanyAD', params: { id: '@id' } },
				{ url: 'admin/companyProfile/update/basic', resourceName: 'updateCompanyBasic' },
				{ url: 'admin/companyProfile/update/:id/roles', resourceName: 'updateRoles', params: { id: '@id' } },
				{ url: 'admin/company/list', resourceName: 'readCompanies' },

				{ url: 'admin/settings/smtp/read', resourceName: 'readSMTP' },
				{ url: 'admin/settings/smtp/update', resourceName: 'updateSMTP' },

				{ url: 'admin/settings/parameter/read/:id', resourceName: 'readAuditParameter', params: { id: '@id' } },
				{ url: 'admin/settings/parameter/update', resourceName: 'saveAuditParameter', params: {} },

				{ url: 'admin/settings/module/:id/read', resourceName: 'readModuleParameter', params: { id: '@id' } },
				{
					url: 'admin/settings/module/:id/update',
					resourceName: 'updateModuleParameter',
					params: { id: '@id' }
				},

				{ url: 'admin/settings/env/read', resourceName: 'readEnv' },
				{ url: 'admin/settings/env/update', resourceName: 'updateEnv' },

				{ url: 'admin/settings/defaultmq/read', resourceName: 'readWMQDefault' },
				{ url: 'admin/settings/defaultmq/update', resourceName: 'updateWMQDefault' },

				{ url: 'admin/user/filter', resourceName: 'filterUserList' },
				{ url: 'admin/user/:id/update', resourceName: 'updateUsers', params: { id: '@id' } },

				{ url: 'admin/ad/validate', resourceName: 'validateAD' },
				{ url: 'admin/companyProfile/read/users/ad', resourceName: 'readADUsers' },

				{ url: 'admin/progress/read/:id', resourceName: 'readProgress', params: { id: '@id' } },
				{ url: 'admin/progress/delete/:id', resourceName: 'deleteProgress', params: { id: '@id' } },

				{ url: 'admin/settings/templateGroup/read', resourceName: 'readTemplateGroup', params: {} },
				{ url: 'admin/settings/templateGroup/update', resourceName: 'updateTemplateGroup', params: {} },

				{ url: 'admin/settings/notificationRule/read', resourceName: 'readNotificationRule', params: {} },

				{ url: 'admin/settings/sla/read', resourceName: 'readSLA', params: {} },
				{ url: 'admin/settings/sla/update', resourceName: 'updateSLA', params: {} },
				{ url: 'admin/settings/sla/initialize', resourceName: 'initializeSLA', params: {} },

				{
					url: 'admin/settings/dynamicTable/:id/update',
					resourceName: 'updateDynamicTable',
					params: { id: '@id' }
				},

				{
					url: 'upload/download/:id/:extension',
					resourceName: 'userDownloadDoc',
					params: { id: '@id', extension: '@extension' }
				}
			];

			angular.forEach(configs, function (value) {
				apiSvc.add(value);
			});
		}
	]);
});
