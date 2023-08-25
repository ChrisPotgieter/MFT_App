/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftTransactionItemDialogCtrl
 /// MFT Transaction Item Dialog Controller to Manage Displaying of Transaction Items
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 30/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash)
{
    "use strict";
    module.registerController('mftTransactionItemDialogCtrl', ['$uibModalInstance', 'mftv2DataSvc', 'uiSvc', 'dialogData', function ($uibModalInstance, mftv2DataSvc, uiSvc, dialogData)
    {
        var _this = this;
        _this.model = {flags: dialogData.flags, data: []};
        _this.model.flags.refreshFlag = {value: 0};

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };

        _this.functions.drill = function(row)
        {
            // routine to handle the click on a row in the extended file spec grid
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/mft_v2/partials/transaction-detail-item-drill-dialog.tpl.html";
            controlOptions.controller = "mftTransactionItemDrillDialogCtrl";
            controlOptions.size = 'lg';
            controlOptions.controllerAs = "vmDrillDialog";
            controlOptions.windowClass = 'xl-modal';
            let record = lodash.find(_this.model.data, {item_index: row.item_index});
            uiSvc.showDialog(record, controlOptions);
        };
        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            let pageSizes = uiSvc.getKendoPageSizes();
            _this.model.gridOptions = {
                toolbar: ["excel"],
                excel: {
                    fileName: "Transaction Specification Listing.xlsx",
                    allPages: true
                },
                sortable: true,
                groupable: true,
                filterable: true,
                columnMenu: true,
                resizable: true,
                scrollable: true,
                reorderable: true,
                pageable:
                    {
                        pageSizes: pageSizes
                    },
                selectable: "row",
                dataSource: {
                    pageSize: pageSizes[0],
                    sort: [
                        {field: "item_index", dir: "asc"},
                    ],
                    schema: {
                        model: {
                            id: "item_index",
                            uid: "item_index",
                            fields: {
                                item_index: {type: "number"},
                                source_type: {type: "number"},
                                storage_type_desc: {type:"string"},
                                source_resource: {type: "string"},
                                destination_type: {type: "number"},
                                destination_resource: {type: "string"},
                                supplemental: {type: "string"},
                                mode: {type: "string"}
                            }
                        }
                    },
                    aggregate:
                        [
                            {field: "item_index", aggregate: "count"}
                        ]

                },
                columns: [
                    {
                        field: "item_index",
                        title: "Item",
                        width: "100px",
                        filterable: false,
                        groupable: false,
                        attributes:{style:"text-align:right;"},
                        headerAttributes:{style:"text-align:right;"},
                        aggregates:["count"],
                        footerTemplate:"Total: #=count#",
                        groupFooterTemplate:"Total: #=count#"
                    },
                    {
                        field: "storage_type_desc",
                        title: "Transfer Type",
                        width: "150px"
                    },
                    {
                        field: "source_resource",
                        title: "Source",
                        width: "500px",
                        groupable: false,
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "sourceStatus"
                        }
                    },
                    {
                        field: "destination_resource",
                        title: "Destination",
                        width: "400px",
                        groupable: false,
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "destinationStatus"
                        }
                    },
                    {
                        field: "mode",
                        title: "Mode",
                        width: "200px"
                    },
                    {
                        field: "supplemental",
                        title: "Supplemental",
                        width: "400px",
                        groupable: false,
                        attributes: {
                            style: "text-overflow:ellipsis;white-space:nowrap;",
                            class: "supplementalStatus"
                        }
                    },
                ],
                dataBound: function (e)
                {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid, null, true);
                }

            };

            _this.model.functionManager = {};
            _this.model.functionManager.gridCreate = function(grid)
            {
                uiSvc.addKendoGridTooltip("sourceStatus", grid, "source_resource");
                uiSvc.addKendoGridTooltip("destinationStatus", grid, "destination_resource");
                uiSvc.addKendoGridTooltip("supplementalStatus", grid, "supplemental");

            };

            if (_this.model.flags.extended)
            {
                // transaction has more than 15 records in the file spec - get the other records as we will display a grid view
                mftv2DataSvc.getExtendedFileSpec(dialogData.transactionId, dialogData.data).then(function (modalResult)
                {
                    _this.model.data = modalResult;
                    _this.model.flags.refreshFlag.value += 1;


                }).catch(function(err)
                {
                });
            }
            else
             {
                _this.model.data = dialogData.data;
            }

        };

        _this.functions.initialize();
        //</editor-fold>
    }]);
});
