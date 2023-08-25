/*
 /// <summary>
 /// modules.common.directives - mqaMorrisPieCounts
 /// Directive to display the Counts for the given property of a given dataset in a Morris-Pie Format

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/8/2015
 /// </summary>
 */

define(['modules/common/module', 'lodash', 'angular-morris'], function (module, lodash) {
	"use strict";

	module.registerDirective('mqaMorrisPieCounts', ['uiSvc', function (uiSvc) {
		return {
			restrict: 'E',
			scope: {
				data: '=',
				fieldname: '@',
				title: "@",
				palette: '=',
				onclick:'&'
			},
			templateUrl: "app/modules/common/directives/graphs/mqaMorrisPieCounts.tpl.html",
			link: {
				pre: function ($scope, element, attributes)
				{
					$scope.chartData =  [];

					var updateData = function () {
						$scope.rows = lodash.chain($scope.data).filter($scope.fieldname).countBy($scope.fieldname).map(function (value, key) {
							return {name: key, value: value};
						}).value();

						// build up the data object
						$scope.chartData = [];
						lodash.forEach($scope.rows, function (row) {
							$scope.chartData.push({label: row.name, value: row.value});

						});
					};
					$scope.$watchCollection("data", function () {
						updateData();
					});
					updateData();
				}
			}
		}
	}]);

});


