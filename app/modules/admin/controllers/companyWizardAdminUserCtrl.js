/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardADUserCtrl.js
 /// Controller to manage Company Wizard - Administration User Selection - Non-Active Directory
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By: Mac Bhyat
 /// Date: 11/07/2020
 /// </summary>
 */
define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

	"use strict";

	module.registerController('companyWizardAdminUserCtrl', ['$scope', '$timeout', '$element',  'uiSvc', function ($scope, $timeout, divElement, uiSvc)
    {
        var _this = this;
        _this.functions = {};
        _this.functions.onFieldValidated = function(isError)
        {
            // tell the wizard that the form has changed

            $scope.$parent.vm.state.form.hasChanged = true;
        };
        _this.functions.getValidator = function ()
        {
            // routine to return the validator for this form
            return _this.validation.validator;
        };
        _this.functions.validateForm = function()
        {
            // routine to validate the form
            _this.validation.validator.revalidateField("hiddenDept");
            _this.validation.validator.validate();
            var valid = _this.validation.validator.isValid();
            if (!valid)
                $scope.$parent.vm.state.form.flag = uiSvc.formStates.INVALID;
            else
            {
                $scope.$parent.vm.model.adminUser = _this.data.record;
                $scope.$parent.vm.state.form.flag = uiSvc.formStates.VALID;
            }
        };
        // initialize the step
        $scope.$on('$viewContentLoaded', function()
        {
            // when the DOM has loaded initialize BV
            $timeout(function()
            {
                var formElement = $(divElement).first();
                $scope.$parent.vm.functions.stepContentLoaded(formElement);
            }, 500);
        });


        _this.functions.initialize = function()
        {
            // routine to initialize the screen
            $scope.$parent.vm.functions.initializeStep(null, _this.functions.getValidator, null, _this.functions.validateForm);

            // build up the department list
            _this.data = {record:  $scope.$parent.vm.model.adminUser};
            if (!_this.data.record)
                _this.data.record = {departments:[], roles:[]};
            if (!_this.data.departments)
                _this.data.record.departments = [];
            if (!_this.data.roles)
                _this.data.record.roles = [];
            _this.data.departments = [];
            _this.data.departments = lodash.map($scope.$parent.vm.model.departmentNames, function(name, index)
                {
                    return {id: index, name: name};
                });

            _this.data.roles = [];
            _this.data.users = [];
            _this.data.flags = {allowRoles: false, allowUserId: true, adUser: false};
            _this.validation = {validator:{}, onValidation:_this.functions.onFieldValidated}
        };
        _this.functions.initialize();
    }]);
});
