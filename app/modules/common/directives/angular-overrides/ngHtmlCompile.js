define(['modules/common/module'], function(module)
{
    "use strict";

    return module.registerDirective('ngHtmlCompile', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.ngHtmlCompile, function (newValue, oldValue) {
                    element.html(newValue);
                    $compile(element.contents())(scope);
                });
            }
        }
    }])
});