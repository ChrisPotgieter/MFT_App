/*
 /// <summary>
 /// modules.common.directives.input - mqaFilterEntryList
 /// Common Directive to Manage Display of Filter List Entries
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/common/module', 'lodash', 'moment'], function(module, lodash, moment) {
  "use strict";
  moment().format();


  module.registerDirective('mqaFilterEntryList', ['$timeout', '$uibModal', 'uiSvc',  function($timeout, $uibModal, uiSvc)
  {

    return {
        restrict: 'E',
        templateUrl: "app/modules/common/directives/input/mqaFilterEntryList.tpl.html",
        replace: true,
        controllerAs:'vmFilter',
        bindToController:{
            data:'='
        },
        controller: function($element, $scope)
        {
            var _this = this;
            _this.functions = {};
            _this.model = { lastId:-1, flags:{}};

            // setup the grid data
            if (_this.data) {
                _this.model.gridData = _this.data.data;
                _this.model.flags.refresh = _this.data.flags.refresh;
            }
            else {
                _this.model.gridData = [];
                _this.model.flags.refresh = {value: 0};
            }

            // setup the grid options
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
                            id: "rowId",
                            uid:"rowId",
                            name: {type: "string"},
                            operator: {type: "number"},
                            values: {type: "object"}
                        }
                    }
                },
                columns: [
                    {field: "rowId", type: "string", tooltip: false,hidden: true},
                    {field:"name", type:"string", tooltip: true,  title:"Name", width:"200px"},
                    {
                        field: "operator",
                        title:"Operator",
                        width: "100px",
                        tooltip: true,
                        template: function(dataItem) {
                            switch (dataItem.operator) {
                                case 0:
                                    return "Equals";
                                case 1:
                                    return "Starts With";
                                case 2:
                                    return "Ends With";
                                case 3:
                                    return "Contains";
                                case 4:
                                    return "Not Equal";
                                case 5:
                                    return "Not Starts With";
                                case 6:
                                    return "Not Ends With";
                                case 7:
                                    return "Not Contains";
                                case 8:
                                    return "Equals Case-Insensitive";
                                default:
                                    return "None"
                            }
                        }
                    },
                    {
                        field: "values",
                        title: "Values",
                        width:"400px",
                        template: function(dataItem)
                        {
                            if (dataItem.values && dataItem.values != null)
                            {
                                var html = "";
                                lodash.forEach(dataItem.values, function(item, index)
                                {
                                    if (index > 0)
                                        html += " OR ";
                                    html += item;
                                });
                                return html;
                            }
                            else
                                return "";
                        }
                    }
                ],
                dataBound: function(e)
                {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid);
                }
            };


            //<editor-fold desc="Grid Management Functions">
            _this.functions.initialize = function()
            {
                // routine to initialize the row Id's upon load of this directive
                lodash.forEach(_this.model.gridData, function(item, index)
                {
                    item.rowId = index;
                    item.rowStyle = null;
                    item.recordStatus = uiSvc.editModes.UPDATE;
                    _this.model.lastId++;
                });
            };

            _this.functions.insertRecord = function()
            {
                // routine to allow users to insert records
                var row = { recordStatus: uiSvc.editModes.INSERT, values:[], operator: "0"};
                _this.functions.showDialog(row);
            };

            _this.functions.editRecord = function(record)
            {
                // routine to allow users to edit existing records
                _this.functions.showDialog(record);
            };

            _this.functions.showDialog = function(record)
            {
                // routine to bring up the editing dialog
                var dialogData = {};
                dialogData.row = angular.copy(record);
                dialogData.rows = _this.model.gridData;
                dialogData.keyOptions = _this.data.keyOptions;
                dialogData.title = _this.data.title;
                dialogData.icon = _this.data.icon;

               var modalInstance = $uibModal.open({
                  animation: true,
                  templateUrl: 'app/modules/common/partials/common-filter-entry-dialog.tpl.html',
                  controller: 'commonFilterEntryEditDialogCtrl',
                  controllerAs: 'vmDialog',
                  backdrop: 'static',
                  size:'md',
                  resolve:
                  {
                      dialogData: dialogData
                  }
              });
              modalInstance.result.then(function (result)
              {
                  // refresh the data
                  var type = result.recordStatus;
                  if (type == uiSvc.editModes.INSERT)
                  {
                      // insert the column
                      _this.model.lastId++;
                      result.rowId = _this.model.lastId;
                      result.recordStatus = uiSvc.editModes.UPDATE;
                      _this.model.gridData.push(result);

                  }
                  if (type == uiSvc.editModes.DELETE)
                  {

                      // remove the entry
                      var entry = {rowId: result.rowId};
                      lodash.remove(_this.model.gridData, entry);
                  }
                  if (type == uiSvc.editModes.UPDATE)
                  {
                      // update the record
                      var recordIndex = lodash.findIndex(_this.model.gridData, {rowId: result.rowId});
                      if (recordIndex >= -1)
                          _this.model.gridData.splice(recordIndex, 1, result);
                  }

                  // update the overall record status
                  if (!result.recordStatus)
                      result.recordStatus = uiSvc.editModes.UPDATE;//"Update"
                  _this.model.flags.refresh.value += 1;

                  // close the dialog
                  modalInstance.close();
              }, function ()
              { });
            };
            //</editor-fold>


            // initialize the directive
            _this.functions.initialize();
        }
    }
  }]);

});


