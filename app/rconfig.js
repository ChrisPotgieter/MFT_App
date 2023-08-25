/*
 /// <summary>
 /// app - rconfig.js
 /// RequireJS configuration File
 /// Adapted from the Smart Admin Template
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/24/2014
 /// </summary>

 */
var require = {
    waitSeconds: 0,
    paths: {

        //<editor-fold desc="SmartAdmin - Third Party">
        // SmartAdmin Configuration

        'jquery': [
            '../plugin/jquery/dist/jquery.min'
        ],
        'jquery-ui': '../plugin/jquery-ui/jquery-ui',

        'bootstrap': '../plugin/bootstrap/dist/js/bootstrap.min',

        'angular': '../plugin/angular/angular',
        'angular-cookies': '../plugin/angular/angular-cookies',
        'angular-resource': '../plugin/angular/angular-resource',
        'angular-sanitize': '../plugin/angular/angular-sanitize',
        'angular-animate': '../plugin/angular/angular-animate',

        'domReady': '../plugin/requirejs-domready/domReady',

        'angular-ui-router': '../plugin/angular/angular-ui.router',

        'angular-google-maps': '../plugin/angular-google-maps/dist/angular-google-maps.min',

        'angular-bootstrap': '../plugin/angular-bootstrap/ui-bootstrap-tpls.min',

        'angular-couch-potato': '../plugin/angular-couch-potato/dist/angular-couch-potato',

        'angular-easyfb': '../plugin/angular-easyfb/angular-easyfb.min',
        'angular-google-plus': '../plugin/angular-google-plus/dist/angular-google-plus.min',

        'pace':'../plugin/pace/pace.min',

        'fastclick': '../plugin/fastclick/lib/fastclick',

        'jquery-color': '../plugin/jquery-color/jquery.color',

        'select2': '../plugin/select2/select2.min',

        'summernote': '../plugin/summernote/dist/summernote',

        'jsoneditor': '../plugin/jsoneditor/dist/jsoneditor',

        'codemirror': '../plugin/codemirror/lib/codemirror',
        'codemirror-xml': '../plugin/codemirror/mode/xml/xml',
        'codemirror-html': '../plugin/codemirror/mode/htmlmixed/htmlmixed',
        'codemirror-edi': '../plugin/codemirror/mode/edi/edi',
        'codemirror-js': '../plugin/codemirror/mode/javascript/javascript',
        'codemirror-format': '../plugin/codemirror/addon/format/format',
        'codemirror-fold': '../plugin/codemirror/addon/fold/foldcode',
        'codemirror-fold.gutter': '../plugin/codemirror/addon/fold/foldgutter',
        'codemirror-fold.indent': '../plugin/codemirror/addon/fold/indent-fold',
        'codemirror-fold.xml': '../plugin/codemirror/addon/fold/xml-fold',
        'codemirror-fold.comment': '../plugin/codemirror/addon/fold/comment-fold',
        'codemirror-fold.brace': '../plugin/codemirror/addon/fold/brace-fold',

        'beautify': '../plugin/js-beautify/js/lib/beautify',
        'beautify.html': '../plugin/js-beautify/js/lib/beautify-html',
        'beautify-css': '../plugin/js-beautify/js/lib/beautify-css',


        'he': '../plugin/he/he',
        'to-markdown': '../plugin/to-markdown/src/to-markdown',
        'markdown': '../plugin/markdown/lib/markdown',
        'bootstrap-markdown': '../plugin/bootstrap-markdown/js/bootstrap-markdown',

        'ckeditor': '../plugin/ckeditor/ckeditor',

        'moment': '../plugin/moment/moment-with-locales.min',
        'moment-timezone': '../plugin/moment-timezone/moment-timezone.min',
        'moment-holiday': '../plugin/moment-holiday/build/moment-holiday.min',
        

        'sparkline': '../plugin/relayfoods-jquery.sparkline/dist/jquery.sparkline.min',
        'easy-pie': '../plugin/jquery.easy-pie-chart/dist/jquery.easypiechart.min',

        'flot': '../plugin/flot/jquery.flot.min',
        'flot-resize': '../plugin/flot/jquery.flot.resize.min',
        'flot-selection': '../plugin/flot/jquery.flot.selection',
        'flot-fillbetween': '../plugin/flot/jquery.flot.fillbetween.min',
        'flot-orderBar': '../plugin/flot/jquery.flot.orderBar.min',
        'flot-pie': '../plugin/flot/jquery.flot.pie.min',
        'flot-time': '../plugin/flot/jquery.flot.time.min',
        'flot-tooltip': '../plugin/flot/jquery.flot.tooltip.min',
        'flot-spline':  '../plugin/flot/jquery.flot.spline',
        'flot-categories': '../plugin/flot/jquery.flot.categories.min',
        'flot-curved': '../plugin/flot/CurvedLines',
        'flot-tickrotor': '../plugin/flot/jquery.flot.tickrotor',

        'raphael': '../plugin/morris/raphael.min',
        'morris': '../plugin/morris/morris.min',

        'dygraphs': '../plugin/dygraphs/dygraph-combined-dev',

        'datatables': '../plugin/datatables/media/js/jquery.dataTables.min',
        'datatables.net': '../plugin/datatables/media/js/jquery.dataTables.min',
        'datatables-bootstrap': '../plugin/datatables-plugins/integration/bootstrap/3/dataTables.bootstrap',
        'datatables-buttons': '../plugin/datatables-plugins/dataTables.buttons.min',
        'datatables-colfilter': '../plugin/datatables-plugins/jquery.dataTables.columnFilter',


        'jqgrid':'../plugin/jqgrid/js/minified/jquery.jqGrid.min',
        'jqgrid-locale-en':'../plugin/jqgrid/js/i18n/grid.locale-en',


        'jquery-maskedinput': '../plugin/jquery-maskedinput/dist/jquery.maskedinput.min',
        'jquery-validation': '../plugin/jquery-validation/dist/jquery.validate.min',
        'jquery-form': '../plugin/jquery-form/jquery.form',

        'bootstrap-validator': '../plugin/bootstrapvalidator/dist/js/bootstrapValidator',

        'bootstrap-timepicker': '../plugin/bootstrap3-fontawesome-timepicker/js/bootstrap-timepicker.min',


        'clockpicker': '../plugin/clockpicker/dist/bootstrap-clockpicker.min',
        'nouislider': '../plugin/nouislider/distribute/jquery.nouislider.min',
        'ionslider': '../plugin/ion.rangeSlider/js/ion.rangeSlider.min',
        'bootstrap-duallistbox': '../plugin/bootstrap-duallistbox/dist/jquery.bootstrap-duallistbox.min',
        'bootstrap-colorpicker': '../plugin/bootstrap-colorpicker/js/bootstrap-colorpicker',
        'jquery-knob': '../plugin/jquery-knob/dist/jquery.knob.min',
        'bootstrap-slider': '../plugin/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
        'bootstrap-tagsinput': '../plugin/bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
        'x-editable': '../plugin/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min',
        // 'angular-x-editable': '../plugin/angular-xeditable/dist/js/xeditable.min',

        'fuelux-wizard': '../plugin/fuelux/js/wizard',

        'dropzone': '../plugin/dropzone/downloads/dropzone.min',

        'jcrop': '../plugin/jcrop/js/jquery.Jcrop.min',


        'bootstrap-progressbar': '../plugin/bootstrap-progressbar/bootstrap-progressbar.min',
        'jquery-nestable': '../plugin/jquery-nestable/jquery.nestable',

        'superbox': '../plugin/superbox/superbox.min',


        'jquery-jvectormap': '../plugin/vectormap/jquery-jvectormap-1.2.2.min',
        'jquery-jvectormap-world-mill-en': '../plugin/vectormap/jquery-jvectormap-world-mill-en',


        'lodash': '../plugin/lodash/dist/lodash.min',


        'magnific-popup': '../plugin/magnific-popup/dist/jquery.magnific-popup',
        //</editor-fold>

        //<editor-fold desc="SmartAdmin Modules">
        // SmartAdmin Changes
        'fullcalendar': '../plugin/smartadmin-plugin/fullcalendar/jquery.fullcalendar.min',
        'smartwidgets': '../plugin/smartadmin-plugin/smartwidgets/jarvis.widget.min',
        'notification': '../plugin/smartadmin-plugin/notification/SmartNotification.min',
        'modules/forms/module': './smartadmin/modules/forms/module',
        'modules/forms/common': './smartadmin/modules/forms/common',
        'modules/graphs/module': './smartadmin/modules/graphs/module',
        'modules/graphs/directives/flot/FlotConfig': './smartadmin/modules/graphs/directives/flot/FlotConfig',
        'modules/tables/module': './smartadmin/modules/tables/module',
        'modules/ui/module': './smartadmin/modules/ui/module',
        'modules/widgets/module': './smartadmin/modules/widgets/module',
        'layout/module': './smartadmin/modules/layout/module',


        //</editor-fold>

        //<editor-fold desc="Custom Plugins">
        'dygraphs-sync': '../plugin/dygraphs/dygraph-sync',
        'dygraphs-smooth': '../plugin/dygraphs/dygraph-smooth',
        'bootstrap-daterange-picker': '../plugin/bootstrap-daterangepicker/daterangepicker',
        'angular-ui-select': '../plugin/angular-ui/angular-ui-select',
        'd3': '../plugin/angular-nvd3/d3',
        'nv-d3': '../plugin/angular-nvd3/nv.d3',
        'angular-nvd3': '../plugin/angular-nvd3/angular-nvd3',

        'highcharts': '../plugin/angular-highcharts/highstock',
        'highcharts-export': '../plugin/angular-highcharts/exporting',
        'highcharts-canvas': '../plugin/angular-highcharts/canvas-tools',
        'highcharts-export-csv': '../plugin/angular-highcharts/export-csv',
        'angular-highcharts': '../plugin/angular-highcharts/highcharts-ng',

        'angular-morris': '../plugin/angular-morris/angular-morris-chart',

        'moment-humanize': '../plugin/moment/humanize-duration',
        'angular-easypie': '../plugin/angular-easypie/angular.easypiechart',
        'n3-pie': '../plugin/n3-pie/pie-chart',
        'socket-io': '../plugin/socket-io/socket-io',
        'globalize': '../plugin/devexpress/globalize.min',
        'jszip': '../plugin/kendo/jszip.min',
        'pako':'../plugin/kendo/pako_deflate.min',
        'kendo.all.min': '../plugin/kendo/kendo.all.min',
        'file-saver': '../plugin/file-saver/FileSaver',
        'satellizer': '../plugin/satellizer/satellizer',
	    'socket-io': '../plugin/socket-io-client/socket.io',
        'angular-summernote': '../plugin/angular-summernote/dist/angular-summernote',
        'angular-codemirror': '../plugin/angular-ui-codemirror/ui-codemirror',
        'angular-jsoneditor':'../plugin/ng-jsoneditor/ng-jsoneditor',

        // Chart JS
        'chart': '../plugin/angular-chart/Chart.bundle',
        'chartjs-datalabels': '../plugin/angular-chart/chartjs-plugin-datalabels.min',
        'angular-chartjs': '../plugin/angular-chart/angular-chart',


        'jquery-slimscroll': '../plugin/angular-slimscroll/jquery.slimscroll.min',
        'angular-slimscroll': '../plugin/angular-slimscroll/angular-slimscroll',
        'ng-fileupload': '../plugin/ng-file-upload/ng-file-upload',
        'ng-pageslide': '../plugin/angular-pageslide-directive/dist/angular-pageslide-directive',
        'angular-slideout': '../plugin/angular-slideout-panel/release/js/angular-slideout-panel.min',


        //Helly New plugin for Angular Datatable
        'angular-datatables':'../plugin/angular-datatables/dist/angular-datatables',
        'angular-datatables.bootstrap': '../plugin/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap',
        'angular-datatables.colreorder': '../plugin/angular-datatables/dist/plugins/colreorder/angular-datatables.colreorder',
        'angular-datatables.columnfilter': '../plugin/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter',
        'angular-datatables.light-columnfilter': '../plugin/angular-datatables/dist/plugins/light-columnfilter/angular-datatables.light-columnfilter',
        'angular-datatables.colvis': '../plugin/angular-datatables/dist/plugins/colvis/angular-datatables.colvis',
        'angular-datatables.fixedcolumns': '../plugin/angular-datatables/dist/plugins/fixedcolumns/angular-datatables.fixedcolumns',
        'angular-datatables.fixedheader': '../plugin/angular-datatables/dist/plugins/fixedheader/angular-datatables.fixedheader',
        'angular-datatables.scroller': '../plugin/angular-datatables/dist/plugins/scroller/angular-datatables.scroller',
        'angular-datatables.tabletools': '../plugin/angular-datatables/dist/plugins/tabletools/angular-datatables.tabletools',
        'angular-datatables.buttons': '../plugin/angular-datatables/dist/plugins/buttons/angular-datatables.buttons',
        'angular-datatables.select': '../plugin/angular-datatables/dist/plugins/select/angular-datatables.select',
        //</editor-fold>

        //<editor-fold desc="Application Configuration">
        // SmartAdmin Configuration
        'appCustomConfig':'../app.custom.config',
        'appConfig': '../app.config',
        //</editor-fold>

        //<editor-fold desc="App Modules">

        ']': 'includes'
        //</editor-fold>

    },
    shim: {
        'angular': {'exports': 'angular', deps: ['jquery']},

        'angular-animate': { deps: ['angular'] },
        'angular-resource': { deps: ['angular'] },
        'angular-cookies': { deps: ['angular'] },
        'angular-sanitize': { deps: ['angular'] },
        'angular-bootstrap': { deps: ['angular'] },
        'angular-ui-router': { deps: ['angular'] },
        'angular-google-maps': { deps: ['angular'] },

        'ng-fileupload': {deps: ['angular']},

        'ng-pageslide': {deps: ['angular']},

        'angular-couch-potato': { deps: ['angular'] },

        'socket.io': { deps: ['angular'] },

        'anim-in-out': { deps: ['angular-animate'] },
        'angular-easyfb': { deps: ['angular'] },
        'angular-google-plus': { deps: ['angular'] },

        'angular-slideout': {deps:['angular', 'jquery']},

        'select2': { deps: ['jquery']},

        'summernote': { deps: ['jquery']},

        'jsoneditor': {deps: ['jquery']},


        'to-markdown': {deps: ['he']},

        'bootstrap-markdown': { deps: ['jquery', 'markdown', 'to-markdown']},

        'ckeditor': { deps: ['jquery']},

        'moment': { exports: 'moment'},
        'moment-timezone': { deps: ['moment']},
        'moment-timezone-data': { deps: ['moment']},
        'moment-helper': { deps: ['moment-timezone-data']},
        'moment-holiday' : { deps: ['moment']},

        'flot': { deps: ['jquery']},
        'flot-resize': { deps: ['flot']},
        'flot-selection': {deps: ['flot']},
        'flot-fillbetween': { deps: ['flot']},
        'flot-orderBar': { deps: ['flot']},
        'flot-pie': { deps: ['flot']},
        'flot-time': { deps: ['flot']},
        'flot-spline': {deps: ['flot']},
        'flot-curved': {deps: ['flot']},
        'flot-tooltip': { deps: ['flot']},
        'flot-categories': { deps: ['flot']},
        'flot-tickrotor': {deps:['flot']},

        'morris': {deps: ['raphael']},

        'datatables':{deps: ['jquery']},
        'datatables.net':{deps: ['jquery']},
        'datatables-bootstrap': {deps: ['datatables']},
        'datatables-responsive': {deps: ['datatables']},
        'datatables-colfilter': {deps: ['datatables']},
        'datatables-buttons': {deps: ['datatables.net']},

        'codemirror': {deps:['jquery']},
        'codemirror-xml': {deps:['codemirror']},
        'codemirror-js': {deps:['codemirror']},
        'codemirror-html': {deps:['codemirror', 'codemirror-xml', 'codemirror-js']},
        'codemirror-format': {deps:['codemirror']},
        'codemirror-fold.gutter': {deps:['codemirror']},
        'codemirror-fold.indent': {deps:['codemirror']},
        'codemirror-fold.xml': {deps:['codemirror']},
        'codemirror-fold.comment': {deps:['codemirror']},
        'codemirror-fold.brace':  {deps:['codemirror']},
        'codemirror-fold': {deps:['codemirror', 'codemirror-fold.gutter', 'codemirror-fold.indent', 'codemirror-fold.xml', 'codemirror-fold.comment', 'codemirror-fold.brace']},

        'angular-datatables': {deps:[
            'angular-datatables.bootstrap',
            'angular-datatables.colreorder',
            'angular-datatables.columnfilter',
            'angular-datatables.light-columnfilter',
            'angular-datatables.colvis',
            'angular-datatables.fixedcolumns',
            'angular-datatables.fixedheader',
            'angular-datatables.scroller',
            'angular-datatables.tabletools',
            'angular-datatables.buttons',
            'angular-datatables.select'
        ]},

        'angular-datatables.colreorder': {deps:["angular"]},
        'angular-datatables.columnfilter':{deps:["datatables", "datatables-colfilter","angular"]},
        'angular-datatables.colvis':{deps:["angular"]},
        'angular-datatables.fixedcolumns':{deps:["angular"]},
        'angular-datatables.fixedheader':{deps:["angular"]},
        'angular-datatables.scroller':{deps:["angular"]},
        'angular-datatables.tabletools':{deps:["angular"]},
        'angular-datatables.buttons':{deps:["angular","datatables"]},
        'angular-datatables.select':{deps:["angular"]},
        'angular-datatables.light-columnfilter':{deps:["angular"]},
        'angular-datatables.bootstrap':{deps:["datatables", "datatables-bootstrap","angular"]},
        'jqgrid' : {deps: ['jquery']},
        'jqgrid-locale-en' : {deps: ['jqgrid']},

        'jquery-maskedinput':{deps: ['jquery']},
        'jquery-validation':{deps: ['jquery']},
        'jquery-form':{deps: ['jquery']},
        'jquery-color':{deps: ['jquery']},

        'jcrop':{deps: ['jquery-color']},

        'bootstrap-validator':{deps: ['jquery']},

        'bootstrap-timepicker':{deps: ['jquery']},
        'clockpicker':{deps: ['jquery']},
        'nouislider':{deps: ['jquery']},
        'ionslider':{deps: ['jquery']},
        'bootstrap-duallistbox':{deps: ['jquery']},
        'bootstrap-colorpicker':{deps: ['jquery']},
        'jquery-knob':{deps: ['jquery']},
        'bootstrap-slider':{deps: ['jquery']},
        'bootstrap-tagsinput':{deps: ['jquery']},
        'x-editable':{deps: ['jquery']},

        'fuelux-wizard':{deps: ['jquery']},
        'bootstrap':{deps: ['jquery']},

        'magnific-popup': { deps: ['jquery']},
        'modules-includes': { deps: ['angular']},
        'sparkline': { deps: ['jquery']},
        'easy-pie': { deps: ['jquery']},
        'jquery-jvectormap': { deps: ['jquery']},
        'jquery-jvectormap-world-mill-en': { deps: ['jquery']},

        'dropzone': { deps: ['jquery']},

        'bootstrap-progressbar': { deps: ['bootstrap']},


        'jquery-ui': { deps: ['jquery']},
        'jquery-nestable': { deps: ['jquery']},

        'superbox': { deps: ['jquery']},

        'notification': { deps: ['jquery']},

        'smartwidgets': { deps: ['jquery-ui']},


        //<editor-fold desc="Custom Plugins">
        'nv-d3': {deps:['d3']},
        'angular-nvd3': {deps:['angular', 'd3','nv-d3']},

        'bootstrap-daterange-picker': { deps: ['moment', 'jquery']},
        'angular-ui-select': {deps:['angular']},

        'highcharts': {deps:['jquery']},
        'highcharts-export': {deps:['jquery', 'highcharts']},
        'highcharts-canvas': {deps:['jquery', 'highcharts']},
        'highcharts-export-csv': {deps:['jquery', 'highcharts', 'highcharts-export', 'highcharts-canvas']},
        'angular-highcharts': {deps:['angular', 'jquery', 'highcharts', 'highcharts-export', 'highcharts-canvas', 'highcharts-export-csv']},

        'angular-summernote': {deps:['angular','summernote', 'jquery']},
        'angular-codemirror': {
            deps:['angular','codemirror', 'jquery'],
            init: function(angular, codemirror)
            {
                window.CodeMirror = codemirror;
            }
        },
        'angular-jsoneditor': {deps:['angular', 'jsoneditor', 'jquery']},

        'angular-easypie': {deps:['angular', 'jquery']},
        'n3-pie': {deps:['angular', 'd3']},
        'angular-morris': {deps:['angular', 'morris']},
        'dygraphs-sync': {deps:['dygraphs']},
        'dygraphs-smooth': {deps:['dygraphs']},
        'angular-chartjs': {deps:['chart','chartjs-datalabels','angular']},
        'jquery-slimscroll': {deps:['jquery']},
        'angular-slimscroll': {deps:['angular', 'jquery-slimscroll']},
        'globalize': {deps:['jquery']},
        'devexpress': {deps:['jquery','angular', 'angular-sanitize','jquery', 'globalize']},
        'kendo.all.min': {deps:['jquery', 'angular','jszip']},

        'satellizer': {deps:['angular']}
    
    },
    priority: [
        'jquery',
        'bootstrap',
        'angular',
        'angular-sanitize'
    ]
    /*

    packages:[{
        name:"codemirror",
        location:"../plugin/codemirror",
        main:"lib/codemirror"
    }]*/

};
