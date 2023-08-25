/*
 /// <summary>
 /// app.modules.layout - module.js
 /// Layout Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/27/2014
 /// </summary>
 */
define(['angular',
    'angular-couch-potato',
    'angular-ui-router', 
    'modules/graphs/module',
    'modules/tables/module', 
    'modules/common/module', 
    'modules/auth/module'
], function (ng, couchPotato) 
    {

    "use strict";


    var module = ng.module('app.mqalayout', ['ui.router', 'app.graphs','app.tables','app.mqacommon', 'app.mqaauth']);

    couchPotato.configureApp(module);

    module.config(function ($stateProvider, $couchPotatoProvider, $urlRouterProvider) {


        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    root: {
                        templateUrl: 'app/modules/layout/partials/layout.tpl.html',
                        controller: 'layoutCtrl',
                        controllerAs:'vmLayout',
                        resolve:
                        {
                            deps: $couchPotatoProvider.resolveDependencies([
                                'modules/layout/controllers/layoutCtrl',
                                'modules/auth/directives/loginInfo',
                                'modules/layout/directives/moduleSelector',
                                'modules/layout/controllers/fileUploadCtrl',
                                'modules/common/controllers/commonCodeMirrorDialogCtrl',
                                'modules/common/controllers/commonRepairDialogCtrl',
                                'modules/common/controllers/commonMetaDialogCtrl',
                                'modules/common/controllers/commonMetaEntryEditDialogCtrl',
                                'modules/common/directives/tables/mqaMetaDataGrid',
                                'modules/spe/controllers/speEligibilityChkDialogCtrl',
                                'modules/admin/services/adminDataSvc',
                                'modules/spe/services/speDataSvc',
                                'modules/layout/directives/mqaBigBreadcrumbs',
                                'modules/common/directives/ui/mqaCodeMirror',
                                'smartadmin/modules/graphs/directives/inline/sparklineContainer',
                                'smartadmin/modules/graphs/directives/inline/easyPieChartContainer'
                            ]),
                            cacheDataSvc: 'cacheDataSvc',
                            
                            cachePromise: function(cacheDataSvc)
                            {
                                return cacheDataSvc.initializeLists(false);
                            }
                        }
                    }
                }
            })
            .state("app.custom", {
                abstract: true,
                url: '/custom'
            });
        $urlRouterProvider.otherwise('/login');

    });

    module.run(function ($couchPotato) {
        module.lazy = $couchPotato;
    });

    return module;

});
