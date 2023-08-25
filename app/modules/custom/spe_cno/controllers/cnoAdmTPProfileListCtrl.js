/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoAdmTPProfileListCtrl.js
 /// Controller to manage Editing of CNO Trading Partner Profile List
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/05/2018
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {

    "use strict";

    module.registerController('cnoAdmTPProfileListCtrl', ['$scope', '$log', '$timeout','adminDataSvc','uiSvc', 'userSvc','cacheDataSvc',function ($scope, $log,$timeout,adminDataSvc,uiSvc, userSvc)
    {
        var _this = this;

        // add the initial data
        _this.model = {gridData:[], data:[], viewData:{}, mainCaption: "Add Profile...", editorHTML:"<cno-adm-tp-profile-edit/>"};
        _this.functions = [];
        var companyId = userSvc.getOrgInfo().companyId;
        var type = "TP_Profile";


        var initialize = function()
        {
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
        };

        $scope.cancelRecord = function()
        {
            adminDataSvc.listFunctions.cancelRecord(_this);
            _this.model.showEdit = false;
        };

        $scope.saveRecord = function()
        {
            adminDataSvc.listFunctions.saveRecord($scope, _this);
        };


        $scope.deleteRecord = function()
        {
            // routine to be called when the user chooses to delete a record
            adminDataSvc.listFunctions.deleteRecord($scope, _this);
        };

        _this.functions.updateFunction = function()
        {
            // routine to post the updates to the server
            adminDataSvc.listFunctions.postUpdates(companyId, _this, "System Parameters", "Trading Partner Profiles");
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
                    {field: "code", title: "TIN Number", type: "string", tooltip: false},
                    {field: "description", title: "Name", type: "string", tooltip: false},
                    {
                        field: "items",
                        title: "Short Name",
                        filterable: false,
                        template: function(dataItem)
                        {
                            if (dataItem.jsonData && dataItem.jsonData.name)
                            {
                                return dataItem.jsonData.name;
                            }
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
        };

        //</editor-fold>

        initialize();

    }]);
});