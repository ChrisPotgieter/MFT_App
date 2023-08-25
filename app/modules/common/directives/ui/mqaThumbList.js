/*
 /// <summary>
 /// modules.common.directives.input - mqaThumbList.js
 /// General UI Directive to display a set provided data elements as a set of thumbnails
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date:
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaThumbList', ['$filter','$state','uiSvc',  'transactionReportingSvc', function($filter){
    return {
        restrict: 'EA',
        templateUrl: 'app/modules/common/directives/ui/mqaThumbList.tpl.html',
        scope: {
            data:"=",
            eventText:'@',
            header:'@',
            onSelect:'&',
            defaultImage:'@',
            altImage:'@?',
            btnClass:'=?',
            imgSize:'=?'
        },
        link: function ($scope, element)
        {
            if (!$scope.altImage)
                $scope.altImage = "Image";

            $scope.redraw = function()
            {
                // work out the new row count based on the number of elements in the array
                if (!$scope.data)
                    $scope.rows = 0;
                else
                    $scope.rows = $filter("array")($scope.data.length/6);
            };

            $scope.onClick = function(dataItem)
            {
                if ($scope.onSelect)
                {
                    $scope.onSelect()(dataItem);
                }
            };
            $scope.$watchCollection("data", function(newValue, oldValue)
            {
                // update the grid the moment the data changes - no need for observable array
                if (newValue != oldValue || !$scope.watched)
                {
                    $scope.watched = true;
                    $scope.redraw();
                }
            }, true);

            $scope.redraw();
        }
    }
  }]);

});


