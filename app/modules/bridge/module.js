/*
 /// <summary>
 /// app.modules.bridge - module.js
 /// Bridge Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/04/2022
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/bridge/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqabridge', ['ui.router','ngResource','app.mqacommon']);
    var stateProvider;
    var couchProvider;


    module.config(function ($stateProvider, $couchPotatoProvider)
    {
        stateProvider = $stateProvider;
        couchProvider = $couchPotatoProvider;
        $stateProvider
            .state('app.bridge', {
                abstract: true,
                url: '/bridge',
                views: {
                    "content@app":
                        {
                            templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
                        },
                    "realtime@content":
                        {
                            template:"<div></div>"
                        }
                }})
            .state('app.bridge.xmlsign_wmq_gate', {
                abstract: true,
                url: '/xmlsign_wmqgate',
                views: {

                    "nav@app":
                        {
                            controller: 'xmlSignWMQGateNavigationCtrl',
                            templateUrl: 'app/modules/bridge/partials/xmlsign-wmq-gate-navigation.tpl.html',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/bridge/controllers/xmlSignWMQGateNavigationCtrl',
                                    'modules/bridge/services/bridgeDataSvc',
                                    'modules/common/services/chartSvc',
                                    'modules/common/directives/ui/mqaDashboardCount',
                                    'modules/bridge/controllers/xmlSignWMQGateDetailDialogCtrl',
                                    'modules/bridge/directives/xmlsignWmqGateDashboardCount',
                                    'modules/bridge/directives/xmlsignWmqGateTransactionGrid'
                                ])

                            }
                        },
                    "content@app":
                        {
                            templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
                        },
                    "realtime@content":
                        {
                            controller: 'xmlSignWMQGateRealtimeCtrl',
                            controllerAs: 'realtime',
                            templateUrl: 'app/modules/bridge/partials/xmlsign-wmq-gate-realtime-header.tpl.html',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/bridge/controllers/xmlSignWMQGateRealtimeCtrl'
                                ])
                            }
                        }
                },
                data:{
                    title: 'WMQ Digital Signature Bridge', module: 'WMQ Digital Signature Bridge', security:['bridge'], module_id:'bridge_xmlsign_wmqgate'
                }})
            .state('app.bridge.xmlsign_wmq_gate.dashboard', {
                url: '/dashboard',
                views: {
                    "content@app":
                        {
                            controller: 'xmlSignWMQGateDashboardCtrl',
                            templateUrl: 'app/modules/bridge/partials/xmlsign-wmq-gate-dashboard.tpl.html',
                            controllerAs: 'vm',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/common/directives/graphs/mqaChartjs',
                                    'modules/bridge/controllers/xmlSignWMQGateDashboardCtrl',
                                    'modules/bridge/controllers/xmlSignWMQGateDashboardFilterDialogCtrl'
                                ])

                            }
                        }
                },
                data:
                    {
                        title: 'Dashboard'
                    }
            })
            .state('app.bridge.xmlsign_wmq_gate.reporting',
            {
                    abstract: true,
                    url: '/reporting',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'xmlSignWMQGateReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/bridge/controllers/xmlSignWMQGateReportingCtrl',
                                        ])
                                    }
                                },
                            "filterContent@content":
                                {
                                    templateUrl: 'app/modules/bridge/partials/common-bridge-filter.tpl.html',
                                },
                            "customOuterFilter@filter": {
                                templateUrl: 'app/modules/bridge/partials/xmlsign-wmq-gate-reporting-outer-filter.tpl.html'
                            }
                        },
                        data:
                        {
                            title:'Reporting'
                        }
            })
            .state("app.bridge.xmlsign_wmq_gate.reporting.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'xmlSignWMQGateReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/bridge/partials/xmlsign-wmq-gate-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/bridge/controllers/xmlSignWMQGateReportingGridViewCtrl'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP004_002_001",
                        type: 3,
                        description: "WMQ Digital Signature Bridge Listing",
                        notes: "List of Digital Signature Bridge Requests",
                        reloadState: ".reporting",
                    }
                }
            })


    });

    couchPotato.configureApp(module);

    module.run(['$couchPotato', function($couchPotato)
    {
        module.lazy = $couchPotato;
    }]);
    return module;
});