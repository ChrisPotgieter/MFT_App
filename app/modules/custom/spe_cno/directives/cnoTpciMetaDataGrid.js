/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - cnoTpciMetaDataGrid.js
 /// Directive to Manage Meta-Data Grid with Balancing for CNO Third Party Commission Intake
 /// This is similair to the Common Meta-Data Grid except with Additional Buttons to accomodate Balancing

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/06/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function(module)
{
  "use strict";
    module.registerDirective('cnoTpciMetaDataGrid', ['$log', '$window','uiSvc', function($log, $window, uiSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/custom/spe_cno/directives/cnoTpciMetaDataGrid.tpl.html",
        replace: true,
        scope:{
            data:'=',
            type:'@',
            functionManager:'=?'
        },
        bindToController: true,
        controllerAs:'vmMeta',
        controller: function($element, $scope)
        {
            //<editor-fold desc="Function Manager">
            var _this = this;

            _this.functions = {};
            _this.functions.rebuildToolbar = function(type)
            {
                // routine to rebuild the toolbar once the type is known
                _this.model.type = parseInt(type);
                if (_this.model.type > 0)
                {
                    if (_this.model.gridOptions.toolbar.length > 1)
                        _this.model.gridOptions.toolbar.splice(-1);
                    if (_this.model.type == 1)
                        _this.model.gridOptions.toolbar.push({name: "Input Balancing", text:"View Balancing", template: kendo.template($("#templateInputBalancing").html())});
                    if (_this.model.type == 2)
                        _this.model.gridOptions.toolbar.push({name: "Request Balancing", text:"View Balancing", template: kendo.template($("#templateRequestBalancing").html())});
                }
                _this.model.flags.rebuild += 1;
            };
            _this.model = {gridOptions:{}, flags:{gridRefresh:{value: 0}, rebuild: 1}};


            if (!_this.functionManager)
                _this.functionManager = {};

            // add function manager functions
            _this.functionManager.viewUrl = function(url)
            {
                // work out the type based on the type
                $window.open(url);
            };
            _this.functionManager.dataItemClick = function(value, parms)
            {
                // if the data item click check we can sent this somewhere
                if (_this.functionManager != null && _this.functionManager.itemClick)
                {
                    _this.functionManager.itemClick(value, parms);
                }
            };

            _this.functionManager.gridCreate = function(grid)
            {
                uiSvc.addKendoGridTooltip("supplementalStatus", grid, "value");
            };
            //</editor-fold>

            _this.model.gridOptions = {
                toolbar: ["excel"],
                excel: {
                    fileName: "Transaction Meta-Data.xlsx",
                    allPages: true
                },
                sortable: true,
                groupable: false,
                filterable: true,
                resizable: true,
                selectable: "row",
                dataSource:
                    {
                        data: [],
                        sort: {field:"key", dir:"asc"},
                        group:{field: "category" },
                        schema:
                            {
                                model:
                                    {
                                        id: "key",
                                        uid:"key",
                                        fields:
                                            {
                                                key: {type:"string"},
                                                value: {type:"string"},
                                                category: {type:"string"}
                                            }
                                    }
                            }
                    },

                columns: [
                    {
                        field: "key",
                        title: "Key"
                    },
                    {
                        field: "value",
                        title: "Value",
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "supplementalStatus"
                        },
                        template: function(dataItem)
                        {

                            // check for a click
                            if (dataItem.click)
                                return "<span><a ng-click=\"functionManager.dataItemClick('" + dataItem.value + "','" + dataItem.parms + "');\" title=\"" + dataItem.title + "\" >{{dataItem.value}}</a></span>";

                            // check for an HTTP
                            if (typeof dataItem.value === 'string' || dataItem.value instanceof  String)
                            {
                                if ((dataItem.value) && (dataItem.value.toUpperCase().startsWith("HTTP://") || dataItem.value.toUpperCase().startsWith("HTTPS://")))
                                {
                                    return "<span><a ng-click=\"functionManager.viewUrl('" + dataItem.value + "');\" title=\"click here to navigate\" >{{dataItem.value}}</a></span>";
                                }
                            }
                            return dataItem.value;
                        }
                    },
                    {
                        field: 'category',
                        title: 'Category',
                        hidden: true
                    }
                ]
            };

            if (_this.type)
                _this.functions.rebuildToolbar(_this.type);

            //<editor-fold desc="Watches">
            // watch the watch flag
            $scope.$watchCollection("vmMeta.data", function(newValue, oldValue)
            {
                _this.model.flags.gridRefresh += 1;
            }, true);

            $scope.$watch("vmMeta.type", function(newValue, oldValue)
            {
                if (newValue != oldValue)
                    _this.functions.rebuildToolbar(newValue);
            }, true);
            //</editor-fold>
        }
    }
  }]);

});

