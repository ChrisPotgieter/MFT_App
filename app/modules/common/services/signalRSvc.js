/*
 /// <summary>
 /// modules.common.services - signalRSvc.js
 /// Signal-R Invoker Service to allow standardization of Signal R Calls across the system
 /// This uses the Hub Service to create hubs and make the actual connections to signal-R
 /// The idea is that each module layout controller will interact with this service which will inturn interact with the hub service to manage Signal-R communication
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 5/6/2015
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'appCustomConfig', 'angular-signalr'], function(module, lodash, appCustomConfig)
{
	"use strict";
	module.registerService('signalRSvc',['$log','Hub',function($log, Hub)
	{
		let _this = this;

		const hubList = {};
		const baseOptions =
			{
				listeners:
					{
						newConnection: function (id, hubName) {
							$log.info("connected to the " + hubName + " signal-r hub", id);
						}
					},
				errorHandler: function (error) {
					$log.error(error);
				},
				rootPath: appCustomConfig.net + "/signalr/",
				logging: true,
				transport: ['webSockets', 'longPolling']
			};

		_this.startListener = function(hubName, hubOptions)
		{
			// routine to start listening on the given hub
			$log.info("starting signalr listener for hub " + hubName);
			let hub;
			let promise;
			if (!hubList[hubName])
			{
				// create the new hub and start listening
				const options = lodash.merge({}, baseOptions, hubOptions);
				options.hubDisconnected = function()
				{
					if (hubList[hubName].connection.lastError) {
						hubList[hubName].connection.start();
					}
				};
				hub = new Hub(hubName, options);
				hubList[hubName] = hub;
				promise = hub.promise;
			}
			else
			{
				// the hub already exists so just start listening
				hub = hubList[hubName];
				promise = hub.connect();
			}
			promise.fail(function (error)
			{
				$log.error("could not connect to hub", error);
			})
		};

		_this.stopListener = function(hubName)
		{
			// routine to stop the given hub from listening
			$log.info("stopping signalr listener for hub " + hubName);
			if (!hubList[hubName])
				return;

			const hub = hubList[hubName];
			hub.disconnect();
		};

		_this.getHub = function(hubName)
		{
			// routine to return the given hub
			if (!hubList[hubName])
				return;
			return hubList[hubName];
		};
	}
	]);
});
