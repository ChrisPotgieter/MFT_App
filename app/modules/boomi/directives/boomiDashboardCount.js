/*
 /// <summary>
 /// modules.boomi.directives - boomiDashboardCount
 /// Directive to Manage Counts for the BOOMI Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */

define(['modules/boomi/module'], function(module){
    "use strict";

    module.registerDirective('boomiDashboardCount', ['boomiDataSvc', function(boomiDataSvc)  {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/boomi/directives/boomiDashboardCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            id:'@',
            onDrill:'&',
            viewType:'@?', // 0 = all, 1 = trf,errors,files,bytes, 2 = monitors, agent count, schedules

        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

           var _this = this;
           _this.palette = boomiDataSvc.getColorPalette();
            if (_this.viewType)
                _this.viewType = parseInt(_this.viewType);
            else
                _this.viewType = 0;

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


