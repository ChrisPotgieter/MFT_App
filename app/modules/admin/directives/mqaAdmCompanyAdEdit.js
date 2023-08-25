/*
 /// <summary>
 /// modules.admin.directives - mqaAdmCompanyAdEdit.js
 /// Administration Module Directive to Manage Active Directory Capture
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 12/02/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash','bootstrap-validator'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmCompanyAdEdit', ['$timeout','$log','uiSvc', 'adminDataSvc', function($timeout, $log, uiSvc, adminDataSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmCompanyAdEdit.tpl.html",
        replace: true,
        link: function($scope, form, attrs)
        {
            // setup the bootstrap validator
            var fields = {
                fields: {
                    domain: {
                        excluded: false,
                        group:"#div_domain",
                        validators: {
                            notEmpty: {
                                message: 'Domain cannot be empty'
                            },
                            callback:
                                {
                                    message: 'Domain already already exists on this Company',
                                    callback: function (value, validator, $field) {
                                        var found = lodash.find($scope.vm.model.domains, function(dataObject)
                                        {
                                            return (dataObject.domain === value && $scope.isNew);
                                        });
                                        if (found) {
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                        }
                    },
                    host: {
                        excluded: false,
                        group:"#div_host",
                        validators: {
                            notEmpty: {
                                message: 'Host cannot be empty'
                            }
                        }
                    },
                    nameString: {
                        excluded: false,
                        group:"#div_nameString",
                        validators: {
                            notEmpty: {
                                message: 'Distinguished Name cannot be empty'
                            }
                        }
                    },
                    searchString: {
                        excluded: false,
                        group:"#div_searchString",
                        validators: {
                            notEmpty: {
                                message: 'User Search Criteria cannot be empty'
                            }
                        }
                    },
                    ldapLogin: {
                        excluded: false,
                        group:"#div_ldapLogin",
                        validators: {
                            notEmpty: {
                                message: 'LDAP Login cannot be empty'
                            }
                        }
                    },
                    ldapPassword: {
                        excluded: false,
                        group:"#div_ldapPassword",
                        validators: {
                            notEmpty: {
                                message: 'LDAP Password cannot be empty'
                            }
                        }
                    }
                }
            };
            var formOptions = lodash.merge({}, {submitButtons: 'button[id="submit"]'}, uiSvc.getFormValidateOptions(), fields);
            var fv = form.bootstrapValidator(formOptions).on('error.field.bv', function(e)
            {
                $scope.bv.disableSubmitButtons(false);
            }).on("success.field.bv", function (e, data)
            {
                $scope.bv.disableSubmitButtons(false);
            });
            $scope.bv = form.data('bootstrapValidator');


            var confirmDelete = function(ButtonPressed)
            {
                // routine to handle the delete request from the user
                if (ButtonPressed == "Yes")
                {
                    $scope.deleteRecord();
                };
            };

            if ($scope.newRecord)
            {
                $scope.buttonText = "Create";
                $scope.headingText = "Add Role";
            }
            else
            {
                $scope.buttonText = "Save";
                $scope.headingText = "Edit Role";
            };

            $scope.saveChanges = function()
            {
                $scope.bv.validate();
                var valid = $scope.bv.isValid();
                if (!valid)
                {
                    $timeout(function()
                    {
                        $scope.bv.disableSubmitButtons(false);
                    }, 500);
                    return;
                }

                // now check if the AD is actually valid
                adminDataSvc.validateADConnection($scope.editRow).then(function(result)
                {
                    // now save the record
                    $scope.saveRecord();
                }).catch(function(err)
                {
                    $log.error("Could not validate the Active Directory Domain",err);
                });

            };
            $scope.userDelete = function()
            {
                // routine to confirm deletion of of the row
                var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Active Directory Domain <span style='color:white'>" + $scope.editRow.domain + "</span> ?";
                uiSvc.showSmartAdminBox(html,"Are you sure you want to delete this Domain ? ",'[No][Yes]',confirmDelete)
            };
        }
    }
  }]);

});


