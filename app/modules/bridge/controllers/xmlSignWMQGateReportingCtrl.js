/*
 /// <summary>
 /// app.modules.bridge.controllers - xmlSignWMQGateReportingCtrl.js
 /// Base XML Sign WMQ Gateway Reporting Controller
 /// Abstract Controller that is the parent of all XML Sign WMQ Gateway Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/04/2022
 /// </summary>
 */
define(['modules/bridge/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('xmlSignWMQGateReportingCtrl', ['$scope', '$log', 'transactionReportingSvc', 'bridgeDataSvc', 'userSvc', 'cacheDataSvc',function($scope, $log, transactionReportingSvc, bridgeDataSvc, userSvc, cacheDataSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.getFilter = function()
        {
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.direction = parseInt(filterObject.direction);
            filterObject.fromDate = _this.model.filter.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.filter.dateRange.endDate.toISOString();
            return filterObject;
        };

        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            let filterObject = _this.functions.getFilter();
            bridgeDataSvc.XMLSignWMQGateSearch(filterObject).then(function(result)
            {
                // update the counts

                bridgeDataSvc.parseXMLSignCountData(result.total, _this.model.counts);
                _this.model.data = bridgeDataSvc.parseXMLSignWMQGateGridData(result.records);
                _this.model.filter.applied = true;
            }).catch(function(err)
            {
                $log.error("Unable to Refresh Display", err);
            }).finally(function()
            {
                _this.model.flags.inProgress = false;
            });
        };


        _this.functions.initialize = function()
        {
            // routine to initialize the controller

            // shown tabs
            $scope.tabs = [];
            $scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});

            // model variables
            _this.model = {flags: { inProgress: false, allowSearch: true, refresh:{value: 0}}, lists:{}, counts: null};
            _this.model.counts = {requests: {value: 0}, succeeded: {value: 0}, failed: {value: 0}, run_time: {value: 0}, avg_runtime: {value: 0}};

            let statusRecords = cacheDataSvc.getListForType("0", "FTEStatus");
            let allowedStatus = lodash.filter(statusRecords, function(record)
            {
                let code = parseInt(record.code);
                return (code == 90 || code == 3 || code == 5 || code == 6);
            });
            _this.model.lists.status = lodash.map(allowedStatus, function (record)
            {
                let code = parseInt(record.code);
                switch (code)
                {
                    case 3:
                        code = 10;
                        break;
                    case 5:
                        code = 11;
                        break;
                    case 6:
                        code = 12;
                }
                return {code: code, description: record.description};
            });
            _this.model.dateOptions = {};
            _this.model.data = [];

            // setup the filter
            _this.model.filter = {topCount: 100, applied: false};
            _this.model.filter.companyId = userSvc.getOrgInfo().companyId;
            _this.model.filter.departments = [];
            _this.model.filter.statuses = [];
            _this.model.filter.direction = 1;
            _this.model.filter.transactionIds = [];
            _this.model.filter.inputQueues = [];
            _this.model.filter.outputQueues = [];
            _this.model.filter.serviceNames = [];
            _this.model.filter.senders = [];
            _this.model.filter.receivers = [];
            _this.model.filter.dateRange =
                {
                    startDate: moment().subtract("days", 1),
                    endDate: moment()
                };
            _this.model.filterName = "xmlSignWMQGateReporting";
            $scope.filterName = _this.model.filterName;
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

