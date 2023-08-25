/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciReportingCtrl.js
 /// Base CNO Third Party Commission Intake Reporting Controller
 /// Abstract Controller that is the parent of all TPCI Reporting Controllers
 /// Handles both Enrollments and Commissions

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/05/2022
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('cnoTpciReportingCtrl', ['$scope', '$log', 'transactionReportingSvc', 'speCNODataSvc', 'userSvc', 'cacheDataSvc',function($scope, $log, transactionReportingSvc, dataSvc, userSvc, cacheDataSvc)
	{

	    // get the module
        let _module = dataSvc.getTPCIDepartment();

        // initialize the tabs
		var _this = this;
		_this.functions = {};

        //<editor-fold desc="Functions">
        _this.functions.setFilterDates = function()
        {
            // routine to set the filter dates for customized reporting
            if (!_this.model.filter.meta_inputs)
                return;
            let dateObjects = lodash.filter(_this.model.filterOptions, {type: 5});
            lodash.forEach(dateObjects, function (obj)
            {
                let value = _this.model.filter.meta_inputs[obj.id];
                if (value)
                {
                    transactionReportingSvc.setFilterDates(value);
                }
            });
        };
        _this.functions.getFilter = function()
        {
            var filterObject = {};
            angular.copy(_this.model.filter, filterObject);
            filterObject.fromDate = _this.model.filter.dateRange.startDate.toISOString();
            filterObject.toDate = _this.model.filter.dateRange.endDate.toISOString();

            // sort out the meta-data input
            if (filterObject.meta_inputs)
            {
                filterObject.metaInputs = [];
                lodash.forOwn(filterObject.meta_inputs, function(value, key)
                {
                    let definition = lodash.find(_this.model.filterOptions, {id: key});
                    if (definition)
                    {
                        let obj = {name: definition.name, operator: definition.search, values: value};
                        if (value.startDate)
                        {
                            let dateObj = {};
                            if (typeof value.startDate === 'string')
                                dateObj.startDate = value.startDate;
                            else
                                dateObj.startDate = value.startDate.toISOString();
                            if (typeof value.endDate === 'string')
                                dateObj.endDate = value.endDate;
                            else
                                dateObj.endDate = value.endDate.toISOString();
                            obj.values = [dateObj];
                        };

                        // check for san
                        if (definition.id == "agent_san_npn")
                            filterObject.san_npn = value;
                        else
                            filterObject.metaInputs.push(obj);
                    }
                });
                delete filterObject.meta_inputs;
            }
            return filterObject;
        };

        _this.functions.refreshData = function()
        {
            // routine to formulate the filter object based on the current scope and send the filter object to the server for processing
            _this.model.flags.inProgress = true;
            let filterObject = _this.functions.getFilter();
            dataSvc.refreshTPCISearch(filterObject, filterObject.module).then(function(result)
            {
                // update the vendor count
                let vendors = [];
                if (result.vendors)
                {
                    for (let i = 0; i < result.vendors[0].count; i++)
                        vendors.push({count: i})
                }
                dataSvc.parseTPCICountData(result.total, vendors, _this.model.counts, _module.id);
                _this.model.data = dataSvc.parseTPCIGridData(result.records, filterObject.module);
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
            _this.model.counts = {requests: {value: 0}, succeeded: {value: 0}, failed: {value: 0}, vendors: {value: 0}, premium: {value: 0}, amount:{value: 0}};
            _this.model.dateOptions = {};

            _this.model.otherDateOptions =
                {
                    timePicker: false,
                    alwaysShowCalendars: true,
                    locale: {
                        format: 'MM/DD/YYYY',
                    }
                };

            _this.model.data = [];


            // setup the filter
            _this.model.filter = {topCount: 100, applied: false};
            _this.model.filter.companyId = userSvc.getOrgInfo().companyId;
            _this.model.filter.departments = [];
            _this.model.filter.module = _module.id;
            _this.model.filter.statuses = [];
            _this.model.filter.transactionIds = [];
            _this.model.filter.vendor = [];
            _this.model.filter.product = [];
            _this.model.filter.plan = [];
            _this.model.filter.dateRange =
                {
                    startDate: moment().subtract("days", 1),
                    endDate: moment()
                };
            _this.model.filterName = "cnoTpci_" + module.id + "_Reporting" ;
            $scope.filterName = _this.model.filterName;

            // setup the filters based on the module
            _this.model.filterOptions = [];
            _this.model.filterOptions.push({name:"supplemental", type: 1, caption:"Message", search: 8, id:"supplemental"});
            _this.model.filterOptions.push({name:"system", type: 3, caption:"System", search: 8, params:[{code: "LIFEPRO", description:"Life-Pro"}, {code: "ITXA", description:"ITXA"}], id:"system"});
            _this.model.filterOptions.push({name:"reference.lifepro.id", type: 4, caption:"KFA Policy Number", search: 3, id:"policy"});
            switch (_module.id)
            {
                case dataSvc.tpciModules.ENROLLMENT:
                    _this.model.filterOptions.push({name:"plan_code", type: 4, caption:"Plan Code", search: 8, id:"plan"});
                    _this.model.filterOptions.push({name:"policy.effective_date", type: 5, caption:"Policy Effective Date", search:8, id:"eff_date"});
                    _this.model.filterOptions.push({name:"policy.termination_date", type: 5, caption:"Policy Termination Date", search:8, id:"term_date"});
                    _this.model.filterOptions.push({name:"policy.status", type: 3, caption:"Policy Status", search:8, params:[{code: "A", description:"Active"}, {code: "T", description:"Terminated"}], id:"pol_status"});
                    _this.model.filterOptions.push({name:"agent.number", type: 4, caption:"Agent ID", search: 8, id:"agent_id"});
                    _this.model.filterOptions.push({name:"insured.medicare_id", type: 4, caption:"Medicare ID", search: 8, id:"medicare_id"});
                    _this.model.filterOptions.push({name:"insured.name", type: 4, caption:"Name", search: 3, id:"insured_name"});
                    _this.model.filterOptions.push({name:"insured.state", type: 4, caption:"State", search: 8, id:"insured_state"});
                    _this.model.filterOptions.push({name:"insured.dob", type: 5, caption:"DOB", search: 8, id:"insured_dob"});
                    break;
                case dataSvc.tpciModules.COMMISSION:
                    _this.model.filterOptions.push({name:"agent.number", type: 4, caption:"Agent ID", search: 8, id:"agent_id"});
                    _this.model.filterOptions.push({name:"agent_san", type: 4, caption:"Agent SAN/NPN", search: 8, id:"agent_san_npn"});
                    _this.model.filterOptions.push({name:"plan_code", type: 4, caption:"Plan Code", search: 8, id:"plan"});
                    _this.model.filterOptions.push({name:"policy.effective_date", type: 5, caption:"Policy Effective Date", search:8, id:"eff_date"});
                    _this.model.filterOptions.push({name:"insured.medicare_id", type: 4, caption:"Medicare ID", search: 8, id:"medicare_id"});
                    _this.model.filterOptions.push({name:"insured.name", type: 4, caption:"Name", search: 3, id:"insured_name"});
                    _this.model.filterOptions.push({name:"insured.dob", type: 5, caption:"DOB", search: 8, id:"insured_dob"});
                    break;
            }
        };
        //</editor-fold>

        // initialize the view
        _this.functions.initialize();

        // set any custom filter details
		transactionReportingSvc.loadBaseReportingInfo(_this.model);
        transactionReportingSvc.setFilterDates(_this.model.filter.dateRange);
        _this.functions.setFilterDates();
        if (_this.model.filter.applied)     // saved Filter has been applied
            _this.functions.refreshData();

    }]);

});

