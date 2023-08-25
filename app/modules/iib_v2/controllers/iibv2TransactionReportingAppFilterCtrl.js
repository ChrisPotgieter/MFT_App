/*
 /// <summary>
 /// app.modules.iib_v2.controllers - iibv2TransactionReportingAppFilterCtrl.js
 /// IIB V2 Transaction Reporting Application Filtering Controller
 /// Controller to Manage the Application Type Filtering
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/06/2020
 /// </summary>
 */
define(['modules/iib_v2/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('iibv2TransactionReportingAppFilterCtrl', ['$scope',  'cacheDataSvc',function($scope, cacheDataSvc)
	{
        var _this = this;
        _this.functions = {};
        _this.model = $scope.vm.model; // get the parent model
        _this.model.gridType = 1;

        _this.functions.onChange = function(clearInputs)
        {
            // routine to manage the change of the application type to redraw the screen and the grid
            if (_this.model.filter.application == null)
                return;
            var parameterRecord = cacheDataSvc.getListRecord("1", "IIB_APP", _this.model.filter.application, _this.model.filter.companyId);
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
            _this.model.columnBuildCode = _this.model.filter.application;
        };

        // initialize the view
        _this.functions.onChange(_this.model.filter.application == null);

        // perform the search
        if (_this.model.filter.application != null)
            $scope.vm.functions.refreshData();
	}]);

});

