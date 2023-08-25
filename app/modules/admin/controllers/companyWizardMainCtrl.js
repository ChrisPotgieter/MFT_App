/*
 /// <summary>
 /// app.modules.admin.controllers - companyWizardMainCtrl.js
 /// Controller to manage Company Wizard
 /// This state is the base state for the company wizard and will manage all data and functions for the entire company wizard
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 09/02/2017
 /// </summary>
 */
 define(['modules/admin/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {

	"use strict";
    module.registerController('companyWizardMainCtrl', ['$scope', '$state', '$stateParams', '$log', 'cacheDataSvc','adminDataSvc', 'uiSvc', function ($scope, $state, $stateParams, $log, cacheDataSvc, adminDataSvc, uiSvc)
    {

        // setup the steps
        var vm = this;

        // initialize the variables
        vm.model = {};
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
        vm.functions.buildInitialSteps = function()
        {
            // routine to build up the initial steps based on the state of the record
            var isNew = vm.state.record.isNew;
            vm.wizard.steps = [];
            vm.wizard.steps.push({state: "basic", description: "Basic Information", allowed: true, complete: !isNew, allowUpdate:true});
            vm.wizard.steps.push({state: "role", description: "Role Information", complete: !isNew, allowed: !isNew, allowUpdate:false});
            if (isNew)
            {
                vm.wizard.steps.push({state: "adminuser", description:"Admin User", allowed: false, complete: false});
                vm.wizard.steps.push({state: "commit_summary", description: "Complete", allowed: false, complete: false});
                vm.wizard.title = "Add Company";
            }
            else
            {
                vm.wizard.steps.push({state: "users", description: "Users", complete: true, allowed: true});
                vm.wizard.title = "Update Company";
            }
            vm.wizard.icon = "fa-building";

            // update the complete and allowed flags
            vm.functions.addActiveDirectoryStep();

            // setup the wizard click event
            vm.wizard.onNavigate = function(index)
            {
                if (!vm.wizard.steps)
                    return;
                var step = vm.wizard.steps[index];
                vm.wizard.navigation(step);
            }
        };

        vm.functions.addActiveDirectoryStep = function()
        {
            if (vm.model.hasActiveDirectory)
            {
                if (!vm.model.activeDirectoryInfo)
                    vm.model.activeDirectoryInfo = {};
                // add the active directory step
                var step = lodash.find(vm.wizard.steps, {state: "addomains"});
                if (step == null)
                {
                    // replace the user step
                    var step;
                    if (vm.state.record.isNew)
                        step = {state: "ad_adminuser", description:"Admin User", allowed: false, complete: false};
                    else
                        step = {state: "ad_users", description:"Users", allowed: true, complete: true};

                    var index = lodash.findIndex(vm.wizard.steps, function(step)
                    {
                        return (step.state == "adminuser" || step.state == "users");
                    });
                    vm.wizard.steps[index] = step;

                    // add the active directory step
                    var step = {state: "addomains", description:"Active Directory", allowed: true, complete: !vm.state.record.isNew};
                    vm.wizard.steps.splice(1,0, step);
                }
            }
            else
            {
                // remove the active directory from the wizard steps
                var index = lodash.findIndex(vm.wizard.steps, function(step)
                {
                    return (step.state == "ad_users" || step.state == "ad_adminuser");
                });
                var step;
                if (vm.state.record.isNew)
                    step = {state: "adminuser", description:"Admin User", allowed: false, complete: false};
                else
                    step = {state: "users", description:"Users", allowed: true, complete:true};
                vm.wizard.steps[index] = step;

                // remove the ad step
                vm.model.activeDirectoryInfo = null;
                lodash.remove(vm.wizard.steps, {state: "addomains"});
            }
        };
        /*
        vm.functions.updateStepList = function()
        {
            // routine to update the header steps as the current step is initialized
            vm.wizard.currentStep = lodash.findIndex({state: $state.current});
            if (vm.wizard.currentStep > -1)
            {
                var currentStep = vm.wizard.steps[vm.wizard.currentStep];
                currentStep.complete = false;
                currentStep.allowed = true;

                // now update the status of all steps after this one
                for (var i = vm.wizard.currentStep; i < vm.wizard.steps.length; i++)
                {
                    var step = vm.wizard.steps[i];
                    if (step.validateFunct)
                    {
                        var stepValid = step.validateFunc();
                        step.complete = stepValid;
                    }
                    if (step.complete && !step.allowed)
                        step.allowed = true;
                }
            }
        };
        */

        vm.functions.getDepartments = function()
        {
            // build the list of departments during the company wizard
            var departmentIndex = -1;
            var deptList = lodash.map(vm.model.company.departments, function(record)
            {
                if (record.id > departmentIndex)
                    departmentIndex = record.id;
                return {id:record.id, name: record.name}
            });

            lodash.forEach(vm.model.departmentNames, function(name)
            {
                var  foundRecord = lodash.find(deptList, {name: name});
                if (foundRecord == null)
                {
                    departmentIndex++;
                    deptList.push({id: departmentIndex, name: name});
                }
            });
            return deptList;
        };

        
        vm.functions.updateButtons = function()
        {
            // routine to update the buttons available on the current form based on the state of the step
            vm.wizard.buttons = [];
            let currentStep =vm.wizard.steps[vm.wizard.currentStep];

            if (vm.wizard.currentStep > 0)
                vm.wizard.buttons.push({text: "Previous",disabled: false,id: "prev_button",baseType: "previous", class: "btn-default", action: vm.functions.previous});

            // determine if the next button should be enabled
          if(currentStep.allowUpdate == null || currentStep.allowUpdate)
          {
            vm.wizard.buttons.push({text: vm.state.record.isNew ? "Next" : "Update", id:"next_button", disabled: false, baseType: "next", class: "txt-color-darken", action:vm.functions.next});
          }
            if (vm.wizard.currentStep + 1 > (vm.wizard.steps.length - 1) && vm.state.record.isNew)
            {
                var button = lodash.find(vm.wizard.buttons, {id:"next_button"});
                if (button)
                    button.text = "Finish";
            }
        };

        vm.functions.initializeStep = function(bvRules, fieldValidationCallback, updateCallback, formValidationCallback, reverseModelCallback)
        {
            // function called by every step in the process during controller instantiation to setup variables that will be used to manage step state
            vm.showEdit = false;
            vm.state.step = {};
            vm.state.step.bvRules = bvRules;
            vm.state.step.fieldValidationCallback = fieldValidationCallback;
            vm.state.step.formValidationCallback = formValidationCallback;
            vm.state.step.reverseModelCallback = reverseModelCallback;
            vm.state.step.updateCallback = updateCallback;

            vm.state.form.flag = uiSvc.formStates.INDETERMINATE;
            vm.state.form.hasChanged = false;
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

        vm.functions.stepContentLoaded = function(element)
        {
            // routine to initialize the bootstrap validator once the step content has been loaded and any other form initialization functions
            vm.state.step.element = element;
            if (vm.state.step.bvRules)
            {
                vm.state.step.validator = uiSvc.setupBootstrapValidator(vm.state.step.element, vm.state.step.bvRules, function (isError)
                {
                    // if the validator has run the form has changed in some way
                    vm.state.form.hasChanged = true;
                    vm.state.step.fieldValidationCallback(isError);
                });
            }
            if (vm.wizard.steps)
                vm.functions.setCurrentStep();
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
            if (step.complete && vm.state.step.validator)
                vm.functions.validateForm();

            // update the buttons
            vm.state.form.hasChanged = false;
            vm.functions.updateButtons();
        };

        /*
        vm.functions.setupSteps = function()
        {
            // routine to update the steps of the wizard based on the state of the record and the current form state



            // setup the wizard configuration
            vm.wizard = {};
            vm.wizard.steps = [];
            vm.wizard.steps.push({state: "basic", description: "Basic Information", allowed: true});
            vm.wizard.steps.push({state: "role", description: "Role Information", allowed: false});
            vm.wizard.steps.push({state: "admin", description: "Admin Information", allowed: false});
            vm.wizard.steps.push({state: "complete", description: "Complete", allowed: false});
            vm.wizard.icon = "fa-check";
            vm.wizard.title = "Add Company";
            vm.wizard.currentStep = 0;
            vm.wizard.buttons = []; // sub views will update the buttons as required

        };
        */

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
            if (vm.state.record.isNew)
            {
                // update the current step
                var currentStep = vm.wizard.steps[vm.wizard.currentStep];
                currentStep.complete = true;

                // move to the next step
                var nextStepIndex = vm.wizard.currentStep + 1;
                if (nextStepIndex > vm.wizard.steps.length - 1)
                {
                    // call the update step
                    if (vm.state.step.updateCallback)
                    {
                        vm.state.step.updateCallback();
                        return;
                    }
                }
                var nextStep = vm.wizard.steps[nextStepIndex];
                if (nextStep)
                {
                    nextStep.allowed = true;
                    $state.go("^." + nextStep.state);
                    return;
                }
            }
            else
            {
                // call the update
                if (vm.state.step.updateCallback)
                {
                    vm.state.step.updateCallback();
                    return;
                }
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

        vm.functions.initialize = function()
        {
            // routine called on the load of this controller which will setup the initial record and wizard states
            vm.state.record = {isNew: false};
            if ($stateParams.id)
            {
                adminDataSvc.readCompanyProfile({id: $stateParams.id}).then(function(result)
                {
                    vm.model = result;

                    // now update the record state
                    vm.state.record.isNew = (vm.model.company.id == 0);

                    // setup the initial wizard steps
                    vm.functions.buildInitialSteps();


                    // navigate the user to the first step in the wizard
                    var inChild = lodash.find(vm.wizard.steps, function(step)
                    {
                        return $state.includes("^." + step.state);
                    });


                    // check if we are already in the basic controller
                    if (inChild && inChild.state == "basic")
                    {
                        vm.functions.setCurrentStep();
                        return;
                    }

                    if (inChild)
                        $state.go("^.basic");
                    else
                        $state.go(".basic");

                }).catch(function(err)
                {
                    $log.error("Company Wizard Initialization Error", err, $stateParams.id);
                });

            }
        };
        cacheDataSvc.initializeLists();
        vm.functions.initialize();
    }]);

});
