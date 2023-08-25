/*
 /// <summary>
 /// app.modules.transaction-reporting - module.js
 /// Transaction Reporting Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/5/2016
 /// </summary>
 */
define([
    'angular',
    'angular-couch-potato',
    'angular-ui-router',
    'angular-resource',
    'modules/common/module',
    'modules/spe/module',
    'modules/iib_v2/module',
    'modules/mft_v2/module',
    'modules/boomi/module'
], function (ng, couchPotato) {
    'use strict';

    var module = ng.module('app.mqatr', ['ui.router','ngResource','app.mqacommon', 'app.mqaspe', 'app.mqaiib_v2', 'app.mqamft_v2', 'app.mqaboomi', 'app.mqabridge']);
    couchPotato.configureApp(module);
    module.run(['$couchPotato',  function($couchPotato)
    {
        module.lazy = $couchPotato;
    }]);
    return module;
});