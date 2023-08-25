/*
 /// <summary>
 /// app.modules.spe.controllers - speGwidReportingCtrl.js
 /// Base SPE Gwid Reporting Controller
 /// Abstract Controller that is the parent of all SPE Gwid Reporting Controllers
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/06//2017
 /// </summary>
 */
define(['modules/spe/module', 'moment', 'lodash','appCustomConfig'], function (module, moment, lodash, appCustomConfig) {

	moment().format();
	"use strict";

	module.registerController('speGwidReportingCtrl', ['$scope', '$log', '$state', '$filter','apiSvc', 'apiProvider', 'transactionReportingSvc', 'speDataSvc', 'userSvc', 'cacheDataSvc',function($scope, $log, $state, $filter, apiSvc, apiProvider, transactionReportingSvc, speDataSvc, userSvc, cacheDataSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};
		_this.model = {flags: { inProgress: false, allowDocSelect: false}};
		$scope.tabs = [];
		$scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});
        _this.model.filterName = "gwidTransaction";
        $scope.filterName = _this.model.filterName;

        _this.functions.navigateTransaction = function (transactionId, state)
        {
            // routine to navigate the user to the transaction clicked
            var baseState = state.parent;
            if (baseState.name.indexOf("transactionDetail") > -1)
                transactionReportingSvc.navigateTransaction(baseState.name + ".baseview", {transactionId: transactionId, transactionType: 2});
            else
                transactionReportingSvc.navigateTransaction(baseState.name + ".transactionDetail.baseview", {transactionId: transactionId, transactionType: 2});
        };

        _this.functions.onDocChange = function(clearInputs)
        {
            // routine to manage the change of the document type to redraw the screen and the grid
            if (_this.model.filter.docType == null)
                return;
            var documentRecord = cacheDataSvc.getListRecord("1", cacheDataSvc.getEDIListType(), _this.model.filter.docType, _this.model.filter.companyId);
            if (documentRecord != null)
            {
                _this.model.metaFields = documentRecord.jsonData.metadata;
                _this.model.metaSearchFields = lodash.filter(_this.model.metaFields, function(row){
                    return row.filter.show > 0;
                });
            }
            if (clearInputs)
            {
                _this.model.data = [];

                // clear the inputs based on the show flag
                lodash.forOwn(_this.model.filter.inputs, function(value, name)
                {
                    if (value != null)
                    {
                        var parameterRecord = lodash.find(_this.model.metaSearchFields, {name: name});
                        if (parameterRecord.filter && (parameterRecord.filter.show == 1))
                            _this.model.filter.inputs[name] = [];
                    }
                });
            }
        };

        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.fromDate = _this.model.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.dateRange.endDate.toISOString();


            // build up the meta-data inputs
            filterObject.metaInputs = [];
            lodash.forOwn(filterObject.inputs, function(value, name)
            {
                if (value != null)
                {
                    var parameterRecord = lodash.find(_this.model.metaSearchFields, {name: name});
                    if (parameterRecord != null)
                    {
                        var metaData = {values: value, name: name, operator: parameterRecord.filter.filterType};
                        filterObject.metaInputs.push(metaData);
                    }
                }
            });
            speDataSvc.GWIDSearch(filterObject).then(function(result)
            {
                speDataSvc.parseGWIDMetaData(result);
                _this.model.data = result;
            }).catch(function(err)
            {
            }).finally(function()
            {
                _this.model.flags.inProgress = false;
            });
        };

        // initialize the filter dates
		_this.model.dateRange =
		{
			startDate: moment().subtract("days", 1),
			endDate: moment()
		};
        if (appCustomConfig.runMode == 1)
        {
            _this.model.dateRange =
                {
                    startDate: moment("2018-05-08 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999}),
                    endDate: moment("2018-05-10 00:00:00", "YYYY-MM-DD HH:mm:ss").set({second: 59, millisecond: 999})
                };
        }

        _this.model.dateOptions = {};

        // setup the filter
		_this.model.data = [];
		_this.model.filter = {topCount: 50};
		_this.model.filter.companyId = userSvc.getOrgInfo().companyId;
		_this.model.filter.status = 0;
		_this.model.document_list_type = cacheDataSvc.getEDIListType();

		// initialize the document type selector
        var docTypes = cacheDataSvc.getListForType("1", cacheDataSvc.getEDIListType(), _this.model.filter.companyId);
        _this.model.flags.allowDocSelect = docTypes.length > 1;
        if (docTypes.length == 1)
		{
			// select the first entry
			_this.model.filter.docType = docTypes[0].code;
			_this.functions.onDocChange(true);
		}


        // initialize the departments
        _this.model.filter.departments = [];

		// add the specific meta-data elements that they can search on
        _this.model.filter.inputs = {};


		// initialize the view
		var stateObject = transactionReportingSvc.loadBaseReportingInfo(_this.model);

		_this.functions.onDocChange(false);

		// perform the search
        if (_this.model.filter.docType != null)
            _this.functions.refreshData();
	}]);

});

