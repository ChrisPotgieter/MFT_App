/*
 /// <summary>
 /// app.modules.admin - module.js
 /// Installation Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/02/2017
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/install/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqainstall', ['ui.router','ngResource','app.mqacommon', 'app.mqaadmin']);

    module.config(function ($stateProvider, $couchPotatoProvider) {
        $stateProvider
            .state('install', {
                url:'/install',
                abstract: true,
                views: {
                    root: {
                        templateUrl: 'app/modules/install/partials/layout.tpl.html',
                        controller: 'installLayoutCtrl',
                        resolve:
                            {
                                deps: $couchPotatoProvider.resolveDependencies([
                                    'modules/install/controllers/installLayoutCtrl',
                                    'modules/admin/services/adminDataSvc'
                                ])
                            }
                    }
                },
                data:
                    {
                        requiresAuth: false
                    }
            })
            .state("install.companywiz", {
                url:'/companywiz/:id',
                abstract: false,
                views:
                    {
                        "innerContent@content":
                            {
                                controller: 'companyWizardMainCtrl',
                                controllerAs: 'vm',
                                templateUrl: 'app/modules/common/partials/wizard.tpl.html',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/admin/controllers/companyWizardMainCtrl'
                                    ])
                                }
                            }
                    },
                data:
                    {
                        title:'Company Wizard', module: 'Installation', module_id:"admin"
                    }
            })
            .state("install.companywiz.basic", {
                url:'/basic',
                templateUrl: "app/modules/admin/partials/company-basic-wizard.tpl.html",
                controller: 'companyWizardBasicCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/companyWizardBasicCtrl'
                    ])
                },
            })
            .state("install.companywiz.role", {
                url:'/roles',
                templateUrl: "app/modules/admin/partials/company-role-wizard.tpl.html",
                controller: 'companyWizardRoleCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/companyWizardRoleCtrl',
                    ])

                },
            })
            .state("install.companywiz.addomains", {
                url:'/ad',
                templateUrl: "app/modules/admin/partials/company-ad-wizard.tpl.html",
                controller: 'companyWizardADCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/companyWizardADCtrl',
                        'modules/admin/directives/mqaAdmCompanyADEdit'
                    ])
                },
            })
            .state("install.companywiz.adminuser", {
                url:'/admin',
                templateUrl: "app/modules/admin/partials/company-admin-wizard.tpl.html",
                controller: 'companyWizardAdminUserCtrl',
                controllerAs: 'vmStep',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/companyWizardAdminUserCtrl',
                        'modules/admin/directives/mqaAdmCompanyUserEdit',
                    ])
                },
            })

            .state("install.companywiz.ad_adminuser", {
                url:'/ad_admin',
                templateUrl: "app/modules/admin/partials/company-ad-admin-wizard.tpl.html",
                controller: 'companyWizardADAdminUserCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/companyWizardADAdminUserCtrl',
                        'modules/admin/directives/mqaAdmCompanyUserList'
                    ])
                },
            })
            .state("install.companywiz.commit_summary", {
                url:'/commit',
                templateUrl: "app/modules/admin/partials/company-summary-wizard.tpl.html",
                controller: 'installCompanyWizardCommitCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/install/controllers/installCompanyWizardCommitCtrl'
                    ])
                },
            })
            .state("install.settingswiz", {
                url:'/settingswiz',
                abstract: false,
                views:
                    {
                        "innerContent@content":
                            {
                                controller: 'installSettingsWizardMainCtrl',
                                controllerAs: 'vm',
                                templateUrl: 'app/modules/common/partials/wizard.tpl.html',
                                resolve: {
                                    deps: $couchPotatoProvider.resolveDependencies([
                                        'modules/install/controllers/installSettingsWizardMainCtrl'
                                    ])
                                }
                            }
                    },
                data:
                    {
                        title:'Settings Wizard', module: 'Installation', module_id:"admin"
                    }
            })
            .state("install.settingswiz.smtp", {
                url:'/smtp',
                templateUrl: "app/modules/install/partials/settings-smtp-wizard.tpl.html",
                controller: 'parameterEditSMTPCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/parameterEditSMTPCtrl',
                        'modules/admin/directives/mqaAdmSmtpEdit'
                    ])
                },
                data:
                    {
                        title:'SMTP Settings'
                    }
            })
            .state("install.settingswiz.env", {
                url:'/env',
                templateUrl: "app/modules/install/partials/settings-env-wizard.tpl.html",
                controller: 'parameterEditEnvCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/parameterEditEnvCtrl',
                        'modules/admin/directives/mqaAdmEnvironmentEdit'
                    ])
                },
                data:
                    {
                        title:'Environment Settings'
                    }
            })
            .state("install.settingswiz.wmq", {
                url:'/wmq',
                templateUrl: "app/modules/install/partials/settings-wmq-wizard.tpl.html",
                controller: 'parameterEditWMQCtrl',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/parameterEditWMQCtrl',
                        'modules/admin/directives/mqaAdmWmqConnEdit',
                        'modules/admin/directives/mqaAdmWmqConnHostEdit'
                    ])
                },
                data:
                    {
                        title:'WMQ Settings'
                    }
            })
            .state("install.settingswiz.retention", {
                url:'/retention',
                templateUrl: "app/modules/install/partials/settings-retain-wizard.tpl.html",
                controller: 'parameterEditRetainCtrl',
                controllerAs: 'vmRetain',
                resolve: {
                    deps: $couchPotatoProvider.resolveDependencies([
                        'modules/admin/controllers/parameterEditRetainCtrl',
                        'modules/admin/directives/mqaAdmRetainEdit'
                    ])
                },
                data:
                    {
                        title:'Data Retention Settings'
                    }
            })
    });

    couchPotato.configureApp(module);

    module.run(function($couchPotato){
        module.lazy = $couchPotato;
    });

    return module;
});