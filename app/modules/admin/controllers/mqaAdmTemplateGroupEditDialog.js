define([ 'modules/admin/module', 'lodash'], function (module, lodash) {
	'use strict';

	module.registerController('mqaAdmTemplateGroupEditDialog', [
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
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmEmail';

			_this.stateInfo.fields = {
				fields: {
					subject: {
						group: '#div_subject',
						excluded: false,
						validators: {
							notEmpty: {
								message: 'Subject is Required'
							}
						}
					},
					hiddenValidation: {
						excluded: true
					}
				}
			};
			_this.functions.initializeRecord = function () {
				if (_this.dataModel.content != null) {
					let doc = new DOMParser().parseFromString(_this.dataModel.content, 'text/html'); // Get value in content(p tag)
					_this.model.subject = doc.querySelector('p').textContent;
				}
			};

			_this.functions.saveSubEdit = function () {
				// routine to post the save of the queue record to the in-memory store

				var entry = lodash.find(_this.dialogData.rows, { type: _this.dataModel.type });
				if (entry) {
					var content = _this.dataModel.content;
					if (content == '') content = null;
					entry.content = content;
				}

				// update the subject line if any
				if (_this.dataModel.subject) {
					var subjectType = 99 - _this.dataModel.type;
					var entry = lodash.find(_this.dialogData.rows, { type: _this.dataModel.type });
					if (entry) {
						var content = _this.dataModel.subject.content;
						if (content == '') content = null;
						entry.content = content;
					}
				}
				_this.functions.cancelRecord();
			};

			_this.functions.userDelete = function () {
				// routine to confirm deletion of of the row
				console.log(_this.dataModel);
				var html =
					"<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" +
					_this.model.subject +
					'</span> ?';
				uiSvc.showSmartAdminBox(
					html,
					'Are you sure you want to remove this Template ?',
					'[No][Yes]',
					_this.functions.confirmDelete
				);
			};

			_this.functions.confirmDelete = function (ButtonPressed) {
				// routine to handle the delete request from the user
				if (ButtonPressed == 'Yes') {
					// routine to be called when the user chooses to delete a record
					_this.dataModel.content = null;
					if (_this.dataModel.subject) _this.dataModel.subject.content = null;

					_this.functions.saveSubEdit();
				}
			}; /**/

			_this.functions.onSaveRecord = function () {
				_this.functions.saveSubEdit();
				_this.functions.cancelRecord();
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Template');
		}
	]);
});
