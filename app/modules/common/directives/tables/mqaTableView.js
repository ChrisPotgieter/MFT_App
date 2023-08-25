/*
 /// <summary>
 /// modules.common.directives.tree - mqaTableView.js
 /// Standard Table Display Directive to display Striped Tables that are searchable
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 7/18/2015
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    'use strict';

    module.registerDirective('mqaTableView', function () {
        return {
            restrict: 'E',
            scope: {
                itemTemplateName: '@',
                headers: '=',
                rows: '=',
                footers:'=',
                ondrill:'&'
            },
            templateUrl: "app/modules/common/directives/tables/mqaTableView.tpl.html",
            link: function ($scope, element, attributes)
            {
                $scope.drillRecord = function(record)
                {
                    // routine to handle the drilling on the grid row
                    if ($scope.ondrill)
                        $scope.ondrill()(record);
                };

                var updateData = function()
                {
                    $scope.data = $scope.rows;
                };
                $scope.$watchCollection("rows", function()
                {
                    updateData();
                });
                updateData();
            }
        }
    });
});


