/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoSpeSenderProfileListCtrl.js
 /// CNO Controller for managing SPE Sender Profiles
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2017
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'file-saver', 'lodash', 'ng-fileupload'], function (module, filesaver,lodash) {

    "use strict";

    module.registerController('cnoSpeSenderProfileListCtrl', ['$scope', '$log', '$filter','apiProvider','speCNODataSvc', 'speDataSvc','userSvc', 'uiSvc', 'cacheDataSvc', function ($scope, $log, $filter, apiProvider, speCNODataSvc, speDataSvc, userSvc, uiSvc)
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
            if (!$scope.editRow.jsonData.transport)
                $scope.editRow.jsonData.transport = {};
            if (!$scope.editRow.jsonData.tp)
                $scope.editRow.jsonData.tp = {applicable: false};
        };

        $scope.insertRecord = function()
        {
            // routine to add a new row
            speDataSvc.insertSenderProfile($scope);
            if (!$scope.editRow.jsonData.transport)
                $scope.editRow.jsonData.transport = {};
            if (!$scope.editRow.jsonData.tp)
                $scope.editRow.jsonData.tp = {applicable: false};

        };

        $scope.cancelRecord = function()
        {
            $scope.showEdit = false;
        };

        $scope.saveRecord = function()
        {
            if ($scope.editRow.jsonData.tp.applicable)
            {
                $scope.editRow.jsonData.tp.transaction = $scope.editRow.jsonData.tp.transaction.toUpperCase();
            }
            speDataSvc.saveSenderProfile($scope);
        };

        $scope.deleteRecord = function()
        {
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
                    {
                        field: "jsonData.docDirection",
                        title: "Direction",
                        template: function(dataItem)
                        {
                            if (dataItem.jsonData)
                            {
                                return $filter("speEnvelopeDirectionFilter")(dataItem.jsonData.docDirection);
                            }
                            return "";
                        },
                        width: 100
                    },
                    {field: "jsonData.metadata.lob", title: "LOB", type: "string", width:100},
                    {field: "jsonData.metadata.region", title: "Region", type:"string", width:100},

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
            // initialize the file upload when the upload file is selected
            if (!newValue || newValue == '')
                return;
            if (newValue == oldValue)
                return;
            $scope.requestImport();
        });

        $scope.requestExport = function()
        {
            apiProvider.getBlob('speCNOSenderExport',{id: userSvc.getOrgInfo().companyId}).then(function (response)
            {
                filesaver(response.blob, response.fileName);
            }).catch(function (result)
            {
                $log.error("Unable to download Sender Export", result);
            });

        };


        $scope.requestImport = function()
        {
            // routine to request the import
            $scope.importFunction = speCNODataSvc.senderImport;
            speDataSvc.requestSenderProfileImport($scope);
        };

        $scope.requestSync = function()
        {
            speDataSvc.requestSenderProfileSync($scope);
        };
    }]);
});
