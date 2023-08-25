
/*
 /// <summary>
 /// modules.common.directives.ui - mqaAttachmentButton.js
 /// Common Directive to show Attachments as a Button Drop Down
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07/04/2021
 /// </summary>
 */

define(['modules/common/module', 'lodash',  'beautify', 'beautify.html', 'pako','codemirror', 'angular-codemirror', 'codemirror-edi', 'codemirror-fold', 'codemirror-xml', 'codemirror-js', 'codemirror-html'], function(module, lodash, beautify_json, beautify_html){
    "use strict";
    module.registerDirective('mqaAttachmentButton', ['$timeout', 'uiSvc', 'transactionReportingSvc', function($timeout, uiSvc, transactionReportingSvc)
    {
        return  {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/modules/common/directives/ui/mqaAttachmentButton.tpl.html',
            scope:{},
            bindToController: {
                data:"=",
                module:'@'
            },
            controllerAs:'vmAttachButton',
            controller: function ($scope)
            {
                var _this = this;
                _this.model = {};
                _this.model.data = null;

                // add the watch
                $scope.$watch("vmAttachButton.data", function(newValue, oldValue)
                {
                    // initialize the content type
                    if (oldValue == newValue)
                        return;
                    _this.model.data = newValue;
                });


                _this.functions = {};
                _this.functions.initializeWidget = function()
                {
                    // routine to initialize the widget
                    if (_this.data)
                        _this.model.data = _this.data;
                    _this.module = parseInt(_this.module);

                };
                _this.functions.viewDoc = function(id)
                {
                    if (!_this.data.module)
                        _this.data.module = 1000;
                    transactionReportingSvc.getAttachment(id,_this.module);
                };
                _this.functions.viewInLineDoc = function(data)
                {
                    transactionReportingSvc.viewInLineAttachment(data.id, data.format, _this.module, data.icon);
                };
                _this.functions.initializeWidget();
            }
        }
    }]);

});


