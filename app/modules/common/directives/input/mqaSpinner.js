/*
 /// <summary>
 /// app.modules.common.directives.input - mqaSpinner.js
 /// Update to the smart-admin spinner directive to allow for angular-js model binding using parse
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/19/2015
 /// </summary>
 */
define(['modules/common/module', 'jquery-ui'], function (module) {

    'use strict';

    return module.registerDirective('mqaSpinner', function ($parse) {
        return {
            restrict: 'A',
            compile: function (tElement, tAttributes)
            {
                tElement.removeAttr('mqa-spinner');

                var options = {};
                if(tAttributes.smartSpinner == 'decimal'){
                    options = {
                        step: 0.01,
                        numberFormat: "n"
                    };
                }else if(tAttributes.smartSpinner == 'currency'){
                    options = {
                        min: 5,
                        max: 2500,
                        step: 25,
                        start: 1000,
                        numberFormat: "C"
                    };
                }
                return {

                    pre: function preLink($scope, tElement, tAttributes)
                    {
                        var ngModel = $parse(tAttributes.ngModel);
                        options.spin = function(event, ui)
                        {
                            setTimeout(function()
                            {
                                $scope.$apply(function($scope){
                                    ngModel.assign($scope, ui.value);
                                })

                            }, 0);
                        }
                        tElement.spinner(options);
                    }
                }

        }
    }
    });
});
