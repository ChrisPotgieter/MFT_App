/*
 /// <summary>
 /// modules.common.provider - socketProvider
 /// Facade around Socket-IO - Enables communication with Socket-IO in a controlled way
 /// based on the project https://github.com/davisford/angular-socket-io which is fork of the project  https://github.com/btford/angular-socket-io
 /// This implementation fixes issues described the 2 post
 ///    https://github.com/btford/angular-socket-io/issues/79
 ///    https://github.com/btford/angular-socket-io/issues/86 
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date:7/1/2016
 /// </summary>
 */
define(['modules/common/module', 'socket-io'], function(module)
{
	"use strict";
	module.registerProvider('socketProvider',[function()
	{
		// when forwarding events, prefix the event name
		let defaultPrefix = 'socket:';
		
		// expose to provider
		this.$get = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
			
			return function socketFactory(options) {
				options = options || {};
				let prefix = options.prefix === undefined ? defaultPrefix : options.prefix ;
				let defaultScope = options.scope || $rootScope;
				
				let socket;
				
				// if socket is not connected, we queue up calls from controllers
				// and re-execute later
				let queue = {
					addListener: [],
					addOnceListener: [],
					forward: [],
					emit: []
				};
				
				function asyncAngularify(socket, callback) {
					return callback ? function () {
						let args = arguments;
						$timeout(function () {
							callback.apply(socket, args);
						}, 0);
					} : angular.noop;
				}
				
				// this is a wrapper around base functionality we do the the socket.io client but we always require
				// the caller to pass the instance into us.  the onus is on the caller to ensure that the socket
				// client is in a good state / connected.
				let io = {
					emit: function (socket, eventName, data, callback) {
						if (!socket || !socket.connected) { throw new Error('emit called and socket not ready'); }
						if (typeof callback === 'function') {
							callback = asyncAngularify(socket, callback);
						}
						return socket.emit.call(socket, eventName, data, callback);
					},
					
					forward: function (socket, events, scope, prefix) {
						if (!socket || !socket.connected) { throw new Error('forward called and socket not ready'); }
						events.forEach(function (eventName) {
							let prefixedEvent = prefix + eventName;
							let forwardBroadcast = asyncAngularify(socket, function () {
								Array.prototype.unshift.call(arguments, prefixedEvent);
								$rootScope.$broadcast.apply(scope, arguments);
							});

							scope.$on('$destroy', function () {
								socket.removeListener(eventName, forwardBroadcast);
							});

							return socket.on(prefixedEvent, forwardBroadcast);
						});
					},
					
					addListener: function (socket, eventName, callback) {
						if (socket && socket.connected)
							return socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
					},
					
					addOnceListener: function (socket, eventName, callback) {
						if (!socket || !socket.connected) { throw new Error('addOnceListener called and socket not ready'); }
						return socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
					}
				};
				
				/*jshint unused: false */
				let emit = function (eventName, data, callback) {
					let array = Array.prototype.slice.apply(arguments);
					if (!socket || !socket.connected) {
						queue.emit.push(array);
					} else {
						array.unshift(socket);
						io.emit.apply(null, array);
					}
				};
				
				/*jshint unused: false */
				let forward = function (events, scope, customPrefix) {
					if (!scope) { scope = defaultScope; }
					if (!(events instanceof Array)) { events = [events]; }
					if (!customPrefix)
						customPrefix = prefix;
					let array = [events, scope, customPrefix];
					if (!socket || !socket.connected) {
						queue.forward.push(array);
					} else {
						array.unshift(socket);
						io.forward.apply(null, array);
					}
				};
				
				/*jshint unused: false */
				let addListener = function (eventName, callback) {
					let array = Array.prototype.slice.call(arguments);
					if (!socket || !socket.connected) {
						queue.addListener.push(array);
					} else {
						array.unshift(socket);
						io.addListener.apply(null, array);
					}
				};
				
				// /*jshint unused: false */
				let addOnceListener = function (eventName, callback) {
					let array = Array.prototype.slice.call(arguments);
					if (!socket || !socket.connected) {
						queue.addOnceListener.push(array);
					} else {
						array.unshift(socket);
						io.addOnceListener.apply(null, array);
					}
				};
				
				let removeListener = function (ev, fn) {
					if (fn && fn.__ng) {
						arguments[1] = fn.__ng;
					}
					if (!socket)
						return;
					return socket.removeListener.apply(socket, arguments);
				};
				
				let removeAllListeners = function () {
					if (!socket)
						return;
					return socket.removeAllListeners.apply(socket, arguments);
				};
				
				return {
					emit: emit,
					forward: forward,
					on: addListener,
					addListener: addListener,
					hasSocket: function()
					{
						return !!socket;

					},
					once: addOnceListener,
					removeListener: removeListener,
					removeAllListeners: removeAllListeners,
					socket: function (s) {
						socket = s;
						for (let key in queue) {
							let deferredCalls = queue[key];
							if (deferredCalls.length > 0) {
								console.log('%s has %d deferred calls b/c socket was not ready yet', key, deferredCalls.length);
								deferredCalls.map(function (array) {
									array.unshift(socket);
									io[key].apply(null, array);
								});
								queue[key].length = 0;
							}
						}
					}
				}; // end return
				
			}; // end socketFactory
			
		}];  // end .$get
	}]);
});
