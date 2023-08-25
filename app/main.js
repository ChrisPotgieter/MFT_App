/*
 /// <summary>
 /// app - main.js
 /// AngularJS Bootstrapper for the UI
 /// Adapted from the SmartAdmin Template
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/25/2014
 /// </summary>

 */
// SmartAdmin Configuration
window.name = "NG_DEFER_BOOTSTRAP!";

define([
    'require',
    'jquery',
    'angular',
    'domReady',
    'appConfig',
    'appCustomConfig',

    //'pace',
    'bootstrap',
    'app',
    'includes'
], function (require, $, ng, domReady,appConfig) {
    'use strict';

    $.sound_path = appConfig.sound_path;
    $.sound_on = appConfig.sound_on;


    domReady(function (document) {
        ng.bootstrap(document, ['app']);
        ng.resumeBootstrap();
    });
});
