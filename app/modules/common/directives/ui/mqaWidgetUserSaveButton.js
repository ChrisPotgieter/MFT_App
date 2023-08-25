
/*
 /// <summary>
 /// modules.common.directives.ui - mqaWidgetUserSaveButton.js
 /// Directive to Manage Saving of User Settings of a Attached Widget
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 16/01/2018
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('mqaWidgetUserSaveButton', ['$rootScope','$compile','$templateCache', '$timeout', '$log', '$state', '$stateParams', 'userSvc','uiSvc', function($rootScope, $compile, $templateCache, $timeout, $log, $state, $stateParams, userSvc, uiSvc){
    return {
        restrict: 'E',
        templateUrl: 'app/modules/common/directives/ui/mqaWidgetUserSaveButton.tpl.html',
        scope:{},
        bindToController:{
            toggleFlag:'=',
            caption:'@',
            onSave:'&'

        },
        controllerAs:'vmUserSave',
        controller: function ($element, $scope)
        {
            var _this = this;

            // first thing lets preload the widget-body with the save dialog
            var template = $templateCache.get("mqaWidgetUserSaveDialog.tpl.html");
            var widgetBody = $($($element).parent().parent().find(".widget-body")[0]);
            var innerForm = null;
            if (widgetBody != null)
            {
                var linkFn = $compile(template);
                var content = linkFn($scope);
                widgetBody.prepend(content);
                innerForm = $($(widgetBody).find("#frmSaveSettings")[0]);
            }

            _this.flags = {allowEntry: true};
            _this.functions = {};
            _this.functions.invokeMenuRefresh = function()
            {
                // routine to emit a menu refresh instruction to tell the menu system that
                // the user has changed something
                $rootScope.$broadcast("usermenu-rebuild");

                _this.functions.onCancel();

            };
            _this.functions.saveRecord = function()
            {
                // routine to validate the form and return the view model to post to the server
                bv.validate();
                var isValid = bv.isValid();
                if (!isValid)
                    return null;

                // now create a post model that will be returned
                var stateSettings = $state.current.data.settings;
                var postModel = angular.copy(_this.data.config);
                postModel.companyId = userSvc.getOrgInfo().companyId;
                postModel.settingType = stateSettings.type;

                // update the area
                switch(parseInt(postModel.areaType))
                {
                    case 0:
                        postModel.area = 21;
                        postModel.code = "default_" + stateSettings.code;
                        break;
                    case 1:
                        postModel.area = 20;
                        postModel.code = "default_" + stateSettings.code;
                        break;
                    case 3:
                        postModel.area = 20;
                        postModel.code = stateSettings.code;
                        break;
                    default:
                        postModel.area = 21;
                        postModel.code = stateSettings.code;
                        break;
                }
                postModel.lastUserId = userSvc.getProfile().id;
                if (postModel.area == 1)
                    postModel.userId = postModel.lastUserId;

                // send this to the save method to update the info and the type
                if (_this.onSave)
                    _this.onSave()(postModel);

                // return
                return postModel;
            };
            _this.functions.onSave = function()
            {
                // validate the form and call the save function and persist the settings
                var postModel = _this.functions.saveRecord();
                if (postModel == null)
                    return;

                // now post to the server
                postModel.id = parseInt($stateParams.settingId);
                postModel.recordStatus = 0;
                userSvc.saveUserTemplate(postModel).then(function(result)
                {
                    uiSvc.showExtraSmallPopup("User Templates", _this.caption + " Update Successful !", 5000);
                    _this.functions.invokeMenuRefresh();
                    _this.functions.redirect(result);
                }).catch (function(err)
                {
                    $log.error("Unable to Update User Template Definition", err);
                });
            };

            _this.functions.onSaveAs = function()
            {
                // routine to manage the save as function
                var postModel = _this.functions.saveRecord();
                if (postModel == null)
                    return;

                // now post to the server
                postModel.recordStatus = 1;
                userSvc.saveUserTemplate(postModel).then(function(result)
                {
                    uiSvc.showExtraSmallPopup("User Templates", _this.caption + " Insert Successful !", 5000);
                    _this.functions.invokeMenuRefresh();
                    _this.functions.redirect(result);

                    // navigate the user to the new view

                }).catch (function(err)
                {
                    $log.error("Unable to Insert User Template Definition", err);
                });
            };

            _this.functions.onUserDelete = function()
            {
                // routine to confirm deletion of of the record
                var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Setting <span style='color:white'>" + _this.data.config.description + "</span> ?";
                uiSvc.showSmartAdminBox(html,"Are you sure you want to delete Custom Report " + _this.caption + "? ",'[No][Yes]', _this.functions.onDelete);
            };


            _this.functions.onDelete = function(ButtonPressed)
            {
                // routine to confirm deletion of of the record
                if (ButtonPressed == "Yes") {
                    var postModel = _this.functions.saveRecord();
                    if (postModel == null)
                        return;
                    userSvc.deleteUserTemplate(postModel.id).then(function () {
                        uiSvc.showExtraSmallPopup("User Templates", _this.caption + " Delete Successful !", 5000, 6000, "#C46A69", "fa-trash shake animated");

                        _this.functions.invokeMenuRefresh();

                        // redirect the user to the default report
                        _this.functions.redirect({id: 0})

                        // navigate the user to the default view
                    }).catch(function (err)
                    {
                        $log.error("Unable to Delete User Template Definition", err);
                    });
                }
            };

            _this.functions.onCancel = function()
            {
                _this.toggleFlag = false;
            };

            _this.functions.redirect = function(saveResult)
            {
                // routine to redirect the user to this setting when they have saved the report
                // or adjusted it it any way
                _this.functions.onCancel();


                // now redirect the user to the new setting
                 let reloadState = userSvc.getReloadState($state.current.data.settings.reloadState);
                $state.go($state.current.name, {settingId: saveResult.id}, {notify: true, reload: reloadState})
            };

            _this.functions.onToggle = function()
            {
                // toggle the flag
                _this.toggleFlag = !_this.toggleFlag;
            };

            _this.functions.calcAreaType = function ()
            {
                // routine to work out the correct area type

                _this.data.config.areaType = 2; // private
                if ($stateParams.settingId && _this.data.config.area)
                {
                    if (_this.data.config.code.startsWith("default"))
                    {
                        if (_this.data.config.area == 21)
                            _this.data.config.areaType = 0;
                        else
                            _this.data.config.areaType = 1;
                    }
                    else
                    {
                        if (_this.data.config.area == 20)
                            _this.data.config.areaType = 3;
                        else
                            _this.data.config.areaType = 2;
                    }
                }
            };

            // based on the current state setup the data
            _this.data = {};
           _this.data.config = angular.copy(userSvc.getUserTemplate($stateParams.settingId, $state.current.data.settings));
            var initialRecord = lodash.merge({},_this.data.config);


            _this.flags.allowEntry = !initialRecord.code.startsWith("default_");
            _this.flags.allowEntry = true;

            // update the area type
            _this.functions.calcAreaType();

            // setup the bootstrap validator
            var bv = null;
            var setupBV = function ()
            {
                // routine to setup bootstrap validator for this form
                var description = {
                    fields: {
                        description: {
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Description is Mandatory'
                                },
                                callback: {
                                    callback: function (value, validator, $field)
                                    {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
                var formOptions = lodash.merge({}, description, uiSvc.getFormNoFeedbackIcons());
                var fv = innerForm.bootstrapValidator(formOptions);
                bv = innerForm.data('bootstrapValidator');
            };
            // setup BV  when this form loads
            $timeout(function()
            {
                if (innerForm != null)
                    setupBV();
            }, 500);

        }
    }
}]);

});

