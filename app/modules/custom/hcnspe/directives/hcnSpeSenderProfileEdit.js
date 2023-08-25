/*
 /// <summary>
 /// modules.admin.directives - hcnSpeSenderProfileEdit
 /// HealthcareNow SPE Administration Module Directive to Manage Sender Receiver Profile Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 26/02/2017
 /// </summary>
 */

define(['modules/custom/hcnspe/module', 'lodash'], function(module, lodash) {
    "use strict";

    module.registerDirective('hcnSpeSenderProfileEdit', ['$timeout','$filter', '$log','$uibModal','uiSvc', 'adminDataSvc', function($timeout, $filter, $log, $uibModal, uiSvc,  adminDataSvc)
    {
        return {
            restrict: 'E',
            templateUrl: "app/modules/custom/hcnspe/directives/hcnSpeSenderProfileEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs) {

                $scope.updateSyncStatus = function()
                {
                    // routine to update the sync status
                    $scope.sync = {};
                    if (!$scope.editRow.jsonData.sync)
                    {
                        $scope.sync.message = "This Profile has never been synced with the Server - No Status is Available";
                        $scope.sync.messageClass = "warning";
                        $scope.sync.caption = "Warning";
                        $scope.sync.icon = "warning";
                    }
                    else
                    {
                        $scope.sync.message = $scope.editRow.jsonData.sync.supplemental;
                        $scope.sync.message += " on " + $filter("localEpochDateFilter")($scope.editRow.jsonData.sync.date * 1000, "dddd, MMMM DD YYYY, h:mm:ss a");
                        $scope.sync.message += " by " + $scope.editRow.jsonData.sync.userName;
                        if ($scope.editRow.jsonData.sync.status == 0)
                        {
                            $scope.sync.messageClass = "danger";
                            $scope.sync.caption = "Error";
                            $scope.sync.icon = "times";
                        }
                        if ($scope.editRow.jsonData.sync.status == 1)
                        {
                            $scope.sync.messageClass = "success";
                            $scope.sync.caption = "Success";
                            $scope.sync.icon = "check";
                        }
                    }
                };

                const validateCombo = function (modelValue, message) {
                    // routine to validate the ui- select combo and return the result to bv
                    const returnObj = {message: message, valid: true};
                    if (modelValue) {
                        returnObj.valid = (modelValue !== "");
                    } else
                        returnObj.valid = false;
                    return returnObj;
                };

                const validateEmail = function (modelValue, message) {
                    // routine to validate that the email is valid and there is at least one
                    // routine to validate the ui- select combo and return the result to bv
                    const returnObj = {message: message, valid: true};
                    if (modelValue && modelValue.length > 0) {
                        // check that we have at least one email address
                        lodash.forEach(modelValue, function (email, index) {
                            const atIndex = email.indexOf('@');
                            if (atIndex == -1) {
                                returnObj.valid = false;
                                returnObj.message = "Invalid Email Address at Position " + index + 1;
                                return false;
                            }
                        });
                        return returnObj;
                    }
                    returnObj.valid = false;
                    return returnObj;

                };
                let regMatch = "^[a-zA-Z0-9_-]{1,}$";
                const bvOptions = {
                    fields: {
                        hdn_id: {

                            excluded: $scope.editRow.recordStatus == 0,
                            validators: {
                                callback:
                                    {
                                        // make sure that the identifier is unique
                                        message: 'This Combination already exists',
                                        callback: function (value, validator, $field) {

                                            $scope.editRow.code = $scope.editRow.jsonData.docType + "_" + $scope.editRow.jsonData.alias.toUpperCase();
                                            const records = lodash.filter($scope.gridList, {code: $scope.editRow.code});
                                            if (records.length == 1 && records[0].rowId == $scope.editRow.rowId)
                                                return true;
                                            return records.length == 0;
                                        }
                                    }
                            }
                        },
                        alias: {
                            group: "#div_alias",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The Identifier Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "Identifier must contain no spaces or special characters and must be a minimum of 1"
                                    }
                            }
                        },
                        ext_email: {
                            group: "#div_extEmail",
                            excluded: false,
                            validators: {
                                callback:
                                    {
                                        // make sure that the email is valid and there is at least 1 email
                                        callback: function (value, validator, $field) {
                                            return validateEmail($scope.editRow.jsonData.ext_email, "At Least One Partner Email Address is Required")
                                        }
                                    }
                            }
                        },
                        int_email: {
                            group: "#div_intEmail",
                            excluded: false,
                            validators: {
                                callback:
                                    {
                                        // make sure that the email is valid and there is at least 1 email
                                        callback: function (value, validator, $field) {
                                            return validateEmail($scope.editRow.jsonData.int_email, "At Least One Internal Email Address is Required")
                                        }
                                    }
                            }
                        },
                        isa_id: {
                            group: "#div_isa_id",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The ISA ID Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "ISA ID must contain no spaces or special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        isa_code: {
                            group: "#div_isa_code",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The ISA Code Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "ISA Code must contain no spaces or special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        isa_quali: {
                            group: "#div_isa_quali",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The ISA Qualifier Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "ISA Qualifier must contain no spaces or special characters and must be a minimum of 1"
                                    },
                                stringLength:
                                    {
                                        message: 'ISA Qualifier must be only two characters',
                                        min: function (value, validator, $field) {
                                            return 2;
                                        },
                                        max: function (value, validator, $field) {
                                            return 2;
                                        }
                                    }
                            }
                        },
                        isa_name: {
                            group: "#div_isa_name",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The ISA Name Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "ISA Name must contain no special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        isa_version: {
                            group: "#div_isa_version",
                            excluded: false,
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.isa_version, 'The ISA Version Cannot be Empty')
                                    }
                                }
                            }
                        },
                        gsa_id: {
                            group: "#div_gsa_id",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA ID Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "GSA ID must contain no spaces or special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        gsa_code: {
                            group: "#div_gsa_code",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA Code Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "GSA Code must contain no spaces or special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        gsa_quali: {
                            group: "#div_gsa_quali",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA Qualifier Cannot be Empty'
                                },
                                stringLength:
                                    {
                                        message: 'GSA Qualifier must be only two characters',
                                        min: function (value, validator, $field) {
                                            return 2;
                                        },
                                        max: function (value, validator, $field) {
                                            return 2;
                                        }
                                    },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "GSA Qualifier must contain no spaces or special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        gsa_name: {
                            group: "#div_gsa_name",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA Name Cannot be Empty'
                                },
                                regexp:
                                    {
                                        regexp: regMatch,
                                        message: "GSA Name must contain no special characters and must be a minimum of 1"
                                    }

                            }
                        },
                        gsa_version: {
                            group: "#div_gsa_version",
                            excluded: false,
                            validators: {
                                callback:
                                    {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.gs_version, 'The GSA Version Cannot be Empty')
                                        }
                                    }
                            }
                        },
                        hippa: {
                            excluded: false,
                            group: "#div_hippa",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.hipaa_template, "Envelope Template Must be Selected");
                                        }
                                    }

                                }
                        },
                        environment: {
                            excluded: false,
                            group: "#div_environment",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.environment, "Environment must be Selected");
                                        }
                                    }

                                }
                        },
                        docType: {
                            excluded: !$scope.editRow.isNew,
                            group: "#div_docType",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.docType, "Document Type must be Selected");
                                        }
                                    }

                                }
                        },

                        ediVersion: {
                            excluded: false,
                            group: "#div_ediVersion",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.edi_version, "EDI Version Must be Selected");
                                        }
                                    }

                                }
                        },
                        mapName: {
                            excluded: false,
                            group: "#div_mapName",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.map_name, "Map Name must be Selected");
                                        }
                                    }

                                }
                        },
                        lob: {
                            excluded: false,
                            group: "#div_lob",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.metadata.lob, "Line of Business Must be Selected");
                                        }
                                    }

                                }
                        },
                        region: {
                            excluded: false,
                            group: "#div_region",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.metadata.region, "Region must be Selected");
                                        }
                                    }

                                }
                        },
                        group: {
                            excluded: false,
                            group: "#div_group",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.metadata.group, "Group Must be Selected");
                                        }
                                    }

                                }
                        },
                        category: {
                            excluded: false,
                            group: "#div_category",
                            validators:
                                {
                                    callback: {
                                        callback: function (value, validator, $field) {
                                            return validateCombo($scope.editRow.jsonData.metadata.category, "Category must be Selected");
                                        }
                                    }

                                }
                        }
                    }
                };
                const formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), bvOptions);

                // setup bootstrap validator
                const fv = form.bootstrapValidator(formOptions);
                $scope.validation = form.data('bootstrapValidator');

                const confirmDelete = function (ButtonPressed) {
                    if (ButtonPressed == "Yes") {
                        $scope.deleteRecord();
                    }
                };


                $scope.userDelete = function (editRow)
                {
                    // routine to confirm deletion of of the row
                    const html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Sender Profile <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Sender Profile ? ", '[No][Yes]', confirmDelete);
                };

                $scope.onSave = function()
                {
                    // validate that the form is correct before saving
                    $scope.validation.validate();
                    const valid = $scope.validation.isValid();
                    if (valid)
                        $scope.saveRecord();
                };

                $scope.onComboChange = function(fieldName)
                {
                    // routine to revalidate the field when a combo Changes
                    $scope.validation.revalidateField(fieldName);
                };

                $scope.initialize = function()
                {
                };

                $scope.onChangeRecord = function()
                {
                    $scope.validation.resetForm();

                    // set up the title
                    if ($scope.editRow.isNew)
                    {
                        $scope.buttonText = "Create";
                        $scope.headingText = "Add Sender Profile";
                    }
                    else
                    {
                        $scope.buttonText = "Save";
                        $scope.headingText = "Edit Sender Profile";
                        $timeout(function()
                        {
                            $scope.validation.validate();
                        }, 500);

                        // work out the sync information
                        $scope.updateSyncStatus();
                    }
                };

                $scope.requestSync = function()
                {
                    // open the dialog that will initiate a mass syncronization of all Senders Defined
                    $scope.senderId = $scope.editRow.code;
                    const modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                        controller: 'speSenderSyncCtrl',
                        controllerAs: 'vmDialog',
                        scope: $scope
                    });
                    modalInstance.result.then(function (result)
                    {
                        // refresh the data
                        const model = {
                            company_id: $scope.editRow.companyId,
                            type: "ITX_SENDER",
                            code: $scope.editRow.code
                        };
                        adminDataSvc.readCustomerListAudit(model).then(function(result)
                        {
                            $scope.editRow.jsonData = result[0].jsonData;
                            $scope.editRow.additional = result[0].additional;
                            $scope.updateSyncStatus();
                        }).catch(function(err)
                        {
                            $log.error("Unable to Read Sender Profile", err);
                        });
                    }, function ()
                    {
                    });
                };

                $scope.$watch("editRow.id", function(newValue, oldValue)
                {
                    // update the animation flag when the changed
                    if (newValue != oldValue)
                    {
                        $scope.onChangeRecord();
                    }
                });


                // initialize the form
                $scope.initialize();
                $scope.onChangeRecord();
            }
        }
    }]);

});

