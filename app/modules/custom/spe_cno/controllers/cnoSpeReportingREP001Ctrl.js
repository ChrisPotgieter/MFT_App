/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoSpeReportingREP001Ctrl.js
 /// CNO REP001 Controller
 /// Abstract Controller to Manage REP001 - CNO
 /// This report produces a Summary of the Documents stored in the Document Database by Status
 //  as per the report specification provided by CNO
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/04/2018
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('cnoSpeReportingREP001Ctrl', ['$scope', '$log', 'userSvc','transactionReportingSvc', 'adminDataSvc','uiSvc','speCNODataSvc', function($scope, $log, userSvc, transactionReportingSvc, adminDataSvc, uiSvc, speCNODataSvc)
	{
		// initialize the tabs
		var _this = this;
		_this.functions = {};
		_this.model = {flags: { inProgress: false}};
		$scope.tabs = [];
		$scope.tabs.push({title:'Grid View', icon:'fa-table', state: '^.gridview', activate: "**.gridview"});
        _this.model.filterName = "CNO_REP001";
        $scope.filterName = _this.model.filterName;


        _this.functions.buildDocumentOptions = function(value)
        {
            var record = lodash.find(_this.model.lists.documentTypes, {code: value});
            if (record != null)
                _this.model.docOptions = record.options;
        };

        _this.functions.changeDocType = function(item, model)
        {
            _this.functions.buildDocumentOptions(model);
        };
        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.fromDate = _this.model.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.dateRange.endDate.toISOString();

            // process the request
            uiSvc.displayKendoLoader("#summaryGrid", true);

            speCNODataSvc.processReport_REP001(filterObject).then(function(result)
            {
                _this.model.data = result;
            })
            .catch(function(err)
            {
                $log.error("Unable to Process Request", err);
            }).finally(function()
            {
                _this.model.flags.inProgress = false;
                uiSvc.displayKendoLoader("#summaryGrid", false);
            });
        };

        // initialize the filter dates
		_this.model.dateRange =
		{
			startDate: moment().subtract("days", 1),
			endDate: moment()
		};
		_this.model.dateOptions = {
            ranges: {
                'Yesterday': [moment().subtract({days: 1}).set({hour: 0, minute:0, second: 0}), moment().subtract({days: 1}).set({hour: 23, minute:59, second: 59})],
                'Today': [moment().set({hour: 0, minute:0, second: 0}), moment().set({hour: 23, minute:59, second: 59})],
                'Current Week': [moment().startOf('week').set({hour: 0, minute:0, second: 0}), moment()],
                'Last Week': [moment().subtract('weeks', 1).set({hour: 0, minute:0, second: 0}), moment()],
                'Current Month': [moment().startOf('month').set({hour: 0, minute:0, second: 0}), moment().endOf('month').set({hour:23, minute: 59, second:59})],
                'Last Month': [moment().subtract('months', 1).set({hour: 0, minute:0, second: 0}), moment()]
            }
        };

		// build the document types
        _this.model.lists = {};
        _this.model.lists.documentTypes = [];
        _this.model.lists.documentTypes.push({code:"837",  description: "Healthcare Claim (837)", options:["A", "B"]});
       // _this.model.lists.documentTypes.push({code: "835", description:"Healthcare Claim Payment (835)", options:["EFT", "ERA"]});



        // create the submitter list
        var model = {companyId: userSvc.getOrgInfo().companyId, type: "SPESubmitter"};
        adminDataSvc.readCyys(model).then(function(result)
        {
            _this.model.lists.submitters = result;
        }).catch(function(err)
        {
            $log.error("Unable to Retrieve ITXA Submitter Profile List", err);
        });

        // setup the filter
		_this.model.data = [];
		_this.model.filter = {};
		_this.model.filter.companyId = userSvc.getOrgInfo().companyId;
		_this.model.filter.subDocType = "ALL";
        _this.model.filter.departments = [];


		// initialize the view
		transactionReportingSvc.loadBaseReportingInfo(_this.model);
		if (_this.model.filter.docType != null)
		{
		    _this.functions.buildDocumentOptions(_this.model.filter.docType);
            _this.functions.refreshData();
        }
	}]);

});

