/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftMonitorLastRequest
 /// Directive to display the MFT V2 Monitor Last Request Information (XML and Meta Data)

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/10/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash', 'appCustomConfig'], function(module, lodash, appCustomConfig) {

    "use strict";
    module.registerDirective('mftMonitorLastRequest', [function()
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'='

            },
            controllerAs:'vmItem',
            templateUrl: "app/modules/mft_v2/directives/mftMonitorLastRequest.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.model = {meta: {data:[], options: {}}, cm:{}};
                //_this.model.meta.options = {propertyView: true};

                _this.functions = {};
                _this.functions.initView = function()
                {
                    // map the meta-data
                    _this.model.meta.data = [];
                    lodash.forOwn(_this.data.meta, function(value, key)
                    {
                        // determine the category
                        let mftMonitor = lodash.includes(["filesize", "filepath", "lastmodifiedtime", "lastmodifieddateutc", "lastmodifiedtimeutc", "currenttimestamputc", "currenttimestamp", "filename", "lastmodifieddate", "agentname"], key);
                        let category = mftMonitor ? "MFT Monitor" : "Custom";
                        if (key.startsWith("mqa"))
                            category = appCustomConfig.product.name + " Extensions";
                        _this.model.meta.data.push({key: key, value: value, category: category});
                    });

                    // map the last
                    _this.model.task = {data: {content: _this.data.task, contentType: "xml"}}
                };
                _this.functions.initView();
            }
        }
    }]);

});


