/*
 /// <summary>
 /// app.modules.modules.directives - mqaPageTitle
 /// Custom MQA Page Title Directive
 /// This is a customized version of the Smart-Admin Page Title Directive that is customized for MQA Use
 /// This directive is implemented on the base index.html so its available on every single page in the entire app
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 24/08/2017
 /// </summary>
 */

define(['layout/module', 'lodash'], function (module, lodash) {

    'use strict';

    module.registerDirective('mqaPageTitle', ['$rootScope', '$timeout', '$state', 'userSvc', 'socketIOSvc', 'uiSvc', 'cacheDataSvc', function ($rootScope, $timeout, $state, userSvc, socketIOSvc, uiSvc, cacheDataSvc)
    {
        return {
            restrict: 'A',
            compile: function (element, attributes)
            {
                let _this = {};
                _this.model = {productTitle: null};
                _this.functions = {};

                //<editor-fold desc="Functions">
                _this.functions.setProductTitle = function()
                {
                    // routine to set the product title
                    let environment = cacheDataSvc.getProductEnvironment();
                    let productInfo = uiSvc.getProductInfo(environment);
                    _this.model.productTitle = productInfo.name + "-" + productInfo.environment;
                };

                _this.functions.isTokenValid = function(toState, toParams)
                {
                    // routine to validate that the state requires auth or not
                    if (toState.data && toState.data.requiresAuth != undefined && toState.data.requiresAuth == false)
                        return true;
                    let valid = userSvc.isTokenValid(toState, toParams);
                    if (valid < 1)
                    {
                        // we need to redirect so persist the route
                        userSvc.persistRoute(toState, toParams);
                        return valid;
                    }

                    // check security
                    let security = _this.functions.fetchSecurity(toState.name, []);
                    if (security.length === 0)
                        return valid;

                    // this is a secure route - check the security
                    valid = 1;
                    lodash.forEach(security, function(feature)
                    {
                       let value = userSvc.hasFeature(feature);
                       if (!value)
                       {
                           valid = -2;
                           return false;
                       }
                    });
                    return valid;
                };

                _this.functions.fetchSecurity = function(stateName, security)
                {
                    // routine to return a list of security codes for the given state (this is recursive in nature)
                    let state = $state.get(stateName);

                    // add to the security
                    if (state && state.data && state.data.security)
                    {
                        lodash.forEach(state.data.security, function(feature)
                        {
                            if (security.indexOf(feature) == -1)
                                security.unshift(feature)
                        });
                    }

                    // check the parent state
                    let parentName = stateName.replace(/.?\w+$/, '');
                    if (parentName)
                    {
                        return _this.functions.fetchSecurity(parentName, security);
                    } else
                    {
                        return security
                    }
                };

                _this.functions.routeUser = function(flag)
                {
                    // routine to route the user based on the given flag
                    // check the validity of the token on a state change and route the user
                    // authentication is required for the route - apply the rules
                    // check if the token is valid
                    // 1 - token is valid
                    // 0 - no token
                    // -1 - token but it is invalid
                    // -2 - security feature prevents this route

                    if (flag === 0)
                    {
                        $state.go("login");
                    }
                    if (flag === -1)
                    {
                        // logout of the socket-io
                        socketIOSvc.logout(function()
                        {
                            socketIOSvc.disconnect();

                            // go to the lock screen
                            $state.go("lock");
                        });
                    }
                    if (flag == -2)
                    {
                        // logout of the socket-io
                        socketIOSvc.logout(function()
                        {
                            socketIOSvc.disconnect();
                            $state.go("unauthorized");
                        });

                    };

                };

               _this.functions.onStateChange = function(event, toState, toParams)
                {
                    // routine to be invoked on a state change to cause the page title to change or user routing to occur
                    let flag = _this.functions.isTokenValid(toState, toParams);
                    if (flag < 1)
                    {
                        event.preventDefault();
                        _this.functions.routeUser(flag);
                        return;
                    }

                    // determine the title
                    if (_this.model.productTitle === null)
                        _this.functions.setProductTitle();
                    let title = _this.model.productTitle;

                    if (toState.data && toState.data.title) title = toState.data.title + ' | ' + title;

                    // Set asynchronously so page changes before title does
                    $timeout(function()
                    {
                        $('html head title').text(title);
                    });
                };

                _this.functions.initialize = function()
                {
                    // routine to initialize
                    element.removeAttr('mqa-page-title data-mqa-page-title');
                    $rootScope.$on('$stateChangeStart', _this.functions.onStateChange);
                };
                //</editor-fold>

                _this.functions.initialize();
            }
        }
    }]);
});
