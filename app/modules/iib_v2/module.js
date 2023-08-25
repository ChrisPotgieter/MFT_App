/*
 /// <summary>
 /// app.modules.iib_v2 - module.js
 /// IIB V2 Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/11/2018
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/iib_v2/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqaiib_v2', ['ui.router','ngResource','app.mqacommon']);
    var stateProvider;
    var couchProvider;


    module.config(function ($stateProvider, $couchPotatoProvider)
    {
        stateProvider = $stateProvider;
        couchProvider = $couchPotatoProvider;
        $stateProvider
            .state('app.iib_v2', {
                abstract: true,
                url: '/iibv2',
                views: {

                    "nav@app":
                    {
                        controller: 'iibv2NavigationCtrl',
                        templateUrl: 'app/modules/iib_v2/partials/navigation.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/iib_v2/controllers/iibv2NavigationCtrl',
                                'modules/iib_v2/services/iibv2DataSvc',
                                'modules/common/services/chartSvc',
                                'modules/iib_v2/controllers/iibCLICtrl',
                                'modules/common/directives/ui/mqaDashboardCount',
                            ])

                        }
                    },
                    "content@app":
                    {
                        templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
                    },
                    "realtime@content":
                        {
                            controller: 'iibv2RealtimeCtrl',
                            controllerAs: 'realtime',
                            templateUrl: 'app/modules/iib_v2/partials/realtime-header.tpl.html',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/iib_v2/controllers/iibv2RealtimeCtrl'
                                ])
                            }
                        }
                },
                data:{
                    title: 'App Connect Enterprise', module: 'App Connect Enterprise', security:['MODULE_IIB'], module_id:"iib"

                }})
            .state('app.iib_v2.dashboard', {
                url: '/dashboard'
            })
            .state('app.iib_v2.dashboard.transaction', {
                url: '/transaction',
                views: {
                    "content@app":
                        {
                            controller: 'iibv2TransactionDashboardCtrl',
                            templateUrl: 'app/modules/iib_v2/partials/transaction-dashboard.tpl.html',
                            controllerAs: 'vm',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/common/directives/graphs/mqaChartjs',
                                    'modules/common/directives/ui/mqaDashboardCount',
                                    'modules/iib_v2/controllers/iibv2TransactionDashboardCtrl',
                                    'modules/iib_v2/controllers/iibv2TransactionDashboardFilterDialogCtrl',
                                    'modules/iib_v2/directives/iibTransactionDashboardCount',
                                    'modules/iib_v2/directives/iibTransactionDashboardApplicationChart',
                                    'modules/iib_v2/controllers/iibTransactionErrorSummaryDialogCtrl',
                                    'modules/iib_v2/directives/iibTransactionGrid'
                                ])

                            }
                        }
                },
                data:{
                    title: 'Dashboard'
                }
            })
            .state('app.iib_v2.parameters', {
                url: '/parameters'
            })
            .state("app.iib_v2.parameters.iib_app", {
                url:'/applications',
                views:
                {
                    "innerContent@content":
                        {
                            url:'/iibv2/applications',
                            templateUrl: "app/modules/admin/partials/parameter-config-list-menu.tpl.html",
                            controller: 'parameterIIBAppEditListCtrl',
                            controllerAs: 'vmConfigList',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/iib_v2/controllers/parameterIIBAppEditListCtrl',
                                    'modules/iib_v2/controllers/parameterIIBAppEditDialogCtrl',
                                    'modules/iib_v2/controllers/parameterIIBAppFlowEditDialogCtrl',
                                    'modules/iib_v2/controllers/parameterIIBAppFlowNodeEditDialogCtrl',
                                    'modules/iib_v2/directives/parameterIibAppFlowList',
                                    'modules/iib_v2/directives/parameterIibAppFlowNodeList',
                                    'modules/iib_v2/services/iibv2DataSvc',
                                    'modules/admin/controllers/parameterEditMetaDialogCtrl',
                                    'modules/admin/directives/mqaAdmMetaDataList'
                                ])
                            },
                        }
                 },
                data:
                    {
                        title:'Application List',
                        subTitle:"Application",
                        menuIcon:"fa fa-cubes"
                    }
            })
            .state("app.admin.parameters.iib_job", {
                url:'/iib/jobNames',
                templateUrl: "app/modules/admin/partials/parameter-config-list.tpl.html",
                controller: 'parameterIIBJobEditListCtrl',
                controllerAs: 'vmConfigList',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/iib_v2/controllers/parameterIIBJobEditListCtrl',
                        'modules/iib_v2/controllers/parameterIIBJobEditDialogCtrl',
                        'modules/iib_v2/services/iibv2DataSvc',
                        'modules/admin/controllers/parameterEditMetaDialogCtrl',
                        'modules/admin/directives/mqaAdmMetaDataList'
                    ])
                },
                data:
                    {
                        title:'Job Name List', module: 'Administration', module_id:"admin",
                        list_code:'IIB_JOB',
                        subTitle:"Job Name"
                    }
            })

            .state('app.iib_v2.reporting.transaction',
                {
                    abstract: true,
                    url: '/transaction',
                    views:
                        {
                            "innerContent@content":
                                {
                                    controller: 'iibv2TransactionReportingCtrl',
                                    controllerAs: 'vm',
                                    templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                    resolve: {
                                        deps: $couchPotatoProvider.resolveDependencies([
                                            'modules/iib_v2/controllers/iibv2TransactionReportingCtrl',
                                            'modules/common/controllers/commonFilterListDialogCtrl',
                                            'modules/common/controllers/commonFilterEntryEditDialogCtrl',
                                            'modules/common/directives/input/mqaFilterEntryList',
                                            'modules/common/directives/input/mqaFilterEntry'
                                        ])
                                    }
                                },
                            "footerContent@content":
                                {
                                    template:'<div></div>'
                                }
                        }
                })
            .state("app.iib_v2.reporting.transaction.gridview",{
                url: '/gridview?settingId',
                views:            {
                    "tabContent@content": {
                        controller: 'iibv2TransactionReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/iib_v2/partials/transaction-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/iib_v2/controllers/iibBulkExportPayloadDialogCtrl',
                                'modules/iib_v2/controllers/iibv2TransactionReportingGridViewCtrl',
                                'modules/iib_v2/directives/iibTransactionGrid',
                                'modules/iib_v2/directives/iibTransactionCount',
                                'modules/iib_v2/controllers/iibTransactionErrorSummaryDialogCtrl',

                            ])
                        }
                    },
                    "filterContent@content": {
                        controller: 'iibv2TransactionReportingAppFilterCtrl',
                        controllerAs: 'vmFilter',
                        templateUrl: 'app/modules/iib_v2/partials/transaction-reporting-app-filter.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/iib_v2/controllers/iibv2TransactionReportingAppFilterCtrl'
                            ])
                        }
                     }
                },
                data: {
                    title:"Transaction Reporting",
                    settings: {
                        code: "REP103_001",
                        type: 3,
                        description: "Transaction Listing",
                        notes: "List of Transactions",
                        reloadState: ".reporting.transaction",
                    }
                }
            })
            .state("app.iib_v2.reporting.transaction.jobgridview",{
                url: '/job-gridview?settingId',
                views: {
                    "filterContent@content": {
                        controller: 'iibv2TransactionReportingJobFilterCtrl',
                        controllerAs: 'vmFilter',
                        templateUrl: 'app/modules/iib_v2/partials/transaction-reporting-job-filter.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/iib_v2/controllers/iibv2TransactionReportingJobFilterCtrl',
                                'modules/iib_v2/directives/iibTransactionGrid'
                            ])
                        }
                    },
                    "tabContent@content": {
                        controller: 'iibv2TransactionReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/iib_v2/partials/transaction-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/iib_v2/controllers/iibv2TransactionReportingGridViewCtrl',
                                'modules/iib_v2/directives/iibTransactionGrid'
                            ])

                        }
                    }
                },
                data: {
                    title:"Job Name Reporting",
                    settings: {
                        code: "REP103_002",
                        type: 3,
                        description: "Job Transaction Listing",
                        notes: "List of Transactions Based on Job Name",
                        reloadState: ".reporting.transaction",
                    }
                }
            })

    });

    couchPotato.configureApp(module);

    module.run(['$couchPotato', 'transactionReportingSvc',  function($couchPotato, transactionReportingSvc)
    {
        module.lazy = $couchPotato;
        transactionReportingSvc.createDetailRoutes("app.iib_v2", stateProvider, couchProvider);
    }]);
    return module;
});