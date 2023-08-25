/*
 /// <summary>
 /// app.modules.custom.mfthix - module.js
 /// Emblem Health MFT HIX Module Bootstrapper - All Views will be the MFT Views this is just the bootstapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 29/3/2016
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/auth/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqaauth', ['ui.router', 'ngResource', 'app.mqacommon']);

    couchPotato.configureApp(module);

    module.config(function ($stateProvider, $couchPotatoProvider) {
        $stateProvider.state('login', {
            url: '/login',
            views: {
                root: {
                    templateUrl: 'app/modules/auth/partials/login.tpl.html',
                    controllerAs: 'vm',
                    controller: 'loginCtrl',
                    resolve: {
                        deps: $couchPotatoProvider.resolveDependencies([
                            'modules/auth/controllers/loginCtrl'
                        ]),
                        cacheDataSvc: 'cacheDataSvc',
                        cachePromise: function (cacheDataSvc) {
                            return cacheDataSvc.initializeLists(true);
                        }
                    }
                }
            },
            data: {
                title: 'Sign-In',
                htmlId: 'lock-page',
                requiresAuth: false
            }
        })
            .state('lock', {
                url: '/lock',
                views: {
                    root: {
                        templateUrl: 'app/modules/auth/partials/lock.tpl.html',
                        controllerAs: 'vm',
                        controller: 'lockCtrl',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/auth/controllers/lockCtrl'
                            ]),
                            cacheDataSvc: 'cacheDataSvc',
                            cachePromise: function (cacheDataSvc) {
                                return cacheDataSvc.initializeLists(true);
                            }
                        }
                    }
                },
                data: {
                    title: 'Locked Screen',
                    htmlId: 'lock-page',
                    requiresAuth: false
                }
            })

            .state('unauthorized',
                {
                url: '/unauthorized',
                views: {
                    root:
                        {
                            templateUrl: 'app/modules/auth/partials/unauthorized.tpl.html'
                        }
                },
                data:{
                    title: 'Un-Authorized', module:"Security", htmId:'lock-page'
                }
            })
    });

    module.run(function ($couchPotato) {
        module.lazy = $couchPotato;
    });
    return module;
});