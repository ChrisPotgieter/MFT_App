/*
 /// <summary>
 /// modules.common.directives - mqaEasyPie
 /// Directive to display and Easy Pie Chart in a similar style to the Smart Admin except we use angular-easypie

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/03/2017
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function(module, lodash) {

  module.registerDirective('mqaEasyPie', ['chartSvc', function(chartSvc){
    return {
        restrict: 'AE',
        scope:
        {
            data: '=',
            options: '=?'
        },
        templateUrl: "app/modules/common/directives/graphs/mqaEasyPie.tpl.html",
        compile: function(element)
        {
            // do this as a pre-line because the easy-pie directive does not have a watch on its options to redraw itself
            return{
                pre: function preLink($scope, element, attributes)
                {
                    var $element = $(element);
                    var barColor = $element.css('color') || $element.data('pie-color');
                    var trackColor = $element.data('pie-track-color') || 'rgba(0,0,0,0.04)';
                    var size = parseInt($element.data('pie-size')) || 25;

                    // create the options
                    if (!$scope.options)
                        $scope.options = {animate:{duration: 1500, enabled: true}, scaleColor: false, lineCap:'lineCap', rotate: -90};
                    $scope.options.barColor = barColor;
                    $scope.options.size = size;
                    $scope.options.lineSize = parseInt($scope.options.size / 8.5);
                    $scope.options.trackColor =  trackColor;
                }
            }
        }
    }
  }]);

});


