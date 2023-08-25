/*
 /// <summary>
 /// modules.boomi.directives - boomiAdmApiEdit
 /// Directive to Manage Capturing of Boomi Atomsphere API Details
 /// This will be invoked by the Boomi Module Configurator
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 18/07/2022
 /// </summary>
 */

define(['modules/boomi/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('boomiAdmApiEdit', ['$timeout', 'cacheDataSvc', 'uiSvc', function($timeout, cacheDataSvc, uiSvc) {

    return {
        restrict: 'E',
        templateUrl: 'app/modules/boomi/directives/boomiAdmApiEdit.tpl.html',
        scope:{},
        bindToController:{
            data:"=",
            validation:'='
        },
        controllerAs:'vmConfig',
        controller: function ($element, $scope)
        {
            let _this = this;
            _this.functions = {};
            _this.model = {};
            _this.functions.init  = function() {
                // routine to initialize the directive
                if (!_this.data)
                    return;

                // now setup the validator
                let txtAccountId = {
                    fields: {
                        txtAccount: {
                            excluded: false,
                            group: "#div_account",
                            validators: {
                                notEmpty: {
                                    message: 'The Account Cannot be Empty'
                                }
                            }
                        }
                    }
                };
                let txtAccountUser = {
                    fields: {
                        txtUser: {
                            excluded: false,
                            group: "#div_user",
                            validators: {
                                notEmpty: {
                                    message: 'The User Cannot be Empty'
                                }
                            }
                        }
                    }
                };
                let txtAccountPassword = {
                    fields: {
                        txtPassword: {
                            excluded: false,
                            group: "#div_password",
                            validators: {
                                notEmpty: {
                                    message: 'The Password Cannot be Empty'
                                }
                            }
                        }
                    }
                };


                let environmentSelector = {
                    fields:{
                        hiddenValidation: {
                            excluded: false,
                            feedbackIcons: false,
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field)
                                    {
                                        // check that we have at least one
                                        if (!_this.data.environment.prod && !_this.data.environment.test)
                                            return {valid: false, message: "At Least 1 Classification Must be Selected"};
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
                _this.fields = lodash.merge({}, txtAccountId, txtAccountUser, txtAccountPassword, environmentSelector);

                let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.fields);
                let form = $($($element).find("#frmBoomiAdmApiEdit")[0]);
                let fv = form.bootstrapValidator(formOptions).on('error.field.bv', function (e) {
                    if (_this.validation.onValidation) {
                        // call the validation function
                        _this.validation.onValidation(false);
                    }
                }).on("success.field.bv", function (e, data) {
                    if (_this.validation.onValidation) {
                        // call the validation function
                        _this.validation.onValidation(true);
                    }
                });
                _this.validation.bv = form.data('bootstrapValidator');

                // setup the validator watch
                $scope.$watch("vmConfig.validation.watchFlag", function(newValue, oldValue)
                {
                    if (!_this.validation.bv)
                        return;
                    switch (_this.validation.watchFlag.value) {
                        case 1:
                            // validate the form
                            _this.validation.bv.revalidateField("hiddenValidation");
                            _this.validation.bv.validate();
                            break;
                        case 2:
                            // revalidate the form
                            _this.validation.bv.resetForm();
                            _this.validation.bv.revalidateField("hiddenValidation");
                            _this.validation.bv.validate();
                            break;
                        default:
                    }
                }, true);
            };


            // watch for a data change
            $scope.$watch("vmConfig.data", function(newValue)
            {
                if (newValue)
                {
                    _this.data = newValue;
                }
            }, true);

            // setup a the bootstrap validator once the directive is rendered
            $timeout(function()
            {
                _this.functions.init();
            }, 200)

        }
    }
  }]);

});


