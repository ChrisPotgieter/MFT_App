/*
 /// <summary>
 /// modules.spe.directives - mqaSpeGwidPayloadEditor.js
 /// SPE Module Directive to View and Edit a GWID Payload Added to the Database by the Prolifics SPE Data Interface
 /// We don't use the standard mqa-kendo-grid here because we want custom popup editor on the grid
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/08/2018
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'pako','codemirror','angular-codemirror', 'codemirror-edi'], function(module, lodash, pako) {
    "use strict";
    window.pako = pako;

    module.registerDirective('mqaSpeGwidPayloadEditor', ['$log', '$state', '$q', '$uibModal', '$timeout','uiSvc', 'speDataSvc', 'transactionReportingSvc','userSvc', function($log, $state, $q, $uibModal, $timeout, uiSvc, speDataSvc, transactionReportingSvc, userSvc)
    {

        return {
            restrict: 'EA',
            scope: {
                gwid: '=',
                linkTransaction:'@?',
                height:'@?',
                onSave:'&?'
            },
            replace: true,
            templateUrl: "app/modules/spe/directives/mqaSpeGwidPayloadEditor.tpl.html",
            link: function($scope, form, attrs)
            {
                $scope.uiSvc = uiSvc;
                $scope.vm = {functions:{}, data:{gridEditor:[], rawEditor:null, gridWorking:{}}, flags:{}, options:{}};

                var vm = $scope.vm;
                var record = null;

                // set the flags
                vm.flags.readOnly = true; // is the editor readonly
                vm.flags.allowEditorToggle = false; // allow the user to toggle the editor
                vm.flags.showEdit = false; // should the editor be shown (is the record valid)
                vm.flags.rawMode = true; // is raw-edit Mode active
                vm.flags.userRawMode = true;
                vm.flags.gridWatched = false; // has the grid been watched yet
                vm.flags.modeWatched = false; // has the editor toggle been watched yet
                vm.flags.isOriginal = true; // is this the original payload or a revised payload
                vm.flags.hasChanged = false; // has the user changed the value in the editor(s)
                vm.flags.inProgress = false; // is an operation in progress
                vm.flags.completeChange = false;
                vm.flags.applyDefault = true; // should the default view state be applied
                vm.flags.allowDelete = false; // is the user allowed to force cancellation
                vm.flags.refreshRawEditor = 0;



                //<editor-fold desc="Functions">

                var updateFlags = function()
                {
                    // routine to update the flags on the view when the record is re-read
                    var status = record.status;
                    if (record.transactionId === "INVALID RECORD")
                    {
                        vm.flags.showEdit = false;
                        vm.flags.readOnly = true;
                        vm.flags.allowEditorToggle = false;
                        vm.flags.userRawMode = false;
                        vm.data.notify = {type:"danger", icon:"times", heading:"Unable to Find Document with ID " + $scope.gwid};
                        vm.flags.completeChange = false;

                        return;
                    }
                    else
                    {
                        // toggle the has changed
                        vm.flags.hasChanged = false;
                        vm.flags.isOriginal = record.isOriginal;
                        vm.flags.allowEditorToggle = record.allowToggle;
                        if (record.returnedPayload)
                        {
                            vm.data.rawEditor = record.returnedPayload;
                            vm.flags.userRawMode = true;
                            vm.flags.refreshRawEditor += 1;
                        }
                        else
                        {
                            vm.data.gridEditor = record.document.lines;
                            vm.data.gridWorking = {};
                            vm.data.gridWorking.groupData = record.document.groups;
                            vm.data.gridWorking.subGroupData = record.document.subGroups;
                            vm.data.gridWorking.headerData = record.document.headerGroups;
                            vm.flags.userRawMode = false;
                        }
                    }
                    vm.options.rawEditorOptions.readOnly = false;
                    vm.flags.showEdit = true;
                    vm.flags.readOnly = false;
                    vm.data.notify = {};
                    if (status == 0 || status == 1)
                    {
                        vm.data.notify.type = "success";
                        vm.data.notify.heading = "Document has passed EDI Validation";
                        vm.data.notify.icon = "check";
                        vm.flags.readOnly = true;
                    }
                    if (status >= 90)
                    {
                        vm.data.notify.type = "danger";
                        vm.data.notify.icon = "times";
                        if (status === 90)
                            vm.data.notify.heading = "Document has Failed with a Compliance Error";
                        if (status === 91)
                            vm.data.notify.heading = "Document has Failed with a Rule Error";
                        if (status === 92)
                            vm.data.notify.heading = "Document has Failed with a Duplicate Error";
                        if (status === 93)
                            vm.data.notify.heading = "Document has Failed with Complete Record Duplicate Error";
                        if (status === 94)
                            vm.data.notify.heading = "Document has Failed with Invalid Record Length Error";
                        if (status === 95)
                            vm.data.notify.heading = "Document has Failed with Invalid Data Type Error";
                        if (status === 96)
                            vm.data.notify.heading = "Document has Failed with Merged Error";
                        if (status === 97)
                            vm.data.notify.heading = "Document has Failed with Filtered Error";
                        if (status === 98)
                            vm.data.notify.heading = "Document has Failed with External Error";
                        if (status === 999)
                        {
                            vm.data.notify.heading = "Document Has been Marked as Irreparable";
                            vm.flags.readOnly = true;
                        }
                    }
                    if (status == 99)  // TODO: This is issue because 93 used to autocorrected
                    {
                        vm.data.notify.type = "info";
                        vm.data.notify.heading = "Document Failed but has been Auto-Corrected";
                        vm.data.notify.icon = "wrench";
                        vm.flags.readOnly = true;
                    }
                    if (status === 2)
                    {
                        vm.data.notify.type = "warning";
                        vm.data.notify.icon = "edit";
                        vm.data.notify.heading = "Document Failed and Repair has Commenced but Validation has not occurred";
                    }
                    if (status === 3)
                    {
                        vm.data.notify.type = "warning";
                        vm.data.notify.icon = "paper-plane";
                        vm.data.notify.heading = "Document Failed and Repair has been Successfully Validated, Resubmission is Outstanding";
                    }
                    if (status === 4)
                    {
                        vm.data.notify.type = "info";
                        vm.data.notify.icon = "wrench";
                        vm.data.notify.heading = "Document Failed but was Repaired and Resubmitted";
                        vm.flags.readOnly = true;
                    }
                    if (record.supplemental && record.supplemental != '')
                        vm.data.notify.msg  = "<br/>" + record.supplemental.replace("\n","<br/>");
                    vm.flags.initialized = true;

                    // check the user permissions
                    if (!vm.flags.readOnly)
                        vm.flags.readOnly = !userSvc.checkRepairResubmit(record.departmentId);
                    vm.flags.allowDelete = userSvc.hasFeature(userSvc.commonFeatures.TRANS_FORCE_COMPLETE);

                    if (vm.flags.readOnly)
                        vm.options.rawEditorOptions.readOnly = true;

                    // sync the mode flag
                    if (vm.flags.rawMode != vm.flags.userRawMode)
                    {
                        vm.flags.completeChange = true;
                        vm.flags.rawMode = vm.flags.userRawMode;
                    }
                };
                var readRecord = function()
                {
                    // routine to read the record from the database and update the flags accordingly
                    if ($scope.gwid === '')
                        return;
                    if (vm.flags.initialized)
                        return;
                    vm.data.gridEditor = [];
                    vm.data.rawEditor = null;


                    // based on the editor type populate the data
                    vm.flags.hasChanged = false;

                    speDataSvc.readGWID($scope.gwid, vm.flags.rawMode, vm.flags.applyDefault).then(function(response)
                    {
                        record = response;
                        updateFlags();
                    }).catch(function(err)
                    {
                        $log.error("Unable to Find GWID Payload with ID " + $scope.gwid);
                    }).finally(function(err)
                    {
                        vm.flags.applyDefault = false;
                    });
                };

                var confirmSave = function()
                {
                    // routine to save changes the payload and update the database
                    saveRecord(0).then(function()
                    {
                        uiSvc.showExtraSmallPopup("EDI Document", "Document Update Successful !", 5000, "#296191");
                    });
                };

                var confirmDelete = function()
                {
                    // routine to save changes the payload and update the database
                    saveRecord(99).then(function()
                    {
                        uiSvc.showExtraSmallPopup("EDI Document", "Document Status Update Successful !", 5000);
                    });
                };

                var confirmUndo = function()
                {
                    // routine to undo the change and revert the document to its original state
                    saveRecord(98).then(function()
                    {
                        uiSvc.showExtraSmallPopup("EDI Document", "Document Reversal Successful !", 5000);
                    });
                };

                var confirmEditSwap = function()
                {
                    // routine to switch edit modes
                    vm.flags.rawMode = vm.flags.userRawMode;
                };

                var validateRecord = function(mode)
                {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                        controller: 'speDeEnvelopeCtrl',
                        controllerAs: 'vmDialog',
                        scope: $scope
                    });
                    modalInstance.result.then(function (result)
                    {
                        if (mode == 1) // fix and release
                        {
                            saveRecord(1).then(function()
                            {
                                uiSvc.showExtraSmallPopup("EDI Document", "Document Validation & Release Successful !", 5000);
                            });
                        }
                        else
                        {
                            uiSvc.showExtraSmallPopup("EDI Document", "Document Validation Successful !", 5000);
                        }
                    }, function (err)
                    {
                        uiSvc.showExtraSmallPopup("EDI Document", "Document Validation Failed !<br/>" + err, 5000, "#ce2029", "times");
                    });
                };

                var saveRecord = function (status)
                {
                    // routine to update the database with a new status and new payload
                    var model = {updateType: status, gwid: $scope.gwid};
                    if (status == 0 || status == 1)
                    {
                        if (vm.flags.rawMode)
                            model.payload = vm.data.rawEditor;
                        else
                            model.lines = $scope.gridEditor.dataSource.data();
                    }
                    var deferred = $q.defer();
                    vm.flags.inProgress = true;
                    speDataSvc.updateGWID(model).then(function(result)
                    {
                        record = result;

                        updateFlags();
                        deferred.resolve(result);
                        if ($scope.onSave)
                            $scope.onSave()(status);
                    }).catch(function(err)
                    {
                        $log.error("Unable to update Document", err);
                        deferred.reject(err);
                    }).finally(function(){
                        vm.flags.inProgress = false;
                    });


                    return deferred.promise;
                };

                var refreshGridEditor = function (newValue)
                {
                    // routine to refresh the fancy grid when the grid data changes
                    uiSvc.displayKendoLoader("#grid", true);
                    $timeout(function()
                    {
                        vm.options.gridEditorOptions.editable = !vm.flags.readOnly;
                        $scope.gridEditor.setOptions(vm.options.gridEditorOptions);
                        $scope.gridEditor.dataSource.data(newValue);
                        uiSvc.displayKendoLoader("#grid", false);
                    }, 500);
                };

                var loadCodeMirror = function(cm)
                {
                    // routine to be called when code-mirror loads
                    $scope.cmEditor = cm;

                    //  show the record if it hasn't already been initialized
                    cm.setSize(null, "300");

                    // update the before change event to set the changed flag
                    cm.on("change", function(instance, obj)
                    {
                        if (obj.origin != "setValue")
                            vm.flags.hasChanged = true;
                    });
                    readRecord();
                };

                vm.functions.update = function()
                {
                    // routine to fix and release the edited payload
                    validateRecord(1);
                };
                vm.functions.delete = function()
                {
                    // routine to mark the gwid record as cancelled
                    var html = "<i class='fa fa-trash-o' style='color:red'></i>    Mark <span style='color:white'>" + $scope.gwid + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to Mark this Document as Irreparable ? ", '[No][Yes]', confirmDelete);
                };

                vm.functions.undo = function()
                {
                    // routine to revert the gwid back to its original state
                    var html = "<i class='fa fa-undo' style='color:orange'></i>    Undo Changes made to Document <span style='color:white'>" + $scope.gwid + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to Undo all Changes made to this Document ? ", '[No][Yes]', confirmUndo);
                };

                vm.functions.save = function()
                {
                    // routine to save the current payload to the database
                    var html = "<i class='fa fa-save' style='color:blue'></i>    Save <span style='color:white'>" + $scope.gwid + "</span> ?";
                    uiSvc.showSmartAdminBox(html, "Are you sure you want to Save Changes to the Document without Validating  ? ", '[No][Yes]', confirmSave);

                };
                vm.functions.validate = function()
                {
                    // routine to initiate a validation of the payload to ITXA
                    validateRecord(0);
                };
                vm.functions.toggleEditMode = function(mode)
                {
                    // routine to manage the toggling of the editor mode
                    vm.flags.userRawMode = mode;
                    if (vm.flags.hasChanged)
                    {
                        var html = "<i class='fa fa-trash' style='color:red'></i>    Undo Changes made to Document <span style='color:white'>" + $scope.gwid + "</span> ?";
                        uiSvc.showSmartAdminBox(html, "Are you sure you want to Undo all Changes made to this Document and Change the Editing Mode? ", '[No][Yes]', confirmEditSwap);
                    }
                    else
                        confirmEditSwap();
                };
                vm.functions.navigateTransaction = function()
                {
                    // routine to navigate to the transaction
                    let moduleRoute = userSvc.getModuleRoute();
                    transactionReportingSvc.navigateTransaction(moduleRoute + ".reporting.transactionDetail.baseview", {transactionId: record.transactionId, transactionType: 2});
                };

                //</editor-fold>

                //<editor-fold desc="Angular Watches">
                $scope.$on("kendoWidgetCreated", function(event, widget)
                {
                    // when the widget gets created set the data or watch the data variable for changes
                    $scope.gridEditor = widget;
                    $scope.$watchCollection("vm.data.gridEditor", function (newValue, oldValue)
                    {
                        // update the grid the moment the data changes - no need for observable array
                        if (newValue != oldValue || !vm.flags.gridWatched)
                        {
                            if (newValue != null)
                                refreshGridEditor(newValue);
                            vm.flags.gridWatched = true;
                        }
                    });

                    //  show the record if it hasn't already been initialized
                    readRecord();
                });

                $scope.$watch("vm.flags.rawMode", function(newValue, oldValue)
                {
                    // routine to manage the switch of edit-modes from raw-mode to note
                    if (vm.flags.completeChange)
                    {
                        vm.flags.completeChange = false;
                        return;
                    }
                    if ((newValue != null) && (newValue != oldValue) || !vm.flags.modeWatched)
                    {
                        vm.flags.modeWatched = true;
                        vm.flags.initialized = false;
                        readRecord();
                    }

                }, true);
                $scope.$watch("gwid", function(newValue, oldValue)
                {

                    if (newValue != null && newValue != oldValue)
                    {
                        //  reset the flags
                        vm.flags.applyDefault = true;
                        if (vm.flags.rawMode)
                        {
                            vm.flags.initialized = false;
                            readRecord();

                        }
                        else
                        {
                            vm.flags.rawMode = true;
                        }
                    }
                }, true);
                $scope.$watch('uiSvc.getTheme()', function(newValue, oldValue)
                {
                    if (newValue != null && newValue != oldValue)
                    {
                        if ($scope.cmEditor != null)
                            $scope.cmEditor.setOption("theme", newValue.codeMirror);
                    }
                }, true);


                //</editor-fold>

                // check the height
                if ($scope.height && parseInt($scope.height) > 0)
                    vm.gridStyle = {"min-height": $scope.height + "px", "max-height": $scope.height + "px", "overflow": "auto"};

                vm.options.gridEditorOptions = {
                    toolbar: ["excel", "pdf"],
                    excel: {
                        fileName: "EDI Document.xlsx",
                        allPages: true
                    },
                    pdf: {
                        fileName: "EDI Document.pdf",
                        allPages: true
                    },

                    sortable: true,
                    editable: !vm.flags.readOnly,
                    save: function(e)
                    {
                        vm.flags.hasChanged = true;
                    },
                    groupable: false,
                    filterable: true,
                    resizable: true,
                    selectable: "row",
                    scrollable: false,
                    noRecords: {template:"No Data Available - Please Wait"},
                    dataSource:
                        {
                            data: [],
                            group:[{field: "headerGroupId"}, {field: "groupId" }, {field:"subGroupId"}],
                            sort:[
                                {field: "lineNo", dir: "asc"}],
                            schema:
                                {
                                    model:
                                        {
                                            fields:
                                                {
                                                    code: {type:"string", editable: false},
                                                    description: {type:"string", editable: false},
                                                    value: {type:"string"},
                                                    information: {type: "string", editable: false},
                                                    groupId: {type: "number", editable: false},
                                                    subGroupId:{type:"number", editable: false},
                                                    headerGroupId: {type:"number", editable: false},
                                                    lineNo:{type:"number", editable: false}
                                                }
                                        }
                                }
                        },

                    columns: [
                        {
                            field: "code",
                            title: "Code",
                            width: "80px",
                        },
                        {
                            field: "headerGroupId",
                            title: "Header",
                            hidden: true,
                            groupHeaderTemplate: function(group)
                            {
                                // return the description for the group
                                var line = lodash.find(vm.data.gridWorking.headerData, {id: group.value});
                                if (line)
                                    return line.description;
                                else
                                    return "Unknown " + group.value;
                            }

                        },
                        {
                            field: "groupId",
                            title: "Group",
                            hidden: true,
                            groupHeaderTemplate: function(group)
                            {
                                // return the description for the group
                                var groupLine = lodash.find(vm.data.gridWorking.groupData, {id: group.value});
                                if (groupLine)
                                    return groupLine.description;
                                else
                                    return "Unknown " + group.value;
                            }

                        },
                        {
                            field: "subGroupId",
                            title: "Sub Group",
                            hidden: true,
                            editable: false,
                            groupHeaderTemplate: function(group)
                            {
                                // return the description for the group
                                var groupLine = lodash.find(vm.data.gridWorking.subGroupData, {id: group.value});
                                if (groupLine)
                                    return groupLine.description;
                                else
                                    return "Unknown " + group.value;
                            }

                        },

                        {
                            field: "description",
                            title: "Description"
                        },
                        {
                            field: "value",
                            title: "Value",
                            width: "200px"
                        },
                        {
                            field: "information",
                            title: "Information",
                            sortable: false,
                            filterable: false
                        },
                    ]
                };
                if (($scope.linkTransaction == 'true'))
                    vm.options.gridEditorOptions.toolbar.push({name: "View", text:"View", template: kendo.template($("#templateTransaction").html())});

                vm.options.rawEditorOptions =
                    {
                        lineNumbers: true,
                        indentWithTabs: true,
                        theme: uiSvc.getTheme().codeMirror,
                        onLoad: loadCodeMirror,
                        mode:"edi"
                    };

            }
        }
    }]);

});
