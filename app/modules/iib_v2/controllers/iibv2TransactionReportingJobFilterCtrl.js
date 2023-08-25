/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionReportingJobFilterCtrl.js
 /// IIB V2 Transaction Reporting Job Name Filtering Controller
 /// Controller to Manage the Job Name Filtering
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/06/2020
 /// </summary>
 */
define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('iibv2TransactionReportingJobFilterCtrl', ['$scope',  'cacheDataSvc',function($scope, cacheDataSvc)
	{
        var _this = this;
        _this.flags = {};
        _this.functions = {};
        _this.model = $scope.vm.model; // get the parent model
        _this.model.gridType = 2;

        _this.functions.onChange = function(clearInputs)
        {
            // routine to manage the change of the application type to redraw the screen and the grid
            if (_this.model.filter.job == null)
                return;
            var parameterRecord = cacheDataSvc.getListRecord("1", "IIB_JOB", _this.model.filter.job, _this.model.filter.companyId);
            if (parameterRecord != null)
            {
                _this.model.metaFields = parameterRecord.jsonData.metadata;
                _this.model.filter.metaDataFields = lodash.map(_this.model.metaFields, 'name');
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
            _this.model.columnBuildCode = _this.model.filter.job;
        };

        // check if we have job names
        var jobNames = cacheDataSvc.getListForType("1", "IIB_JOB", _this.model.filter.companyId);
        _this.flags.allowJobSelect = jobNames.length > 1;
        if (jobNames.length == 1)
        {
            // select the first entry
            _this.model.filter.job = jobNames[0].code;
        }

        // initialize the view
        _this.functions.onChange(_this.model.filter.job == null);

        // perform the search
        // TODO: Removed this for performance reasons
        /*
        if (_this.model.filter.job != null)
            $scope.vm.functions.refreshData();
         */
	}]);

});

