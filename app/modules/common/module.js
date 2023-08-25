/*
 /// <summary>
 /// app.modules.common - module.js
 /// Common Module Bootstrapper
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/27/2014
 /// </summary>
 */

define(['angular',
    'angular-couch-potato', 'jszip', 'kendo.all.min', 'angular-slideout','bootstrap-validator', 'lodash', 'angular-highcharts', 'n3-pie', 'angular-morris', 'angular-chartjs', 'angular-datatables', "angular-datatables.bootstrap", "angular-easypie", "angular-slimscroll", "ng-fileupload", 'angular-summernote', 'angular-codemirror', 'angular-jsoneditor', 'ng-pageslide'], function(ng, couchPotato, jszip, kendo, slideout){

    var module = angular.module('app.mqacommon', ['highcharts-ng', 'n3-pie-chart', 'kendo.directives', 'angular.morris-chart', 'chart.js', 'datatables', 'datatables.bootstrap', "easypiechart", "ui.slimscroll", "ngFileUpload", "summernote", 'ui.codemirror', 'ng.jsoneditor', "pageslide-directive", "angular-slideout-panel" ]);

    couchPotato.configureApp(module);

    // remove the original ng-transclude and replace with the custom one until angular implements this
    /*
    module.config(['$provide', function($provide) {
        $provide.decorator('ngTranscludeDirective', ['$delegate', function($delegate) {
            // Remove the original directive
            $delegate.shift();
            return $delegate;
        }]);
    }]);
    */

    // override the kendo show method to accomodate a before show event
    kendo.ui.Tooltip.fn._show = function (show) {
        return function (target) {
            if (typeof this.options.beforeShow === "function") {
                var e = {
                    sender: this,
                    target: target,
                    
                    preventDefault: function () {
                        this.isDefaultPrevented = true;
                    }
                }

                this.options.beforeShow.call(this, e);

                if (!e.isDefaultPrevented) {
                    // only show the tooltip if preventDefault() wasn't called..
                    show.call(this, target);
                }
            }
        };
    }(kendo.ui.Tooltip.fn._show);

    // override the kendo position resize to avoid the zoom issue
    //https://docs.telerik.com/kendo-ui/knowledge-base/grid-column-resize-not-working-in-chrome
    kendo.ui.Grid.prototype._positionColumnResizeHandle= function()
    {
        var that = this,
            indicatorWidth = that.options.columnResizeHandleWidth,
            lockedHead = that.lockedHeader ? that.lockedHeader.find("thead:first") : $();

        that.thead.add(lockedHead).on("mousemove" + ".kendoGrid", "th", function (e) {
            var th = $(this);
            if (th.hasClass("k-group-cell") || th.hasClass("k-hierarchy-cell")) {
                return;
            }
            that._createResizeHandle(th.closest("div"), th);
        });
    };


    module.run(function($couchPotato){
        module.lazy = $couchPotato
    });

    return module;
});