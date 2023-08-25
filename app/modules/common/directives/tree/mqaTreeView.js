/*
 /// <summary>
 /// modules.common.directives.tree - mqaTreeView.js
 /// Tree View Directive adapted from the smart-admin treeView directive
 /// This version is a "angular-way" and not jquery based in addition I had to use multiple templates to replace content so that the styling would work
 /// Additionally this version allows for event binding back to the base controller when a click occurs and selection display
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 6/10/2015
 /// </summary>
 */
define(['modules/common/module'], function (module) {

    'use strict';

    module.registerDirective('mqaTreeViewNode', ['$templateCache', '$filter', '$compile',function ($templateCache, $filter, $compile) {
        return {
            restrict: 'E',
            link: function($scope, element)
            {
                // setup javascript functions
                var handleExpanded = function()
                {
                    // manage the tree click events
                    $(contents).first().find('>i')
                        .toggleClass('fa-plus-circle', !$scope.item.expanded)
                        .toggleClass('fa-minus-circle', !!$scope.item.expanded)

                };
                var applyClass = function()
                {
                    // routine to work out the display class
                    if (!$scope.item.selected)
                        $scope.item.displayClass = "label-" + $filter("bootStrapStatusFilter")($scope.item.nodeType);
                    else
                        $scope.item.displayClass = "label-" + $filter("bootStrapStatusFilter")(1);

                };

                $scope.handleClick = function() {
                    if ($scope.item.nodes && $scope.item.nodes.length)
                    {
                        $scope.item.expanded = !$scope.item.expanded;
                        handleExpanded();
                    }
                    else
                    {
                        $scope.onnav()($scope.item);
                    }
                };
                // setup the scope watch on the selected item
                $scope.$watch("item.selected", function(newValue, oldValue)
                {
                    if (oldValue != newValue)
                    {
                        applyClass();
                    }
                });

                // build the initial object
                applyClass();
                if ($scope.item.nodes && $scope.item.nodes.length)
                {
                    // set the icon for tree type nodes
                    if ($scope.item.expanded)
                        $scope.item.iconClass = "fa fa-lg fa-minus-circle";
                    else
                        $scope.item.iconClass = "fa fa-lg fa-plus-circle";
                }
                var template;
                if ($scope.item.subTitle)
                {
                    template = $templateCache.get("mqaTreeViewSubLinkNode.tpl.html");
                }
                else
                {
                   template = $templateCache.get("mqaTreeViewNode.tpl.html");
                }
                var contents = $compile(template)($scope);
                // replace the html
                handleExpanded();
                element.replaceWith(contents);

            }


        }
    }]);

    module.registerDirective('mqaTreeView', function ($compile) {
        return {
            restrict: 'A',
            scope:
            {
                'items': '=',
                'onnav':'&'
            },
            templateUrl: 'app/modules/common/directives/tree/mqaTreeView.tpl.html',
            compile: function (element) {
                // Break the recursion loop by removing the contents
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    post: function ($scope, element)
                    {
                        // Compile the contents
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        // Re-add the compiled contents to the element
                        compiledContents($scope, function (clone) {
                            element.append(clone);
                        });
                    }
                };
            }
        };
    });
});


