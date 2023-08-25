/*
 /// <summary>
 /// modules.mft_v2.directives - mftTransactionCount
 /// Directive to Manage Counts Displayed in the Footer during MFT Reporting
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 29/05/2020
 /// </summary>
 */

define(['modules/mft_v2/module'], function(module){
    "use strict";

    module.registerDirective('mftTransactionCount', ['mftv2DataSvc', function(mftv2DataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/mft_v2/directives/mftTransactionCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            var _this = this;
            _this.palette = mftv2DataSvc.getColorPalette();
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


