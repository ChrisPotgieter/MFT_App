/*
 /// <summary>
 /// modules.common.directives.tree - mqaTableViewWidget.js
 /// Standard Table Display Directive to display Striped Tables that are searchable as a Smart Admin Widget
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 3/4/2016
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    'use strict';

    module.registerDirective('mqaTableViewWidget', function () {
        return {
            restrict: 'E',
            scope: {
                itemTemplateName: '@',
                title:'@',
                headers: '=',
                rows: '=',
                footers:'=',
                widgetId:'@',
                ondrill:'&'
            },
            templateUrl: "app/modules/common/directives/tables/mqaTableViewWidget.tpl.html"
        }
    });
});


