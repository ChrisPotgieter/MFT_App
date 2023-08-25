/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedTransactionReportingCtrl
 /// SPE InstaMed Extension
 /// Abstract Controller that is the parent of all Transaction Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */
define(['modules/spe/module', 'moment', 'lodash','appCustomConfig'], function (module, moment, lodash, appCustomConfig) {

	moment().format();
	"use strict";

	module.registerController('speInstaMedTransactionReportingCtrl', ['$scope', '$log', '$state','speInstamedDataSvc', 'transactionReportingSvc', 'userSvc', 'cacheDataSvc', function($scope, $log, $state, speInstamedDataSvc, transactionReportingSvc, userSvc, cacheDataSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};
        $scope.tabs = [];
        $scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});
        _this.model = {flags: { inProgress: false, allowDivisionSelect: false}, holdingCompany: null, divisions:[], filter:{}};
        _this.model.titles = speInstamedDataSvc.getProcTitles();
        _this.model.filter.divisions = [];
        _this.model.filterName = "speInstamedTransaction";

        $scope.filterName = _this.model.filterName;

        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.fromDate = _this.model.filter.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.filter.dateRange.endDate.toISOString();
            speInstamedDataSvc.balancingSearch(filterObject).then(function(result)
            {
                _this.model.data = result;
            }).catch(function(err)
            {
                $log.error("Unable to retrieve Balancing Results", err);
            }).finally(function()
            {
                _this.model.flags.inProgress = false;
            });
        };

        _this.functions.onHoldingCompanyChange = function(clearInputs)
        {
            // routine to manage the change by the user of the holding company
            if (_this.model.filter.holdingCompany == null)
                return;
            var parameterRecord = cacheDataSvc.getListRecord("1", "HoldingCompany", _this.model.filter.holdingCompany, _this.model.filter.companyId);
            if (parameterRecord != null)
            {
                _this.model.divisions = parameterRecord.jsonData.divisions;
            }
            _this.model.flags.allowDivisionSelect = _this.model.divisions.length > 0;
            if (clearInputs)
                _this.model.filter.divisions = [];
        };

        // initialize the filter dates
        _this.model.dateOptions = {};

        // setup the filter
		_this.model.data = [];
		_this.model.filter = {topCount: 50};
		_this.model.filter.companyId = userSvc.getOrgInfo().companyId;
		_this.model.filter.status = 0;


        _this.model.filter.dateRange =
            {
                startDate: moment().subtract("days", 1),
                endDate: moment()
            };
        if (appCustomConfig.runMode == 1)
        {
            _this.model.filter.dateRange =
                {
                    startDate: moment("2020-03-08 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999}),
                    endDate: moment("2020-05-30 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999})
                };
        }

        // initialize the holding company
        var holdingCompanies = cacheDataSvc.getListForType("1", "HoldingCompany", _this.model.filter.companyId);
        _this.model.flags.allowHoldingSelect = holdingCompanies.length > 1;
        if (holdingCompanies.length == 1)
        {
            // select the first entry
            vm.model.filter.holdingCompany = holdingCompanies[0].code;
            _this.functions.onHoldingCompanyChange(true);
        }

        // initialize the departments
        _this.model.filter.departments = [];

        // initialize the view
		transactionReportingSvc.loadBaseReportingInfo(_this.model);
        transactionReportingSvc.setFilterDates(_this.model.filter.dateRange);

        // re-initialize the holding company in the event that this is a custom report
        _this.functions.onHoldingCompanyChange(true);


	}]);

});

