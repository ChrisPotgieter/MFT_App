/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftAgentDetailCtrl.js
 /// MFT V2 Agent Detail Controller
 /// Controller to manage Agent Detail Information Drill
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module', 'appCustomConfig', 'lodash'], function (module, appCustomConfig, lodash) {

	"use strict";

	module.registerController('mftAgentDetailCtrl', ['$scope', '$log', '$state', '$stateParams', '$filter', '$interval', 'uiSvc', 'mftv2DataSvc','adminDataSvc', 'transactionReportingSvc', function($scope, $log, $state, $stateParams, $filter, $interval, uiSvc, mftv2DataSvc, adminDataSvc, transactionReportingSvc)
	{
		// initialize variables
		var _this = this;
		_this.functions = {};
		_this.model = {flags: {initialLoad: true, showProperties: true, monitorRefresh: {value: 0}, refreshSourceTransfers: {value: 0}, refreshDestinationTransfers:{value: 0}}};

		//<editor-fold desc="Functions">



		//<editor-fold desc="Operations">

		_this.functions.refreshMonitors = function()
		{
			_this.model.flags.monitorRefresh.value +=1;
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
		_this.functions.buildTransfers = function()
		{
			_this.model.source_transfers = [];
			_this.model.destination_transfers = [];
			if (_this.model.agent.source_transfers) {
				_this.model.source_transfers = mftv2DataSvc.parseAgentTransferData(_this.model.agent.source_transfers);
			}
			else
				_this.model.source_transfers = [];
			_this.model.flags.refreshSourceTransfers.value += 1;
			if (_this.model.agent.destination_transfers)
				_this.model.destination_transfers = mftv2DataSvc.parseAgentTransferData(_this.model.agent.destination_transfers);
			else
				_this.model.destination_transfers = [];
			_this.model.flags.refreshDestinationTransfers.value += 1;

		};

		_this.functions.parseStatus = function()
		{
			// routine to parse the status information
			_this.model.agent.typeDesc = mftv2DataSvc.getAgentType(_this.model.agent.type);
			_this.model.status = {};
			_this.model.status.description = mftv2DataSvc.getStatusDesc(_this.model.agent.status);
			_this.model.agent.description = lodash.unescape(_this.model.agent.description);
			_this.model.agent.started_time = uiSvc.formatDate(_this.model.agent.started_time);
			_this.model.agent.sys_date = uiSvc.formatDate(_this.model.agent.sys_date);
			_this.model.agent.last_publish_date = uiSvc.formatDate(_this.model.agent.last_publish_date);
			_this.model.agent.osname = $filter('titleCaseFilter')(_this.model.agent.osname);
			_this.model.status.alertClass = "alert-" + $filter('bootStrapStatusFilter')(mftv2DataSvc.getBootStrapStatus(_this.model.agent.status));
			_this.model.status.icon = $filter('bootStrapStatusIconFilter')(mftv2DataSvc.getBootStrapStatus(_this.model.agent.status));
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
					categoryDesc = "MFT Information";
					break;
				case 1:
					categoryDesc = "System Information";
					break;
				case 2:
					categoryDesc = "MFT Version";
					break;
				case 3:
					categoryDesc = "MQ Connectivity";
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
			_this.functions.addProperty(0, "Name", _this.model.agent.agent_name);
			_this.functions.addProperty(0, "Queue Manager", _this.model.agent.queue_manager);
			_this.functions.addProperty(0, "Description", _this.model.agent.description);
			_this.functions.addProperty(0, "Type", _this.model.agent.typeDesc);
			_this.functions.addProperty(0, "Status", _this.model.status.description);
			if (_this.model.agent.properties && _this.model.agent.properties.commandTime)
				_this.functions.addProperty(0, "Command Time",uiSvc.formatDate(_this.model.agent.properties.commandTime));

			if (_this.model.agent.version)
			{
				_this.functions.addProperty(2, "Release",_this.model.agent.version.product);
				_this.functions.addProperty(2, "Build", _this.model.agent.version.build);
				_this.functions.addProperty(2, "Interface", _this.model.agent.version.interface);
			}
			_this.functions.addProperty(1, "Host", _this.model.agent.host);
			_this.functions.addProperty(1, "Operating System", _this.model.agent.osname);
			_this.functions.addProperty(1, "Time Zone", _this.model.agent.time_zone);

			// connection details
			if (_this.model.agent.connection_details)
			{
				_this.functions.addProperty(3, "Co-ordinator", _this.model.agent.coordinator);
				_this.functions.addProperty(3, "Host",_this.model.agent.connection_details.host);
				_this.functions.addProperty(3, "Port", _this.model.agent.connection_details.port);
				_this.functions.addProperty(3, "Channel", _this.model.agent.connection_details.channel);

			}

			// add the publication details
			_this.functions.addProperty(4, "Last Update",_this.model.agent.sys_date);
			if (_this.model.agent.last_publish_date)
				_this.functions.addProperty(4, "Last Publication",_this.model.agent.last_publish_date);
			if (_this.model.agent.properties && _this.model.agent.properties.agentStatusPublishRateMin)
				_this.functions.addProperty(4, "Publish Rate Min.",$filter('secondsToStringFilter')(_this.model.agent.properties.agentStatusPublishRateMin));

			_this.functions.addProperty(99, "Identifier", _this.model.agent._id);
		}
		//</editor-fold>

		//<editor-fold desc="Notifications">
		_this.functions.buildNotifications = function()
		{
			// routine to build the dataset needed for the notifications
			_this.model.notification = {validator:{},data:null};
			let subCode = _this.model.agent.agent_name + "@" + _this.model.agent.queue_manager + "@" + _this.model.agent.coordinator;
			adminDataSvc.readNotificationRule(_this.model.agent.company_id, "MFT_AGENT",subCode.toUpperCase()).then(function(result)
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
			uiSvc.showSmartAdminBox(html,"Are you sure you want to Clear All Notifications for this Agent ? ",'[No][Yes]', _this.functions.confirmNotificationDelete);
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
			adminDataSvc.saveNotificationRule(_this.model.agent.company_id, _this.model.notification.data).then(function(result)
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
			adminDataSvc.saveNotificationRule(_this.model.agent.company_id, _this.model.notification.data).then(function(result)
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
			// initialize the property grid
			_this.model.propertyGrid = {data:[], options: {}};
			_this.model.propertyGrid.options = {propertyView: true};
			_this.model.timers = {mainTimer: null}


			// initialize the  monitor grid
			_this.model.monitors = {counts:{}, data:[], gridOptions:{height: 0}, scope:{vm:{model:{filterName:"mftv2AgentMonitorDrill"}}}};
			_this.model.source_transfers = [];
			_this.model.destination_transfers = [];
			_this.model.monitors.stateManager = {};
			transactionReportingSvc.initializeDefaultStateManager(_this.model.monitors.scope, _this.model.monitors.stateManager);


			_this.model.monitors.stateManager.drill = function(model)
			{
				// routine to manage the drill on the monitor grid - drill to a monitor
				$state.go("app.mft_v2.monitor", {id: model.id});
			};
			_this.model.monitors.stateManager.transactionDrill = function(id, grid)
			{
				// routine to manage the transaction drill on the monitor grid - drill to a transaction
				mftv2DataSvc.transactionDrill(id);
			};
			// start the main timer (this will cause a refresh)
			_this.functions.startMainTimer();

		};
		_this.functions.refresh = function()
		{
			// routine to refresh the screen either via the timer or on initial load
			mftv2DataSvc.readAgent($stateParams.id).then(function(result)
			{
				// formulate the property grid data
				_this.model.agent = result.agent;
				if (result.monitors)
				{
					_this.model.monitors.counts = mftv2DataSvc.parseMonitorCounts(result.monitors.total);
					_this.model.monitors.data = mftv2DataSvc.parseMonitorGridData(result.monitors.records);
					_this.model.flags.monitorRefresh.value += 1;
				}

				_this.functions.parseStatus();
				_this.functions.buildPropertyGrid();
				_this.functions.buildNotifications();
				_this.functions.buildTransfers();
				mftv2DataSvc.buildOperations(_this.model.agent, mftv2DataSvc.operationsEnum.AGENT).then(function (result)
				{
					_this.model.operations = result;
				}).catch(function (error)
				{
					$log.error("Unable to build MFT Agent Operations", error);
					_this.model.operations = null;
				});
				_this.model.flags.initialLoad = false;
			}).catch(function(err)
			{
				$log.error("Unable to read agent detail", err);
			});

		}

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

