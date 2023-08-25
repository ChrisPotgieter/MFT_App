/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftTransactionItem
 /// Directive to display the MFT V2 Transaction Item

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module'], function(module) {

    "use strict";
    module.registerDirective('mftTransactionItem', [function()
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
            },
            controllerAs:'vmItem',
            templateUrl: "app/modules/mft_v2/directives/mftTransactionItem.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;
                _this.model = {result: _this.data.result, mode: _this.data.mode};

                _this.functions = {};
                _this.functions.initView = function()
                {
                    // setup the models
                    if (_this.data.supplemental)
                        _this.model.supplemental = _this.data.supplemental;

                    // setup the source
                    _this.model.source = {type: _this.data.source_type, resource: _this.data.source_resource, info: null, options: null};
                    if (_this.data.source_info)
                        _this.model.source.info = _this.data.source_info;
                    if (_this.data.source_options)
                        _this.model.source.options = _this.data.source_options;

                    // setup the destination
                    _this.model.destination = {type: _this.data.destination_type, resource: _this.data.destination_resource, info: null, options: null};
                    if (_this.data.destination_info)
                        _this.model.destination.info = _this.data.destination_info;
                    if (_this.data.destination_options)
                        _this.model.destination.options = _this.data.destination_options;
                };
                _this.functions.initView();
            }
        }
    }]);

});


