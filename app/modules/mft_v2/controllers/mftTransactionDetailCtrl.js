/*
 /// <summary>
 /// app.modules.mft_v2.controllers - mftTransactionDetailCtrl.js
 /// Controller for MFT v2 Transaction Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function (module, lodash) {

    "use strict";

	module.registerController('mftTransactionDetailCtrl', ['$scope', 'uiSvc', 'mftv2DataSvc', function ($scope,  uiSvc, mftv2DataSvc)
    {

        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {flags: {diagramInitialized: false, paneInitialized: false}};
        _this.diagramOptions =  {
            layout: {
                type: "tree",
                subtype: "tipover",
                underneathHorizontalOffset: 140
            },
            connectionDefaults: {
                selectable: false,
                endCap:"ArrowEnd",
                stroke: {
                    color: "#979797",
                    width: 1
                }
            },
            zoomRate: 1,
            zoomMin: 1,
            zoomMax: 1

        };

        //<editor-fold desc="Diagram">
        _this.functions.buildCommandInfo = function(callObject)
        {
            // routine to build a command info dialog object from the call structure
            var resultObject = {};
            resultObject.outcome = callObject.outcome;
            resultObject.returnCode = callObject.return_code;
            resultObject.executeRetries = callObject.retry_count;
            callObject.resultObject = resultObject;

            if (callObject.call_properties)
                callObject.command_properties = callObject.call_properties;
            if (callObject.command_details.properties)
            {
                callObject.command_details.properties = mftv2DataSvc.parseCallProperties(callObject.command_details.properties, callObject.command_type);
            }
            return callObject;
        };
        _this.functions.diagramDrawer =  function (options)
        {
        // function to control how the diagram is drawn
        var dataviz = kendo.dataviz;
        var g = new dataviz.diagram.Group();

        var dataItem = options.dataItem;

        var color = "green";
        var baseColor = "#D4D4F0";
        if (dataItem.isError)
            color = "#a90329";
        if (!dataItem.enabled)
        {
            color = "black";
            baseColor = "#D1D1D7";
        }
        if (dataItem.shapeType === 2)
        {
            var image = new dataviz.diagram.Image({
                source: dataItem.image.src,
                width: dataItem.image.width,
                height: dataItem.image.height
            });
            g.append(image);
        }
        if (dataItem.shapeType === 0)
        {

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
                x: 5, y:5,
                stroke:
                    {
                        color: baseColor,
                        width: 1
                    },
                fill: baseColor
            }));
        }

        if (dataItem.shapeType === 1)
        {
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

        _this.functions.refreshDiagram = function()
        {
            // routine to refresh the diagram
            var serverData = $scope.data;
            var diagram = $scope.diagram;
            uiSvc.drawKendoDiagramPoints(diagram, serverData.diagram, _this.functions.diagramDrawer);
            if (serverData.diagram.zoom > 0)
            {
                diagram.options.zoomMin = serverData.diagram.zoom;
                diagram.options.zoomMax = serverData.diagram.zoom;
                diagram.zoom(serverData.diagram.zoom);
            }
        };

        _this.functions.navDiagram = function(event)
        {
            if (event.item.dataItem != null)
            {
                // based on the event type tell the dialog what do do and pass it data
                let nodeData = event.item.dataItem.route;
                let controlOptions = {};
                let record = {};
                //angular.fromJson(.routeParams);
                switch (nodeData.routeName)
                {
                    case "files":
                        controlOptions.templateUrl = "app/modules/mft_v2/partials/transaction-detail-item-dialog.tpl.html";
                        controlOptions.controller = "mftTransactionItemDialogCtrl";
                        controlOptions.size = 'lg';
                        controlOptions.windowClass = 'xl-modal';
                        record = {flags: {extended: $scope.data.transaction.module_data.extended_file_spec_index > 0}};
                        record.transactionId = $scope.data.transaction.transactionId;
                        record.data = $scope.data.transaction.module_data.items;
                        break;
                    case "exits":
                        controlOptions.templateUrl = "app/modules/mft_v2/partials/exit-detail-dialog.tpl.html";
                        controlOptions.controller = "mftExitDialogCtrl";
                        controlOptions.size = 'lg';

                        // filter the data according to type
                        let exitType = angular.fromJson(nodeData.routeParms).type;
                        record = mftv2DataSvc.getExitHeader(exitType);
                        record.records = lodash.filter($scope.data.transaction.module_data.exits, {exit_type: exitType});
                        break;

                    case "meta":
                        controlOptions.templateUrl = "app/modules/common/partials/common-meta-view-dialog.tpl.html";
                        controlOptions.controller = "commonMetaDialogCtrl";
                        controlOptions.size = 'lg';
                        record = $scope.data.transaction.meta_data;
                        break;
                    case "commands":
                        controlOptions.templateUrl = "app/modules/common/partials/dialog-command-info.tpl.html";
                        controlOptions.controller = "commonCommandInfoDialogCtrl";
                        controlOptions.size = 'lg';
                        controlOptions.windowClass = 'xl-modal';
                        controlOptions.resolve = {
                            dialogData: function()
                            {
                                return record;
                            }
                        };

                        // filter the data according to type
                        let commandType = angular.fromJson(nodeData.routeParms).type;
                        record = mftv2DataSvc.getCallHeader(commandType);
                        let dataObject = lodash.find($scope.data.transaction.module_data.commands, {call_type: commandType});
                        record.data = _this.functions.buildCommandInfo(dataObject);
                        controlOptions.resolve = {
                            dialogData: function()
                            {
                                return record;
                            }
                        };

                        break;
                }
                _this.functions.showDialog(record, controlOptions);
            }
        };

        _this.functions.showDialog = function(record, controlOptions)
        {
            // routine to bring up the dialog for meta data entry
            uiSvc.showDialog(record, controlOptions);
        };
        //</editor-fold>

        //<editor-fold desc="Initialization">
        _this.functions.initView = function()
        {
            // routine to initialize the view when the data changes
            _this.functions.refreshDiagram();
        };

        _this.functions.checkInit = function()
        {
            // routine to check if both the panes and the diagram have been initialized and therefore we can request data from the server
            if (_this.model.flags.diagramInitialized && _this.model.flags.paneInitialized)
            {
                $scope.initView();          // This will cause the read from the server which will invoke the v2_changed event
            }
        };
        //</editor-fold>

        //<editor-fold desc="Event Subscribers">
        $scope.$on("kendoWidgetCreated", function(event, widget)
        {
            // once the kendo widgets are created
            if ($scope.diagram === widget)
            {
                _this.model.flags.diagramInitialized = true;
                _this.functions.checkInit();
            }
        });

        $scope.$on("panes_init", function(event, panes)
        {
            // once we know the splitter pane has been initialize the panes
            _this.model.flags.paneInitialized = true;
            _this.functions.checkInit();
        });

        $scope.$on("mft_v2_changed", function()
        {
            // build the screen when we have been told we have data from the parent
            mftv2DataSvc.createBaseTransaction($scope.data);
            $scope.initializeTabs();
            _this.functions.initView();
        });
        //</editor-fold>
    }]);
});
