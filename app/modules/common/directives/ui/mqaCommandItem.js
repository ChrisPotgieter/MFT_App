/*
 /*
 /// <summary>
 /// modules.common.directives - mqaCommandItem.js
 /// Common Command Item directive to manage scope and display a Command Item
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 6/15/2015
 /// </summary>
 */
define(['modules/common/module', 'lodash'], function (module, lodash) {
    "use strict";

    module.registerDirective('mqaCommandItem', ['$filter', function ($filter) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                data: '=',
            },
            controllerAs: 'vmItem',
            templateUrl: "app/modules/common/directives/ui/mqaCommandItem.tpl.html",
            controller: function ($element, $scope) {

                var _this = this;

                _this.model = _this.data;

                _this.functions = {};
                _this.functions.calculateAlert = function (dataObject)
                {
                    // routine to calculate the alert information based on the outcome provided
                    switch (dataObject.outcome)
                    {
                        case 0:
                            dataObject.alert = "success";
                            dataObject.icon = "fa fa-info-circle";
                            dataObject.message = "Execution Completed Successfully";
                            break;
                        default:
                            dataObject.alert = "danger";
                            dataObject.icon = "fa fa-exclamation-circle";
                            dataObject.message = "Execution Failed";
                            break;
                    }
                };
                _this.functions.initView = function () {
                    // determine the base icon and type
                    switch (_this.data.command_type) {
                        case 1:
                            _this.model.icon = "icon-apache";
                            _this.model.title = "ANT Script";
                            break;
                        case 2:
                            _this.model.icon = "icon-nginx-alt";
                            _this.model.title = "Mainframe JCL";
                            break;
                        case 3:
                            _this.model.icon = "icon-java";
                            _this.model.title = "ITX Launcher";
                            break;
                        default:
                            _this.model.icon = "icon-shell";
                            _this.model.title = "OS Executable";
                            break;
                    }
                    _this.model.isError = _this.data.resultObject.outcome > 0;

                    // work out the result icons
                    _this.functions.calculateAlert(_this.model.resultObject);

                    lodash.forEach(_this.model.results, function (result) {
                        _this.functions.calculateAlert(result);
                    });
                };
                _this.functions.initView();
            }
        }
    }]);
});


