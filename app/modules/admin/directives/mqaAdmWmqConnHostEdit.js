/*
 /// <summary>
 /// modules.admin.directives - mqaAdmWmqConnHostEdit.js
 /// Administration Module Directive to Manage Client Binding Host Details
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 19/02/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function(module, lodash) {
    "use strict";

    module.registerDirective('mqaAdmWmqConnHostEdit', ['$timeout','uiSvc', function($timeout, uiSvc)
    {
        return {
            restrict: 'E',
            templateUrl: "app/modules/admin/directives/mqaAdmWmqConnHostEdit.tpl.html",
            replace: true,
            link: function ($scope, form, attrs)
            {
                // setup the bootstrap validator
                var sbutton ={submitButtons: 'button[id="submit"]'};
                var fields = {
                    fields: {
                        hostName: {
                            excluded: false,
                            group:"#div_hostName",
                            validators: {
                                notEmpty: {
                                    message: 'Host Name is Required'
                                },
                                callback: {
                                    message: 'This Host Name is already exists',
                                    callback: function (value, validator, $field)
                                    {
                                        var records =lodash.filter($scope.model.hosts,{hostName:value});
                                        if(records.length > 1)
                                        {
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            }
                        },
                        port: {
                            excluded: false,
                            group:"#div_port",
                            validators: {
                                notEmpty: {
                                    message: 'Port is Required'
                                },
                                numeric: {
                                    message: 'The Port is not a number'
                                }
                            }
                        }
                    }
                };
                var formOptions = lodash.merge({}, sbutton, uiSvc.getFormValidateOptions(), fields);
                var fv = form.bootstrapValidator(formOptions).on('success.field.bv', function (e, data)
                {
                    var valid = data.bv.isValid();
                    data.bv.disableSubmitButtons(!valid);
                });
                $scope.bv = form.data('bootstrapValidator');


                var confirmDelete = function (ButtonPressed) {
                    // routine to handle the delete request from the user
                    if (ButtonPressed == "Yes") {
                        $scope.deleteRecord();
                    }
                };

                if ($scope.editRow.recordStatus === "New")
                {
                    $scope.buttonText = "Create";
                    $scope.headingText = "Add Host";
                }else
                {
                    $scope.buttonText = "Save";
                    $scope.headingText = "Edit Host";

                }
                // validate the form once its loaded
                $timeout(function()
                {
                    $scope.bv.validate();
                }, 1000);


                $scope.saveChanges = function () {
                    $scope.bv.validate();
                    var valid = $scope.bv.isValid();
                    if (!valid) {
                        $timeout(function () {
                            $scope.bv.disableSubmitButtons(false);
                        }, 500);
                        return;
                    }

                    // now save the record
                    $scope.saveRecord();
                };

                $scope.userDelete = function () {
                    // routine to confirm deletion of of the row
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete Host <span style='color:white'>" + $scope.editRow.hostName + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Host ? ", '[No][Yes]', confirmDelete)
                };
            }
        }
    }]);

});

