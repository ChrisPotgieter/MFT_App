/*
 /// <summary>
 /// app.modules.admin.controllers - parameterTemplateGroupListDialogCtrl.js
 /// Controller for the popup dialog to edit and create template
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 25/01/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerController('parameterTemplateGroupListDialogCtrl', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',

		function (
			$uibModalInstance,
			cacheDataSvc,
			dialogData,
			uiSvc,
			$scope,
			adminDataSvc,
			$timeout,
			userSvc
		) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = dialogData.row;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmGroupCode';
			_this.stateInfo.fields = {
				fields: {
					code: {
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Code is Required'
							},
							callback: {
								message: 'Code already exists',
								callback: function (value, validator, $field) {
									var found = lodash.find(_this.dialogData.rows, function (record) {
										return (
											record.code === value &&
											record.recordStatus != uiSvc.editModes.DELETE &&
											record.rowId != _this.dataModel.rowId
										);
									});

									if (found && !_this.dataModel.isDuplicate) {
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
								message: 'Description is Required'
							}
						}
					},
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {
							callback: {
								message: 'A Template Group requires at least one Content Value',
								callback: function (value, validator, $field) {
									//if duplicating record ,dont validate
									if (_this.dialogData.row.isDuplicate) return true;

									//Validate
									if(_this.dialogData.row.templateList === null)
									{
										
									}else{
											var template = lodash.find(_this.dialogData.row.templateList, function (template) {
										return template.content != null;
									});
									}
								

									return template != null;
								}
							}
						}
					}
				}
			};

			// setup Templates dialog
			let dialogDetails = {
				template: 'app/modules/admin/partials/parameter-template-group-list-dialog.tpl.html',
				controller: 'parameterTemplateGroupListDialogCtrl',
				alias: 'vmDialog'
			};
			_this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(
				_this,
				dialogDetails,
				'Templates'
			);

			//copy editRecord, but not description or code
			_this.functions.duplicateRecord = function () {
				var row = _this.dialogData.row;
				_this.model.gridData = _this.dialogData.rows;
				_this.functions.cancelRecord();

				// routine to duplicate the current record into a new window
				_this.dialogData.row.jsonData = row.jsonData;
				_this.dialogData.row.templateList = row.templateList;
				_this.dialogData.row.isDuplicate = true;
				_this.dialogData.row.code = '';
				_this.dialogData.row.description = '';
				_this.dialogData.row.rowId = -1;
				_this.dialogData.row.isDuplicate = true;

				_this.functions.showDialog(row);
			};


			//When creating a template on a diffrent screen
			//save only that template 
			_this.functions.saveTemplate = function(record)
			{
				var companyId = userSvc.getOrgInfo().companyId;
				var type = "TemplateGroup";

				// post the current record
				record.isNew = true;
				record.recordStatus = uiSvc.editModes.INSERT;
				record.companyId = companyId;
				record.jsonData = {};
				record.rowId = 'new'+ 122;
				record.rowStyle = "recordInsert";
				record.type="TemplateGroup";
			
				// post the record
				adminDataSvc.saveTemplateGroup(record).then(function(result)
				{
					adminDataSvc.listFunctions.initialize(_this, companyId, type);
					uiSvc.showExtraSmallPopup("System Parameters", "Template Group Update Successful !", 5000);
				}).catch(function(err)
				{
					$log.error("Unable to Save Template Group", err);
				});
			};
	

			//save record
			_this.functions.onSaveRecord = function (record) {
				//create record on diffrent screen(Not on template screen)
				if(record.createTemplate){
					_this.functions.saveTemplate(record);
					return;
				}
				//if row duplicate set false and update rowId
				if (record.isDuplicate) {
					record.isDuplicate = false;
					record.rowId = _this.dialogData.rows.length + 1;
				}
				record.code = _this.dataModel.code;
				return record;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Notification Template');
		}
	]);
});
