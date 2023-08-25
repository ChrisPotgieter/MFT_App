/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - cnoSpeSubmitterProfileEdit
 /// CNO SPE Administration Module Directive to Manage Submitter Profile Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2017
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function(module, lodash) {
    "use strict";

    module.registerDirective('cnoSpeSubmitterProfileEdit', ['$timeout','uiSvc', 'userSvc', function($timeout, uiSvc, userSvc)
    {
        return {
            restrict: 'E',
            templateUrl: "app/modules/custom/spe_cno/directives/cnoSpeSubmitterProfileEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs) {
                var validateCombo = function(modelValue, message)
                {
                    // routine to validate the ui- select combo and return the result to bv
                    var returnObj = {message: message, valid: true};
                    if (modelValue)
                    {
                        returnObj.valid = (modelValue !== "");
                    }
                    else
                        returnObj.valid = false;
                    return returnObj;
                };


                var bvOptions = {
                    fields: {
                        hdn_id: {

                            excluded: $scope.editRow.recordStatus == 0,
                            validators: {
                                callback:
                                    {
                                        // make sure that the identifier is unique
                                        message: 'This Combination already exists',
                                        callback: function (value, validator, $field)
                                        {
                                            $scope.editRow.code = $scope.editRow.jsonData.submitter_id + "_" + $scope.editRow.jsonData.receiver_p_id;
                                            $scope.editRow.code = $scope.editRow.code.toUpperCase();
                                            var records = lodash.filter($scope.gridList, {code: $scope.editRow.code });
                                            if (records.length == 1 && records[0].rowId == $scope.editRow.rowId)
                                                return true;
                                            return records.length == 0;
                                        }
                                    }
                            }
                            },
                        name: {
                            group:"#div_name",
                            excluded:false,
                            validators: {
                                callback:
                                    {
                                        callback:  function (value, validator, $field)
                                        {
                                            return validateCombo($scope.editRow.jsonData.submitter_name, 'Name Cannot be Empty')
                                        }
                                    }
                            }
                        },
                        state: {
                            group:"#div_state",
                            excluded:false,
                            validators: {
                                callback:
                                    {
                                        callback:  function (value, validator, $field)
                                        {
                                            return validateCombo($scope.editRow.jsonData.state, 'State Cannot be Empty')
                                        }
                                    }
                            }
                        },
                        nm_company: {
                            group:"#div_nm_company",
                            excluded:false,
                            validators: {
                                callback:
                                    {
                                        callback:  function (value, validator, $field)
                                        {
                                            return validateCombo($scope.editRow.jsonData.match_company, 'Match Company Cannot be Empty')
                                        }
                                    }
                            }
                        },
                        submitter_id: {
                            group:"#div_submitter_id",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'The Submitter ID cannot be empty'
                                },
                                regexp: {
                                    regexp: "^[a-zA-Z0-9_]{1,}$",
                                    message: "Submitter ID must contain no spaces or special characters and must be a minimum of 1"
                                }
                            }
                        },
                        receiver_id: {
                            group:"#div_receiver_id",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'The Receiver Primary ID cannot be empty'
                                },
                                regexp: {
                                    regexp: "^[a-zA-Z0-9_]{1,}$",
                                    message: "Receiver Primary ID must contain no spaces or special characters and must be a minimum of 1"
                                }
                            }
                        }
                    }
                };
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), bvOptions );

                // setup bootstrap validator
                var fv = form.bootstrapValidator(formOptions);
                $scope.validation = form.data('bootstrapValidator');
                $scope.vm = {company: userSvc.getOrgInfo().companyId};
                // set up the title
                if ($scope.editRow.isNew)
                {
                    $scope.buttonText = "Create";
                    $scope.headingText = "Add Submitter Profile";
                }
                else
                {
                    $scope.buttonText = "Save";
                    $scope.headingText = "Edit Submitter Profile";
                    $timeout(function()
                    {
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
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Submitter Profile <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Submitter Profile ? ", '[No][Yes]', confirmDelete);
                };

                $scope.onSave = function()
                {
                    // validate that the form is correct before saving
                    $scope.validation.validate();
                    var valid = $scope.validation.isValid();
                    if (valid)
                        $scope.saveRecord();
                };

                $scope.onComboChange = function(fieldName)
                {
                    // routine to revalidate the field when a combo Changes
                    $scope.validation.revalidateField(fieldName);
                };
            }
        }
    }]);

});

