/*
 /// <summary>
 /// modules.common.directives.ui - mqaDashboardCount.js
 /// Directive to Manage a Count Widget for a Dashboard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/01/2020
 */

define(['modules/common/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('mqaDashboardCount', ['$timeout', 'uiSvc', function($timeout, uiSvc)
    {
        return {
            restrict: 'EA',
            templateUrl: 'app/modules/common/directives/ui/mqaDashboardCount.tpl.html',
            scope:{},
            replace: true,
            bindToController:{
                divClass:'@',
                captionClass:'@',
                caption:'@',
                value:'=',
                icon:'@',
                id:'@?',
                tooltip:'@?',
                onClick:'&?'

            },
            controllerAs:'vmDash',
            controller: function ($scope, $element)
            {
                var _this = this;

                _this.functions = {};
                _this.functions.onClick = function()
                {
                    if (_this.onClick)
                    {
                        _this.onClick()({value: _this.value, caption: _this.caption});
                    }
                };
                _this.functions.parse = function(newValue)
                {
                    // check if we were passed an array
                    _this.stats = [];
                    if (Array.isArray(newValue))
                    {
                        // array of values and captions
                        newValue = lodash.map(newValue, function(row)
                        {
                            if (!row.captionClass)
                                row.captionClass = _this.captionClass;
                            return row;
                        });
                        _this.stats = newValue;
                    }
                    else
                    {
                        _this.stats = [{captionClass: _this.captionClass, caption: _this.caption, value: newValue}];
                    }
                };

                if (Array.isArray(_this.value))
                {
                    $scope.$watchCollection("vmDash.value", function(newValue, oldValue)
                    {
                        if (newValue != oldValue)
                            _this.functions.parse(newValue);
                    }, true)
                }
                else
                {
                    $scope.$watch("vmDash.value", function (newValue, oldValue) {
                        if (newValue != oldValue)
                            _this.functions.parse(newValue);
                    });
                }

                $scope.$watch("vmDash.tooltip", function (newValue, oldValue)
                {
                    if (newValue != oldValue)
                        _this.tooltip = newValue;
                });

                _this.functions.parse(_this.value);

                // add the tooltip
                if (_this.tooltip != null)
                {
                    $timeout(function()
                    {
                        uiSvc.addKendoTooltip($element);
                    }, 200);
                }
            }
        }
    }]);

});
