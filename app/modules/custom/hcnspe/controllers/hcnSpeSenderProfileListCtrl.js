/*
 /// <summary>
 /// app.modules.spe.controllers - hcnSpeSrProfileListCtrl.js
 /// HealthcareNow Controller for Listing all SPE Sender/Receiver Profiles for the Current Logged in User
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 28/02/2017
 /// </summary>
 */

define(['modules/custom/hcnspe/module', 'file-saver', 'lodash', 'ng-fileupload'], function (module, filesaver,lodash) {

    "use strict";

    module.registerController('hcnSpeSenderProfileListCtrl', ['$scope', '$log', 'apiProvider','speDataSvc','userSvc', 'uiSvc', function ($scope, $log, apiProvider, speDataSvc, userSvc, uiSvc)
    {
        $scope.data = [];
        $scope.allowSave = false;
        $scope.uploadImportFile = null;


        $scope.initialize = function ()
        {
            // routine to get the list of the given type from the database
            speDataSvc.initializeSenderProfile($scope);
        };

        //<editor-fold desc="Edit Form  Setup">
        $scope.showEdit = false;
        $scope.editRecord = function(row)
        {
            // routine to edit the row
            speDataSvc.editSenderProfile($scope, row);
        };

        $scope.insertRecord = function()
        {
            // routine to add a new row
            speDataSvc.insertSenderProfile($scope);
        };

        $scope.cancelRecord = function()
        {
            $scope.showEdit = false;
        };

        $scope.saveRecord = function()
        {
            // save the record
            speDataSvc.saveSenderProfile($scope);
        };

        $scope.deleteRecord = function()
        {
            // routine to be called when the user chooses to delete a record
            speDataSvc.deleteSenderProfile($scope);
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
                        pageSize: 10,
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
                    {name: "rowStyle", description: "rowStyle ",source: "rowStyle", type: "string", tooltip: false,hidden: true},
                    {name: "recordStatus", description: "recordStatus ",source: "recordStatus", type: "string", tooltip: false,hidden: true},
                    {name: "code", description: "Code",source: "code", type: "string", tooltip: false, hidden: true},
                    {field: "jsonData.alias", title: "Identifier", type:"string"},
                    {field: "jsonData.isa_senderID", title: "Sender ID", tooltip: false},
                    {field: "jsonData.isa_receiverID", title: "Receiver ID", tooltip: false},
                    {field: "jsonData.sender_name", title: "Sender", tooltip: true},
                    {field: "jsonData.receiver_name", title: "Receiver", tooltip: true},
                    {field: "jsonData.edi_version", title: "EDI Version", tooltip: false},
                    {field: "jsonData.hipaa_template", title: "Template", tooltip: false},
                    {field: "jsonData.docType", title: "Document Type", type: "string", width:80},
                    {field: "jsonData.metadata.lob", title: "LOB", type: "string", width:100},
                    {field: "jsonData.metadata.region", title: "Region", type:"string", width:100},
                    {field: "jsonData.metadata.group", title: "Group", type: "string", width:100}
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
            speDataSvc.updateSenderProfileBulkFunction($scope);
        };

        $scope.$watch('uploadImportFile', function(newValue, oldValue)
        {
            // initialte the file upload when the upload file is selected
            if (!newValue || newValue == '')
                return;
            if (newValue == oldValue)
                return;
            $scope.requestImport();
        });

        $scope.requestExport = function()
        {
            apiProvider.getBlob('speSenderExport',{id: userSvc.getOrgInfo().companyId}).then(function (response)
            {
                filesaver(response.blob, response.fileName);
            }).catch(function (result)
            {
                $log.error("Unable to download Sender Export", result);
            });

        };

        $scope.requestImport = function()
        {
            speDataSvc.requestSenderProfileImport($scope);
        };

        $scope.requestSync = function()
        {
            speDataSvc.requestSenderProfileSync($scope);
        };
    }]);
});
