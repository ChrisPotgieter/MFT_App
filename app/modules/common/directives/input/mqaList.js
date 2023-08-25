/*
 /// <summary>
 /// modules.common.directives.input - mqaList.js
 /// ui-select Tag Input Directive
 /// This directive simplifies Different List Select inputs without having to specify the inner HTML

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/18/2015
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaList', ['$http', '$parse', '$templateCache','cacheDataSvc', function($http, $parse, $templateCache, cacheDataSvc){
    return {
        restrict: 'A',
        scope: true,
        compile: function(element, attributes)
        {
          // based on the element type get the inner html
          var template = "";
          if (element.is("ui-select"))
              template = $templateCache.get("uiSelect-mqaList.tpl.html");
          if (element.is("select"))
            template = $templateCache.get("select-inner-list.tpl.html");
          element.html(template);
          return {
            pre: function preLink($scope, element, attributes)
            {
                if (attributes["mqaCompanyId"])
                    $scope.listData = cacheDataSvc.getListForType(attributes["mqaListSource"], attributes["mqaList"], parseInt(attributes["mqaCompanyId"]));
                else
                    $scope.listData = cacheDataSvc.getListForType(attributes["mqaListSource"], attributes["mqaList"]);

                // now set the custom attributes based on the template
              if (element.hasClass("ui-select-container"))
              {
                $scope.placeHolder = attributes["inputPlaceholder"] + "...";
                element.first().css("width", "100%");
                element.first().addClass("select2");
              }
            }
          }
        }
    }
  }]);

});


