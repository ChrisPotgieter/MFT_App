define(['modules/layout/module', 'lodash'], function (module, lodash) {

    'use strict';

    module.registerDirective('mqaBigBreadcrumbs', ['$rootScope','$state', function ($rootScope, $state) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div><h2 class="page-title txt-color-blueDark truncate"></h2></div>',
            link: function (scope, element)
            {
                let _this = {};
                _this.model = {lastState:null};

                //<editor-fold desc="Functions">
                _this.functions = {};
                _this.functions.fetchBreadcrumbs = function (stateName, breadcrumbs)
                {
                    // routine to return array of breadcrumbs for that current state that is appended to the given array
                    let state = $state.get(stateName);

                    if (state && state.data && state.data.title && breadcrumbs.indexOf(state.data.title) == -1)
                    {
                        _this.model.lastState = state.data;
                        breadcrumbs.unshift(state.data.title)
                    }

                    let parentName = stateName.replace(/.?\w+$/, '');
                    if (parentName)
                    {
                        return _this.functions.fetchBreadcrumbs(parentName, breadcrumbs);
                    } else
                    {
                        if (_this.model.lastState && _this.model.lastState.module)
                            breadcrumbs[0] = _this.model.lastState.module;
                        return breadcrumbs;
                    }
                };

                _this.functions.getBreadCrumbs = function()
                {
                    // routine to get the bread crumbs for the current state in a recursive way by travelling up the state tree
                    let state = $state.current;
                    let breadcrumbs;
                    if (state.data && state.data.breadcrumbs)
                    {
                        breadcrumbs = state.data.breadcrumbs;
                    }
                    else
                    {
                        breadcrumbs = _this.functions.fetchBreadcrumbs(state.name, []);
                    }

                    let returnObject = {items: breadcrumbs};
                    if (state.data && state.data.titleIcon)
                        returnObject.icon = state.data.titleIcon;
                    return returnObject;
                };


                _this.functions.update = function()
                {
                    // routine to update the title based on the current breadcrumbs
                    let breadCrumbs = _this.functions.getBreadCrumbs();

                    let first = lodash.first(breadCrumbs.items);
                    let icon = breadCrumbs.icon || 'home';

                    // draw the html
                    element.find('h2').html('<i class="fa-fw fa fa-' + icon + '"></i> ' + first);
                    lodash.drop(breadCrumbs.items).forEach(function (item)
                    {
                        element.find('h2').append(' <span>> ' + item + '</span>')
                    })
                };
                _this.functions.initialize = function()
                {
                    // add a state watcher
                    $rootScope.$on('$stateChangeSuccess', function (event, state)
                    {
                        _this.functions.update();
                    });

                    // set the initial state
                    _this.functions.update();


                }

                //</editor-fold>

                _this.functions.initialize();
            }
        }
    }]);
});
