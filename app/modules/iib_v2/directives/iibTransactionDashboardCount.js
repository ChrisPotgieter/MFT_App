
/*
 /// <summary>
 /// modules.iib_v2.directives - iibTransactionDashboardCount.js
 /// Directive to Manage Counts for the IIB Transaction Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 20/01/2020
 /// </summary>
 */

define(['modules/iib_v2/module'], function(module){
    "use strict";

    module.registerDirective('iibTransactionDashboardCount', ['iibv2DataSvc', function(iibv2DataSvc)
    {
    return {
        restrict: 'E',
        templateUrl: 'app/modules/iib_v2/directives//iibTransactionDashboardCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {
           var _this = this;
            $scope.$watch("data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            });
            _this.functions = {};
            _this.palette = iibv2DataSvc.getColorPalette();
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


