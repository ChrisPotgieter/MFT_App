/*
 /// <summary>
 /// modules.admin.directives - mqaAdmDocTypeEditForm.js
 /// Administration Module Directive to Manage Document Type CRUD
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 13/4/2015
 /// </summary>
 */

define(['modules/admin/module', 'lodash','bootstrap-validator'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmDocTypeEditForm', ['$stateParams', '$log', '$filter', 'cacheDataSvc', 'adminDataSvc','uiSvc', function($stateParams, $log, $filter, cacheDataSvc, adminDataSvc, uiSvc){
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: "app/modules/admin/directives/mqaAdmDocTypeEditForm.tpl.html",
        link: function($scope, form, attrs)
        {
            // add the bootstrap validator
            $scope.allowSave = true;
            var formOptions = lodash.merge({}, {submitButtons: 'button[id="submit-main"]'}, uiSvc.getFormValidateOptions(),{
                fields : {
                    description : {
                        group : '.col-md-12',
                        validators : {
                            notEmpty : {
                                message : 'Description is required'
                            }
                        }
                    },
                    docIdTitle : {
                        group : '.col-md-12',
                        validators : {
                            notEmpty : {
                                message : 'Id Caption is Required'
                            }
                        }
                    }

                }

            });
            form.bootstrapValidator(formOptions);

            // setup the functions
            var editMetaRecord = function(editRecord)
            {
                // bring up a ui dialog
                let controlOptions = {};
                controlOptions.templateUrl = "app/modules/admin/partials/doc-type-edit-meta.tpl.html";
                controlOptions.controller = "mftTransactionItemDrillDialogCtrl";
                controlOptions.size = 'lg';
                controlOptions.controllerAs = "vmDialog";
                var model = {};
                model.items = angular.copy($scope.record.jsonData.metaIndexes);
                model.item = angular.copy(editRecord);
                let result = uiSvc.showDialog(model, controlOptions);
                $scope.record.jsonData.metaIndexes = result;
            };

            $scope.metaIndexDrill = function(metaRecord)
            {
                // routine to setup the drilling on the meta-index
                if (metaRecord)
                {
                    // cause the dialog to open
                    editMetaRecord(metaRecord);
                }
            };

            $scope.metaIndexAdd = function()
            {
                editMetaRecord({});
            };

            $scope.saveRecord = function()
            {
                // routine to save the record to the database via an api post
                $scope.allowSave = false;
                var promise = adminDataSvc.saveCustomerList($scope.record);
                promise.then(function (result)
                {
                    cacheDataSvc.updateCacheList("1", result);
                    uiSvc.showSmallPopup();
                    $scope.allowSave = true;
                }).catch(function (result)
                {
                    $scope.allowSave = true;
                    $log.error("Unable to file document parameter update", result);
                });
            };


            // now that we have the records update the variables we need
            $scope.record = null;


            // get the record we are dealing with
            if ($stateParams.id) {
                var items = cacheDataSvc.getListForType("1", "DocType");
                if (items) {
                    var foundRecords = lodash.filter(items, {code: $stateParams.id});
                    if (foundRecords && foundRecords.length > 0)
                        $scope.record = angular.copy(foundRecords[0]);  // create a copy because if the user does not save, nothing must change
                }

            }
        }
    }
  }]);

});


