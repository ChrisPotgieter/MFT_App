/*
 /// <summary>
 /// app.modules.common.directives.input - mqaFilterEntry
 /// Directive to Manage Selection of Filter Entries in various system components
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 25/09/2020
 /// </summary>
 */

define(['modules/common/module'], function (module) {

    "use strict";
    module.registerDirective('mqaFilterEntry', ['$timeout', '$uibModal', 'uiSvc',  function($timeout, $uibModal, uiSvc)
    {

        return {
            restrict: 'E',
            templateUrl: "app/modules/common/directives/input/mqaFilterEntry.tpl.html",
            replace: true,
            controllerAs:'vmFilterCapture',
            bindToController:{
                data:'=',
                keyOptions:'=',
                icon:'@',
                title:'@',
                functionManager:'=?',
                options:'=?'
            },
            controller: function($element, $scope)
            {
                var _this = this;
                _this.functions = {};
                _this.model = { data: _this.data, title: _this.title, icon: _this.icon, keyOptions: _this.keyOptions, flags: {allowClear: false, allowRefresh: false}};

                // decode the options
                if (_this.options) {
                    _this.model.flags.allowClear = _this.options.allowClear;
                    _this.model.flags.allowRefresh = _this.options.allowRefresh;
                }

                if (!_this.functionManager)
                    _this.functionManager  = {};


                //<editor-fold desc="Functions">
                _this.functions.clear = function()
                {
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear Filter ?";
                    uiSvc.showSmartAdminBox(html,"Are you sure you want to Clear Current Meta-Data Filters ? ",'[No][Yes]', _this.functions.confirmClear);

                };
                _this.functions.confirmClear = function (ButtonPressed) {
                    // routine to handle the delete request from the user
                    if (ButtonPressed == "Yes")
                    {
                        _this.model.data.length = 0;
                        _this.functions.updateSummary();

                        _this.functions.refresh();

                    }
                };

                _this.functions.refresh = function()
                {
                    // check the function manager
                    if (_this.functionManager && _this.functionManager.onMetaFilterChange != null)
                        _this.functionManager.onMetaFilterChange(_this.model);
                };


                _this.functions.updateSummary = function()
                {
                    // routine to initialize the row Id's upon load of this directive
                    _this.model.summary = _this.model.data.length + " " + _this.model.title + " Filters";
                };
                _this.functions.showDialog = function(record)
                {
                    // routine to bring up the editing dialog

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/modules/common/partials/common-filter-list-dialog.tpl.html',
                        controller: 'commonFilterListDialogCtrl',
                        controllerAs: 'vmListDialog',
                        backdrop: 'static',
                        size:'lg',
                        resolve:
                            {
                                dialogData: _this.model
                            }
                    });
                    modalInstance.result.then(function (result)
                    {
                        // update the data object with the result from the dialog
                        _this.model.data = result;
                        _this.functions.updateSummary();

                        // close the dialog
                        modalInstance.close();

                        // check for a refresh
                        _this.functions.refresh();

                    }, function ()
                    { });
                };
                //</editor-fold>


                // initialize the directive
                _this.functions.updateSummary();
            }
        }
    }]);


});
