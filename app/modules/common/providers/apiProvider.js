/*
 /// <summary>
 /// modules.common.services - apiSvc.js
 /// WebAPI Provider to allow standardization of API calls across the system
 /// based on https://objectpartners.com/2014/06/03/extending-angulars-resource-service-for-a-consistent-api/
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 4/14/2015
 /// </summary>
 */

define(['modules/common/module', 'modules/common/services/apiSvc'], function(module)
{
	"use strict";
	module.registerProvider('apiProvider', function(){
		this.$get = ['apiSvc', function(apiSvc){
			return {
				list: function (resource, model) {
					return apiSvc[resource].query(model).$promise;
				},

				get: function (resource, model) {
					return apiSvc[resource].get(model).$promise;
				},

				save: function (resource, model) {
					return apiSvc[resource].save(model).$promise;
				},

				remove: function (resource, model) {
					return apiSvc[resource].remove(model).$promise;
				},
				getList: function (resource, model) {
					return apiSvc[resource].getList(model).$promise;
				},
				getListMixed: function (resource, params, model) {
					return apiSvc[resource].getListMixed(params, model).$promise;
				},

				getObject: function (resource, model) {
					return apiSvc[resource].getObject(model).$promise;
				},
				getObjectMixed: function (resource, params, model) {
					return apiSvc[resource].getObjectMixed(params, model).$promise;
				},

				getBlob: function (resource, model) {
					return apiSvc[resource].getBlob(model).$promise;
				},
				delete: function (resource) {
					return apiSvc[resource]
				}
			};
		}];
	});
});
