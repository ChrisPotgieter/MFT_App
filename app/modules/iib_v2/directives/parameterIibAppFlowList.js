/*
 /// <summary>
 /// modules.iib_v2.directives - parameterIibAppFlowList.js
 /// IIB Module Directive to Manage the Flow Listing for an IIB Application Definition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2021
 /// </summary>
 */

define(['modules/iib_v2/module'], function(module) {
  "use strict";

  module.registerDirective('parameterIibAppFlowList', ['$timeout','uiSvc', 'adminDataSvc', function($timeout, uiSvc, adminDataSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/iib_v2/directives/parameterIibAppFlowList.tpl.html",
        replace: true,
        scope:{},
        bindToController:{
            data:"="
        },
        controllerAs:'vmAppFlowList',
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
                        field: "node_count",
                        title: "Nodes",
                        width: "150px",
                        filterable: false,
                        template: function (dataItem)
                        {
                            return dataItem.nodes.length;
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
                var record = {recordStatus: uiSvc.editModes.INSERT, nodes: [], payload: true};
                _this.functions.showDialog(record);
            };

            _this.functions.editRecord = function(record)
            {
                // routine to bring up the column editor form to allow the user to edit the column they have selected
                record.recordStatus = uiSvc.editModes.UPDATE;
                if (!record.nodes)
                    record.nodes = [];
                _this.functions.showDialog(record);
            };

            // setup the dialog
            let dialogDetails = {
                template: 'app/modules/iib_v2/partials/parameter-app-flow-dialog.tpl.html',
                controller: 'parameterIIBAppFlowEditDialogCtrl',
                alias: 'vmFlowDetail',
            };
            _this.functions.showDialog = adminDataSvc.listFunctions.initializeEditDialog(_this, dialogDetails);


            // watch for a data change
            $scope.$watch("vmAppFlowList.data", function(newValue)
            {
                if (newValue)
                {
                    _this.model.gridData = newValue;
                    _this.model.flags.gridRefresh.value += 1;
                }
            }, true);

            _this.model.gridData = _this.data;
            _this.model.lastId = _this.model.gridData.length + 1;

        }
    }
  }]);

});


