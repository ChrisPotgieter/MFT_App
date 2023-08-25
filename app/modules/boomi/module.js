/*
 /// <summary>
 /// app.modules.boomi - module.js
 /// BOOMI Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 08/05/2021
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/boomi/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqaboomi', ['ui.router','ngResource','app.mqacommon']);
    var stateProvider;
    var couchProvider;


    module.config(function ($stateProvider, $couchPotatoProvider)
    {
        stateProvider = $stateProvider;
        couchProvider = $couchPotatoProvider;
        $stateProvider
            .state('app.boomi',       {
                abstract: true,
                url: '/boomi',
                views: {

                    "nav@app":
                    {
                        controller: 'boomiNavigationCtrl',
                        templateUrl: 'app/modules/boomi/partials/navigation.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/boomi/controllers/boomiNavigationCtrl',
                                'modules/boomi/services/boomiDataSvc',
                                'modules/boomi/controllers/boomiCLICtrl',
                                'modules/common/services/chartSvc'
                                ])

                        }
                    },
                    "content@app":
                    {
                        templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
                    },
                    "realtime@content":
                        {
                            controller: 'boomiRealtimeCtrl',
                            controllerAs: 'realtime',
                            templateUrl: 'app/modules/boomi/partials/realtime-header.tpl.html',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/boomi/controllers/boomiRealtimeCtrl'
                                ])
                            }
                        }
                },
                data:{
                    title: 'Dell Boomi', module: 'Dell Boomi', security:['MODULE_BOOMI'], module_id: 'boomi'
                }})
            .state('app.boomi.parameters', {
                url: '/parameters',
                data:
                    {
                        title:'Configuration',
                    }
            })

            .state("app.boomi.parameters.module", {
                url:'/module',
                views:
                    {
                        "innerContent@content":
                            {
                                templateUrl: "app/modules/boomi/partials/parameter-module-config-edit.tpl.html",
                                controller: 'boomiModuleConfigEditCtrl',
                                controllerAs: 'vm',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/boomi/controllers/boomiModuleConfigEditCtrl',
                                        'modules/boomi/directives/boomiAdmApiEdit'
                                    ])
                                },
                            }
                    },
                data:
                    {
                        title:'Module',
                        menuIcon:"fa fa-cubes"
                    }
            })
            .state('app.boomi.dashboard', {
                url: '/dashboard',
                views: {
                    "content@app":
                        {
                            controller: 'boomiDashboardCtrl',
                            templateUrl: 'app/modules/boomi/partials/dashboard.tpl.html',
                            controllerAs: 'vm',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/common/directives/graphs/mqaChartjs',
                                    'modules/common/directives/input/mqaJqSmallDateRangePicker',
                                    'modules/common/directives/ui/mqaDashboardCount',
                                    'modules/boomi/controllers/boomiDashboardCtrl',
                                    'modules/boomi/controllers/boomiDashboardFilterDialogCtrl',
                                    'modules/boomi/directives/boomiDashboardCount',
                                    'modules/boomi/directives/boomiProcessGrid',
                                    'modules/boomi/directives/boomiAtomGrid',
                                    'modules/boomi/directives/boomiTransactionGrid'
                                ])

                            }
                        }
                },
                data:
                    {
                        title: 'Dashboard',
                    }
            })
            .state('app.boomi.reporting.atom',
                {
                    abstract: true,
                    url: '/atoms',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'boomiAtomReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/boomi/controllers/boomiAtomReportingCtrl'
                                        ])
                                    }
                                },
                            "filterContent@content":
                                {
                                    templateUrl:'app/modules/boomi/partials/atom-reporting-filter.tpl.html',

                                }
                        },
                    data:
                        {
                            title:'Atom Reporting',
                            titleIcon: 'fa-laptop'
                        }
                })
            .state("app.boomi.reporting.atom.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'boomiAtomReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/boomi/partials/atom-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/boomi/controllers/boomiAtomReportingGridViewCtrl',
                                'modules/boomi/directives/boomiAtomGrid',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/boomi/directives/boomiAtomCount'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP003_002",
                        type: 3,
                        description: "Boomi Atom Listing",
                        notes: "List of Boomi Atoms",
                        reloadState: ".reporting.atom",
                    }
                }
            })



            .state("app.boomi.atom", {
                url: '/atom/detail/:id',
                views: {
                    "innerContent@content": {
                        controller: 'boomiAtomDetailCtrl',
                        controllerAs: 'vmDetail',
                        templateUrl: 'app/modules/boomi/partials/atom-detail.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/admin/services/adminDataSvc',
                                'modules/admin/directives/mqaAdmNotifyRuleEdit',
                                'modules/boomi/controllers/boomiAtomDetailCtrl',
                                'modules/admin/controllers/parameterThresholdEntryEditDialogCtrl',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/boomi/directives/boomiProcessGrid',
                                'modules/boomi/directives/boomiServiceGrid',
                                'modules/boomi/directives/boomiAtomClusterGrid',
                                'modules/boomi/directives/boomiAtomConnectorGrid',
                                'modules/boomi/directives/boomiAtomCounterGrid',
                                'modules/boomi/directives/boomiAtomQueueGrid',
                                'modules/boomi/directives/boomiAtomCertGrid',
                                'modules/common/directives/graphs/mqaChartjs'
                            ])
                        },
                    },
                    "infoHeader@content":
                        {
                      //      templateUrl: 'app/modules/common/partials/detail-summary-header-info.tpl.html'
                                 template: '<div></div>'
                        },
                    "infoContent@content":
                        {
                            template: '<div></div>'
                        },
                    "operations@content":
                        {
                            template: "<div></div>"
                        },

                },
                data:
                    {
                        title: 'Atom Detail',
                        titleIcon: 'fa fa-laptop',
                    }
            })
            .state('app.boomi.reporting.transaction',
                {
                    abstract: true,
                    url: '/transaction',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'boomiTransactionReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/boomi/controllers/boomiTransactionReportingCtrl',


                                        ])
                                    }
                                },
                            "filterContent@content":
                                {
                                    templateUrl:'app/modules/common/partials/common-transaction-filter.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/common/controllers/commonFilterListDialogCtrl',
                                            'modules/common/controllers/commonFilterEntryEditDialogCtrl',
                                            'modules/common/directives/input/mqaFilterEntryList',
                                            'modules/common/directives/input/mqaFilterEntry'
                                        ])
                                    }

                                },
                                "customOuterFilter@filter": {
                                    templateUrl:'app/modules/boomi/partials/transaction-reporting-outer-filter.tpl.html'
                                }
                        },
                    data:
                        {
                            title:'Transaction Reporting'
                        }
                })
            .state("app.boomi.reporting.transaction.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'boomiTransactionReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/boomi/partials/transaction-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/boomi/controllers/boomiTransactionReportingGridViewCtrl',
                                'modules/boomi/directives/boomiTransactionGrid',
                                'modules/boomi/directives/boomiTransactionCount'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP003_001",
                        type: 3,
                        description: "Transaction Listing",
                        notes: "List of Transactions",
                        reloadState: ".reporting.transaction",
                    }
                }
            })

    });

    couchPotato.configureApp(module);

    module.run(['$couchPotato', 'transactionReportingSvc',  function($couchPotato, transactionReportingSvc)
    {
        module.lazy = $couchPotato;
        transactionReportingSvc.createDetailRoutes("app.boomi", stateProvider, couchProvider);
    }]);
    return module;
});