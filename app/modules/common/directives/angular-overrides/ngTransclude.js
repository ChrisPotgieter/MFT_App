/*
 /// <summary>
 /// app.modules.common.directives.angular-overrides - ng-transclude.js
 /// Override to the Angular Directive ng-transclude to support multiple scoping - https://github.com/Izhaki/ngTranscludeMod
 /// https://github.com/angular/angular.js/issues/7874#issuecomment-47647528
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 7/18/2015
 /// </summary>
 */
define(['modules/common/module'], function(module)
{
	"use strict";

	return module.registerDirective('ngTransclude', function ()
	{
		return {
			restrict: 'EAC',
			link: function( $scope, $element, $attrs, controller, $transclude ) {
				if (!$transclude) {
					throw minErr('ngTransclude')('orphan',
						'Illegal use of ngTransclude directive in the template! ' +
						'No parent directive that requires a transclusion found. ' +
						'Element: {0}',
						startingTag($element) );
				}

				var iScopeType = $attrs['ngTransclude'] || 'sibling';

				switch ( iScopeType ) {
					case 'sibling':
						$transclude( function( clone ) {
							$element.empty();
							$element.append( clone );
						});
						break;
					case 'parent':
						$transclude( $scope, function( clone ) {
							$element.empty();
							$element.append( clone );
						});
						break;
					case 'child':
						var iChildScope = $scope.$new();
						$transclude( iChildScope, function( clone ) {
							$element.empty();
							$element.append( clone );
							$element.on( '$destroy', function() {
								iChildScope.$destroy();
							});
						});
						break;
				}
			}
		}
	})
});
