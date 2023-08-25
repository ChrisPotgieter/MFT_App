/*
 /// <summary>
 /// app.modules.spe - module.js
 /// SPE Module Bootstrapper
 /// CNO Customizations
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/12/2017
 /// </summary>
 */
define(
	[
		'angular',
		'angular-couch-potato',
		'lodash',
		'angular-ui-router',
		'angular-resource',
		'modules/common/module',
		'modules/spe/module',
		'modules/custom/spe_cno/module'
	],
	function (ng, couchPotato, lodash) {
		'use strict';

		var module = ng.module('app.mqacustom.spe_cno', [ 'ui.router', 'ngResource', 'app.mqacommon', 'app.mqaspe' ]);
		var stateProvider;
		var couchProvider;

		module.config(function ($stateProvider, $couchPotatoProvider) {
			stateProvider = $stateProvider;
			couchProvider = $couchPotatoProvider;
			$stateProvider
				// <editor-fold desc="ITXA InstaMed Extension">
				.state('app.custom.spe_instamed_cno', {
					abstract: true,
					url: '/instamed_cno',
					views: {
						'nav@app': {
							controller: 'speNavigationCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/navigation-instamed.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speNavigationCtrl',
									'modules/spe/extensions/instamed/services/speInstamedDataSvc',
									'modules/admin/services/adminDataSvc',
									'modules/common/services/chartSvc',
									'modules/spe/filters/speFilters'
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
						title: 'InstaMed',
						module: 'Instamed',
						security: [ 'MODULE_INSTAMED' ],
						module_id: 'instamed'
					}
				})
				.state('app.custom.spe_instamed_cno.dashboard', {
					url: '/dashboard',
					controllerAs: 'vm',
					views: {
						'content@app': {
							controller: 'speInstaMedDashboardCtrl',
							templateUrl: 'app/modules/spe/extensions/instamed/partials/dashboard.tpl.html',
							controllerAs: 'vm',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/directives/graphs/mqaChartjs',
									'modules/common/directives/ui/mqaDashboardCount',
									'modules/spe/extensions/instamed/controllers/speInstaMedDashboardCtrl',
									'modules/spe/extensions/instamed/controllers/speInstaMedDashboardCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedDashboardCount',
									'modules/spe/extensions/instamed/directives/speInstamedTransactionGrid',
									'modules/spe/extensions/instamed/controllers/speInstaMedDashboardFilterDialogCtrl'
								])
							}
						}
					},
					data: {
						title: 'Dashboard'
					}
				})
				.state('app.custom.spe_instamed_cno.reporting', {
					abstract: true,
					url: '/reporting',
					data: {
						title: 'Reporting'
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transaction', {
					abstract: true,
					url: '/transaction',
					views: {
						'innerContent@content': {
							controller: 'speInstaMedTransactionReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-reporting-filter.tpl.html'
						},
						'footerContent@content': {
							template: '<div></div>'
						}
					},

					data: {
						title: 'Transaction Reporting'
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transaction.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'speInstaMedTransactionReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionReportingGridViewCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedTransactionGrid'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'REP002_001_001',
							type: 3,
							description: 'InstaMed Transaction Listing',
							notes: 'List of InstaMed Transactions',
							reloadState: '.reporting.transaction'
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.claimpayment', {
					abstract: true,
					url: '/claimpayment',
					views: {
						'innerContent@content': {
							controller: 'speInstaMedClaimPaymentReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedClaimPaymentReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/claim-payment-reporting-filter.tpl.html'
						},
						'footerContent@content': {
							template: '<div></div>'
						}
					},

					data: {
						title: 'Claim Payment Reporting'
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.claimpayment.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'speInstaMedClaimPaymentReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/claim-payment-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedClaimPaymentReportingGridViewCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedClaimPayGrid'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'REP002_001_002',
							type: 3,
							description: 'InstaMed Claim Payment Listing',
							notes: 'List of InstaMed Claim Payments Transactions',
							reloadState: '.reporting.claimpayment'
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail', {
					abstract: true,
					url: '/detail/:transactionId',
					views: {
						'innerContent@content': {
							controller: 'speInstaMedTransactionDetailCtrl',
							controllerAs: 'vmDetailAbstract',
							templateUrl: 'app/modules/common/partials/detail-info-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedPaymentCharts',
									'modules/common/directives/graphs/mqaChartjs'
								])
							}
						},
						'infoHeader@content': {
							templateUrl: 'app/modules/common/partials/detail-summary-header-info.tpl.html'
						},
						'infoContent@content': {
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-summary-info.tpl.html'
						},
						'operations@content': {
							template: '<div></div>'
						}
					},
					data: {
						title: 'End to End Tracking',
						titleIcon: 'sort-amount-asc',
						infoHeight: '705',
						infoPanelHeight: '400'
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail.ganttview', {
					url: '/gantt',
					views: {
						'widgetContent@content': {
							controller: 'speInstaMedTransactionDetailGanttViewCtrl',
							controllerAs: 'vmDetail',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-ganttview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailGanttViewCtrl',
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDrillPartnerDialogCtrl',
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDrillResponseDialogCtrl'
								])
							}
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail.claimpayview', {
					url: '/claimpayment',
					views: {
						'widgetContent@content': {
							controller: 'speInstaMedTransactionDetailClaimPayViewCtrl',
							controllerAs: 'vmDetail',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-claimpayview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailClaimPayViewCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedClaimPayGrid'
								])
							}
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail.payview', {
					url: '/payments',
					views: {
						'widgetContent@content': {
							controller: 'speInstaMedTransactionDetailPayViewCtrl',
							controllerAs: 'vmDetail',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-payview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailPayViewCtrl'
								])
							}
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail.idftobereceivedview', {
					url: '/idftobereceived',
					views: {
						'widgetContent@content': {
							controller: 'speInstaMedTransactionDetailIDFToBeReceivedViewCtrl',
							controllerAs: 'vmDetail',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-claimpayview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailIDFToBeReceivedViewCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedClaimPayGrid'
								])
							}
						}
					}
				})
				.state('app.custom.spe_instamed_cno.reporting.transactionDetail.idftobesentview', {
					url: '/idftobesent',
					views: {
						'widgetContent@content': {
							controller: 'speInstaMedTransactionDetailIDFToBeSentViewCtrl',
							controllerAs: 'vmDetail',
							templateUrl:
								'app/modules/spe/extensions/instamed/partials/transaction-detail-claimpayview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/extensions/instamed/controllers/speInstaMedTransactionDetailIDFToBeSentViewCtrl',
									'modules/spe/extensions/instamed/directives/speInstamedClaimPayGrid'
								])
							}
						}
					}
				})
				//</editor-fold>

				//<editor-fold desc="Third Party Commission Intake">
				.state('app.custom.tpci_cno', {
					abstract: true,
					url: '/cno_tpci',
					views: {
						'nav@app': {
							controller: 'cnoTpciNavigationCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-navigation.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/services/chartSvc',
									'modules/common/directives/ui/mqaDashboardCount',
									'modules/custom/spe_cno/controllers/cnoTpciDashboardCtrl',
									'modules/custom/spe_cno/controllers/cnoTpicVendorDetailDialogCtrl',
									'modules/custom/spe_cno/controllers/cnoTpciDashboardTransactionDialogCtrl',
									'modules/custom/spe_cno/controllers/cnoTpciDashboardFilterDialogCtrl',
									'modules/custom/spe_cno/controllers/cnoTpciDetailDialogCtrl',
									'modules/custom/spe_cno/directives/cnoTpciDashboardCount',
									'modules/custom/spe_cno/directives/cnoTpciMetaDataGrid',
									'modules/custom/spe_cno/directives/cnoTpciTransactionGrid',
									'modules/custom/spe_cno/controllers/cnoTpciNavigationCtrl',
									'modules/custom/spe_cno/services/speCNODataSvc',
									'modules/spe/filters/speFilters',
									'modules/spe/services/speDataSvc',
									'modules/spe/controllers/itxTransactionBalancingDialogCtrl'
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
						title: 'Third Party Compensation',
						module: 'Third Party Commission',
						security: [ 'MODULE_SPE' ],
						module_id: "tpci_cno'"
					}
				})
				.state('app.custom.tpci_cno.enrollment', {
					abstract: true,
					url: '/enrollment',
					data: {
						title: 'Enrollment',
						titleIcon: 'user-md',
						department: { id: 1, code: 'enrollment' }
					}
				})
				.state('app.custom.tpci_cno.enrollment.dashboard', {
					url: '/dashboard',
					views: {
						'content@app': {
							controller: 'cnoTpciDashboardCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-dashboard.tpl.html',
							controllerAs: 'vm'
						}
					},
					data: {
						title: 'Dashboard'
					}
				})
				.state('app.custom.tpci_cno.enrollment.reporting', {
					abstract: true,
					url: '/reporting',
					views: {
						'innerContent@content': {
							controller: 'cnoTpciReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoTpciReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-filter.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/controllers/commonFilterListDialogCtrl',
									'modules/common/controllers/commonFilterEntryEditDialogCtrl',
									'modules/common/directives/input/mqaFilterEntryList',
									'modules/common/directives/input/mqaFilterEntry'
								])
							}
						},
						'customOuterFilter@filter': {
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-outer-filter.tpl.html'
						}
					},
					data: {
						title: 'Reporting'
					}
				})
				.state('app.custom.tpci_cno.enrollment.reporting.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'cnoTpciReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoTpciReportingGridViewCtrl'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'CNO_TPCI_ENROLL_REP001',
							type: 3,
							description: 'Enrollment Listing',
							notes: 'Third Party Commission Intake List of Enrolled Persons',
							reloadState: 'app.custom.tpci_cno.enrollment.reporting'
						}
					}
				})
				.state('app.custom.tpci_cno.commission', {
					abstract: true,
					url: '/commission',
					data: {
						title: 'Commission',
						titleIcon: 'money',
						department: { id: 2, code: 'commission' }
					}
				})
				.state('app.custom.tpci_cno.commission.dashboard', {
					url: '/dashboard',
					views: {
						'content@app': {
							controller: 'cnoTpciDashboardCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-dashboard.tpl.html',
							controllerAs: 'vm'
						}
					},
					data: {
						title: 'Dashboard'
					}
				})
				.state('app.custom.tpci_cno.commission.reporting', {
					abstract: true,
					url: '/reporting',
					views: {
						'innerContent@content': {
							controller: 'cnoTpciReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoTpciReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-filter.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/controllers/commonFilterListDialogCtrl',
									'modules/common/controllers/commonFilterEntryEditDialogCtrl',
									'modules/common/directives/input/mqaFilterEntryList',
									'modules/common/directives/input/mqaFilterEntry'
								])
							}
						},
						'customOuterFilter@filter': {
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-outer-filter.tpl.html'
						}
					},
					data: {
						title: 'Reporting'
					}
				})
				.state('app.custom.tpci_cno.commission.reporting.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'cnoTpciReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl: 'app/modules/custom/spe_cno/partials/tpci-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoTpciReportingGridViewCtrl'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'CNO_TPCI_COMMISSION_REP001',
							type: 3,
							description: 'Commission Listing',
							notes: 'Third Party Commission Intake List of Commission Persons',
							reloadState: 'app.custom.tpci_cno.enrollment.reporting'
						}
					}
				})
				//</editor-fold>

				// <editor-fold desc="Automated Employer Group Files">
				.state('app.custom.crs', {
					abstract: true,
					url: '/aegf',
					views: {
						'nav@app': {
							controller: 'aegfNavigationCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/aegf-navigation.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/common/services/chartSvc',
									'modules/common/directives/ui/mqaDashboardCount',
									'modules/custom/spe_cno/controllers/aegfNavigationCtrl',
									'modules/custom/spe_cno/directives/aegfGroupFilter',
									'modules/custom/spe_cno/directives/aegfConfigGrid',
									'modules/custom/spe_cno/services/speCNODataSvc',
									'modules/custom/spe_cno/filters/cnoFilters',
									'modules/custom/spe_cno/controllers/cnoCLICtrl',

								])
							}
						},
						'content@app': {
							templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
						},
						"realtime@content":	{
								controller: 'aegfRealtimeCtrl',
								controllerAs: 'realtime',
								templateUrl: 'app/modules/custom/spe_cno/partials/aegf-realtime-header.tpl.html',
								resolve: {
									deps: $couchPotatoProvider.resolveDependencies([
										'modules/custom/spe_cno/controllers/aegfRealtimeCtrl',
									])
								}
							}
					},
					data: {
						title: 'Automated Employee Group Files',
						module: 'AEGF',
						security: [ 'MODULE_SPE' ],
						module_id: 'aegf'
					}
				})
				.state('app.custom.crs.parameters', {
					url: '/parameters',
					data: {
						title: 'Parameters',
						menuIcon: 'fa fa-cubes'
					}
				})
				.state('app.custom.crs.parameters.emp_codes', {
					url: '/emp_codes/:group_id/:sub_group_id',
					views: {
						'innerContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/aegf-emp-code-list.tpl.html',
							controller: 'aegfEmpCodeListCtrl',
							controllerAs: 'vmListing',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/aegfEmpCodeListCtrl',
									'modules/custom/spe_cno/controllers/aegfEmpCodeEditDialogCtrl',
								])
							}
						}
					},
					data: {
						title: 'SSN to Employee Map',
						subTitle: 'SSN to Employee Map',
						menuIcon: 'fa fa-cubes'
					}
				})
				.state('app.custom.crs.parameters.lob', {
					url: '/lob/:group_id',
					views: {
						'innerContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/aegf-lob-list.tpl.html',
							controller: 'aegfLOBListCtrl',
							controllerAs: 'vmListing',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/aegfLOBListCtrl',
									'modules/custom/spe_cno/controllers/aegfLOBEditDialogCtrl',
									'modules/common/directives/ui/mqaAuditDisplay',
									'modules/common/controllers/commonAuditDialog',
									'modules/common/directives/ui/mqaJsonEditor'
								])
							}
						}
					},
					data: {
						title: 'LOB Short to Long Mapping',
						subTitle: 'Short to Long Map',
						menuIcon: 'fa fa-cubes'
					}
				})
				.state('app.custom.crs.parameters.emp_groups', {
					url: '/groups',
					views: {
						'innerContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/aegf-emp-group-list.tpl.html',
							controller: 'aegfEmpGroupListCtrl',
							controllerAs: 'vmListing',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/aegfEmpGroupListCtrl',
									'modules/custom/spe_cno/controllers/aegfEmpGroupEditDialogCtrl',
									'modules/custom/spe_cno/controllers/aegfEmpGroupEntryListCtrl'
								])
							}
						}
					},
					data: {
						title: 'Employer Group Maintenance',
						subTitle: '',
						menuIcon: 'fa fa-cubes'
					}
				})
				.state('app.custom.crs.parameters.billing',	{
						url: '/billing',
						views:
							{
								"innerContent@content":
									{
										controller: 'aegfBillingConfigCtrl',
										controllerAs: 'vm',
										templateUrl: 'app/modules/custom/spe_cno/partials/aegf-billing-config.tpl.html',
										resolve: {
											deps: $couchPotatoProvider.resolveDependencies([
												'modules/custom/spe_cno/controllers/aegfBillingConfigCtrl',
												'modules/custom/spe_cno/controllers/aegfBillingConfigDetailCreateDialogCtrl'
											])
										}
									},
							},
						data:
							{
								title:'Billing Configuration',
							}
					})
				.state('app.custom.crs.dashboard', {
					url: '/dashboard',
					views: {
						"content@app":
							{
								controller: 'aegfDashboardCtrl',
								templateUrl: 'app/modules/custom/spe_cno/partials/aegf-dashboard.tpl.html',
								controllerAs: 'vm',
								resolve: {
									deps: $couchPotatoProvider.resolveDependencies([
										'modules/common/directives/graphs/mqaChartjs',
										'modules/common/directives/ui/mqaDashboardCount',
										'modules/custom/spe_cno/controllers/aegfDashboardCtrl',
										'modules/custom/spe_cno/controllers/aegfDashboardFilterDialogCtrl',
										'modules/custom/spe_cno/controllers/aegfTransactionDetailDialogCtrl',
										'modules/custom/spe_cno/directives/aegfDashboardCount',
										'modules/custom/spe_cno/directives/aegfTransactionGrid'
									])

								}
							}
					},
					data:
						{
							title: 'Dashboard',
						}
				})
				.state("app.custom.crs.billing", {
					url: '/billing/detail/:id/:group_id/:sub_group_id/:copy_id',
					views: {
						"innerContent@content": {
							controller: 'aegfBillingConfigDetailCtrl',
							controllerAs: 'vmDetail',
							templateUrl: 'app/modules/custom/spe_cno/partials/aegf-billing-config-detail.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/aegfBillingConfigDetailCtrl',
									'modules/custom/spe_cno/controllers/aegfBillingConfigDetailColumnEditDialogCtrl',
									'modules/custom/spe_cno/controllers/aegfBillingConfigDetailColumnAdjustDialogCtrl',
									'modules/custom/spe_cno/controllers/aegfBillingConfigDetailColumnTransformationEditDialogCtrl',
									'modules/custom/spe_cno/controllers/aegfBillingConfigDetailColumnAddDialogCtrl'

								])
							},
						}
					},
					data:
						{
							title: 'Billing Configuration Detail',
							titleIcon: 'fa fa-dollar',
						}
				})
				//</editor-fold>

				//<editor-fold desc="ITXA Overrides">

				.state('app.custom.spe_cno', {
					abstract: true,
					url: '/itxa_cno',
					views: {
						'nav@app': {
							controller: 'speNavigationCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/navigation.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speNavigationCtrl',
									'modules/spe/services/speDataSvc',
									'modules/admin/services/adminDataSvc',
									'modules/common/services/chartSvc',
									'modules/spe/filters/speFilters',
									'modules/custom/spe_cno/services/speCNODataSvc'
								])
							}
						},
						'content@app': {
							templateUrl: 'app/modules/layout/partials/module-header.tpl.html'
						},
						'realtime@content': {
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
					data: {
						title: 'ITX',
						module: 'ITXA',
						security: [ 'MODULE_SPE' ],
						module_id: 'spe'
					}
				})
				.state('app.custom.spe_cno.dashboard', {
					url: '/dashboard',
					controllerAs: 'vm',
					views: {
						'content@app': {
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
					data: {
						title: 'Dashboard'
					}
				})
				.state('app.custom.spe_cno.submitterprofile', {
					url: '/profile/submitter',
					views: {
						'content@app': {
							controller: 'cnoSpeSubmitterProfileListCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/submitter-profile-list.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/directives/cnoSpeSubmitterProfileEdit',
									'modules/custom/spe_cno/controllers/cnoSpeSubmitterProfileListCtrl'
								])
							}
						}
					},
					data: {
						title: 'Submitter Profile Administration',
						module: 'ITXA',
						security: [ 'ADMIN_ITX_PARTNER' ]
					}
				})
				.state('app.custom.spe_cno.senderprofile', {
					url: '/profile/sender',
					views: {
						'content@app': {
							controller: 'cnoSpeSenderProfileListCtrl',
							templateUrl: 'app/modules/custom/spe_cno/partials/sender-profile-list.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/directives/cnoSpeSenderProfileEdit',
									'modules/custom/spe_cno/controllers/cnoSpeSenderProfileListCtrl',
									'modules/spe/controllers/speSenderImportCtrl',
									'modules/spe/controllers/speSenderSyncCtrl'
								])
							}
						}
					},
					data: {
						title: 'Sender Profile Administration',
						security: [ 'ADMIN_ITX_PARTNER' ]
					}
				})
				.state('app.custom.spe_cno.reporting.gwidsearch', {
					url: '/gwidsearch/:id',
					views: {
						'innerContent@content': {
							controller: 'speGwidSearchCtrl',
							templateUrl: 'app/modules/spe/partials/gwid-search-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speGwidSearchCtrl',
									'modules/spe/directives/mqaSpeGwidPayloadEditor'
								])
							}
						},
						'footerContent@content': {
							template: '<div></div>'
						}
					},
					data: {
						title: 'GWID Search'
					}
				})
				.state('app.custom.spe_cno.reporting.REP001', {
					abstract: true,
					url: '/REP001',
					views: {
						'innerContent@content': {
							controller: 'cnoSpeReportingREP001Ctrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoSpeReportingREP001Ctrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/REP001-reporting-filter.tpl.html'
						},
						'footerContent@content': {
							template: '<div></div>'
						}
					},
					data: {
						title: 'Document Summary Reporting'
					}
				})
				.state('app.custom.spe_cno.reporting.REP001.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'cnoSpeReportingREP001GridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl: 'app/modules/custom/spe_cno/partials/REP001-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/custom/spe_cno/controllers/cnoSpeReportingREP001GridViewCtrl'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'CNO_REP001',
							type: 3,
							description: 'Document Summary Status Report',
							notes: 'Summary of Document Status',
							reloadState: 'app.custom.spe_cno.reporting.REP001'
						}
					}
				})
				.state('app.custom.spe_cno.reporting.gwid', {
					abstract: true,
					url: '/gwid',
					views: {
						'innerContent@content': {
							controller: 'speGwidReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speGwidReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl: 'app/modules/custom/spe_cno/partials/gwid-reporting-filter.tpl.html'
						},
						'footerContent@content': {
							template: '<div></div>'
						}
					},
					data: {
						title: 'GWID Reporting',
						metaFields: [
							{ code: 'group', description: 'Group Number' },
							{ code: 'subscriber', description: 'Subscriber Number' },
							{ code: 'hix', description: 'Member HIX ID' },
							{ code: 'member_fname', description: 'Member First Name' },
							{ code: 'member_lname', description: 'Member Last Name' },
							{ code: 'member_ssn', description: 'Member SSN' },
							{ code: 'file_name', description: 'File Name' }
						]
					}
				})
				.state('app.custom.spe_cno.reporting.gwid.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'speGwidReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl: 'app/modules/spe/partials/gwid-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speGwidReportingGridViewCtrl',
									'modules/spe/directives/mqaSpeGwidGrid',
									'modules/spe/controllers/speGwidDownloadCtrl'
								])
							}
						}
					},
					data: {
						settings: {
							allowDownload: true,
							code: 'REP04_001',
							type: 3,
							description: 'GWID Entry List',
							notes: 'List of GWIDs',
							reloadState: 'app.custom.spe_cno.reporting.gwid'
						}
					}
				})
				.state('app.custom.spe_cno.reporting.transaction', {
					abstract: true,
					url: '/transaction',
					views: {
						'innerContent@content': {
							controller: 'speTransactionReportingCtrl',
							controllerAs: 'vm',
							templateUrl:
								'app/modules/transaction-reporting/partials/transaction-reporting-layout.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speTransactionReportingCtrl'
								])
							}
						},
						'filterContent@content': {
							templateUrl: 'app/modules/spe/partials/transaction-reporting-filter.tpl.html'
						},
						'footerContent@content': {
							template: '<div></div>'
						},
						'customOuterFilter@filter': {
							templateUrl: 'app/modules/spe/partials/transaction-reporting-outer-filter.tpl.html'
						}
					},
					data: {
						title: 'Transaction Reporting'
					}
				})
				.state('app.custom.spe_cno.reporting.transaction.gridview', {
					url: '/gridview?settingId',
					views: {
						'tabContent@content': {
							controller: 'speTransactionReportingGridViewCtrl',
							controllerAs: 'vmgrid',
							templateUrl: 'app/modules/spe/partials/transaction-reporting-gridview.tpl.html',
							resolve: {
								deps: $couchPotatoProvider.resolveDependencies([
									'modules/spe/controllers/speTransactionReportingGridViewCtrl',
									'modules/spe/directives/mqaSpeCompleteKendoGrid'
								])
							}
						}
					},
					data: {
						settings: {
							code: 'REP002_003',
							type: 3,
							description: 'Transaction Listing',
							notes: 'List of Transactions',
							reloadState: '.reporting.transaction'
						}
					}
				})
				//</editor-fold>

				//<editor-fold desc="Admin">
				.state('app.admin.parameters.cno_tpprofile', {
					url: '/cno/profile/tp',
					templateUrl: 'app/modules/admin/partials/parameter-edit-list.tpl.html',
					controller: 'cnoAdmTPProfileListCtrl',
					controllerAs: 'vm',
					resolve: {
						deps: $couchPotatoProvider.resolveDependencies([
							'modules/custom/spe_cno/controllers/cnoAdmTPProfileListCtrl',
							'modules/custom/spe_cno/directives/cnoAdmTpProfileEdit'
						])
					},
					data: {
						title: 'Trading Partner Profile Administration',
						module: 'Administration',
						module_id: 'spe'
					}
				});
			//</editor-fold>
		});

		couchPotato.configureApp(module);

		module.run([
			'$couchPotato',
			'transactionReportingSvc',
			function ($couchPotato, transactionReportingSvc) {
				module.lazy = $couchPotato;

				// create the detail routes
				transactionReportingSvc.createDetailRoutes('app.custom.spe_cno', stateProvider, couchProvider);
			}
		]);
		return module;
	}
);
