/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionReportingCtrl.js
 /// Base IIB V2 Transaction Reporting Controller
 /// Abstract Controller that is the parent of all IIB Transaction V2 Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/03/2019
 /// </summary>
 */
define(['modules/iib_v2/module', 'moment', 'lodash','appCustomConfig'], function (module, moment, lodash, appCustomConfig) {

	moment().format();
	"use strict";

	module.registerController('iibv2TransactionReportingCtrl', ['$scope', '$log', 'transactionReportingSvc', 'iibv2DataSvc', 'userSvc', 'cacheDataSvc',function($scope, $log, transactionReportingSvc, dataSvc, userSvc, cacheDataSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};
		_this.model = {flags: { inProgress: false, allowEGSelect: false, allowBrokerSelect: false, allowAppSelect: false, columnBuildCode: null}};
		$scope.tabs = [];
		$scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});
        _this.model.filterName = "iibv2Transaction";
        $scope.filterName = _this.model.filterName;



        _this.functions.navigateTransaction = function (transactionId, state)
        {
            // routine to navigate the user to the transaction clicked
            var baseState = state.parent;
            if (baseState.name.indexOf("transactionDetail") > -1)
                transactionReportingSvc.navigateTransaction(baseState.name + ".baseview", {transactionId: transactionId, transactionType: 102});
            else
                transactionReportingSvc.navigateTransaction(baseState.name + ".transactionDetail.baseview", {transactionId: transactionId, transactionType: 102});
        };

        _this.functions.getTransactionFilter = function()
        {
            var filterObject = {};
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
                // check if we have counts
                _this.model.counts = null;
                if (result.total)
                    _this.model.counts = dataSvc.parseTransactionCounts(result);
                if (result.records)
                 _this.model.data = dataSvc.parseTransactionGridData(result.records);
            }).catch(function(err)
            {
            }).finally(function()
            {
                _this.model.flags.inProgress = false;
            });
        };

        // initialize the filter dates
        _this.model.dateOptions = {};

        // setup the filter
		_this.model.data = [];
		_this.model.filter = {topCount: 50};
		_this.model.filter.companyId = userSvc.getOrgInfo().companyId;
		_this.model.filter.status = 0;
		_this.model.filter.excludeHandled = false;

        _this.model.filter.dateRange =
            {
                startDate: moment().subtract("days", 1),
                endDate: moment()
            };
        if (appCustomConfig.runMode == 1)
        {
            _this.model.filter.dateRange =
                {
                    startDate: moment("2018-05-08 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999}),
                    endDate: moment("2018-05-30 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999})
                };
        }

        // add the meta-data filter options
        _this.model.inputFilter = {icon:"fa-exchange", title:"Meta-Data", data:[]};
        _this.model.inputFilter.options = dataSvc.getMetaFields();


        // get the list records
        _this.model.listRecords = {};
        _this.model.listRecords.eg = cacheDataSvc.getListForType("1", "IIB_EG", _this.model.filter.companyId);
        _this.model.listRecords.brokers = cacheDataSvc.getListForType("1", "IIB_BROKER", _this.model.filter.companyId);

        // get the lists for the dropdowns
        dataSvc.getLists().then(function(result)
        {
            _this.model.listRecords.apps = lodash.map(result, function(record)
            {
                return {code: record.code, description: record.description};
            });
            _this.model.flags.allowAppSelect = _this.model.listRecords.apps.length > 1;
            if (_this.model.listRecords.apps.length == 1)
                _this.model.filter.application = _this.model.listRecords.apps[0].code;
        }).catch(function(err)
        {
            $log.error("Unable to get Application Lists", err);
        });

        // initialize the departments
        _this.model.filter.departments = [];

		// add the specific meta-data elements that they can search on
        _this.model.filter.inputs = {};

        // initialize the broker selector
        _this.model.flags.allowBrokerSelect = _this.model.listRecords.brokers.length > 1;
        if (_this.model.listRecords.brokers.length  == 1)
        {
            // select the first entry
            _this.model.filter.broker = this.model.listRecords.brokers[0].code;
        }

        // initialize the execution group selector
        _this.model.flags.allowEGSelect = _this.model.listRecords.eg.length > 1;
        if (_this.model.listRecords.eg.length == 1)
        {
            // select the first entry
            _this.model.filter.executionGroup = _this.model.listRecords.eg[0].code;
        }

        // initialize the other filters
        _this.model.filter.errorCodes = [];
        _this.model.filter.flowNames = [];
        _this.model.filter.operations = null;



        // initialize the view
		transactionReportingSvc.loadBaseReportingInfo(_this.model);
		transactionReportingSvc.setFilterDates(_this.model.filter.dateRange);
	}]);

});

