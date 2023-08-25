/*
 /// <summary>
 /// modules.mft_v2.directives - mftMonitorCount
 /// Directive to Manage Counts Displayed during MFT Monitor Reporting
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/10/2020
 /// </summary>
 */

define(['modules/mft_v2/module'], function(module){
    "use strict";

    module.registerDirective('mftMonitorCount', ['mftv2DataSvc', function(mftv2DataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/mft_v2/directives/mftMonitorCount.tpl.html',
        scope:{},
        bindToController:{
            data:"="
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
        }
    }
  }]);

});


