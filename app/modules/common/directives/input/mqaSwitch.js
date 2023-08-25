/*
 /// <summary>
 /// modules.common.directives.input - mqaSwitch.js
 /// Switch Directive
 ///

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 5/1/2017
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaSwitch', [function(){
    return {
        restrict: 'E',
        templateUrl: 'app/modules/common/directives/input/mqaSwitch.tpl.html',
        scope:{
            title:'@',
            label:'@',
            ngModel:'=',
            ngDisabled:'=?',
            onToggle:'&?'
        },
        link: function ($scope, element)
        {
            $scope.toggle = function()
            {
                if ($scope.onToggle)
                    $scope.onToggle()($scope.ngModel);
            }
        }
    }
  }]);

});


