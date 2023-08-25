
/*
 /// <summary>
 /// modules.common.directives.ui - mqaTransactionHeader.js
 /// Common Directive to show Transaction Header for All Transactions
 /// This will provide consistency for all transactions -
 /// TODO: This is not in use yet, but in a future version it will be and replace the dependancy on $scope.data.baseTransaction
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/07/2023
 /// </summary>
 */

define([ 'modules/common/module'], function (module)
{
    'use strict';
    module.registerDirective('mqaTransactionHeader', [function()
    {
        return  {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/modules/common/directives/ui/mqaTransactionHeader.tpl.html',
            scope:{},
            bindToController: {
                data:"=",
                options:'=?',
                functionManager:'=?'
            },
            controllerAs:'vmTransHeader',
            controller: function ($scope)
            {
                let _this = this;
                _this.model = {};
                _this.functions = {};

                // add the watch
                $scope.$watch("vmTransHeader.data", function(newValue, oldValue)
                {
                    // initialize the content type
                    if (oldValue == newValue)
                        return;
                    _this.model.data = newValue;
                });

                _this.functions.initializeWidget = function()
                {
                    // routine to initialize the widget
                    if (_this.data)
                        _this.model.data = _this.data;

                };
                _this.functions.initializeWidget();


            }
        }
    }]);

});


