/*
 /// <summary>
 /// modules.admin.directives - mqaAdmNotifyGroupEdit.js
 /// Administration Module Directive to Manage Notification Group Edit
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 24/06/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmNotifyGroupEdit', ['$timeout','uiSvc', function($timeout, uiSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmNotifyGroupEdit.tpl.html",
        replace: true,
        link: function ($scope, form, attrs)
        {
            var vm = $scope.vm;
            var editFormSetup = function ()
            {
                var innerForm = $($(form).find("#frmGroupCode")[0]);
                // routine to setup the queue editor form
                var fields = {
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
                                        var found = lodash.find($scope.vm.model.data, function (record) {
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
                            validators: {
                                callback: {
                                    message: 'A Notification Group requires at least one Receipient',
                                    callback: function (value, validator, $field)
                                    {
                                        var valid = ($scope.editRow.jsonData.endPoints.length  + $scope.editRow.jsonData.queues.length + $scope.vm.model.viewData.roles.length + $scope.vm.model.viewData.users.length) > 0;
                                        return valid;
                                    }
                                }
                            }
                        }
                    }
                };
                var formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), fields);
                var fv = innerForm.bootstrapValidator(formOptions);
                $scope.bv = innerForm.data('bootstrapValidator');
            };


            var queueGridSetup = function() {
                // routine to setup the grid
                $scope.queueGridDataOptions = {
                    sortable: true,
                    groupable: false,
                    filterable: true,
                    columnMenu: true,
                    resizable: false,
                    pageable: {
                        pageSizes: true
                    },
                    selectable: "row",

                    dataSource: {
                        data: [],
                        pageSize: 10,
                        sort: [

                            {field: "queueName", dir: "asc"}
                        ],
                        schema: {
                            model: {
                                id: "id",
                                uid: "id",
                                fields: {
                                    id: {type: "string", from:"id"},
                                    queueManager: {type: "string", from:"queueManager"},
                                    queue: {type:"string", from:"queue"}
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
                            field: "queue",
                            title: "Queue",
                            hidden: false

                        },
                        {
                            field: "queueManager",
                            title: "Queue Manager",
                            hidden: false
                        }


                    ]
                };
            };

            var endPointGridSetup = function() {
                // routine to setup the grid
                $scope.endPoGridDataOptions = {
                    sortable: true,
                    groupable: false,
                    filterable: true,
                    columnMenu: true,
                    resizable: false,
                    pageable: {
                        pageSizes: true
                    },
                    selectable: "row",

                    dataSource: {
                        data: [],
                        pageSize: 10,
                        sort: [

                            {field: "id", dir: "asc"}
                        ],
                        schema: {
                            model: {
                                id: "id",
                                uid: "id",
                                fields: {
                                    id: {type: "string", from:"id"},
                                    description: {type: "string", from:"description"},
                                    requestType: {type:"number", from:"requestType"},
                                    url: {type:"string", from:"url"}
                                }
                            }
                        }
                    },
                    columns: [
                        {
                            field: "id",
                            title: "Code",

                        },
                        {
                            field: "description",
                            title: "Description",

                        },
                        {
                            field: "url",
                            title: "End Point"
                        },
                        {

                        }
                    ]
                };
            };



            var initialize = function()
            {
                // routine to initialize the form
                editFormSetup();
                queueGridSetup();
                endPointGridSetup();
                $scope.buttonText = "Create";
                if ($scope.editRow.recordStatus == uiSvc.editModes.UPDATE)
                {
                    $scope.buttonText = "Save";

                    // validate the form on edit
                    $timeout(function () {
                        $scope.bv.validate();

                    }, 500);
                }
            };

            //<editor-fold desc="List Management">
            var swap = function(id, removeList1, addList1, removeList2, addList2)
            {
                // routine to manage the list swaps
                var element = lodash.find(removeList1, {id: id});
                if (element != null)
                {
                    addList1.push(element);  // add to the server included list
                    if (addList2)
                    {
                        if (element.name)
                            addList2.push({id: element.id, caption: element.name}); // add to the client included list
                        else
                            addList2.push({id: element.id, caption: element.description}); // add to the client included list
                    }
                    lodash.remove(removeList1, {id: id});  // remove the client excluded list
                    if (removeList2)
                        lodash.remove(removeList2, {id: id}); // remove from the server excluded list

                }
                $scope.bv.revalidateField("hiddenValidation");
            };

            $scope.addUser = function(item)
            {
                // routine to add a user from the excluded list into the user list
                swap(item.id, vm.model.viewData.excludedUsersServer, vm.model.viewData.includedUsersServer, vm.model.viewData.excludedUsers, vm.model.viewData.users);
            };

            $scope.removeUser = function(item)
            {
                // routine to remove a user from the list and add it to the exclusion list
                swap(item.id, vm.model.viewData.includedUsersServer, vm.model.viewData.excludedUsersServer, vm.model.viewData.users, vm.model.viewData.excludedUsers);
            };

            $scope.addRole = function(item)
            {
                // routine to add a role from the excluded list into included role list
                swap(item.id, vm.model.viewData.excludedRoles, vm.model.viewData.roles);
            };

            $scope.removeRole = function(item)
            {
                // routine to remove a role from the included list and add it to the excluded list
                swap(item.id, vm.model.viewData.roles, vm.model.viewData.excludedRoles);

            };

            //</editor-fold>


            //<editor-fold desc="Editing Functions">

            var confirmDelete = function (ButtonPressed) {
                // routine to handle the delete request from the user
                if (ButtonPressed == "Yes") {
                    $scope.deleteRecord();
                }
            };

            $scope.saveChanges = function ()
            {
                // routine to validate the form and pass control back to the controller to save the record
                $scope.bv.revalidateField("hiddenValidation");
                $scope.bv.validate();
                var valid = $scope.bv.isValid();
                if (!valid)
                    return;

                // update the row
                $scope.editRow.jsonData.users = lodash.map(vm.model.viewData.users, function(user)
                {
                    return user.id;
                });
                $scope.editRow.jsonData.roles = lodash.map(vm.model.viewData.roles, function(role)
                {
                    return role.id;
                });

                // now save the record
                $scope.saveRecord();
            };


            $scope.userDelete = function () {
                // routine to confirm deletion of of the row
                var html = "<i class='fa fa-trash-o' style='color:red'></i>    Delete  <span style='color:white'>" + $scope.editRow.description + "</span> ?";
                uiSvc.showSmartAdminBox(html, "Are you sure you want to delete this Notification Group ? ", '[No][Yes]', confirmDelete)
            };

            //<editor-fold desc="Queue Record Editing Functions">


            $scope.deleteQueueRecord = function()
            {
                // routine to delete a queue entry record
                var entry = lodash.find($scope.editRow.jsonData.queues, {id: $scope.queueEditRow.id});
                if (entry != null)
                {
                    lodash.remove($scope.editRow.jsonData.queues, entry);
                    $scope.showQueueEdit = false;
                    $scope.bv.revalidateField("hiddenValidation");
                }
            };

            $scope.postQueueRecord = function()
            {
                // routine to post the save of the queue record to the in-memory store
                if ($scope.queueEditRow.isNew)
                {
                    $scope.queueEditRow.isNew = false;
                    $scope.editRow.jsonData.queues.push($scope.queueEditRow);
                }
                else
                {
                    // update the existing row
                    var entry = lodash.find($scope.editRow.jsonData.queues, {id: $scope.queueEditRow.id});
                    if (entry)
                    {
                        lodash.remove($scope.editRow.jsonData.queues, entry);
                        $scope.editRow.jsonData.queues.push($scope.queueEditRow);
                    }
                }
                $scope.showQueueEdit = false;
                $scope.bv.revalidateField("hiddenValidation");
            };

            $scope.cancelQueueRecord = function()
            {
                // routine to abort the editing of a queue record
                $scope.showQueueEdit = false;
            };

            $scope.insertQueueRecord = function()
            {
                // routine to initialize the new record
                $scope.queueEditRow = {id:  "new_" + $scope.editRow.jsonData.queues.length + 1, isNew: true};
                $scope.showQueueEdit = true;
            };

            $scope.editQueueRecord = function(row)
            {
                // routine to edit the given row
                $scope.queueEditRow = angular.copy(row);
                $scope.queueEditRow.isNew = false;
                $scope.showQueueEdit = true;
            };

            //</editor-fold>

            //<editor-fold desc="End-Point Editing Functions">


            $scope.deleteEndPointRecord = function()
            {
                // routine to delete a end-point entry record
                var entry = lodash.find($scope.editRow.jsonData.endPoints, {id: $scope.endPointEditRow.id});
                if (entry != null)
                {
                    if (entry.recordStatus == uiSvc.editModes.INSERT)
                        lodash.remove($scope.editRow.jsonData.endPoints, entry);
                    else
                        entry.recordStatus = uiSvc.editModes.DELETE;
                    $scope.showEndPointEdit = false;
                    $scope.bv.revalidateField("hiddenValidation");
                }
            };

            $scope.postEndPointRecord = function()
            {
                // routine to post the save of the end-point record to the in-memory store
                if ($scope.endPointEditRow.isNew)
                {
                    $scope.endPointEditRow.isNew = false;
                    $scope.editRow.jsonData.endPoints.push($scope.endPointEditRow);
                }
                else
                {
                    // update the existing row
                    var entry = lodash.find($scope.editRow.jsonData.endPoints, {id: $scope.endPointEditRow.id});
                    if (entry)
                    {
                        lodash.remove($scope.editRow.jsonData.endPoints, entry);
                        $scope.editRow.jsonData.endPoints.push($scope.endPointEditRow);
                    }
                }
                $scope.showEndPointEdit = false;
                $scope.bv.revalidateField("hiddenValidation");
            };

            $scope.cancelEndPointRecord = function()
            {
                // routine to abort the editing of a end-point record
                $scope.showEndPointEdit = false;
            };

            $scope.insertEndPointRecord = function()
            {
                // routine to initialize the new record for end-points
                $scope.endPointEditRow = {id:  "new_" + $scope.editRow.jsonData.endPoints.length + 1, isNew: true, recordStatus: uiSvc.editModes.INSERT};
                $scope.showEndPointEdit = true;
            };

            $scope.editEndPointRecord = function(row)
            {
                // routine to edit the given row
                $scope.endPointEditRow = angular.copy(row);
                $scope.endPointEditRow.isNew = false;
                $scope.showEndPointEdit = true;
            };

            //</editor-fold>

            //</editor-fold>

            // initialize the directive
            initialize();
        }
    }
  }]);

});


