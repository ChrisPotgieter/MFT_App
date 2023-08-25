/*
 /// <summary>
 /// modules.admin.directives - mqaAdmMetaDataConfigEdit
 /// Directive to Manage Capturing of Meta-Data Configuration Array that will be attached to the given object or stored the database
 /// This is being designed as a generic directive that can be used in many scenarios and will replace the the current meta-data editors being used in various forms
 /// IE - EDI_DOCUMENT, ITX_SENDER_PROFILE, ITX_PRE_EDIT_BUSINESS_RULE etc
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/07/2022
 /// </summary>
 */

define(['modules/admin/module', 'lodash'], function(module, lodash){
    "use strict";

    module.registerDirective('mqaAdmMetaDataConfigEdit', ['adminDataSvc', 'uiSvc', function(adminDataSvc,  uiSvc) {

    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/partials/parameter-config-list-menu.tpl.html",
        scope:{},
        bindToController:{
            data:"=",
            config:'=', // source (type, code, [propertyName]),  stateInfo (title, subTitle, icon),
            validation:'='
        },
        controllerAs:'vmConfigList',
        controller: function ($element, $scope)
        {
            let _this = this;
            _this.fields = {};
            _this.functions = {};
            _this.model = {};

            //<editor-fold desc="Functions">

            _this.functions.initializeListEditor = function()
            {
                // initialize the controller as a list editor controller
                let titleData = {title: _this.config.stateInfo.title + " List"};
                let dialogData = {
                    template: 'app/modules/admin/partials/parameter-meta-data-config-edit-dialog.tpl.html',
                    controller: 'parameterMetaDataConfigEditDialogCtrl',
                    alias: 'vmDetail',
                };
                adminDataSvc.listFunctions.initializeListController(_this, _this.config.source.type.toUpperCase(), dialogData, titleData);
                _this.model.flags.allowAdd = true;

                // setup the grid options
                let options =  {
                        resizable: false,
                        selectable: "row",
                        filterable: true,
                        columnMenu: false,
                        noRecords: true,
                        pageable: {
                            pageSizes: true
                        },
                        messages: {
                            noRecords: "No Records Available"
                        },
                        dataSource: {
                            pageSize: 10,
                            schema: {
                                model: {
                                    id: "rowId",
                                    uid:"rowId"
                                }
                            }
                        },
                        columns: [
                            {field: "rowId", type: "string", tooltip: false, hidden: true},
                            {field: "key", type: "string", tooltip: true, title: "Key"},
                            {field: "caption", type: "string", tooltip: true, title: "Caption", filterable: false},
                            {
                                field: "type",
                                title: "Input Type",
                                width: "150px",
                                filterable: false,
                                template: function (dataItem)
                                {
                                    return "text-box";
                                }
                            }
                        ],
                        dataBound: function (e) {
                            var grid = this;
                           // _this.dataBoundKendoGrid(grid);
                        }
                    };
                _this.model.gridOptions  = options;
            };

            _this.functions.initializeForm = function()
            {
                // routine to setup the form once we have the data
                _this.stateInfo = _this.config.stateInfo; // title, icon


                // setup the boot strap validator
                _this.fields.hiddenValidation =
                    {
                        excluded: !_this.validation.mandatory,
                        validators: {
                            callback:
                                {
                                    message: 'At least one ' + _this.validation.mandatory + " is required",
                                    callback: function (value, validator, $field) {
                                        let valid = (_this.data.length) > 0;
                                        return valid;
                                    }
                                }
                        }
                    };
                let formOptions = lodash.merge({} , uiSvc.getFormValidateOptions(), _this.fields);
                var form = $($($element).find("#frmCodeList")[0]);
                let fv = form.bootstrapValidator(formOptions).on('error.field.bv', function (e)
                {
                    if (_this.validation.onValidation)
                    {
                        // call the validation function
                        _this.validation.onValidation(false);
                    }
                }).on("success.field.bv", function (e, data)
                {
                    if (_this.validation.onValidation)
                    {
                        // call the validation function
                        _this.validation.onValidation(true);
                    }
                });
                _this.validation.bv = form.data('bootstrapValidator');

                // initialize this as a list controller
                _this.functions.initializeListEditor();

                // set the grid data
                _this.model.gridData = _this.data;
            };

            _this.functions.initialize  = function()
            {
                // check if we have code information but no data
                if (_this.config != null && _this.config.source != null && _this.config.source.code != null && lodash.isEmpty(_this.data))
                {
                    // get the data from the database
                    adminDataSvc.readConfigRecord(_this.config.source.code, _this.config.source.type, _this.config.source.options).then(function(data)
                    {
                        _this.data = lodash.merge(_this.data, data);
                        _this.functions.initializeForm();
                    });
                    return;
                }
                _this.functions.initializeForm();

                // setup the validator watch
                $scope.$watch("vmConfigList.validation.watchFlag", function(newValue, oldValue)
                {
                    if (!_this.validation.bv)
                        return;
                    switch (_this.validation.watchFlag.value) {
                        case 1:
                            // validate the form
                            _this.validation.bv.validate();
                            break;
                        case 2:
                            // revalidate the form
                            _this.validation.bv.resetForm();
                            _this.validation.bv.validate();
                            break;
                        default:
                    }
                });
            };
            //</editor-fold>

            _this.functions.initialize();

        }
    }
  }]);

});


