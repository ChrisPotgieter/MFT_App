/*
 /// <summary>
 /// app.modules.itx.controllers - itxTransactionDetailCtrl.js
 /// Controller for ITX Transaction Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/10/2022
 /// </summary>
 */

define(['modules/spe/module', 'lodash'], function (module, lodash) {

    "use strict";
    module.registerController('itxTransactionDetailCtrl', ['$scope', 'uiSvc', 'speDataSvc', function ($scope, uiSvc, dataSvc) {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {flags: {diagramInitialized: false, paneInitialized: false, diagram_refresh: 0}};

        //<editor-fold desc="ITXA Diagram">
        _this.functions.drawKendoFlowDiagram = function(diagram, data)
        {
            uiSvc.drawKendoDiagramPoints(diagram, data, _this.functions.ITXADiagramDrawer);
        };

        _this.functions.ITXADiagramDrawer = function (options)
        {
            // function to control how the diagram is drawn for an ITXA Diagram
            var dataviz = kendo.dataviz;
            var g = new dataviz.diagram.Group();

            var dataItem = options.dataItem;

            var color = "green";
            var baseColor = "#D4D4F0";
            if (dataItem.isError)
                color = "#a90329";
            if (!dataItem.enabled) {
                color = "black";
                baseColor = "#D1D1D7";
            }
            if (dataItem.shapeType === 2) {
                var image = new dataviz.diagram.Image({
                    source: dataItem.image.src,
                    width: dataItem.image.width,
                    height: dataItem.image.height
                });
                g.append(image);
            }
            if (dataItem.shapeType === 0) {

                g.append(new dataviz.diagram.Circle({
                    radius: 60,

                    stroke:
                        {
                            color: color,
                            width: 1
                        },
                    fill: color
                }));

                g.append(new dataviz.diagram.Circle({
                    radius: 55,
                    x: 5, y: 5,
                    stroke:
                        {
                            color: baseColor,
                            width: 1
                        },
                    fill: baseColor
                }));
            }

            if (dataItem.shapeType === 1) {
                g.append(new dataviz.diagram.Rectangle({
                    width: 200,
                    height: 67,
                    stroke: {
                        width: 0
                    },
                    fill: baseColor
                }));
                g.append(new dataviz.diagram.Rectangle({
                    width: 8,
                    height: 67,
                    fill: color,
                    stroke: {
                        width: 0
                    }
                }));
            }
            return g;
        };

        _this.functions.displayITXAEventList = function(event_ids, dataItem)
        {
            // routine to display a list of ITXA Events given their indexes
            let controlOptions = {};
            controlOptions.templateUrl = "app/modules/spe/partials/itxa-event-list-dialog.tpl.html";
            controlOptions.controller = "itxaEventListDialogCtrl";
            controlOptions.size = 'lg';

            // show the dialog
            let events = $scope.data.transaction.module_data.events;
            let record = {indexes: event_ids, events: events, shape: dataItem};
            uiSvc.showDialog(record, controlOptions);

        };
        _this.functions.displayITXAEvent = function(event_index)
        {
            // routine to display a single ITXA Event of the given index
            dataSvc.showITXAEventDetail($scope.data.transaction.module_data.events, event_index);
        };

        //</editor-fold>

        //<editor-fold desc="ITX Launcher">
        _this.functions.drawKendoMindMap = function(diagram, dataset)
        {
            diagram.clear();
            diagram.setDataSource(new kendo.data.HierarchicalDataSource({
                data: dataset.nodes,
                schema:
                    {
                        model:
                            {
                                children: "nodes"
                            }
                    }
            }));
            diagram.bringIntoView(diagram.shapes);
        };
        _this.functions.launcherMindMap = function(options)
        {
            var dataviz = kendo.dataviz;
            var g = new dataviz.diagram.Group();
            var dataItem = options.dataItem;
            let sub_x = 45;

            let eventType = parseInt(dataItem.eventType);
            let statusType = parseInt(dataItem.nodeType);

            let statusColor = statusType == 1 ? "green" : "#a90329";
            let shapeColor = "#D4D4F0";
            let rectWidth = 120;
            let rectHeight = 75;

            switch (eventType) {
                case 0:
                    rectWidth = 340;
                    sub_x = 30;
                    break;
                case 2:
                case 3:
                    rectWidth = 120;
                    break;
                case 20:
                    rectWidth = 120;
                    statusColor = "black";
                    switch (statusType)
                    {
                        case 1:
                            statusColor = "purple";     // bursts
                            break;
                        case 3:
                            statusColor = "black";    // source
                            break;
                        case 2:
                            statusColor = "black";     // targets
                            break;
                    }
                    break;
            }

            // draw the outer rectangle
            g.append(new dataviz.diagram.Rectangle({width: rectWidth, height: rectHeight,
                    stroke: {
                            width: 1,
                            color: statusColor
                        },
                        fill: shapeColor
                    }));
            // draw the inner rectangle
            g.append(new dataviz.diagram.Rectangle({width: 8, height: rectHeight,
                stroke: {
                    width: 0,
                },
                fill: statusColor
            }));

            // draw the title
            g.append(new dataviz.diagram.TextBlock({
                text: dataItem.title,
                x: 15,
                y: 20,
            }));

            g.append(new dataviz.diagram.TextBlock({
                text: dataItem.subTitle,
                x: sub_x,
                y: 40
            }));


            /*
            g.append(new dataviz.diagram.Image({
                source: "../content/dataviz/diagram/people/" + dataItem.image,
                x: 3,
                y: 3,
                width: 68,
                height: 68
            }));

             */

            return g;
        }
        //</editor-fold>

        //<editor-fold desc="General Diagram">
        _this.functions.setDiagramOptions = function()
        {
            switch (_this.model.transaction_type)
            {
                case 20:
                    _this.diagramOptions.layout = {

                        type: "tree",
                        subtype: "mindmap"
                    };
                    _this.diagramOptions.shapeDefaults = {

                        visual: _this.functions.launcherMindMap
                    };
                    _this.diagramOptions.connectionDefaults =
                        {
                            stroke:
                                {
                                    color: "#979797",
                                    width: 2
                                }
                        };
            };

        }
        _this.functions.refreshDiagram = function () {
            // routine to refresh the diagram
            let serverData = $scope.data;
            let diagram = $scope.diagram;
            switch (_this.model.transaction_type)
            {
                case 0:
                    _this.functions.drawKendoFlowDiagram(diagram, serverData.diagram);
                    break;
                case 20:
                    _this.functions.drawKendoMindMap(diagram, serverData.diagram);
                    break;
            }
            if (serverData.diagram.zoom > 0) {
                diagram.options.zoomMin = serverData.diagram.zoom;
                diagram.options.zoomMax = serverData.diagram.zoom;
                diagram.zoom(serverData.diagram.zoom);
            }
            if (_this.model.flags.diagram_refresh === 0)
                _this.model.flags.diagram_refresh += 1;
        };

        _this.functions.navDiagram = function (event)
        {
            if (event.item.dataItem != null) {
                // based on the event type tell the dialog what do do and pass it data
                let dataItem = event.item.dataItem;
                let nodeData = dataItem.route;
                switch (nodeData.routeName)
                {
                    default:
                        let items = JSON.parse(nodeData.routeParms);
                        if (items.length == 1) {
                            _this.functions.displayITXAEvent(items[0]);
                            break;
                        } else {
                            _this.functions.displayITXAEventList(items, dataItem);
                            break;
                        }
                }
            }
        };

        //</editor-fold>

        //<editor-fold desc="Initialization">
        _this.functions.initializeRecord = function(data)
        {
            // routine to initialize the record when first read by the server
            dataSvc.createBaseTransaction($scope.data);
            _this.model.meta_data  = $scope.data.transaction.meta_data;
            _this.model.transaction_type = $scope.data.info.transaction_type;
            _this.model.operation = {icon: $scope.data.info.operation.icon ,desc : $scope.data.info.operation.desc + " Operation"};
            _this.model.headers = dataSvc.getSummaryHeaderInfo($scope.data);
            _this.functions.setDiagramOptions();
        };


        _this.functions.initView = function () {
            // routine to initialize the view when the data changes
            _this.functions.refreshDiagram();
        };

        _this.functions.checkInit = function () {
            // routine to check if both the panes and the diagram have been initialized and therefore we can request data from the server
            if (_this.model.flags.diagramInitialized && _this.model.flags.paneInitialized)
            {
                $scope.initView();          // This will cause the read from the server which will invoke the changed event
            }
        };

        _this.diagramOptions = {
            layout: {
                type: "tree",
                subtype: "tipover",
                underneathHorizontalOffset: 140
            },
            connectionDefaults: {
                selectable: false,
                endCap: "ArrowEnd",
                stroke: {
                    color: "#979797",
                    width: 1
                }
            }
        };

        //</editor-fold>

        //<editor-fold desc="Actions">
        _this.functions.viewBalancing = function()
        {
            // routine to view the balancing for the transaction
            let balancing = $scope.data.transaction.module_data.balancing;
            if (balancing.report)
                balancing = balancing.report;
            dataSvc.setBalancing(balancing);
            let dialogData  = {nodeData: balancing.summary};
            dataSvc.viewBalancing(dialogData);
        };

        _this.functions.viewGWIDList = function(status)
        {
            // routine to show the GWID List for the given status
            let id = $scope.data.transaction.transactionId;
            let document_type = $scope.data.transaction.document_type;
            dataSvc.showGWIDList(id,  document_type, status);
        };


        //</editor-fold>


        //<editor-fold desc="Event Subscribers">
        $scope.$on("kendoWidgetCreated", function (event, widget)
        {
            // once the diagram is created check that all components are initiated
            if ($scope.diagram === widget)
            {
                if (!_this.model.flags.diagramInitialized)
                {
                    _this.model.flags.diagramInitialized = true;
                    _this.functions.checkInit();
                }
                else
                    _this.functions.initView();
            }
        });

        $scope.$on("panes_init", function (event, panes) {
            // once we know the splitter pane has been initialize the panes
            _this.model.flags.paneInitialized = true;
            _this.functions.checkInit();
        });

        $scope.$on("spe-changed", function () {
            // build the screen when we have been told we have data from the parent (by the $scope.initView()) call
            _this.functions.initializeRecord($scope.data);

            // tell the system to show the diagram now that we have the right diagram options set
            $scope.initializeTabs();
            _this.functions.initView();
        });
        //</editor-fold>



    }]);
});
