/*
 /// <summary>
 /// modules.boomi.directives - boomAtomCount
 /// Directive to Manage Counts Displayed in the Footer during BOOMI Atom Reporting
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */

define(['modules/boomi/module'], function(module){
    "use strict";

    module.registerDirective('boomiAtomCount', ['boomiDataSvc', function(boomiDataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/boomi/directives/boomiAtomCount.tpl.html',
        scope:{},
        bindToController:{
            data:"="
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            var _this = this;
            _this.palette = boomiDataSvc.getColorPalette();
            $scope.$watch("data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            }, true);
        }
    }
  }]);

});


