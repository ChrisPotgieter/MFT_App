/*
 /// <summary>
 /// modules.spe.directives - mqaSpeThresholdLimit.js
 /// Directive to Manage SPE Threshold Limits on the provided Data
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/12/2019
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function(module, lodash) {
 "use strict";

  module.registerDirective('mqaSpeThresholdLimit', ['$uibModal', 'uiSvc', function($uibModal, uiSvc)
  {

    return {
        restrict: 'E',
        templateUrl: "app/modules/spe/directives/mqaSpeThresholdLimit.tpl.html",
        replace: true,
        controllerAs:'vmLimit',
        bindToController:{
            data:'='
        },
        controller: function($element, $scope)
        {
            let _this = this;
            _this.functions = {};
            _this.model = { flags: {gridRefresh: {value: 0}}, lastId:-1};

            // setup the grid data
            if (_this.data)
                _this.model.gridData = _this.data;
            else
                _this.model.gridData = [];

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
                            key: {type: "string"},
                            applicable: {type: "boolean"},
                            limit: {type: "number"},
                            limitType: {type: "string"},
                            action: {type: "string"}
                        }
                    }
                },
                columns: [
                    {field: "rowId", type: "string", tooltip: false,hidden: true},
                    {field:"key", type:"string", tooltip: true,  title:"Threshold"},
                    {
                        field: "limit",
                        title:"Limit",
                        template: function(dataItem)
                        {
                            const entry = lodash.find(_this.model.gridData, {rowId: dataItem.rowId});
                            if (!entry.applicable)
                                return "";
                            let value = dataItem.limit;

                            if (entry != null && entry.limitType == 1)
                                value += "%";
                            return value;
                        }
                    },
                    {field: "action", title:"Action", type: "string", tooltip: false},
                    {
                        field: "applicable",
                        title: "Enabled",
                        width:"150px",
                        template: function(dataItem)
                        {
                            if (dataItem.applicable)
                                return "<i class='fa fa-check'/>";
                            return "";
                        }
                    }
                ],
                dataBound: function(e)
                {
                    const grid = this;
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
                const row = {applicable: true, recordStatus: uiSvc.editModes.INSERT, limit: 1};
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
                const dialogData = {};
                dialogData.row = angular.copy(record);
               dialogData.rows = _this.model.gridData;

                const modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/modules/spe/directives/mqaSpeThresholdLimitEditDialog.tpl.html',
                    controller: 'mqaSpeThresholdLimitEditDialogCtrl',
                    controllerAs: 'vmDialog',
                    backdrop: 'static',
                    size: 'lg',
                    resolve:
                        {
                            dialogData: dialogData
                        }
                });
                modalInstance.result.then(function (result)
              {
                  // refresh the data
                  const type = result.recordStatus;
                  if (type == uiSvc.editModes.INSERT)
                  {
                      // insert the column
                      _this.model.lastId++;
                      result.rowId = _this.model.lastId;
                      result.rowStyle = "recordInsert";
                      result.recordStatus = uiSvc.editModes.UPDATE;
                      _this.model.gridData.push(result);

                  }
                  if (type == uiSvc.editModes.DELETE)
                  {

                      // remove the entry
                      const entry = {rowId: result.rowId};
                      lodash.remove(_this.model.gridData, entry);
                  }
                  if (type == uiSvc.editModes.UPDATE)
                  {
                      // update the record
                      const recordIndex = lodash.findIndex(_this.model.gridData, {rowId: result.rowId});
                      if (recordIndex >= -1)
                          _this.model.gridData.splice(recordIndex, 1, result);
                  }

                  // update the overall record status
                  if (!result.recordStatus)
                      result.recordStatus = uiSvc.editModes.UPDATE;//"Update"
                  if (!result.rowStyle || result.rowStyle == null)
                      result.rowStyle = "recordUpdate";
                  _this.model.flags.gridRefresh.value += 1;

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


