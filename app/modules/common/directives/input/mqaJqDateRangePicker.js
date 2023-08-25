
/*
 /// <summary>
 /// modules.common.directives.input - mqaJqDateRatePicker.js
 /// Directive to Manage Date Range Selection used in Dashboards via Jquery Date Selectors
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/08/2017
 /// </summary>
 */

define(['modules/common/module', 'lodash', 'moment'], function(module, lodash, moment){
    "use strict";
    moment().format();


    module.registerDirective('mqaJqDateRangePicker', ['$timeout', 'uiSvc', function($timeout, uiSvc){
    return {
        restrict: 'E',
        templateUrl: 'app/modules/common/directives/input/mqaJqDateRangePicker.tpl.html',
        replace: true,
        scope:{},
        bindToController: {
            options:"=",
            validator:'=',
            onExecute:'&',
            mode:'@'
        },
        controllerAs:'vmDateRange',
        controller: function ($scope, $element)
        {
            var _this = this;
            // setup the variables

            _this.functions = {};
            _this.model = {fromDate: {value: null, options: {}}, toDate: {value: null, options: {}}, disabled: false, inProgress: false};

            if (_this.options.disabled)
                _this.model.disabled = _this.options.disabled;

            // look at the options and update the variables
            if (_this.options.fromDate)
            {
                if (_this.options.fromDate.maxDate)
                {
                    _this.model.fromDate.options.maxDate = _this.options.fromDate.maxDate.toDate();
                }
                if (_this.options.fromDate.minDate)
                {
                    _this.model.fromDate.options.minDate = _this.options.fromDate.minDate.toDate();
                }
                if (_this.options.fromDate.defaultDate)
                    _this.model.fromDate.options.defaultDate = _this.options.fromDate.defaultDate.toDate();
                if (_this.options.fromDate.value)
                    _this.model.fromDate.value = _this.options.fromDate.value.format("l");
            }

            if (_this.options.toDate)
            {
                if (_this.options.toDate.maxDate)
                {
                    _this.model.toDate.options.maxDate = _this.options.toDate.maxDate.toDate();
                }
                if (_this.options.toDate.minDate)
                {
                    _this.model.toDate.options.minDate = _this.options.toDate.minDate.toDate();
                }
                if (_this.options.toDate.defaultDate)
                    _this.model.toDate.options.defaultDate = _this.options.toDate.defaultDate.toDate();
                if (_this.options.toDate.value)
                    _this.model.toDate.value = _this.options.toDate.value.format("l");
            }

            // watch the options
            $scope.$watch("vmDateRange.options", function(newValue, oldValue)
            {
                // check for a progress update
                if (newValue.inProgress != undefined && (newValue.inProgress != oldValue.inProgress))
                {
                    _this.model.inProgress = newValue.inProgress;
                }

                // check for a clear update
                if (newValue.clear != undefined && (newValue.clear != oldValue.clear))
                {
                    _this.model.fromDate.value = null;
                    _this.model.toDate.value = null;
                    if (_this.validator && _this.validator.form)
                    {
                        _this.validator.form.resetField("dateRange_fromDate", true);
                        _this.validator.form.resetField("dateRange_toDate", true);
                    }
                }

                // check for a maxDate update
                if (newValue.fromDate.maxDate != undefined && (newValue.fromDate.maxDate != oldValue.fromDate.maxDate))
                {
                    _this.model.fromDate.options.maxDate = newValue.fromDate.maxDate.toDate();

                }
                if (newValue.toDate.minDate != undefined && (newValue.toDate.minDate != oldValue.toDate.minDate))
                {
                    _this.model.toDate.options.minDate = newValue.toDate.minDate.toDate();
                }

                // check for a disabling
                if (newValue.disabled != undefined && newValue.disabled != oldValue.disabled)
                {
                    _this.model.disabled = newValue.disabled;
                }
            }, true);


            // setup the functions
            _this.functions.setupBV = function ()
            {
                // routine to setup bootstrap validator for this form
                var fromDate = {
                    fields: {
                        dateRange_fromDate: {
                            excluded: false,
                            validators: {
                                date: {
                                    message: "The From Date is Invalid",
                                    max: "dateRange_toDate"
                                },
                                notEmpty: {
                                    message: 'From Date is Mandatory'
                                },
                                callback: {
                                    callback: function (value, validator, $field)
                                    {
                                        // check if the date > maxDate or > the to Date
                                        var currdate = moment(value).toDate().getTime();
                                        if (_this.model.fromDate.options.maxDate)
                                        {
                                            var maxDate = _this.model.fromDate.options.maxDate;
                                            if (currdate > maxDate.getTime())
                                                return {valid:false, message: "Date Cannot be Greater than Today"};
                                        }
                                        if (_this.model.toDate.value != null)
                                        {
                                            var compareDate = moment(_this.model.toDate.value).toDate().getTime();
                                            if (currdate > compareDate)
                                                return {valid:false, message:"From Date cannot be Greater than To Date"};
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
                var toDate = {
                    fields: {
                        dateRange_toDate: {
                            excluded: false,
                            validators: {
                                date: {
                                    message: "The To Date is Invalid",
                                    min:"dateRange_fromDate"
                                },
                                notEmpty: {
                                    message: 'To Date is Mandatory'
                                },
                                callback: {
                                    message: 'To Date cannot be Less than From Date',
                                    callback: function (value, validator, $field)
                                    {
                                        // check if the date > maxDate or < the from Date
                                        var currdate = moment(value).toDate().getTime();
                                        if (_this.model.toDate.options.maxDate)
                                        {
                                            var maxDate = _this.model.toDate.options.maxDate;
                                            if (currdate > maxDate.getTime())
                                                return {valid:false, message: "Date Cannot be Greater than Today"};
                                        }
                                        if (_this.model.fromDate.value != null)
                                        {
                                            var compareDate = moment(_this.model.fromDate.value).toDate().getTime();
                                            if (currdate < compareDate)
                                            {
                                                return {valid: false, message:"To Date cannot be Less than From Date"};
                                            }
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
                var fields = lodash.merge(fromDate, toDate);
                var formOptions = lodash.merge({}, fields, {submitButtons: 'button[id="dateRange_submit"]'}, uiSvc.getFormNoFeedbackIcons());
                var fv = $element.bootstrapValidator(formOptions);
                _this.validator.form = $element.data('bootstrapValidator');
                _this.validator.getValue = function()
                {
                    return {fromDate: moment(_this.model.fromDate.value), toDate: moment(_this.model.toDate.value)};
                };
                _this.validator.setValue = function(value)
                {
                    _this.model.fromDate.value = value.fromDate;
                    _this.model.toDate.value = value.toDate;
                }
            };

            _this.functions.execute = function()
            {
                // validate the form
                if (_this.validator != null && _this.validator.form != null) {
                    _this.validator.form.validate();
                    var isValid = _this.validator.form.isValid();
                    if (!isValid)
                        return;
                }
                // get the values
                var value = _this.validator.getValue();

                // run the function
                if (_this.mode == 2)
                    // old style = set the dates
                    _this.onExecute()(value.fromDate, value.toDate);
                else
                    // new style = call the toggle
                    _this.onExecute()(false, true);
            }

            _this.functions.onFromDate = function(selectedDate)
            {
                if (_this.validator && _this.validator.form)
                    _this.validator.form.revalidateField("dateRange_fromDate");
            };

            _this.functions.onToDate = function(selectedDate)
            {
                if (_this.validator && _this.validator.form)
                {
                    _this.validator.form.revalidateField("dateRange_toDate");
                }
            };
            // setup BV  when this form loads
            $timeout(function()
            {
                _this.functions.setupBV();
            }, 500);

        }
    }
  }]);

});


