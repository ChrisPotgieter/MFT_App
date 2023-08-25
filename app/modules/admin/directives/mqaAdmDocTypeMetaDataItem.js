/*
 /// <summary>
 /// modules.admin.directives - mqaAdmDocTypeMetaDataItem.js
 /// Administration Module Directive to Manage Document Type Meta-Data Indexes CRUD
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 3/4/2015
 /// </summary>
 */
define(['modules/admin/module', 'lodash','bootstrap-validator', 'notification'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmDocTypeMetaDataItem', ['$filter', function($filter){
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: "app/modules/admin/directives/mqaAdmDocTypeMetaDataItem.tpl.html",
        link: function($scope, form, attrs)
        {
            // add the bootstrap validator
            var formOptions = lodash.merge({}, { submitButtons: 'button[id="submit"]'},
            uiSvc.getFormValidateOptions(),{
                fields : {
                    key : {
                        autofocus: true,
                        group : '.col-md-6',
                        validators : {
                            notEmpty : {
                                message : 'The Meta Key is required'
                            },
                            callback:
                            {
                                message: 'The Meta Key is already in use',
                                callback: function (value, validator, $field)
                                {
                                    return $scope.validate(value, validator, $field);
                                }
                            }
                        }
                    },
                    description : {
                        group : '.col-md-6',
                        validators : {
                            notEmpty : {
                                message : 'The Index Field Description is required'
                            }
                        }
                    }
                }

            });
            form.bootstrapValidator(formOptions);
            form.on('success.field.bv', function(e, data)
            {
                var result = data.bv.isValid();
                data.bv.disableSubmitButtons(!result);
            });

            // setup the form
            $scope.mode = 0;
            if ($scope.model.item.code)
                $scope.mode = 1;

            var addMetaItem = function(itemRecord)
            {
                // routine to add an item to the list of meta-data indexes for the document type
                // validate that the code is not already in the list
                if (!$scope.model.items)
                    $scope.model.items = [];
                $scope.model.items.push(itemRecord);
            };

            var removeMetaItem = function(itemRecord)
            {
                var metaRecord = lodash.find($scope.model.items, {code: itemRecord.code});
                if (metaRecord)
                    lodash.remove($scope.model.items, {code: itemRecord.code});
            };

            var updateMetaItem = function(itemRecord)
            {
                // routine to find the item in the index list and update it
                removeMetaItem(itemRecord);
                addMetaItem(itemRecord);
            };


            $scope.save = function(metaDataItem)
            {
                // routine to handle the meta data crud methods
                if ($scope.mode == 0)
                    addMetaItem(metaDataItem);
                else
                    updateMetaItem(metaDataItem);
                    uiSvc.closeDialog($scope.dialogId, $scope.model.items);
            };

            $scope.delete = function(metaDataItem)
            {
                $.SmartMessageBox({
                    title: "Meta Index Deletion!",
                    content: "Are you sure to wish to delete " + metaDataItem.code,
                    buttons: '[No][Yes]'
                }, function (ButtonPressed) {
                    if (ButtonPressed === "Yes")
                    {
                        removeMetaItem(metaDataItem);
                        uiSvc.closeDialog($scope.dialogId, $scope.model.items);
                    }
                });
            };

            $scope.cancel = function () {
                uiSvc.cancelDialog($scope.dialogId);
            };


            $scope.validate = function (value, validator, $field)
            {
                // routine to validate that metadata index key is not already defined
                var metaRecord = lodash.find($scope.model.items, {code: value});
                if (!metaRecord)
                    return true;
                return false;
            };
        }
    }
  }]);

});


