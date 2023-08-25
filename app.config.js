/*
 /// <summary>
 /// Base - app.config.js
 /// Javascript Application Configuration Settings - This is based on the Smart Admin Configuration
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/24/2014
 /// </summary>

 */
define(["appConfig", 'jquery'], function (appConfig,$) {
    'use strict';

    //region Smart Admin
    var appConfig = {};
    appConfig.version = "02.01.66b";

    appConfig.menu_speed = 200;
    appConfig.product = {name:"V2", company:"MQAttach"};
    appConfig.startRoute = "app.mft.dashboard";
    appConfig.smartSkin = "smart-style-0";

    appConfig.skins = [
        {name: "mqa-style-0",
            logo: "styles/img/custom/logo-white.png",
            class: "btn btn-xs btn-block txt-color-white margin-top-5",
            style: {'background-color': 'rgba(0, 0, 0, 0.9)', 'border': '1px solid rgb(0, 128, 128)'},
            label: "Black",
            kendo: "metroblack",
            codeMirror:"isotope",
            dashboard:{colors:["#779dcb", "#46c45c", "#ffa500", "#9748A0"], opacity: 0.7}},
        {name: "smart-style-0",
            logo: "styles/img/custom/logo.png",
            class: "btn btn-block btn-xs txt-color-white margin-right-5",
            style: {'background-color':'rgb(169,169,169)', border: '1px solid #696969'},
            label: "Steel",
            kendo: "bootstrap",
            codeMirror:"neat"},
        {name: "smart-style-1",
            logo: "styles/img/custom/logo-white.png",
            class: "btn btn-block btn-xs txt-color-white",
            style: {'background-color':'#3A4558'},
            label: "Dark Elegance",
            kendo: "flat",
            codeMirror:"neat"},

        {name: "smart-style-2",
            logo: "styles/img/custom/logo-blue.png",
            class: "btn btn-xs btn-block txt-color-darken margin-top-5",
            style: {'background-color':'#fff'},
            label: "Ultra Light",
            kendo:"fiori",
            codeMirror:"neat"},

        {name: "smart-style-3",
            logo: "styles/img/custom/logo-pale.png",
            class: "btn btn-xs btn-block txt-color-white margin-top-5",
            style: {'background-color':'#f78c40'},
            label: "Google Skin",
            kendo:"default",
            codeMirror:"neat"},

        {name: "smart-style-4",
            logo: "styles/img/custom/logo-pale.png",
            class: "btn btn-xs btn-block txt-color-white margin-top-5",
            style: {'background-color': '#5a8354', border: '1px solid #5a8354', 'color': '#17273D !important'},
            label: "Forest",
            kendo: "metro",
            codeMirror:"neat"}
        /*,

         {name: "smart-style-5",
         logo: "styles/img/custom/logo-pale.png",
         class: "btn btn-xs btn-block txt-color-white margin-top-5",
         style: {'background-color': 'rgba(153, 179, 204, 0.2)', 'border': '1px solid rgba(121, 161, 221, 0.8)', 'color': '#17273D !important'},
         label: "Glass",
         kendo: "highcontrast"}*/

    ];



    appConfig.sound_path = "sound/";
    appConfig.sound_on = true;


    /*
     * DEBUGGING MODE
     * debugState = true; will spit all debuging message inside browser console.
     * The colors are best displayed in chrome browser.
     */


    appConfig.debugState = false;
    appConfig.debugStyle = 'font-weight: bold; color: #00f;';
    appConfig.debugStyle_green = 'font-weight: bold; font-style:italic; color: #46C246;';
    appConfig.debugStyle_red = 'font-weight: bold; color: #ed1c24;';
    appConfig.debugStyle_warning = 'background-color:yellow';
    appConfig.debugStyle_success = 'background-color:green; font-weight:bold; color:#fff;';
    appConfig.debugStyle_error = 'background-color:#ed1c24; font-weight:bold; color:#fff;';


    appConfig.voice_command = true;
    appConfig.voice_command_auto = false;

    appConfig.voice_command_lang = 'en-US';
    /*
     *  Use localstorage to remember on/off (best used with HTML Version)
     */
    appConfig.voice_localStorage = false;

    /*
     * Voice Commands
     * Defines all voice command variables and functions
     */

    if (appConfig.voice_command) {

        appConfig.commands = {

            'show dashboard' : function() { window.location.hash = "dashboard" },
            'show inbox' : function() {  window.location.hash = "inbox/" },
            'show graphs' : function() {  window.location.hash = "graphs/flot" },
            'show flotchart' : function() { window.location.hash = "graphs/flot" },
            'show morris chart' : function() { window.location.hash = "graphs/morris" },
            'show inline chart' : function() { window.location.hash = "graphs/inline-charts" },
            'show dygraphs' : function() { window.location.hash = "graphs/dygraphs" },
            'show tables' : function() { window.location.hash = "tables/table" },
            'show data table' : function() { window.location.hash = "tables/datatable" },
            'show jquery grid' : function() { window.location.hash = "tables/jqgrid" },
            'show form' : function() { window.location.hash = "forms/form-elements" },
            'show form layouts' : function() { window.location.hash = "forms/form-templates" },
            'show form validation' : function() { window.location.hash = "forms/validation" },
            'show form elements' : function() { window.location.hash = "forms/bootstrap-forms" },
            'show form plugins' : function() { window.location.hash = "forms/plugins" },
            'show form wizards' : function() { window.location.hash = "forms/wizards" },
            'show bootstrap editor' : function() { window.location.hash = "forms/other-editors" },
            'show dropzone' : function() { window.location.hash = "forms/dropzone" },
            'show image cropping' : function() { window.location.hash = "forms/image-editor" },
            'show general elements' : function() { window.location.hash = "smartadmin/general-elements" },
            'show buttons' : function() { window.location.hash = "smartadmin/buttons" },
            'show fontawesome' : function() { window.location.hash = "smartadmin/icons/fa" },
            'show glyph icons' : function() { window.location.hash = "smartadmin/icons/glyph" },
            'show flags' : function() { window.location.hash = "smartadmin/icons/flags" },
            'show grid' : function() { window.location.hash = "smartadmin/grid" },
            'show tree view' : function() { window.location.hash = "smartadmin/treeview" },
            'show nestable lists' : function() { window.location.hash = "smartadmin/nestable-list" },
            'show jquery U I' : function() { window.location.hash = "smartadmin/jqui" },
            'show typography' : function() { window.location.hash = "smartadmin/typography" },
            'show calendar' : function() { window.location.hash = "calendar" },
            'show widgets' : function() { window.location.hash = "widgets" },
            'show gallery' : function() { window.location.hash = "gallery" },
            'show maps' : function() { window.location.hash = "gmap-xml" },
            'go back' :  function() { history.back(1); },
            'scroll up' : function () { $('html, body').animate({ scrollTop: 0 }, 100); },
            'scroll down' : function () { $('html, body').animate({ scrollTop: $(document).height() }, 100);},
            'hide navigation' : function() {
                if ($( ":root" ).hasClass("container") && !$( ":root" ).hasClass("menu-on-top")){
                    $('span.minifyme').trigger("click");
                } else {
                    $('#hide-menu > span > a').trigger("click");
                }
            },
            'show navigation' : function() {
                if ($( ":root" ).hasClass("container") && !$( ":root" ).hasClass("menu-on-top")){
                    $('span.minifyme').trigger("click");
                } else {
                    $('#hide-menu > span > a').trigger("click");
                }
            },
            'mute' : function() {
                appConfig.sound_on = false;
                $.smallBox({
                    title : "MUTE",
                    content : "All sounds have been muted!",
                    color : "#a90329",
                    timeout: 4000,
                    icon : "fa fa-volume-off"
                });
            },
            'sound on' : function() {
                appConfig.sound_on = true;
                $.speechApp.playConfirmation();
                $.smallBox({
                    title : "UNMUTE",
                    content : "All sounds have been turned on!",
                    color : "#40ac2b",
                    sound_file: 'voice_alert',
                    timeout: 5000,
                    icon : "fa fa-volume-up"
                });
            },
            'stop' : function() {
                smartSpeechRecognition.abort();
                $( ":root" ).removeClass("voice-command-active");
                $.smallBox({
                    title : "VOICE COMMAND OFF",
                    content : "Your voice commands has been successfully turned off. Click on the <i class='fa fa-microphone fa-lg fa-fw'></i> icon to turn it back on.",
                    color : "#40ac2b",
                    sound_file: 'voice_off',
                    timeout: 8000,
                    icon : "fa fa-microphone-slash"
                });
                if ($('#speech-btn .popover').is(':visible')) {
                    $('#speech-btn .popover').fadeOut(250);
                }
            },
            'help' : function() {

                $('#voiceModal').removeData('modal').modal( { remote: "app/modules/layout/partials/voice-commands.tpl.html", show: true } );
                if ($('#speech-btn .popover').is(':visible')) {
                    $('#speech-btn .popover').fadeOut(250);
                }

            },
            'got it' : function() {
                $('#voiceModal').modal('hide');
            },
            'logout' : function() {
                $.speechApp.stop();
                window.location = $('#logout > span > a').attr("href");
            }
        };
    };
    //endregion
    return appConfig;
});




