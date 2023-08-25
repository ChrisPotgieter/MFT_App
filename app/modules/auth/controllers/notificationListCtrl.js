/*
 /// <summary>
 /// app.modules.auth.controllers - notificationListCtrl.js
 /// Controller to manage the user Notification List
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 21/07/2017
 /// </summary>
 */
define(['modules/auth/module', 'lodash', 'moment'], function (module, lodash, moment)
{
    "use strict";
    moment().format();

    module.registerController('notificationListCtrl', ['$scope', '$rootScope', '$state', '$log','$filter','userSvc', 'cacheDataSvc', function ($scope, $rootScope, $state, $log, $filter,userSvc, cacheDataSvc)
	{
        var _this = this;
        $scope.userSvc = userSvc;


        // initialize the base model
        _this.model = {tabs:[], activeTab:"fix", tabData:{}, lastUpdate : ""};
        _this.model.tabs.push({id: "0", name:"fix", color: "red", length: 0, title:"Fix-It"});
        _this.model.tabs.push({id: "1", name:"msgs", color: "darken", length: 0, title:"Messages"});

        // create the functions
        _this.functions = {};
        _this.functions.updateItemStatus = function(item)
		{
			// routine to update the status of the item
			var status = 99;
			if (!item.userCompleted)
				status = 0;
			userSvc.updateNotifyStatus(item, status).then(function(result)
			{
				item.status = status;
                item.completed = (item.status == 99);
                userSvc.updateNotificationStats({taskCount: result.value});
			}).catch(function(err)
			{
				item.userCompleted = !item.userCompleted;
				$log.error("Unable to update the Notification Status", err);
			});
		};
        _this.functions.navigateItem = function(item)
		{
			// routine to navigate to the given item
			if (item.actionRoute && item.actionRoute != '')
			{
                // close the window
                $rootScope.$broadcast("notification-close");
                if (item.actionParms && item.actionParms != '')
				{
					var jsonString = $filter("replaceAllFilter")(item.actionParms, "\,",",");
					var params = JSON.parse(jsonString);
					$state.go(item.actionRoute, params);
				}
				else
                    $state.go(item.actionRoute);
			}
		};

        _this.functions.isActive = function(tabname)
		{
			// routine to return if the given tab is the active tab
            return _this.model.activeTab === tabname;
		};
        _this.functions.setTab = function(tabname)
		{
			// routine to set the active tab
			_this.model.activeTab = tabname;
		};
        _this.functions.refresh = function()
		{
			// routine to refresh the display
			userSvc.updateNotificationList();
		};
        _this.functions.parseData = function(data)
		{
			// routine to parse and prepare the data coming back from node-js for display
			var rowId = 0;
			var currDate = moment.utc();
            var groups = [];
            groups.push({_id: "0", icon:"info-circle", title:"Information", color: "blue"});
            groups.push({_id: "1", icon:"exclamation-circle", title:"Errors", color:"red"});
            lodash.forEach(data, function(row)
			{
				rowId++;
				row._id = rowId;
				row.completed = (row.status == 99);
				row.moduleDisplay = cacheDataSvc.getModuleDesc(row.moduleId);
				row.eventDate = moment(row.time);
				row.duration =  moment.duration(row.eventDate.diff(currDate));
				row.timeDisplay = row.duration.humanize() + " ago";
				row.group = "msgs";
				if (row.type == 2)
				{
                    row.group = "fix";
                    row.completed = false;
                    row.userCompleted = false;
				}
				if (row.type == 3)
					row.group = "tasks";
                if (row.icon != null && row.icon != '')
                {
                	try
					{
						var parsed = $filter("replaceAllFilter")(row.icon, "\,",",");
                        row.icon = JSON.parse(parsed);
                    }
                    catch(exc){}
                }
                else
				{
					var foundGroup = lodash.find(groups, {_id: row.type.toString()});
					if (foundGroup)
					{
                        row.icon.color = foundGroup.color;
                        row.icon.icon = foundGroup.icon;
                    }
				}

			});

			// group by type
			var groupedData = lodash.groupBy(data, 'group');
			lodash.forEach(_this.model.tabs, function(tab)
			{
				if (groupedData[tab.name])
					tab.length = groupedData[tab.name].length;
				else
					tab.length = 0;
			});

			// now set the tab data
			_this.model.tabData.fix = [];
			if (groupedData.fix)
				_this.model.tabData.fix = groupedData.fix;

			_this.model.tabData.msgs = [];
			if (groupedData.msgs)
			{
				// group into message types
				var msgGroups = lodash.groupBy(groupedData.msgs, 'type');
				lodash.forOwn(msgGroups, function(msgGroup, key)
				{
					var foundGroup = lodash.find(groups, {_id: key});
					if (foundGroup != null)
					{
						var group = angular.copy(foundGroup);
						group.items = msgGroup;
						_this.model.tabData.msgs.push(group);
					}
				});
			}

			// update the stats
            userSvc.updateNotificationStats({taskCount: data.length});
        };


        // watch for updates to the notification list
        $scope.$watch('userSvc.getNotificationUpdate()', function(count) {

        	var newVal = userSvc.getNotificationList();
            _this.functions.parseData(newVal.data);
            _this.model.lastUpdate = newVal.lastUpdate.local().format("LLL") +  " (" + newVal.duration.humanize() + " ago)";
        }, true);

    }]);
});