/*
 /// <summary>
 /// app.modules.admin.controllers - companyListEdit.js
 /// Controller to manage Editing of Company List Items
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Modified By Mac Bhyat
 /// Date: 10/06/2017
 /// </summary>
 */
define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

    "use strict";

    module.registerController('companyListEditCtrl', ['$scope', '$log','userSvc','adminDataSvc','cacheDataSvc','uiSvc', function ($scope, $log,userSvc,adminDataSvc,cacheDataSvc,uiSvc)
    {
        var _this = this;

        // add the initial data
        _this.selector = {record: null, options:[], selected: null};
        _this.model = {gridData:[], data:[]};
        _this.functions = [];
        _this.model.allowSave = false;

        var options = [];
        options.push({type:"SPESender", include: -1, companyId: 0, description:"ITXA Partner Profiles", info: "Below is a List of ITXA Partner Profiles Defined for this System", icon: "fa-book", security: ["spe"]});
        options.push({type:"SPELimit", include: -1, companyId: 0, description:"ITXA Thresholds", info: "Below is a List of Different ITXA Thresholds that can be set", icon: "fa-magic", security: ["spe"]});
        options.push({type:"SPELimitAction", include: -1, companyId: 0, description:"ITXA Threshold Actions", info: "Below is a List of Different ITXA Threshold Actions that can be set", icon: "fa-gavel", security: ["spe"]});
        options.push({type:"SPEEnvironment", include: 1, companyId: 0, description:"ITXA Environments", info: "Below is a List of ITXA Environments Defined for this System", icon: "fa-cogs", security: ["spe"]});
        options.push({type:"SPEISAVersion", include: 1, companyId: 0, description:"ITXA ISA Version Numbers", info: "ISA Version Numbers are used to determine the ISA Segment Version in an ITXA Envelope", icon: "fa-code-fork", security: ["spe"]});
        options.push({type:"SPEGSAVersion", include: 1, companyId: 0, description:"ITXA GSA Version Numbers", info: "ITXA Version Numbers are used to determine the GSA Segment Version in an ITXA Envelope", icon: "fa-code-fork", security: ["spe"]});
        options.push({type:"SPEEDIVersion", include: 1, companyId: 0, description:"ITXA EDI Versions", info: "EDI Version Numbers are used to determine the EDI Version of an ITXA Envelope/Denvelope Operation", icon: "fa-code-fork", security: ["spe"]});
        options.push({type:"SPEHIPAA", include: 1, companyId: 0, description:"ITXA Envelope Templates", info: "Below is a list of the current ITXA Envelope Templates defined for this System", icon: "fa-envelope", security: ["spe"]});
        options.push({type:"SPEEDIMapName", include: 1, companyId: 0, description:"ITXA Maps", info: "Mapping Templates Available for ITXA Mapping", icon: "fa-sitemap", security: ["spe"]});
        options.push({type:"SPELob", include: 1, companyId: 0, description:"ITXA Line of Business", info: "Line of Business Options during ITXA Enveloping/Denveloping Operations", icon: "fa-building", security: ["spe"]});
        options.push({type:"SPERegion", include: 1, companyId: 0, description:"ITXA Regions", info: "Region Options during ITXA Enveloping/Denveloping Operations", icon: "fa-location-arrow", security: ["spe"]});
        options.push({type:"SPECategory", include: 1, companyId: 0, description:"ITXA Categories", info: "Category Options during ITXA Enveloping/Denveloping Operations", icon: "fa-list", security: ["spe"]});
        options.push({type:"SPEGroup", include: 1, companyId: 0, description:"ITXA Groups", info: "Group Options during ITXA Enveloping/Denveloping Operations", icon: "fa-group", security: ["spe"]});
        options.push({type:"SPETransport", include: 1, companyId: 0, description:"ITXA Sender Connection Type", info: "Transport Options for ITXA Sender Connections", icon: "fa-exchange", security: ["spe"]});
        options.push({type:"SPETransportPSTAction", include: 1, companyId: 0, description:"ITXA Sender Transport Post Actions", info: "Transport Post Actions Options for ITXA Sender", icon: "fa-magic", security: ["spe"]});
        options.push({type:"SPETransportDestination", include: 1, companyId: null, description:"ITXA Sender Transport Destinations", info: "Transport Destination Options for ITXA Sender", icon: "fa-car", security: ["spe"]});
        options.push({type:"SPEDocTypes", include: 1, companyId: 0, description:"ITXA Document Types", info: "Below is a List of Different ITXA Document Types that can be loaded", icon: "fa-magic", security: ["spe"]});



        _this.functions.assignIds = function(result)
        {
            // routine to assign ids to each row read by the server
            _this.model.allowSave = false;
            lodash.forEach(result, function(item, index)
            {
                item.rowId = index;
                item.rowStyle = null;
            });
            _this.model.data = result;
            _this.functions.refreshGrid();
        };

        _this.functions.initialize = function()
        {
            // routine to initialize the grid upon load
            _this.functions.gridSetup();


            // add the custom options and remove ones that don't apply
            var record = cacheDataSvc.getParameter("CompanyListEdit");
            if (record == null || record.length == 0) {
                uiSvc.showError("Company List Editor", "Unable to Retrieve Company List Editor Settings - Invalid Settings Record");
                return;
            }

            if (record != null && record.length > 0 && record[0].jsonData.rows.length > 0)
            {
                lodash.forEach(record[0].jsonData.rows, function (element)
                {
                    var found = lodash.filter(options, {type: element.type});
                    if (found == null || found.length == 0)
                        options.push(element);
                    else
                    {
                        if (element.include <= -2)
                        {
                            lodash.remove(options, function(removeElement)
                            {
                                return removeElement.type == element.type;
                            })
                        }
                    }
                });
            }
            _this.selector.options = lodash.filter(options, function(row)
            {
                var include = row.include;
                if (include >= 0)
                {

                    // check the securities
                    if (row.security != null)
                        return userSvc.isAllowed(row.security);
                    else
                        return true;
                }
                return false;
            });
            // check for the company id
            lodash.forEach(_this.selector.options, function(row)
            {
                if (!row.icon)
                    row.icon = "fa-list";
                if (row.companyId == null || row.companyId == undefined)
                    row.companyId = userSvc.getOrgInfo().companyId;
            });
        };

        _this.functions.onOptionSelect  = function()
        {
            // routine to initialize the screen when a list is selected
            _this.model.showEdit = false;
            let listRow = lodash.find(_this.selector.options, {type:_this.selector.selected});
            let model = {type: listRow.type, company_id: listRow.companyId};

            // now read the records from the server
            adminDataSvc.readCustomerListAudit(model).then(function(result)
            {
                _this.selector.record = listRow;
                _this.functions.assignIds(result);
            }).catch(function(err)
            {
                $log.error("Unable to Read Company List " + model.type , model, err);
            })
        };

        //<editor-fold desc="Edit Form  Setup">
        _this.model.showEdit = false;

        $scope.editRecord = function(row)
        {
            // routine to edit the given row
            $scope.editRow = angular.copy(row);
            $scope.editRow.isNew = false;
            if ($scope.editRow.recordStatus)
                $scope.editRow.recordStatus = uiSvc.editModes.UPDATE;//"Update"
            _this.model.showEdit = true;
        };

        $scope.insertRecord = function()
        {
            // routine to initialize the new record
            $scope.editRow = {rowId:  "new_" + _this.model.data.length + 1,recordStatus:uiSvc.editModes.INSERT, isNew: true, jsonData:null};
            $scope.editRow.companyId = _this.selector.record.companyId;
            $scope.editRow.type = _this.selector.record.type;
            $scope.editRow.rowStyle = "recordInsert";
            _this.model.showEdit = true;
        };

        $scope.cancelRecord = function()
        {
            _this.model.showEdit = false;
        };

        $scope.saveRecord = function()
        {
            // save the record
            if ($scope.editRow.isNew)
            {
                $scope.editRow.isNew = false;
                _this.model.data.push($scope.editRow);
            }
            else
            {
                // update the existing row
                if (!$scope.editRow.rowStyle || $scope.editRow.rowStyle == null)
                    $scope.editRow.rowStyle = "recordUpdate";
                var record = lodash.find(_this.model.data, {rowId: $scope.editRow.rowId});
                if (record)
                {
                    lodash.remove(_this.model.data, record);
                    _this.model.data.push($scope.editRow);
                }
            }
            _this.model.allowSave = true;
            _this.functions.refreshGrid();
        };

        $scope.deleteRecord = function()
        {
            // routine to be called when the user chooses to delete a record
            if($scope.editRow.isNew)
            {
                // remove the entry from the list as it was an add then a delete
                var entry = {rowId:$scope.editRow.rowId};
                lodash.remove(_this.model.data, entry)
            }
            else
            {
                var record = lodash.find(_this.model.data, {rowId: $scope.editRow.rowId});
                if (record)
                    record.recordStatus = uiSvc.editModes.DELETE;
            }
            _this.model.allowSave = true;
            _this.functions.refreshGrid();
        };

        _this.functions.updateFunction = function()
        {
            // routine to post the updates to the server
            adminDataSvc.saveCustomerLists(_this.selector.record.companyId, _this.model.data).then(function(result)
            {
                _this.functions.assignIds(result);

                // re-initialize the lists
                cacheDataSvc.initializeLists().then(function(result)
                {
                    uiSvc.showExtraSmallPopup("List Editor", _this.selector.record.description + " Update Successful !", 5000);
                }).catch(function (err)
                {
                    $log.error("Unable to Refresh Company List", err);
                });

            }).catch(function(err)
            {
                $log.error("Unable to Update " + _this.selector.record.description, err);
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
                            uid:"rowId",
                            fields:
                            {
                                rowId: {type:"string"}
                            }
                        }
                    }
                },
                columns: [
                    {field: "rowId", type: "string", tooltip: false,hidden: true},
                    {field: "rowStyle", type: "string", tooltip: false,hidden: true},
                    {field: "recordStatus",type: "string", tooltip: false,hidden: true},
                    {field: "code", title: "Code", type: "string", tooltip: false},
                    {field: "description", title: "Description", type: "string", tooltip: false}
                ],
                dataBound: function(e)
                {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid);
                }
            };
        };

        _this.functions.refreshGrid = function ()
        {
            // routine to only show active records
            var active = lodash.filter(_this.model.data, function (record)
            {
                return (record.recordStatus != uiSvc.editModes.DELETE);
            });
            _this.model.gridData = active;
            _this.model.showEdit = false;

        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});