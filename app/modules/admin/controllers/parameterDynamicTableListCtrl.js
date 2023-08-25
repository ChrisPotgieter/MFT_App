/*
 /// <summary>
 /// app.modules.admin.controllers - parameterDynamicTableListCtrl.js
 /// Controller to manage Editing of Dynamic Table Configurations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/03/2018
 /// </summary>
 */
define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('parameterDynamicTableListCtrl', ['$scope', '$log','userSvc','adminDataSvc','cacheDataSvc','uiSvc', function ($scope, $log,userSvc,adminDataSvc,cacheDataSvc,uiSvc)
    {
        var _this = this;

        // add the initial data
        _this.model = {gridData:[], data:[], showEdit: false, allowSave:false,  mainCaption: "Add Configuration...", editorHTML:"<mqa-adm-dyn-table-edit/>"};
        _this.functions = [];
        var companyId = userSvc.getOrgInfo().companyId;
        var type = "DynamicTable";


        var initialize = function() {
            // routine to initialize the grid upon load
            _this.functions.gridSetup();
            adminDataSvc.listFunctions.initialize(_this, companyId, type);

        };





        //<editor-fold desc="Edit Form  Setup">

        $scope.editRecord = function(row)
        {
            // routine to edit the given row
            adminDataSvc.listFunctions.editRecord(row, _this, $scope);
        };

        $scope.insertRecord = function()
        {
            // routine to initialize the new record
            adminDataSvc.listFunctions.insertRecord(_this, $scope, companyId, type);
            $scope.editRow.jsonData = {columns:[], retentionType: "0", retentionValue: "30"};
            _this.model.showEdit = true;
        };

        $scope.cancelRecord = function()
        {
            adminDataSvc.listFunctions.cancelRecord(_this);
            _this.model.showEdit = false;

        };

        $scope.saveRecord = function()
        {
            // routine to save the record
            adminDataSvc.listFunctions.saveRecord($scope, _this);
        };

        $scope.deleteRecord = function()
        {
            // routine to be called when the user chooses to delete a record
            adminDataSvc.listFunctions.deleteRecord($scope, _this);
        };

        _this.functions.createModelRecords = function() {
            // routine to create the model records that will be used on the update HTTP Post
            var returnRecords = lodash.map(_this.model.data, function(record)
            {
                var returnRecord = {};
                returnRecord.companyId = companyId;
                returnRecord.recordStatus = record.recordStatus;
                returnRecord.description = record.description;
                returnRecord.code = record.code;
                returnRecord.retentionValue = record.jsonData.retentionValue;
                returnRecord.retentionType = parseInt(record.jsonData.retentionType);
                returnRecord.dashboard = record.jsonData.dashboard;
                returnRecord.limit = parseInt(record.jsonData.limit);
                returnRecord.columns = record.jsonData.columns;
                return returnRecord;
            })
            return returnRecords;
        };


        _this.functions.updateFunction = function()
        {
            // routine to post the updates to the server
            // routine to post the updates to the servers
            var records = _this.functions.createModelRecords();
            adminDataSvc.saveDynamicTable(companyId, records).then(function(result)
            {
                adminDataSvc.listFunctions.assignIds(result, _this);

                // re-initialize the lists
                cacheDataSvc.initializeLists().then(function(result2)
                {
                    uiSvc.showExtraSmallPopup("System Parameters", "Dynamic Tables Update Successful !", 5000);

                }).catch(function (err)
                {
                    $log.error("Unable to Refresh Company List", err);
                });
            }).catch(function(err)
            {
                $log.error("Unable to Update Dynamic Tables Configuration", err);
            });
        };
        //</editor-fold>

        //<editor-fold desc="Grid Setup">
        _this.functions.gridSetup = function()
        {
            _this.model.grid = {};
            _this.model.grid.dataOptions = {
                sortable: true,
                groupable: false,
                filterable: true,
                columnMenu: true,
                resizable: false,
                pageable: {
                    pageSizes: true
                },
                selectable: "row",
                dataSource:
                    {
                        data: [],
                        pageSize: 10,
                        sort:
                            [

                                {field:	"code", dir:"asc"}
                            ],
                        schema:
                            {
                                model:
                                    {
                                        id: "rowId",
                                        uid:"rowId"
                                    }
                            }
                    },
                columns: [
                    {field: "rowId", type: "string", tooltip: false,hidden: true},
                    {field: "rowStyle", type: "string", tooltip: false,hidden: true},
                    {field: "recordStatus",type: "string", tooltip: false,hidden: true},
                    {field: "code", title: "Metric Name", type: "string", tooltip: false},
                    {field: "description", title: "Description", type: "string", tooltip: false},
                    {
                        field: "items",
                        title: "Column Count",
                        type:"number",
                        filterable: false,
                        template: function(dataItem)
                        {
                            if (dataItem.jsonData && dataItem.jsonData != "" && dataItem.jsonData.columns != null)
                            {
                                return dataItem.jsonData.columns.length;
                            }
                            else
                                return 0;
                        }
                    }
                ],
                dataBound: function(e)
                {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid);
                }
            };
        };

        //</editor-fold>

        initialize();
    }]);
});