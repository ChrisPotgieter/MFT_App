/*
 /// <summary>
 /// app.modules.spe.controllers - itxaEventListDialogCtrl.js
 /// Controller for ITX Transaction Detail - ITXA Event List Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/10/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('itxaEventListDialogCtrl', ['$uibModalInstance', '$filter', 'uiSvc', 'speDataSvc', 'dialogData', function ($uibModalInstance, $filter, uiSvc,  dataSvc, dialogData)
    {

        // initialize variables
        let _this = this;
        _this.model = {};


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
            let titleInfo = _this.functions.getTitle(dialogData.shape);
            _this.model.title = titleInfo.title;
            _this.model.icon = titleInfo.icon;
            _this.functions.setupGrid();
        };
        _this.functions.getTitle = function(shapeInfo)
        {
            let returnInfo = {title: shapeInfo.description, icon: "fa fa-exchange"};
            switch (shapeInfo.name.toLowerCase())
            {
                case "ack":
                    returnInfo.title = "Acknowledgements";
                    returnInfo.icon = "fa fa-external-link";
                    break;
                case "transactions":
                    returnInfo.title = "X12 Transactions";
                    returnInfo.icon = "fa fa-files-o";
                    break;
                case "grouping":
                    returnInfo.title = "Grouping";
                    returnInfo.icon = "fa fa-cube";
                    break;
            }
            return returnInfo;
        };

        _this.functions.drill = function(model)
        {
            // routine to display the event dialog for the event in question
            dataSvc.showITXAEventDetail(dialogData.events, model.id);
        };

        _this.functions.setupGrid = function()
        {
            // routine to setup the grid
            let indexes = dialogData.indexes;
            let eventList = dialogData.events;

            // loop through the index list and create the grid
            _this.model.data = [];
            lodash.forEach(indexes, function(eventIndex)
            {
                // try and find the event
                if (eventList.length >= eventIndex)
                {
                    let event = eventList[eventIndex];

                    // create a grid row
                    let row = {id: eventIndex, description: event.description};
                    let value = $filter("localUTCEpochDateFilter")(event.event_date, "YYYY-MM-DD HH:mm:ss.SSS");
                    row.event_date = $filter("kendoDateFilter")(value);
                    row.type = dataSvc.getEventDescription(event.type);
                    row.supplemental = event.supplemental;
                    if (event.status == 0)
                        row.rowStyle = "transactionError";

                    // add the row
                    _this.model.data.push(row);
                }
            });

            // set the grid options
            let columns = [
                {
                    field: "event_date",
                    title: "Event Date",
                    format: "{0:yyyy-MM-dd HH:mm:ss.fff}",
                    width: "200px",
                    aggregates: ["count"],
                    footerTemplate: "No. of Events: #=count#",
                    filterable: false
                },
                {
                    field: "description",
                    title: "Description",
                    width: "250px",
                },
                {
                    field: "type",
                    title: "Type",
                    width: "250px",
                    attributes: {
                        style: "text-overflow:ellipsis;white-space:nowrap;",
                        class: "supplementalStatus"
                    }
                },
            ];

            _this.model.options = {
                sortable: true,
                groupable: false,
                filterable: true,
                columnMenu: false,
                resizable: true,
                scrollable: true,
                pageable: false,
                selectable: "row",
                dataSource:
                    {
                        sort:
                            [
                                {field: "event_date", dir: "asc"},
                                {field: "id", dir: "desc"}
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
                                                event_date: {type: "date"},
                                                type: {type: "string"},
                                                description: {type: "string"},
                                                supplemental: {type: "string"},
                                            }
                                    }
                            },
                        aggregate: [{field:"event_date", aggregate: "count"}]
                 },
                columns: columns,
                dataBound: function (e) {
                    var grid = this;
                    uiSvc.dataBoundKendoGrid(grid, _this.functions.drill);
                }
            };

            _this.model.height = "400";
        };
        //</editor-fold>



        // initialize the controller
        _this.functions.init();
    }]);
});
