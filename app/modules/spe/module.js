/*
 /// <summary>
 /// app.modules.spe - module.js
 /// SPE Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/05/2016
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'lodash',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/spe/module',

], function (ng, couchPotato, lodash) {
    'use strict';

    var module = ng.module('app.mqaspe', ['ui.router','ngResource','app.mqacommon']);
    var stateProvider;
    var couchProvider;


    module.config(function ($stateProvider, $couchPotatoProvider)
    {
        stateProvider = $stateProvider;
        couchProvider = $couchPotatoProvider;
        $stateProvider
            .state('app.spe', {
                abstract: true,
                url: '/itxa',
                views: {
                    "nav@app":
                    {
                        controller: 'speNavigationCtrl',
                        templateUrl: 'app/modules/spe/partials/navigation.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/spe/controllers/speNavigationCtrl',
                                'modules/spe/services/speDataSvc',
                                'modules/admin/services/adminDataSvc',
                                'modules/common/services/chartSvc',
                                'modules/spe/filters/speFilters'
                            ])
                        }
                    },
                    "content@app":
                    {
                        templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
                    },
                    "realtime@content":
                    {
                        controller: 'speRealtimeCtrl',
                        controllerAs: 'realtime',
                        templateUrl: 'app/modules/spe/partials/realtime-header.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/spe/controllers/speRealtimeCtrl'
                            ])
                        }
                    }
                },
                data:{
                    title: 'ITXA', module: 'ITXA', security:['MODULE_SPE'], module_id:"spe"
                }

            })
            .state('app.spe.parameters', {
                url: '/parameters',
                data:
                    {
                        title:'Configuration',
                    }
            })
            .state("app.spe.parameters.module", {
                url:'/module',
                views:
                    {
                        "innerContent@content":
                            {
                                templateUrl: "app/modules/spe/partials/parameter-module-config-edit.tpl.html",
                                controller: 'itxModuleConfigEditCtrl',
                                controllerAs: 'vm',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/spe/controllers/itxModuleConfigEditCtrl',
                                        'modules/admin/directives/mqaAdmSpeEdit',
                                        'modules/admin/directives/mqaAdmMetaDataConfigEdit',
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
            .state('app.spe.dashboard', {
                url: '/dashboard',
                controllerAs: 'vm',
                views: {
                    "content@app":
                        {
                            controller: 'speDashboardCtrl',
                            templateUrl: 'app/modules/spe/partials/dashboard.tpl.html',
                            controllerAs: 'vm',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/common/directives/graphs/mqaChartjs',
                                    'modules/common/directives/ui/mqaDashboardCount',
                                    'modules/spe/controllers/speDashboardCtrl',
                                    'modules/spe/controllers/speDashboardFilterDialogCtrl',
                                    'modules/spe/directives/speDashboardCount',
                                    'modules/spe/directives/mqaSpeCompleteKendoGrid',
                                    'modules/spe/directives/speTransactionDashboardGroupingChart'
                                ])
                            }
                        }
                },
                data:{
                    title: 'Dashboard'
                }
            })
            .state('app.spe.senderprofile', {
                url: '/profile/sender',
                views: {
                    "content@app":
                        {
                            controller: 'speSenderProfileListCtrl',
                            templateUrl: 'app/modules/spe/partials/sender-profile-list.tpl.html',
                            resolve: {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/spe/controllers/speSenderProfileListCtrl',
                                    'modules/spe/controllers/speSenderProfileEditDialogCtrl',
                                    'modules/custom/spe_cno/services/speCNODataSvc',
                                    'modules/spe/controllers/speSenderImportCtrl',
                                    'modules/spe/controllers/speSenderSyncCtrl',
                                    'modules/spe/directives/mqaSpeThresholdLimit',
                                    'modules/spe/directives/mqaSpeThresholdLimitEditDialogCtrl'
                                ])

                            }
                        }
                },
                data:{
                    title: 'Sender Profile Administration', security:['spe_partner_profile']
                }
            })
            .state("app.spe.reporting.gwid", {
                abstract: true,
                url: '/gwid',
                views:
                    {
                        "innerContent@content":
                            {
                                controller: 'speGwidReportingCtrl',
                                controllerAs: 'vm',
                                templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/spe/controllers/speGwidReportingCtrl',
                                        'modules/spe/controllers/itxTransactionGWIDDetailDialogCtrl',
                                        'modules/spe/controllers/itxCLICtrl',
                                        'modules/spe/controllers/speGwidDownloadCtrl',
                                        'modules/spe/directives/itxGwidPayloadEditor'
                                    ])

                                }
                            },
                        "filterContent@content":                    {
                            templateUrl:'app/modules/spe/partials/gwid-reporting-filter.tpl.html'
                        },
                        "footerContent@content":
                            {
                                template:'<div></div>'
                            }
                    },
                data:
                    {
                        title:'GWID Reporting',
                        metaFields: [{code:"group", description:"Group Number"}, {code:"subscriber", description:"Subscriber Number"},{code:"hix", description:"Member HIX ID"}, {code: "member_fname", description:"Member First Name"}, {code: "member_lname", description:"Member Last Name"}, {code: "member_ssn", description:"Member SSN"}, {code:"file_name", description:"File Name"}]
                    }

            })
            .state("app.spe.reporting.gwid.gridview",{
                url: '/gridview?settingId',
                views: {
                    "tabContent@content": {
                        controller: 'speGwidReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/spe/partials/gwid-reporting-gridview.tpl.html',
                        resolve:  {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/spe/controllers/speGwidReportingGridViewCtrl',
                                'modules/spe/controllers/speGwidDownloadCtrl',
                                'modules/spe/directives/mqaSpeGwidGrid'
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP04_001",
                        type: 3,
                        description: "GWID Entry List",
                        notes: "List of GWIDs",
                        reloadState: ".reporting.gwid"
                    }
                }
            })
            .state('app.spe.reporting.transaction',
            {
                abstract: true,
                url: '/transaction',
                views:
                {
                    "innerContent@content":
                    {
                        controller: 'speTransactionReportingCtrl',
                        controllerAs: 'vm',
                        templateUrl: 'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/spe/controllers/speTransactionReportingCtrl'
                            ])

                        }
                    },
                    "filterContent@content":
                    {
                        templateUrl:'app/modules/spe/partials/transaction-reporting-filter.tpl.html'
                    },
                    "footerContent@content":
                    {
                        template:'<div></div>'
                    },
                    "customOuterFilter@filter": {
                        templateUrl:'app/modules/spe/partials/transaction-reporting-outer-filter.tpl.html'
                    }
                },
                data:
                {
                    title:'Transaction Reporting'
                }
            })
            .state("app.spe.reporting.transaction.gridview",
            {
                url: '/gridview?settingId',
                views: {
                    "tabContent@content": {
                        controller: 'speTransactionReportingGridViewCtrl',
                        controllerAs: 'vmgrid',
                        templateUrl: 'app/modules/spe/partials/transaction-reporting-gridview.tpl.html',
                        resolve: {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/spe/controllers/speTransactionReportingGridViewCtrl',
                                'modules/spe/directives/mqaSpeCompleteKendoGrid',
                            ])
                        }
                    }
                },
                data: {
                    settings: {
                        code: "REP002_003",
                        type: 3,
                        description: "Transaction Listing",
                        notes: "List of Transactions",
                        reloadState: ".reporting.transaction",
                    }
                }
            })

    });


    couchPotato.configureApp(module);

    module.run(['$couchPotato', 'transactionReportingSvc', function($couchPotato, transactionReportingSvc)
    {
        module.lazy = $couchPotato;

        // now create the detail routes
        transactionReportingSvc.createDetailRoutes("app.spe", stateProvider, couchProvider);
    }]);
    return module;
});