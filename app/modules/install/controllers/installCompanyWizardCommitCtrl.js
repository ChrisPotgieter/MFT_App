/*
 /// <summary>
 /// app.modules.install.controllers - installCompanyWizardCommitCtrl.js
 /// Controller to manage Installation Process - Add Company Wizard  - Final Commit Summary
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Created By Mac Bhyat
 /// Date: 22/02/2017
 /// </summary>
 */
define(['modules/install/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

	"use strict";

	module.registerController('installCompanyWizardCommitCtrl', ['$scope', '$log', '$state','$timeout','$element','uiSvc','adminDataSvc', 'cacheDataSvc', function ($scope, $log, $state,$timeout,divElement,uiSvc, adminDataSvc, cacheDataSvc) {


        var field_validation = function(isError)
        {
            // custom validation processing - nothing to do here as bootstrapvalidator will handle everything
        };

        var form_validation = function()
        {
            // validate the form
            $scope.vm.state.form.flag = uiSvc.formStates.VALID;
        };

        var finalize = function(companyResult)
        {
            cacheDataSvc.initializeLists().then(function()
            {
                uiSvc.showExtraSmallPopup("New Company Insertion", "The company Has been inserted Successfully ! <br>Company Id: " + "<b>"  + companyResult.company.id + "</b>", 5000);
                $state.go("login");

            }).catch(function(err)
            {
                $log.error("Unable to Refresh Company List", err);
            });
        };

        var updateFunction = function()
        {
            // function to run to update the database and navigate the user to the login
            adminDataSvc.saveCompanyProfile($scope.vm.model).then(function(companyResult)
            {
                finalize(companyResult);
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
