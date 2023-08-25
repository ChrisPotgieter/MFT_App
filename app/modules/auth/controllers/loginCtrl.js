/*
 /// <summary>
 /// app.modules.auth.controllers - loginCtrl
 /// Controller to manage user Sign-In
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 17/08/2017
 /// </summary>
 */
define(['modules/auth/module', 'lodash'], function (module, lodash)
{
    "use strict";
    module.registerController('loginCtrl', ['$scope', '$auth', '$log', '$timeout','uiSvc','userSvc', 'cacheDataSvc', 'cachePromise', function ($scope, $auth, $log, $timeout, uiSvc, userSvc, cacheDataSvc, cachePromise)
    {
        let _this = this;
        _this.model = {credentials:{}, splash:{}, flags: {allowSocial: false, allowRegister: false, inProgress: false}};

        // create the functions
        _this.functions = {};

        //<editor-fold desc="Form Management">
        _this.functions.initialize = function()
        {
            // routine to initialize the view after the cache has been read
            userSvc.logout(false);
            _this.functions.setupEnvironment();

            _this.model.companies = cacheDataSvc.getCompanies();

            // get the default company
            _this.model.credentials.company = lodash.find(_this.model.companies, {default: true});
            if (_this.model.credentials.company == null)
                _this.model.credentials.company = lodash.find(_this.model.companies, {id: 2});
            if (_this.model.credentials.company == null)
                _this.model.credentials.company = _this.model.companies[0];

            // clear out any token
            $auth.removeToken();

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
            $log.error("Unable to Manage Sign-In", err);
        };


        _this.functions.setupBootstrapValidator = function ()
        {
            // routine to setup bootstrap validator for this form
            let form = $(document.getElementById('frmLogin'));
            let fields = {
                fields: {
                    loginCode: {
                        excluded: false,
                        group: "#div_login",
                        validators: {
                            notEmpty: {
                                message: 'Login Code cannot be empty'
                            }
                        }
                    },
                    password: {
                        excluded: false,
                        group: "#div_password",
                        validators: {
                            notEmpty: {
                                message: 'The Login Password cannot be empty'
                            }
                        }
                    },
                    company_select: {
                        excluded: false,
                        group: "#div_companySelect",
                        validators: {
                            callback: {
                                message: 'Company is Mandatory',
                                callback: function (value, validator, $field)
                                {
                                    const valid = _this.model.credentials.company != null;
                                    return valid;
                                }
                            }
                        }
                    },
                    domain_select: {
                        excluded: false,
                        group: "#div_domainSelect",
                        validators: {
                            callback: {
                                message: 'Domain is Mandatory',
                                callback: function (value, validator, $field)
                                {
                                    const valid = _this.model.credentials.domain != null;
                                    return valid;
                                }
                            }
                        }
                    }
                }
            };
            let formOptions = lodash.merge({} ,fields, uiSvc.getFormNoFeedbackIcons());
            let fv = form.bootstrapValidator(formOptions).on('success.form.bv', function(e)
            {
                // Prevent form submission
                e.preventDefault();
            });
            _this.form = form.data('bootstrapValidator');

            // select the first company in the list
            _this.functions.onCompanyChange();
        };
        //</editor-fold>


        //<editor-fold desc="Other Functions">
        _this.functions.login = function()
        {
            // routine to authenticate - non social media
            if (_this.form)
            {
                _this.form.revalidateField("company_select");
                _this.form.revalidateField("domain_select");
                _this.form.validate();
                let valid = _this.form.isValid();
                if (!valid)
                    return;
            }

            let model = {user: _this.model.credentials.user, password: _this.model.credentials.password, companyId: _this.model.credentials.company.id};
            if (_this.model.credentials.domain)
                model.domain = _this.model.credentials.domain.domain;
            _this.model.flags.inProgress = true;
            userSvc.authenticate(model).then(function (response)
            {
                // see if there is an error
                if (response.error != null)
                    userSvc.showLoginError("Sign-In", response.error);
                else
                {
                    $auth.setToken(response.token);
                    userSvc.userLogin(response, model);
                }
            }).catch(_this.functions.handleError).finally(function()
            {
                _this.model.flags.inProgress = false;

            });
        };

        _this.functions.socialLogin = function(provider)
        {
            // routine to authenticate via the social media
            const config = $auth.getConfig({name: provider});
            config.state = encodeURIComponent(JSON.stringify({"companyId": _this.model.credentials.company.id, "domain": _this.model.credentials.domain}));
            $auth.authenticate(provider).then(function(profile)
            {
                userSvc.socialLogin(profile, provider);
            }, _this.functions.handleError);

        };

        _this.functions.onCompanyChange = function()
        {
            // on the selection of a company select the domain (if there is only 1 and revalidate)
            let currentCompany = _this.model.credentials.company;
            let isDomainEnabled = currentCompany && currentCompany.active_directory_domains && currentCompany.active_directory_domains.length > 0;
            if (isDomainEnabled)
            {
                // enable the domain validation
                if (_this.form)
                    _this.form.enableFieldValidators("domain_select", true);

                // set the variables
                _this.model.credentials.company = currentCompany;
                _this.model.credentials.domain = currentCompany.active_directory_domains[0];

            }
            else
            {
                _this.model.credentials.domain = null;
                if (_this.form)
                    _this.form.enableFieldValidators("domain_select", false);
            }
        };

        //</editor-fold>

        _this.functions.initialize();
    }]);
});