/*
 /// <summary>
 /// app.modules.admin - module.js
 /// Administration Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/27/2014
 /// </summary>
 */
define(
	[
		'angular',
		'angular-couch-potato',
		'angular-ui-router',
		'angular-resource',
		'modules/common/module',
		'modules/admin/module'
	],
	function (ng, couchPotato) {
		'use strict';

		var module = ng.module('app.mqaadmin', [ 'ui.router', 'ngResource', 'app.mqaauth', 'app.mqacommon' ]);

		module.config(function ($stateProvider, $couchPotatoProvider) {
			$stateProvider
				.state('app.admin', {
					abstract: true,
					url: '/admin',
					views: {
						'nav@app': {
							templateUrl: 'app/modules/admin/partials/navigation.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/services/adminDataSvc'
								])
							}
						},
						'content@app': {
							templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
						},
						'realtime@content': {
							template: '<div></div>'
						}
					},
					data: {
						title: 'Administration',
						module: 'Administration',
						security: [ 'MODULE_ADMIN' ],
						module_id: 'admin'
					}
				})
				.state('app.admin.docTypes', {
					url: '/doctypes',
					views: {
						'innerContent@content': {
							controller: 'adminDocTypeListCtrl',
							templateUrl: 'app/modules/admin/partials/doc-type-list.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/controllers/adminDocTypeListCtrl'
								])
							}
						}
					},
					data: {
						title: 'Document Types'
					}
				})
				.state('app.admin.docType', {
					url: '/doctype/:id',
					views: {
						'innerContent@content': {
							templateUrl: 'app/modules/admin/partials/doc-type-edit.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/directives/mqaAdmDocTypeEditForm',
									'modules/admin/directives/mqaAdmDocTypeMetaDataItem'
								])
							}
						}
					},
					data: {
						title: 'Document Types'
					}
				})
				.state('app.admin.dashboard', {
					url: '/dashboard',
					views: {
						'content@app': {
							templateUrl: 'app/modules/admin/partials/dashboard.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/directives/mqaAdmCompanyList'
								])
							}
						}
					},
					data: {
						title: 'Dashboard'
					}
				})
				.state('app.admin.companyList', {
					abstract: false,
					url: '/companyList',
					views: {
						'innerContent@content': {
							templateUrl: 'app/modules/admin/partials/company-edit-list.tpl.html',
							controller: 'companyListEditCtrl',
							controllerAs: 'vm',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/controllers/companyListEditCtrl',
									'modules/admin/directives/mqaAdmCompanyListEdit'
								])
							}
						}
					},
					data: {
						title: 'List Editor'
					}
				})
				.state('app.admin.json', {
					url: '/json-editor',
					abstract: false,
					views: {
						'innerContent@content': {
							controller: 'jsonEditCtrl',
							controllerAs: 'vm',
							templateUrl: 'app/modules/admin/partials/json-editor.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/directives/ui/mqaJsonEditor',
									'modules/admin/controllers/jsonEditCtrl'
								])
							}
						}
					},
					data: {
						title: 'Parameters'
					}
				})
				.state('app.admin.parameters', {
					url: '/parameter',
					abstract: false,
					views: {
						'innerContent@content': {
							controller: 'parameterEditCtrl',
							controllerAs: 'vm',
							templateUrl: 'app/modules/admin/partials/parameter-edit.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/controllers/parameterEditCtrl'
								])
							}
						}
					},
					data: {
						title: 'Parameters'
					}
				})
				.state('app.admin.parameters.dynamicTable', {
					url: '/dynamicTable',
					templateUrl: 'app/modules/admin/partials/parameter-edit-list.tpl.html',
					controller: 'parameterDynamicTableListCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterDynamicTableListCtrl',
							'modules/admin/directives/mqaAdmDynTableEdit',
							'modules/admin/directives/mqaAdmDynTableColumnEditDialogCtrl'
						])
					},
					data: {
						title: 'Dynamic Table'
					}
				})
				.state('app.admin.parameters.sla', {
					url: '/sla/:id',
					templateUrl: 'app/modules/admin/partials/parameter-config-list.tpl.html',
					controller: 'parameterSLAEditListCtrl',
					controllerAs: 'vmConfigList',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterSLAEditListCtrl',
							'modules/admin/controllers/parameterSLAEditDialogCtrl',
							'modules/admin/directives/mqaAdmNotifyRuleEdit'
						])
					},
					data: {
						title: 'Service Level Agreements (SLA)'
					}
				})
				.state('app.admin.parameters.ediDocument', {
					url: '/ediDocument',
					templateUrl: 'app/modules/admin/partials/parameter-edit-list.tpl.html',
					controller: 'parameterEdiDocumentListCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEdiDocumentListCtrl',
							'modules/admin/directives/mqaAdmEdiDocumentEdit',
							'modules/admin/directives/mqaAdmEdiDocumentMetaEditDialogCtrl'
						])
					},
					data: {
						title: 'EDI Document Configuration'
					}
				})
				.state('app.admin.parameters.smtp', {
					url: '/smtp',
					templateUrl: 'app/modules/admin/partials/parameter-smtp.tpl.html',
					controller: 'parameterEditSMTPCtrl',
					controllerAs: 'vmSmtp',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEditSMTPCtrl',
							'modules/admin/directives/mqaAdmSmtpEdit'
						])
					},
					data: {
						title: 'SMTP Settings'
					}
				})
				.state('app.admin.parameters.env', {
					url: '/env',
					templateUrl: 'app/modules/admin/partials/parameter-env.tpl.html',
					controller: 'parameterEditEnvCtrl',
					controllerAs: 'vmEnv',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEditEnvCtrl',
							'modules/admin/directives/mqaAdmEnvironmentEdit',
						])
					},
					data: {
						title: 'Environment Settings'
					}
				})
				.state('app.admin.parameters.wmq', {
					url: '/wmq',
					templateUrl: 'app/modules/admin/partials/parameter-wmq.tpl.html',
					controller: 'parameterEditWMQCtrl',
					controllerAs: 'vmWmq',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEditWMQCtrl',
							'modules/admin/directives/mqaAdmWmqConnEdit',
							'modules/admin/directives/mqaAdmWmqConnHostEdit',
							'modules/admin/controllers/parameterEditWMQDialogCtrl',
							
						])
					},
					data: {
						title: 'WMQ Settings'
					}
				})
				.state('app.admin.parameters.retention', {
					url: '/retention',
					templateUrl: 'app/modules/admin/partials/parameter-retain.tpl.html',
					controller: 'parameterEditRetainCtrl',
					controllerAs: 'vmRetain',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEditRetainCtrl',
							'modules/admin/directives/mqaAdmRetainEdit'
						])
					},
					data: {
						title: 'Data Retention Settings'
					}
				})
				.state('app.admin.parameters.spe', {
					url: '/itxa',
					templateUrl: 'app/modules/admin/partials/parameter-spe.tpl.html',
					controller: 'parameterEditSpeCtrl',
					controllerAs: 'vmSpe',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterEditSpeCtrl',
							'modules/admin/directives/mqaAdmSpeEdit'
						])
					},
					data: {
						title: 'ITXA Configuration'
					}
				})
				.state('app.admin.parameters.notifyGroup', {
					url: '/notifyGroup',
					templateUrl: 'app/modules/admin/partials/parameter-edit-list.tpl.html',
					controller: 'parameterNotifyGroupListCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterNotifyGroupListCtrl',
							'modules/admin/directives/mqaAdmNotifyGroupEdit',
							'modules/common/directives/ui/mqaThumbList',
						])
					},
					data: {
						title: 'Notification Groups'
					}
				})
				.state('app.admin.parameters.templateGroup', {
					url: '/templateGroup',
					templateUrl: 'app/modules/admin/partials/parameter-template-group-list.tpl.html',
					controller: 'parameterTemplateGroupListCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterTemplateGroupListCtrl',
							'modules/admin/directives/mqaAdmTemplateGroupEdit',
							'modules/admin/controllers/parameterTemplateGroupListDialogCtrl',
							'modules/admin/directives/notificationGrouping',
							'modules/admin/controllers/mqaAdmTemplateGroupEditDialog'

						])
					},
					data: {
						title: 'Template Groups'
					}
				})
				.state('app.admin.parameters.notifyRule', {
					url: '/notificationRule',
					templateUrl: 'app/modules/admin/partials/parameter-notify-rule.tpl.html',
					controller: 'parameterNotifyRuleCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/parameterNotifyRuleCtrl',
							'modules/admin/directives/mqaAdmNotifyRuleEdit',
							'modules/admin/controllers/parameterNotifyRuleEventDialogCtrl'
						])
					},
					data: {
						title: 'Notification Rules'
					}
				})
				.state('app.admin.companywiz', {
					url: '/companywiz/:id',
					abstract: false,
					views: {
						'innerContent@content': {
							controller: 'companyWizardMainCtrl',
							controllerAs: 'vm',
							templateUrl: 'app/modules/common/partials/wizard.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/admin/controllers/companyWizardMainCtrl',
								])
							}
						}
					},
					data: {
						title: 'Company Wizard'
					}
				})
				.state('app.admin.companywiz.basic', {
					url: '/basic',
					templateUrl: 'app/modules/admin/partials/company-basic-wizard.tpl.html',
					controller: 'companyWizardBasicCtrl',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardBasicCtrl'
						])
					},
					data: {
						title: 'Company Wizard'
					}
				})
				.state('app.admin.companywiz.role', {
					url: '/roles',
					templateUrl: 'app/modules/admin/partials/company-role-wizard.tpl.html',
					controller: 'companyWizardRoleCtrl',
					controllerAs:'vmConfigList',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardRoleCtrl',
							'modules/admin/directives/mqaAdmMetaDataConfigEdit',
							'modules/admin/controllers/companyWizardRoleEditDlgCtrl'
						])
					},
					data: {
						title: 'Company Wizard',
						subTitle: 'Roles'
					}
				})
				.state('app.admin.companywiz.addomains', {
					url: '/ad',
					templateUrl: 'app/modules/admin/partials/company-ad-wizard.tpl.html',
					controller: 'companyWizardADCtrl',
					controllerAs:'vmAD',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardADCtrl',
							'modules/admin/directives/mqaAdmCompanyADEdit',
							'modules/admin/controllers/companyWizardADDialog'
						])
					}
				})
				.state('app.admin.companywiz.ad_adminuser', {
					url: '/ad_admin',
					templateUrl: 'app/modules/admin/partials/company-ad-admin-wizard.tpl.html',
					controller: 'companyWizardADAdminUserCtrl',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardADAdminUserCtrl',
							'modules/admin/directives/mqaAdmCompanyUserList'
						])
					}
				})
				.state('app.admin.companywiz.adminuser', {
					url: '/admin',
					templateUrl: 'app/modules/admin/partials/company-admin-wizard.tpl.html',
					controller: 'companyWizardAdminUserCtrl',
					controllerAs: 'vmStep',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardAdminUserCtrl',
							'modules/admin/directives/mqaAdmCompanyUserEdit'
						])
					}
				})
				.state('app.admin.companywiz.commit_summary', {
					url: '/commit',
					templateUrl: 'app/modules/admin/partials/company-summary-wizard.tpl.html',
					controller: 'companyWizardCommitCtrl',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardCommitCtrl'
						])
					}
				})
				.state('app.admin.companywiz.ad_users', {
					url: '/ad_users',
					templateUrl: 'app/modules/admin/partials/company-ad-users-wizard.tpl.html',
					controller: 'companyWizardADUserCtrl',
					controllerAs: 'vmStep',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardADUserCtrl',
							'modules/admin/directives/mqaAdmCompanyUserList',
							'modules/admin/controllers/companyWizardUserEditDialogCtrl',
							'modules/admin/controllers/companyWizardADUserDialogCtrl',
							'modules/admin/directives/mqaAdmCompanyUserEdit'
						])
					}
				})
				.state('app.admin.companywiz.users', {
					url: '/users',
					templateUrl: 'app/modules/admin/partials/company-users-wizard.tpl.html',
					controller: 'companyWizardUserCtrl',
					controllerAs: 'vmStep',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/admin/controllers/companyWizardUserCtrl',
							'modules/admin/directives/mqaAdmCompanyUserList',
							'modules/admin/controllers/companyWizardUserEditDialogCtrl',
							'modules/admin/directives/mqaAdmCompanyUserEdit',
							'modules/admin/controllers/companyWizardUserEditDialogCtrl'
						])
					}
				});
		});

		couchPotato.configureApp(module);

		module.run(function ($couchPotato) {
			module.lazy = $couchPotato;
		});

		return module;
	}
);
