/*
 /// <summary>
 /// modules.admin.directives - mqaAdmTemplateGroupEdit.js
 /// Administration Module Directive to Manage Template Group Edit
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 01/07/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash','bootstrap-validator'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmTemplateGroupEdit', ['$timeout','$log','adminDataSvc','uiSvc', function($timeout, $log, adminDataSvc, uiSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmTemplateGroupEdit.tpl.html",
        replace: true,
        link: function ($scope, form, attrs)
        {
            const vm = $scope.vm;
            const editFormSetup = function () {
                const innerForm = $($(form).find("#frmGroupCode")[0]);
                // routine to setup the queue editor form
                const fields = {
                    fields: {
                        code: {
                            excluded: false,
                            validators: {
                                notEmpty: {
                                    message: 'Code is Required'
                                },
                                callback: {
                                    message: 'Code already exists',
                                    callback: function (value, validator, $field) {
                                        const found = lodash.find($scope.vm.model.data, function (record) {
                                            return (record.code === value && record.recordStatus != uiSvc.editModes.DELETE && record.rowId != $scope.editRow.rowId);
                                        });
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
                            validators: {
                                notEmpty: {
                                    message: 'Description is Required'
                                }
                            }
                        },
                        hiddenValidation: {
                            excluded: false,
                            feedbackIcons: false,
                            validators: {
                                callback: {
                                    message: 'A Template Group requires at least one Content Value',
                                    callback: function (value, validator, $field) {
                                        const template = lodash.find($scope.editRow.templateList, function (template) {
                                            return template.content != null;
                                        });
                                        return (template != null);
                                    }
                                }
                            }
                        }
                    }
                };
                let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
                let fv = innerForm.bootstrapValidator(formOptions);
                $scope.bv = innerForm.data('bootstrapValidator');
            };

            const refreshSubGrid = function () {
                // routine to refresh the subgrid when the data changes
                $scope.editRow.subGridData = lodash.filter($scope.editRow.templateList, function (record) {
                    return record.type < 90;
                });

            };

            const getTemplateList = function () {
                // routine to query the server and get the template list
                if (!$scope.editRow.isDuplicate) {
                    adminDataSvc.buildTemplateList($scope.editRow.companyId, $scope.editRow.code).then(function (result) {
                        // exclude any email subject templates
                        $scope.editRow.templateList = result;
                        refreshSubGrid();

                        // validate the form on edit
                        if ($scope.editRow.recordStatus == uiSvc.editModes.UPDATE) {

                            // validate the form on edit
                            $timeout(function () {
                                $scope.bv.validate();

                            }, 500);
                        }
                    }).catch(function (err) {
                        $log.error("Unable to get Template List", err);
                    });
                } else
                    refreshSubGrid();
            };


            const subGridSetup = function () {
                // routine to setup the sub grid
                $scope.subGridDataOptions = {
                    sortable: true,
                    groupable: false,
                    filterable: false,
                    columnMenu: false,
                    resizable: false,
                    pageable: {
                        pageSizes: true
                    },
                    selectable: "row",

                    dataSource: {
                        data: [],
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "type",
                                uid: "type",
                                fields: {
                                    type: {type: "number"}
                                }
                            }
                        }
                    },
                    columns: [
                        {
                            field: "type",
                            title: "Type",
                            template: function (dataItem) {
                                switch (dataItem.type) {
                                    case 0:
                                        return "EMAIL";
                                    case 1:
                                        return "ALERT";
                                    case 2:
                                        return "TASK LIST";
                                    case 3:
                                        return "QUEUE";
                                }
                            }
                        },
                        {
                            field: "description",
                            title: "Description",
                            template: function (dataItem) {
                                switch (dataItem.type) {
                                    case 0:
                                        return "Email Notification Template";
                                    case 1:
                                        return "Desktop Alert Notification Template";
                                    case 2:
                                        return "User Task List Template";
                                    case 3:
                                        return "Message Queue Notification Template";
                                }
                            }
                        },
                        {
                            field: "apply",
                            title: " ",
                            width: "100px",
                            template: function (dataItem) {
                                const entry = lodash.find($scope.editRow.templateList, {type: dataItem.type});
                                if (entry.content != undefined && entry.content != null)
                                    return "<ul class='list-unstyled'><li class='text-success'><i class='fa fa-file-text fa-lg'/></li></ul>";
                                return "";
                            }
                        }
                    ]
                };
            };


            const initialize = function () {
                // routine to initialize the form
                $scope.gridRefreshFlag = {value: 0};
                getTemplateList();
                editFormSetup();
                subGridSetup();
                $scope.editorOptions = {height: 300, focus: true};
                $scope.buttonText = "Create";
                if ($scope.editRow.recordStatus == uiSvc.editModes.UPDATE)
                    $scope.buttonText = "Save";
            };


            //<editor-fold desc="Editing Functions">

            const confirmDelete = function (ButtonPressed) {
                // routine to handle the delete request from the user
                if (ButtonPressed == "Yes") {
                    $scope.deleteRecord();
                }
            };


            const confirmDeleteSubEdit = function () {
                // routine to clear the content of the record and save it
                $scope.templateRow.content = null;
                if ($scope.templateRow.subject)
                    $scope.templateRow.subject.content = null;
                $scope.saveSubEdit();
            };

            $scope.saveChanges = function ()
            {
                // routine to validate the form and cause a server update
                $scope.bv.revalidateField("hiddenValidation");
                $scope.bv.validate();
                const valid = $scope.bv.isValid();
                if (!valid)
                    return;

                // change the JSON data to be the template list
                $scope.editRow.jsonData = {};
                $scope.editRow.jsonData.templateList = lodash.map($scope.editRow.templateList, function(template)
                {
                    return {type: template.type, content: template.content};
                });
                // now save the record
                $scope.saveRecord();
            };


            $scope.userDelete = function () {
                // routine to confirm deletion of the group
                const html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Template Group ? ", '[No][Yes]', confirmDelete)
            };

            $scope.deleteSubEdit = function () {
                // routine to confirm clearing of content
                const html = "<i class='fa fa-trash-o' style='color:red'></i>    Clear ?";
                uiSvc.showSmartAdminBox(html, "Are you sure you want to Clear this Template Content ? ", '[No][Yes]', confirmDeleteSubEdit)
            };


            $scope.saveSubEdit = function()
            {
                // routine to post the save of the queue record to the in-memory store
                if ($scope.bvEmail != null)
                {
                    $scope.bvEmail.validate();
                    const valid = $scope.bvEmail.isValid();
                    if (!valid)
                        return;
                }
                var entry = lodash.find($scope.editRow.templateList, {type: $scope.templateRow.type});
                if (entry)
                {
                    var content = $scope.templateRow.content;
                    if (content == '')
                        content = null;
                    entry.content = content;
                }

                // update the subject line if any
                if ($scope.templateRow.subject)
                {
                    const subjectType = 99 - $scope.templateRow.type;
                    var entry = lodash.find($scope.editRow.templateList, {type: subjectType});
                    if (entry)
                    {
                        var content = $scope.templateRow.subject.content;
                        if (content == '')
                            content = null;
                        entry.content = content;
                    }
                }
                $scope.cancelSubEdit();
                $scope.gridRefreshFlag.value += 1;

                // update the grid
                refreshSubGrid();

                // cause the hidden field to validate
                $timeout(function () {
                    $scope.bv.revalidateField("hiddenValidation");
                }, 500);

            };

            $scope.cancelSubEdit = function()
            {
                // routine to abort the editing of the template record
                $scope.showSubEdit = false;
                $scope.bvEmail = null;
            };

            $scope.invokeSubEdit = function(item)
            {
                // routine to manage the editing of a given template
                const entry = lodash.find($scope.editRow.templateList, {type: item.type});
                $scope.templateRow = angular.copy(entry);
                if ($scope.templateRow.type === 0 || $scope.templateRow.type === 1 || $scope.templateRow.type === 2)
                {
                    // validate the subject
                    const subjectType = 99 - $scope.templateRow.type;
                    $scope.templateRow.subject = angular.copy(lodash.find($scope.editRow.templateList, {type: subjectType}));

                    $timeout(function()
                    {
                        const innerForm = $($(form).find("#frmEmail")[0]);
                        // routine to setup the queue editor form
                        const fields = {
                            fields: {
                                subject: {
                                    group: "#div_subject",
                                    excluded: false,
                                    validators: {
                                        notEmpty: {
                                            message: 'Subject is Required'
                                        }
                                    }
                                }
                            }
                        };
                        const formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
                        const fv = innerForm.bootstrapValidator(formOptions);
                        $scope.bvEmail = innerForm.data('bootstrapValidator');
                    })
                }
                $scope.allowTemplateClear = ($scope.templateRow.content != null || ($scope.templateRow.subject && $scope.templateRow.subject.content != null));
                $scope.showSubEdit = true;

            };

            //</editor-fold>

            // initialize the directive
            initialize();
        }
    }
  }]);

});


