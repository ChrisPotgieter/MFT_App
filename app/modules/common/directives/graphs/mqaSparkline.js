/*
 /// <summary>
 /// modules.common.directives.graphs - mqaSparkline.js
 /// Directive to display display JQuery sparkline graphs
 /// This directive is an adaptation of https://gist.github.com/pjsvis/6210002 but extended to be an isolated scope with actual watchers that re-render when the chart changes
 /// Also this incorporates some functionality of the SmartAdmin Sparkline directive, but is more generic in nature
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/18/2015
 /// </summary>
 */

define(['modules/common/module', 'sparkline'], function (module) {
	"use strict";

	module.registerDirective('mqaSparkline', function () {
		return {
			restrict: 'A',
			scope:
			{
				data:'=',
				config:'='
			},

			link: function (scope, elem, attrs) {

				var compositeConfig = scope.config;
				scope.$watchCollection("data", function () {
					render();
				});

				scope.$watch("config", function () {
					render();
				});
				var render = function () {
					var model, isCompositeConfig = false, isCompositeModel = false;

					// config can be one of foll :
					// {type:'line', spotColoe: 'green', lineWidth: 5}
					// [{type:'line', lineColor: 'green', lineWidth: 5} , {type:'line', lineColor: 'red', lineWidth: 5}]

					if (angular.isArray(compositeConfig)) {
						isCompositeConfig = true;
					} else if (angular.isObject(compositeConfig)) {
						isCompositeConfig = false;
					}

					//Setup Model : Model can be [1,2,3,4,5] or [[1,2,3,4,5],[6,7,8,9]]
					// Trim trailing comma if we are a string
					angular.isString(scope.data) ? model = scope.data.replace(/(^,)|(,$)/g, "") : model = scope.data;
					// convert model to json
					model = angular.fromJson(model);
					// Validate data & render sparkline
					var composite = false;
					if (angular.isArray(model)) {
						for (var j = 0; j < model.length; j++) {
							if (angular.isArray(model[j])) {
								if (j != 0 && isCompositeModel != true) {
									alert("Data not in valid format!!");
									break;
								} else {
									isCompositeModel = true;
									$(elem).sparkline(model[j], (isCompositeConfig) ? reconcileConfig(compositeConfig[j], composite) : reconcileConfig(compositeConfig, composite));
									composite = true;
								}
							} else {
								if (j != 0 && isCompositeModel != false) {
									alert("Data not in valid format!!");
									break;
								} else {
									isCompositeModel = false;
								}
							}
						}
					}
					// In case not composite, render once
					if (!isCompositeModel) $(elem).sparkline(model, reconcileConfig(compositeConfig));

				};

				// can be used for validating & defaulting config options
				var reconcileConfig = function (config, composite) {
					if (!config) config = {};
					config.type = config.type || 'line';
					config.composite = composite;

					// update the color to reflect the color of the css
					if (config.type == 'bar')
					{
						config.barColor = $(elem).data('sparkline-color') || $(elem).css('color') || config.barColor;
					}
					if (config.type == 'line')
						config.lineColor = $(elem).data('sparkline-color') || $(elem).css('color') || config.lineColor;
					return config;
				};
			}
		}
	});


});
