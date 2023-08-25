/*
 /// <summary>
 /// modules.common.directives.input - mqaJqDatePicker.js
 /// Update to the smart-admin spinner directive to allow for angular-js model binding using parse
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 14/7/2015
 /// </summary>
 */


define(['modules/common/module', 'moment', 'lodash','jquery-ui'], function (module, moment, lodash) {
	"use strict";
	moment().format();
	return module.registerDirective('mqaJqDatePicker', ['$filter', function ($filter) {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope:
			{
				onSelect:'&?',
				options:'=?'
			},
			compile: function (tElement, tAttributes)
			{
				tElement.removeAttr('mqa-jq-date-picker');

				var onSelectCallbacks = [];
				if (tAttributes.minRestrict) {
					onSelectCallbacks.push(function (selectedDate) {
						$(tAttributes.minRestrict).datepicker('option', 'minDate', selectedDate);
					});
				}
				if (tAttributes.maxRestrict)
				{
                    onSelectCallbacks.push(function (selectedDate) {
                        $(tAttributes.maxRestrict).datepicker('option', 'maxDate', selectedDate);
                    });
                }

				var options = {
					prevText: '<i class="fa fa-chevron-left"></i>',
					nextText: '<i class="fa fa-chevron-right"></i>'
				};


				if (tAttributes.numberOfMonths) options.numberOfMonths = parseInt(tAttributes.numberOfMonths);


				if (tAttributes.dateFormat) options.dateFormat = tAttributes.dateFormat;


				if (tAttributes.changeMonth) options.changeMonth = tAttributes.changeMonth == "true";
				return {

					pre: function preLink($scope, tElement, tAttributes, ngModelCtrl) {

                        // bug in angular v1.3 (https://github.com/angular-ui/bootstrap/issues/2659)
                        ngModelCtrl.$formatters.push(function (value) {
                            return ngModelCtrl.$isEmpty(value) ? value : $filter('date')(value, "MM/dd/yyyy");
                        });
                        if ($scope.options && $scope.options.maxDate)
						{
                            options.maxDate = $scope.options.maxDate;
                            $scope.$watch("options.maxDate", function(newValue, oldValue)
							{
								if (newValue != oldValue)
									tElement.datepicker("option", "maxDate", newValue);
							}, true)
                        }

                        if ($scope.options && $scope.options.minDate)
                        {
                            options.minDate = $scope.options.minDate;
                            $scope.$watch("options.minDate", function(newValue, oldValue)
                            {
                                if (newValue != oldValue)
                                    tElement.datepicker("option", "minDate", newValue);
                            }, true)
                        }

                        if ($scope.options && $scope.options.defaultDate)
                        	options.defaultDate = $scope.options.defaultDate;


                        // check if there is select handler
                        if ($scope.onSelect)
						{
							onSelectCallbacks.push(function(selectedDate)
							{
								$scope.onSelect()(selectedDate);
                            });
						}
						options.onSelect = function (selectedDate)
						{
							angular.forEach(onSelectCallbacks, function (callback)
							{
								callback.call(this, selectedDate)
							});
							$scope.$apply(function()
							{
								ngModelCtrl.$setViewValue(selectedDate);
							});
						};
						tElement.datepicker(options);
					}
				}

			}

		}
	}])
});