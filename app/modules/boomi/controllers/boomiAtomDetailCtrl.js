/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiAtomDetailCtrl.js
 /// BOOMI Atom Detail Controller
 /// Controller to manage Atom Detail Information Drill
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module', 'appCustomConfig', 'lodash', 'moment'], function (module, appCustomConfig, lodash, moment) {

	"use strict";
	moment().format();

	module.registerController('boomiAtomDetailCtrl', ['$scope', '$log', '$state', '$stateParams', '$filter', '$interval', '$timeout', 'uiSvc', 'boomiDataSvc','adminDataSvc', function($scope, $log, $state, $stateParams, $filter, $interval, $timeout, uiSvc, dataSvc, adminDataSvc)
	{
		// initialize variables
		var _this = this;
		_this.functions = {};
		_this.model = {flags: {initialLoad: true, showProperties: true}};
		_this.palette = dataSvc.getColorPalette();


		//<editor-fold desc="Functions">

		//<editor-fold desc="Operations">

		_this.functions.confirmCLIOperation = function(data)
		{
			data.completeFunction = function(result, isError)
			{
				_this.functions.refresh(true);
			};
			dataSvc.confirmCLIOperation(data);
		};
		//</editor-fold>

		//<editor-fold desc="Parsing">
		_this.functions.parseStatistics = function()
		{
			// routine to update the statistics
			_this.model.statistics = {};
			_this.model.statistics.process_count = 0;
			_this.model.statistics.schedule = {enabled: 0, disabled: 0};
			_this.model.statistics.listener = {enabled: 0, disabled: 0};
			if (!_this.model.atom.statistics)
				_this.model.atom.statistics = {};
			if (_this.model.atom.statistics.process_count != null)
				_this.model.statistics.process_count = _this.model.atom.statistics.process_count + 0;
			if (_this.model.atom.statistics.listener_enabled != null)
				_this.model.statistics.listener.enabled = _this.model.atom.statistics.listener_enabled + 0;
			if (_this.model.atom.statistics.listener_disabled != null)
				_this.model.statistics.listener.disabled = _this.model.atom.statistics.listener_disabled + 0;
			if (_this.model.atom.statistics.schedule_enabled != null)
				_this.model.statistics.schedule.enabled = _this.model.atom.statistics.schedule_enabled + 0;
			if (_this.model.atom.statistics.schedule_disabled != null)
				_this.model.statistics.schedule.disabled = _this.model.atom.statistics.schedule_disabled + 0;

			_this.model.statistics.process_count = $filter("number")(_this.model.statistics.process_count);
			_this.model.statistics.schedule.enabled = $filter("number")(_this.model.statistics.schedule.enabled);
			_this.model.statistics.schedule.disabled = $filter("number")(_this.model.statistics.schedule.disabled);
			_this.model.statistics.listener.enabled = $filter("number")(_this.model.statistics.listener.enabled);
			_this.model.statistics.listener.disabled = $filter("number")(_this.model.statistics.listener.disabled);
		};
		_this.functions.parseProcessData = function()
		{
			let data = dataSvc.parseAtomProcessData(_this.model.atom.processes);

			// now duplicate the data that are listeners
			_this.model.listeners.data = [];
			_this.model.processes.data = [];
			lodash.forEach(data, function(dataRow)
			{
				if (dataRow.schedule_status != null)
				{
					let row = lodash.cloneDeep(dataRow);
					row.status_cd = row.schedule_status;
					row.status_desc = "Schedule " + dataSvc.getScheduleStatusDesc(row.schedule_status);
					if (row.last_schedule_check)
						row.last_check = $filter("kendoDateFilter")(row.last_schedule_check);
					dataSvc.getProcessStatus(row);
					_this.model.processes.data.push(row);
				}
				if (dataRow.listener_status != null && dataRow.listener_status != 99)
				{
					let row = lodash.cloneDeep(dataRow);
					row.status_cd = row.listener_status;
					row.status_desc = "Listener " + dataSvc.getListenerStatusDesc(row.listener_status);

					if (row.last_listener_check)
						row.last_check = $filter("kendoDateFilter")(row.last_listener_check);
					dataSvc.getProcessStatus(row);
					_this.model.listeners.data.push(row);
				}
			});
			_this.model.processes.refresh.value += 1;
			_this.model.listeners.refresh.value += 1;
			delete  _this.model.atom.processes;
		};

		_this.functions.parseStatus = function()
		{
				// routine to parse the status information
			_this.model.atom.type_desc = dataSvc.getAtomType(_this.model.atom.type);
			_this.model.atom.classification_desc = dataSvc.getClassificationDesc(_this.model.atom.classification);
			_this.model.atom.os_name = "Unknown";
			if (_this.model.atom.properties && _this.model.atom.properties.os_name)
				_this.model.atom.os_name = $filter("titleCaseFilter")(_this.model.atom.properties.os_name);


			// parse the status information
			if (_this.model.atom.status_detail)
			{
				_this.model.status = {};
				_this.model.status.problems = "";
				if (_this.model.atom.status_detail.problems)
					_this.model.status.problems = _this.model.atom.status_detail.problems;
				if (_this.model.atom.status_detail.running_time)
					_this.model.status.running_time = $filter("secondsToStringFilter")(_this.model.atom.status_detail.running_time);
				if (_this.model.atom.status_detail.last_restart_time)
					_this.model.status.last_restart_time = uiSvc.formatDate(_this.model.atom.status_detail.last_restart_time);
				delete _this.model.atom.status_detail;
			}
			_this.model.status.description = dataSvc.getAtomStatusDesc(_this.model.atom.status);
			_this.model.atom.sys_date = uiSvc.formatDate(_this.model.atom.sys_date);
			_this.model.status.alertClass = "alert-" + $filter('bootStrapStatusFilter')(dataSvc.getBootStrapStatus(_this.model.atom.status));
			_this.model.status.icon = $filter('bootStrapStatusIconFilter')(dataSvc.getBootStrapStatus(_this.model.atom.status));
		};


		//</editor-fold>

		//<editor-fold desc="Property Grid">
		_this.functions.toggleProperties = function ()
		{
			_this.model.flags.showProperties = !_this.model.flags.showProperties;
		};

		_this.functions.getCategory = function(category)
		{
			let categoryDesc = "General";
			switch (category)
			{
				case 0:
					categoryDesc = "General";
					break;
				case 1:
					categoryDesc = "Hardware";
					break;
				case 2:
					categoryDesc = "Versioning";
					break;
				case 3:
					categoryDesc = "Settings";
					break;
				case 4:
					categoryDesc = "System JVM";
					break;
				case 5:
					categoryDesc = "Hardware Usage";
			}
			return categoryDesc;
		};

		_this.functions.addConfigProperty = function(key, value, valueType, propType)
		{
			// routine to add a config property
			if (!value)
				return;
			let convertValue = value;
			if (valueType == 4)
			{
				convertValue = $filter('titleCaseFilter')(convertValue.toString())
			}
			if (valueType == 2 || valueType == 3 || valueType == 5 || valueType == 6)
			{
				try
				{
					convertValue = parseInt(value);
					if (!isNaN(convertValue))
					{
						if (valueType == 2)
							convertValue = $filter('number')(convertValue);
						if (valueType == 3)
							convertValue = $filter('bytesFilter')(convertValue);
						if (valueType == 5)
							convertValue = $filter('number')(value, 4) + "%"; // 4 decimal places
						if (valueType == 6)
							convertValue = $filter('secondsToStringFilter')(value);

					}
					else
						convertValue = value;
				}
				catch (e)
				{

				}
			}
			if (!propType)
				propType = 3;
			_this.functions.addProperty(propType, key, convertValue);
		};

		_this.functions.addProperty = function(category, key, value)
		{
			if (!value)
				return;

			let categoryDesc = _this.functions.getCategory(category);
			_this.model.propertyGrid.data.push({category: categoryDesc, key: key, value: value});
		};
		_this.functions.buildPropertyGrid = function()
		{
			// routine to build the property grid
			_this.model.propertyGrid.data = [];
			_this.functions.addProperty(0, "Name", _this.model.atom.name);
			_this.functions.addProperty(0, "Environment", _this.model.atom.environment_name);
			_this.functions.addProperty(3, "Environment Identifier", _this.model.atom.environment_id);
			_this.functions.addProperty(0, "Type", _this.model.atom.type_desc);
			_this.functions.addProperty(0, "Classification", _this.model.atom.classification_desc);
			_this.functions.addProperty(0, "Status", _this.model.status.description);
			_this.functions.addProperty(3, "Atomsphere Identifier", _this.model.atom.api_id);
			_this.functions.addProperty(0, "Identifier", _this.model.atom._id);
			let dateInstalled = null;

			if (_this.model.atom.api_info)
			{
				_this.functions.addProperty(1, "Host",_this.model.atom.api_info.host_name);
				_this.functions.addProperty(2, "Boomi Version", _this.model.atom.api_info.current_version);

				dateInstalled = $filter("localUTCEpochDateFilter")(moment(_this.model.atom.api_info.date_installed), "YYYY-MM-DD HH:mm:ss.SSS");
				_this.functions.addConfigProperty("Purge History Days", _this.model.atom.api_info.purge_history_days, 2);
				_this.functions.addConfigProperty("Purge Immediate", _this.model.atom.api_info.purge_immediate, 4);

				if (_this.model.atom.api_info.force_restart_time)
				{
					let parseValue = $filter('secondsToStringFilter')(parseInt(_this.model.atom.api_info.force_restart_time/1000));
					_this.model.atom.api_info.force_restart_time = parseValue;
					_this.functions.addConfigProperty("Force Restart", "Every " + _this.model.atom.api_info.force_restart_time, 0);
				}
			}

			// addition properties
			if (_this.model.atom.properties)
			{
				let properties = _this.model.atom.properties;
				_this.functions.addProperty(2, "Boomi Build", properties.build_number);
				_this.functions.addProperty(1, "OS", properties.os_name + " " + properties.os_version  +  " (x" + properties.atom_arch + ")");
				_this.functions.addProperty(1, "Time Zone", properties.timezone_id);
				_this.functions.addConfigProperty("Execution Mode", properties.process_exec_mode, 4);
				_this.functions.addConfigProperty("Unlimited Crypto", properties.unlimited_crypto,4);
			}
			_this.functions.addProperty(2, "Date Installed", dateInstalled);

			// jvm information
			if (_this.model.atom.jvm)
			{
				let jvm = _this.model.atom.jvm;
				_this.functions.addProperty(4, "JVM Name", jvm.jvm_name + " (" + jvm.jvm_version + ")");
				_this.functions.addProperty(4, "JVM Home", jvm.jvm_home);
				_this.functions.addProperty(4, "Working Directory", jvm.base_directory_path);

				// base hardware
				if (jvm.system_cpu_count)
					_this.functions.addConfigProperty("No of CPU(s)",jvm.system_cpu_count, 2, 1);
				if (jvm.system_total_memory)
					_this.functions.addConfigProperty("Total RAM",jvm.system_total_memory, 3, 1);
				if (jvm.system_total_hdd)
					_this.functions.addConfigProperty("Total Disk",jvm.system_total_hdd, 3, 1);

				// ram stats
				if (jvm.system_used_memory)
					_this.functions.addConfigProperty("Used RAM",jvm.system_used_memory,3,5);
				if (jvm.system_free_memory)
					_this.functions.addConfigProperty("Free RAM",jvm.system_free_memory, 3, 5);
				if (jvm.jvm_total_memory)
					_this.functions.addConfigProperty("JVM RAM",jvm.jvm_total_memory, 3, 4);
				if (jvm.jvm_used_memory)
					_this.functions.addConfigProperty("JVM Used RAM",jvm.jvm_used_memory,3,4);
				if (jvm.jvm_free_memory)
					_this.functions.addConfigProperty("JVM Free RAM",jvm.jvm_free_memory, 3, 4);

				// cpu stats
				_this.functions.addConfigProperty("System CPU %", jvm.system_cpu_load, 5, 5);
				//if (jvm.system_cpu_time)
					//_this.functions.addConfigProperty("CPU Time", jvm.system_cpu_time, 6, 5);
				if (jvm.jvm_cpu_load)
					_this.functions.addConfigProperty("JVM CPU %", jvm.jvm_cpu_load, 5, 4);

				// disk stats
				if (jvm.system_used_hdd)
					_this.functions.addConfigProperty("Used Disk",jvm.system_used_hdd, 3, 5);
				if (jvm.system_free_hdd)
					_this.functions.addConfigProperty("Free Disk",jvm.system_free_hdd, 3, 5);

				if (jvm.temp_free_disk_space)
					_this.functions.addConfigProperty("Free Temp Disk",jvm.temp_free_disk_space, 3, 5);
				if (jvm.atom_free_disk_space)
					_this.functions.addConfigProperty("Free Atom Disk",jvm.atom_free_disk_space, 3, 5);


				_this.functions.addConfigProperty("File Encoding", jvm.file_encoding, 0);
				_this.functions.addConfigProperty("Trace",jvm.trace, 4);

				// max stats
				_this.functions.addConfigProperty("Max File Size", jvm.max_file_size, 3);
				_this.functions.addConfigProperty("Max File Locks", jvm.max_file_locks, 2);
				_this.functions.addConfigProperty("Max Stack Size", jvm.max_stack_size, 2);
				_this.functions.addConfigProperty("Max Open Files", jvm.max_open_files, 2);
				_this.functions.addConfigProperty("Max Memory", jvm.max_memory, 3);
				_this.functions.addConfigProperty("Max Processes", jvm.max_processes, 2);
				_this.functions.addConfigProperty("Max CPU Time", jvm.max_cpu_time, 2);
				_this.functions.addConfigProperty("Max Data Size", jvm.max_data_size, 2);
			}

			// add the publication details
			_this.functions.addProperty(0, "Last Update",_this.model.atom.sys_date);
			if (_this.model.status.last_restart_time)
				_this.functions.addProperty(0, "Last Restart Time",_this.model.status.last_restart_time);

		}
		//</editor-fold>

		//<editor-fold desc="Monitoring and Notifications">
		_this.functions.displayThresholdDialog = function(code, type)
		{
			// routine to display the threshold dialog for the given code and type
			let dialogData = {rows: _this.model.thresholds, options: {code: code, type: type}};
			if (type == 1)
			{
				// system metric
				dialogData.options.perc = true;

				// determine the caption
				switch (code)
				{
					case "MEM":
						dialogData.title = "Memory";
						dialogData.icon = "fa-cogs";
						break;
					case "CPU":
						dialogData.title = "CPU";
						dialogData.icon = "fa-laptop";
						break;
					case "HDD":
						dialogData.title = "HDD";
						dialogData.icon = "fa-hdd-o";
						break;

				}
			}
			else
			{
				// queue metric
				dialogData.options.min = 1;
				dialogData.options.max = 10000;
				switch (type)
				{
					case 2:
						dialogData.title = "Message Depth";
						break;
					case 3:
						dialogData.title = "Dead Letter Limit";
						break;
					case 4:
						dialogData.title = "Topic Subscriber Limit";
						break;

				}
				dialogData.icon = "fa-envelope";
			}

			let controlOptions = {};
			controlOptions.templateUrl = "app/modules/admin/partials/parameter-threshold-entry-edit-dialog.tpl.html";
			controlOptions.controller = "parameterThresholdEntryEditDialogCtrl";
			controlOptions.controllerAs = "vmDetail";
			controlOptions.size = 'md';
			let modalInstance = uiSvc.showDialog(dialogData, controlOptions);
			modalInstance.result.then(function (result)
			{
				_this.model.threshold = result;
				modalInstance.close();
				_this.functions.updateThreshold();
			}, function (err)
			{
				$log.error("Unable to Retrieve ThresholdChanges", err)
			});
		};

		_this.functions.setupValidator = function()
		{
			// routine to setup the boostrap validator for the monitoring options
			// now setup the validator
			let txtJMX = {
				fields: {
					txtJmx: {
						excluded: false,
						group: "#div_jmx",
						validators:
						{
							uri: {
								allowLocal: true,
								message: 'The input is not a valid URL'
							}
						}
					}
				}
			};
			let fields = lodash.merge({}, txtJMX);

			let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
			let innerForm = $($(document.getElementById('frmAtomDetailEdit'))[0]);
			let fv = innerForm.bootstrapValidator(formOptions);
			_this.model.validator = innerForm.data('bootstrapValidator');
		};
		_this.functions.buildNotifications = function()
		{
			// routine to build the dataset needed for the notifications
			_this.model.notification = {validator:{},data:null, read: null};
			let subCode = _this.model.atom.name + "@" + _this.model.atom.environment_name;
			adminDataSvc.readNotificationRule(_this.model.atom.company_id, "BOOMI_ATOM",subCode.toUpperCase()).then(function(result)
			{
				// update the display
				_this.model.notification.data = result;
				_this.model.notification.read = lodash.cloneDeep(result);
				_this.model.notification.isNew = (result.recordStatus == uiSvc.editModes.INSERT);
			}).catch(function(err)
			{
				$log.error("Unable to read Notification Rules", err);
			});
		};
		_this.functions.buildMonitoring = function()
		{
			// routine to initialize the monitoring information
			_this.model.monitor = {};
			let monitor_refresh = 20;
			let monitor_stop = 30;
			let monitor_timeout = 60;
			if (_this.model.atom.monitor)
			{
				_this.model.monitor = _this.model.atom.monitor;
				if (_this.model.monitor.timing)
				{
					monitor_refresh = _this.model.monitor.timing.atom_refresh;
					monitor_stop = _this.model.monitor.timing.atom_stopped;
				}
			}
			if (dataSvc.moduleConfig.jsonData.settings.monitor.max_timeout)
				monitor_timeout = parseInt(dataSvc.moduleConfig.jsonData.settings.monitor.max_timeout);
			dataSvc.moduleConfig.code
			if (!_this.model.monitor)
				_this.model.monitor = {};
			if (!_this.model.monitor.timing)
				_this.model.monitor.timing = {};
			_this.model.monitor.timing.atom_refresh = monitor_refresh;
			_this.model.monitor.timing.atom_stopped = monitor_stop;
			_this.model.monitor.max_timeout = monitor_timeout;
		};



		_this.functions.userNotificationDelete = function()
		{
			// routine to confirm deletion of of the record
			var html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear Atom Notifications ?";
			uiSvc.showSmartAdminBox(html,"Are you sure you want to Clear All Notifications for this Atom ? ",'[No][Yes]', _this.functions.confirmNotificationDelete);
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
			adminDataSvc.saveNotificationRule(_this.model.atom.company_id, _this.model.notification.data).then(function(result)
			{
				_this.functions.buildNotifications();
			});
		};
		_this.functions.updateMonitoring = function()
		{
			let data = {url: _this.model.monitor.url, timing: _this.model.monitor.timing};
			dataSvc.updateAtomMonitoring(_this.model.atom._id, data).then(function (result)
			{
				_this.functions.refresh(true);
				uiSvc.showExtraSmallPopup("Atom Monitoring Update", "Success<br/>Please Restart your " + dataSvc.moduleConfig.code + " Services for Changes to take Effect !", 5000, "#C79121", "fa-exclamation-triangle bounce animated");
			}).catch(function (err)
			{
				$log.error("Unable to Update Atom Monitoring Information", err);
			});
		};

		_this.functions.updateThreshold = function()
		{
			// routine to update a given threshold
			let data = _this.model.threshold;
			data.value = parseInt(data.value);
			dataSvc.updateAtomThreshold(_this.model.atom._id, data).then(function (result)
			{
				_this.functions.refresh(true);
				uiSvc.showExtraSmallPopup("Atom Threshold Update", "Success", 5000);
			}).catch(function (err)
			{
				$log.error("Unable to Update Atom Threshold Information", err);
			});
		};

		_this.functions.checkNotificationUpdate = function()
		{
			let difference = lodash.differenceWith(_this.model.notification.data.jsonData.events, _this.model.notification.read.jsonData.events, lodash.isEqual);
			return difference.length > 0;
		};


		_this.functions.saveMonitoring = function()
		{
			// routine to update monitoring and notification settings
			let valid  = true;
			if (_this.model.validator != null)
			{
				_this.model.validator.validate();
				valid = _this.model.validator.isValid();
			}
			let notificationUpdate = _this.functions.checkNotificationUpdate();
			if (_this.model.notification.validator != null && notificationUpdate)
			{
				_this.model.notification.validator.validate();
				valid = _this.model.notification.validator.isValid();
			}
			if (!valid)
				return;

			// now force an update of the notification and the atom monitoring
			if (notificationUpdate)
			{
				adminDataSvc.saveNotificationRule(_this.model.atom.company_id, _this.model.notification.data).then(function(result)
				{
					_this.model.notification.data = result;
					_this.model.notification.isNew = false;
					_this.functions.updateMonitoring();
				}).catch(function(errNotification)
				{
					$log.error("Unable to Unable Monitor Notifications", errNotification);
				});
			}
			else
				_this.functions.updateMonitoring();
		};


		//</editor-fold>

		//<editor-fold desc="Constructor, Disposal, Timer Management">
		_this.functions.startMainTimer = function()
		{
			// routine to start the main timer which refreshes the details every few seconds
			_this.functions.refresh(true);
			if (_this.model.timers.mainTimer == null)
			{
				let seconds = (appCustomConfig.runMode == uiSvc.modes.DEMO) ? 10 : 60;
				_this.model.timers.mainTimer = $interval(_this.functions.refresh(false), seconds * 1000);
			}
		};

		_this.functions.init  = function()
		{
			// initialize the property grid
			_this.model.propertyGrid = {data:[], options: {}};
			_this.model.propertyGrid.options = {propertyView: true};
			_this.model.timers = {mainTimer: null};


			// initialize the grids
			_this.model.processes = {data:[], refresh: {value: 0}};
			_this.model.listeners = {data:[], refresh: {value: 0}};
			_this.model.services = {data:[], refresh: {value: 0}};
			_this.model.connectors = {data:[], refresh: {value: 0}};
			_this.model.counters = {data:[], refresh: {value: 0}};
			_this.model.queues = {data:[], refresh: {value: 0}, functionManager:{}};
			_this.model.cluster = {data:[], refresh: {value: 0}};
			_this.model.queues.functionManager.cellClick = function(dataItem, column)
			{
				// get the cell value
				let code = dataItem.id;
				let type = column;
				_this.functions.displayThresholdDialog(code, type);
			};
			_this.model.certificates = {data:[], refresh: {value: 0}};

			// start the main timer (this will cause a refresh)
			_this.functions.startMainTimer();

		};
		_this.functions.refresh = function(refreshNotifications)
		{
			// routine to refresh the screen either via the timer or on initial load
			dataSvc.readAtom($stateParams.id).then(function(result)
			{
				// formulate the property grid data
				_this.model.atom = result.atom;

				if (_this.model.atom.monitor && _this.model.atom.monitor.thresholds)
					_this.model.thresholds = _this.model.atom.monitor.thresholds;
				else
					_this.model.thresholds = [];

				//<editor-fold desc="Processes">
				if (_this.model.atom.processes)
				{
					_this.functions.parseProcessData(_this.model.atom.processes);
				}
				//</editor-fold>

				//<editor-fold desc="Services">
				if (_this.model.atom.services)
				{
					_this.model.services.data = dataSvc.parseAtomServiceData(_this.model.atom.services);
					_this.model.services.refresh.value += 1;
					delete _this.model.atom.services;
				}
				//</editor-fold>

				//<editor-fold desc="Connectors">
				if (_this.model.atom.connectors)
				{
					_this.model.connectors.data = dataSvc.parseAtomConnectorData(_this.model.atom.connectors);
					_this.model.connectors.refresh.value += 1;
					delete _this.model.atom.connectors;
				}
				//</editor-fold>

				//<editor-fold desc="Counters">
				if (_this.model.atom.counters)
				{
					_this.model.counters.data = dataSvc.parseAtomCounterData(_this.model.atom.counters);
					_this.model.counters.refresh.value += 1;
					delete _this.model.atom.counters;
				}

				//<editor-fold desc="Queues">
				if (_this.model.atom.queues)
				{
					_this.model.queues.data = dataSvc.parseAtomQueueData(_this.model.atom.queues);
					_this.model.queues.refresh.value += 1;
					delete _this.model.atom.queues;
				}
				//</editor-fold>

				//<editor-fold desc="Cluster">
				if (_this.model.atom.nodes)
				{
					_this.model.cluster.data = dataSvc.parseAtomClusterData(_this.model.atom.nodes);
					_this.model.cluster.refresh.value += 1;
					delete _this.model.atom.nodes;
				}
				//</editor-fold>


				//<editor-fold desc="Certificates">
				if (_this.model.atom.certificates)
				{
					_this.model.certificates.data = dataSvc.parseAtomCertData(_this.model.atom.certificates);
					_this.model.certificates.refresh.value += 1;
					delete _this.model.atom.certificates;
				}
				//</editor-fold>
				_this.functions.parseStatistics();
				_this.functions.parseStatus();
				_this.functions.buildPropertyGrid();
				if (refreshNotifications)
				{
					_this.functions.buildNotifications();
					_this.functions.buildMonitoring();
				}
				_this.model.flags.initialLoad = false;
			}).catch(function(err)
			{
				$log.error("Unable to read atom detail", err);
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

		$timeout(function()
		{
			_this.functions.setupValidator();
		}, 500)

	}]);

});

