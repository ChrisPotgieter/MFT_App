/*
 /// <summary>
 /// app - includes.js
 /// RequireJS Include File for bootstrapping components required for Application Layout
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/25/2014
 /// </summary>

 */

define([


    //<editor-fold desc="SmartAdmin Layout Components">
    //<editor-fold desc="Layout">
    'smartadmin/modules/layout/actions/minifyMenu',
    'smartadmin/modules/layout/actions/toggleMenu',
    'smartadmin/modules/layout/actions/fullScreen',
    'smartadmin/modules/layout/actions/resetWidgets',
    'smartadmin/modules/layout/actions/resetWidgets',
    'smartadmin/modules/layout/actions/searchMobile',
    'smartadmin/modules/layout/directives/demo/demoStates',
    'smartadmin/modules/layout/directives/smartInclude',
    'smartadmin/modules/layout/directives/smartDeviceDetect',
    'smartadmin/modules/layout/directives/smartFastClick',
    'smartadmin/modules/layout/directives/smartLayout',
    'smartadmin/modules/layout/directives/smartSpeech',
    'smartadmin/modules/layout/directives/smartRouterAnimationWrap',
    'smartadmin/modules/layout/directives/smartFitAppView',
    'smartadmin/modules/layout/directives/radioToggle',
    'smartadmin/modules/layout/directives/dismisser',
    'smartadmin/modules/layout/directives/smartMenu',
    'smartadmin/modules/layout/directives/bigBreadcrumbs',
    'smartadmin/modules/layout/directives/stateBreadcrumbs',
    'modules/layout/directives/mqaPageTitle',
    'smartadmin/modules/layout/directives/hrefVoid',
    'smartadmin/modules/layout/service/SmartCss',
    'smartadmin/modules/graphs/directives/vectormap/vectorMap',



    //</editor-fold>
    //<editor-fold desc="Components">
    'smartadmin/modules/forms/directives/input/smartDatepicker',
    'smartadmin/modules/forms/directives/input/smartSpinner',
    'smartadmin/modules/ui/directives/smartJquiDialog',
    'smartadmin/modules/ui/directives/smartJquiDialogLauncher',
    //</editor-fold>


    //<editor-fold desc="Widgets">
    //'modules/widgets/module',
    'smartadmin/modules/widgets/directives/widgetGrid',
    'smartadmin/modules/widgets/directives/jarvisWidget',
    //</editor-fold>

    //<editor-fold desc="Other Modules">
    'smartadmin/modules/graphs/module',
   'smartadmin/modules/forms/module',
   'smartadmin/modules/ui/module',
   'smartadmin/modules/tables/module',
    //</editor-fold>
    //</editor-fold>

    //<editor-fold desc="System Layout Components">
    //<editor-fold desc="Language Selection">
    'components/language/Language',
    'components/language/languageSelector',
   'components/language/language-controller',
    //</editor-fold>



    // take this out
    'components/todo/models/Todo',
    'components/todo/directives/todoList',
    'components/calendar/models/CalendarEvent',
    'components/calendar/directives/fullCalendar',
    'components/calendar/directives/dragableEvent',


    //</editor-fold>

    //<editor-fold desc="Modules">
    'modules/common/module',
    'modules/layout/module',
    'modules/admin/module',
    'modules/transaction-reporting/module',
    'modules/auth/module',
    'modules/spe/module',
    'modules/bridge/module',
    'modules/install/module',
    'modules/iib_v2/module',
    //</editor-fold>

    //<editor-fold desc="Custom Modules">
    'modules/custom/hcnspe/module',
    'modules/custom/spe_cno/module',
    //</editor-fold>



    //<editor-fold desc="Common Services">
    'modules/common/services/apiSvc',
    'modules/common/providers/apiProvider',
    'modules/common/providers/socketProvider',    
    'modules/auth/services/userSvc',
    'modules/common/services/cacheDataSvc',
    'modules/common/services/chartSvc',
    'modules/common/services/uiSvc',
    'modules/common/services/socketIOSvc',
    'modules/common/services/transactionReportingSvc',
    'modules/common/services/dashboardSvc',
    'modules/admin/services/adminDataSvc',
    //</editor-fold>

    //<editor-fold desc="User Notification and Upload"
    'modules/auth/directives/mqaNotificationToggle',
    'modules/auth/controllers/notificationListCtrl',
    //</editor-fold>

    //<editor-fold desc="Filters">
    'modules/common/filters/formatFilters',
    'modules/transaction-reporting/filters/transactionFilters',
    //</editor-fold>


    //<editor-fold desc="3rd Party Directives">
     'modules/common/directives/input/dateRangePicker',
    ///</editor-fold>

    //<editor-fold desc="Custom Directives">
    //'modules/common/directives/angular-overrides/ngTransclude',

    'modules/common/directives/input/mqaList',
    'modules/common/directives/input/mqaCombo',
    'modules/common/directives/input/mqaTag',
    'modules/common/directives/input/mqaSpinner',
    'modules/common/directives/input/mqaJqDatePicker',
    'modules/common/directives/input/mqaJqDateRangePicker',
    'modules/common/directives/ui/mqaCommandItem',
    'modules/common/directives/graphs/mqaSparkline',
    'modules/common/directives/tree/mqaTreeView',
    'modules/common/directives/tables/mqaTableView',
    'modules/common/directives/tables/mqaTableViewWidget',
    'modules/common/directives/tables/mqaTableCounts',
    'modules/common/directives/graphs/mqaMorrisPieCounts',
    'modules/common/directives/graphs/mqaFlotLine',
    'modules/common/directives/graphs/mqaFlotBar',
    'modules/common/directives/graphs/mqaEasyPie',
    'modules/common/directives/angular-overrides/mqaAnchorDisable',
    'modules/common/directives/angular-overrides/ngHtmlCompile',
    'modules/auth/directives/mqaRoleSecurity',
    'modules/common/directives/input/mqaDeptCombo',
    'modules/common/directives/ui/mqaWidgetUserSaveButton',
    'modules/common/directives/ui/mqaUserMenuOption',
    'modules/common/directives/input/mqaSwitch',
    'modules/common/directives/ui/mqaProgressDialog',
    'modules/common/directives/tables/mqaKendoGrid',
    'modules/common/directives/tables/mqaMetaDataGrid',
    'modules/common/directives/tables/mqaDynamicTableGrid',
    'modules/common/directives/ui/mqaDynamicTableDashboardList',
    'modules/common/directives/graphs/mqaChartjs',
    'modules/common/directives/ui/mqaDashboardCount',
    //</editor-fold>

], function () {
    'use strict';
});
