/*
 /// <summary>
 /// app.modules.custom.spe_cno.directives - aegfGroupFilter.js
 /// Directive to Manage Employer Group and Sub-Group Selector for Automated Employer Group Files
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 29/03/2023
 /// </summary>
 */
 define([ 'modules/custom/spe_cno/module', 'lodash'], function (module, lodash) {
	'use strict';
	module.registerDirective('aegfGroupFilter', ['userSvc','adminDataSvc',	function (userSvc, adminDataSvc)
	{
			return {

				restrict: 'E',
				scope: {},
				bindToController: {
					options: '=',
					ngModel: '=',
					functionManager: '=?',
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/custom/spe_cno/directives/aegfGroupFilter.tpl.html',
				controller: function ($element, $scope)
				{
					let _this = this;
					_this.functions = {};

					//<editor-fold desc="Initialization">
					_this.functions.initializeOptions = function()
					{
						// routine to initialize the model
						if (_this.model.options.orientation == null)
							_this.model.options.orientation = 0 ; // 0 = horiz, 1 - vert
						if (!_this.model.options.showClear)
							_this.model.options.showClear = false;

						if (_this.options.multiSelect == null)
							_this.options.multiSelect = true;
					};

					_this.functions.initializeSubGroups = function()
					{
						// in the event that the ng-model is provided during directive initialization, update the list and sub-group model
						let savedValue = _this.ngModel.sub_groups;
						_this.model.selectedGroup = _this.model.foundGroups[0];
						_this.functions.getSubGroups(false);

						if (savedValue == null || savedValue.length == 0)
							return;

						// now check that all these subgroups are still valid
						if (!_this.model.options.multiSelect)
						{
							_this.model.selectedSubGroups = lodash.find(_this.model.subGroups, function (value) {
								if (value.code === savedValue.toString())
									return value.code.toString();
							});
						}
						else
						{
							_this.model.selectedSubGroups = lodash.chain(savedValue).filter(function (value)
							{
								let group =  lodash.find(_this.model.subGroups, {code: value.toString()});
								if (group != null)
									return true;
								return false;
							}).map(function(value)
							{
								return value.toString();
							}).value();
						}
					};

					_this.functions.initialize = function ()
					{
						// routine to initialize this directive
						_this.model = {
							selectedGroup: null,
							selectedSubGroups: null,
							mainGroups: [],
							subGroups: [],
							options: _this.options,
						};
						if (_this.ngModel != null)
						{
							if (_this.ngModel.group != null)
							{
								let serverModel = {code: _this.ngModel.group.toString()};
								_this.functions.getServerData(serverModel, _this.functions.initializeSubGroups)
							}
						}
						_this.functions.initializeOptions();
					};
					//</editor-fold>

					//<editor-fold desc="Group Functions">
					_this.functions.getServerData = function(serverModel, callback)
					{
						serverModel.company_id = userSvc.getOrgInfo().companyId;
						serverModel.type = "AEGF_GROUP";
						serverModel["data.status"] = 1;
						adminDataSvc.readCustomerListAudit(serverModel, 40).then(function (result)
						{
							_this.model.foundGroups = result;
							lodash.forEach(_this.model.foundGroups, function(item)
							{
								if (item.jsonData.crs_number && item.jsonData.crs_number != "")
									item.description = item.description + " (" + item.jsonData.crs_number + ")"
							});
							if (callback)
								callback();
						});
					};

					_this.functions.getGroups = function(search_term)
					{
						// routine to get the groups for the search term specified
						// this will be called by ui-select as the user types
						// if there is a nothing then the 1st 40 will be returned

						// find all records where the description starts with the search term using regex
						let serverModel = {};
						if (search_term != "")
						{
							if (search_term.toUpperCase().startsWith("LHO"))
								serverModel["data.crs_number"] = {
									"$regex": "^" + search_term.toUpperCase(),
									"$options": "i"
								};
							else
								serverModel["data.description"] = {"$regex": "^" + search_term, "$options": "i"};
						}
						_this.functions.getServerData(serverModel);
					};

					_this.functions.groupChange = function ()
					{
						// routine to invoke when the group changes
						_this.ngModel.group = null;
						if (_this.model.selectedGroup != null)
							_this.ngModel.group = parseInt(_this.model.selectedGroup.code);
						if (_this.functionManager != null && _this.functionManager.onChangeGroup)
							_this.functionManager.onChangeGroup(_this.model.selectedGroup);
						_this.functions.getSubGroups(true);

					};

					_this.functions.clear = function($event, $select)
					{
						// routine to clear the selection
						//stops click event bubbling
						if ($event != null)
							$event.stopPropagation();

						_this.model.selectedGroup = null;
						_this.functions.groupChange();
					};
					_this.functions.clearSub = function($event, $select)
					{
						// routine to clear the selection
						//stops click event bubbling
						$event.stopPropagation();
						_this.model.selectedSubGroups = null;
						_this.functions.subGroupChange(false);
					};

					//</editor-fold>

					//<editor-fold desc="Sub Group Functions">
					_this.functions.getSubGroups = function (groupChange)
					{
						//routine to refresh the sub groups based on the selected group
						_this.model.subGroups = [];
						_this.model.selectedSubGroups = _this.model.options.multiSelect ? [] : null;
						_this.functions.subGroupChange(groupChange);

						if (_this.model.selectedGroup != null && _this.model.selectedGroup.jsonData != null && _this.model.selectedGroup.jsonData.sub_groups != null)
						{
							_this.model.subGroups = lodash.filter(_this.model.selectedGroup.jsonData.sub_groups, {"status": 1});

							lodash.forEach(_this.model.subGroups, function(item)
							{
								if (item.crs_number && item.crs_number != "")
									item.description = item.description + " (" + item.crs_number + ")"
							})

						}
					};

					_this.functions.subGroupChange = function (groupChange)
					{
						if (_this.model.options.multiSelect && angular.isArray(_this.model.selectedSubGroups))
						{
							_this.ngModel.sub_groups = lodash.map(_this.model.selectedSubGroups, function(value)
							{
								return parseInt(value);
							});
						}
						else
						{
							if (_this.model.selectedSubGroups == null)
								_this.ngModel.sub_groups = null;
							else
								_this.ngModel.sub_groups = parseInt(_this.model.selectedSubGroups);
						}
						if (_this.functionManager != null && _this.functionManager.onChangeSubGroup != null)
							_this.functionManager.onChangeSubGroup(groupChange);
					};
					//</editor-fold>

					$scope.$watch("vmDirective.ngModel.group", function(newValue, oldValue)
					{
						// check for changes to the main model
						if (newValue !== undefined && newValue == null && oldValue != null)
						{
							_this.functions.clear();
						}

					}, true);
					
					_this.functions.initialize();
				}
			};
		}
	]);
});
