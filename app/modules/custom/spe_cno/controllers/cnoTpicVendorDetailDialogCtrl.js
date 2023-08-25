/*
 /// <summary>
  /// app.modules.custom.spe_cno.controllers - cnoTpicVendorDetailDialogCtrl.js
 /// CNO Third Party Commission Intake Vendor Detail Dialog Controller
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/05/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function (module)
{
    "use strict";
    module.registerController('cnoTpicVendorDetailDialogCtrl', ['$filter', '$log', '$uibModalInstance', 'speCNODataSvc', 'uiSvc', 'dialogData', function ($filter, $log, $uibModalInstance, dataSvc, uiSvc, dialogData)
    {
        var _this = this;

        _this.model = {title:"Vendor Detail", icon:"fa fa-info-circle", data:[], flags:{ refresh: {value: 0}, rebuild:{value: 0}}};

        //<editor-fold desc="Functions">
        _this.functionManager = {};
        _this.functionManager.drill = function(model)
        {
            // routine to manage the drill on the grid - close the dialog and send back the transaction id
            $uibModalInstance.close({transactionId: model.transactionId});
        };

        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.initialize = function()
        {
            var pageSizes = uiSvc.getKendoPageSizes();
            _this.height = "500px";
            _this.gridOptions = {
                excel: {
                    fileName: "Vendor Detail Listing.xlsx",
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
                        {field: "name", dir: "desc"},
                    ],
                    schema: {
                        model: {
                            id: "_id",
                            uid: "_id",
                            fields: {
                                _id: {type: "string"},
                                name: {type:"string"},
                                last_date: {type: "date"},
                                successful: {type: "number"},
                                failed: {type: "number"},
                                count:{type:"number"},
                            }
                        }
                    },
                    aggregate:
                        [
                            {field: "_id", aggregate: "count"},
                            {field: "successful", aggregate: "sum"},
                            {field: "failed", aggregate: "sum"},
                            {field: "count", aggregate: "sum"}
                        ]

                },
                columns: [
                    {
                        field: "name",
                        title: "Company",
                        width: "150px"
                    },
                    {
                        field: "count",
                        title: "Total No. Transactions",
                        width: "120px",
                        filterable: false,
                        groupable: false,
                        aggregates: ["sum"],
                        format: '{0:n0}',
                        footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        attributes: {style: "text-align:right;"},
                        headerAttributes: {style: "text-align:right;"},
                    },
                    {
                        field: "last_date",
                        title: "Last Receipt Date",
                        format:"{0:yyyy-MM-dd HH:mm:ss.fff}",
                        width: "150px"
                    },
                    {
                        field: "failed",
                        title: "No. of Errors",
                        width: "80px",
                        filterable: false,
                        groupable: false,
                        aggregates: ["sum"],
                        format: '{0:n0}',
                        footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        attributes: {style: "text-align:right;"},
                        headerAttributes: {style: "text-align:right;"},
                    },
                    /*

                    {
                        field: "successful",
                        title: "Successful",
                        width: "80px",
                        filterable: false,
                        groupable: false,
                        aggregates: ["sum"],
                        format: '{0:n0}',
                        footerTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        groupFooterTemplate: "<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                        attributes: {style: "text-align:right;"},
                        headerAttributes: {style: "text-align:right;"},
                    },
                     */
                ]
            };


            $uibModalInstance.rendered.then(function()
            {
                uiSvc.displayKendoLoader("#dialogGrid", true);
                dataSvc.refreshTPCIVendor(dialogData).then(function (result)
                {
                    // parse the data
                    _this.model.data = dataSvc.parseTPCIVendorData(result);
                    _this.model.flags.refresh.value += 1;
                }).catch(function (result) {
                    $log.error("Unable to retrieve Vendor Detail Information", result);
                })
            }).catch(function (result) {
                $log.error("Unable to retrieve Information", result);
            });


        };


        _this.functions.initialize();
        //</editor-fold>
    }]);
});
