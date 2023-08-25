/*
 /// <summary>
 /// modules.common.directives.input - mqaTag.js
 /// ui-select Tag Input Directive
 /// This directive simplifies tag Select inputs without having to specify the inner HTML
 /// Hopefully if one-day they fix the ui-select directive (or we write our own) to not have the dependencies
 /// This will be eventually replaced by a custom MQA angular directive as the existing angular-ui-select has stupid limitations (must contain a select-choices with repeat even if you dont have choices)

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/18/2015
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaTag', ['$templateCache', function($templateCache){
    return {
        restrict: 'A',
        scope: true,
        compile: function(element)
        {
            var template = $templateCache.get("uiSelect-mqaTag.tpl.html");
            element.html(template);
          return {
            pre: function preLink($scope, element, attributes)
            {
                $scope.items = [];
                $scope.placeHolder = attributes["inputPlaceholder"] + "...";
                element.first().css("width", "100%");
                element.first().addClass("select2");
            }
          }
        }
    }
  }]);

});


