/*
 /// <summary>
 /// app.modules.layout.controllers - layoutHeaderCtrl.js
 /// Base Layout Controller
 /// Controller to manage the layout and register the core sockeet-io events
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 23/11/2015
 /// </summary>
 */
define(['modules/layout/module', 'appCustomConfig'], function (module,appCustomConfig) {

	"use strict";

	module.registerController("layoutCtrl", ['$scope', '$state', '$auth', '$interpolate','$filter', '$timeout', '$interval', '$uibModal', 'socketIOSvc', 'cacheDataSvc', 'uiSvc', 'userSvc', function ($scope, $state, $auth, $interpolate, $filter, $timeout, $interval, $uibModal, socketIOSvc, cacheDataSvc, uiSvc, userSvc)
	{
        let _this = this;
        _this.functions = {};

        //<editor-fold desc="Scope Watches">
        $scope.userSvc = userSvc;
        $scope.socketIOSvc = socketIOSvc;

        $scope.$watch('userSvc.getNotificationStats()', function(newVal) {

            if (newVal != null)
            {
                _this.data.notification.lastUpdate.caption = newVal.lastUpdate.local().format("LLL");
                if (newVal.duration != null)
                    _this.data.notification.lastUpdate.caption +=  " (" + newVal.duration.humanize() + " ago)";
                _this.data.notification.lastUpdate.count = newVal.taskCount;
            }
        }, true);

        $scope.$watch("socketIOSvc.isConnected()", function (newVal) {
            // monitor the status of the socket connection
            if (newVal)
            {
                _this.data.notification.status.caption = "Connected";
                _this.data.notification.status.class = "bg-color-online";
            }
            else
            {
                _this.data.notification.status.caption = "No Connection";
                _this.data.notification.status.class = "bg-color-offline";
            }
        });

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too

            // cancel the notification timer
            if (_this.timer != null)
            {
                $interval.cancel(_this.timer);
                _this.timer = null;
            }
        });

        //</editor-fold>

        //<editor-fold desc="Actions">

        _this.functions.confirmLogout = function(ButtonPressed)
        {
            // routine to handle the logout request from the user
            if (ButtonPressed == "Yes")
            {
                socketIOSvc.logout(function()
                {
                    socketIOSvc.disconnect();
                    userSvc.logout(true);
                });
            };
        };
        _this.functions.logout = function()
        {
            let html = "<i class='fa fa-sign-out txt-color-orange'></i>Logout <span class='.txt-color-orange'>" + _this.data.user.name + "</span> ?";
            uiSvc.showSmartAdminBox(html, "Are you sure you wish to logout ?",'[No][Yes]', _this.functions.confirmLogout);
        };
        //</editor-fold>

        //<editor-fold desc="User Messages">
        _this.functions.showLoginMessage = function(data, event)
        {
            let html = "<i class='fa fa-clock-o'></i> <i>Now...</i>";
            uiSvc.showExtraSmallPopup(data + " Logged In", html, 4000, "#296191", "fa-sign-in bounce animated");
        };
        _this.functions.showLogOutMessage = function(data, event)
        {
            let html = "<i class='fa fa-clock-o'></i> <i>Now...</i>";
            uiSvc.showExtraSmallPopup(data + " has Logged Out", html, 4000, "#C46A69", "fa-sign-out bounce animated");
        };

        _this.functions.showUserMessage = function(data, event)
        {
            // routine to show the user message received from the serber
            var title = "System Message";
            var color = null;
            if (data.type == "FIXIT")
            {
                title = "Transaction Fix Request Received";
                color = "#FFA500";

                if (appCustomConfig.runMode == uiSvc.modes.DEMO)
                    color = "#32CD32";
            }
            if (data.type == "ERROR")
            {
                title = "Error Encountered";
                color = "#ce2029";
            }
            if (data.type == "INFO")
            {
                title = "System Message Received";
                color = "#296191";
            }
            if (data.title)
                title = data.title;
            var html = data.html;

            // add the hyper-link
            var timeout = 6000;

            if (data.link != null)
            {
                timeout = 20000;
                //var rawHTML =  '<a data-ui-sref="' + data.state + '(' + JSON.stringify(data.state_params) + ')">' + html + '</a>'
                //var rawHTML = '<a ng-click="clickMe(hyperlink);">' + html + "</a>";
                //html = $interpolate(rawHTML)($scope);
                html = '<a href="' + data.link + '" class="txt-color-white">' + html + "</a>";
                title = '<a href="' + data.link + '" class="txt-color-white">' + title + "</a>";
            }
            var icon = "fa-bell";
            if (data.icon)
                icon = "fa-" + data.icon;
            icon += " bounce animated";
            if (data.color != null)
                color = data.color;
            uiSvc.showExtraSmallPopup(title, html, timeout, color, icon);
        };

        //</editor-fold>

        //<editor-fold desc="File Upload">

        _this.functions.fileUpload = function()
        {
            // routine to trigger the file upload
            _this.data.applications.open = false;
            $timeout(function()
            {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/modules/layout/partials/file-upload-dialog.tpl.html',
                    controller: 'fileUploadCtrl',
                    controllerAs: 'vm'
                });
                modalInstance.result.then(function (result)
                {
                }, function ()
                {
                });
            }, 200);
        };

        _this.functions.eligibilityCheck = function()
        {
            // routine to trigger the eligibility Check
            _this.data.applications.open = false;
            $timeout(function()
            {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/modules/spe/partials/eligibility-check-dialog.tpl.html',
                    controller: 'speEligibilityChkDialogCtrl',
                    controllerAs: 'vm',
                    size:'lg'
                });
                modalInstance.result.then(function (result)
                {
                }, function ()
                {
                });
            }, 200);
        };
        //</editor-fold>

        //<editor-fold desc="Initialization">
        _this.functions.initialize = function()
        {
            // setup the initial data
            _this.data = {};
            _this.data.product = uiSvc.getProductInfo(cacheDataSvc.getProductEnvironment());
            _this.data.notification = {};
            _this.data.notification.lastUpdate = {count: 0, caption:""};
            _this.data.notification.status = {caption:"Offline", class:"bg-color-offline"};
            _this.data.applications = {open: false};

            // get the user profile
            _this.data.user = userSvc.getProfile();

            // connect the socket-io
            $timeout(function(){
                socketIOSvc.connect(function()
                {
                    // create the auth socket-io events and link then to the current socket
                    let prefix = "core.auth.";
                    socketIOSvc.addListener(prefix + "login", _this.functions.showLoginMessage);
                    socketIOSvc.addListener(prefix + "logout", _this.functions.showLogOutMessage);
                    socketIOSvc.addListener("user.notification.alert", _this.functions.showUserMessage);

                    // login to the socket-io
//			socketIOSvc.emit("client.auth.login", {id: $scope.user.id, name: $scope.user.name, company: $scope.user.companyId});
                });
            }, 1000);

            // start the timer to refresh the notification count
            /*
            if (_this.timer == null)
                _this.timer = $interval(userSvc.updateNotificationCount, 20 * 1000);

             */
        };
        //</editor-fold>

        _this.functions.initialize();
    }]);
});
