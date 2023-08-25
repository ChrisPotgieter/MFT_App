/*
 /// <summary>
 /// modules.spe.extensions.instamed.directives - speInstamedDashboardCount
  // SPE Instamed Extension
 /// Directive to Manage Counts for the Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 06/04/2020
 /// </summary>
 */

define(['modules/spe/module'], function(module){
    "use strict";

    module.registerDirective('speInstamedDashboardCount', ['speInstamedDataSvc', function(speInstamedDataSvc)  {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/spe/extensions/instamed/directives/speInstamedDashboardCount.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            id:'@',
        },
        controllerAs:'vmCount',
        controller: function ($scope)
        {

           var _this = this;
           _this.palette = speInstamedDataSvc.getColorPalette();
           _this.titles = {payments: "Total to " + speInstamedDataSvc.getProcTitles().partnerName};
            $scope.$watch("data", function(newValue)
            {
                if (newValue)
                    _this.data = newValue;
            });

        }
    }
  }]);

});


