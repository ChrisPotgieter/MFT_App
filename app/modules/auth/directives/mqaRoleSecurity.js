/*
 /// <summary>
 /// modules.auth.directives - mqaRoleSecurity.js
 /// General Authentication Directive to a show/hide or enable/disable elements based on the current users roles
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 30 August 2017
 /// </summary>
 */

define(['modules/auth/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('mqaRoleSecurity', ['userSvc', function(userSvc)
    {
        return {
            restrict: 'A',
            link: function ($scope, element, attributes)
            {
                let _this = {};
                _this.functions = {};
                _this.functions.checkVisibility = function(features)
                {
                    // routine to check the given features against the user profile and see if the element needs to be hidden/disabled
                    let isInvalid = true;
                    if (features === undefined || features === null || features.length === 0)
                    {
                        isInvalid = true;
                    }
                    else
                    {
                        lodash.forEach(features, function(feature)
                        {
                            let featureName = feature;
                            let featureValue = userSvc.commonFeatures[feature];
                            if (featureValue)
                                featureName = featureValue;
                            let value = userSvc.hasFeature(featureName);
                            if (value)
                            {
                                isInvalid = false;
                                return false;
                            }
                        })
                    }
                    if (isInvalid)
                    {
                        // check if I need to modify the visibility or the enablement
                        if (attributes.roleDisabled)
                            $(element).prop("disabled", true);
                        else
                            element.hide();
                    }
                };

                $scope.$watch(attributes.mqaRoleSecurity, function (features)
                {
                    _this.functions.checkVisibility(features);
                });
            }

        }
    }]);

});


