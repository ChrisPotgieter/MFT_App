/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardADUserCtrl.js
 /// Controller to manage Company Wizard - Administration User Selection - Active Directory
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mohammed Helly
 /// Date: 02/02/2017
 /// Reworked for Stablility By: Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */
define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

	"use strict";

	module.registerController('companyWizardADAdminUserCtrl', ['$scope', '$timeout', '$element', '$log', 'uiSvc','adminDataSvc',  function ($scope, $timeout, divElement, $log, uiSvc, adminDataSvc)
    {

	    // setup the form
        var bootValidatorOptions = {
            fields: {
                emailAddress: {
                    excluded: false,
                    group: "#div_email",
                    validators: {
                        notEmpty: {
                            message: 'The email address cannot be empty'
                        },
                        emailAddress:
                            {
                                message: 'The email address is not valid'
                            }
                    }
                },
                departments: {
                    excluded: false,
                    group: '#div_depts',
                    validators: {
                        callback: {
                            message: 'User must be assigned to at least 1 Department',
                            callback: function (value, validator, $field)
                            {
                                return ($scope.vm.model.adminUser.departments.length >  0)
                            }
                        }
                    }
                },
                name: {
                    group: '#div_login',
                    excluded: false,
                    validators: {
                        notEmpty: {
                            message: 'Name cannot be Empty'
                        }
                    }
                },
                loginCode: {
                    group: '#div_login',
                    excluded: false,
                    validators: {
                        notEmpty: {
                            message: 'Login Code cannot be Empty'
                        }
                    }
                }

            }
        };

        var field_validation = function(isError)
        {
            // custom validation processing - nothing to do here as bootstrapvalidator will handle everything
        };

        var form_validation = function()
        {
            // validate the form
            $scope.vm.functions.validateForm();
        };


        var updateFunction = function()
        {
            // function to run when in non-new company mode and we want to update the database directly
        };

        var selectADUser = function(dataObject)
        {
            // routine to change the form when the user has selected another user from the AD selection table
            if (dataObject.emailAddress == null || dataObject.emailAddress == "") {
                dataObject.emailAddress = "";
                $scope.inputEmail = true;
            }
            else
                $scope.inputEmail = false;
            if (!dataObject.departments)
                dataObject.departments = [];
            $scope.vm.model.adminUser = dataObject;

            // now revalidate all the fields
            $timeout(function()
            {
                $scope.vm.state.step.validator.revalidateField('emailAddress');
                $scope.vm.state.step.validator.revalidateField('name');
                $scope.vm.state.step.validator.revalidateField('loginCode');
            }, 500);

        };


        $scope.checkDepts = function()
        {
            // routine to revalidate the field on bv when the departments changes
            $scope.vm.state.step.validator.revalidateField('departments');
        };


        $scope.buildUserList = function()
        {
            // routine to rebuild the user selection list when the domain changes
            var domain = lodash.find($scope.vm.model.domains, {domain: $scope.domainSelect});
            adminDataSvc.getADUsers(domain).then(function(result)
            {
                $scope.adUsers = result;
            }).catch(function(err)
            {
                $log.error("Unable to retrieve a List of AD Users", err);
            });

        };

        $scope.initialize = function()
        {
            // routine to initialize the screen
            $scope.inputEmail = false;
            $scope.adUsers = [];
            if ($scope.vm.model.domains.length == 1)
            {
                $scope.domainSelect = $scope.vm.model.domains[0].domain;
                $scope.buildUserList();
            }

            // build up the department list
            $scope.departments = [];
            $scope.departments = lodash.map($scope.vm.model.departmentNames, function(name, index)
            {
                return {id: index, name: name};
            });
        };

        $scope.$on('$viewContentLoaded', function()
        {

            // when the DOM has loaded initialize BV
            $timeout(function()
            {
                var formElement = $(divElement).first();
                $scope.vm.functions.stepContentLoaded(formElement);
            }, 500);
        });



        // initialize the form
        $scope.adminUserGridOptions = {
            sortable: true,
            groupable: true,
            filterable: true,
            pageable: {
                pageSizes: true
            },
            dataSource: {
                data: [],
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        uid: "id",
                        fields: {
                            id: {type: "number"},
                            userId: {type: "string"},
                            name: {type: "string"},
                            emailAddress: {type: "string"},
                            domain: {type: "string"}
                        }
                    }
                }
            },

            columns: [
                {
                    field: "id",
                    title: "Id",
                    hidden: true
                },
                {
                    field: 'name',
                    title: 'Name'
                },
                {
                    field: 'emailAddress',
                    title: 'Email Address'
                },
                {
                    field: 'userId',
                    title: 'Login Code',
                    template: function(dataItem)
                    {
                        if (dataItem.domain && dataItem.domain != "")
                            return dataItem.domain + "\\" + dataItem.userId;
                        else
                            return dataItem.userId;
                    }

                }

            ],
            dataBound: function (e)
            {
                var grid = this;
                uiSvc.dataBoundKendoGrid(grid,  selectADUser);
            }
        }

        $scope.vm.functions.initializeStep(bootValidatorOptions, field_validation, updateFunction, form_validation, null);
        $scope.initialize();
    }]);
});
