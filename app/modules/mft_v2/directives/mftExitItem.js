/*
 /// <summary>
 /// app.modules.mft_v2.directives - mftExitItem
 /// Directive to display the MFT V2 Exit Item (Monitor and Transaction)

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/mft_v2/module', 'lodash'], function(module, lodash) {

    "use strict";
    module.registerDirective('mftExitItem', ['mftv2DataSvc', function(mftv2DataSvc)
    {
        return {
            restrict: 'E',
            scope:{},
            bindToController:{
                data:'=',
            },
            controllerAs:'vmItem',
            templateUrl: "app/modules/mft_v2/directives/mftExitItem.tpl.html",
            controller: function($element, $scope)
            {

                var _this = this;

                _this.model = {nodes: undefined};

                _this.functions = {};
                _this.functions.initView = function()
                {
                    // setup the model
                    _this.model.isError = _this.data.result > 0;
                    _this.model.icon = "icon-java";
                    _this.model.type = "Java Class";
                    _this.model.name = _this.data.name;
                    _this.model.result  = _this.data.result;

                    // check for an mqa exit
                    if (_this.model.name.startsWith("class mqa."))
                    {
                        _this.model.icon = "icon-mfizz";
                        _this.model.type = "MQAttach Exit";

                        // parse the supplemental to break things down
                        if (_this.data.supplemental != null && angular.isArray(_this.data.supplemental))
                        {

                            // filter out nodes that blank and with a 0 return code
                            _this.model.nodes = lodash.filter(_this.data.supplemental, function(row)
                            {
                                if (row.supplemental != '')
                                    return true;
                                return (row.supplemental != '' || row.return_code > 0);
                            });
                            if (_this.model.nodes > 0)
                                _this.model.supplementalType = 1;

                            lodash.forEach(_this.model.nodes, function (exitLine)
                            {
                                 exitLine.background = exitLine.return_code > 0 ? "bg-color-red" : "bg-color-blue";
                                 exitLine.icon = "icon-java";
                            });

                        }
                    }
                    else
                    {
                        // normal exit
                        if (_this.data.supplemental)
                        {
                            _this.model.standardError = _this.data.supplemental.standardError;
                            _this.model.standardOutput = _this.data.supplemental.standardOutput;
                        }
                        if (!_this.model.isError && _this.model.standardError != null)
                            _this.model.isError = true;
                    }
                };

                _this.functions.showInstructionDialog = function (dataItem)
                {
                    // routine to show the instruction dialog for the given data item
                    mftv2DataSvc.showMftExitInstructionDialog(dataItem);
                };
                _this.functions.initView();
            }
        }
    }]);

});


