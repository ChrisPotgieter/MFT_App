/*
 /// <summary>
 /// modules.boomi.directives - boomiTransactionCount
 /// Directive to Manage Counts Displayed in the Header during Boomi Reporting
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/10/2022
 /// </summary>
 */

define(['modules/boomi/module'], function(module){
    "use strict";

    module.registerDirective('boomiTransactionCount', ['boomiDataSvc', function(dataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/boomi/directives/boomiTransactionCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            var _this = this;
            _this.palette = dataSvc.getColorPalette();
            $scope.$watch("data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            }, true);
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


