/*
 /// <summary>
 /// modules.spe.directives - itxGwidPayloadEditor.js
 /// Refactored SPE Module Directive to View and Edit a GWID Payload
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/10/2022
 /// </summary>
 */
define(['modules/spe/module', 'lodash', 'pako','codemirror','angular-codemirror', 'codemirror-edi'], function(module, lodash, pako) {
    "use strict";
    window.pako = pako;

    module.registerDirective('itxGwidPayloadEditor', ['$filter', 'uiSvc', 'userSvc','speDataSvc', function($filter, uiSvc, userSvc, dataSvc)
    {

        return {
            restrict: 'EA',
            scope: {},
            bindToController: {
                id: '@',
                functionManager: '=?'
            },
            controllerAs: 'vmGwidDetail',
            templateUrl: "app/modules/spe/directives/itxGwidPayloadEditor.tpl.html",
            controller: function ($element, $scope) {

                let _this = this;
                _this.cliInstructionEnum  = { UNDO: 1, MARK: 2, SAVE: 3, FIX: 4, VALIDATE: 5};

                _this.functions = {};
                _this.model = {cli:{}, flags:{}, editMode: 0, cm:{loaded: 0, refresh: 0, data:{contentType:"edi", content:null}, component:{}}, grid:{loaded: 0, refresh:{value: 0}, rebuild:0}, record:{loaded: 0, flags:{}}, status:{}, action:{title:"EDI Document", timeout: 5000}};
                if (!_this.functionManager)
                    _this.functionManager = {};

                //<editor-fold desc="Functions">

                //<editor-fold desc="General">
                _this.functions.showPopup = function(message, color)
                {
                    uiSvc.showExtraSmallPopup(_this.model.action.title, message, _this.model.action.timeout,color);
                };

                _this.functions.getContent = function(obj)
                {
                    // routine to return the content
                    if (_this.model.flags.rawMode)
                        obj.payload = _this.model.cm.component.getContent();
                    else
                        obj.lines = _this.model.grid.component.dataSource.data();
                };

                _this.functions.init = function()
                {
                    // routine to initialize the directive
                    _this.functions.setOptions();
                    _this.functions.setGridOptions();
                };


                _this.functions.setOptions = function()
                {
                    // routine to set the default options
                    _this.model.record.flags.readOnly = true; // is the record readonly
                    _this.model.flags.lastReadOnly = true;
                    _this.model.record.flags.isOriginal = true; // is this the original payload or a revised payload
                    _this.model.record.flags.applyDefault = true; // should the default view state be applied
                    _this.model.record.flags.allowDelete = false; // is the user allowed to force cancellation
                    _this.model.record.flags.hasChanged = false; // has the user changed the value in the editor(s)

                    _this.model.flags.allowToggle = false; // allow the user to toggle the editor
                    _this.model.flags.showEdit = false; // should the editor be shown (is the record valid)
                    _this.model.flags.modeWatched = false; // has the editor toggle been watched yet
                    _this.model.flags.inProgress = false; // is an operation in progress
                    _this.model.flags.completeChange = false;
                    _this.model.flags.rawMode = true; // internal option of edit
                    _this.model.flags.userRawMode = true;   // user selected option of edit
                };


                _this.functions.checkComponents = function ()
                {
                    // routine to check if both the code mirror and the kendo grid has been loaded and then attempt to read the record
                    if (_this.model.grid.loaded > 0 && _this.model.cm.loaded > 0)
                        _this.functions.readRecord();
                };
                //</editor-fold>

                //<editor-fold desc="Editor">
                _this.functions.loadCodeMirror = function(cm)
                {
                    // routine to be called when code-mirror loads
                    cm.setSize(null, "300");

                    // update the before change event to set the changed flag
                    cm.on("change", function(instance, obj)
                    {
                        if (obj.origin != "setValue")
                            _this.model.record.flags.hasChanged = true;
                    });
                    _this.model.cm.loaded += 1;
                    _this.functions.checkComponents();
                };

                //</editor-fold>

                //<editor-fold desc="Grid">

                _this.functions.setGridOptions = function()
                {
                    _this.model.grid.options = {
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
                        editable: !_this.model.record.flags.readOnly,
                        save: function(e)
                        {
                            _this.model.record.flags.hasChanged = true;
                        },
                        groupable: false,
                        filterable: true,
                        resizable: true,
                        selectable: "row",
                        scrollable: true,
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
                                    var line = lodash.find(_this.model.grid.working.headerData, {id: group.value});
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
                                    var groupLine = lodash.find(_this.model.grid.working.groupData, {id: group.value});
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
                                    var groupLine = lodash.find(_this.model.grid.working.subGroupData, {id: group.value});
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
                };


                _this.functionManager.gridCreate = function (grid)
                {
                    _this.model.grid.component = grid;
                    _this.model.grid.loaded += 1;
                    _this.functions.checkComponents();
                };
                _this.functions.editorCreate = function(cm)
                {
                    _this.functions.loadCodeMirror(cm);
                };
                _this.functionManager.editorCreate = _this.functions.editorCreate;
                //</editor-fold>

                //<editor-fold desc="Record Management">
                _this.functions.reloadRecord = function()
                {
                    // routine to force a read of the record
                    _this.model.record.loaded = 0;
                    _this.functions.readRecord();
                };
                _this.functions.displayInvalidRecord = function()
                {
                    // routine to alter the view for a invalid record
                    _this.model.record.flags.readOnly = true;
                    _this.model.flags.showEdit = false;
                    _this.model.flags.allowToggle = false;
                    _this.model.flags.userRawMode = false;
                    _this.model.flags.completeChange = false;

                    _this.model.status = {type: "danger", icon:"times", description: "Unable to Find Document with ID " + _this.id, supplemental:null};
                };

                _this.functions.updateStatus = function(status, supplemental)
                {
                    // routine to update the status panel based on the status and supplemental
                    let statusRecord  = $filter('itxGwidEditorStyleFilter')(status);
                    _this.model.status = {type: statusRecord.type, description: statusRecord.desc, icon: statusRecord.icon};
                    if (statusRecord.readOnly)
                        _this.model.record.flags.readOnly = statusRecord.readOnly;
                    if (supplemental && supplemental != null)
                        _this.model.status.supplemental =  "<br/>" + supplemental.replace("\n","<br/>");
                };

                _this.functions.parseServerResponse = function(response)
                {
                    // routine to parse the server response and update the flags as required
                    if (response.transactionId === "INVALID RECORD")
                    {
                        _this.functions.displayInvalidRecord();
                        return;
                    }

                    // update the flags based on the flags
                    _this.model.record.oid = response.oid;
                    _this.model.record.transactionId = response.transactionId;
                    _this.model.record.flags.isOriginal = response.isOriginal;
                    _this.model.record.flags.readOnly = false;
                    _this.model.record.flags.hasChanged = false;


                    // update the status
                    _this.functions.updateStatus(response.status, response.supplemental);

                    // check the permissions
                    if (!_this.model.record.flags.readOnly)
                        _this.model.record.flags.readOnly = userSvc.checkRepairResubmit(response.departmentId);
                    _this.model.record.flags.allowDelete = userSvc.hasFeature(userSvc.commonFeatures.TRANS_FORCE_COMPLETE);


                    if (response.returnedPayload)
                    {
                        // code mirror display
                        _this.model.cm.data = {content: response.returnedPayload, contentType: "edi"};
                        _this.model.cm.refresh += 1;
                        _this.model.flags.userRawMode = true;
                    }
                    else
                    {
                        _this.model.grid.data = response.document.lines;
                        _this.model.grid.working = {};
                        _this.model.grid.working.groupData = response.document.groups;
                        _this.model.grid.working.subGroupData = response.document.subGroups;
                        _this.model.grid.working.headerData = response.document.headerGroups;
                        _this.model.grid.refresh.value += 1;
                        _this.model.flags.userRawMode = false;

                        // check if the grid options need to change
                        if (_this.model.flags.lastReadOnly != _this.model.record.flags.readOnly)
                        {
                            _this.model.grid.rebuild += 1;
                            _this.model.flags.lastReadOnly = _this.model.record.flags.readOnly;
                        }
                    }
                    _this.model.flags.showEdit = true;
                    _this.model.flags.allowToggle = response.allowToggle;

                    // sync the mode flag
                    if (_this.model.flags.rawMode != _this.model.flags.userRawMode)
                    {
                        _this.model.flags.completeChange = true;
                        _this.model.flags.rawMode = _this.model.flags.userRawMode;
                    }
                    _this.model.operations = _this.functions.calcOperations();
                    _this.model.record.loaded += 1;
                };


                _this.functions.readRecord = function()
                {
                    // routine to read the record from the server when the components have been loaded or the id changes
                    if (_this.id === '')
                        return;
                    if (_this.model.record.loaded > 0)
                        return;

                    // reset the data
                    _this.model.cm.content = null;
                    _this.model.grid.data = [];
                    dataSvc.readGWID(_this.id, _this.model.flags.rawMode, _this.model.record.flags.applyDefault).then(function(response)
                    {
                        _this.functions.parseServerResponse(response);
                    }).catch(function(err)
                    {
                        _this.functions.displayInvalidRecord();
                    }).finally(function(err)
                    {
                        _this.model.record.flags.applyDefault = false;
                    });

                };

                //</editor-fold>

                //<editor-fold desc="User Actions">
                _this.functions.calcOperations = function()
                {
                    let returnObj = [];
                    /*

                    // check if undo is allowed
                    if (!_this.model.flags.inProgress && (!_this.model.record.flags.isOriginal && _this.model.record.flags.hasChanged))
                    {
                        returnObj.push({
                            description: "Revert to Original...",
                            click_data: {ui: {question: "Are you sure you want to Undo all Changes made to this Document ?", class: "style='color:orange'", description: _this.id, sub_description:"Undo Changes to Document"}, operation: _this.cliInstructionEnum.UNDO},
                            icon: "fa fa-undo",
                            tooltip: "click here to Undo Changes to the Document and Revert to Original"
                        });

                    }
                    // check if delete is allowed
                    if (!_this.model.flags.inProgress && _this.model.record.flags.allowDelete)
                    {
                        returnObj.push({
                            description: "Irreparable...",
                            click_data: {ui: {question: "Mark this Document as Irreparable ?",  icon: "fa fa-trash-o", class: "style='color:red'", description: _this.id, sub_description:"Mark"}, operation: _this.cliInstructionEnum.MARK},
                            tooltip: "click here to Mark this Document as Irreparable"
                        });

                    }

                    // check if save is allowed
                    if (!_this.model.flags.inProgress && !_this.model.record.flags.readOnly)
                    {
                        returnObj.push({
                            description: "Save...",
                            click_data: {ui: {question: "Save Changes without Validating  ?", icon: "fa fa-save", class: "style='color:blue'", description: _this.id, sub_description:"Save"}, operation: _this.cliInstructionEnum.SAVE},
                            tooltip: "click here to Save Updates to this Document without Validation"
                        });
                    }


                    // check if fix and release is allowed
                    if (!_this.model.flags.inProgress && !_this.model.record.flags.readOnly)
                    {
                        returnObj.push({
                            description: "Fix and Release...",
                            click_data: {ui: {question: "Fix & Release Document  ?",  icon: "fa fa-sign-out", class: "style='color:green'", description: _this.id, sub_description:"Fix & Release"}, operation: _this.cliInstructionEnum.FIX},
                            tooltip: "click here to Save Updates to this Document, Validate and Release"
                        });
                    }
                    */

                    // check if validate
                    if (!_this.model.flags.inProgress)
                    {
                        returnObj.push({
                            description: "Validate...",
                            click_data: {ui: {question: "Validate This Document  ?",  icon: "fa fa-check", class: "style='color:green'", description: _this.id, sub_description:"Validate"}, operation: _this.cliInstructionEnum.VALIDATE},
                            tooltip: "click here to Send this Document for Validation"
                        });
                    }
                    return returnObj;
                };

                _this.functions.confirmCLIOperation = function(click_data)
                {
                    // routine to confirm a CLI Action
                    // routine to confirm deletion of of the row
                    let html = "<i class='" + click_data.ui.icon + "' " + click_data.ui.class + "></i> " + click_data.ui.sub_description + " <span style='color:white'>" + click_data.ui.description + "</span>";
                    _this.model.cli.lastCLIRequest = click_data;
                    uiSvc.showSmartAdminBox(html, "Are you sure you wish to " + click_data.ui.question + "?",'[No][Yes]', _this.acceptCLIOperation);
                };


                _this.acceptCLIOperation = function (ButtonPressed)
                {
                    // routine to handle the delete request from the user
                    if (ButtonPressed == "Yes")
                    {
                        // get the last CLI Information
                        if (!_this.model.cli.lastCLIRequest)
                            return;

                        // get the operation requested and if necessary bring up CLI
                        let operationAction = _this.model.cli.lastCLIRequest.operation;
                        switch (operationAction)
                        {
                            case _this.cliInstructionEnum.SAVE:
                                _this.functions.performSave();
                                break;
                            case  _this.cliInstructionEnum.MARK:
                                _this.functions.performDelete();
                                break;
                            case _this.cliInstructionEnum.UNDO:
                                _this.functions.performUndo();
                                break;
                            case _this.cliInstructionEnum.FIX:
                                _this.functions.performValidation(1);
                                break;
                            default:
                                _this.functions.performValidation(0);
                                break
                        }

                    }
                };


                _this.functions.performSave = function()
                {
                    // routine to save the record and display a confirmation
                    _this.functions.update(0).then(function()
                    {
                        _this.functions.showPopup("Document Update Successful !", "#296191");
                    });
                };



                _this.functions.performDelete = function()
                {
                    // routine to save changes the payload and update the database
                    _this.functions.update(99).then(function()
                    {
                        _this.functions.showPopup("Document Status Update Successful !");
                   });
                };



                _this.functions.performUndo = function()
                {
                    // routine to undo the change and revert the document to its original state
                    _this.functions.update(98).then(function()
                    {
                        _this.functions.showPopup("Document Reversal Successful !");
                    });
                };


                _this.functions.performValidation = function(mode)
                {
                    // routine to request a validation using the CLI
                    let data = _this.model.cli.lastCLIRequest;
                    if (data != null)
                    {
                        // work out the record
                        data.record = {};
                        _this.functions.getContent(data.record);
                        data.record.gwid = _this.id;
                    }
                    data.completeFunction = function(result, isError)
                    {
                        if (mode == 1) // fix and release
                        {
                            _this.functions.update(1).then(function()
                            {
                                _this.functions.showPopup("Document Validation & Release Successful !");
                            });
                        }
                        else
                        {
                            _this.functions.showPopup("Document Validation Successful !");
                        }
                    };
                    data.operation = 10;
                    data.ui.description = "Document Validation";
                    dataSvc.lastCLIRequest = data;
                    dataSvc.acceptCLIOperation("Yes");
                };



                _this.functions.confirmEditSwap = function(mode)
                {
                    // routine to manage the toggling of the editor mode
                    _this.model.flags.userRawMode = mode;
                    if (_this.model.record.flags.hasChanged)
                    {
                        let html = "<i class='fa fa-trash' style='color:red'></i>    Undo Changes made to Document <span style='color:white'>" + _this.id + "</span> ?";
                        uiSvc.showSmartAdminBox(html, "Are you sure you want to Undo all Changes made to this Document and Change the Editing Mode? ", '[No][Yes]', _this.functions.performEditSwap);
                    }
                    else
                        _this.functions.performEditSwap();
                };



                _this.functions.performEditSwap = function()
                {
                    // routine to switch edit modes
                    _this.model.flags.rawMode = _this.model.flags.userRawMode;
                };

                _this.functions.update = function (status)
                {
                    // routine to update the database with a new status and new payload
                    let model = {updateType: status, gwid: _this.id};
                    if (status == 0 || status == 1)
                    {
                        _this.functions.getContent(model);
                    }

                    // send to the server
                    let deferred = $q.defer();
                    _this.model.flags.inProgress = true;
                    dataSvc.updateGWID(model).then(function(result)
                    {
                        _this.functions.parseServerResponse(result);
                        deferred.resolve(result);
                        if (_this.functionManager != null && _this.functionManager.onSave)
                            _this.functionManager.onSave()(status);
                    }).catch(function(err)
                    {
                        deferred.reject(err);
                    }).finally(function(){
                        _this.model.flags.inProgress = false;
                    });
                    return deferred.promise;
                };

                //</editor-fold>

                //</editor-fold>

                //<editor-fold desc="Watches">
                $scope.$watch("vmGwidDetail.model.flags.rawMode", function(newValue, oldValue)
                {
                    // routine to manage the switch of edit-modes from raw-mode to normal mode
                    if (_this.model.flags.completeChange)
                    {
                        // change has not yet completed
                        _this.model.flags.completeChange = false;
                        return;
                    }
                    if ((newValue != null) && (newValue != oldValue) || !_this.model.flags.modeWatched)
                    {
                        _this.model.flags.modeWatched = true;
                        _this.functions.reloadRecord();
                    }

                }, true);

                $scope.$watch("vmGwidDetail.id", function(newValue, oldValue)
                {

                    // watch for an id change
                    if (newValue != null && newValue != oldValue)
                    {
                        //  reset the flags
                        _this.model.record.flags.applyDefault = true;
                        if (_this.model.flags.rawMode)
                            _this.functions.reloadRecord();
                        else
                            _this.model.flags.rawMode = true;
                    }
                }, true);

                //</editor-fold>

                _this.functions.init();
            }
        };
   }]);

});

