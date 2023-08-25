/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedTransactionDetailCtrl
 /// SPE InstaMed Extension
 /// Abstract Controller that is the parent of all Detail Reporting Controllers
 /// Main Driver of Transaction Detail
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */
define(['modules/spe/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('speInstaMedTransactionDetailCtrl', ['$scope', '$timeout', '$state', '$stateParams', '$filter','$log', 'speInstamedDataSvc',function($scope, $timeout, $state, $stateParams, $filter, $log, speInstamedDataSvc)
	{
	    var _this = this;
        _this.functions = {};
        _this.model = {};
        _this.model.balancingRecord = {};
        _this.model.overallRecord = {};
        _this.model.claimList = [];
        _this.model.titles = speInstamedDataSvc.getProcTitles();


        // setup the splitter
        _this.model.splitter = {orientation: "horizontal", panes:[]};
        _this.model.splitter.panes.push({collapsible: true, resizable: true,  scrollable: false});
        _this.model.splitter.panes.push({collapsible: false, resizable: true, scrollable: false});

        // add the kendo listener
        $scope.$on("kendoWidgetCreated", function(event, widget)
        {
            // once the kendo widgets are created
            if ($scope.splitter == widget)
                _this.functions.initPanes();
        });

        //<editor-fold desc="Initialization">
        _this.functions.updateStatus = function()
        {
            // routine to update the overall model and recalc the status
            var bootstrapValue  = (_this.model.overallRecord.perc < 100 ? 3: 2);

            // update the status
            _this.model.status = {};
            _this.model.status.progress = _this.model.overallRecord.perc;
            _this.model.status.id = _this.model.balancingRecord.eftkey;
            _this.model.status.idCaption = "Batch Id";
            _this.model.status.alertClass = "alert-" +  $filter("bootStrapStatusFilter")(bootstrapValue);
            _this.model.status.labelClass = "label-" + $filter("bootStrapStatusFilter")(bootstrapValue);
            _this.model.status.progressClass = "progress-bar-" + $filter("bootStrapStatusFilter")(bootstrapValue);
            _this.model.status.progressStyle = {'width': _this.model.status.progress + '%'};
            _this.model.status.icon = $filter("bootStrapStatusIconFilter")(bootstrapValue);
            _this.model.status.transTypeDesc =  $filter("transType")(0);
            _this.model.status.mqaModuleDesc =  $filter("moduleType")(210);
            _this.model.status.operationDesc = $filter("operationType")(0);
            _this.model.status.desc = _this.model.balancingRecord.status.processing;

        }
        _this.functions.init = function ()
        {
            // routine to initialize and request the record when first coming into the screen
            if ($stateParams.transactionId)
            {
                var id = $stateParams.transactionId;
                speInstamedDataSvc.balancingDetail(id).then(function (result)
                {
                    _this.model.balancingRecord = result;

                    // setup the header information
                    $scope.widget = {title: "Payment Batch Details - " + id, icon: "fa fa-money txt-color-darken"};
                    $scope.tabs = [];
                    $scope.tabs.push({ title: "Time-Line" , icon: 'fa fa-clock-o', state: ".ganttview", activate:'**.ganttview.**'});
                    $scope.tabs.push({ title: "All Claim-Payments" , icon: 'fa fa-table', state: ".claimpayview", activate:'**.claimpayview.**'});
                    $scope.tabs.push({ title: "Waiting for IDF from Instamed" , icon: 'fa fa-table', state: ".idftobereceivedview", activate:'**.idftobereceivedview.**'});
                    $scope.tabs.push({ title: "IDF not sent to BICPS" , icon: 'fa fa-table', state: ".idftobesentview", activate:'**.idftobesentview.**'});

                    // calculate the gannt chart - this will give us the overall percentage
                    _this.functions.createGanttData();

                    // check if we have payments yet
                    if (result.summary.idf != undefined && result.summary.idf.idfSummary.paymentMethodSummary != undefined)
                        $scope.tabs.push({ title: "Payment Summary" , icon: 'fa fa-money', state: ".payview", activate:'**.payview.**'});

                    // tell anyone waiting we have read
                    $scope.$broadcast('instamed-balancing-changed');

                }).catch(function (result)
                {
                    $log.error("Unable to retrieve Balancing Information", result);
                    if (!$scope.data)
                        $state.go("app.error", {error: "Invalid Batch Id " + id});
                });
            }
        };
        _this.functions.initPanes = function()
        {
            // update the pane
            var panes = $scope.splitter.element.children(".k-pane");
            $scope.splitter.size(panes[0], "70%");
            $scope.splitter.size(panes[1], "30%");

            // broadcast
            $timeout(function()
            {
                $scope.$broadcast('panes_init', panes);
                $scope.splitter.resize(true);

            },500);
        };
        //</editor-fold>

        //<editor-fold desc="Gantt Chart">
        _this.functions.createGanttObject = function (id, options, dataObj)
        {
            // format the dates
            var fromDate = null;
            var toDate = null;
            if (dataObj.startDate != null) {
                fromDate = $filter("localUTCEpochDateFilter")(dataObj.startDate, "YYYY-MM-DD HH:mm:ss.SSS");
                fromDate = $filter("kendoDateFilter")(fromDate);
            }
            if (dataObj.endDate != null) {
                toDate = $filter("localUTCEpochDateFilter")(dataObj.endDate, "YYYY-MM-DD HH:mm:ss.SSS");
                toDate = $filter("kendoDateFilter")(toDate);
            }
            var task = {
                id: id,
                orderId: options.groupOrder,
                title: dataObj.title,
                parentId: options.parentId,
                start: fromDate,
                end: toDate,
                expanded: true,
                summary: options.hasChildren,
                custom: dataObj.data,
                percentComplete: dataObj.perc
            };
            if (options.perc)
                task.percentComplete = options.perc;
            if (task)
                _this.model.taskList.push(task);

            /*
            var dependancy = undefined;
            if (options.parentId != null)
                dependancy = {predecessorId: options.parentId, successorId: id, type: 1};
            if (dependancy)
                _this.model.taskListDepList.push(dependancy);

             */
        };
        _this.functions.updateGanntTaskOverallDates = function(taskObj, overallObj)
        {
            // routine to update the overall object  dates with the task dates
            if (taskObj.endDateInt >  0 && ((taskObj.endDate > overallObj.endDate) || !overallObj.endDate))
            {
                overallObj.endDateInt = taskObj.endDateInt;
                overallObj.endDate = taskObj.endDate;
            }
            if (taskObj.startDateInt > 0 && ((taskObj.startDate < overallObj.startDate) || !overallObj.startDate))
            {
                overallObj.startDateInt = taskObj.startDateInt;
                overallObj.startDate = taskObj.startDate;
            }
            if (taskObj.startDateInt == 0 && !overallObj.main)
            {
                overallObj.startDateInt = 0;
                overallObj.startDate = undefined;
            }
            if (taskObj.endDateInt == 0)
            {
                overallObj.endDateInt = 0;
                overallObj.endDate = undefined;
            }
        };

        _this.functions.initializeGanntOverallTask = function(title, data, datevar)
        {
            // return a overall task
            var returnObj =   {
                completeCount: 0,
                endDate: null,
                endDateInt: 0,
                startDate: null,
                startDateInt: 0,
                data: data,
                title: title,
                perc: 0.1,
                main: false
            };
            returnObj.data.index = -1;
            if (datevar)
            {
                returnObj.startDate = kendo.parseDate(datevar);
                returnObj.startDateInt = kendo.date.getMilliseconds(returnObj.startDate);
                returnObj.perc = 0;
                returnObj.main = true;
            }
            return returnObj;
        };

        _this.functions.completeGanntTask = function(taskObj, overallObj, datevar)
        {
            taskObj.endDate = kendo.parseDate(datevar);
            taskObj.endDateInt = kendo.date.getMilliseconds(taskObj.endDate);
            taskObj.perc = 1;
            if (taskObj.startDateInt == taskObj.endDateInt)
            {
                kendo.date.setTime(taskObj.endDate, 1000);
                taskObj.endDateInt = kendo.date.getMilliseconds(taskObj.endDate);
            }
            overallObj.completeCount++;
        };

        _this.functions.initializeGanntTask = function(datevar, title, data)
        {
            // routine to initialize a task
            var returnObj =
                {
                    startDate: kendo.parseDate(datevar),
                    data: data,
                    title: title,
                    perc: 0.1,
                };
            returnObj.startDateInt = kendo.date.getMilliseconds(returnObj.startDate);
            returnObj.endDateInt = 0;
            returnObj.endDate = undefined;
            return returnObj;
        };

        _this.functions.initDefaultGanntTask = function(taskObj, dataObj, optionsObj)
        {
            // base function to initialize a created task using default logic
            if (dataObj.mft.mftFileName)
                taskObj.title = dataObj.mft.mftFileName;
        };

        _this.functions.completeDefaultGanntTask = function(taskObj, dataObj, overallObj, optionsObj)
        {
            // base function to complete a task using default logic
            if (dataObj.mft.itxTransactionId)
                _this.functions.completeGanntTask(taskObj, overallObj, dataObj.mft.processedDate);
        };

        _this.functions.createGanntSubTasks = function(data, overallObj, optionsObj)
        {
            // routine to create sub tasks based on the given data array and options object
            if (data == undefined)
                return;
            var taskList = lodash.map(data, function (requestObj, arrayIndex)
            {
                // initialize the task
                var dateValue = lodash.get(requestObj, optionsObj.dateProperty);
                var taskObj = _this.functions.initializeGanntTask(dateValue, optionsObj.title, {type: overallObj.data.type, index: arrayIndex});

                // now call the task initializer
                optionsObj.init(taskObj, requestObj, optionsObj);

                // now call any custom processing
                if (optionsObj.custom)
                {
                    optionsObj.custom(taskObj, requestObj);
                }
                // now call the task completer
                optionsObj.complete(taskObj, requestObj, overallObj, optionsObj);

                // now update the overall object
               _this.functions.updateGanntTaskOverallDates(taskObj, overallObj);

               // return the task
                return taskObj;
            });

            // return the task list
            return taskList;
        };

        _this.functions.createGanttData = function ()
        {
            // routine to prepare the gannt chart data based on the given record
            _this.model.taskList = [];
            _this.model.taskListDepList = [];

            var record = _this.model.balancingRecord;

            // create working variables
            var dataTree = {};
            var overall = {};
            dataTree.lists = {request: [], payment: [], ack: [], partner: [], response: []};
            dataTree.overall = {};

            // step 1: server requests
            overall = _this.functions.initializeGanntOverallTask(_this.model.titles.request, {type: 1, index: -1});
            dataTree.lists.request = _this.functions.createGanntSubTasks(record.data, overall,{ dateProperty: "mft.processedDate", title:"Server Request", init: _this.functions.initDefaultGanntTask, complete: function(taskObj, dataObj, overallObj, optionsObj)
            {
                if (dataObj.balancing)
                    _this.functions.completeGanntTask(taskObj, overallObj, dataObj.mft.processedDate);

            }});
            dataTree.overall.request = overall;

            // step 2: x12835 payments
            overall = _this.functions.initializeGanntOverallTask(_this.model.titles.x12835, {type: 2});
            dataTree.lists.payment = _this.functions.createGanntSubTasks(record.x12835, overall,{ dateProperty: "createDateTime", title:"Payment EDI", init: _this.functions.initDefaultGanntTask, complete: _this.functions.completeDefaultGanntTask});
            dataTree.overall.payment = overall;

            // step 3: x12 99 ack
            overall = _this.functions.initializeGanntOverallTask(_this.model.titles.x12999, {type: 3});
            dataTree.lists.ack = _this.functions.createGanntSubTasks(record.x12999, overall,{ dateProperty: "processedDate", title:"Ack EDI", init: _this.functions.initDefaultGanntTask, complete: _this.functions.completeDefaultGanntTask, custom: function(taskObj, dataObj)
            {
                // update the rejection data
                if (dataObj.rejected && dataObj.rejected.transactionCount && dataObj.rejected.transactionCount > 0)
                    taskObj.data.rejected = true;
            }});
            dataTree.overall.ack = overall;

            // step 4: partner data recieved
            overall = _this.functions.initializeGanntOverallTask(_this.model.titles.partner, {type: 4});
            dataTree.lists.partner = _this.functions.createGanntSubTasks(record.idf, overall,{ dateProperty: "receivedDateTime", title:"Partner Response", init: _this.functions.initDefaultGanntTask, complete: _this.functions.completeDefaultGanntTask});
            dataTree.overall.partner = overall;

            // step 5: response processing
            overall = _this.functions.initializeGanntOverallTask(_this.model.titles.response, {type: 5});
            dataTree.lists.response = _this.functions.createGanntSubTasks(record.idfResponse, overall,{ dateProperty: "responseDate", title:"Response Processed",
            init: function(taskObj, dataObj, optionsObj)
            {
                taskObj.title = dataObj.idfJobId;
            },
            complete: function(taskObj, dataObj, overallObj, optionsObj)
            {
                _this.functions.completeGanntTask(taskObj, overallObj, dataObj.responseDate);
            }});
            dataTree.overall.response = overall;

            // now that we have a datatree work out the gannt
            _this.model.overallRecord = _this.functions.initializeGanntOverallTask(_this.model.titles.main, {type: 0}, record.control.mft.processedDate);

            // process overall objects perc and main perc
            lodash.forOwn(dataTree.lists, function (arrayObj, key)
            {
                var overallObj = dataTree.overall[key];
                if (overallObj)
                {
                    // perc = no sub tasks / complete count
                    if (arrayObj == undefined)
                        overallObj.perc = 0;
                    else
                        overallObj.perc = (arrayObj.length / overallObj.completeCount);

                    // update the dates
                    _this.functions.updateGanntTaskOverallDates(overallObj, _this.model.overallRecord);

                    // update the overall perc
                    if (arrayObj != undefined && arrayObj.length > 0 && overallObj.perc == 1)
                        _this.model.overallRecord.perc += 20;
                }
            });

            // now create the gannt chart
            var id_counter = -1;
            var sub_counter = 0;
            _this.functions.createGanttObject(++id_counter, {groupOrder: 0, parentId: null, hasChildren: true, perc: _this.model.overallRecord.perc/100}, _this.model.overallRecord);
            lodash.forOwn(dataTree.overall, function (overallObj, key) {
                var records = dataTree.lists[key];
                _this.functions.createGanttObject(++id_counter, {groupOrder:1, parentId: 0, hasChildren: records != undefined && records.length > 0}, overallObj);
                sub_counter = id_counter;
                lodash.forEach(records, function (arrayObject, index) {
                    _this.functions.createGanttObject(++id_counter, {groupOrder: index, parentId: sub_counter,  hasChildren: false}, arrayObject);
                })
            });

            // update the status
            _this.functions.updateStatus();
        };
        //</editor-fold>

        _this.functions.init();

    }]);

});

