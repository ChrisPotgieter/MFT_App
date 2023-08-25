/*
 /// <summary>
 /// app.modules.spe.extension.instamed.controllers - speInstaMedBalancingDetailGanttViewCtrl
 /// SPE InstaMed Extension
 /// Gantt Chart Controller to manage the Gantt Chart Detail View
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */
define(['modules/spe/module'], function (module)
{
    module.registerController('speInstaMedTransactionDetailGanttViewCtrl', ['$scope', '$log', '$uibModal','uiSvc', function($scope, $log, $uibModal, uiSvc)
    {
        // initialize the object
        var _this = this;
        _this.functions = {};
        _this.model = {};

        // TODO: Allow Gannt Chart Drill
        _this.functions.drill = function(model)
        {
            // routine to manage the drilling
            if ($scope.vmDetailAbstract.model.balancingRecord == undefined || $scope.vmDetailAbstract.model.balancingRecord.eftkey == undefined)
                return; // the tasks have not yet initialized


            var balancingRecord = $scope.vmDetailAbstract.model.balancingRecord;


            var controlOptions = null;
            var record = null;
            switch (model.custom.type)
            {
                case 4: // partner idf
                    controlOptions =
                    {
                        templateUrl: 'app/modules/spe/extensions/instamed/partials/transaction-drill-partner.tpl.html',
                        controller: 'speInstaMedTransactionDrillPartnerDialogCtrl',
                    };
                    record =  balancingRecord.idf[model.custom.index];
                    break;
                case 5: // response idf
                    controlOptions =
                        {
                            templateUrl: 'app/modules/spe/extensions/instamed/partials/transaction-drill-response.tpl.html',
                            controller: 'speInstaMedTransactionDrillResponseDialogCtrl',
                        };
                    record =  balancingRecord.idfResponse[model.custom.index];
                    break;
            }

            // bring up the dialog
            if (record != null && controlOptions != null)
            {
                _this.functions.showDialog(record, controlOptions);
            }
        };
        _this.functions.showDialog = function(record, controlOptions)
        {
            // routine to bring up the dialog for meta data entry
            var dialogData = {};
            dialogData.row = angular.copy(record);
            var modalOptions = {
                animation: true,
                backdrop: 'static',
                templateUrl: controlOptions.templateUrl,
                controller: controlOptions.controller,
                controllerAs:'vmDialog',
                resolve:
                    {
                        dialogData: dialogData
                    }
            };

            var modalInstance = $uibModal.open(modalOptions);
            modalInstance.result.then(function (result)
            {

            }, function ()
            {
            });
        };


        //<editor-fold desc="Functions">

        _this.functions.init = function()
        {
            // by this time the gannt data has been worked out by the base controller so just create the kendo options and datasets
            if (!$scope.vmDetailAbstract.model.taskList || $scope.vmDetailAbstract.model.taskList.length == 0)
                return; // the tasks have not yet initialized
            var dateRange = {start: $scope.vmDetailAbstract.model.overallRecord.startDate, end: $scope.vmDetailAbstract.model.overallRecord.endDate };
            if (dateRange.end != undefined)
            {
                dateRange.end = kendo.date.setTime(dateRange.end, 100);
            }
            _this.model.ganttOptions =
                {
                    toolbar:[
                        { template: kendo.template($("#template").html()) }
                    ],
                    dataSource:
                    {
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: {from: "id", type: "number"},
                                    orderId: {type: "number"},
                                    parentId: {type: "number"},
                                    start: {type: "date"},
                                    end: {type: "date"},
                                    title: {type: "string"},
                                    percentComplete: {type: "number"},
                                    summary: {type:"boolean"},
                                    expanded: {type:"boolean"},
                                    custom:{type:"object"}
                                }
                            }
                        },
                        data: $scope.vmDetailAbstract.model.taskList
                    },
                    //dependancies: deps,
                    views: [
                        {
                            type: "day", selected: true,
                            range: dateRange
                        }
                    ],
                    columns: [
                        { field: "id", title: "ID", width: 60 },
                        { field: "title", title: "Title", width: 300 },
                        { field: "start", title: "Start Time", format:"{0:G}", width: 150 },
                        { field: "end", title: "End Time", format: "{0:G}", width: 150 }
                    ],
                    listWidth: 700,
                    height: 540,
                    editable: false,
                    showWorkHours: false,
                    showWorkDays: false,
                    dataBound: function(e)
                    {
                        var chart = this;
                        uiSvc.dataBoundKendoGantt(chart, _this.functions.drill);
                    }
                };
        };
        //</editor-fold>
        $scope.$on("instamed-balancing-changed", function()
        {
            // build the screen when we have been told we have data from the parent
            _this.functions.init();
        });

        _this.functions.init();
    }]);

});
