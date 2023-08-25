

/*
 /// <summary>
 /// modules.common.directives - mqaTableCounts
 /// Directive to display the Counts for the given property of a given dataset in a table format that is searchable

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 7/18/2015
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaTableCounts', function(){
    return {
        restrict: 'E',
        scope:
        {
            data:'=',
            fieldname: '@',
            headers: '=',
            title: '@',
            widgetId:'@'
        },
        templateUrl: "app/modules/common/directives/tables/mqaTableCounts.tpl.html",
        link: function ($scope, element, attributes)
        {
            var updateData = function()
            {
                $scope.rows = lodash.chain($scope.data).filter($scope.fieldname).countBy($scope.fieldname).map(function(value, key){
                    return {name: key, value: value};
                }).value();
                var sum = lodash.sum($scope.rows, "value");
                $scope.footers = ["Total:", sum];
            };
            $scope.$watchCollection("data", function()
            {
                updateData();
            });
            updateData();
        }
    }
  });

});


