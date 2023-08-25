/*
 /// <summary>
 /// modules.common.directives.input - mqaCombo.js
 /// ui-select Combo Input Directive
 /// This directive simplifies Combo Select inputs that are based from the MQA List Cache

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/03/2017
 /// </summary>
 */

define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaCombo', ['$templateCache', 'cacheDataSvc', function($templateCache, cacheDataSvc){
    return {
        restrict: 'A',
        scope: true,
        compile: function(element)
        {
            var template = $templateCache.get("uiSelect-mqaCombo.tpl.html");
            element.html(template);
          return {
            pre: function preLink($scope, element, attributes)
            {
                if (attributes["mqaCompanyId"])
                    $scope.listData = cacheDataSvc.getListForType(attributes["mqaListSource"], attributes["mqaCombo"], parseInt(attributes["mqaCompanyId"]));
                else
                    $scope.listData = cacheDataSvc.getListForType(attributes["mqaListSource"], attributes["mqaCombo"]);
                $scope.placeHolder = attributes["inputPlaceholder"] + "...";
                element.first().css("width", "100%");
                element.first().addClass("select2");

                $scope.clear = function($event, $select)
                {
                    //stops click event bubbling
                    $event.stopPropagation();
                    //to allow empty field, in order to force a selection remove the following line
                    $select.selected = undefined;
                    //reset search query
                    $select.search = undefined;
                }
            }
          }
        }
    }
  }]);

});


