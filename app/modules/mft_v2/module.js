/*
 /// <summary>
 /// app.modules.mft_v2 - module.js
 /// MFT V2 Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/mft_v2/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqamft_v2', ['ui.router','ngResource','app.mqacommon']);
    var stateProvider;
    var couchProvider;


    module.config(function ($stateProvider, $couchPotatoProvider)
    {
        stateProvider = $stateProvider;
        couchProvider = $couchPotatoProvider;
        $stateProvider
            .state('app.mft_v2',       {
                abstract: true,
                url: '/mftv2',
                views: {

                    "nav@app":
                    {
                        controller: 'mftv2NavigationCtrl',
                        templateUrl: 'app/modules/mft_v2/partials/navigation.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/mft_v2/controllers/mftv2NavigationCtrl',
                                'modules/mft_v2/services/mftv2DataSvc',
                                'modules/mft_v2/controllers/mftCLICtrl',
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
                         controller: 'mftv2RealtimeCtrl',
                         controllerAs: 'realtime',
                         templateUrl: 'app/modules/mft_v2/partials/realtime-header.tpl.html',
                         resolve: {
                             deps: $couchPotatoProvider.resolveDependencies([
                                'modules/mft_v2/controllers/mftv2RealtimeCtrl'
                                ])
                            }
                     }
                },
                data:{
                    title: 'Managed File Transfer', module: 'Managed File Transfer', security:['MODULE_MFT'], module_id:"mft"
                }})

            .state('app.mft_v2.dashboard', {
                url: '/dashboard',
                views: {
                    "content@app":
                        {
                            controller: 'mftv2DashboardCtrl',
                            templateUrl: 'app/modules/mft_v2/partials/dashboard.tpl.html',
                            controllerAs: 'vm',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/common/directives/graphs/mqaChartjs',
                                    'modules/common/directives/ui/mqaDashboardCount',
                                    'modules/mft_v2/controllers/mftv2DashboardCtrl',
                                    'modules/mft_v2/controllers/mftv2DashboardFilterDialogCtrl',
                                    'modules/mft_v2/directives/mftDashboardCount',
                                    'modules/mft_v2/directives/mftTransactionGrid',
                                    'modules/mft_v2/controllers/mftTransactionErrorSummaryDialogCtrl'
                                ])

                            }
                        }
                },
                data:
                    {
                        title: 'Dashboard',
                    }
            })

            .state('app.mft_v2.reporting.agent',
                {
                    abstract: true,
                    url: '/agents',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'mftAgentReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/mft_v2/controllers/mftAgentReportingCtrl'
                                        ])
                                    }
                                },
                            "filterContent@content":
                                {
                                    templateUrl:'app/modules/mft_v2/partials/agent-reporting-filter.tpl.html',

                                }
                        },
                    data:
                        {
                            title:'Agent Reporting',
                            titleIcon: 'fa-laptop'
                        }
                })
            .state("app.mft_v2.reporting.agent.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'mftAgentReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/mft_v2/partials/agent-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/mft_v2/controllers/mftAgentReportingGridViewCtrl',
                                'modules/mft_v2/directives/mftAgentGrid',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/mft_v2/directives/mftAgentCount'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP001_002",
                        type: 3,
                        description: "MFT Agent Listing",
                        notes: "List of MFT Agents",
                        reloadState: ".reporting.agent",
                    }
                }
            })


            .state("app.mft_v2.agent", {
                url: '/agent/detail/:id',
                views: {
                    "innerContent@content": {
                        controller: 'mftAgentDetailCtrl',
                        controllerAs: 'vmDetail',
                        templateUrl: 'app/modules/mft_v2/partials/agent-detail.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/admin/services/adminDataSvc',
                                'modules/admin/directives/mqaAdmNotifyRuleEdit',
                                'modules/mft_v2/controllers/mftAgentDetailCtrl',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/mft_v2/directives/mftMonitorCount',
                                'modules/mft_v2/directives/mftMonitorGrid',
                                'modules/mft_v2/directives/mftAgentTransferGrid',
                                'modules/common/directives/graphs/mqaChartjs',
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
                        title: 'Agent Detail',
                        titleIcon: 'fa fa-laptop',
                    }
            })
            .state('app.mft_v2.reporting.monitor',
                {
                    abstract: true,
                    url: '/monitors',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'mftMonitorReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/mft_v2/controllers/mftMonitorReportingCtrl'
                                        ])
                                    }
                                },
                            "filterContent@content":
                                {
                                    templateUrl:'app/modules/mft_v2/partials/monitor-reporting-filter.tpl.html',

                                }
                        },
                    data:
                        {
                            title:'Monitor Reporting',
                            titleIcon: 'fa-search'
                        }
                })
            .state("app.mft_v2.reporting.monitor.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'mftMonitorReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/mft_v2/partials/monitor-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/mft_v2/controllers/mftMonitorReportingGridViewCtrl',
                                'modules/mft_v2/directives/mftMonitorGrid',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/mft_v2/directives/mftMonitorCount'

                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP001_003",
                        type: 3,
                        description: "MFT Monitor Listing",
                        notes: "List of MFT Monitors",
                        reloadState: ".reporting.monitor",
                    }
                }
            })

            .state("app.mft_v2.monitor", {
                url: '/monitor/detail/:id',
                views: {
                    "innerContent@content": {
                        controller: 'mftMonitorDetailCtrl',
                        controllerAs: 'vmDetail',
                        templateUrl: 'app/modules/mft_v2/partials/monitor-detail.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/admin/services/adminDataSvc',
                                'modules/admin/directives/mqaAdmNotifyRuleEdit',
                                'modules/mft_v2/controllers/mftMonitorDetailCtrl',
                                'modules/mft_v2/controllers/mftExitDialogCtrl',
                                'modules/mft_v2/directives/mftExitItem',
                                'modules/mft_v2/directives/mftMonitorCondition',
                                'modules/mft_v2/directives/mftMonitorLastRequest',
                                'modules/common/directives/ui/mqaDashboardCount',
                                'modules/common/directives/graphs/mqaChartjs'
                            ])
                        },
                    }
                },
                data:
                    {
                        title: 'Monitor Detail',
                        titleIcon: 'fa fa-search',
                    }
            })

            .state('app.mft_v2.reporting.transaction',
                {
                    abstract: true,
                    url: '/transaction',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'mftv2TransactionReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/mft_v2/controllers/mftv2TransactionReportingCtrl'
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
                            "footerContent@content":
                                {
                                    templateUrl:'app/modules/mft_v2/partials/transaction-reporting-footer.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/common/directives/ui/mqaDashboardCount',
                                            'modules/mft_v2/directives/mftTransactionCount'
                                        ])
                                    }
                                },
                                "customOuterFilter@filter": {
                                    templateUrl:'app/modules/mft_v2/partials/transaction-reporting-outer-filter.tpl.html'
                                }
                        },
                    data:
                        {
                            title:'Transaction Reporting'
                        }
                })
            .state("app.mft_v2.reporting.transaction.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'mftv2TransactionReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/mft_v2/partials/transaction-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/mft_v2/controllers/mftv2TransactionReportingGridViewCtrl',
                                'modules/mft_v2/directives/mftTransactionGrid',
                                'modules/mft_v2/controllers/mftTransactionErrorSummaryDialogCtrl'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP001_001",
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
        transactionReportingSvc.createDetailRoutes("app.mft_v2", stateProvider, couchProvider);
    }]);
    return module;
});