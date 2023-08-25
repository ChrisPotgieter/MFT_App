/*
 /// <summary>
 /// modules.admin.directives - mqaAdmWmqConnEdit.js
 /// Administration Module Directive to Manage Websphere MQ Connection Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mohammed Helly
 /// Date: 02/13/2017
/// Refactored By :Chris Potgieter
 /// Date :13/02/2023
 /// </summary>
 */
define([ 'modules/admin/module', 'lodash' ], function (module, lodash) {
	'use strict';

	module.registerDirective('mqaAdmWmqConnEdit', [
		'adminDataSvc',
		'uiSvc',
		function (adminDataSvc, uiSvc) {
			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					data: '=',
					validation: '='
				},
				controllerAs: 'vmDirective',
				templateUrl: 'app/modules/admin/directives/mqaAdmWmqConnEdit.tpl.html',
				controller: function ($element, $scope) {
					var _this = this;
					_this.functions = {};
					_this.model = { gridData: [], flags: { watched: false } };
					_this.dataModel = _this.data;

					_this.functions.setupValidator = function () {
						var serverNameTxt = {
							fields: {
								queueManager: {
									excluded: false,
									group: '#div_queueManager',
									validators: {
										notEmpty: {
											message: 'The Queue Manager Name cannot be empty'
										}
									}
								}
							}
						};
						var hostNameTxt = {
							fields: {
								host: {
									excluded: false,
									group: '#div_host',
									validators: {
										callback: {
											message: 'The Host Name cannot be empty',
											callback: function (value, validator, $field) {
												if (_this.data.binding == 1) {
													return true;
												}
												if (_this.data.hosts.length >= 1) {
													var valid = _this.data.hosts[0].host != '';
													return valid;
												}
												else {
													return false;
												}
											}
										}
									}
								}
							}
						};

						var portNameTxt = {
							fields: {
								port: {
									excluded: false,
									group: '#div_port',
									validators: {
										callback: {
											message: 'Port cannot be empty',
											callback: function (value, validator, $field) {
												if (_this.data.binding == 1) {
													return true;
												}
												if (_this.data.hosts.length >= 1) {
													var valid = _this.data.hosts[0].port != '';
													return valid;
												}
												else {
													return false;
												}
											}
										},
										numeric: {
											message: 'The port is not a number'
										}
									}
								}
							}
						};

						var channelNameTxt = {
							fields: {
								channel: {
									excluded: false,
									group: '#div_channel',
									validators: {
										callback: {
											message: 'The Channel Name cannot be empty',
											callback: function (value, validator, $field) {
												if (_this.data.binding == 1) {
													return true;
												}
												var valid = _this.data.channel != '';
												return valid;
											}
										}
									}
								}
							}
						};

						// setup bootstrap validator
						_this.fields = lodash.merge(serverNameTxt, channelNameTxt, hostNameTxt, portNameTxt);

						let formOptions = lodash.merge({}, uiSvc.getFormValidateOptions(), _this.fields);
						let form = $($element);

						let fv = form
							.bootstrapValidator(formOptions)
							.on('error.field.bv', function (e) {
								if (_this.validation.onValidation) {
									// call the validation function
									_this.validation.onValidation(false);
								}
							})
							.on('success.field.bv', function (e, data) {
								if (_this.validation.onValidation) {
									// call the validation function
									_this.validation.onValidation(true);
								}
							});
						_this.validation.bv = form.data('bootstrapValidator');
					};

					_this.functions.onBindingChange = function () {
						_this.validation.bv.resetForm();
					};

					_this.functions.initializeGrid = function () {
						// setup the grid options
						_this.model.gridDataOptions = {
							sortable: true,
							groupable: false,
							filterable: true,
							columnMenu: true,
							resizable: false,
							pageable: {
								pageSizes: true
							},
							selectable: 'row',
							dataSource: {
								data: [],
								pageSize: 10,
								sort: [ { field: 'hostName', dir: 'asc' } ],
								schema: {
									model: {
										id: 'id',
										uid: 'id',
										fields: {
											id: { type: 'string' },
											host: { type: 'string', from: 'hostName' },
											port: { type: 'number', from: 'port' }
										}
									}
								}
							},
							columns: [
								{
									field: 'id',
									title: 'Id',
									hidden: true
								},
								{
									field: 'host',
									title: 'Host Name'
								},
								{
									field: 'port',
									title: 'Port'
								}
							],
							dataBound: function (e) {
								var grid = this;
								uiSvc.dataBoundKendoGrid(grid);
							}
						};
					};

					_this.functions.initialize = function () {
						//_this.functions.initializeAdminFramework();
						_this.functions.initializeGrid();

						// setup the defaults
						if (_this.model.bindingType == null || _this.model.bindingType == undefined) {
							_this.model.bindingType = 0;
							_this.model.hosts = [];
							_this.model.channel = 'MQA.SVRCONN';
						}

						// setup the validator watch
						$scope.$watch('vmDirective.validation.watchFlag', function (newValue, oldValue) {
							//	if (!_this.validation.bv) return;
							switch (_this.validation.watchFlag.value) {
								case 1:
									// validate the form
									_this.validation.bv.validate();
									break;
								case 2:
									// revalidate the form
									_this.validation.bv.resetForm();
									_this.validation.bv.validate();
									break;
								case 3:
									// revalidate the form
									_this.functions.setupValidator();
									break;
								default:
							}
						});
					};
					//</editor-fold>
					_this.functions.initialize();
				}
			};
		}
	]);
});
