/*
 /// <summary>
 /// app.modules.boomi.controllers - boomiTransactionDocumentListDialogCtrl.js
 /// Controller for Boomi Transaction Detail - Document Event List Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/10/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('boomiTransactionDocumentListDialogCtrl', ['$uibModalInstance', '$filter', 'uiSvc', 'boomiDataSvc', 'dialogData', function ($uibModalInstance, $filter, uiSvc,  dataSvc, dialogData)
    {

        // initialize variables
        let _this = this;
        _this.model = {data:[], flags:{inProgress: false}};


        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.init = function()
        {
            // routine to initialize the controller based on the data
            _this.model.title = "Documents for Step " + dialogData.step.description;
            _this.model.icon = "fa fa-files-o";
            _this.functions.initData();
            _this.functions.setupGrid();

            _this.model.inputFilter = {data:[]};
            _this.model.inputFilter.keyOptions = [];
            _this.model.inputFilter.options = {allowRefresh: true, allowClear: true};

        };
        _this.functions.initData = function()
        {
            _this.model.data = _this.functions.parseData(dialogData.documents);
        };

        _this.functions.drill = function(model)
        {
            // show the default action for the id
            if (model.allow_attachment)
            {
                _this.functionManager.viewAttachment(model.id);
                return;
            }
            if (model.allow_meta)
            {
                _this.functionManager.viewMetaData(model.id);
            }
        };

        _this.functions.parseData = function(docList)
        {
            // routine to parse the data and prepare for grid display
            lodash.forEach(docList, function(item, index)
            {
                item.id = index + 1;
                if (!item.size)
                    item.size = 0;
                item.allow_meta = item.meta_data != null;
                item.allow_attachment = item.attachment_id != null;
                if (item.allow_attachment)
                    item.attachment_text = "View Document (" + item.attachment_format + ")";
                item.supplemental = "";
                if (item.error)
                {
                    let arry = item.error.split("\r\n");
                    item.supplemental = arry[0];
                    item.toolTip = item.error.replaceAll("\r\n","<br>");
                    item.rowStyle = "transactionError";
                }

            });
            return docList;

        }

        _this.functions.setupGrid = function()
        {
            // set the grid options
            let columns = [
                {
                    field: "id",
                    title: "Item",
                    width: "40px",
                },
                {
                    field:"options",
                    title:"Options",
                    width: "250px",
                    aggregates: ["count"],
                    footerTemplate: "Total Documents: #=count#",
                    template: function(dataItem)
                    {
                        var commands = [];
                        if (dataItem.allow_meta)
                        {
                            let button = "<button class='margin-left-10 margin-bottom-5 margin-top-10 k-button' ng-click=\"functionManager.viewMetaData(\'" + dataItem.id + "\');\"><i class='fa fa-info-circle'></i> Meta-Data...</button>";
                            commands.push(button)
                        }
                        if (dataItem.allow_attachment)
                        {
                            let button = "<button class='margin-left-10 margin-bottom-5 margin-top-10 k-button' ng-click=\"functionManager.viewAttachment(\'" + dataItem.id+ "\');\"><i class='fa fa-paperclip'></i> " + dataItem.attachment_text + "</button>";
                            commands.push(button)
                        }

                        var html = lodash.join(commands, "\n");
                        return html;
                    }
                },
                {
                    field: "size",
                    title: "Size",
                    width: "150px",
                    aggregates: ["sum"],
                    attributes: {style: "text-align:right;"},
                    headerAttributes: {style: "text-align:right;"},
                    template: function (dataItem) {
                        return $filter("bytesFilter")(dataItem.size);
                    },
                    footerTemplate: function (dataItem) {
                        var value;
                        if (dataItem.size)
                            value = (dataItem.size.sum);
                        else
                            value = dataItem.sum;
                        if (value == null)
                            return null;
                        return "<div style=\"text-align: right\">" + $filter("bytesFilter")(value);
                    },
                    groupFooterTemplate: function (dataItem) {
                        return "<div style=\"text-align: right\">" + $filter("bytesFilter")(dataItem.size.sum);
                    }
                },
                {

                    field: "supplemental",
                    title: "Error Supplemental",
                    encoded: false,
                    width: "200px",
                    attributes: {
                        style: "text-overflow:ellipsis;white-space:pre-line;",
                        class: "supplementalStatus"
                    }
                },
            ];

            _this.model.options = {
                sortable: false,
                groupable: false,
                filterable: false,
                columnMenu: false,
                resizable: true,
                scrollable: true,
                pageable: false,
                selectable: "row",
                dataSource:
                    {
                        pageSize: 2000,
                        sort:
                            [
                                {field: "id", dir: "asc"}
                            ],
                        schema:
                            {
                                model:
                                    {
                                        id: "id",
                                        uid: "id",
                                        fields:
                                            {
                                                id: {type: "number"},
                                                size:{type:"number"},
                                                allow_meta: {type: "boolean"},
                                                allow_attachment: {type: "boolean"},
                                                supplemental: {type: "string"},
                                                attachment_text :{type: "string"},
                                                options:{type:"string"},
                                            }
                                    }
                            },
                        aggregate: [{field:"options", aggregate: "count"},
                                    {field: "size", aggregate: "sum"}]
                 },
                columns: columns,
                dataBound: function (e) {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);
                }
            };
            // add the function manager
            _this.functionManager = {};

            _this.functionManager.viewMetaData = function(id)
            {
                // routine to invoke the cancellation of the given id
                if (_this.model.flags.inProgress)
                    return;
                let row = lodash.find(_this.model.data, {id: parseInt(id)});
                if (row == null)
                    return;
                dataSvc.showDocumentMeta(row.meta_data);
            };
            _this.functionManager.viewAttachment = function(id)
            {
                // routine to invoke the view of the attachment
                if (_this.model.flags.inProgress)
                    return;
                let row = lodash.find(_this.model.data, {id: parseInt(id)});
                if (row == null)
                    return;
                let record = {icon: _this.model.icon, attachment_id: row.attachment_id, attachment_format: row.attachment_format};
                dataSvc.viewDocument(record);
            };

            _this.functionManager.gridCreate = function(grid)
            {
                // add the tooltip to the status column
                uiSvc.addKendoGridTooltip("supplementalStatus", grid, "toolTip");
            };
            _this.functionManager.onMetaFilterChange = function(model)
            {
                // routine that will be invoked when the meta-data filter changes
                let filterObject = {transactionId:dialogData.transactionId, stepIndex: dialogData.step.dataIndex, metaInputs:[]};
                if (_this.model.inputFilter)
                    filterObject.metaInputs = dataSvc.getMetaInputs(_this.model.inputFilter);

                if (filterObject.metaInputs.length == 0)
                {
                    _this.functions.initData();
                    return
                }

                _this.model.flags.inProgress = true;
                dataSvc.documentSearch(filterObject).then(function(result)
                {
                    // update the dataset
                    _this.model.data = _this.functions.parseData(result.documents);
                }).catch(function(err)
                {
                }).finally(function()
                {
                    _this.model.flags.inProgress = false;
                });

            }

        };
        //</editor-fold>



        // initialize the controller
        _this.functions.init();
    }]);
});
