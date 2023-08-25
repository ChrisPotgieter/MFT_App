/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - aegfDashboardCount.js
 /// Directive to Manage Count Display for the Automated Employer Group Files Sub-System
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/06/2023
 /// </summary>
 */

define(['modules/custom/spe_cno/module'], function(module){
    "use strict";

    module.registerDirective('aegfDashboardCount', ['speCNODataSvc', function(dataSvc)
    {
    return {
        restrict: 'E',
        templateUrl: 'app/modules/custom/spe_cno/directives/aegfDashboardCount.tpl.html',
        scope:{},
        bindToController: {
            data:"=",
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            let _this = this;
            _this.palette = dataSvc.aegf.functions.getColorPalette();
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


