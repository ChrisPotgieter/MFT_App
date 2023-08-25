
/*
 /// <summary>
 /// modules.common.directives.ui - mqaCodeMirror.js
 /// Common Directive to Manage Viewing Content via Code Mirror
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/01/2020
 /// </summary>
 */

define(['modules/common/module', 'lodash',  'beautify', 'beautify.html', 'pako','codemirror', 'angular-codemirror', 'codemirror-edi', 'codemirror-fold', 'codemirror-xml', 'codemirror-js', 'codemirror-html'], function(module, lodash, beautify_json, beautify_html){
    "use strict";
    module.registerDirective('mqaCodeMirror', ['$timeout', 'uiSvc', function($timeout, uiSvc)
    {
    return  {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/modules/common/directives/ui/mqaCodeMirror.tpl.html',
        scope:{},
        bindToController: {
            data:"=",
            uiObject: "=?",
            readOnly:"@?",
            functionManager:'=?'
        },
        controllerAs:'vmEditor',
        controller: function ($scope)
        {
           var _this = this;
           _this.editor = null;
           _this.editor_options = {formatter: null, folding: -1};
           _this.model = {};
           _this.model.data = null;
           _this.model.options = {};
           _this.model.refreshFlag  = 0;
           if (!_this.readOnly)
               _this.readOnly = false;
           else
               _this.readOnly = (_this.readOnly === 'true');

            // add the watch
            $scope.$watch("vmEditor.data", function(newValue, oldValue)
            {
                // initialize the content type
                if (oldValue == newValue)
                    return;
                if (newValue && newValue.contentType)
                {
                    if (oldValue)
                    {
                        if (oldValue.contentType != newValue.contentType)
                            _this.functions.initializeOptions(newValue.contentType);
                    } else {
                        _this.functions.initializeOptions(newValue.contentType);
                    }
                }

                // set the content
                if (newValue && newValue.content)
                {
                    _this.functions.setData(newValue.content);
                }
            });


            // add the watch
            $scope.$watch("vmEditor.readOnly", function(newValue, oldValue)
            {
                // initialize the content type
                if (oldValue == newValue)
                    return;

                _this.model.options.readOnly =  (newValue === 'true');
                _this.model.refreshFlag += 1;
            });
            _this.functions = {};
            _this.functions.setData = function(data)
            {
                // routine to set the data and force a refresh
                var content = data;

                // format the data
                if (_this.editor_options.formatter != null)
                {
                    switch (_this.editor_options.formatter)
                    {
                        case "json":
                            content = beautify_json.js_beautify(data);
                            break;
                        case "html":
                            content = beautify_html.html_beautify(data);
                            break;
                    }
                }
                _this.model.data = content;
                _this.model.refreshFlag += 1;
            };
            _this.functions.initializeOptions = function(type)
            {
                // routine to change the code mirror options based on the type
                var options = {};
                switch (type.toLowerCase())
                {
                    case "csv":
                    case "txt":
                    case "text/plain":
                        options = {};
                        _this.editor_options.formatter = null;
                        _this.editor_options.folding = -2;
                        options = {mode: "text/plain"};
                        break;
                    case "edi":
                    case "application/edi":
                        options = {
                            theme: uiSvc.getTheme().codeMirror,
                            indentWithTabs: true,
                            mode: "edi"
                        };
                        _this.editor_options.formatter = null;
                        _this.editor_options.folding = -2;
                        break;
                    case "json":
                    case "application/json":
                        options = {
                            mode: {name: "javascript", json: true},
                            /*
                            foldOptions: {
                                widget: (from, to) => {
                                    var count = undefined;

                                    // Get open / close token
                                    var startToken = '{', endToken = '}';
                                    var prevLine = window.editor_json.getLine(from.line);
                                    if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
                                        startToken = '[', endToken = ']';
                                    }

                                    // Get json content
                                    var internal = window.editor_json.getRange(from, to);
                                    var toParse = startToken + internal + endToken;

                                    // Get key count
                                    try {
                                        var parsed = JSON.parse(toParse);
                                        count = Object.keys(parsed).length;
                                    } catch (e) {
                                    }

                                    return count ? `\u21A4${count}\u21A6` : '\u2194';
                                }
                            }
                             */
                        };
                        _this.editor_options.formatter = "json";
                        _this.editor_options.folding = 2;
                        break;
                    case "xml":
                    case "text/xml":
                        options = {
                            mode: "text/xml"
                        };
                        _this.editor_options.formatter = "html";
                        _this.editor_options.folding = 2;
                        break;
                }
                _this.model.options = lodash.merge(options, _baseCMOptions);
               _this.model.options.readOnly = _this.readOnly;
               _this.model.refreshFlag += 1;
            };


            _this.functions.loadCodeMirror = function(editor)
            {
                // routine to be called when code mirror is initialized
                _this.editor = editor;
                if (_this.uiObject != null)
                {
                    _this.uiObject = editor;

                    _this.uiObject.getContent = function()
                    {
                        return _this.model.data;
                    }

                    if (_this.functionManager != null && _this.functionManager.editorCreate)
                        _this.functionManager.editorCreate(editor);
                }


                // validate the form on edit
                $timeout(function ()
                {

                    _this.editor.setCursor({line: 0, ch: 0});
                    if (_this.editor_options.folding > -2 && _this.data.content != 'null')
                    {
                        if (_this.editor_options.folding == -1)
                            CodeMirror.commands.foldAll(_this.editor);
                        else
                            _this.editor.foldCode(CodeMirror.Pos(_this.editor_options.folding, 0));
                    }
                    _this.model.refreshFlag += 1;
                }, 50);
            };

            _this.functions.initializeWidget = function()
            {
                // routine to initialize the widget
                if (_this.data && !_this.data.contentType)
                    _this.data.contentType = "txt";

                _this.functions.initializeOptions(_this.data.contentType);
                if (_this.data && _this.data.content)
                    _this.functions.setData(_this.data.content);
           };
            var _baseCMOptions = {
                lineNumbers: true,
                lineWrapping: false,
                onLoad: _this.functions.loadCodeMirror,
                extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            };
            _this.functions.initializeWidget();
        }
    }
  }]);

});


