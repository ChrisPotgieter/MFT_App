/*
 /// <summary>
 /// app.modules.iib_v2.controllers - parameterIIBJobEditListCtrl
 /// Controller to Manage IIB Config of Jobs
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/01/2020
 /// </summary>
 */

define(['modules/iib_v2/module', 'lodash', 'moment', 'bootstrap-validator'], function (module, lodash, moment) {
    "use strict";
    moment().format();


    module.registerController('parameterIIBJobEditListCtrl', ['$log', 'adminDataSvc', 'uiSvc', 'iibv2DataSvc', function ($log, adminDataSvc, uiSvc, iibv2DataSvc)
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

            // update the row ids
            lodash.forEach(item.jsonData.metadata, function(row, index)
            {
                row.rowId = index;
                row.newRecord = true;
            });

        };

        _this.functions.onPostRecord = function(item)
        {
            // routine to remove all unnecessary data from the item prior to post
            let metadata = [];
            if (!item.jsonData)
                return null;
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
            item.jsonData = {metadata: metadata};
            return item;
        };

        // initialize the controller as a list editor controller
        let titleData = {title: iibv2DataSvc.getTitle() + " Job List"};
        let dialogData = {
            template: 'app/modules/iib_v2/partials/parameter-job-dialog.tpl.html',
            controller: 'parameterIIBJobEditDialogCtrl',
            alias: 'vmDetail',
        };


        adminDataSvc.listFunctions.initializeListController(_this, "IIB_JOB", dialogData, titleData);

         // setup the grid options
        _this.model.gridOptions  = uiSvc.getKendoGridMetaConfigGridOptions(_this.stateInfo, _this.functions);


        // initialize the screen
        _this.functions.initialize();
    }]);

});


