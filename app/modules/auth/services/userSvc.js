/*
 /// <summary>
 /// app.modules.auth.services - userSvc.js
 /// Service manage Authentication and JWT interaction
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 28/06/2015
 /// </summary>
 */
define(['modules/auth/module', 'lodash', 'moment', "appConfig", "appCustomConfig"], function(module, lodash, moment, appConfig, appCustomConfig)
{
    "use strict";
    moment().format();
    module.registerService('userSvc',['$timeout','$log', '$http','$auth', '$state', '$stateParams', '$q','apiSvc','apiProvider', 'uiSvc', 'cacheDataSvc', function($timeout, $log, $http,  $auth, $state,  $stateParams, $q, apiSvc, apiProvider, uiSvc, cacheDataSvc)
    {
        let _this = this;

        _this.commonFeatures = {TRANS_FIX_ALL: "TRANS_FIX_ALL", TRANS_FIX: "TRANS_FIX", TRANS_UPLOAD: "TRANS_UPLOAD", TRANS_CANCEL:"TRANS_CANCEL", TRANS_FILTER_ALL: "TRANS_FILTER_ALL", TRANS_FORCE_COMPLETE: "TRANS_FORCE_COMPLETE", ADMIN_APP:"MODULE_ADMIN", MFT_APP: "MODULE_MFT", ITX_APP:"MODULE_ITX", IIB_APP:"MODULE_IIB", BOOMI_APP: "MODULE_BOOMI", ADMIN_BOOMI_ATOM:"BOOMI_ATOM_ADMIN", ADMIN_ITX_PARTNER:"ITX_PARTNER_ADMIN", ADMIN_MFT_AGENT:"MFT_AGENT_ADMIN", ADMIN_SWITCH_COMPANY:"ADMIN_CSWITCH", ADMIN_DIST_LIST:"ADMIN_DIST" };

        _this.state = {currentUser: {}};
        _this.state.currentModule = {lastRoute: undefined, module_route: undefined}; // route data
        _this.state.notification = {};
        _this.state.notification.stats = {taskCount: 0, lastUpdate: moment.utc(), updateCount: 0};
        _this.state.notification.list = {lastUpdate: moment.utc(), updateCount: 0, data:[], duration: moment.duration(moment.utc().diff(moment.utc()))};

        // setup the api
        let configs = [
            {url :'admin/user/login/', 'resourceName': 'login'},

            {url :'admin/user/settings/read/:id/', 'resourceName': 'settingsRead', params: {id: '@id'}},
            {url :'admin/user/settings/update/:id/', 'resourceName': 'settingsUpdate', params: {id: '@id'}},

            {url :'admin/user/templates/read/:id/:companyId', 'resourceName': 'templatesRead', params: {id: '@id', companyId:'@companyId'}},
            {url :'admin/user/templates/update', 'resourceName': 'templateUpdate', params:{}},
            {url :'admin/user/template/delete/:id', 'resourceName': 'templateDelete', params:{id: '@id'}},


            {url :'notification/search', 'resourceName': 'notificationSearch'},
            {url :'notification/updateStatus', 'resourceName': 'notificationUpdateStatus'},
            {url :'notification/count', 'resourceName': 'notificationCount'},

            {url :'common/file_trigger', 'resourceName': 'sendFileTrigger'}
        ];

        angular.forEach(configs, function(value)
        {
            apiSvc.add(value);
        });

        //<editor-fold desc="Profile Management">
        _this.navigateToStart = function()
        {
            // routine to navigate the user to the correct start page
            let state = _this.state.currentModule;
            if (state.lastRoute)
            {
                // navigate the last route
                if (state.lastRoute.parameters)
                    $state.go(state.lastRoute.name, state.lastRoute.parameters);
                else
                    $state.go(state.lastRoute.name);
                state.lastRoute = undefined;
                return
            }
            // go to the default routes
            if (appCustomConfig.startRoute)
                $state.go(appCustomConfig.startRoute);
            else
                $state.go(appConfig.startRoute);
        };

        _this.getProfile = function(){
            return _this.state.currentUser;
        };

        _this.getUserAudit = function()
        {
            // routine to return the basic information needed for audit from the current user
            let userRecord = _this.getProfile();
            return {login: userRecord.login, name: userRecord.name, id: userRecord.id};
        };

        _this.getOrgInfo = function ()
        {
            // routine to return the organizational information from the token
            if (_this.state.currentUser == null || _this.state.currentUser == undefined && _this.state.currentUser.companyId == null)
                uiSvc.showError("User Profile Error", "Cannot Determine User Organization Info");
            return {companyId : _this.state.currentUser.companyId, departments: _this.state.currentUser.departments};
        };

        _this.isAllowed = function(securities)
        {
            // routine to return if the user is allowed to the given securities
            if (securities == null || securities.length === 0)
                return true;
            // check the security
            let found = lodash.find(securities, function(feature)
            {
                return _this.hasFeature(feature);
            });
            return found;
        };

        _this.hasFeature = function(feature)
        {
            // routine to determine if the currently logged on user has the given feature
            // routine to determine if the currently logged on user has the given feature
            if (_this.state.currentUser == null || _this.state.currentUser == undefined || _this.state.currentUser.features == null)
                uiSvc.showError("User Profile Error", "Cannot Determine User Features");
            let found = lodash.includes(_this.state.currentUser.features, feature.toUpperCase());
            return (found != null);
        };

        _this.checkRepairResubmit = function(departmentId)
        {
            // routine to check if the user has repair/resubmit privledges
            let returnValue = true;
            if (!_this.hasFeature(_this.commonFeatures.TRANS_FIX_ALL))
                returnValue = (_this.hasFeature(_this.commonFeatures.TRANS_FIX) && _this.isMemberOfDepartment(departmentId));
            return returnValue;
        };


        _this.isMemberOfDepartment = function(departmentId)
        {
            // check if the current user is a member of the given department
            if (departmentId == null || departmentId == undefined || departmentId == 0)
                return false;
            let foundId = lodash.find(_this.state.currentUser.departments, function(department)
            {
                return department === departmentId;
            });
            return (foundId != null);
        };


        //</editor-fold>

        //<editor-fold desc="Old User Settings">
        /*
        _this.getSetting = function(id, baseData)
        {
            // routine to return the setting for the given object
            var record = null;
            if (id != null)
                record = lodash.find(_profile.settings, {id: parseInt(id)});
            if (record != null)
                return record;

            // check for default settings for the code concerned
            var record = lodash.find(_profile.settings, {code: "default_" + baseData.code, area: 21 });
            if (record == null)
                record = lodash.find(_profile.settings, {code:"default_" + baseData.code, area: 20});
            if (record == null)
                record = {code:baseData.code, description: baseData.description, area: 21, userId: _profile.id, companyid: _profile.companyId, settingType: baseData.type, notes: baseData.notes};
            return record;
        };

        _this.getConfig = function()
        {
            // routine to return the global config for the currently logged in user
            var deferred = $q.defer();
            if (_profile.config == null)
            {
                apiProvider.get("configRead", { id: _profile.id, companyId: _profile.companyId}).then(function (result)
                {

                    _profile.config = result;
                    deferred.resolve(result);
                }).catch(function (err)
                {
                    $log.error("Unable to retrieve User Settings", err);
                    deferred.reject(err);
                });
            }
            else
            {
                // send back the cached config
                $timeout(function()
                {
                    deferred.resolve(_profile.config);
                }, 5)
            }
            return deferred.promise;
        };



        _this.getSettings = function()
        {
            // routine to return the settings for the currently logged in user
            var deferred = $q.defer();
            if (_profile.settings == null)
            {
                apiProvider.list("settingsRead", { id: _profile.id, companyId: _profile.companyId}).then(function (results) {

                    _profile.settings = results;
                    deferred.resolve(results);
                }).catch(function (err)
                {
                    $log.error("Unable to retrieve User Settings", err);
                    deferred.reject(err);
                });
            }
            else
            {
                // send back the cached preferences
                $timeout(function()
                {
                    deferred.resolve(_profile.settings);
                }, 5)
            }
            return deferred.promise;
        };

        _this.saveSetting = function(record)
        {
            // routine to save the setting to user configuration system
            var deferred = $q.defer();
            apiProvider.getObject("settingUpdate", record).then(function(result)
            {
                // update the profile settings
                var foundRecord = lodash.find(_profile.settings, {id: result.id});
                if (foundRecord != null)
                    lodash.remove(_profile.settings, foundRecord);
                if (!_profile.settings)
                    _profile.settings = [];
                _profile.settings.push(result);
                deferred.resolve(result);
            }).catch(function(err)
            {
                $log.error("Unable to Update User Setting", err);
                deferred.reject(err);
            });
            return deferred.promise;
        };

        _this.deleteSetting = function(id)
        {
            // routine to delete the setting from user configuration system
            var deferred = $q.defer();
            apiProvider.getObject("settingDelete", {id: id}).then(function()
            {
                // update the profile settings
                var foundRecord = lodash.find(_profile.settings, {id: id});
                if (foundRecord != null)
                    lodash.remove(_profile.settings, foundRecord);
                deferred.resolve();
            });
            return deferred.promise;
        };

         _this.saveConfig = function()
        {
            // routine to save the global user config to the database
            if (!_profile.config)
                return;
            return _this.saveSetting(_profile.config);
        }


         */
        //</editor-fold>

        //<editor-fold desc="User Settings">
        _this.saveUserSettings = function()
        {
            // routine to save the user setting configuration to the database
            if (!_this.state.currentUser.settings)
                return;

            // routine to save the setting to user configuration system
            let deferred = $q.defer();
            apiProvider.getObjectMixed("settingsUpdate", {id: _this.state.currentUser.id}, _this.state.currentUser.settings).then(function(result)
            {
                // update the profile settings
                _this.state.currentUser.settings  = result;
                deferred.resolve(result);
            }).catch(function(err)
            {
                $log.error("Unable to Update User Configuration", err);
                deferred.reject(err);
            });
            return deferred.promise;
        };

        _this.getUserSettings = function()
        {
            // routine to return the individualized settings for the currently logged in user
            // in the NOSQL version this is not really required as the settings is set on user login but I am putting this in case we change that and wish to re-read
            let deferred = $q.defer();
            if (_this.state.currentUser.settings == null)
            {
                apiProvider.get("settingsRead", { id: _this.state.currentUser.id}).then(function (result)
                {

                    _this.state.currentUser.settings = result;
                    deferred.resolve(result);
                }).catch(function (err)
                {
                    $log.error("Unable to retrieve User Settings", err);
                    deferred.reject(err);
                });
            }
            else
            {
                // send back the cached config
                $timeout(function()
                {
                    deferred.resolve(_this.state.currentUser.settings);
                }, 5)
            }
            return deferred.promise;

        };
        //</editor-fold>

        //<editor-fold desc="User Templates">

        _this.readUserTemplates = function()
        {
            // routine to return the settings for the currently logged in user
            const deferred = $q.defer();
            if (_this.state.currentUser.templates == null)
            {
                apiProvider.list("templatesRead", { id: _this.state.currentUser.id, companyId: _this.state.currentUser.companyId}).then(function (results) {

                    _this.state.currentUser.templates = results;
                    deferred.resolve(results);
                }).catch(function (err)
                {
                    $log.error("Unable to retrieve User Templates", err);
                    _this.state.currentUser.templates = [];
                    deferred.resolve([]);
                });
            }
            else
            {
                // send back the cached preferences
                $timeout(function()
                {
                    deferred.resolve(_this.state.currentUser.templates);
                }, 5)
            }
            return deferred.promise;
        };
        _this.getUserTemplate = function(id, baseData)
        {
            // routine to return the user template object for the given data
            let record = null;
            let templates = _this.state.currentUser.templates;
            if (id != null)
                record = lodash.find(templates, {id: parseInt(id)});
            if (record != null)
                return record;

            // check for default settings for the code concerned
            record = lodash.find(templates, {code: "default_" + baseData.code, area: 21});
            if (record == null)
                record = lodash.find(templates, {code:"default_" + baseData.code, area: 20});
            if (record == null)
                record = {code:baseData.code, description: baseData.description, area: 21, userId: _this.state.currentUser.id, companyid: _this.state.currentUser.companyId, settingType: baseData.type, notes: baseData.notes};
            return record;
        };

        _this.saveUserTemplate = function(record)
        {
            // routine to update the given user defined template definition
            let deferred = $q.defer();
            apiProvider.getObject("templateUpdate", record).then(function(result)
            {
                // update the profile templates
                let templates = _this.state.currentUser.templates;
                const foundRecord = lodash.find(templates, {id: result.id});
                if (foundRecord != null)
                    lodash.remove(templates, foundRecord);
                if (!_this.state.currentUser.templates)
                    _this.state.currentUser.templates = [];
                _this.state.currentUser.templates.push(result);
                deferred.resolve(result);
            }).catch(function(err)
            {
                $log.error("Unable to Update User Templates", err);
                deferred.reject(err);
            });
            return deferred.promise;
        };

        _this.deleteUserTemplate = function(id)
        {
            // routine to delete the given template id from the user defined templates
            const deferred = $q.defer();
            apiProvider.getObject("templateDelete", {id: id}).then(function()
            {
                // update the profile settings
                const foundRecord = lodash.find(_this.state.currentUser.templates, {id: id});
                if (foundRecord != null)
                    lodash.remove(_this.state.currentUser.templates, foundRecord);
                deferred.resolve();
            }).catch(function(err)
            {
                $log.error("Unable to Delete User Template Definition", err);
                deferred.reject(err);
            });
            return deferred.promise;
        };

        _this.getReloadState = function(state)
        {
            // routine to find the right reload state based on the given state
            let findReloadState = state;
            if (findReloadState.startsWith("."))
            {
                let moduleRoute = _this.getModuleRoute();
                if (moduleRoute)
                    findReloadState = moduleRoute + findReloadState;
            }
            return findReloadState;
        };
        //</editor-fold>

        //<editor-fold desc="Notification Functions">

        //<editor-fold desc="Scope Watchers & Functions">
        _this.getNotificationStats = function()
        {
            // routine to return the the value of the notification stats (this function is called by the layout module) on a watch basis
            // this just returns the high level numbers
            return _this.state.notification.stats;
        };

        _this.getNotificationList = function()
        {
            // routine to return the notification list (this is watched by the notification list directive)
            // this return the list object
            return _this.state.notification.list;
        };
        _this.getNotificationUpdate = function ()
        {
            // routine to return the notification refresh counter (this is watched by the notification list directive)
            return _this.state.notification.list.updateCount;
        };
        _this.updateNotificationStats = function (obj)
        {
            // routine to update the notification stats based on the given object
            // this could be updated from
            // a) socket io joins to core room
            // b) socket io notification updates
            // c) api calls to the notification list and parsing
            // d) user initiated when the user marks a task as completed
            let stats = _this.state.notification.stats;
            stats.taskCount = obj.taskCount;
            _this.updateNotificationDates(stats);
        };
        _this.updateNotificationDates = function(obj)
        {
            let currDate = moment.utc();
            obj.duration = moment.duration(obj.lastUpdate.diff(currDate));
            obj.lastUpdate = currDate;
            obj.updateCount += 1;
        };
        //</editor-fold>

        //<editor-fold desc="API Calls">
        _this.updateNotificationList = function ()
        {
            // routine to update notification List (when the list is invoked or a refresh is clicked)
            let filterObject = {userId: _this.state.currentUser.id, companyId: _this.state.currentUser.companyId};
            let list = _this.state.notification.list;
            apiProvider.getList('notificationSearch', filterObject).then(function (result)
            {
                list.data = result;
                _this.updateNotificationDates(list);
            }).catch(function(err)
            {
                $log.error("Unable to Refresh Notification List", err);
            });
        };

        _this.updateNotificationCount = function ()
        {
            // routine to update notification Count
            let filterObject = {userId: _this.state.currentUser.id, companyId: _this.state.currentUser.companyId};
            apiProvider.getObject('notificationCount', filterObject).then(function (result)
            {
                _this.updateNotificationStats(result);
            }).catch(function(err)
            {
                $log.error("Unable to Refresh Notification Count", err);
            });
        };


        _this.updateNotifyStatus = function(record, newStatus)
        {
            // update to update the status on of a given record on the backend when the user alters the status
            record.newStatus = newStatus;
            return apiProvider.getObject('notificationUpdateStatus', record);
        };
        //</editor-fold>

        //</editor-fold>

        //<editor-fold desc="File Trigger">
        _this.sendFileTrigger = function(data)
        {
            // routine to send the file trigger
            data.WMQC_INSTRUCTION = 11;
            if (data.progress == null)
                data.progress = {title: "File Upload Trigger"};
            if (!data.orgInfo)
            {
                data.orgInfo = _this.getOrgInfo();
                data.orgInfo.userId = _this.getProfile().id;
            }
            return apiProvider.getObject('sendFileTrigger', data);
        };
        _this.handleMQCProgressResponse = function(dialog, response)
        {
            // routine to handle a file trigger response
            if (response.progress.record != null)
            {
                response.progress.record = JSON.parse(response.progress.record);
                dialog.progressInfo.dbId = response.progress.record.id;
                dialog.updateProgress(response.progress.record);
            }
        };
        //</editor-fold>

        //<editor-fold desc="Authentication & Socket-IO">
        _this.getUserTransactionSecurity = function()
        {
            // routine to return the base user transaction security based on the logged in profile
            let allowRepair = _this.hasFeature(_this.commonFeatures.TRANS_FIX_ALL);
            let allowResubmit = allowRepair;
            let userWithinDept = _this.hasFeature(_this.commonFeatures.TRANS_FIX);
            let userCancel = _this.hasFeature(_this.commonFeatures.TRANS_CANCEL);
            let userMark = _this.hasFeature(_this.commonFeatures.TRANS_FORCE_COMPLETE);
            return {repair: allowRepair, resubmit: allowResubmit, cancel: userCancel, mark: userMark, withinDept: userWithinDept};
        };

        _this.showLoginError = function(title, error)
        {
            uiSvc.showSmallPopup(title, error, 6000, "#C46A69", "fa-sign-in shake animated");
        };
        _this.authenticate = function(record)
        {
            // routine to do login authentication for non-social logins
            return apiProvider.getObject('login',record);
        };

        
        _this.userLogin = function(serverResponse, credentials)
        {
            // routine to as a user - the actual data for the user is stored in a token which expires
            _this.state.currentUser = null;
            _this.initializeProfile(true);
        };

        _this.socialLogin = function(serverResponse, provider)
        {
            // routine to manage the social media logins
            let profile = serverResponse.data.user;
            _this.userLogin(profile);
        };


        _this.initializeProfile = function(navigate)
        {
            if (_this.state.currentUser === null || _this.state.currentUser.id == null)
            {
                let authenticated = $auth.isAuthenticated();
                if (!authenticated) {

                    let payload = $auth.getPayload();
                    if (payload == null) {
                        $state.go("login");
                        return;
                    }
                }

                // check if there is a still a profile
                _this.state.currentUser = $auth.getPayload();
            }
            cacheDataSvc.setLoggedInUser(_this.state.currentUser);
            if (navigate)
                _this.navigateToStart();
        };


        
        _this.logout = function(navigate)
        {
            // routine to cleanup when the user has logged out
            _this.state.currentModule = {lastRoute: undefined, module_route: undefined}; // users last route
            cacheDataSvc.setLoggedInUser(null, null, false);
            $auth.logout();
            if (navigate)
                $state.go("login");
        };
        //</editor-fold>

        //<editor-fold desc="Route Management">
        _this.getUserModules = function(baseModules)
        {
            // routine to return the user modules
            let modules = lodash.filter(baseModules, function(moduleRecord)
            {
                if (moduleRecord.jsonData == null || moduleRecord.jsonData.security == null)
                    return true;

                // check the security
                let found = lodash.find(moduleRecord.jsonData.security, function(feature)
                {
                    return _this.hasFeature(feature);
                });
                return found != null;
            });

            lodash.forEach(modules, function(moduleRecord)
            {
                // update the states to reflect the module description
                if (moduleRecord.jsonData.route && moduleRecord.jsonData.route.ngroute)
                    uiSvc.updateStateModule(moduleRecord.jsonData.route.ngroute, moduleRecord.description, moduleRecord.code);
            });

            return modules;
        };

        _this.setModuleRoute = function(state, modules)
        {
            // routine to set the module route based on the state
            _this.state.currentModule.module_route = undefined;
            if (state && state.data && state.data.module_id)
            {
                let record = lodash.find(modules, {code: state.data.module_id.toString().toLowerCase()});
                if (record != null)
                    _this.state.currentModule.module_route = record.jsonData.route.ngroute;
            }
            return _this.state.currentModule.module_route;
        };
        _this.getModuleRoute = function()
        {
            return _this.state.currentModule.module_route;
        };
        _this.isTokenValid = function(toState, toParams)
        {
            // routine to check if the token is still valid - this will be called by the route manager on the title directive

            let authenticated = $auth.isAuthenticated();
            if (!authenticated)
            {
                // check if we need to go the lock screen or to the login screen
                let token = $auth.getToken();
                if (token == null)
                    return 0;
                else
                    return -1;
            }
            return 1;
        };
        _this.persistRoute = function(toState, toParams)
        {
            // save the last route
            if (_this.state.currentModule.lastRoute === undefined)
                _this.state.currentModule.lastRoute = {};
            _this.state.currentModule.lastRoute.name = toState.name;
            _this.state.currentModule.lastRoute.parameters = (toParams) ? toParams : null;
        };
        //</editor-fold>

        _this.initializeProfile(false)

    }]);
});
