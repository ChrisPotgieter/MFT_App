/*
 /// <summary>
 /// modules.mft_v2.directives - mftAgentCount
 /// Directive to Manage Counts Displayed in the Footer during MFT Agent Reporting
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/10/2020
 /// </summary>
 */

define(['modules/mft_v2/module'], function(module){
    "use strict";

    module.registerDirective('mftAgentCount', ['mftv2DataSvc', function(mftv2DataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/mft_v2/directives/mftAgentCount.tpl.html',
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


