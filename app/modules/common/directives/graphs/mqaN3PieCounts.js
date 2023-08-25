/*
 /// <summary>
 /// modules.common.directives - mqaN3PieCounts
 /// Directive to display the Counts for the given property of a given dataset in a N3-Pie Format

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/8/2015
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaN3PieCounts', ['uiSvc', function(){
    return {
        restrict: 'E',
        scope:
        {
            data:'=',
            fieldname: '@',
            palette:'='
        },
        template: '<pie-chart data="chartData" options="chartOptions" class="col-lg-12 col-sm-12 col-md-12" />',

        link: function ($scope, element, attributes)
        {
            var updateData = function()
            {
                $scope.rows = lodash.chain($scope.data).filter($scope.fieldname).countBy($scope.fieldname).map(function(value, key){
                    return {name: key, value: value};
                }).value();

                // build up the data object
                $scope.chartData = [];
                var paletteFactor = 1;
                var paletteIndex = -1;
                lodash.forEach($scope.rows, function(row)
                {
                    // round
                    paletteIndex++;
                    if (paletteIndex > $scope.palette.length)
                    {
                        paletteFactor += 0.5;
                        paletteIndex = 0;
                    }
                    $scope.chartData.push({label : row.name, value: row.value, color: uiSvc.shadeBlend(paletteFactor, palette[paletteIndex])});
                });
            ''
            };
            $scope.$watchCollection("data", function()
            {
                updateData();
            });
            updateData();
        }
    }
  }]);

});


