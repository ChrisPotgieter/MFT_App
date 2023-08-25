/*
 /// <summary>
 /// app.modules.custom.spe_cno.directive - cnoTpciDashboardCount.js
 /// Directive to Manage Counts Displayed in the CNO Third Party Commission Intake
 /// Works for both Enrollments and Commissions based on State
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/05/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function(module){
    "use strict";

    module.registerDirective('cnoTpciDashboardCount', ['speCNODataSvc', function(dataSvc)
    {
    return {
        restrict: 'E',
        templateUrl: 'app/modules/custom/spe_cno/directives/cnoTpciDashboardCount.tpl.html',
        scope:{},
        bindToController: {
            data:"=",
            module:'@',
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            var _this = this;
            _this.palette = dataSvc.getTPCIDashboardColorPalette(_this.module);
            $scope.$watch("vmCount.data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            }, true);
            _this.functions = {};
            _this.functions.onDrill = function(data)
            {
                // routine to manage the drilling of any badge in the list of counts - send it to the caller
                if (_this.onDrill != null)
                {
                    _this.onDrill()(data);
                }
            }

        }
    }
  }]);

});


