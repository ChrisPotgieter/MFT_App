/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftMonitorReportingCtrl.js
 /// Base MFT V2 Monitor Reporting Controller
 /// Abstract Controller that is the parent of all MFT Monitor V2 Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module', 'moment'], function (module, moment) {

	moment().format();
	"use strict";

	module.registerController('mftMonitorReportingCtrl', ['$scope', '$log', '$state', 'transactionReportingSvc', 'mftv2DataSvc', 'userSvc',function($scope, $log, $state, transactionReportingSvc, mftv2DataSvc, userSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.navigate = function (id, grid)
        {
            // routine to navigate the user to the agent clicked
            if (grid)
                $scope.grid = grid;
            $scope.filter = _this.model.filter;
            transactionReportingSvc.saveGridDrillState($scope, id);

            // routine to invoke the monitor drill
            $state.go("app.mft_v2.monitor", {id: id});
        };

        _this.functions.transactionDrill = function(id, grid)
        {
            if (grid)
                $scope.grid = grid;
            $scope.filter = _this.model.filter;
            mftv2DataSvc.navigateTransaction(id, $scope);
        };



        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;

            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);

            mftv2DataSvc.monitorSearch(filterObject).then(function(result)
            {
                // update the counts
                 _this.model.counts = mftv2DataSvc.parseMonitorCounts(result.total);
                _this.model.data = mftv2DataSvc.parseMonitorGridData(result.records);
                _this.model.filter.applied = true;

            }).catch(function(err)
            {
                $log.error("Unable to Refresh MFT Monitor Display", err);
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
            _this.model = {flags: { inProgress: false, refresh:{value: 0}}, counts: null};
            _this.model.dateOptions = {};
            _this.model.data = [];

            // setup the filter
            _this.model.filter = {topCount: 50, applied: false};
            _this.model.filter.companyId = userSvc.getOrgInfo().companyId;
            _this.model.filter.statuses = [];
            _this.model.filter.types = [];
            _this.model.filter.names = [];
            _this.model.filter.agents = [];
            _this.model.filterName = "mftv2Monitor";

            // add the specific meta-data elements that they can search on
            $scope.filterName = _this.model.filterName;

            // get the lists for the dropdowns
            mftv2DataSvc.getLists().then(function(result)
            {
                _this.model.lists = result;

            }).catch(function(err)
            {
                $log.error("Unable to get MFT Lists", err);
            })

        };
        //</editor-fold>

        // initialize the view
        _this.functions.initialize();

        // set any custom filter details
		transactionReportingSvc.loadBaseReportingInfo(_this.model);

        if (_this.model.filter.applied)     // saved Filter has been applied
            _this.functions.refreshData();

    }]);

});

