/*
 /// <summary>
 /// modules.mft_v2.directives - mftMonitorCondition
 /// MFT Monitor Condition directive to display Correct Template for the given Condition
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/10/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module) {
    "use strict";

    module.registerDirective('mftMonitorCondition', ['$compile', 'mftv2DataSvc', 'cacheDataSvc', function ($compile, mftv2DataSvc, cacheDataSvc) {
        return {
            restrict: 'EA',
            scope:
            {
                item: '=',
            },
            compile: function (element) {
                return {
                    pre: function preLink($scope, element, attributes)
                    {
                        // display the template based on the calculated template
                        cacheDataSvc.loadTemplate("app/modules/mft_v2/partials/" + $scope.templateName, $scope.templateId).then(function (html) {
                            element.html(html);
                            $compile(element.contents())($scope);
                        });
                    }
                }
            },
            controller: function($scope)
            {

                // work out the item to pass to the compile directive
                let templateId = "mftMonitorConditionCommon";
                let templateName = "monitor-condition-common.tpl.html";

                // determine the type and data
                var calcData = function()
                {
                    let value = $scope.item;
                    if (value.file_same_size)
                    {
                        $scope.item.type = 0; // file size same
                        $scope.item.data = value.file_same_size;
                    }
                    if (value.file_size_same)
                    {
                        $scope.item.type = 1; // file size same
                        $scope.item.data = value.file_size_same;
                    }
                    if (value.queue_not_empty)
                    {
                        $scope.item.type = 2; // queue not empty
                        $scope.item.data = value.queue_not_empty;
                    }
                    if (value.complete_groups)
                    {
                        $scope.item.type = 3; // complete groups
                        $scope.item.data = value.complete_groups;
                    }
                    if (value.file_match)
                    {
                        $scope.item.type = 4; // file match
                        $scope.item.data = value.file_match;
                    }
                    if (value.file_no_match)
                    {
                        $scope.item.type = 5; // file no match
                        $scope.item.data = value.file_no_match
                    }

                    if (value.file_size)
                    {
                        $scope.item.type = 6; // file size
                        $scope.item.data = value.file_size
                    }
                    switch ($scope.item.type) {
                        case 0:
                            $scope.item.icon = "fa fa-floppy-o";
                            $scope.item.description = "File Size Same";
                            templateId = "mftConditionSizeSame";
                            templateName = "monitor-condition-size-same.tpl.html";
                            break;
                        case 1:
                            $scope.item.icon = "fa fa-floppy-o";
                            $scope.item.description = "File Same Size";
                            templateId = "mftConditionSizeSame";
                            templateName = "monitor-condition-size-same.tpl.html";
                            break;
                        case 2:
                            $scope.item.icon = "fa fa-stack-overflow";
                            $scope.item.description = "Queue Not Empty";
                            break;
                        case 3:
                            $scope.item.icon = "fa fa-stack-overflow";
                            $scope.item.description = "Complete Groups";
                            break;
                        case 4:
                            $scope.item.icon = "fa fa-expand";
                            $scope.item.description = "File Match";
                            templateId = "mftConditionFileMatch";
                            templateName = "monitor-condition-file-match.tpl.html";
                            break;
                        case 5:
                            $scope.item.icon = "fa fa-compress";
                            $scope.item.description = "File No Match";
                            templateId = "mftConditionFileMatch";
                            templateName = "monitor-condition-file-match.tpl.html";
                            break;
                        case 6:
                            $scope.item.icon = "fa fa-floppy-o";
                            templateId = "mftConditionFileSize";
                            templateName = "monitor-condition-file-size.tpl.html";
                            break;
                    }
                    $scope.templateId = templateId;
                    $scope.templateName = templateName;

                };
                $scope.$watch("item", function(newValue, oldValue)
                {
                    // watch incase the item changes during a refresh
                    if (newValue != oldValue) {
                        $scope.item = newValue;
                        calcData();
                    }
                });
                calcData();
            }

        }
    }]);
});
