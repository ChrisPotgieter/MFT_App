/*
 /// <summary>
 /// modules.common.directives.tables - mqaDynamicDashboardList
 /// Common Module Directive to Manage the UI Displaying the all Dynamic Table Widgets for a given Dashboard Identifier
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/05/2018
 /// </summary>
 */

define(['modules/common/module', 'moment','lodash'], function(module, moment, lodash)
{
  "use strict";
    moment().format();

    module.registerDirective('mqaDynamicTableDashboardList', ['$log', 'cacheDataSvc', function($log, cacheDataSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/common/directives/ui/mqaDynamicTableDashboardList.tpl.html",
        replace: true,
        bindToController:{
            filterData:'=',
            identifier:'@'

        },
        controllerAs:'vmDynamicDash',
        controller: function($element, $scope)
        {
            var _this = this;
            _this.functions = {};
            _this.model = [];

            _this.functions.initialize = function()
            {
                // routine to initialize the widget
                var records = cacheDataSvc.getListForType("1", "DynamicTable");
                _this.model = lodash.filter(records, function(record)
                {
                    if (record.jsonData != null && record.jsonData.dashboard == _this.identifier)
                    {
                        record.filterObject = angular.copy(_this.filterData);
                        return record;
                    }
                });
            };
            $scope.$watch("vm.filterData", function(newValue, oldValue)
            {
                // update the copy objects
                lodash.forEach(_this.model, function(row)
                {
                    row.filterObject.fromDate = _this.filterData.fromDate;
                    row.filterObject.toDate = _this.filterData.toDate;
                });
            }, true);


            // initialize the widget
            _this.functions.initialize();
       }
    }
  }]);

});

