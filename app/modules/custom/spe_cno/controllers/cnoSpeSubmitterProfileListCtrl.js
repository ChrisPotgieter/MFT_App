/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoSpeSubmitterProfileListCtrl.js
 /// CNO Controller for managing SPE Submitter Profiles
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2017
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'file-saver', 'moment', 'lodash', 'ng-fileupload'], function (module, filesaver, moment, lodash) {

    "use strict";
    moment().format();

    module.registerController('cnoSpeSubmitterProfileListCtrl', ['$scope', '$log', 'apiProvider','speCNODataSvc', 'speDataSvc','userSvc', 'uiSvc', 'adminDataSvc', 'cacheDataSvc', function ($scope, $log, apiProvider, speCNODataSvc, speDataSvc, userSvc, uiSvc, adminDataSvc, cacheDataSvc)
    {
        $scope.data = [];
        $scope.allowSave = false;


        $scope.initialize = function ()
        {
            // routine to get the list of the given type from the database
            $scope.gridSetup();
            let model = {company_id: userSvc.getOrgInfo().companyId, type: "ITX_SUBMITTER"};
            adminDataSvc.readCustomerListAudit(model).then(function(result)
            {
                speDataSvc.assignSenderProfileIds($scope, result);

            }).catch(function(err)
            {
                $log.error("Unable to Retrieve ITXA Submitter Profile List", err);
            });
        };

        //<editor-fold desc="Edit Form  Setup">
        $scope.showEdit = false;
        $scope.editRecord = function(row)
        {
            // routine to manage the editing of a sender profile
            $scope.showEdit = true;
            $scope.editRow = angular.copy(row);
            $scope.editRow.isNew = false;
            $scope.editRow.recordStatus = uiSvc.editModes.UPDATE;
        };

        $scope.insertRecord = function()
        {
            // routine to add a new row
            $scope.editRow = {rowId: "new_" + ($scope.data.length + 1),type:"SPESubmitter",recordStatus:uiSvc.editModes.INSERT, isNew: true, jsonData:{ccn_dup_checking: false, dynamic_film: false, va_applicable: false, it_rac: false}, companyId: userSvc.getOrgInfo().companyId};
            $scope.showEdit = true;
            $scope.editRow.rowStyle = "recordInsert";
        };

        $scope.cancelRecord = function()
        {
            $scope.showEdit = false;
        };

        $scope.saveRecord = function()
        {
            $scope.editRow.code = $scope.editRow.code.toUpperCase();
            $scope.editRow.description = cacheDataSvc.getListDescription("1", "SPESubmitter_Name", $scope.editRow.jsonData.submitter_name, userSvc.getOrgInfo().companyId) + " - " + $scope.editRow.jsonData.receiver_p_id;
            if ($scope.editRow.isNew)
            {
                $scope.editRow.isNew = false;
                $scope.editRow.jsonData.date_added = moment().format("YYYYMMDD");
                $scope.editRow.jsonData.insert_user = userSvc.getProfile().name;
                $scope.data.push($scope.editRow);
            }
            else
            {
                // update the existing row
                if (!$scope.editRow.rowStyle)
                    $scope.editRow.rowStyle = "recordUpdate";
                var recordIndex = lodash.findIndex($scope.data, {rowId: $scope.editRow.rowId});
                if (recordIndex > -1)
                {
                    $scope.data.splice(recordIndex, 1, $scope.editRow);
                }
            }
            $scope.allowSave = true;
            $scope.refreshGrid();
        };

        $scope.deleteRecord = function()
        {
            // routine to be called when the user chooses to delete a record
            if($scope.editRow.isNew)
            {
                // remove the entry from the list as it was an add then a delete
                var entry = {rowId:$scope.editRow.rowId};
                lodash.remove($scope.data, entry);
            }
            else
            {

                var record = lodash.find($scope.data, {rowId: $scope.editRow.rowId});
                if (record)
                    record.recordStatus = uiSvc.editModes.DELETE;
            }
            $scope.allowSave = true;
            $scope.refreshGrid();
        };
        //</editor-fold>


        //<editor-fold desc="Grid Setup">
        $scope.gridSetup = function()
        {
            $scope.grid = {};
            $scope.grid.dataOptions = {
                sortable: true,
                groupable: true,
                filterable: true,
                columnMenu: true,
                resizable: true,
                pageable: {
                    pageSizes: true
                },
                selectable: "row",
                dataSource:
                    {
                        data: [],
                        pageSize: 30,
                        sort:
                            [

                                {field:	"name", dir:"asc"}
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
                    {field: "rowId", title: "RowId", hidden: true},
                    {field: "rowStyle", description: "rowStyle ",source: "rowStyle", type: "string", tooltip: false,hidden: true},
                    {field: "recordStatus", description: "recordStatus ",source: "recordStatus", type: "string", tooltip: false,hidden: true},
                    {field: "code", description: "Code",source: "code", type: "string", tooltip: false, hidden: true},
                    {field: "description", title:"Name", source:"description", type:"string", tooltip: true, width:300},
                    {field: "jsonData.submitter_id", title: "Submitter ID", type:"string", tooltip: false, width:130},
                    {field: "jsonData.receiver_p_id", title: "Receiver P-ID", tooltip: false, width:130},
                    {field: "jsonData.state", title: "State", tooltip: true, width:150, template: function(dataItem){
                            if (dataItem.jsonData.state)
                            {
                                return cacheDataSvc.getListDescription("1","SPESubmitter_State", dataItem.jsonData.state);
                            }
                            else
                                return "Unknown";
                    }},
                    {field: "jsonData.match_company", title: "Match Company", tooltip: true},
                    {field: "jsonData.match_claimFilename", title: "Match Claim FileName", tooltip: false},
                ],
                dataBound: function(e)
                {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid);
                }
            };

        };

        $scope.refreshGrid = function ()
        {
            // routine to only show active records
            $scope.gridList = uiSvc.refreshActiveGrid($scope.data);
            $scope.showEdit = false;
        };
        //</editor-fold>

        $scope.initialize();


        $scope.updateFunction = function()
        {
            // routine to post the updates to the server
            adminDataSvc.saveCustomerLists(userSvc.getOrgInfo().companyId, $scope.data).then(function(result) {
                uiSvc.showExtraSmallPopup("ITXA Submitter Profiles", "All the Profiles have been updated successfully !", 5000);
                speDataSvc.assignSenderProfileIds($scope, result);
            }).catch(function(err)
            {
                $log.error("Unable to Update ITXA Submitter Profiles", err);
            });
        };
    }]);
});
