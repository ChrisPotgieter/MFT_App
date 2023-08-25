/*
 /// <summary>
 /// app.modules.auth.controllers - lockCtrl
 /// Controller to manage user Lock-out due to a session timeout
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/08/2017
 /// </summary>
 */
define(['modules/auth/module', 'lodash'], function (module, lodash)
{
    "use strict";
    module.registerController('lockCtrl', ['$scope', '$auth', '$log', '$timeout', 'uiSvc','userSvc', 'cacheDataSvc', function ($scope, $auth, $log, $timeout, uiSvc, userSvc, cacheDataSvc)
    {
        let _this = this;

        // create the functions
        _this.model = {};
        _this.functions = {};

        //<editor-fold desc="Form Management">
        _this.functions.initialize = function()
        {
            // routine to initialize the view
            _this.functions.setupEnvironment();

            // build up model variables
            _this.model.user = userSvc.getProfile();
            _this.model.flags = {inProgress: false}
            let company = lodash.find(cacheDataSvc.getCompanies(), {id: _this.model.user.companyId});
            _this.model.companyName = (company != null ) ? company.name : "";


            // setup BV  when this form loads
            $timeout(function()
            {
                _this.functions.setupBootstrapValidator();
            }, 500);
        };

        _this.functions.setupEnvironment = function()
        {
            // determine the splash screen information
            let returnObj = uiSvc.buildSplash();
            _this.model.splash = returnObj.splash;
            _this.model.buttonClass = returnObj.buttonClass;
            _this.model.product = returnObj.product;
        };


        _this.functions.handleError = function(err)
        {
            // routine to manage error handling
            $log.error("Unable to Manage Unlock", err);
        };

        _this.functions.setupBootstrapValidator = function ()
        {
            // routine to setup bootstrap validator for this form
            let form = $(document.getElementById('frmLock'));
            let fields = {
                fields: {
                    password: {
                        excluded: false,
                        container: "tooltip",
                        validators: {
                            notEmpty: {
                                message: 'The Login Password cannot be empty'
                            }
                        }
                    }
                }
            };
            let formOptions = lodash.merge({} ,fields, uiSvc.getFormNoFeedbackIcons());
            let fv = form.bootstrapValidator(formOptions).off('success.form.bv').on('success.form.bv', function(e)
            {
                // Prevent form submission
                e.preventDefault();
            });
            _this.form = form.data('bootstrapValidator');
        };
        //</editor-fold>

        //<editor-fold desc="Other Functions">
        _this.functions.login = function()
        {
            // routine to validate the login, refresh the token and take the user back to the last place they were at
            _this.model.flags.inProgress = true;
            if (_this.model.user.domain && _this.model.user.domain.startsWith("social_"))
            {
                let provider = _this.model.user.domain.replace("social_", "");
                $auth.authenticate(provider).then(function(res)
                {
                    userSvc.socialLogin(res.data.user, provider);
                }, _this.functions.handleError).finally(function()
                {
                    _this.model.flags.inProgress = false;
                });
            }
            else
            {
                // standard login
                let model = {user: _this.model.user.login, password: _this.model.password, companyId: _this.model.user.companyId, domain: _this.model.user.domain};
                userSvc.authenticate(model).then(function (response)
                {
                    if (response.error != null)
                        userSvc.showLoginError("Lock", response.error);
                    else
                    {
                        $auth.setToken(response.token);
                        userSvc.userLogin();
                    }
                }).catch(_this.functions.handleError).finally(function()
                {
                    _this.model.flags.inProgress = true;
                });
            }
        };
        _this.functions.logout = function()
        {
            // routine to login as a different user
            userSvc.logout(true);
        };

        //</editor-fold>

        _this.functions.initialize();

    }]);
});