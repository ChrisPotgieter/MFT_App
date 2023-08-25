/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiAtomReportingCtrl.js
 /// Base BOOMI Atom Reporting Controller
 /// Abstract Controller that is the parent of all BOOMI Atom Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define(['modules/boomi/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('boomiAtomReportingCtrl', ['$scope', '$log', '$state', 'uiSvc', 'transactionReportingSvc', 'boomiDataSvc', 'userSvc',function($scope, $log, $state, uiSvc, transactionReportingSvc, boomiDataSvc, userSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.navigate = function (id, grid)
        {
            // routine to navigate the user to the atom clicked
            boomiDataSvc.navigateAtom(id, grid, $scope, _this.model.filter);
        };

        _this.functions.buildClassifications = function()
        {
            // routine to build the right classifications based on the data
            boomiDataSvc.readEnvironments().then(function(environments)
            {
                let found = lodash.indexOf(environments, "PROD");
                if (found == -1)
                {
                    _this.model.flags.allowProd = false;
                    _this.model.filter.prod = false;
                }
                found = lodash.indexOf(environments, "TEST");
                if (found == -1)
                {
                    _this.model.flags.allowTest = false;
                    _this.model.filter.test = false;
                }
            });
        };


        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);

            boomiDataSvc.atomSearch(filterObject).then(function(result)
            {
                // update the counts
                 _this.model.counts = boomiDataSvc.parseAtomCounts(result.total);
                _this.model.data = boomiDataSvc.parseAtomGridData(result.records);
                _this.model.filter.applied = true;
            }).catch(function(err)
            {
                $log.error("Unable to Refresh Boomi Agent Display", err);
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
            _this.model = {flags: { inProgress: false, refresh:{value: 0}, allowTest: true, allowProd: true}, counts: null};
            _this.model.dateOptions = {};
            _this.model.data = [];

            // setup the filter
            _this.model.filter = {applied: false};
            _this.model.filter.companyId = userSvc.getOrgInfo().companyId;
            _this.model.filter.prod = true;
            _this.model.filter.test = true;
            _this.model.filter.statuses = [];
            _this.model.filter.types = [];
            _this.model.filter.names = [];
            _this.model.filter.environments = [];
            _this.model.filter.os = [];
            _this.model.filter.hosts = [];
            _this.model.filter.apiIds = [];
            _this.model.filterName = "boomiAtom";

            // add the specific meta-data elements that they can search on
            $scope.filterName = _this.model.filterName;

            // based on the module config allow the right classifications
            _this.functions.buildClassifications();


            // get the lists for the dropdowns
            boomiDataSvc.getLists().then(function(result)
            {
                _this.model.lists = result;

            }).catch(function(err)
            {
                $log.error("Unable to get Boomi Lists", err);
            })

        };
        //</editor-fold>

        // initialize the view
        _this.functions.initialize();

        // set any custom filter details
		transactionReportingSvc.loadBaseReportingInfo(_this.model);

		if (_this.model.filter.applied)
            _this.functions.refreshData();
	}]);

});

