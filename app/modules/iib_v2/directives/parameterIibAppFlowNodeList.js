/*
 /// <summary>
 /// modules.iib_v2.directives -parameterIibAppFlowNodeList.js
 /// IIB Module Directive to Manage the Node Listing for an IIB Application Flow Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2021
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash'], function(module, lodash) {
  "use strict";

  module.registerDirective('parameterIibAppFlowNodeList', ['$timeout','uiSvc', 'adminDataSvc', 'userSvc', function($timeout, uiSvc, adminDataSvc, userSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/iib_v2/directives/parameterIibAppFlowNodeList.tpl.html",
        replace: true,
        scope:{},
        bindToController:{
            data:"="
        },
        controllerAs:'vmAppFlowNodeList',
        controller: function ($element, $scope)
        {
            let _this = this;

            _this.functions = {};
            _this.fields = {};

            _this.model = {gridData:[], flags:{gridRefresh: {value: 0}}};
            _this.model.gridOptions = {
                resizable: false,
                selectable: "row",
                noRecords: true,
                messages: {
                    noRecords: "No Records Available"
                },
                dataSource: {
                    pageSize: 25,
                    schema: {
                        model: {
                            id: "code",
                            uid: "code"
                        }
                    }
                },
                columns: [
                    {field: "code", type: "string", tooltip: false,hidden: false, title:"Code"},
                    {field:"description",title:"Description", type:"string"},
                    {
                        field: "payload_emit",
                        title: "Payload Enabled",
                        width: "150px",
                        filterable: false,
                        template: function(dataItem)
                        {
                            if (dataItem.payload)
                                return "<i class='fa fa-check'/>";
                            else
                                return "<i class='fa fa-times'/>";
                            return "";
                        }
                    },
                    {
                        field: "audit",
                        title: "Node Mask",
                        width: "150px",
                        filterable: false,
                        hidden: !userSvc.hasFeature(userSvc.commonFeatures.ADMIN_APP),
                        template: function(dataItem)
                        {
                            if (dataItem.audit)
                                return "<i class='fa fa-check'/>";
                            else
                                return "<i class='fa fa-times'/>";
                            return "";
                        }
                    }

                ],
                dataBound: function (e) {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid);
                }
            };


            _this.functions.insertRecord = function()
            {
                // routine to be called when user choses to add a new item
                var record = {newRecord: true, recordStatus: uiSvc.editModes.INSERT, payload: false, payload_mandatory: false, audit: true};
                _this.functions.showDialog(record);
            };

            _this.functions.setData = function(dataset)
            {
                // routine to set the filtered data set based on user permissions
                _this.model.gridData = dataset;
                if (userSvc.hasFeature(userSvc.commonFeatures.ADMIN_APP))
                {
                    _this.model.filteredData = dataset;
                }
                else
                {
                    _this.model.filteredData = lodash.filter(dataset, function(row)
                    {
                        return !row.audit && !row.payload_mandatory;
                    });
                }
            };

            _this.functions.editRecord = function(record)
            {
                // routine to bring up the column editor form to allow the user to edit the column they have selected
                record.recordStatus = uiSvc.editModes.UPDATE;
                _this.functions.showDialog(record);
            };

            // setup the dialog
            let dialogDetails = {
                template: 'app/modules/iib_v2/partials/parameter-app-flow-node-dialog.tpl.html',
                controller: 'parameterIIBAppFlowNodeEditDialogCtrl',
                alias: 'vmNodeDetail',
            };
            _this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(_this, dialogDetails);


            // watch for a data change
            $scope.$watch("vmAppFlowNodeList.data", function(newValue)
            {
                if (newValue)
                {
                    _this.functions.setData(newValue);
                    _this.model.flags.gridRefresh.value += 1;
                }
            }, true);

            _this.functions.setData(_this.data);
            _this.model.lastId = _this.model.gridData.length + 1;
        }
    }
  }]);

});


