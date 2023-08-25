/*
 /// <summary>
 /// app.modules.common.services - cacheDataSvc.js
 /// Client Implementation of the Server Side Cache Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/26/2014
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment'], function (module, lodash, moment) {
    "use strict";

    moment().format();

    module.registerService('cacheDataSvc', ['$templateCache', '$log', '$http', '$q', '$timeout', 'apiSvc', 'apiProvider', function ($templateCache, $log, $http, $q, $timeout, apiSvc, apiProvider) {

        // initialize the api
        let _this = this;
        let configs = [
            {url: 'admin/cache', 'resourceName': 'cacheData'}
        ];

        angular.forEach(configs, function (value) {
            apiSvc.add(value);
        });


      // initialize the variables
        _this.cacheData = null;
        _this.currentUser = {record: {}, company:{}};
        _this.dashboardStates = {};

        _this.data = {moduleConfig:{}, allowedViewTypes: ["xml", "txt", "json", "edi", "csv"], list_codes: {edi: "EDI_DOCUMENT"}, modules: [], tenant_environment:null};


        //<editor-fold desc="Templates">
        _this.loadTemplate = function (template, id) {
            // routine to load a given template and return its html (via promises), if the template is not in the cache it will be added
            const deferred = $q.defer();
            const html = $templateCache.get(id);

            if (angular.isDefined(html)) {
                // The template was cached or a script so return it
                // html = html.trim();
                deferred.resolve(html);
            } else {
                // Retrieve the template if it is a URL
                $http.get(template, {cache: $templateCache}).then(
                    function (response) {
                        const html = response.data;
                        if (!html || !html.length) {
                            // Nothing was found so reject the promise
                            return deferred.reject("Template " + template + " was not found");
                        }
                        //       html = html.trim();
                        // Add it to the template cache using the url as the key
                        if (id)
                            $templateCache.put(id, html);
                        else
                            $templateCache.put(template, html);
                        deferred.resolve(html);
                    }, function () {
                        deferred.reject("Template " + template + " was not found");
                    }
                );
            }
            return deferred.promise;
        };

        _this.setTemplates = function () {
            // routine to load the required directive templates into the cache
            _this.loadTemplate("app/modules/common/directives/ui/mqaWidgetUserSaveDialog.tpl.html", "mqaWidgetUserSaveDialog.tpl.html");
            _this.loadTemplate("app/modules/common/directives/tables/mqaDataTable.tpl.html", "mqaDataTable.tpl.html");
            _this.loadTemplate("app/modules/common/directives/input/uiSelect-mqaTag.tpl.html", "uiSelect-mqaTag.tpl.html");
            _this.loadTemplate("app/modules/common/directives/input/uiSelect-mqaList.tpl.html", "uiSelect-mqaList.tpl.html");
            _this.loadTemplate("app/modules/common/directives/input/uiSelect-mqaCombo.tpl.html", "uiSelect-mqaCombo.tpl.html");
            _this.loadTemplate("app/modules/common/directives/tree/mqaTreeViewNode.tpl.html", "mqaTreeViewNode.tpl.html");
            _this.loadTemplate("app/modules/common/directives/tree/mqaTreeViewSubLinkNode.tpl.html", "mqaTreeViewSubLinkNode.tpl.html");
        };
        //</editor-fold>

        //<editor-fold desc="Parameters">
        _this.getParameter = function (id) {
            // routine to get a given parameter
            return lodash.filter(_this.cacheData.parameters, {id: id});
        };
        _this.getParameterDescription = function (id) {
            // routine to get a parameter description
            let items = _this.getParameter(id);
            if (items && items.length > 0)
                return items[0].description;
            return "Unknown";
        };
        //</editor-fold>

        //<editor-fold desc="Product and Copyright">
        _this.getTenantEnvironment = function()
        {
            return _this.data.tenant_environment;
        };
        _this.setTenantEnvironment = function(result)
        {
            // set the tenant environment
            _this.data.tenant_environment = result;
        };

        _this.getProductEnvironment = function ()
        {
            if (_this.cacheData == null || _this.cacheData.product == null)
                return null;
            return _this.cacheData.product;
        };

        _this.getCustomModuleDesc = function(module_identifier)
        {
            // routine to get the custom module description
            if (_this.data.modules == null)
                _this.getBaseModules();

            // now find the module with the given identifier
            let module = lodash.find(_this.data.modules, function(record)
            {
                if (record.jsonData && record.jsonData.identifier == module_identifier)
                    return record;
            })
            if (module)
                return module.description;
            else
                return "Custom"
        };


        _this.getBaseModules = function () {
            // routine to work out the base modules for this environment
            let customModules = _this.getListForType("1", "MODULE", 0);
            let baseModules = _this.getListForType("0", 'MODULE');

            // merge the custom modules with the base modules

            lodash.forEach(customModules, function (record)
            {
                let baseIndex = lodash.findIndex(baseModules, {code: record.code});
                if (baseIndex !== -1)
                {
                    // found in the base
                    let baseRecord = baseModules[baseIndex];
                    record = lodash.merge(baseRecord, record); // merge the record
                    baseModules.splice(baseIndex, 1); // remove the record from the base
                }
                baseModules.push(record); // add the custom
            });

            // work out the start route for the module
            lodash.forEach(baseModules, function(record)
            {
                record.code = record.code.toString().toLowerCase();
                if (record.jsonData && record.jsonData.route)
                {
                    let route = record.jsonData.route;
                    route.startRoute = route.ngroute + ".";
                    if (route.ngroute_initial)
                        route.startRoute +=  route.ngroute_initial;
                    else
                        route.startRoute += "dashboard";
                }
            });

            _this.data.modules = lodash.filter(baseModules, function(record)
            {
                return record.jsonData.route.startRoute != null;
            });
            return _this.data.modules;
        };

        _this.getModuleDesc = function (moduleCode) {
            // routine to return the module description for the given module code
            if (_this.data.modules.length === 0)
                _this.getBaseModules();

            let module = lodash.find(_this.data.modules, {code: moduleCode.toString().toLowerCase()});
            if (module != null)
                return module.description;
            else
                return moduleCode.toString.toUpperCase();

        };

        //</editor-fold>

        //<editor-fold desc="Lists">

        _this.getEDIListType = function()
        {
            return _this.data.list_codes.edi;
        };
        _this.getDescriptionProperty = function (record) {
            if (record)
                return record.description;
            else
                return "Unknown";
        };

        _this.getListForType = function (listType, filterType, companyId) {
            // return all company list types that match the given type
            let listArray = _this.getList(listType, companyId);
            if (listArray != null)
                return lodash.filter(listArray, {type: filterType});
            return null;

        };

        _this.getListRecord = function (listType, filterType, id, companyId) {
            let items = _this.getListForType(listType, filterType, companyId);
            if (items != null) {
                return lodash.find(items, {code: id.toString()});
            }
            return null;
        };

        _this.getListDescription = function (listType, filterType, id, companyId) {
            let record = _this.getListRecord(listType, filterType, id, companyId);
            return _this.getDescriptionProperty(record);
        };
        _this.getListDescriptionFromArray = function (items, id) {
            if (items != null) {
                let record = lodash.find(items, {code: id.toString()});
                return _this.getDescriptionProperty(record);
            }
        };
        _this.getList = function (type, companyId) {
            // routine to return the list for the given type
            switch (type) {
                case "0":
                    return _this.cacheData.productLists;
                case "1":
                    if (companyId == null)
                        companyId = _this.currentUser.record.companyId;
                    return lodash.filter(_this.cacheData.companyLists, {companyId: companyId});
            }
        };

        _this.initializeLists = function (force) {
            // routine to initialize the lists based on api call to the server
            // this will be called by the ui resolver when the layout appears
            let deferred = $q.defer();
            if (force === undefined)
                force = false;
            if (_this.cacheData != null && !force) {
                $timeout(function () {
                    deferred.resolve(_this.cacheData);
                }, 200);
            }
            apiProvider.get('cacheData').then(function (result) {

                _this.cacheData = result;
                _this.setLoggedInCompany()

                // update the core module config
                let cacheRecord = _this.getListRecord("1", "MODULE", "CORE", 0);
                if (cacheRecord != null)
                {
                    _this.data.moduleConfig = cacheRecord;
                    if (_this.data.moduleConfig.jsonData.settings.mime) {
                        lodash.forOwn(_this.data.moduleConfig.jsonData.settings.mime, function (value, key) {
                            if (!_this.data.allowedViewTypes.includes(key))
                                _this.data.allowedViewTypes.push(key);
                        })
                    }
                }

                // set the user data if need be
                deferred.resolve(result);
            }).catch(function (result)
            {
                deferred.reject(result);
                $log.error("Unable to retrieve Cache Data", result);
            });
            return deferred.promise;
        };


        _this.updateCacheList = function (type, record) {
            // now update the current data in the service to reflect this change
            let oldRecord = _this.getListRecord("1", record.type, record.code);
            if (oldRecord)
                lodash.merge(oldRecord, record);
            else {
                let items = _this.getListForType(type, record.type);
                items.push(record);
            }
        };

        //</editor-fold>


        //<editor-fold desc="Companies">
        _this.getDepartmentDesc = function(deptId)
        {
            // routine to return the department description for the given item
            if (deptId === null || deptId === 0)
                return "Un-Specified";
            if (_this.currentUser.company != null)
            {
                let deptRecord = lodash.find(_this.currentUser.company.departments, {id: deptId});
                if (deptRecord != null)
                    return deptRecord.name;
            }
            return "Unknown (" + deptId + ")";
        };

        _this.getCompanies = function () {
            // routine to return the companies
            return _this.cacheData.companies;
        };

        _this.getCompanyName = function (id) {
            // routine to get the company name for the given id
            let record = lodash.find(_this.cacheData.companies, {id: id});
            if (record != null)
                return record.name;
            else
                return "Unknown (" + id + ")";
        };

        _this.getCompanyDepartments = function(id)
        {
            // routine to return all departments for the given company id
            // this information will be attached to the profile object for use in future department filtering and department ui logic
            let record = lodash.find(_this.cacheData.companies, {id: id});
            if (record != null && record.departments)
            {
                return record.departments;
            }
            return [];
        };
        _this.setLoggedInUser = function(data)
        {
            // routine to set the logged in user
            _this.currentUser = {record: data, company: null};
            _this.setLoggedInCompany();
        };
        _this.setLoggedInCompany = function()
        {
            // routine to set the current logged in company

            if (_this.currentUser.record == null || _this.cacheData === null)
                return;
            _this.currentUser.company = lodash.find(_this.cacheData.companies, {_id: _this.currentUser.record.companyId});
        };
        //</editor-fold>

        //<editor-fold desc="Dashboard">
        _this.setDashboardState = function(state, dashboardConfig)
        {
            let code = dashboardConfig.module + "." + dashboardConfig.code;
            lodash.set(_this.dashboardStates, code , state);
        };

        _this.getDashboardState = function(dashboardConfig)
        {
            let code = dashboardConfig.module + "." + dashboardConfig.code;
            return lodash.get(_this.dashboardStates, code, null);
        };
        //</editor-fold>

        // initialize the service
        _this.setTemplates();

    }
    ]);
});
