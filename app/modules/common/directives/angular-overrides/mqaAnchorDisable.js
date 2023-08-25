/*
 /// <summary>
 /// app.modules.common.directives.angular-overrides - mqaAnchorDisable.js
 /// Directive to Enable or Disable an Anchor Tag
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: Jan/28/2017
 /// </summary>
 */



define(['modules/common/module'], function(module){
  "use strict";

  module.registerDirective('mqaAnchorDisable', ['$compile', function($compile)
  {
    return{
      compile: function(tElement, tAttrs, transclude)
      {
        //Disable ngClick
        tAttrs["ngClick"] = "!("+tAttrs["mqaAnchorDisable"]+") && ("+tAttrs["ngClick"]+")";

        //Toggle "disabled" to class when aDisabled becomes true
        return function (scope, iElement, iAttrs)
        {
          scope.$watch(iAttrs["mqaAnchorDisable"], function(newValue) {
            if (newValue !== undefined) {
              iElement.toggleClass("disabled", newValue);
            }
          });

          //Disable href on click
          iElement.on("click", function(e) {
            if (scope.$eval(iAttrs["mqaAnchorDisable"])) {
              e.preventDefault();
            }
          });
        };
      }
    };
  }]);

});


