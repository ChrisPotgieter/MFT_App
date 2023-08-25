/*
 /// <summary>
 /// modules.auth.directives - mqaNotificationToggle.js
 /// Toggle Directive to Manage the Notification Dropdown Trigger
 /// This is based on the smart-admin Activities Drop Down Toggle

 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 21/07/2017
 /// </summary>
 */

define(['modules/auth/module'], function(module)
{
    "use strict";
    module.registerDirective('mqaNotificationToggle', ['$rootScope','userSvc', function($rootScope, userSvc){
        return {
            restrict: 'EA',
            link: function ($scope, $element)
            {
                var ajax_dropdown = null;
            	$rootScope.$on("notification-close", function()
                {
                    // close the window
                    if (ajax_dropdown && ajax_dropdown.is(':visible'))
                    {
                        ajax_dropdown.fadeOut(150);
                        $element.removeClass('active');
                    }
                });

                $element.on('click',function()
                {
                    ajax_dropdown = $(this).next('.ajax-dropdown');

                    if (!ajax_dropdown.is(':visible')) {

                        ajax_dropdown.fadeIn(150);
                        $(this).addClass('active');

                        // trigger a call to get the latest notification list
                        userSvc.updateNotificationList();

                    }
                    else {

                        ajax_dropdown.fadeOut(150);
                        $(this).removeClass('active');
                    }

                });

                $(document).mouseup(function(e)
                {

                    if (ajax_dropdown && !ajax_dropdown.is(e.target) && ajax_dropdown.has(e.target).length === 0) {
                        ajax_dropdown.fadeOut(150);
                        $element.removeClass('active');
                    }
                });
            }
        }
    }]);
});