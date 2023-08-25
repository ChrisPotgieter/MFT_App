/*
 /// <summary>
 /// app.modules.spe.controllers - speTransactionReportingCtrl.js
 /// Base SPE Transaction Reporting Controller
 /// Abstract Controller that is the parent of all SPE Transaction Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/05/2016
 /// </summary>
 */
define(['modules/spe/module', 'moment', 'lodash', 'appCustomConfig'], function (module, moment, lodash, appCustomConfig) {

	moment().format();
	"use strict";

	module.registerController('speTransactionReportingCtrl', ['$scope', '$log', '$state', '$filter','apiSvc', 'apiProvider', 'transactionReportingSvc', 'speDataSvc', 'userSvc', 'cacheDataSvc',function($scope, $log, $state, $filter, apiSvc, apiProvider, transactionReportingSvc, speDataSvc, userSvc, cacheDataSvc)
	{

		// initialize the tabs
		var _this = this;
		_this.functions = {};

		//<editor-fold desc="Functions">
		_this.functions.navigate = function(model, grid)
		{
			// routine to drill into the data
			if (grid)
				$scope.grid = grid;
			if (_this.model.filter.dateRange)
				$scope.dateRange = _this.model.filter.dateRange;
			$scope.filter = _this.model.filter;

			let navigateModel = {transactionId: model._id, mqaModule: 2};
			transactionReportingSvc.transactionDrill(navigateModel,$scope);
	};
		_this.functions.getTransactionFilter = function()
		{
			var filterObject = {};
			angular.copy(_this.model.filter, filterObject);
			filterObject.fromDate = _this.model.filter.dateRange.startDate.toISOString();
			filterObject.toDate = _this.model.filter.dateRange.endDate.toISOString();
		return filterObject;
		};
		_this.functions.refreshData = function()
		{
			// routine to formulate the filter object based on the current scope and send the filter object to the server for processing
			_this.model.flags.inProgress = true;
			let filterObject = _this.functions.getTransactionFilter();
			speDataSvc.refreshData(filterObject).then(function(result)
			{
				_this.model.data = speDataSvc.parseKendoGridData(result.records);
				_this.model.filter.applied = true;
			}).catch(function(err)
			{
				$log.error("Unable to Refresh Transaction Display", err);
			}).finally(function()
			{
				_this.model.flags.inProgress = false;
			});
		};


		_this.functions.initialize = function()
		{
			// routine to initialize the controller
			$scope.tabs = [];
			$scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});

			// model variables
			_this.model = {flags: { inProgress: false, allowSearch: true, refresh:{value: 0}}, counts: null};
			_this.model.lists = {};
			_this.model.dateOptions = {};
			_this.model.data = [];


			// get the sender id list
			_this.functions.buildSenderReceiverList();


			// setup the filter
			_this.model.filter = {topCount: 50, applied: false};
			_this.model.filter.companyId = userSvc.getOrgInfo().companyId;
			_this.model.filter.status = 0;
			_this.model.filter.senders = [];
			_this.model.filter.receivers = [];
			_this.model.filter.docTypes = [];
			_this.model.filter.jobNames = [];
			_this.model.filter.transactionIds = [];
			_this.model.filter.gwidIds = [];
			_this.model.filter.departments = [];
			_this.model.filter.systems = [];
			_this.model.filter.containers = [];
			_this.model.filter.maps = [];
			_this.model.filter.dateRange =
				{
					startDate: moment().subtract("days", 1),
					endDate: moment()
				};
			_this.model.filterName = "speTransaction";

			// add the specific meta-data elements that they can search on
			$scope.filterName = _this.model.filterName;

			// if in debug mode set the dates
			if (appCustomConfig.runMode == 1)
			{
				_this.model.filter.dateRange =
					{
						startDate: moment("2020-09-06 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999}),
						endDate: moment("2018-09-07 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999})
					};
			}
		};

        _this.functions.buildSenderReceiverList = function ()
		{
			// routine to build the sender receiver list and update scope variables
			var records = cacheDataSvc.getListForType("1", "SPESender", userSvc.getOrgInfo().companyId);
			_this.model.lists.senders = lodash.map(records, function(record)
			{
				return {name: record.jsonData.sender_name, id: record.jsonData.gs_senderCode};
			});
			_this.model.lists.receivers = lodash.map(records, function(record)
            {
                return {name: record.jsonData.receiver_name + " (" + record.jsonData.gs_receiverCode + ")", id: record.jsonData.gs_receiverCode};
            });
            _this.model.lists.senders = lodash.uniqBy(_this.model.lists.senders, "id");
            _this.model.lists.receivers = lodash.uniqBy(_this.model.lists.receivers, "id");
        };
		//</editor-fold>

		// initialize the view
		_this.functions.initialize();

		// set any custom filter details
		transactionReportingSvc.loadBaseReportingInfo(_this.model);
		transactionReportingSvc.setFilterDates(_this.model.filter.dateRange);

		if (_this.model.filter.applied)     // saved Filter has been applied
			_this.functions.refreshData();

	}]);

});
