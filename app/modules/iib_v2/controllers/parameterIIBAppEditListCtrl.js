/*
 /// <summary>
 /// app.modules.iib_v2.controllers - parameterIIBAppEditListCtrl
 /// Controller to Manage IIB Config of Applications
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/01/2020
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash', 'moment', 'bootstrap-validator'], function (module, lodash, moment) {
    "use strict";
    moment().format();


    module.registerController('parameterIIBAppEditListCtrl', ['$log', 'adminDataSvc', 'uiSvc', 'iibv2DataSvc', function ($log, adminDataSvc, uiSvc, iibv2DataSvc)
    {
        let _this = this;
        _this.functions = {};


        // set the record initializer
        _this.functions.initializeRecord = function(item)
        {
            if (item.jsonData == null)
                item.jsonData = {};
            if (item.jsonData.metadata == null)
                item.jsonData.metadata = [];
            if (item.jsonData.flows == null)
                item.jsonData.flows = [];

            // update the row ids
            lodash.forEach(item.jsonData.metadata, function(row, index)
            {
                row.rowId = index;
                row.newRecord = true;
            });

            lodash.forEach(item.jsonData.flows, function(row, index)
            {
                row.rowId = index;
                row.newRecord = false;

                if (!row.nodes)
                    row.nodes = [];
                lodash.forEach(row.nodes, function(nodeRow, nodeIndex)
                {
                    nodeRow.rowId = nodeIndex;
                    nodeRow.newRecord = false;
                })
            });
            item.initialized = true;
        };

        _this.functions.onPostRecord = function(item)
        {
            // routine to remove all unnecessary data from the item prior to post
            let flows = [];
            let metadata = [];
            if (!item.jsonData)
                return null;
            if (item.jsonData.flows)
            {
                let active = lodash.filter(item.jsonData.flows, function(subRow)
                {
                    return subRow.recordStatus != uiSvc.editModes.DELETE;
                });

                flows = lodash.map(active, function(flow)
                {
                    var nodes = [];
                    if (flow.nodes)
                    {
                        nodes = lodash.map(flow.nodes, function(node)
                        {
                            var record = {code: node.code.toUpperCase(), description: node.description, payload: node.payload, payload_mandatory: node.payload_mandatory, audit: node.audit};
                            if (record.payload_mandatory)
                                record.payload = true;
                            return record;
                        });
                    }
                    return  {code: flow.code.toUpperCase(), description: flow.description, nodes: nodes, payload: flow.payload};
                });
            }
            if (item.jsonData.metadata)
            {
                let active = lodash.filter(item.jsonData.metadata, function(subRow)
                {
                    return subRow.recordStatus != uiSvc.editModes.DELETE;
                });
                metadata = lodash.map(active, function(metadata)
                {
                    return {id: metadata.id, name: metadata.name, width:  metadata.width, displayName: metadata.displayName, filter: metadata.filter};
                })
            }
            item.jsonData = {payload: item.jsonData.payload, flows: flows, metadata: metadata};
            return item;
        };


        // set the new record initializer
        _this.functions.initializeNewRecord = function(row)
        {

            if (!row.jsonData)
                row.jsonData = {};
            row.jsonData.payload = false;
            row.jsonData.payload_mandatory = false;
            row.jsonData.audit = true;
            if (!row.jsonData.metadata)
                row.jsonData.metadata = [];
            if (!row.jsonData.flows)
                row.jsonData.flows = [];
            return row;
        };
        // initialize the controller as a list editor controller
        let titleData = {title: iibv2DataSvc.getTitle() + " Application List"};
        let dialogData = {
            template: 'app/modules/iib_v2/partials/parameter-app-dialog.tpl.html',
            controller: 'parameterIIBAppEditDialogCtrl',
            alias: 'vmDetail',
        };


        adminDataSvc.listFunctions.initializeListController(_this, "IIB_APP", dialogData, titleData);
        _this.model.flags.allowAdd = false;

         // setup the grid options
        let options = lodash.cloneDeep(uiSvc.getKendoGridMetaConfigGridOptions(_this.stateInfo, _this.functions));
        options.columns.push(
            {
                field: "flow_count",
                title: "Flows",
                width: "150px",
                filterable: false,
                attributes:{style:"text-align:right;"},
                headerAttributes:{style:"text-align:right;"},
                template: function (dataItem)
                {
                    return dataItem.jsonData.flows.length;
                }
            }
        );
        _this.model.gridOptions  = options;


        // initialize the screen
        _this.functions.initialize();
    }]);

});


