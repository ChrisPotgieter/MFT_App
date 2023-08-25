
/*
 /// <summary>
 /// modules.common.directives.ui - mqaUserMenuOption.js
 /// Directive to Manage User Menu Options based on their Settings
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/01/2018
 */

define(['modules/common/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('mqaUserMenuOption', ['$rootScope', '$timeout', '$log', '$state', 'cacheDataSvc', 'userSvc', function($rootScope, $timeout, $log, $state, cacheDataSvc, userSvc){
    return {
        restrict: 'EA',
        templateUrl: 'app/modules/common/directives/ui/mqaUserMenuOption.tpl.html',
        scope:{},
        replace: true,
        bindToController:{
            caption:'@',
            icon:'@',
            baseState:'@'

        },
        controllerAs:'vm',
        controller: function ($element, $scope)
        {
            var _this = this;

            // first thing lets get the state requested state
            _this.data = {};
            var findState = _this.baseState;
            if (findState.startsWith("."))
            {

                // get the base module
                let moduleList = cacheDataSvc.getBaseModules();
                let modules = userSvc.getUserModules(moduleList);
                let moduleRoute = userSvc.setModuleRoute($state.current, modules);

                if (moduleRoute)
                    findState = moduleRoute + findState;
            }
            _this.reqState = $state.get(findState);
            if (_this.reqState == null)
            {
                $log.error("Unable to determine base state information for state ", _this.baseState);
                return;
            }

            // now set the settings information for that state
            if (!_this.reqState.data.settings)
            {
                $log.error("Unable to get settings information for state ", _this.baseState);
                return;
            }

            if (!_this.reqState.data.settings.reloadState)
            {
                $log.error("Unable to determine reload state information for state ", _this.baseState);
                return;
            }

            _this.buildMenu = function(parms, userSettings)
            {
                // routine to build the menu option for the given parameters
                var settings = lodash.filter(userSettings, {area: parms.filterType, settingType: _this.reqState.data.settings.type});
                if (settings.length > 0)
                {
                    var menu = {caption: parms.caption, icon: parms.icon, items: lodash.map(settings, function(setting)
                    {
                        return {caption: setting.description, notes: lodash.join(setting.notes, '\n'), icon: _this.icon, url: findState, args: {settingId: setting.id}, opts: {notify: true, reload: _this.reloadState.name}};
                    })};
                    _this.data.menus.push(menu);
                }

            };
            _this.buildMenuOption = function ()
            {
                // routine to build the menu option based on current user settings
                var settings = lodash.filter(userSvc.getProfile().settings, {code: _this.reqState.data.settings.code});

                // now get the default option
                _this.data.baseOption = {caption: _this.caption, url: findState, icon: _this.icon, args: {settingId: 0}, opts: {notify: true, reload: _this.reloadState.name}};
                _this.data.menus = [];

                // now check if we have any private options
                _this.buildMenu({icon:"fa-folder", caption:"Public", filterType: 20}, settings);
                _this.buildMenu({icon:"fa-lock", caption:"Private", filterType: 21}, settings);

            };

            // check if we can load now or later
            var findReloadState = _this.reqState.data.settings.reloadState;
            _this.load = function()
            {
                var moduleRoute = userSvc.getModuleRoute();
                if (moduleRoute)
                    findReloadState = moduleRoute + findReloadState;
                _this.reloadState = $state.get(findReloadState);
                if (_this.reloadState == null)
                {
                    $log.error("Unable to determine find reload state ", _this.reqState.data.settings.reloadState);
                    return;
                }
                _this.buildMenuOption();
            };

            // register a menu listener
            $scope.$on("usermenu-rebuild", function(evt)
            {
                _this.buildMenuOption();
            });

            if (findReloadState.startsWith("."))
            {
                var moduleRoute = userSvc.getModuleRoute();
                if (moduleRoute == undefined)
                {
                    // we don't have a module root yet so hold off for a few seconds
                    $timeout(function()
                    {
                        _this.load();
                    }, 500)

                }
                else
                {
                    _this.load();
                }
            }
            else
            {
                _this.reloadState = $state.get(findReloadState);
                _this.buildMenuOption();
            };
        }
    }
}]);

});

