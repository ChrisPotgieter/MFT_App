/*
 /// <summary>
 /// modules.common.directives.input - mqaDeptCombo.js
 /// Directive to Manage Department Selection
 /// This directive Manages Department Selection including Role Management

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/09/2017
 /// </summary>
 */

define(['modules/common/module', 'lodash'], function(module, lodash){
  "use strict";

  module.registerDirective('mqaDeptCombo', ['userSvc', 'cacheDataSvc', function(userSvc, cacheDataSvc){
    return {
        restrict: 'E',
        scope:{},
        bindToController:{
            ngModel:'='
        },
        controller: function($element)
        {
            // get all departments for the user
            var _this = this;
            _this.functions = {};
            _this.functions.releaseLock = function(item, model)
            {
                // unlock all items
                lodash.forEach(_this.departments, function(dept) {
                    dept.status = "unlocked";
                });
            };
            _this.functions.applyLock = function(item, model)
            {
                // when an item is removed apply a lock to all items in the model if the model contains only 1
                if (_this.ngModel.length == 1)
                {
                    var foundDept = lodash.find(_this.departments, {id: _this.ngModel[0]});
                    foundDept.status = "locked";
                }
            };

            _this.flags = {disabled: !userSvc.hasFeature(userSvc.commonFeatures.TRANS_FILTER_ALL), lock: false};

            let companyDepartments = cacheDataSvc.getCompanyDepartments(userSvc.getProfile().companyId).departments;
            _this.departments = [];
            if (_this.flags.disabled)
            {
                // check if the user department list is > 1
                var updateModel = false;
                if (_this.ngModel.length == 0)
                    updateModel = true;
                lodash.forEach(userSvc.getProfile().departments, function(dept)
                {
                    var deptRecord = lodash.find(companyDepartments, {id: dept});
                    if (deptRecord != null)
                    {
                        var item = angular.copy(deptRecord);
                        item.status = "unlocked";
                        _this.departments.push(item);
                        if (updateModel)
                            _this.ngModel.push(item.id);
                    }
                });
                _this.flags.lock = _this.departments.length > 1;
                _this.flags.disabled = !(_this.departments.length > 1);
            }
            else
            {
                _this.departments = companyDepartments;
            }
        },
        controllerAs:'vmDept',
        templateUrl: 'app/modules/common/directives/input/mqaDeptCombo.tpl.html'
    }
  }]);

});


