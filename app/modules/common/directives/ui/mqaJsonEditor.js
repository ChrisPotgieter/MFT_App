/*
 /// <summary>
 /// modules.common.directives.ui - mqaJsonEditor.js
 /// Common Directive to Manage Viewing JSON Content via json EDITOR
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 22/01/2023
 /// </summary>
 */

define([ 'modules/common/module', 'jsoneditor', 'angular-jsoneditor' ], function (module, jsoneditor) {
	'use strict';
	window.JSONEditor = jsoneditor;
	module.registerDirective('mqaJsonEditor', [
		'$timeout',
		'uiSvc',
		function ($timeout, uiSvc) {
			return {
				restrict: 'E',
				replace: true,
				templateUrl: 'app/modules/common/directives/ui/mqaJsonEditor.tpl.html',
				scope: {},
				bindToController: {
					data: '=',
					uiObject: '=?',
					readOnly: '@?',
					functionManager: '=?',
					id: '='
				},
				controllerAs: 'vmEditor',
				controller: function ($scope) {
					var _this = this;
					_this.functions = {};
					_this.model = {data:{}};
					_this.model.data = _this.data;
					//Find json editor
				//	const container = document.getElementById(_this.id);

					//view option for json editor
					const options = {
						mode: 'tree',
						modes: [ 'code', 'text', 'tree' ], // Mode options available
					/*	onModeChange: function (newMode, oldMode) {
							console.log('Mode switched from', oldMode, 'to', newMode);
						}*/
					};

					//set json data
				//	const json = _this.data;

					//const editor = new JSONEditor(container, options, json);
					//Expand data to max
					













					   // create the editor
					   const container = document.getElementById(_this.id)
					 //  const options = {}
					   const editor = new JSONEditor(container, options)
			   
					   // set json

					   /*
					 {"code":"C/F","company_id":2,"type":"CRS_LOB","description":"Cancer/Family132","data":{"status":1,"group":"EMP_GROUP2"}}  

					 "Array": [1, 2, 3],
						   "Boolean": true,
						   "Null": null,
						   "Number": 123,
						   "Object": {"a": "b", "c": "d"},
						   "String": "Hello World"
					   */
					   const initialJson = _this.data;
					   editor.set(initialJson);
					   editor.expandAll();
			   
					   // get json
					   const updatedJson = editor.get()
				
				}
			};
		}
	]);
});
