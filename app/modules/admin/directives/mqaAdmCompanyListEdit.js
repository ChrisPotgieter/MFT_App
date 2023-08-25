/*
 /// <summary>
 /// modules.admin.directives - mqaAdmGroupsEdit.js
 /// Administration Module Directive to Manage CRUD Operations of Company List Items
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 26/02/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function (module, lodash) {
    "use strict";

    module.registerDirective('mqaAdmCompanyListEdit', ['$timeout', 'uiSvc', function ($timeout, uiSvc) {
        return {
            restrict: 'E',

            templateUrl: "app/modules/admin/directives/mqaAdmCompanyListEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs) {

                // setup the bootstrap validator
                var codeTxt = {
                    fields: {
                        code: {
                            excluded: false,
                            group: "#div_code",
                            validators: {
                                notEmpty: {
                                    message: 'Identifier is Required'
                                },
                                callback: {
                                    message: 'This Identifier already exists',
                                    callback: function (value, validator, $field) {
                                        if ($scope.editRow.isNew == false) return true;
                                        var found = lodash.find($scope.$parent.vm.model.gridData, {code: value})
                                        if (found) {
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
                var descTxt = {
                    fields: {
                        description: {
                            excluded: false,
                            group: "#div_desc",
                            validators: {
                                notEmpty: {
                                    message: 'The Description cannot be empty'
                                }
                            }
                        }
                    }
                };

                var fields = lodash.merge(codeTxt, descTxt);
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);

                var fv = form.bootstrapValidator(formOptions);
                $scope.validation = form.data("bootstrapValidator");

                // setup the title
                if ($scope.editRow.isNew)
                {
                    $scope.buttonText = "Create";
                    $scope.headingText = "Add Entry";
                }
                else {
                    $scope.buttonText = "Save";
                    $scope.headingText = "Edit Entry";
                    $timeout(function () {
                        $scope.validation.validate();

                    }, 500);
                }


                var confirmDelete = function (ButtonPressed)
                {
                    if (ButtonPressed == "Yes")
                    {
                        $scope.deleteRecord();
                    }
                };

                $scope.userDelete = function (editRow)
                {
                    // routine to confirm deletion of of the row
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Entry <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Entry ? ", '[No][Yes]', confirmDelete)
                };

                $scope.onSave = function()
                {
                    // validate that the form is correct before saving
                    $scope.validation.validate();
                    var valid = $scope.validation.isValid();
                    if (valid)
                        $scope.saveRecord();
                };

            }
        }

    }]);

});

