/*
 /// <summary>
 /// modules.common.directives.tables - mqaMetaDataGrid
 /// Common Module Directive to Manage the UI for Meta-Data Type Tables
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/03/2019
 /// </summary>
 */

define(['modules/common/module'], function(module)
{
  "use strict";
    module.registerDirective('mqaMetaDataGrid', ['$log', '$window', 'uiSvc', function($log, $window, uiSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/common/directives/tables/mqaMetaDataGrid.tpl.html",
        replace: true,
        scope:{
            data:'=',
            height:'@?',
            options:'=?',
            id:"@?",
            functionManager:'=?',

        },
        bindToController: true,
        controllerAs:'vm',
        controller: function($element, $scope)
        {
            var _this = this;

            _this.functions = {};
            if (!_this.id)
                _this.id = "meta-data-grid";

            if (!_this.height)
                _this.height = "600";

            _this.model = {gridOptions:{}, flags:{gridRefresh:{value: 0}, editable: false}, configModel:{}, height: _this.height};


            //<editor-fold desc="Function Manager">
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

            //<editor-fold desc="Grid Options">
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
                            style: "text-overflow:ellipsis;white-space:wrap;",
                            class: "supplementalStatus"
                        },
                        template: function(dataItem)
                        {

                            // check for a click
                            if (dataItem.click)
                            {
                                return "<span><a ng-click=\"functionManager.dataItemClick('" + dataItem.value + "','" + dataItem.parms + "');\" title=\"" + dataItem.title + "\" >{{dataItem.value}}</a></span>";
                            }

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

            if (_this.options)
            {
                if (_this.options.propertyView || _this.options.editView)
                {
                    if (!_this.options.allowExport)
                    {
                        delete _this.model.gridOptions.toolbar;
                        delete _this.model.gridOptions.excel;
                    }
                    delete _this.model.gridOptions.dataSource.sort;
                }
                if (_this.options.title)
                    _this.model.title = _this.options.title;
                if (_this.options.editView)
                {
                    delete _this.model.gridOptions.dataSource.group;
                    let gridEditFunctions = {};
                    _this.model.flags.editable = true;
                    _this.model.flags.allowAdd = _this.options.allowAdd ?? true;
                    gridEditFunctions.refresh = function()
                    {
                       // _this.model.flags.gridRefresh += 1;
                    };
                    gridEditFunctions.rowInitialize = function()
                    {
                        let row = { recordStatus: uiSvc.editModes.INSERT, key:null, value: null};
                        return row;
                    };
                    gridEditFunctions.showRecord = function(dialogData, record)
                    {
                        dialogData.title = "Meta Entry";
                        if (_this.options.title)
                            dialogData.title = _this.options.title;
                        dialogData.icon = "fa-info-circle";

                        // return the control options to edit
                        let controlOptions = {
                                 templateUrl : "app/modules/common/partials/common-meta-entry-dialog.tpl.html",
                                 controller: "commonMetaEntryEditDialogCtrl",
                                 controllerAs:'vmDetail'};
                        return controlOptions;
                    };
                    uiSvc.initializeGridEditor(_this, this.data, _this.model.lastId, gridEditFunctions);
                    _this.functions.initializeRows();
                }
            }
            //</editor-fold>

            //<editor-fold desc="Watches">
            // watch the watch flag
            $scope.$watchCollection("vm.data", function(newValue, oldValue)
            {
                _this.model.flags.gridRefresh += 1;
            }, true);
            //</editor-fold>
        }
    }
  }]);

});

