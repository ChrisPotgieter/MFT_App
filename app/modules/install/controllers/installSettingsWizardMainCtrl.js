/*
 /// <summary>
 /// app.modules.install.controllers - installSettingsWizardMainCtrl.js
 /// Controller to manage Settings Installation when First Setting up the Environment
 /// This state is the base state for the wizard and will manage all data and functions for the entire wizard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/02/2017
 /// </summary>
 */
define(['modules/install/module', 'lodash'], function (module, lodash) {

	"use strict";
    module.registerController('installSettingsWizardMainCtrl', ['$scope', '$state', '$stateParams', '$log', 'adminDataSvc', 'uiSvc', function ($scope, $state, $stateParams, $log, adminDataSvc, uiSvc)
    {

        // setup the steps
        var vm = this;

        vm.state = {};

        // initialize the state object - we have 3 states
        // record state - the state of the current record in memory
        // step state - the current state of the current step in progress
        // wizard state - the overall state of the wizard steps
        vm.state.record = {};
        vm.state.step = {};
        vm.state.form = {};
        vm.wizard = {};

        // setup any "global functions"
        vm.functions = {};

        vm.functions.initializeStep = function(model, validatorCallback, updateCallback, formValidationCallback, reverseModelCallback)
        {
            // function called by every step in the process during controller instantiation to setup variables that will be used to manage step state
            vm.showEdit = false;
            vm.state.step = {};
            vm.state.step.formValidationCallback = formValidationCallback;
            vm.state.step.reverseModelCallback = reverseModelCallback;
            vm.state.step.updateCallback = updateCallback;
            vm.state.step.validatorCallback = validatorCallback;

            vm.state.form.flag = uiSvc.formStates.INDETERMINATE;
            vm.state.form.hasChanged = false;
            vm.model = model;
        };


        vm.functions.stepContentLoaded = function(element)
        {
            // routine to initialize the bootstrap validator once the step content has been loaded and any other form initialization functions
            vm.state.step.element = element;
            vm.state.step.validator = vm.state.step.validatorCallback(); // get the validator

            if (vm.wizard.steps)
                vm.functions.setCurrentStep();
        };



        vm.functions.initialize = function()
        {
            // routine called on the load of this controller which will setup the initial record and wizard states
            vm.functions.buildInitialSteps();


            // navigate the user to the correct step in the wizard
            var inChild = lodash.find(vm.wizard.steps, function(step)
            {
                return $state.includes("^." + step.state);
            });


            // check if we are already in a child
            if (inChild)
            {
                vm.functions.setCurrentStep();
                return;
            }

            // go to the first step in the process
            $state.go("." + vm.wizard.steps[0].state);
        };



        vm.functions.buildInitialSteps = function()
        {
            // routine to build up the initial steps based on the state of the record
            var isNew = vm.state.record.isNew;
            vm.wizard.steps = [];
            vm.wizard.steps.push({state: "smtp", description: "SMTP Information", allowed: true, complete: false});
            vm.wizard.steps.push({state: "env", description: "Environment Information", allowed: false, complete: false});
            vm.wizard.steps.push({state: "wmq", description: "Default WMQ Connection Information", allowed: false, complete: false});
            vm.wizard.steps.push({state: "retention", description: "Data Retention Settings", allowed: false, complete: false});
            vm.wizard.title = "Initialize Environment";
            vm.wizard.icon = "fa-cogs";

            vm.wizard.onNavigate = function(index)
            {
                if (!vm.wizard.steps)
                    return;
                var step = vm.wizard.steps[index];
                vm.wizard.navigation(step);
            }
        };


        vm.functions.updateButtons = function()
        {
            // routine to update the buttons available on the current form based on the state of the step
            vm.wizard.buttons = [];
            if (vm.wizard.currentStep > 0)
                vm.wizard.buttons.push({text: "Previous",disabled: false,id: "prev_button",baseType: "previous", class: "btn-default", action: vm.functions.previous});

            // determine if the next button should be enabled
            vm.wizard.buttons.push({text: "Next", id:"next_button", disabled: false, baseType: "next", class: "txt-color-darken", action:vm.functions.next});
            if (vm.wizard.currentStep + 1 > (vm.wizard.steps.length - 1))
            {
                var button = lodash.find(vm.wizard.buttons, {id:"next_button"});
                if (button)
                    button.text = "Finish";
            }
        };

        vm.functions.next = function ()
        {
            // routine to advance the user to the next state based on the current state
            if (!vm.wizard.steps)
                return;

            // call the validation function if any
            if (vm.state.step.formValidationCallback)
                vm.state.step.formValidationCallback();
            else
                vm.functions.validateForm();

            // check if the form is valid
            if (vm.state.form.flag == uiSvc.formStates.INVALID)
                return;


            // call the update
            if (vm.state.step.updateCallback)
                vm.state.step.updateCallback();
        };

        vm.functions.moveNext = function()
        {
            // routine to move to the next step when the update completes
            // the step controller will be responsible for calling this
            // update the flags
            var currentStep = vm.wizard.steps[vm.wizard.currentStep];
            currentStep.complete = true;

            // check if we are done
            var nextStepIndex = vm.wizard.currentStep + 1;
            if (nextStepIndex > vm.wizard.steps.length - 1)
            {
                // end out
                return;
            }

            // move to the next step
            var nextStep = vm.wizard.steps[nextStepIndex];
            if (nextStep)
            {
                nextStep.allowed = true;
                $state.go("^." + nextStep.state);
                return;
            }
        };



        vm.functions.previous = function ()
        {
            // routine to advance the user to the previous state based on the current state
            var previousIndex = vm.wizard.currentStep - 1;
            if (previousIndex < 0)
                return;
            vm.wizard.onNavigate(previousIndex);
        };

        vm.functions.validateForm = function()
        {
            // routine to validate the form
            vm.state.step.validator.validate();
            var isValid = vm.state.step.validator.isValid();
            if (isValid)
                vm.state.form.flag = uiSvc.formStates.VALID;
            else
                vm.state.form.flag = uiSvc.formStates.INVALID;
        };

        vm.functions.setCurrentStep = function()
        {
            // work out the current step
            vm.wizard.currentStep = lodash.findIndex(vm.wizard.steps, function(step)
            {
                return $state.includes("^." + step.state);
            });


            // now validate the form
            var step = vm.wizard.steps[vm.wizard.currentStep];
            step.allowed = true;
            if (step.complete && vm.state.step.validator)
                vm.functions.validateForm();

            // update the buttons
            vm.state.form.hasChanged = false;
            vm.functions.updateButtons();
        };

        vm.wizard.navigation = function(step)
        {
            if (!vm.state.form.hasChanged)
            {
                // now validation necessary - just go back to the previous step
                $state.go("^." + step.state);
                return;
            }
            else
            {
                var confirmAbandon = function(ButtonPressed)
                {
                    // routine to handle the logout request from the user
                    if (ButtonPressed == "Yes")
                    {
                        if (vm.state.step.reverseModelCallback)
                            vm.state.step.reverseModelCallback();
                        $state.go("^." + step.state);
                    };
                };

                // ask if the user wishes to discard changes
                var html = "<i class='fa fa-sign-out txt-color-red'></i>Abort <span class='.txt-color-white'>  Changes </span>";
                uiSvc.showSmartAdminBox(html, "Are you sure you wish to abandon the Changes made ?",'[No][Yes]', confirmAbandon);
            }
        };



        // initialize the form
        vm.functions.initialize();

    }]);

});
