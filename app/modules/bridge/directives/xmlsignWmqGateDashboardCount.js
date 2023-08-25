/*
 /// <summary>
 /// modules.bridge.directives - xmlsignWmqGateDashboardCount
 /// Directive to Manage Counts Displayed in the XML Sign WMQ Gateway Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/04/2022
 /// </summary>
 */

define(['modules/bridge/module'], function(module){
    "use strict";

    module.registerDirective('xmlsignWmqGateDashboardCount', ['bridgeDataSvc', function(bridgeDataSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/bridge/directives/xmlsignWmqGateDashboardCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            onDrill:'&'
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

            var _this = this;
            _this.palette = bridgeDataSvc.getXMLSignWMQGateColorPalette();
            $scope.$watch("vmCount.data", function(newValue)
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


