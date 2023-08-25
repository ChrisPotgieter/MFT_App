/*
 /// <summary>
 /// app.modules.spe.controllers - speGwidSearchCtrl.js
 /// SPE Gwid Search Controller
 /// Controller to Manage the SPE GWID Search Functionality
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 19/03/2017
 /// </summary>
 */
define(['modules/spe/module', 'lodash'], function (module, lodash) {

	"use strict";

	module.registerController('speGwidSearchCtrl', ['$scope', '$log',  '$stateParams','$element', '$timeout', 'uiSvc',function ($scope, $log, $stateParams, divElement, $timeout, uiSvc)
	{
	    // setup the filter
		$scope.filter = {};
		$scope.gwid = '';

		var setupBV = function()
        {
            var fields = {
                fields: {
                    identifier: {
                        excluded: false,
                        group: "#div_id",
                        validators: {
                            notEmpty: {
                                message: ' '
                            }
                        }
                    }
                }
            };
            var formOptions = lodash.merge({}, uiSvc.getFormNoFeedbackIcons(), {submitButtons: 'button[id="submit"]'}, fields);
            var formElement = $(divElement).first();
            var fv = formElement.bootstrapValidator(formOptions).off('success.form.bv').on('success.form.bv', function(e)
            {
                // Prevent form submission
                e.preventDefault();
            });
            $scope.bv = formElement.data('bootstrapValidator');

        };

		$scope.find = function()
		{
			// routine to update the directive with the id (this will trigger a get to the server) - via the watch on the GWID
			setupBV();
            $scope.gwid = $scope.filter.id;
		};

        $scope.$on('$viewContentLoaded', function()
        {
            // when the DOM has loaded initialize BV
            $timeout(function()
            {
                setupBV();

                // check for a id given by the parameter
                var gwid = $stateParams.id;
                if (gwid)
                {
                    $scope.filter.id = gwid;
                    $scope.find();
                }
            }, 500);
        });

    }]);

});
