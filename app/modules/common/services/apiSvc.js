/*
 /// <summary>
 /// modules.common.services - apiSvc.js
 /// WebAPI Invoker Service - Service to allow standardization of Web API Calls across the system
 /// based on https://objectpartners.com/2014/06/03/extending-angulars-resource-service-for-a-consistent-api/
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/14/2015
 /// </summary>
 */
define(['modules/common/module', 'appCustomConfig'], function(module, appCustomConfig)
{
	"use strict";
	module.registerService('apiSvc',['$resource',function($resource)
	{
		let api =
		{
			baseUrl: appCustomConfig.net + "/api/",
			defaultConfig : {id: '@id'},
			extraMethods: {
				'getObject' :{ method: 'POST'},
                'getObjectMixed' :{ method: 'POST'},
                'getList':{method:'POST', isArray: true},
				'getListMixed':{method:'POST', isArray: true},
				'getBlob': {
                    method:'GET',
                    responseType: 'arraybuffer',
                    cache: true,
                    transformResponse: function (data, headers)
                    {
						let fileObject;
						const requestHeaders = headers();

						if (data)
                        {
                            fileObject = new Blob([data], {type: requestHeaders["content-type"]});
                        }
                        let returnObj = { blob: fileObject, fileName: requestHeaders["x-filename"]};
                        if (requestHeaders["x-partial"])
                        	returnObj.partial = parseInt(requestHeaders["x-partial"]);
                        if (requestHeaders["x-total"])
                        	returnObj.total = parseInt(requestHeaders["x-total"]);
                        return returnObj;
                    }
				}
			},
			add: function(config)
			{
				// routine to add a new resource to the api service
				let parms, url;

				// now check we need to customize the parameters
				if (config.baseUrl)
					url = config.baseUrl + "/api/";
				else
					url = this.baseUrl;
				url += config.url;
				if (!config.params)
				{
					// set the default parameters
					const orig = angular.copy(api.defaultConfig);
					parms = angular.extend(orig, {});
					url += "/:id";
				}
				else
				{
					// use the custom parameters
					parms = config.params;
				}


				// check if we have custom methods
				const methods = config.methods || api.extraMethods;

				// now create the object
				api[config.resourceName] = $resource(url, parms, methods);
			},
			get: function(resourceName)
			{
				return api[resourceName];
			}
		};
		return api;
	}
	]);
});
