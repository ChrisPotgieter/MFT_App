/*
 /// <summary>
 /// app.modules.common.services - uiSvc.js
 /// Service to Manage Dashboard Framework Functions
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 03/01/2022
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment', 'appConfig', 'appCustomConfig'], function(module, lodash, moment, appConfig, appCustomConfig)
{
    "use strict";
    moment().format();

    module.registerService('dashboardSvc',['$timeout', '$filter', '$log', '$q', 'uiSvc', 'chartSvc', 'userSvc', 'cacheDataSvc', 'transactionReportingSvc', function($timeout, $filter, $log, $q, uiSvc, chartSvc, userSvc, cacheDataSvc, transactionReportingSvc)
    {
        var _this = this;
        _this.dashboardStates = {INITIALIZE: -1, CUSTOM: 0, INITIALIZE_COMPLETE: 1, REALTIME: 2};
        _this.functions = {};


        //<editor-fold desc="Dashboard Controller Functions">
        _this.functions.initializeDashboardController = function(controller, scope, dashboardConfig, dialogDetails)
        {
            // routine to initialize the given controller with all functions to run as a dashboard controller

            controller.model = {dialogData:{}};
            controller.model.updateType = _this.dashboardStates.INITIALIZE;
            controller.model.flags = {inProgress: false, showCompare: false};
            controller.model.settings = {};
            controller.model.currentData = {};
            controller.model.compareData = {lastFilter: null};


            // set the dashboard configuration options
            controller.model.dashboardConfig = dashboardConfig;

            // see if we have options for the lists
            if (!dashboardConfig.timeButtons)
                dashboardConfig.timeButtons = lodash.cloneDeep(_this.functions.getDateSelectorOptions());
            if (!dashboardConfig.intervals)
                dashboardConfig.intervals = lodash.cloneDeep(_this.functions.getIntervalOptions());
            if (dashboardConfig.hasCompare && !dashboardConfig.compareButtons)
                dashboardConfig.compareButtons = lodash.cloneDeep(_this.functions.getCompareOptions());

            if (appCustomConfig.runMode == uiSvc.modes.DEMO)
                dashboardConfig.selector = lodash.merge({refresh: 0, time: 3, compare: 0}, dashboardConfig.selector);
            else
                dashboardConfig.selector = lodash.merge({refresh: 0, time: 0, compare: 0}, dashboardConfig.selector);

            // initialize the timers
            controller.timer = null;

            // setup the functions
            if (!controller.functions)
                controller.functions = {};


            controller.functions.showFilterDialog = _this.functions.initializeDashboardFilterDialog(controller, dialogDetails);

           // initialize blank functions - these can be overridden after this call if needed
           if (!controller.functions.performServerRequest)
               controller.functions.performServerRequest = function(requestObject){};
            if (!controller.functions.parseServerData)
                controller.functions. parseServerData = function(serverData, period){};
            if (!controller.functions.onUserSettings)
                controller.functions.onUserSettings = function(){};
            if (!controller.functions.onInitialize)
                controller.functions.onInitialize = function(initialLoad){};
            if (!controller.functions.onInitializeWidgets)
                controller.functions.onInitializeWidgets = function(initialLoad){};
            if (!controller.functions.onInitializeUserSettings)
                controller.functions.onInitializeUserSettings = function(userConfig){};
            if (!controller.functions.onInitializeTheme)
                controller.functions.onInitializeTheme = function(){};
            if (!controller.functions.onServerRequestComplete)
            {
                controller.functions.onServerRequestComplete = function (currentFilter)
                {
                    // update the state object
                    if (controller.model.updateType == _this.dashboardStates.INITIALIZE)
                        controller.model.updateType = _this.dashboardStates.INITIALIZE_COMPLETE;
                }
            }

            // initialize other common functions
            controller.functions.getUserSetting = function(userConfig, setting, defaultValue)
            {
                // routine to return a user defined option for the given setting with a default value
                return lodash.get(userConfig, _this.functions.getConfigKey(controller.model.dashboardConfig) + setting, defaultValue);
            };
            controller.functions.donutPercFormatter  = function(value, data, values)
            {
                // routine to return a percentage donuts
                if (!values)
                    values = [];
                let total = values.reduce(function(a, b)
                {
                    if (a && a.value) return a.value + b.value;
                    else
                        return a + b.value
                }, 0);
                let perc = (value/total *100);
                return $filter('number')(perc, 2) + "%";
            };

            controller.functions.buildDonut = function (data, donutIndex, descFunction, colorFunction, period)
            {
                // generic routine to build up a donut
                var updateObject = controller.model.currentData.groups;
                if (period == 2)
                    updateObject = controller.model.compareData.groups;
                updateObject.data[donutIndex].chartData = [];
                lodash.forEach(data, function(obj)
                {
                    if (obj.count > 0)
                    {
                        let desc = null;
                        if (descFunction != null)
                            desc = descFunction(obj._id);
                        if (desc == null)
                            desc = obj._id;
                        let morrisObject = {label: desc, value: obj.count};
                        if (colorFunction != null)
                            colorFunction(obj._id, morrisObject);
                        updateObject.data[donutIndex].chartData.push(morrisObject);
                    }
                });
            };

            controller.functions.initializeDonuts = function(dataObject, captionList)
            {
                // routine to intialize the donuts with the given donut captions
                dataObject.groups = {data: []};
                dataObject.groups.update = {value: 0};

                lodash.forEach(captionList, function(caption)
                {
                    dataObject.groups.data.push({title: caption, chartData: []});
                });
            };

            controller.functions.getStatusColor = function(id, returnObject)
            {
                if (id >= 90)
                    returnObject.color = controller.model.theme.colorNames.error;
            };

            controller.functions.initializeBarSeries = function(seriesArr, modelObj, horiz)
            {
                // routine to initialize bar series
                modelObj.series = [];

                lodash.forEach(seriesArr, function (series, index)
                {
                    let color = series.color;
                    modelObj[series.seriesName] = {label: series.label, options:{}, data:[]};

                    modelObj[series.seriesName].options.chartJS = {
                        label: series.label,
                        borderColor: color,
                        backgroundColor: color,
                        fill: false
                    };


                    if (series.axis)
                    {
                        if (horiz) {
                            modelObj[series.seriesName].options.chartJS.xAxisID = series.axis;
                        }
                        else
                            modelObj[series.seriesName].options.chartJS.yAxisID = series.axis;
                    }
                    modelObj.series.push(modelObj[series.seriesName]);
                });
            };



            controller.functions.initializeTheme = function()
            {
                // initialize the theme
                var palette = _this.functions.getDashboardPalette();
                controller.model.theme = {colorArray:palette.colors, colorNames:{}, opacity: palette.opacity};
                controller.functions.onInitializeTheme();
                //</editor-fold>
            };


            controller.functions.initialize = function()
            {
                // routine to intialize the dashboard - this must be called after this function call to trigger dashboard start
                controller.functions.initializeTheme();
                controller.functions.onInitialize(true);
                controller.functions.onInitializeWidgets(true);

                userSvc.getUserSettings().then(function (config)
                {
                    controller.functions.onInitializeUserSettings(config);

                    controller.functions.loadState(config);


                    // perform the initial refresh
                    controller.functions.manageRefresh(true);
                });
            };

            controller.functions.destroy = function()
            {
                // routine to handle the destruction of the controller
                controller.functions.cancelTimer();
                if (controller.functions.onDestroy)
                    controller.functions.onDestroy();
            };

            controller.functions.updateWidgetStatus = function(enable, isCompare)
            {
                // routine to update Widget status when performing a refresh - we can either enable or disable certain components
                if (dashboardConfig.widgetStatus)
                {
                    let components = isCompare ? lodash.get(dashboardConfig.widgetStatus, "compare", null) : lodash.get(dashboardConfig.widgetStatus, "current", null);
                    if (components)
                    {
                        lodash.forEach(components, function (value) {
                            uiSvc.displayKendoLoader(value, !enable)
                        });
                    }
                }
                if (controller.functions.onUpdateWidgetStatus)
                    controller.functions.onUpdateWidgetStatus(enable, isCompare);
            };

            controller.functions.refreshData = function()
            {
                // routine to perform the required server call and refresh the dashboard
                controller.model.flags.inProgress = true;
                controller.functions.updateWidgetStatus(false, false);

                // get the request filter
                controller.model.requestObject = controller.functions.getRequestFilter();

                // now perform the call
                controller.functions.performServerRequest(controller.model.requestObject).then(function(result)
                {
                    try
                    {
                        controller.functions.parseServerData(result, 1); // current period

                        controller.functions.manageTimer();

                        controller.functions.updateTitle(controller.model.requestObject);

                        // perform and finalization logic if the request completed successfully
                        $timeout(function () {
                            controller.functions.onServerRequestComplete(controller.model.requestObject);
                        }, 200);
                    }
                    finally
                    {
                        controller.functions.updateWidgetStatus(true, false);
                        controller.model.flags.inProgress = false;
                    }
                }).catch(function (result)
                {
                    $log.error("Unable to retrieve Dashboard Information", result);
                    controller.functions.updateWidgetStatus(true, false);
                    controller.model.flags.inProgress = false;

                });
            };

            controller.functions.refreshCompareData = function()
            {
                // routine to get comparison information if a comparison is request
                let compareFilter = controller.functions.getCompareFilter();
                if (compareFilter == null)
                    return;

                // check if the previous compare filter is equal to this one, if they are there is no reason to do a compare
                if (controller.model.compareData.lastFilter != null)
                {
                    if (lodash.isEqual(controller.model.compareData.lastFilter, compareFilter))
                        return;
                }
                $timeout(function ()
                {
                    controller.functions.updateWidgetStatus(false, true);
                    controller.model.flags.inProgress = true;
                    controller.functions.performServerRequest(compareFilter).then(function (result)
                    {
                        try
                        {
                            controller.functions.parseServerData(result, 2); // comparsion period
                            controller.functions.updateCompareTitle(compareFilter);
                        }
                        finally
                        {
                            controller.functions.updateWidgetStatus(true, true);
                            controller.model.compareData.lastFilter = compareFilter;
                            controller.model.flags.inProgress = false;
                        }
                    }).catch(function (result)
                    {
                        $log.error("Unable to retrieve Comparison Dashboard Information", result);
                        controller.functions.updateWidgetStatus(true, true);
                        controller.model.flags.inProgress = false;
                    });
                }, 200);
            };

            controller.functions.manageRefresh = function(refreshCompare)
            {
                // routine to manage the refresh of the dashboard based on the given flag
                controller.functions.refreshData();

                // check for comparison
                if (controller.model.dashboardConfig.hasCompare && refreshCompare)
                {
                    controller.model.flags.showCompare = controller.model.dialogData.selectedCompare.value.time > -1;
                    if (controller.model.flags.showCompare)
                        controller.functions.refreshCompareData();
                }
            };

            controller.functions.cancelTimer = function()
            {
                // default routine to stop the timer as needed
                if (!controller.timer)
                    return;
                let cancelled = $timeout.cancel(controller.timer);
                controller.timer = null;
            };

            controller.functions.manageTimer = function()
            {
                // routine to manage the timer for this dashboard after refreshing the current dataset
                controller.functions.cancelTimer();
                if (controller.model.dialogData.refreshInterval > 0)
                {
                    let seconds = controller.model.dialogData.refreshInterval;
                    if (controller.timer == null)
                    {
                        controller.timer = $timeout(function () {
                            controller.functions.manageRefresh(false);
                        }, seconds * 1000);
                    }
                }
            };

            controller.functions.calcDates  = function(filterObject, parameter, dateRange)
            {
                // routine to update the given filter object with dates based on the parameter and given date range object
                if (parameter.allowChange && dateRange.startDate)
                {
                    // use whatever the user entered
                    filterObject.fromDate = dateRange.startDate;
                    filterObject.toDate = dateRange.endDate;
                }
                else
                {
                    // use the button selection
                    filterObject.toDate = moment().set({second: 59, millisecond: 999});
                    filterObject.fromDate = moment(filterObject.toDate).subtract(parameter.time, parameter.measure);
                    if (parameter.subtractEnd)
                        filterObject.toDate =  moment(filterObject.toDate).subtract(1, "days");
                    if (parameter.startWeek)
                        filterObject.fromDate = moment(filterObject.fromDate).day(parameter.startWeek);
                    if (parameter.startDay)
                        filterObject.fromDate =  filterObject.fromDate.set({hour: 0, minute: 0, second: 1});
                    if (parameter.endWeek)
                        filterObject.toDate = moment(filterObject.toDate).day(parameter.endWeek);
                    if (parameter.endDay)
                        filterObject.toDate = filterObject.toDate.set({hour: 23, minute: 59, second: 59, millisecond: 999});
                }
                filterObject.fromDate = filterObject.fromDate.set({second: 0, millisecond: 0});
                filterObject.toDate = filterObject.toDate.set({second: 59, millisecond: 999});
            };


            controller.functions.getRequestFilter = function()
           {
                // routine to return the filter for the current data
               let baseObject = lodash.cloneDeep(controller.model.dialogData.filter);

               // now determine the date selection based on the date type in the dialog
               if (controller.model.dialogData.selectedDate)
                   controller.functions.calcDates(baseObject, controller.model.dialogData.selectedDate.value, controller.model.dialogData.selectedDateRange);
               baseObject.isComparision = false;
               if (controller.functions.onRequestFilter)
                   controller.functions.onRequestFilter(baseObject);
               return baseObject;
           };

            controller.functions.getCompareFilter = function()
            {
                // routine to return the filter for the comparision
                let baseObject = lodash.cloneDeep(controller.model.dialogData.filter);

                // now determine the date selection based on the date type in the dialog
                if (controller.model.dialogData.selectedCompare)
                    controller.functions.calcDates(baseObject, controller.model.dialogData.selectedCompare.value, controller.model.dialogData.selectedCompareDateRange);
                baseObject.isComparision = true;
                if (controller.functions.onCompareFilter)
                   controller.functions.onCompareFilter(baseObject);
                return baseObject;
            };

            controller.functions.updateTitle = function(filter)
            {
                // routine to update the current title with the data from the filter
                let title = "";
                controller.model.currentData.title = $filter('localUTCDateFilter')(filter.fromDate) + "-" + $filter('localUTCDateFilter')(filter.toDate);
                if (controller.model.dialogData.selectedDate && controller.model.dialogData.selectedDate.caption)
                    title  = controller.model.dialogData.selectedDate.caption + ":";
                title += $filter('localUTCDateFilter')(filter.fromDate) + " - " + $filter('localUTCDateFilter')(filter.toDate);
                if (controller.functions.onCurrentTitle)
                    title = controller.functions.onCurrentTitle(filter);
                controller.model.currentData.title = title;

                // update the filter title
                if (controller.model.dialogData.selectedDate) {
                    controller.model.filterCaption = controller.model.dialogData.selectedDate.caption;
                    controller.model.filterCaption += ": " + $filter('localUTCDateFilter')(filter.fromDate) + " - " + $filter('localUTCDateFilter')(filter.toDate);
                }
            };

            controller.functions.updateCompareTitle = function(filter)
            {
                // routine to update the compare title with the data from the filter
                let title = "";
                if (controller.model.dialogData.selectedCompare && controller.model.dialogData.selectedCompare.caption)
                    title = controller.model.dialogData.selectedCompare.caption + ":";
                title += $filter('localUTCDateFilter')(filter.fromDate) + " - " + $filter('localUTCDateFilter')(filter.toDate);
                if (controller.functions.onCompareTitle)
                    title = controller.functions.onCompareTitle(filter);
                controller.model.compareData.title = title;
            };

            controller.functions.saveState = function ()
            {
                // routine to save the state of this dashboard when navigating away from it
                cacheDataSvc.setDashboardState(controller.model.dialogData, controller.model.dashboardConfig);
            };

            controller.functions.setDefaultModelValue = function(key, defaultValue)
            {
                let value = controller.model.dialogData[key];
                if (!value)
                {
                    // see if the dialog options has a value for this
                    let optionValue = controller.model.dashboardConfig[key];
                    if (optionValue)
                        defaultValue = optionValue;
                    lodash.set(controller.model.dialogData, key, defaultValue);
                }
            }

            controller.functions.loadState = function (userConfig)
            {
                // routine to load the initial state of the state
                let state = cacheDataSvc.getDashboardState(controller.model.dashboardConfig);
                if (state != null)
                    controller.model.dialogData = state;
                else
                {
                    // see if we have defaults
                    let name = _this.functions.getConfigKey(controller.model.dashboardConfig) + "defaults";
                    let defaults = lodash.get(userConfig, name, undefined);
                    if (defaults != null)
                    {
                        controller.model.dialogData = lodash.merge({}, defaults);
                        controller.model.dialogData.selectedDate = _this.functions.getSelection(controller.model.dashboardConfig.timeButtons, controller.model.dialogData.selectedDate);

                        if (controller.model.dashboardConfig.hasCompare)
                            controller.model.dialogData.selectedCompare = _this.functions.getSelection(controller.model.dashboardConfig.compareButtons, controller.model.dialogData.selectedCompare);
                    }
                };

                // initialize the dialog Data as needed with defaults from the dashboard config
                controller.functions.setDefaultModelValue('refreshInterval', controller.model.dashboardConfig.intervals[controller.model.dashboardConfig.selector.refresh].value);
                controller.functions.setDefaultModelValue("filter", {});
                controller.functions.setDefaultModelValue('selectedDate', controller.model.dashboardConfig.timeButtons[controller.model.dashboardConfig.selector.time]);
                if (controller.model.dialogData.selectedDate.value.allowChange && !controller.model.dialogData.selectedDateRange)
                {
                    controller.model.dialogData.selectedDate = controller.model.dashboardConfig.timeButtons[controller.model.dashboardConfig.selector.time];
                    controller.model.dialogData.selectedDateRange = {};
                }
                if (controller.model.dashboardConfig.hasCompare)
                {
                    controller.functions.setDefaultModelValue('selectedCompare', controller.model.dashboardConfig.compareButtons[controller.model.dashboardConfig.selector.compare]);
                    if (controller.model.dialogData.selectedCompare.value.allowChange && !controller.model.dialogData.selectedCompareDateRange)
                    {
                        controller.model.dialogData.selectedCompare = controller.model.dashboardConfig.compareButtons[controller.model.dashboardConfig.selector.compare];
                        controller.model.dialogData.selectedCompareDateRange = {};
                    }
                }
                // make sure the company and dept filter is set
                let orgInfo = userSvc.getOrgInfo();
                controller.model.dialogData.filter.companyId = orgInfo.companyId;
                if (!controller.model.dialogData.filter.departments)
                {
                    controller.model.dialogData.filter.departments = [];
                    if (!userSvc.hasFeature(userSvc.commonFeatures.TRANS_FILTER_ALL))
                        lodash.merge(controller.model.dialogData.filter.departments, orgInfo.departments);
                }
                if (controller.functions.onLoad)
                    controller.functions.onLoad(userConfig)
            };
            scope.$on('$destroy', function()
            {
                controller.functions.destroy();
            });

            scope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams)
            {
                controller.functions.saveState();
            })
        };

        _this.functions.initializeDashboardFilterDialog = function(controller, dialogDetails)
        {
            // routine to return the function to be called when the user wishes to adjust the filter
            return function ()
            {
                // routine to bring up the editing dialog
                let dialogData = {data: lodash.cloneDeep(controller.model.dialogData), config: controller.model.dashboardConfig};
                let modalInstance = uiSvc.showDialog(dialogData, dialogDetails);
                modalInstance.result.then(function (result)
                {
                    controller.model.dialogData = result;
                    modalInstance.close();

                    // set any user settings with the revised data model
                    controller.functions.onUserSettings();

                    // initialize any data
                    controller.functions.onInitialize(false);
                    controller.functions.onInitializeWidgets(false);


                    // refresh the main data - this will manage the timer and set the title
                    controller.functions.manageRefresh(true);

                }, function (err)
                {
                    $log.error("Unable to Apply Filter Changes", err)
                });
            };
        };
        //</editor-fold>

        //<editor-fold desc="Dashboard Filter Controller Functions">

        _this.functions.getTransactionStatus = function(value)
        {
            // routine to return the transaction status used in transactions
            return  transactionReportingSvc.getMongoTransactionStatus(value);
        };

        _this.functions.initializeDashboardDialogController = function(controller, dialogData, modalInstance, options)
        {
            // routine to initialize a generic dialog filter box
            if (!controller.functions)
                controller.functions = {};
            if (!controller.model)
                controller.model = {};
            controller.model.initialDates = {selected: null, compareDate: null};


            // set the data for the form
            controller.dataModel = dialogData.data;
            controller.configModel = dialogData.config;

            // initialize the ui level data for the form as needed with the defaults
            controller.model.flags = {allowCompareDate: false, allowRefresh: true, showTab: false};
            controller.model.dateSelectorOptions = {autoUpdateInput: true};

            if (!controller.stateInfo)
                controller.stateInfo = {};
            if (!controller.stateInfo.title)
                controller.stateInfo.title = "Dashboard Filter";
            if (!controller.stateInfo.icon)
                controller.stateInfo.icon = "fa fa-dashboard";
            if (!controller.stateInfo.elementId)
                controller.stateInfo.elementId = "frmDashboardFilterDialog";


            controller.model.timeButtons = _this.functions.getDateSelectorOptions();
            controller.model.intervals = _this.functions.getIntervalOptions();
            controller.model.compareButtons = null;

            // check the dashboard controller config
            if (controller.configModel.timeButtons)
                controller.model.timeButtons = controller.configModel.timeButtons;
            if (controller.configModel.intervals)
                controller.model.intervals = controller.configModel.intervals;
            if (controller.configModel.hasCompare)
                controller.model.compareButtons = controller.configModel.compareButtons != null ? controller.configModel.compareButtons : _this.functions.getCompareOptions();


            // check the options
            if (options)
            {
                if (options.settingsTab)
                {
                    controller.model.settingsTabHTML =  "<div data-smart-include=\"" + options.settingsTab + "\"/>";
                    controller.model.flags.showTab = true;
                }
                if (options.settingsGrid)
                    controller.model.settingsGrid = true;
                if (options.validator)
                    controller.stateInfo.validator = options.validator;
            }

            // setup the date entry section
            controller.model.title = controller.stateInfo.title;
            controller.model.icon = controller.stateInfo.icon;

            // setup a get settings function

            // setup a rendered function
            if (!controller.functions.rendered)
            {
                controller.functions.rendered = function ()
                {
                    // setup bootstrap validator when the form is rendered
                    var innerForm = $(document.getElementById(controller.stateInfo.elementId));
                    let formOptions = lodash.merge(_this.functions.getDateFieldOptions(controller), uiSvc.getFormValidateOptions(), controller.stateInfo.validator);
                    var fv = innerForm.bootstrapValidator(formOptions);
                    controller.form = innerForm.data('bootstrapValidator');
                    controller.form.resetForm();

                    // set the dates as the date range picker does not respect ng-Model on first render
                    controller.dataModel.selectedDateRange = controller.model.initialDates.selected;
                    controller.dataModel.selectedCompareDateRange = controller.model.initialDates.compare;
                }
            }

            // setup a default save function
            controller.functions.saveUserDefaults = function (userKeys) {
                // routine to save user configurations on this dashboard to the database
                let deferred = $q.defer();
                userSvc.getUserSettings().then(function (config) {
                    let name = _this.functions.getConfigKey(controller.configModel);
                    lodash.forEach(userKeys, function (value) {
                        let propName = name + value.key;
                        lodash.set(config, propName, value.value);
                    });
                    userSvc.saveUserSettings().then(function () {
                        uiSvc.showExtraSmallPopup("User Configuration Update", "User Configuration Update Successful !", 5000);
                        deferred.resolve({ok: true});
                    }).catch(function (err) {
                        uiSvc.showError("User Config Update Failure", err);
                        deferred.reject(err);
                    })
                }).catch(function (reason) {
                    $log.error("Config Read Failure", reason);
                });
                return deferred.promise;
            };


            // setup a save function
            if (!controller.functions.saveDialog)
            {
                controller.functions.saveDialog = function()
                {
                    // routine to save the entry
                    controller.form.revalidateField("hdn_select_date");
                    controller.form.revalidateField("hdn_select_compare");
                    controller.form.validate();
                    //var valid = controller.form.isValid();
                    let valid = true;
                    if (!valid)
                        return;

                    // see if the is custom save logic overrides
                    if (controller.functions.onSaveRecord)
                        controller.functions.onSaveRecord(controller.dataModel);

                    // close the window
                    modalInstance.close(controller.dataModel);
                };
            }

            // setup a user save as default function
            if (!controller.functions.saveAsDefault)
            {
                controller.functions.saveAsDefault = function()
                {
                    // routine to set the current model object as the filter object of the dashboard
                    let defaults = {filter: lodash.cloneDeep(controller.dataModel.filter)};
                    if (controller.dataModel.selectedCompare && controller.dataModel.selectedCompare.value)
                        defaults.selectedCompare = controller.dataModel.selectedCompare.caption;
                    if (controller.dataModel.selectedDate && controller.dataModel.selectedDate.value)
                        defaults.selectedDate = controller.dataModel.selectedDate.caption;
                    defaults.refreshInterval = controller.dataModel.refreshInterval;
                    if (controller.functions.onSaveDefault)
                        controller.functions.onSaveDefault(defaults, controller.dataModel);

                    let settings = [{key: "defaults", value: defaults}];
                    controller.functions.saveUserDefaults(settings).then(function(result)
                    {

                    }).catch(function(err)
                    {

                    });
                }
            }

            // setup a cancel function
            if (!controller.functions.cancelDialog)
            {
                controller.functions.cancelDialog = function()
                {
                    // close the window
                    modalInstance.dismiss('cancel');
                };
            }

            // setup an initialize function
            if (!controller.functions.initialize)
            {
                controller.functions.initialize = function()
                {
                    controller.functions.setTime();
                    if (controller.model.compareButtons)
                        controller.functions.setCompare();
                    controller.model.initialDates.selected = controller.dataModel.selectedDateRange;
                    controller.model.initialDates.compare = controller.dataModel.selectedCompareDateRange;
                    controller.modalResult = null;
                };
            }

            // add the functions to manage the dates and core selector
            controller.functions.updateDates = function(dateObject, parameter)
            {
                // routine to update the given  object with the given parameter object (this will get used either by the main date selector or the compare selector)
                if (parameter.allowChange && dateObject.startDate)
                    return dateObject;
                dateObject.endDate = moment().set({second: 59, millisecond: 999});
                dateObject.startDate = moment(dateObject.endDate).subtract(parameter.time, parameter.measure).set({second: 0, millisecond: 0});
                if (parameter.subtractEnd)
                    dateObject.endDate =  moment(dateObject.endDate).subtract(1, "days");
                if (parameter.startWeek)
                    dateObject.startDate = moment(dateObject.startDate).day(parameter.startWeek);
                if (parameter.startDay)
                    dateObject.startDate = dateObject.startDate.set({hour: 0, minute: 0, second: 1});
                if (parameter.endWeek)
                    dateObject.endDate = moment(dateObject.endDate).day(parameter.endWeek);
                if (parameter.endDay)
                    dateObject.endDate = dateObject.endDate.set({hour: 23, minute: 59, second: 59, millisecond: 999});
                return dateObject;
            };

            controller.functions.selectDefaultRefresh = function()
            {
                // routine to select the default refresh value
                let parameter = controller.model.intervals[controller.configModel.selector.refresh];
                if (parameter != null)
                    controller.functions.selectInterval(parameter);
            };
            controller.functions.selectTime = function(parameter)
            {
                // routine to manage the selection of a time button when the user selects it
                controller.dataModel.selectedDate = parameter;
                controller.model.flags.allowDate = parameter.value.allowChange;
                controller.model.flags.allowRefresh = true;

                // set the refresh selector if required
                if (parameter.value.preventRefresh)
                {
                    controller.model.flags.allowRefresh = false;
                    controller.dataModel.refreshInterval = 0;
                }
                else
                    controller.functions.selectDefaultRefresh();

                // set the display dates based on the value
                if (!controller.dataModel.selectedDateRange)
                    controller.dataModel.selectedDateRange = {};
              controller.functions.updateDates(controller.dataModel.selectedDateRange, parameter.value);
            };

            controller.functions.selectInterval = function(parameter)
            {
                // routine to manage the selection of a refresh Interval
                controller.dataModel.refreshInterval = parameter.value;
            };

            controller.functions.selectCompare = function(parameter)
            {
                // routine to manage the selection of a comparision button when a user selects it
                controller.dataModel.selectedCompare = parameter;
                controller.model.flags.allowCompareDate = parameter.value.allowChange;

                // set the display dates based on the value
                if (parameter.value.time == -1)
                    return;
                if (!controller.dataModel.selectedCompareDateRange)
                    controller.dataModel.selectedCompareDateRange = {};
                controller.functions.updateDates(controller.dataModel.selectedCompareDateRange, parameter.value);
            };

            controller.functions.setTime = function()
            {
                // routine to set the time variables when you initialize the screen
                if (typeof controller.dataModel.selectedDate === 'string')
                    controller.dataModel.selectedDate = _this.functions.getSelection(_this.model.timeButtons, controller.dataModel.selectedDate);
                controller.functions.selectTime(controller.dataModel.selectedDate);
            };
            controller.functions.setCompare = function()
            {
                // routine to set the compare variables when you initialize the screen

                if (typeof controller.dataModel.selectedCompare === 'string')
                    controller.dataModel.selectedCompare = _this.functions.getSelection(_this.model.compareButtons, controller.dataModel.selectCompare);
                controller.functions.selectCompare(controller.dataModel.selectedCompare);
            };


            // hook up the rendered function
            modalInstance.rendered.then(controller.functions.rendered);

            // initialize the form
            controller.functions.initialize();
        };
        //</editor-fold>

        //<editor-fold desc="Other Functions">
        _this.functions.getTransparencyColor = function(color, opacity)
        {
            return chartSvc.getTransparencyColor(color, opacity)
        };
        _this.functions.getDashboardPalette = function()
        {
            // routine to return the dashboard palette based on the users skin
            var skin = localStorage.getItem('sm-skin') || appConfig.smartSkin;
            var foundSkin = lodash.find(appConfig.skins, {name: skin});
            if (foundSkin && foundSkin.dashboard)
                return foundSkin.dashboard;
            else
            {
                let colors = chartSvc.getColors();
                return {colors: [colors.chartBlue, colors.chartGreen, colors.chartDarkGray, colors.chartOrange], opacity: 1};

            }

        };

        _this.functions.getConfigKey = function(config)
        {
            return config.module + ".dashboards" + "." + config.code + ".";
        };

        _this.functions.getIntervalOptions = function()
        {
            // routine to return the interval options
            let returnarr = [];
            if (appCustomConfig.runMode == uiSvc.modes.DEMO)
                returnarr.push({caption: "Every 30 Seconds", value: 30});
            returnarr.push({caption: "Every Minute", value: 60});
            returnarr.push({caption: "Every 5 Minutes", value: 300});
            returnarr.push({caption: "Every 30 Minutes", value: 1800});
            returnarr.push({caption: "Hourly", value: 3600});
            return returnarr;
        };

        _this.functions.getSelection = function(records, caption)
        {
            let record = lodash.find(records, {caption: caption});
            return record;
        };

        _this.functions.getDateSelectorOptions = function()
        {
            // routine to return the date selector options
            let returnarr = [];
            returnarr.push({caption: "Last 15 Minutes", value: {time: 15, measure: "minutes", allowChange: false, startDay: false, endDay: false, preventRefresh: false, default: true}});
            returnarr.push({caption: "Last 30 Minutes", value: {time: 30, measure: "minutes", allowChange: false, startDay: false, endDay: false, preventRefresh: false}});
            returnarr.push({caption: "Last Hour", value: {time: 60, measure: "minutes", allowChange: false, startDay: false, endDay: false, preventRefresh: false}});
            returnarr.push({caption: "Current Day", value: {time: 0, measure: 'minutes', allowChange: false, startDay: true, endDay: true, preventRefresh: false}});
            returnarr.push({caption: "Yesterday", value: {time: 1, measure: "days", allowChange: false, startDay: true, subtractEnd: true, endDay: true, preventRefresh: true}});
            returnarr.push({caption: "Custom", value: {time: 0, measure: 'day', allowChange: true, startDay: false, endDay: false, preventRefresh: true}});
            return returnarr;
        };

        _this.functions.getCompareOptions = function()
        {
            // routine to return the comparision selector options
            let returnarr = [];
            returnarr.push({caption: "No Comparison", value: {time: -1, measure: 'days', allowChange: false, startDay: true, endDay: true}});
            returnarr.push({caption: "Yesterday", value: {time: 1, measure: "days", allowChange: false, startDay: true, subtractEnd: true, endDay: true}});
            returnarr.push({caption: "Last Week", value: {time: 7, measure: "days", allowChange: false, startDay: true, subtractEnd: true, endDay: true, type: "Last Week"}});
            returnarr.push({caption: "Last Month", value: {time: 1, measure: "month", allowChange: false, startDay: true, subtractEnd: true, endDay: true, type:"Last Month"}});
            returnarr.push({caption: "Custom", value: {time: 0, measure: 'day', allowChange: true}});
            return returnarr;
        };

        _this.functions.getDateFieldOptions = function(controller) {
            // routine to return the field validation set for the standard date selector
            return  {
                fields: {
                    hdn_select_date: {
                        excluded: false,
                        feedbackIcons: false,
                        validators: {
                            callback: {
                                // make sure that the identifier is unique
                                message: 'Selected Date is Out of Range',
                                callback: function (value, validator, $field)
                                {
                                    let date = controller.dataModel.selectedDateRange;

                                    return uiSvc.performDateValidation(date, "Selected");
                                }
                            }
                        }
                    },
                    hdn_select_compare: {
                        excluded: controller.dataModel.selectedCompare && controller.dataModel.selectedCompare.value.time <= -1,
                        feedbackIcons: false,
                        validators: {
                            callback: {
                                // make sure that the identifier is unique
                                message: 'Selected Date is Out of Range',
                                callback: function (value, validator, $field)
                                {
                                    let date = controller.dataModel.selectedCompareDateRange;
                                    return uiSvc.performDateValidation(date, "Selected Comparision");
                                }
                            }
                        }
                    },
                }
            }
        };

        //</editor-fold>

    }]);
});


