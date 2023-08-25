/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - cnoSpeSenderProfileEdit
 /// CNO SPE Administration Module Directive to Manage Sender Profile Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2017
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'lodash'], function(module, lodash) {
    "use strict";

    module.registerDirective('cnoSpeSenderProfileEdit', ['$timeout','$filter', '$log','$uibModal','uiSvc', 'adminDataSvc', 'cacheDataSvc', function($timeout, $filter, $log, $uibModal, uiSvc,  adminDataSvc, cacheDataSvc)
    {
        return {
            restrict: 'E',
            templateUrl: "app/modules/custom/spe_cno/directives/cnoSpeSenderProfileEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs) {
                // setup the bootstrap validator

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

                var validateEmail = function (modelValue, message)
                {
                    // routine to validate that the email is valid and there is at least one
                    // routine to validate the ui- select combo and return the result to bv
                    var returnObj = {message: message, valid: true};
                    if (modelValue && modelValue.length > 0)
                    {
                        // check that we have at least one email address
                        lodash.forEach(modelValue, function(email, index)
                        {
                            var atIndex = email.indexOf('@');
                            if (atIndex == -1)
                            {
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

                var bvOptions = {
                    fields: {
                        hdn_id: {

                            excluded: $scope.editRow.recordStatus == 0,
                            validators: {
                                callback: {
                                    // make sure that the identifier is unique
                                    message: 'This Combination already exists',
                                    callback: function (value, validator, $field) {
                                        if (!$scope.editRow.jsonData.docType || !$scope.editRow.jsonData.alias)
                                            return true;
                                        $scope.editRow.code = $scope.editRow.jsonData.docType + "_" + $scope.editRow.jsonData.alias.toUpperCase();
                                        var records = lodash.filter($scope.gridList, {code: $scope.editRow.code});
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
                                regexp: {
                                    regexp: "^[a-zA-Z0-9_]{1,}$",
                                    message: "Identifier must contain no spaces or special characters and must be a minimum of 1"
                                }
                            }
                        },
                        ext_email: {
                            group: "#div_extEmail",
                            excluded: false,
                            validators: {
                                callback: {
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
                                callback: {
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
                                }
                            }
                        },
                        isa_code: {
                            group: "#div_isa_code",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The ISA Code Cannot be Empty'
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
                                stringLength: {
                                    message: 'Qualifier must be only two characters',
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
                                }
                            }
                        },
                        gsa_code: {
                            group: "#div_gsa_code",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA Code Cannot be Empty'
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
                                stringLength: {
                                    message: 'Qualifier must be only two characters',
                                    min: function (value, validator, $field) {
                                        return 2;
                                    },
                                    max: function (value, validator, $field) {
                                        return 2;
                                    }
                                }
                            }
                        },
                        gsa_name: {
                            group: "#div_gsa_name",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'The GSA Name Cannot be Empty'
                                }
                            }
                        },
                        gsa_version: {
                            group: "#div_gsa_version",
                            excluded: false,
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.gs_version, 'The GSA Version Cannot be Empty')
                                    }
                                }
                            }
                        },
                        hippa: {
                            excluded: false,
                            group: "#div_hippa",
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
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
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.metadata.category, "Category must be Selected");
                                    }
                                }

                            }
                        },
                        transport_type: {
                            excluded: false,
                            group: "#div_transport_type",
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.transport.type, "Connection Type must be Selected");
                                    }
                                }

                            }
                        },
                        transport_address: {
                            group: "#div_transport_address",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Host Cannot be Empty'
                                }
                            }
                        },
                        transport_port: {
                            group: "#div_transport_port",
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Port is Required'
                                },
                                numeric: {
                                    message: 'The Port is not a number'
                                }
                            }
                        },
                        transport_dest_host: {
                            excluded: false,
                            group: "#div_transport_dest_host",
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.transport.destination_host, "Destination Server must be Selected");
                                    }
                                }

                            }
                        },
                        transport_dest_dir: {
                            group:"#div_transport_dest_dir",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'Destination Directory Cannot be Empty'
                                }
                            }
                        },
                        transport_dest_pstaction: {
                            excluded: false,
                            group: "#div_transport_dest_pstaction",
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.transport.destination_pstaction, "Destination Post Action must be Selected");
                                    }
                                }

                            }
                        },

                        transport_user: {
                            group:"#div_transport_user",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'User Cannot be Empty'
                                }
                            }
                        },
                        tp_id: {
                            excluded: false,
                            group: "#div_tp_id",
                            validators: {
                                callback: {
                                    callback: function (value, validator, $field) {
                                        return validateCombo($scope.editRow.jsonData.tp.id, "Trading Partner must be Selected");
                                    }
                                }
                            }
                        },

                        metadata_companyId: {
                            group:"#div_metadata_companyId",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'Company Identifier Cannot be Empty'
                                }
                            }
                        },
                        tp_filename: {
                            group:"#div_tp_filename",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'Trading Partner Outbound File Pattern Cannot be Empty'
                                }
                            }
                        },
                        tp_transaction: {
                            group:"#div_tp_transaction",
                            excluded:false,
                            validators: {
                                notEmpty: {
                                    message: 'Trading Partner Outbound Transaction Cannot be Empty'
                                }
                            }
                        }


                    }
                };
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), bvOptions );

                // setup bootstrap validator
                var fv = form.bootstrapValidator(formOptions);
                $scope.validation = form.data('bootstrapValidator');


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
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Sender Profile <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Sender Profile ? ", '[No][Yes]', confirmDelete);
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

                $scope.onComboSelectType = function()
                {
                    // routine to revalidate the field when a combo Changes
                    $scope.validation.revalidateField('transport_type');

                    // based on the selection update the fields
                    var selection = $scope.editRow.jsonData.transport.type;
                    if (selection == null || selection == '')
                        return;

                    var record = cacheDataSvc.getListRecord("1", "SPETransport", selection, 0);
                    if (record != null)
                    {
                        $scope.editRow.jsonData.transport.port = record.jsonData.port;
                        $scope.editRow.jsonData.transport.address = record.jsonData.host;
                        $scope.editRow.jsonData.transport.user = record.jsonData.user;
                        if (record.jsonData.password)
                            $scope.editRow.jsonData.transport.password = record.jsonData.password;
                        if (record.jsonData.certLocation)
                            $scope.editRow.jsonData.transport.cert_location = record.jsonData.certLocation;
                        $timeout(function()
                        {
                            $scope.validation.revalidateField('transport_port');
                            $scope.validation.revalidateField('transport_address');
                            $scope.validation.revalidateField('transport_user');
                        }, 500);

                    }
                };


                $scope.initialize = function()
                {
                    // update the file formats
                    $scope.tpFileFormats = [];
                    $scope.tpFileFormats.push({value: "parsed", description:"Parsed"});
                    $scope.tpFileFormats.push({value: "lrecl_80", description:"Length 80"});


                };

                $scope.onTpToggle = function (tpApplicable)
                {
                    // routine to handle the switch for tp or not
                    if (!tpApplicable)
                    {
                        // disable the fields and clear the json
                        $scope.editRow.jsonData.tp = {applicable: tpApplicable};
                    }
                    else
                    {
                        $scope.editRow.jsonData.tp.applicable = tpApplicable;
                        if (!$scope.editRow.jsonData.tp.format)
                            $scope.editRow.jsonData.tp.format = $scope.tpFileFormats[0].value;
                    }

                    // update the field validators
                    $scope.validation.enableFieldValidators("tp_id", tpApplicable);
                    $scope.validation.enableFieldValidators("tp_filename", tpApplicable);
                    $scope.validation.enableFieldValidators("tp_transaction", tpApplicable);

                    if (!tpApplicable) {
                        $scope.validation.resetField("tp_id");
                        $scope.validation.resetField("tp_filename");
                        $scope.validation.resetField("tp_transaction");
                    }
                };

                $scope.updateDirection = function()
                {
                    // update the direction
                    var direction = "";
                    if ($scope.editRow.jsonData.docDirection != null)
                        direction = $scope.editRow.jsonData.docDirection;
                    $scope.docDirection = $filter("speEnvelopeDirectionFilter")(direction);

                };


                $scope.onChangeRecord = function()
                {
                    // routine to change the record when the id changes
                    $scope.validation.resetForm();
                    if (!$scope.editRow.jsonData.tp.format)
                        $scope.editRow.jsonData.tp.format = $scope.tpFileFormats[0].value;

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
                    $scope.onTpToggle($scope.editRow.jsonData.tp.applicable);

                    // add the direction
                    $scope.updateDirection();
                };


                $scope.requestSync = function()
                {
                    // open the dialog that will initiate a mass syncronization of all Senders Defined
                    $scope.senderId = $scope.editRow.code;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                        controller: 'speSenderSyncCtrl',
                        controllerAs: 'vmDialog',
                        scope: $scope
                    });
                    modalInstance.result.then(function (result)
                    {
                        // refresh the data
                        let model = {company_id: $scope.editRow.companyId, type: "ITX_SENDER", code: $scope.editRow.code};
                        adminDataSvc.readCustomerListAudit(model).then(function(result)
                        {
                            $scope.editRow.jsonData = result[0].jsonData;
                            $scope.editRow.additional = result[0].additional;
                            $scope.updateSyncStatus();
                            $scope.updateDirection();
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

