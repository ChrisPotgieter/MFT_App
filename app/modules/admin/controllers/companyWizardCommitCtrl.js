/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardCommitCtrl.js
 /// Controller to manage New Company Wizard - Final Commit Summary
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */
define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

	"use strict";

	module.registerController('companyWizardCommitCtrl', ['$scope', '$log', '$state','$timeout','$element','uiSvc','adminDataSvc', 'cacheDataSvc', function ($scope, $log, $state,$timeout,divElement,uiSvc, adminDataSvc, cacheDataSvc) {


        var field_validation = function(isError)
        {
            // custom validation processing - nothing to do here as bootstrapvalidator will handle everything
        };

        var form_validation = function()
        {
            // validate the form
            $scope.vm.state.form.flag = uiSvc.formStates.VALID;
        };

        var updateFunction = function()
        {
            // function to run when in non-new company mode and we want to update the database directly
            adminDataSvc.saveCompanyProfile($scope.vm.model).then(function(result)
            {
                cacheDataSvc.initializeLists().then(function(err)
                {
                    uiSvc.showExtraSmallPopup("New Company Insertion", "The company Has been inserted Successfully ! <br>Company Id: " + "<b>"  + result.company.id + "</b>", 5000);
                    $state.go("app.admin.dashboard");
                }).catch(function(err)
                {
                    $log.error("Unable to refresh company lists");
                })
            }).catch(function (err) {
                $log.error("Unable to insert Company", err);
            })
        };

        $scope.vm.functions.initializeStep(null, field_validation, updateFunction, form_validation, null);

        $scope.$on('$viewContentLoaded', function()
        {

            // when the DOM has loaded initialize BV
           $timeout(function()
           {
                var formElement = $(divElement).first();
                $scope.vm.functions.stepContentLoaded(formElement);
           }, 500);
        });
    }]);
});
