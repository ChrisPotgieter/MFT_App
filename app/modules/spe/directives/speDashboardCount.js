/*
 /// <summary>
 /// modules.spe.directives - speDashboardCount
 /// Directive to Manage Counts for the Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/01/2022
 /// </summary>
 */

define(['modules/spe/module'], function(module){
    "use strict";

    module.registerDirective('speDashboardCount', ['speDataSvc', function(speDataSvc)  {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/spe/directives/speDashboardCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            id:'@',
            onDrill:'&?'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

           var _this = this;
           _this.palette = speDataSvc.getColorPalette();
            $scope.$watch("data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            });

            _this.functions = {};
            _this.functions.onDrill = function(data)
            {
                // routine to manage the drilling of any badge in the list of counts - send it to the caller
                // right now this only hooked to the error badge
                if (_this.onDrill != null)
                {
                    _this.onDrill()(data);
                }
            }
        }
    }
  }]);

});


