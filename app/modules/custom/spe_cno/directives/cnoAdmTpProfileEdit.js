/*
 /// <summary>
 /// modules.custom.spe_cno - cnoAdmTpProfileEdit.js
 /// CNO Administration Module Directive to Manage CRUD Operations of Trading Partner Profiles
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/03/2018
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function (module, lodash) {
    "use strict";

    module.registerDirective('cnoAdmTpProfileEdit', ['$timeout', 'uiSvc', function ($timeout, uiSvc) {
        return {
            restrict: 'E',

            templateUrl: "app/modules/custom/spe_cno/directives/cnoAdmTpProfileEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs) {

                // setup the bootstrap validator
                var bvOptions = {
                    fields: {
                        code: {
                            excluded: false,
                            group: "#div_code",
                            validators: {
                                notEmpty: {
                                    message: 'TIN Number cannot be Empty'
                                },
                                regexp: {
                                    regexp: /^(?:\d{3}-\d{2}-\d{4}|\d{2}-\d{7})|\d{9}$/,
                                    message: "TIN Number must be a valid Tax Number"
                                },
                                callback: {
                                    message: 'This TIN Number already exists',
                                    callback: function (value, validator, $field) {
                                        if ($scope.editRow.isNew == false) return true;
                                        var found = lodash.find($scope.$parent.vm.model.gridData, {code: value});
                                        if (found) {
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            }
                        },
                        description: {
                            excluded: false,
                            group: "#div_desc",
                            validators: {
                                notEmpty: {
                                    message: 'The Name cannot be empty'
                                }
                            }
                        }

                    }
                };
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), bvOptions );
                var fv = form.bootstrapValidator(formOptions);
                $scope.validation = form.data("bootstrapValidator");



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

                $scope.onChangeRecord = function()
                {
                    // routine to change the record when the id changes
                    $scope.validation.resetForm();

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
                };

                $scope.$watch("editRow.rowId", function(newValue, oldValue)
                {
                    // update the animation flag when the changed
                    if (newValue != oldValue)
                    {
                        $scope.onChangeRecord();
                    }
                });

                // start the record edit
                $scope.onChangeRecord();
            }
        }

    }]);

});

