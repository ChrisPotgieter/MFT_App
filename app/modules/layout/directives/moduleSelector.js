/*
 /// <summary>
 /// app.modules.layout.directives - moduleSelector.js
 /// AngularJS directive to display Module List and allow the user to switch modules
 /// Adapted from the SmartAdmin Template - Project
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/27/2014
 /// </summary>
 */
define(['modules/layout/module'], function (module) {
    module.registerDirective('moduleSelector', ['$rootScope', '$state', 'cacheDataSvc', 'userSvc',
        function ($rootScope, $state, cacheDataSvc, userSvc)
        {
            return {
                restrict: "EA",
                replace: true,
                templateUrl: "app/modules/layout/directives/module-selector.tpl.html",
                scope:{},
                controllerAs:'vm',
                controller: function ($element, $scope)
                {
                    let _this = this;
                    _this.functions = {};

                    //<editor-fold desc="Functions">
                    _this.functions.initialize = function()
                    {

                        // routine to initialize the directive
                        _this.model = {current: null};

                        let moduleList = cacheDataSvc.getBaseModules();
                        _this.model.modules = userSvc.getUserModules(moduleList);

                        $rootScope.$on('$stateChangeStart', function (event, state) {
                            _this.functions.processState(state);
                        });

                        _this.functions.processState($state.current);
                    };

                    _this.functions.processState = function(state)
                    {
                        // routine to managed the change of route and set the variables
                        if (state && state.data && state.data.module)
                            _this.model.current = state.data.module;
                        else
                            _this.model.current = "Unknown";

                        // now try and get the base route variable
                        userSvc.setModuleRoute(state, _this.model.modules);
                    };
                    //</editor-fold>

                    _this.functions.initialize();

                }
            }
        }
    ]);

});


