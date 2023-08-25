/*
 /// <summary>
 /// modules.common.directives.tables - mqaDynamicTableGrid
 /// Common Module Directive to Manage the UI for Customer Dynamic Tables
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

    module.registerDirective('mqaDynamicTableGrid', ['$timeout','$log', 'cacheDataSvc', 'adminDataSvc', 'uiSvc', 'userSvc', function($timeout, $log, cacheDataSvc, adminDataSvc, uiSvc, userSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/common/directives/tables/mqaDynamicTableGrid.tpl.html",
        replace: true,
        bindToController:{
            filterData:'=',
            configName:'@'

        },
        controllerAs:'vm',
        controller: function($element, $scope)
        {
            var _this = this;
            _this.functions = {};
            _this.model = {gridOptions:{}, flags:{gridRefresh:{value: 0}}, configModel:{}};

            _this.functions.buildGridDefinition = function()
            {
                // routine to build the grid definition for this table based on the config parameters
                _this.model.gridOptions = {
                    resizable: false,
                    selectable: "row",
                    noRecords: true,
                    messages: {
                        noRecords: "No Records Available"
                    },
                    dataSource: {
                        pageSize: 25,
                        sort: [
                            {field: "time", dir: "desc"}
                        ],
                        schema: {
                            model: {
                                id: "rowId",
                                uid:"rowId",
                                fields:
                                    {
                                        time:"date"
                                    }
                            }
                        },
                        aggregate: [
                            {field: "time", aggregate: "count"}]
                    },
                    pageable:
                        {
                        },
                    columns: []
                };

                // build the column structure
                var columns = [{

                        field:"time",
                        title: "Event Date",
                        format:"{0:yyyy-MM-dd HH:mm:ss.fff}",
                        width: "200px",
                        aggregates:["count"],
                        footerTemplate:"No. of Entries: #=count#"
                }
                ];
                if (_this.model.configModel != null)
                {
                    lodash.forEach(_this.model.configModel.jsonData.columns, function(field)
                    {
                        var type = "string";
                        var isNumeric = (field.aggregate.toString() != "99");
                        if (isNumeric)
                            type = "number";
                        if (!field.width)
                            field.width = 300;
                        var fieldName = field.destination.toLowerCase();
                        var column = {
                            field: fieldName,
                            title: field.caption,
                            width: field.width + "px"
                        };
                        if (isNumeric)
                        {
                            type = "number";
                            column.format = "{0:n2}";
                            column.attributes = {style: "text-align:right"};
                            column.headerAttributes = {style: "text-align:right"};

                            // check for summaries
                            var aggType = "sum";
                            var typeDesc = "Total";
                            switch (field.aggregate.toString()) {
                                case "0":
                                    aggType = "sum";
                                    typeDesc = "Total";
                                    break;
                                case "1":
                                    aggType = "average";
                                    typeDesc = "Average";
                                    break;
                                case "2":
                                    aggType = "count";
                                    typeDesc = "Count";
                                    break;
                            }
                            _this.model.gridOptions.dataSource.aggregate.push({field:fieldName , aggregate: aggType});
                            column.aggregates = [];
                            column.aggregates.push(aggType);
                            column.footerTemplate ="<div title=\""  + typeDesc + "\" style=\"text-align: right\">#= kendo.toString(" + aggType + ", 'n2') #</div>";
                        };
                        _this.model.gridOptions.dataSource.schema.model.fields[fieldName] = {type: type};
                        columns.push(column);
                    });
                }
               _this.model.gridOptions.columns = columns;

            };



            // watch the watch flag
            $scope.$watch("vm.filterData", function(newValue, oldValue)
            {
                var model = {companyId: userSvc.getOrgInfo().companyId};
                model.fromDate = new moment(_this.filterData.fromDate).set({hour: 0, minute:0, second: 0, millisecond: 0});
                model.toDate = new moment(_this.filterData.toDate).set({hour: 23, minute:59, second: 0, millisecond: 0});
                model.fromDate = model.fromDate.toDate().toISOString();
                model.toDate = model.toDate.toDate().toISOString();
                model.configCode = _this.model.configModel.code;
                adminDataSvc.readDynamicTable(model).then(function(result)
                {
                    result = uiSvc.parseKendoInfluxData(result);
                    _this.model.data = result;
                    _this.model.flags.gridRefresh.value += 1;
                }).catch(function(err)
                {
                    $log.error("Unable to Query Dynamic Table Data - " + _this.model.configModel.code, err);
                });
            }, true);

            _this.functions.initialize = function()
            {
                // routine to initialize the widget
                var record = cacheDataSvc.getListRecord("1", "DYNAMIC_TABLE", _this.configName);
                if (record == null)
                    throw "Dynamic Table Parameter " + _this.configName + " is invalid for the Company";
                _this.model.configModel = record;

                _this.functions.buildGridDefinition();
            };

            // initialize the widget
            _this.functions.initialize();
       }
    }
  }]);

});

