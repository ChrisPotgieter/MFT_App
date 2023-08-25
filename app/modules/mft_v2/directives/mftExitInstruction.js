/*
 /// <summary>
 /// app.modules.mft_v2.directives.mftExitInstruction - mftExitInstruction.js
 /// Directive display diffrent instruction types 
 ///
 /// Copyright © 2022 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 01/07/2022
 /// </summary>
 */
define([ 'modules/mft_v2/module', 'appCustomConfig' ], function (module, appCustomConfig) {
	'use strict';

	module.registerDirective('mftExitInstruction', [
		'$filter',
		'$timeout',
		'uiSvc',
		'mftv2DataSvc',
		'transactionReportingSvc',
		'cacheDataSvc',
		function ($filter, $timeout, uiSvc, mftv2DataSvc, transactionReportingSvc, cacheDataSvc) {
			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					data: '=',
					refreshFlag: '=',
					functionManager: '=?'
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/mft_v2/directives/mftExitInstruction.tpl.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.functions = {};
					_this.model = { flags: { watched: false } };

					//Check instruction type/call function base on instruction
					switch (_this.data.instruction) {
						case 'MONGO_ARCHIVE':

							//<editor-fold desc="Mongo Archive Functions">
							_this.functions.displayMongoArchive = function (contentType)
							{
								// reset the file Name
								_this.model.fileName = uiSvc.getFileIOName(_this.model.data.response_data.file);
								if (_this.model.content != null)
								{
									_this.model.task = {
										data: { content: _this.model.content, contentType: contentType }
									};
								}
							};

							_this.functions.prepareMongoArchive = function ()
							{
								// routine to prep the model for mongo archive
								_this.model.data = _this.data;

								// get the file name and other data
								_this.model.allowedExt = false;
								_this.model.fileName =  uiSvc.getFileIOName(_this.data.response_data.file);
								_this.model.fileType = uiSvc.getFileIOType(_this.data.response_data.file);
								_this.model.url = _this.data.response_data.url;

								// work out the data needed for the api call
								_this.model.content = null;
								_this.model.id = _this.model.url.split('/').pop();
								_this.model.module = 0;

								// check if we should show the content on screen
								_this.model.allowedExt = cacheDataSvc.data.allowedViewTypes.includes(_this.model.fileType.toLowerCase());
								if (_this.model.allowedExt)
								{
									// show the content on screen
									$timeout(function()
									{
										let options = {
											displayFunction: _this.functions.displayMongoArchive
										};
										transactionReportingSvc.getAttachmentContent("editor", _this.model, options);

									}, 200)
								}

								// work out the curl command
								_this.model.curlCommand = "curl " + appCustomConfig.net + "/api/common/transaction/detail/attachment/0/" + _this.model.id + " --output " + _this.data.response_data.file;
							};

							_this.functions.mongoDownload = function ()
							{
								// routine to download this attachment for Mongo Archive
								let options = {downloadAlways: true, fileName: _this.model.fileName};
								transactionReportingSvc.getAttachment(
									_this.model.id,
									_this.model.module,
									options
								);
							};
							//</editor-fold>

							_this.functions.prepareMongoArchive();
							break;
						default:
					}
				}
			};
		}
	]);
});
