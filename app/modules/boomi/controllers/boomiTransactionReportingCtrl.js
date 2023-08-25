/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiTransactionReportingCtrl.js
 /// Base Boomi Transaction Reporting Controller
 /// Abstract Controller that is the parent of all Boomi Transaction Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/10/2022
 /// </summary>
 */
define(['modules/boomi/module', 'moment', 'lodash','appCustomConfig'], function (module, moment, lodash, appCustomConfig) {

	moment().format();
	"use strict";

	module.registerController('boomiTransactionReportingCtrl', ['$scope', '$log', 'transactionReportingSvc', 'boomiDataSvc', 'userSvc', function($scope, $log, transactionReportingSvc, dataSvc, userSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};

        //<editor-fold desc="Functions">

        _this.functions.navigate = function(id, grid)
        {
            // routine to drill into the data
            if (grid)
                $scope.grid = grid;
            if (_this.model.filter.dateRange)
                $scope.dateRange = _this.model.filter.dateRange;
            $scope.filter = _this.model.filter;
            dataSvc.navigateTransaction(id, $scope);
        };

        _this.functions.getTransactionFilter = function()
        {
            let filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.fromDate = _this.model.filter.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.filter.dateRange.endDate.toISOString();

            // check for filter dialog inputs
            filterObject.metaInputs = dataSvc.getMetaInputs(_this.model.inputFilter);
            return filterObject;
        };

        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            let filterObject = _this.functions.getTransactionFilter();
            dataSvc.transactionSearch(filterObject).then(function(result)
            {
                // update the counts
                _this.model.counts = dataSvc.parseTransactionCounts(result.total);
                _this.model.data = dataSvc.parseTransactionGridData(result.records);
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

            // shown tabs
            $scope.tabs = [];
            $scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});

            // model variables
            _this.model = {flags: { inProgress: false, allowSearch: true, refresh:{value: 0}}, counts: null};
            _this.model.lists = {agent_at_qm :[]};
            _this.model.dateOptions = {};
            _this.model.data = [];

            // get the lists for the dropdowns
            dataSvc.getLists().then(function(result)
            {
                _this.model.lists = result;

            }).catch(function(err)
            {
                $log.error("Unable to get Boomi Lists", err);
            });


            // setup the filter
            _this.model.filter = {topCount: 50, applied: false};
            _this.model.filter.companyId = userSvc.getOrgInfo().companyId;
            _this.model.filter.statuses = [];
            _this.model.filter.jobNames = [];
            _this.model.filter.atoms = [];
            _this.model.filter.transactionIds = [];
            _this.model.filter.departments = [];
            _this.model.filter.dateRange =
                {
                    startDate: moment().subtract("days", 1),
                    endDate: moment()
                };
            _this.model.filterName = "boomiTransaction";
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

            // add the meta-data filter options
            _this.model.inputFilter = {icon:"fa-exchange", title:"Meta-Data", data:[]};
            _this.model.inputFilter.options = dataSvc.getMetaFields();

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

