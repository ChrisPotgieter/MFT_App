/*
 /// <summary>
 /// modules.common.directives.input - mqaProgressDialog.js
 /// General UI Directive to a progress Panel and Progress Status in a dialog window
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03 April 2017
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaProgressDialog', ['$filter', function($filter){
    return {
        restrict: 'EA',
        templateUrl: 'app/modules/common/directives/ui/mqaProgressDialog.tpl.html',
        scope: {
            data:"=",
            titleData:'=',
            onOk:'&',
            onCancel:'&'
        },
        link: function ($scope, element)
        {
            $scope.progressInfo = $scope.data;
            $scope.$watch("data", function(newValue, oldValue)
            {

                // update the grid the moment the data changes - no need for observable array
                if (newValue != oldValue || !$scope.watched)
                {
                    $scope.progressInfo = newValue;
                    $scope.watched = true;
                }
            }, true);

            $scope.closeCancel = function()
            {
                $scope.onCancel()();
            };
            $scope.closeOK = function ()
            {
                $scope.onOk()();
            };
        }
    }
  }]);

});


