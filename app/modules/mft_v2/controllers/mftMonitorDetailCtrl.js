/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftMonitorDetailCtrl.js
 /// MFT V2 Monitor Detail Controller
 /// Controller to manage Monitor Detail Information Drill
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module', 'appCustomConfig', 'lodash'], function (module, appCustomConfig, lodash) {

	"use strict";

	module.registerController('mftMonitorDetailCtrl', ['$scope', '$log', '$timeout', '$state', '$stateParams', '$filter', '$interval', 'uiSvc', 'mftv2DataSvc','adminDataSvc', function($scope, $log, $timeout, $state, $stateParams, $filter, $interval, uiSvc, mftv2DataSvc, adminDataSvc)
	{
		// initialize variables
		var _this = this;
		_this.initialLoad = true;
		_this.functions = {};
		//<editor-fold desc="Functions">

		//<editor-fold desc="UI">
		_this.functions.setupCM = function(editor, performFold)
		{
			// routine to adjust the code mirror on display of tabs
			editor.setCursor({line: 0, ch: 0});
			if (performFold)
				editor.foldCode(CodeMirror.Pos(3, 0));

		};

		_this.functions.switchTab = function(tabid)
		{
			// invoke a redraw of the main transaction tab
			if (tabid == 'trigger')
			{
				if (_this.model.task.cm && _this.model.task.cm.setCursor)
				{
					$timeout(function () {
						_this.functions.setupCM(_this.model.task.cm, _this.model.task != 'null');
					}, 200);
				}
			}
			if (tabid == 'create')
			{
				if (_this.model.create.cm && _this.model.create.cm.setCursor)
				{
					$timeout(function () {
						_this.functions.setupCM(_this.model.create.cm, _this.model.create != 'null');
					}, 200);
				}
			}

			if (tabid == 'result')
			{
				if (_this.model.last && _this.model.last.original && _this.model.last.original.cm.setCursor)
				{
					$timeout(function ()
					{

						_this.functions.setupCM(_this.model.last.original.cm, _this.model.last.original.task != 'null');

					}, 200);
				}
				if (_this.model.last && _this.model.last.updated && _this.model.last.updated.cm.setCursor)
				{
					$timeout(function () {
						_this.functions.setupCM(_this.model.last.updated.cm, _this.model.last.updated.task != null);
					}, 200);
				}
			}

		};
		//</editor-fold>

		//<editor-fold desc="Dialogs">
		_this.functions.showExitDialog = function()
		{
			// routine to bring up the dialog for exit information
			let controlOptions = {};
			controlOptions.templateUrl = "app/modules/mft_v2/partials/exit-detail-dialog.tpl.html";
			controlOptions.controller = "mftExitDialogCtrl";
			controlOptions.size = 'lg';

			// filter the data according to type
			let record = mftv2DataSvc.getExitHeader(7);
			record.records = _this.model.last.exits;
			uiSvc.showDialog(record, controlOptions);
		};

		_this.functions.showOriginatorDialog = function()
		{
			// routine to show the originator information
			let controlOptions = {};
			controlOptions.templateUrl = "app/modules/common/partials/common-meta-view-dialog.tpl.html";
			controlOptions.controller = "commonMetaDialogCtrl";
			// format the originator information
			let records = [];
			lodash.forOwn(_this.model.last.originator, function(value, key)
			{
				records.push({key: key, value: value, category: "MFT Originator"});
			});
			let record = {records: records, height:200};
			uiSvc.showDialog(record, controlOptions);

		};
		//</editor-fold>

		//<editor-fold desc="Operations">
		_this.functions.viewLastTransaction = function()
		{
			// routine to view the last transaction for this monitor
			mftv2DataSvc.navigateDashboardTransaction(_this.model.last.task_message_id, $state.$current);
		};

		_this.functions.confirmCLIOperation = function(data)
		{
			data.completeFunction = function(result, isError)
			{
				_this.functions.refresh(false);
			};
			mftv2DataSvc.confirmCLIOperation(data);
		};

		//</editor-fold>

		//<editor-fold desc="Parsing">
		_this.functions.parseLastActivity = function()
		{
			// routine to last result information
			_this.model.last = {original:null, updated: null, exits: null, alert: null};
			if (!_this.model.monitor.last_activity || !_this.model.monitor.last_activity.check_date)
				return;

			let last = _this.model.monitor.last_activity;
			if (last.user_action)
				_this.model.monitor.status = mftv2DataSvc.statusEnum.OPERATION_PENDING;


			// parse the status
			let dataObject = _this.model.last;
			dataObject.alert = "success";
			dataObject.icon = "fa fa-info-circle";
			dataObject.message = "Execution Completed Successfully";
			if (last.result_code > 0)
			{
				dataObject.alert = "danger";
				dataObject.icon = "fa fa-exclamation-circle";
				dataObject.message = "Execution Failed";
			}
			dataObject.check_date = last.check_date;
			dataObject.result_code = last.result_code;
			if (last.job_name)
				dataObject.job_name = last.job_name;
			if (last.task_message_id)
				dataObject.task_message_id = last.task_message_id;
			if (last.supplemental)
				dataObject.supplemental = last.supplemental;
			if (last.originator)
				dataObject.originator  = last.originator;

			// check for additional properties
			if (last.additional && last.additional.fileSpace)
				dataObject.fileSpace = last.additional.fileSpace;

			// add the exits
			if (last.exits)
				_this.model.last.exits = last.exits;

			// add the original
			if (last.original_xml || last.original_meta)
				_this.model.last.original = {meta:{}, cm:{}};
			if (last.original_xml)
				_this.model.last.original.task = last.original_xml;
			if (last.original_meta)
				_this.model.last.original.meta = last.original_meta;

			// add the updated
			if (last.updated_xml || last.updated_meta)
				_this.model.last.updated = {meta:{}, cm:{}};
			if (last.updated_xml)
				_this.model.last.updated.task = last.updated_xml;
			if (last.updated_meta)
				_this.model.last.updated.meta = last.updated_meta;
		};

		_this.functions.buildMetaGrid = function(hashMap)
		{
			// routine to build a meta-grid for default variables and exit-meta
			let meta_data = [];
			lodash.forOwn(hashMap, function(value, key)
			{
				// determine the category
				let mftMonitor = lodash.includes(["filesize", "filepath", "lastmodifiedtime", "lastmodifieddateutc", "lastmodifiedtimeutc", "currenttimestamputc", "currenttimestamp", "filename", "lastmodifieddate", "agentname"], key);
				let category = mftMonitor ? "MFT Monitor" : "Custom";
				if (key.startsWith("mqa"))
					category = appCustomConfig.product.name + " Extensions";
				meta_data.push({key: key, value: value, category: category});
			});
			if (meta_data.length > 0)
				return meta_data;
			else
				return null;
		};


		_this.functions.parseMonitorInformation = function()
		{
			// routine to parse the monitor information
			_this.model.monitor.pollDesc = "Poll Interval Unknown";
			if (_this.model.monitor.resource)
				_this.model.monitor.pollDesc = "Every " + _this.model.monitor.resource.poll_interval + " " + $filter('titleCaseFilter')( _this.model.monitor.resource.poll_unit);

			// determine the icon
			switch (_this.model.monitor.type)
			{
				case 0:
					_this.model.monitor.pollIcon = "fa fa-folder";
					break;
				case 1:
					_this.model.monitor.pollIcon = "fa fa-stack-overflow";
					break;
				case 2:
					_this.model.monitor.pollIcon = "fa fa-exchange";
					break;
			}

			// now determine the trigger information
			_this.model.trigger = {};
			_this.model.trigger.batchSize = 0;
			_this.model.trigger.condition = mftv2DataSvc.parseMonitorCondition(_this.model.monitor);

			_this.model.task.data.content = null;
			if (_this.model.monitor.task && _this.model.monitor.task.task_xml)
				_this.model.task.data.content = _this.model.monitor.task.task_xml;

			// check for task properties
			_this.model.task.properties = null;
			if (_this.model.monitor.task && (_this.model.monitor.task.name || _this.model.monitor.task.description))
				_this.model.task.properties = {};
			if (_this.model.monitor.task && _this.model.monitor.task.name)
				_this.model.task.properties.name = _this.model.monitor.task.name;
			if (_this.model.monitor.task && _this.model.monitor.task.description)
				_this.model.task.properties.description = _this.model.monitor.task.description;

			// check for defaults
			_this.model.task.defaults = null;
			if (_this.model.monitor.resource && _this.model.monitor.resource.default_variables)
				_this.model.task.defaults = _this.functions.buildMetaGrid(_this.model.monitor.resource.default_variables);

			// check for meta-data
			_this.model.task.exit_meta = null;
			if (_this.model.monitor.task && _this.model.monitor.task.exit_meta)
				_this.model.task.exit_meta = _this.functions.buildMetaGrid(_this.model.monitor.task.exit_meta);

			// check for create
			_this.model.create.data.content = null;
			if (_this.model.monitor.task && _this.model.monitor.task.create_request)
				_this.model.create.data.content = _this.model.monitor.task.create_request

		};

		_this.functions.parseStatus = function()
		{
			// routine to parse the status information
			_this.model.monitor.typeDesc = mftv2DataSvc.getMonitorType(_this.model.monitor.type);
			_this.model.status = {};
			_this.model.status.description = mftv2DataSvc.getStatusDesc(_this.model.monitor.status);
			_this.model.monitor.description = lodash.unescape(_this.model.monitor.description);
			_this.model.status.headingDesc = _this.model.monitor.description;
			if (_this.model.status.headingDesc == '')
				_this.model.status.headingDesc = _this.model.monitor.typeDesc + " Monitor";

			_this.model.monitor.sys_date = uiSvc.formatDate(_this.model.monitor.sys_date);
			_this.model.status.alertClass = "alert-" + $filter('bootStrapStatusFilter')(mftv2DataSvc.getBootStrapStatus(_this.model.monitor.status));
			_this.model.status.icon = $filter('bootStrapStatusIconFilter')(mftv2DataSvc.getBootStrapStatus(_this.model.monitor.status));

		};
		//</editor-fold>

		//<editor-fold desc="Property Grid">
		_this.functions.toggleProperties = function ()
		{
			_this.model.flags.showProperties = !_this.model.flags.showProperties;
		};

		_this.functions.addProperty = function(category, key, value)
		{
			let categoryDesc = "General";
			switch (category)
			{
				case 0:
					categoryDesc = "General Information";
					break;
				case 2:
					categoryDesc = "MFT Version";
					break;
				case 4:
					categoryDesc = "Update Details";
					break;
				case 99:
					categoryDesc = appCustomConfig.product.name + " Extensions";
					break;

			}
			_this.model.propertyGrid.data.push({category: categoryDesc, key: key, value: value});
		};
		_this.functions.buildPropertyGrid = function()
		{
			// routine to build the property grid
			_this.model.propertyGrid.data = [];
			_this.functions.addProperty(0, "Name", _this.model.monitor.monitor_name);
			_this.functions.addProperty(0, "Agent", _this.model.monitor.agent_name);
			_this.functions.addProperty(0, "Queue Manager", _this.model.monitor.queue_manager);
			_this.functions.addProperty(0, "Description", _this.model.monitor.description);
			_this.functions.addProperty(0, "Type", _this.model.monitor.typeDesc);
			_this.functions.addProperty(0, "Status", _this.model.status.description);
			if (_this.model.monitor.job_name)
				_this.functions.addProperty(0, "Job Name",_this.model.monitor.job_name);
			_this.functions.addProperty(2, "Interface", _this.model.monitor.version);

			// additional properties
			if (_this.model.monitor.properties)
			{
				if (_this.model.monitor.properties.createMessageId)
					_this.functions.addProperty(0, "Create Message Id", _this.model.monitor.properties.createMessageId);
				if (_this.model.monitor.properties.referenceId)
					_this.functions.addProperty(0, "Reference Id", _this.model.monitor.properties.referenceId);
			}

			// add the other details
			_this.functions.addProperty(4, "Last Update",_this.model.monitor.sys_date);
			_this.functions.addProperty(99, "Identifier", _this.model.monitor._id);
		}
		//</editor-fold>

		//<editor-fold desc="Notifications">
		_this.functions.buildNotifications = function()
		{
			// routine to build the dataset needed for the notifications
			_this.model.notification = {validator:{},data:null};
			let subCode = _this.model.monitor.monitor_name + "@" + _this.model.monitor.agent_name + "@" +  _this.model.monitor.queue_manager + "@" + _this.model.monitor.coordinator;
			adminDataSvc.readNotificationRule(_this.model.monitor.company_id, "MFT_MONITOR",subCode.toUpperCase()).then(function(result)
			{
				// update the display
				_this.model.notification.data = result;
				_this.model.notification.isNew = (result.recordStatus == uiSvc.editModes.INSERT);
			}).catch(function(err)
			{
				$log.error("Unable to read Notification Rule", err);
			});
		};

		_this.functions.userNotificationDelete = function()
		{
			// routine to confirm deletion of of the record
			var html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear Agent Notifications ?";
			uiSvc.showSmartAdminBox(html,"Are you sure you want to Clear All Notifications for this Monitor ? ",'[No][Yes]', _this.functions.confirmNotificationDelete);
		};

		_this.functions.confirmNotificationDelete = function(ButtonPressed)
		{
			// routine to handle the delete request from the user
			if (ButtonPressed == "Yes")
			{
				_this.functions.deleteNotificationRecord();
			};
		};

		_this.functions.deleteNotificationRecord = function()
		{
			// routine to be called when the user chooses to delete a record
			_this.model.notification.data.recordStatus = uiSvc.editModes.DELETE;
			adminDataSvc.saveNotificationRule(_this.model.monitor.company_id, _this.model.notification.data).then(function(result)
			{
				_this.functions.buildNotifications();
			});
		};

		_this.functions.updateNotification = function()
		{
			// validate the screen
			if (_this.model.notification.validator != null)
			{
				_this.model.notification.validator.validate();
				var valid = _this.model.notification.validator.isValid();
				if (!valid)
					return;
			}

			// send the update
			adminDataSvc.saveNotificationRule(_this.model.monitor.company_id, _this.model.notification.data).then(function(result)
			{
				_this.model.notification.data = result;
				_this.model.notification.isNew = false;
			});
		};

		//</editor-fold>

		//<editor-fold desc="Constructor, Disposal, Timer Management">
		_this.functions.startMainTimer = function()
		{
			// routine to start the main timer which refreshes the details every few seconds
			if (_this.model.timers.mainTimer == null)
			{
				let seconds = (appCustomConfig.runMode == uiSvc.modes.DEMO) ? 10 : 60;
				_this.model.timers.mainTimer = $interval(_this.functions.refresh(), seconds * 1000);
			}
		};

		_this.functions.init  = function()
		{

			// initialize the model
			_this.model = {
				flags: {showProperties: true},
				trigger: {},
				task: {data: {contentType: "xml"}, cm: {}, defaults: null, exit_meta: null},
				last: {original: null, updated: null, exits: null},
				create: {data: {contentType: "xml"}, cm: {}},
				timers: {mainTimer: null, statsTimer: null}
			};

			// initialize the property grid
			_this.model.propertyGrid = {data:[], options: {}};
			_this.model.propertyGrid.options = {propertyView: true};

			// start the main timer (this will cause a refresh)
			_this.functions.startMainTimer();
		};

		_this.functions.refresh = function()
		{
			// routine to refresh the display
			mftv2DataSvc.readMonitor($stateParams.id).then(function(result)
			{
				// formulate the property grid data
				_this.model.monitor = result;

				_this.functions.parseLastActivity();
				_this.functions.parseStatus();
				_this.functions.buildPropertyGrid();
				_this.functions.buildNotifications();
				_this.functions.parseMonitorInformation();
				mftv2DataSvc.buildOperations(_this.model.monitor, mftv2DataSvc.operationsEnum.MONITOR).then(function (result)
				{
					_this.functions.parseStatus();

					_this.model.operations = result;
				}).catch(function (error)
				{
					$log.error("Unable to build Monitor Operations", error);
					_this.model.operations = null;
				});
				if (_this.model.task.data.content && _this.initialLoad)
				{
					$timeout(function () {
						_this.functions.setupCM(_this.model.task.cm, _this.model.task != 'null');
					}, 500);
				}
				_this.initialLoad = false;

			}).catch(function(err)
			{
				$log.error("Unable to read monitor detail", err);
			});
		};

		$scope.$on('$destroy', function ()
		{
			// Make sure that the interval is destroyed too
			uiSvc.cancelTimers(_this.model.timers);
		});


		//</editor-fold>

		//</editor-fold>

		_this.functions.init();
	}]);

});

