/*
 /// <summary>
 /// app - app.js
 /// Angular Startup Configuration for the UI
 /// Adapted from the SmartAdmin Template
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/25/2014
 /// </summary>

 */
'use strict';

define([
    'angular',
    'angular-couch-potato',
    'appCustomConfig',
    'appConfig',
    'angular-ui-router',
    'angular-animate',
    'angular-bootstrap',
    'angular-sanitize',
    'angular-ui-select',
    'smartwidgets',
    'notification',
    'satellizer'
], function (ng, couchPotato, appCustomConfig, appConfig) {

    var app = ng.module('app', [
        //<editor-fold desc="Angular Dependencies">
        'ngSanitize',

        'scs.couch-potato',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'ui.select',
        'satellizer',
        //</editor-fold>

        //<editor-fold desc="SmartAdmin Dependencies">

        'app.layout',
        'app.graphs',
        'app.tables',
        'app.forms',
        'app.ui',
        'app.widgets',
        //</editor-fold>

        // TODO Define Application Dependencies here
        //<editor-fold desc="Application Dependencies">
        'app.mqacommon',
        'app.mqainstall',
        'app.mqaauth',    
        'app.mqalayout',
        'app.mqatr',
        'app.mqamft_v2',
        'app.mqabridge',
        'app.mqaadmin',
        'app.mqaiib_v2',
        'app.mqaspe',
        'app.mqaboomi',
        'app.mqacustom.hcnspe',
        'app.mqacustom.spe_cno'
        //</editor-fold>
    ]);

    couchPotato.configureApp(app);

    app.config(function ($provide, $httpProvider, uiSelectConfig, $authProvider) {


        // setup the ui-config theme
        uiSelectConfig.theme = 'select2';


        // Intercept http calls.
        $provide.factory('ErrorHttpInterceptor', function ($q) {
            var errorCounter = 0;
            function notifyError(rejection)
            {
                // check if this is an authorization issue
                if (rejection.status == 401 && (rejection.data && rejection.data.jwt))
                    return;
                console.error("http_error=", rejection);
                if (rejection.status == -1)
                {
                    rejection.status = "503";
                    rejection.statusText = "Service Unavailable";
                    var parser = document.createElement('a');
                    parser.href = rejection.config.url;
                    rejection.data = "Please confirm that the following Web Server is running <br/>" + parser.protocol+"://" + parser.hostname + ":" + parser.port;
                };

                $.bigBox({
                    title: rejection.status + ' ' + rejection.statusText,
                    content: rejection.data,
                    color: "#C46A69",
                    icon: "fa fa-warning shake animated",
                    number: ++errorCounter,
                    timeout: 6000
                });
            }

            return {
                // On request failure
                requestError: function (rejection) {
                    // show notification
                    notifyError(rejection);

                    // Return the promise rejection.
                    return $q.reject(rejection);
                },

                // On response failure
                responseError: function (rejection) {
                    // show notification
                    notifyError(rejection);
                    // Return the promise rejection.
                    return $q.reject(rejection);
                }
            };
        });

        // Add the interceptor to the $httpProvider.
        $httpProvider.interceptors.push('ErrorHttpInterceptor');

        // setup the JWT system using satellizer
        var url = appCustomConfig.node + "/api";
        $authProvider.loginUrl = url + "/auth/login";
        $authProvider.signupUrl = url + "/auth/register";
        $authProvider.storageType = "sessionStorage"; 
        
        // setup the google auth
        $authProvider.google({
            clientId: '610174683133-373abhkhq1kdirq894qlqhlch2qq0rae.apps.googleusercontent.com',
            url: url + '/auth/google',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: window.location.origin,
            requiredUrlParams: ['scope'],
            optionalUrlParams: ['display'],
            scope: ['profile', 'email'],
            scopePrefix: 'openid',
            scopeDelimiter: ' ',
            display: 'popup',
            type: '2.0',
            popupOptions: { width: 452, height: 633 }
        });
        $authProvider.linkedin({
            clientId: "77l0l4zvvymrmu",
            url: url + '/auth/linkedin',
            authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
            redirectUri: window.location.origin,
            requiredUrlParams: ['state'],
            scope: ['r_emailaddress', 'r_basicprofile'],
            scopeDelimiter: ' ',
            state: 'STATE',
            type: '2.0',
            popupOptions: { width: 527, height: 582 }
        });
    });

    app.run(function ($couchPotato, $rootScope, $state, $stateParams) {
        app.lazy = $couchPotato;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        // editableOptions.theme = 'bs3';
    });

    return app;
});
