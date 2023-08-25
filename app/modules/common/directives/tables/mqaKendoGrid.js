/*
 /// <summary>
 /// modules.common.directives.grid - mqaKendoGrid.js
 /// Generic Kendo Abstraction Directive - to display kendo Grid in a consistent way
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mehmood Bhyat
 /// Date: 08/02/2017
 /// </summary>
 */

define(['modules/common/module', 'lodash','jszip'], function (module, lodash,jszip) {
    window.JSZip = jszip;
    "use strict";

    module.registerDirective('mqaKendoGrid', ['$timeout', 'uiSvc' ,function ($timeout, uiSvc)
    {
        return {
            restrict: 'E',
            scope:
                {
                    options:'=',
                    data:'=',
                    ondrill:'&?',
                    refreshFlag:'=?',
                    identifier:'=?',
                    height:'@?',
                    functionManager:'=?',
                    rebuild:'=?',
                    title:'@?',
                    progressId:'@?'
                },
            templateUrl:"app/modules/common/directives/tables/mqaKendoGrid.tpl.html",

            link: function ($scope, element, attributes)
            {
                //<editor-fold desc="Functions">
                var functions = {};
                functions.persistGridState = function(model)
                {
                    // routine to persist the current grid state to the in-memory store
                    if ($scope.functionManager != null && $scope.functionManager.persistState != null)
                        $scope.functionManager.persistState(model, $scope.grid);
                };
                //</editor-fold>

                var watch;
                $scope.heightStyle = {};
                if ($scope.height && $scope.height > 0)
                    $scope.heightStyle = {"height":$scope.height + "px"};


                var setCheckBox = function()
                {
                    // routine to check if this grid is a checkbox select grid
                    if ($scope.functionManager == null || $scope.functionManager.selectId == null)
                        return;

                    // setup selection grid
                    $scope.selection = {allRows: false, rows:{}};
                    let selectDataId = $scope.functionManager.selectId();
                    $scope.gridOptions.columns.unshift(
                        {
                            field: "select",
                            title: "Select",
                            width: "60px",
                            filterable: false,
                            groupable: false,
                            sortable: false,
                            scrollable: true,
                            menu: false,
                            resizable: false,
                            reorderable: false,
                            sticky: true,
                            stickable: true,
                            headerTemplate: function()
                            {
                                return '<span>Select <input type="checkbox" name="headerCheck" ng-change="functionManager.selectAll();" ng-model="selection.allRows"></span>';
                            },
                            template: function(dataItem)
                            {
                                return '<input type="checkbox" name="selectCheckbox[]" ng-model="selection.rows[\'' + dataItem[selectDataId] + '\']">';
                            }
                        });

                        $scope.functionManager.selectAll = function() {
                            // routine to select all rows in the grid and add them to the selected rows
                            let selectDataId = $scope.functionManager.selectId();
                            let selected = $scope.selection.allRows;
                            if (!selected) {
                                $scope.selection.rows = {};
                                return;
                            }
                            $scope.selection.rows = {};
                            let grid = $scope.grid;
                            let gridData = grid.dataSource.data();
                            for (var i = 0; i < gridData.length; i++)
                            {
                                let model = gridData[i];
                                $scope.selection.rows[model[selectDataId]] = true;
                            }
                        };
                        $scope.functionManager.getSelected = function()
                        {
                            // remove the ones that are unselected
                            let rows = {};
                            lodash.forOwn($scope.selection.rows, function(value, key)
                            {
                                if (value)
                                    rows[key] = true;
                            });
                            return {allRows: $scope.selection.allRows, rows: rows};
                        };
                };

                var setOptions = function()
                {
                    if (!$scope.rebuild)
                        $scope.rebuild = {value: 0};
                    if ($scope.options)
                    {
                        $scope.optionsWatched = true;
                        $scope.gridOptions = $scope.options;
                        if ($scope.grid)
                            //$scope.grid.dataSource.data = $scope.data;
                        if (watch)
                            watch();
                    }
                    else
                    {
                        if (watch)
                            return;
                        watch = $scope.$watch("options", function(newValue, oldValue)
                        {
                            // update the grid options the moment the options changes - no need for observable array
                            if (!$scope.optionsWatched)
                            {
                                $scope.optionsWatched = true;
                                setOptions();
                            }
                        });

                    }

                    if ($scope.title)
                    {
                        if (!$scope.gridOptions.toolbar)
                            $scope.gridOptions.toolbar = [];
                        $scope.gridOptions.toolbar.unshift({name: "Title", text:"Title", template: kendo.template($("#templateTitle").html())})
                    }
                    // check for any grid customizations
                    if ($scope.functionManager != null && $scope.functionManager.initializeState != null)
                        $scope.functionManager.initializeState($scope.gridOptions);
                };

                var clearSelection = function()
                {
                    let length = $scope.grid.dataSource.data().length;
                    if (length == 0) {
                        $scope.grid.hideColumn(0);
                    }
                    else {
                        $scope.grid.showColumn(0);
                        $scope.selection.allRows = false;
                        $scope.selection.rows = {};
                    }
                };

                $scope.ngDrillRecord =   function(data, dataItem, columns)
                {
                    if (!$scope.ondrill)
                        return;
                    $scope.ondrill()(data, dataItem, columns);
                };

                $scope.$on("kendoWidgetCreated", function(event, widget)
                {
                    // when the widget gets created set the data or watch the data variable for changes
                    if ($scope.grid === widget)
                    {
                        if ($scope.identifier != null)
                            $scope.identifier = $scope.grid;

                        if ($scope.functionManager != null)
                        {
                            $scope.functionManager.grid = $scope.grid;

                            if ($scope.functionManager.gridCreate)
                                $scope.functionManager.gridCreate($scope.grid);
                        }



                        $scope.$watchCollection("data", function(newValue, oldValue)
                        {
                            // update the grid the moment the data changes - no need for observable array
                            if (newValue != oldValue || !$scope.watched )
                            {
                                let showProgress = true;
                                if (Array.isArray(newValue) && Array.isArray(oldValue) && newValue.length === 0 && oldValue.length === 0)
                                    showProgress = false;
                                let progressId = "grid";
                                if ($scope.progressId)
                                    progressId = $scope.progressId;
                                if (showProgress)
                                    uiSvc.displayKendoLoader("#" + progressId, true);
                                $timeout(function()
                                {
                                    try
                                    {
                                        $scope.watched = true;
                                        $scope.grid.dataSource.data(newValue);
                                        $scope.grid.dataSource.page(1);
                                        if ($scope.functionManager != null && $scope.functionManager.loadState != null)
                                        {
                                            $scope.functionManager.loadState($scope.grid);
                                        }
                                        if (!$scope.selection)
                                            return;

                                        clearSelection();
                                    }
                                    finally
                                    {
                                        if (showProgress)
                                            uiSvc.displayKendoLoader("#" + progressId, false);
                                    }
                                });

                            }
                        });
                    }
                });
                if (attributes.refreshFlag)
                    $scope.$watch('refreshFlag', function(newValue, oldValue){
                        if ($scope.grid)
                            $scope.grid.refresh();
                    }, true);

                 $scope.$watch('rebuild.value', function (newValue, oldValue) {
                    setOptions()
                 }, true);

                setOptions();

                setCheckBox();
            }
        }
    }]);

});
