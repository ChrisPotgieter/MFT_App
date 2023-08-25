/*
 /// <summary>
 /// modules.admin.directives - mqaAdmCompanyUserEdit
 /// Common Module Directive to Manage Company User Profile Editing for Non AD Users
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/07/2020
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function(module, lodash)
{
  "use strict";
    module.registerDirective('mqaAdmCompanyUserEdit', [, 'uiSvc', function(uiSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmCompanyUserEdit.tpl.html",
        replace: true,
        scope: {
            model:'=',
            validation:'='
        },

        link: function ($scope, form, attrs)
        {

            $scope.functions = {};

            // setup bootstrap validator
            var fields = {
                fields: {
                    userId: {
                        excluded: false,
                        group: "#div_userId",
                        validators: {
                            notEmpty: {
                                message: "Login is Required"
                            },
                            regexp: {
                                regexp:"^[a-zA-Z0-9_.]{3,}$",
                                message:"Login must contain no spaces or special characters and must be a minimum of 3"
                            },

                            callback: {
                                message: 'Login  Already Exists',
                                callback: function (value, validator, $field) {
                                    var found = lodash.find($scope.model.users, function (record)
                                    {
                                        return (record.userId.toUpperCase() === value.toUpperCase() && record.recordStatus != uiSvc.editModes.DELETE && ($scope.model.record.rowId != record.rowId));
                                    });
                                    if (found)
                                    {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    userPassword: {
                        excluded: false,
                        group: "#div_userPassword",
                        validators: {
                            notEmpty: {
                                message: "Password is Required"
                            },
                        }
                    },
                    emailAddress: {
                        excluded: false,
                        group: "#div_email",
                        validators: {
                            notEmpty: {
                                message: 'The Email Address cannot be empty'
                            },
                            emailAddress: {
                                message: 'Invalid Email Address'
                            }
                        }
                    },
                    name: {
                        excluded: false,
                        group: "#div_name",
                        validators: {
                            notEmpty: {
                                message: 'Name is Required'
                            },
                        }
                    },
                    hiddenDept: {
                        excluded: false,
                        validators: {
                            callback: {
                                message: 'At least One Department is Required',
                                callback: function (value, validator, $field)
                                {
                                    var valid = ($scope.model.record.departments.length ) > 0;
                                    return valid;
                                }
                            }
                        }
                    },
                    hiddenRole: {
                        excluded: !$scope.model.flags.allowRoles,
                        validators: {
                            callback: {
                                message: 'At least One Role is Required',
                                callback: function (value, validator, $field)
                                {
                                    var valid = ($scope.model.record.roles.length ) > 0;
                                    return valid;
                                }
                            }
                        }
                    }
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
            var fv = form.bootstrapValidator(formOptions).on('error.field.bv', function (e)
            {
                if ($scope.validation.onValidation)
                {
                    // call the validation function
                    $scope.validation.onValidation(false);
                }
            }).on("success.field.bv", function (e, data)
            {
                if ($scope.validation.onValidation)
                {
                    // call the validation function
                    $scope.validation.onValidation(true);
                }
            });
            $scope.validation.validator = form.data('bootstrapValidator');


            // add the functions
            $scope.functions.checkRoles = function()
            {
                // routine to validate the roles and update the objects
                $scope.validation.validator.revalidateField('hiddenRole');
            };

            $scope.functions.checkDepartments = function ()
            {
                // routine to invoke validation with the selection changes
                $scope.validation.validator.revalidateField('hiddenDept');
            };
        }
    }
  }]);

});

