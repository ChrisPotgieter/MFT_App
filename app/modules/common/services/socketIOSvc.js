/*
 /// <summary>
 /// modules.common.services - socketIOSvc
 /// Server to Manage Socket IO Interaction with the Node System
 /// This will place a wrapper around the socket-io provider and also add other methods that will become useful 
 /// The idea is that each module layout controller will interact with this service which will inturn interact with the socket-io provider to manage Socket IO communication
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 1/7/2016
 /// </summary>
 */
define(['modules/common/module', 'modules/common/providers/socketProvider', 'socket-io', 'lodash', 'appCustomConfig'], function(module, provider, io, lodash, appCustomConfig)
{
	"use strict";
	module.registerService('socketIOSvc',['$log','$auth', '$state','socketProvider','uiSvc', 'userSvc', function($log, $auth, $state, socketProvider, uiSvc, userSvc)
	{
		// initialize the variables
		const _this = this;
		const _wrapper = socketProvider();
		let _socket;
		let _rooms = [];
		let _listeners = {};
		let _cacheListeners = {};
		let _cacheModules = [];
		let _currentRoom;
		let _currentModule;
		let _reconnectAttempt = false;

		_this.connect = function(callback)
		{
			// routine to connect to the  socket-io
			const secure = lodash.startsWith(appCustomConfig.node, "https");
			const opts = {forceNew: true, reconnection: true, reconnectionDelay: 2000, secure: secure};
			if (appCustomConfig.nodePath)
				opts.path = "/" + appCustomConfig.nodePath + "/socket.io";
			_socket = io.connect(appCustomConfig.node, opts);

			_socket.on("reconnect_attempt", function()
			{
				_reconnectAttempt = true;
				_this.removeAllListeners(true);
				_wrapper.socket(null);
			});

			_socket.on('connect', function ()
			{
				// send the authentication
				const authData = {token: $auth.getToken(), refresh: false};
				if (_reconnectAttempt)
					authData.rooms = _rooms;
				else
					authData.rooms = [];

				_socket.emit("authentication", authData);

				// manage the authentication
				_this.addListener("authenticated", function ()
				{

					// update the reconnection flags
					const reconnection = _reconnectAttempt;
					_reconnectAttempt = false;
					
					// add the base listeners back
					_this.addListener("core.error", function (data, event) {
						return uiSvc.showError(data.title, data.message);
					});
                    _this.addListener("user.notification.update", function(data, event)
					{
						userSvc.updateNotificationStats({taskCount: data.value});
                    });
					_this.addListener("core.auth.success", function (data, event)
					{
						// update the rooms array with the default joined rooms
						_rooms = data.rooms;
						userSvc.updateNotificationStats({taskCount: data.taskCount});

						// user's token has successfully authenticated
						_wrapper.socket(_socket); // update the wrappers socket

						// add the other listeners and call a callback if required
						if (reconnection)
						{
							_this.reconnectListeners();
						}
						else
						{
							// add any cache listeners
							_this.connectCacheListeners();
							_this.connectCacheModules();
							// call the call back
							if (callback)
								callback();
						}
					});
				});

				// manage authentication failure
				_this.addListener("unauthorized", function ()
				{
					// redirect the user to the locked screen - where they can login and it they will via callback, be directed to wherever they currently are
					// TODO: This needs checking
                    _this.logout(function()
                    {
                        _this.disconnect();
                        userSvc.persistRoute($state.current, $state.params);
                        $state.go("lock");
                    });
				});
			});
		};

		_this.disconnect = function()
		{
			// disconnect the socket
			if (_socket)
			{
				_this.removeAllListeners();
				if (_socket.connected)
					_socket.disconnect();
			}
			if (_wrapper.hasSocket())
				_wrapper.socket(null);
		};

		_this.isConnected = function()
		{
			// routine to return if the socket is connected
			return (_socket != null && _socket.connected && _wrapper.hasSocket())
		}

		_this.logout = function(callback)
		{
			if (_this.isConnected())
			{
				try {
                    _this.emit("client.auth.logout_request", null, callback);
                }
                catch(err)
				{
					callback();
				}
			}
			else
				callback();
		};


		_this.addListener = function (eventName, callback)
		{
			if (_socket == null)
			{
				_cacheListeners[eventName] = callback;
				return;
			}
			_this.removeListener(eventName);
			if (_wrapper.hasSocket())
				_wrapper.addListener(eventName, callback);
			else
				_socket.on(eventName, callback);
			_listeners[eventName] = callback;

		};
		
		_this.removeListener = function(eventName,reconnect)
		{
			// routine to remove listeners from the socket
			if (_listeners[eventName])
			{
				if (_wrapper.hasSocket())
					_wrapper.removeListener(eventName);
				else
					_socket.removeListener(eventName);
			}
			if (!reconnect)
				delete _listeners[eventName];
		};

		_this.removeAllListeners = function(reconnect)
		{
			// routine to remove all tracked listeners from the socket
			lodash.forOwn(_listeners, function(value, key)
			{
				_this.removeListener(key, reconnect);
			});
			if (!reconnect)
				_listeners = {};
		};

		_this.reconnectListeners = function()
		{
			// routine to reconnect the listeners that need to be active on the socket during a reconnection
			const exclusions = ["authenticated", "unauthorized", "core.error", "core.auth.success", "user.notification.update"];
			lodash.forOwn(_listeners, function(value, key)
			{
				if (lodash.indexOf(exclusions, key) === -1)
					_this.addListener(key, value);
			});
		};

		_this.connectCacheListeners = function()
		{
			// routine to attach the cached listeners
            lodash.forOwn(_cacheListeners, function(value, key)
            {
				_this.addListener(key, value);
            });
            _cacheListeners = {};

        };
        _this.connectCacheModules = function()
        {
            // routine to attach the cached modules
            lodash.forOwn(_cacheModules, function(value, key)
            {
                _this.connectModule(key, value);
            });
            _cacheModules = {};

        };

        _this.emit = function(eventName, data, callback)
		{
			return _wrapper.emit(eventName, data, callback);
		};

		_this.connectModule = function(module, callback)
		{
            if (_socket == null)
            {
                _cacheModules[module] = callback;
                return;
            }
	        // disconnect any previous rooms
			if (_currentRoom && _currentModule)
				_this.disconnectModule(_currentModule);
			
			// connect to the new room and ignore funny messages
			// routine to join the module "room"
			return _this.emit("client.auth.join", module, function(err, data)
			{
				if (err)
					return showError("Unable to Join Module " + module, err);

				// update the rooms
				if (lodash.indexOf(_rooms, data) == -1)
					_rooms.push(data);
				
				// update the variables
				_currentRoom = data;
				_currentModule = module;

				// call the callback
				if (callback)
					callback(data);
			});
		};
		
		_this.disconnectModule = function(module)
		{
			// routine to leave the module "room"
			return this.emit("client.auth.leave", module, function(err, data)
			{
				if (err)
					return showError("Unable to Leave Room " + module, err);

				// update the rooms
				_rooms = lodash.remove(_rooms, data);

				// update the variables
				_currentModule = null;
				_currentRoom = null;
				
			});
		};


	}
	]);
});
