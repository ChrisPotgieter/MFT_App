/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegBillingConfigDetailCtrl.js
 /// Controller to manage Billing Configuration Detail Drill
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date:25/05/2023
 /// </summary>
 */

define([ 'modules/custom/spe_cno/module', 'lodash', 'moment' ], function (module, lodash, moment) {
	'use strict';
	moment().format();
	module.registerController('aegfBillingConfigDetailCtrl', [
		'$scope',
		'$state',
		'$stateParams',
		'$filter',
		'$timeout',
		'uiSvc',
		'speCNODataSvc',
		'cacheDataSvc',
		function ($scope, $state, $stateParams, $filter, $timeout, uiSvc, dataSvc, cacheDataSvc) {
			let _this = this;
			_this.functions = {};
			_this.model = {
				flags: { refresh: { value: 0 }, definition_rebuild: { value: 0 } },
				validators: {},
				update_cron: false
			};
			_this.functionManager = {};

			//<editor-fold desc="Function Manager">
			_this.functionManager.performCronUpdate = function (options) {
				// open the dialog that will initiate the update of the cron because a schedule has changed
				let cliOperation = {
					ui: {
						question: 'Update Report Definition',
						class: 'txt-color-teal',
						icon: 'fa fa-refresh',
						description: 'Update Report Definition'
					},
					operation: dataSvc.cliInstructionEnum.AEGF_SCHEDULE,
					class: 'txt-color-teal'
				};
				cliOperation.record = { id: _this.dataModel._id };
				if (options.cron != null && options.cron == true)
					cliOperation.record.cron = _this.dataModel.schedule.cron;
				if (options.encryption != null && options.encryption == true)
					cliOperation.record.file_write_pgp_key = _this.model.delivery.encryption.key.trim();
				cliOperation.completeFunction = function (result, instructionData, isError) {
					if (!isError)
						uiSvc.showExtraSmallPopup('Update Definition', 'Update completed successfully !', 5000);
					_this.functions.postUpdate();
				};
				dataSvc.invokeCLIOperation(cliOperation);
			};
			_this.functionManager.showColumnAdjustDialog = function () {
				// routine to show the column config dialog return a promise
				// set the dialog data
				let dialogData = { rows: _this.dataModel.columns };
				let controlOptions = {};
				controlOptions.templateUrl =
					'app/modules/custom/spe_cno/partials/aegf-billing-config-detail-column-adjust-dialog.tpl.html';
				controlOptions.controller = 'aegfBillingConfigDetailColumnAdjustDialogCtrl';
				controlOptions.controllerAs = 'vmDialog';
				controlOptions.size = 'md';

				let modalInstance = uiSvc.showSlideOutDialog(dialogData, controlOptions);
				modalInstance.result.then(
					function (result) {
						// refresh the display
						modalInstance.close();

						switch (result.action) {
							case 0:
								_this.dataModel.columns = result.data;
								_this.functions.refreshDefinition(null);
								break;
							case 1:
								// go into edit mode
								_this.functions.onDefinitionEdit(parseInt(result.data));
								break;
						}
					},
					function (err) {}
				);
			};

			_this.functionManager.showColumnAddDialog = function () {
				// routine to show the column add dialog
				dataSvc.aegf.functions.showColumnAddDialog(_this.dataModel.columns).then(function (result) {
					_this.functions.refreshDefinition(null);
				});
			};

			_this.functionManager.populateColumns = function () {
				// routine to populate the initial columns for the report
				_this.dataModel.columns = dataSvc.aegf.functions.buildInitialColumns();
				_this.functions.refreshDefinition(null);
			};

			//</editor-fold>

			//<editor-fold desc="General">
			_this.functions.postUpdate = function () {
				// routine to handle the post update logic (after the cron)
				if (_this.model.recordStatus == uiSvc.editModes.INSERT) {
					// reload the current page with the new id
					let stateParams = { id: _this.dataModel._id, group_id: _this.dataModel.group_id };
					if (_this.dataModel.sub_group_id) stateParams.sub_group_id = _this.dataModel.sub_group_id;
					$state.transitionTo($state.current, stateParams, {
						reload: $state.current.name,
						inherit: false,
						notify: true
					});
				}
				if (_this.model.recordStatus == uiSvc.editModes.UPDATE) {
					// refresh this screen
					_this.functions.initialize();
				}
			};

			_this.functions.onComboChange = function (validator, fieldName) {
				// routine to revalidate the field when a combo Changes
				_this.model.validators[validator].form.revalidateField(fieldName);
				_this.model.validators[validator].form.validate();
			};
			_this.functions.setActiveTab = function (value) {
				_this.model.activeTab = value;

				if (value == 'summary') {
					_this.functions.updateSummaryPanel();
				}
			};

			_this.functions.isAllValid = function () {
				// check all the validations
				let isValid = true;
				lodash.forOwn(_this.model.validators, function (validator) {
					validator.form.validate();
					validator.isValid = validator.form.isValid();
					if (!validator.isValid) isValid = false;
				});
				return isValid;
			};

			_this.functions.confirm = function () {
				// routine to post this record

				// check all the validations
				let isValid = _this.functions.isAllValid();
				if (!isValid) {
					uiSvc.showExtraSmallPopup(
						'Save Definition',
						'Please correct all Errors prior to Saving',
						5000,
						'#ce2029',
						'fa-times'
					);
					return;
				}

				// output
				_this.dataModel.output.type = parseInt(_this.model.output.type);

				// delivery
				_this.dataModel.delivery.type = parseInt(_this.model.delivery.type);

				// delivery encryption
				let updateEncryption = false;
				if (_this.model.delivery.encryption.enabled) {
					if (_this.model.delivery.encryption.key != null && _this.model.delivery.encryption.key != '') {
						if (_this.dataModel.delivery.encryption == null)
							_this.dataModel.delivery.encryption = { fingerprint: null };
						updateEncryption = true;
					}
				}
				// filter
				_this.dataModel.filter.days = parseInt(_this.model.filter.days.value);
				if (_this.model.filter.days.type == 0) _this.dataModel.filter.days = 0 - _this.dataModel.filter.days;

				// schedule
				let updateCron = false;
				if (!_this.dataModel.schedule) _this.dataModel.schedule = {};

				if (_this.dataModel.schedule.holidays == null) _this.dataModel.schedule.holidays = false;

				updateCron = _this.model.schedule.cron !== _this.dataModel.schedule.cron;

				// check if the holidays indicator has changed - this also means an update of the cron
				if (!updateCron) updateCron = _this.model.schedule.holidays != _this.dataModel.schedule.holidays;

				// if a new record always update the cron
				if (_this.model.recordStatus == uiSvc.editModes.INSERT) {
					updateCron = true;
					_this.functions.updateCronData();
				}

				// pay period
				_this.functions.confirmPayPeriods();

				// loop through the columns and set it all correct
				_this.dataModel.columns = lodash.map(_this.dataModel.columns, function (column) {
					if (!column.justification) column.justification = 0;
					let data = {
						identifier: column.identifier,
						hidden: column.hidden,
						justification: parseInt(column.justification),
						caption: column.caption,
						data_source: column.data_source
					};
					if (column.custom) data.custom = column.custom;
					if (column.transformations != null && column.transformations.length > 0) {
						data.transformations = lodash.map(column.transformations, function (transform) {
							return { function: transform.function.toLowerCase(), parameters: transform.parameters };
						});
					}
					return data;
				});
				if (_this.dataModel.filter != null) {
					if (_this.model.filter.status != null) {
						_this.dataModel.filter.status = lodash.map(_this.model.filter.status, function (value) {
							return parseInt(value);
						});
					}
				}

				// remove the id field if new record so that the api allocates an id
				if (_this.dataModel._id == null) delete _this.dataModel._id;

				// final update
				dataSvc.aegf.functions
					.updateConfig(_this.dataModel, _this.model.recordStatus, 'Updated')
					.then(function (result) {
						uiSvc.showExtraSmallPopup(
							'Billing Configuration',
							'Configuration has been updated successfully !',
							5000
						);
						if (_this.dataModel._id == null && result._id != null) _this.dataModel._id = result._id;
						if (updateCron || updateEncryption)
							_this.functionManager.performCronUpdate({ cron: updateCron, encryption: updateEncryption });
						else _this.functions.postUpdate();
					});
			};

			_this.functions.run = function () {
				// open the dialog that will initiate an adhoc run of the report
				let isValid = _this.functions.isAllValid();
				if (!isValid) {
					uiSvc.showExtraSmallPopup(
						'Run Now',
						'Please correct all Errors prior to Execution',
						5000,
						'#ce2029',
						'fa-times'
					);
					return;
				}
				let cliOperation = {
					ui: {
						question: 'Run the Report Now',
						class: 'txt-color-green',
						icon: 'fa fa-play',
						description: 'Ad-hoc Report Run'
					},
					operation: dataSvc.cliInstructionEnum.AEGF_ADHOC_RUN,
					class: 'txt-color-teal'
				};
				cliOperation.completeFunction = function (result, isError) {
					_this.functions.initialize();
				};

				cliOperation.record = { id: _this.dataModel._id, adhoc: 1 };
				dataSvc.confirmCLIOperation(cliOperation);
			};

			//</editor-fold>

			//<editor-fold desc="Definition Tab">

			_this.functions.validateFixedWidth = function (dataObj) {
				// now loop through the columns and ensure that non hidden columns has a length transformation
				let inValidColumns = lodash.filter(_this.dataModel.columns, function (column) {
					if (column.hidden) return false;

					// now check if the column has transformation and the last one is a length
					if (column.transformations == null || column.transformations.length == 0) return true;

					let lastTransform = column.transformations[column.transformations.length - 1];
					if (
						lastTransform.function != 'length' ||
						lastTransform.parameters.length == null ||
						parseInt(lastTransform.parameters.length <= 0)
					)
						return true;
					return false;
				});
				if (inValidColumns.length > 0) {
					let caption = '<ul>';
					let captions = lodash.map(inValidColumns, 'caption');
					lodash.forEach(captions, function (value) {
						caption += '<li>' + value + '</li>';
					});
					caption += '</ul>';
					dataObj.message =
						'<b>Fixed Length Validation:</b><br/> The following Columns must conclude with a Length Transformation Specifying Width:</br><br/>' +
						caption;
					dataObj.valid = false;
				}
				return dataObj;
			};

			_this.functions.validateDefinition = function () {
				// routine to validate if the user has selected fixed width output that all columns end in a length transformation
				let visibleColumns = lodash.filter(_this.dataModel.columns, { hidden: false });
				if (visibleColumns.length == 0) {
					return { message: 'There must be at least 1 Visible Column', valid: false };
				}

				// now check if fixed width is selected
				let outputType = parseInt(_this.model.output.type);
				let returnObj = {
					message: 'All Definition Columns must conclude with a Length Transformation Specifying the Width',
					valid: true
				};
				if (outputType == 2) returnObj = _this.functions.validateFixedWidth(returnObj);

				// check if the change option is selected
				if (returnObj.valid && _this.dataModel.filter.delta != null && _this.dataModel.filter.delta === true) {
					// check if the change indicator is visible
					let changeColumn = lodash.find(_this.dataModel.columns, { identifier: 'policy_indicator' });
					if (changeColumn != null && changeColumn.hidden) returnObj.valid = false;
					returnObj.message =
						'Change Indicator must be visible if Show Only Changes since Last Run is Enabled';
				}
				return returnObj;
			};

			_this.functions.attachDefinitionValidator = function () {
				// routine to attach the definition validator
				_this.model.validators.definition = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditDefinition';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						hiddenDefinitionValidation: {
							group: '#div_input_definition',
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									// make sure there are no existing
									callback: function (value, validator, $field) {
										return _this.functions.validateDefinition();
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.definition, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					_this.model.validators.definition.isValid = _this.model.validators.definition.form.isValid();
				});
			};

			_this.functions.onDefinitionEdit = function (cellIndex) {
				// routine to bring up the column editor for the selected cell in the definition grid
				dataSvc.aegf.functions
					.showColumnConfigDialog(_this.dataModel.columns, cellIndex)
					.then(function (result) {
						if (result.recordStatus == uiSvc.editModes.DELETE) {
							// remove the column
							const entry = { identifier: result.identifier };
							lodash.remove(_this.dataModel.columns, entry);
						}
						else {
							_this.dataModel.columns[cellIndex] = result;
						}
						_this.functions.refreshDefinition(null);
					});
			};
			_this.functions.buildDefinitionColumns = function () {
				// routine to build up the columns for the definition display based on the current definition
				// also build up the data row
				if (!_this.dataModel.columns) _this.dataModel.columns = [];
				_this.model.gridData = [];
				let columns = [];
				let row = {};
				if (_this.dataModel.columns.length == 0) {
					_this.model.gridOptions.toolbar.push({
						name: 'Populate',
						text: 'Populate Columns',
						template: kendo.template($('#templatePopulateStandard').html())
					});
					columns.push({
						field: 'identifier',
						type: 'string',
						tooltip: false,
						title: 'Please capture Columns'
					});
				}
				else {
					lodash.forEach(_this.dataModel.columns, function (field) {
						let schema_name = field.identifier.toLowerCase();
						_this.model.gridOptions.dataSource.schema.model.fields[schema_name] = { type: 'string' };
						columns.push({
							field: schema_name,
							title: field.caption,
							type: 'string',
							hidden: field.hidden
						});
						row[schema_name] = lodash.join(field.data_source, '');
					});
					_this.model.gridData.push(row);
					_this.model.gridOptions.toolbar.push({
						name: 'Column',
						text: 'Column Definitions',
						template: kendo.template($('#templateColumn').html())
					});
					_this.model.gridOptions.toolbar.push({
						name: 'Add',
						text: 'Add Definition',
						template: kendo.template($('#templateAdd').html())
					});
				}
				_this.model.gridOptions.columns = columns;
				_this.model.flags.definition_rebuild.value += 1;
				if (_this.model.validators.definition && _this.model.validators.definition.form) {
					_this.model.validators.definition.form.revalidateField('hiddenDefinitionValidation');
					_this.model.validators.definition.form.validate();
				}
			};

			_this.functions.refreshDefinition = function (timeout) {
				// routine to refresh the definitions display when the columns change or initializing
				// the idea here is to give an an approximation of what the report will look like
				if (timeout == null) timeout = 500;
				_this.model.gridOptions = {
					filterable: false,
					columnMenu: true,
					reorderable: false,
					pageable: false,
					selectable: 'cell',
					toolbar: [],
					dataSource: {
						data: _this.model.gridData,
						pageSize: 1000,
						sort: [],
						schema: {
							model: {
								id: 'identifier',
								uid: 'identifier',
								fields: {
									identifier: { type: 'string' }
								}
							}
						}
					},
					dataBound: function (e) {
						_this.functions.dataBoundDefinition(this, e);
					},
					columns: [
						{ field: 'identifier', type: 'string', tooltip: false, title: 'Please capture Columns' }
					]
				};
				$timeout(function () {
					_this.functions.buildDefinitionColumns();
				}, timeout);
			};

			_this.functions.dataBoundDefinition = function (grid, evt) {
				// routine to attach events to the cell clicks of the grid
				uiSvc.dataBoundKendoGrid(grid, null);

				// add cell clicks to the data cells to bring up the column edit dialog
				let rows = grid.table.find('tr[data-uid]');
				for (let i = 0; i < rows.length; i++) {
					let model = grid.dataItem(rows[i]);
					let row = $(rows[i]);

					// loop through the row children
					let cells = row.children();
					for (let c = 0; c < cells.length; c++) {
						let cell = cells[c];
						$(cell).dblclick(c, function (event) {
							_this.functions.onDefinitionEdit(c);
						});
					}
				}
			};

			//</editor-fold>

			//<editor-fold desc="Summary Tab">
			_this.functions.updateSummaryPanel = function () {
				//prepare date for summary display

				_this.functions.dateFormat = function (dateTime) {
					let m = moment(new Date(dateTime));
					return m.format('L');
				};

				_this.model.policyStatusValues = cacheDataSvc.getListForType('1', 'AEGF_POLICY_STATUS');

				_this.model.summary = {};

				//Filter
				_this.model.summary.policyStatus = lodash
					.map(_this.model.filter.status, function (status) {
						let record = lodash.find(_this.model.policyStatusValues, { code: status });
						if (record) {
							return record.description;
						}
						else {
							return '';
						}
					})
					.join(',');
				_this.model.summary.executionMonth = '-';
				if (_this.model.filter.days.type == 1) {
					_this.model.summary.executionMonth = '+';
				}

				_this.model.summary.aggregateAllProducts = 'No';
				if (_this.dataModel.output.aggregate) {
					_this.model.summary.aggregateAllProducts = 'Yes';
				}

				_this.model.summary.changesSinceLastRun = 'No';
				if (_this.dataModel.filter.delta) {
					_this.model.summary.changesSinceLastRun = 'Yes';
				}

				//Output

				_this.model.summary.outPutType = lodash.find(_this.model.output.options, {
					value: _this.model.output.type
				});

				_this.model.summary.excludeHeader = 'No';

				if (_this.dataModel.output.options.exclude_header) _this.model.summary.excludeHeader = 'Yes';

				_this.model.summary.outPutDelimiter = lodash.find(_this.model.output.csv.delimiterOptions, {
					value: _this.dataModel.output.options.delimiter
				});

				_this.model.summary.outPutTextDelimiter = lodash.find(_this.model.output.csv.textDelimiterOptions, {
					value: _this.dataModel.output.options.text_delimiter
				});

				//Delivery

				_this.model.summary.deliveryOption = lodash.find(_this.model.delivery.options, {
					value: _this.model.delivery.type
				});

				_this.model.summary.pauseBeforeDelivery = 'No';
				if (_this.dataModel.delivery.pause) {
					_this.model.summary.pauseBeforeDelivery = 'Yes';
				}
				_this.model.summary.emailRecipientsNotification = _this.dataModel.delivery.notifications.receipt_email.join(
					','
				);
				if (_this.model.delivery.type == 2) {
					_this.model.summary.emailRecipientsMethod = _this.dataModel.delivery.options.recipients.join(',');
				}
				//Schedulde
				_this.model.summary.batchType = lodash.find(_this.model.schedule.options, {
					value: _this.model.schedule.type.toString()
				});

				_this.model.summary.scheduledHolidays = 'No';
				if (_this.dataModel.schedule.holidays) {
					_this.model.summary.scheduledHolidays = 'Yes';
				}

                _this.model.summary.daysOfWeek = [];
				lodash
					.map(_this.model.schedule.days, function (day) {
						console.log(day);
						if (day.selected) {
							return   _this.model.summary.daysOfWeek.push(day.name)
						}
					});
                    
                    _this.model.summary.daysOfMonth = [];
                    lodash
                        .map(_this.dataModel.schedule.parameters, function (day) {

                                return   _this.model.summary.daysOfMonth.push(day)
                            
                        });
                    //
				

				//Pay Period
				if (_this.model.pay_period.grid.obj == null) {
					_this.model.summary.period = _this.model.pay_period.grid.data;
				}
				else {
					_this.model.summary.period = _this.model.pay_period.grid.obj.dataSource.data();
				}

			};
			//</editor-fold>

			//<editor-fold desc="Output Tab">
			_this.functions.attachOutputValidation = function () {
				// routine to attach the output validator
				// this is not strictly needed as there is no validation on the output level as yet
				_this.model.validators.output = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditOutput';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						input_output_type: {
							group: '#div_input_output_type',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										let data = {
											message: 'Output Type is Required',
											valid: _this.model.output.type != '-1'
										};
										return data;
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.output, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					_this.model.validators.output.isValid = _this.model.validators.output.form.isValid();
				});
			};

			_this.functions.onOutputTypeChange = function () {
				// routine to adjust the options when the type changes
				_this.dataModel.output.options = { exclude_header: false };
				if (_this.model.output.type === '0') {
					// CSV
					_this.dataModel.output.options.delimiter = ',';
					_this.dataModel.output.options.text_delimiter = '"';
				}
				if (_this.model.output.type === '3') _this.dataModel.output.options = null;

				// revalidate the columns
				_this.model.validators.definition.form.revalidateField('hiddenDefinitionValidation');
				_this.model.validators.definition.form.validate();
			};

			_this.functions.initializeOutput = function () {
				// routine to initialize the output options
				_this.model.output = { type: '-1' };
				if (_this.dataModel.output.type != null)
					_this.model.output.type = _this.dataModel.output.type.toString();
				_this.model.output.options = [
					{ value: '-1', name: 'Please select an Output Type' },
					{ value: '2', name: 'Fixed Length' },
					{ value: '0', name: 'CSV' },
					{ value: '1', name: 'Excel' },
					{ value: '3', name: 'JSON' }
				];

				// get the options for the csv
				_this.model.output.csv = {};
				_this.model.output.csv.delimiterOptions = [
					{ value: ',', name: 'Comma(,)' },
					{ value: '|', name: 'Pipe (|)' },
					{ value: '~', name: 'Tilda (|)' }
				];
				_this.model.output.csv.textDelimiterOptions = [
					{ value: '"', name: 'Double Quote(")' },
					{
						value: "'",
						name: "Single Quote (')"
					}
				];
			};
			//</editor-fold>

			//<editor-fold desc="Pay Period Tab">
			_this.functions.onPayPeriodTypeChange = function () {
				let type = parseInt(_this.model.pay_period.type);
				if (type == 24) {
					let semiPayDay = _this.dataModel.pay_period.semi_pay_day;
					if (semiPayDay == null || semiPayDay == undefined) semiPayDay = 15;
					_this.model.pay_period.semi_pay_day = semiPayDay;
				}
			};

			_this.functions.calculateAccuralPeriods = function (mainGrid) {
				// routine to calculate the accural periods when re-calculating
				let data_source = null;
				if (mainGrid) data_source = _this.model.pay_period.grid.data;
				else {
					if (_this.model.pay_period.grid.obj != null)
						data_source = _this.model.pay_period.grid.obj.dataSource.data();
					else data_source = _this.model.pay_period.grid.data;
				}
				let count = data_source.length;
				lodash.forEach(data_source, function (row, index) {
					let nextIndex = index + 1;
					if (nextIndex >= count) nextIndex = 0;

					// determine the end of current row
					let nextRow = data_source[nextIndex];
					let nextPeriod = moment()
						.set('date', parseInt(nextRow.day))
						.set('month', parseInt(nextRow.month) - 1)
						.subtract(1, 'd')
						.format('DD-MM');
					row.accural = nextPeriod;
				});
				_this.model.pay_period.grid.flags.refresh.value += 1;
			};
			_this.functions.validatePayPeriod = function () {
				// routine to validate the pay periods are valid
				let type = parseInt(_this.model.pay_period.type);
				let currentSelection = _this.model.pay_period.grid.obj.dataSource.data();
				if (currentSelection.length == 0 && _this.model.pay_period.grid.data.length == 0)
					return { message: 'There needs to be at least one Pay Period Captured', valid: false };
				return { message: '', valid: true };
			};

			_this.functions.attachPayPeriodValidation = function () {
				// routine to attach the pay period validator
				_this.model.validators.pay_period = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditPayPeriod';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						input_pay_period_type: {
							group: '#div_input_pay_period_type',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										let data = {
											message: 'Pay Type is Required',
											valid: _this.model.pay_period.type != '-1'
										};
										return data;
									}
								}
							}
						},

						hiddenPeriodValidation: {
							group: '#div_input_payperiod',
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										return _this.functions.validatePayPeriod();
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.pay_period, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					_this.model.validators.pay_period.isValid = _this.model.validators.pay_period.form.isValid();
				});
			};

			_this.functions.confirmPayPeriods = function () {
				// routine to update pay period information when the user saves the screen
				if (_this.model.pay_period.grid.obj == null) return;
				_this.dataModel.pay_period = {};

				let currentSelection = _this.model.pay_period.grid.obj.dataSource.data();
				_this.dataModel.pay_period.values = lodash
					.chain(currentSelection)
					.filter(function (obj) {
						return obj.day > 0;
					})
					.map(function (obj) {
						return {
							day: parseInt(obj.day),
							month: parseInt(obj.month),
							skip: obj.skip,
							accural: obj.accural
						};
					})
					.value();

				_this.dataModel.pay_period.type = parseInt(_this.model.pay_period.type);

				if (_this.dataModel.pay_period.type == 24)
					_this.dataModel.pay_period.semi_pay_day = parseInt(_this.model.pay_period.semi_pay_day);

				let from_date = moment(_this.model.pay_period.selectedDateRange.startDate);
				_this.dataModel.pay_period.start_day = parseInt(from_date.date());
				_this.dataModel.pay_period.start_month = parseInt(from_date.month() + 1);
				_this.dataModel.pay_period.start_date = from_date.set({
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				});

				let to_date = moment(_this.model.pay_period.selectedDateRange.endDate);
				_this.dataModel.pay_period.end_day = parseInt(to_date.date());
				_this.dataModel.pay_period.end_month = parseInt(to_date.month() + 1);
				_this.dataModel.pay_period.expire_date = to_date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
			};

			_this.functions.initializeDefaultPayPeriod = function () {
				// routine to initialize the default pay period when none has been specified
				_this.dataModel.pay_period = {};

				_this.dataModel.pay_period.start_day = 1;
				_this.dataModel.pay_period.start_month = 1;

				_this.dataModel.pay_period.end_day = 31;
				_this.dataModel.pay_period.end_month = 12;

				_this.dataModel.pay_period.type = -1; // monthly
			};

			_this.functions.getPayPeriodMonthDays = function (dataItem) {
				// routine to calculate the day source for the pay period based on its current month
				// this will be called by the kendo when the user edits
				let month = parseInt(dataItem.month);
				let days = moment().set('month', month - 1).daysInMonth();
				let data = [];
				for (let i = 0; i < days; i++) {
					let dayNum = i + 1;
					let formattedNumber = dayNum.toLocaleString('en-US', {
						minimumIntegerDigits: 2,
						useGrouping: false
					});
					data.push({ day: dayNum, desc: formattedNumber });
				}
				return data;
			};
			_this.functions.displayPeriodMonth = function (row, index) {
				return moment().month(parseInt(row.month) - 1).format('MMMM').toString();
			};

			_this.functions.displayPeriodName = function (row, index) {
				// routine to return the correct period name for display
				return 'Pay Period ' + index;
			};
			_this.functions.getPayPeriodMonths = function () {
				// routine to calculate the month source for month editor in the pay period grid
				let data = [];
				for (let i = 0; i < 12; i++) {
					let monthName = moment().month(i).format('MMMM').toString();
					data.push({ month: i + 1, desc: monthName });
				}
				return data;
			};

			_this.functions.initializePayPeriodGrid = function () {
				// routine to initialize the pay period grid
				if (_this.model.pay_period.grid != null && _this.model.pay_period.grid.obj != null) return;
				_this.model.pay_period.grid = { data: [], flags: { refresh: { value: 0 }, rebuild: { value: 0 } } };

				_this.model.pay_period.grid.months = _this.functions.getPayPeriodMonths();
				_this.model.pay_period.grid.options = {
					selectable: false,
					pageable: true,
					navigatable: true,
					reorderable: false,
					groupable: false,
					filterable: false,
					resizable: false,
					columnMenu: false,
					save: function (e) {
						_this.model.pay_period.grid.obj.saveChanges();
						$timeout(function () {
							_this.functions.calculateAccuralPeriods(false);
						}, 500);
					},
					dataSource: {
						data: _this.model.pay_period.grid.data,
						sort: [],
						pageSize: 26,
						change: function (e) {
							e.preventDefault();
						},
						schema: {
							model: {
								fields: {
									caption: { type: 'string', editable: false },
									day: { type: 'number', validation: { required: true, min: 1, max: 31 } },
									month: { type: 'number', validation: { required: true, min: 1, max: 12 } },
									skip: { type: 'boolean' },
									accural: { type: 'string' }
								}
							}
						}
					},
					columns: [
						{ field: 'identifier', type: 'string', tooltip: false, hidden: true },
						{
							field: 'caption',
							type: 'string',
							title: 'Title',
							tooltip: false,
							width: '300px'
						},
						{
							field: 'day',
							title: 'Day of Month',
							width: '120px',
							format: '{0:00}',
							editor: function (container, options) {
								let input = $('<input/>');
								input.attr('name', options.field);
								input.appendTo(container);
								input.kendoDropDownList({
									dataTextField: 'desc',
									dataValueField: 'day',
									dataSource: _this.functions.getPayPeriodMonthDays(options.model)
								});
							}
						},
						{
							field: 'month',
							title: 'Month',
							width: '120px',
							editor: function (container, options) {
								let input = $('<input/>');
								input.attr('name', options.field);
								input.appendTo(container);
								input.kendoDropDownList({
									dataTextField: 'desc',
									dataValueField: 'month',
									dataSource: _this.model.pay_period.grid.months
								});
							},
							template: function (dataItem) {
								return _this.functions.displayPeriodMonth({ month: dataItem.month }, 0);
							}
						},
						{
							field: 'skip',
							title: 'Skipped',
							width: '80px',
							filterable: false,
							template: function (dataItem) {
								if (dataItem.skip) return "<span class='badge bg-color-red txt-color-white'>Yes</span>";
								else return "<span class='badge bg-color-green txt-color-white'>No</span>";
							}
						},
						{
							field: 'accural',
							title: 'Accural',
							width: '120px'
						}
					],
					editable: true,
					dataBound: function (e) {
						let grid = this;

						uiSvc.dataBoundKendoGrid(grid, null);
					}
				};

				//OPtions used for summary page
				_this.model.pay_period_summary_grid = {
					selectable: false,
					pageable: true,
					navigatable: false,
					reorderable: false,
					groupable: false,
					filterable: false,
					resizable: false,
					columnMenu: false,

					dataSource: {
						data: [],
						sort: [],
						pageSize: 26,
						change: function (e) {
							e.preventDefault();
						},
						schema: {
							model: {
								fields: {
									caption: { type: 'string', editable: false },
									day: { type: 'number', validation: { required: true, min: 1, max: 31 } },
									month: { type: 'number', validation: { required: true, min: 1, max: 12 } },
									skip: { type: 'boolean' },
									accural: { type: 'string' }
								}
							}
						}
					},
					columns: [
						{ field: 'identifier', type: 'string', tooltip: false, hidden: true },
						{
							field: 'caption',
							type: 'string',
							title: 'Title',
							tooltip: false,
							width: '300px'
						},
						{
							field: 'day',
							title: 'Day of Month',
							width: '120px',
							format: '{0:00}',
							editable: false
						},
						{
							field: 'month',
							title: 'Month',
							width: '120px',

							template: function (dataItem) {
								return _this.functions.displayPeriodMonth({ month: dataItem.month }, 0);
							}
						},
						{
							field: 'skip',
							title: 'Skipped',
							width: '80px',
							filterable: false,
							template: function (dataItem) {
								if (dataItem.skip) return "<span class='badge bg-color-red txt-color-white'>Yes</span>";
								else return "<span class='badge bg-color-green txt-color-white'>No</span>";
							}
						},
						{
							field: 'accural',
							title: 'Accural',
							width: '120px'
						}
					],
					editable: false,
					dataBound: function (e) {
						let grid = this;

						uiSvc.dataBoundKendoGrid(grid, null);
					}
				};

				_this.model.pay_period.grid.functionManager = {};
				_this.model.pay_period.grid.functionManager.gridCreate = function (grid) {
					// once the grid is create get its reference
					_this.model.pay_period.grid.obj = grid;
				};
			};

			_this.functions.drawPayPeriodGrid = function () {
				// routine to draw the pay period grid based on the selected period option
				let currentSelected = lodash.find(_this.model.pay_period.options, function (option) {
					return option.value == _this.model.pay_period.type;
				});

				let row_count = Math.max(parseInt(currentSelected.value), _this.model.pay_period.grid.data.length);
				for (let i = 0; i < row_count; i++) {
					let row = _this.model.pay_period.grid.data[i];
					if (row == null) break;
					row.caption = _this.functions.displayPeriodName(row, i + 1);
				}
				_this.functions.calculateAccuralPeriods(true);
			};

			_this.functions.initializePayPeriod = function () {
				// routine to initialize the pay period tab
				if (_this.dataModel.pay_period == null) _this.functions.initializeDefaultPayPeriod();

				let data = _this.dataModel.pay_period;

				// setup the model
				if (_this.model.pay_period == null || _this.model.pay_period.grid == null) _this.model.pay_period = {};
				_this.model.pay_period.selectedDateRange = {};
				_this.model.pay_period.values = [];
				_this.model.pay_period.type = 0;

				// set the date selector options
				_this.model.pay_period.dateSelectorOptions = {
					timePicker: false,
					singleDatePicker: false,
					autoUpdateInput: true,
					locale: {
						clearLabel: 'Clear',
						format: 'MM/DD/YYYY',
						applyClass: 'btn-green',
						separator: '-',
						firstDay: 1
					},
					ranges: {
						'Current Year': [
							moment().startOf('year').set({ hour: 0, minute: 0, second: 0 }),
							moment().endOf('year')
						]
					}
				};

				// set the pay range
				let from_date = moment()
					.set('date', parseInt(data.start_day))
					.set('month', parseInt(data.start_month) - 1);
				_this.model.pay_period.selectedDateRange.startDate = from_date;

				let to_date = moment().set('date', parseInt(data.end_day)).set('month', parseInt(data.end_month) - 1);
				_this.model.pay_period.selectedDateRange.endDate = to_date;

				// set the type and options
				_this.model.pay_period.type = parseInt(data.type).toString();
				_this.model.pay_period.options = [
					{ value: '-1', name: 'Please select a Pay Type' },
					{ value: '12', name: 'Monthly', moment: { duration: 'month', value: 1 }, max: 12 },
					{ value: '24', name: 'Semi-Monthly', moment: { duration: 'week', value: 1 }, max: 24 },
					{ value: '52', name: 'Weekly', moment: { duration: 'week', value: 1 } },
					{ value: '26', name: 'Bi-Weekly', moment: { duration: 'week', value: 2 } }
				];
				_this.functions.onPayPeriodTypeChange();

				// set the grid
				_this.functions.initializePayPeriodGrid();
				if (data.values == null) data.values = _this.functions.onPayPeriodCalculate(false);
				_this.model.pay_period.grid.data = data.values;

				// draw the grid
				_this.functions.drawPayPeriodGrid();
				_this.model.pay_period.grid.flags.rebuild.value += 1;
			};

			_this.functions.calculatePeriodMax = function (selected, todate) {
				// routine to calculate the period max for weekly and by-weekly payments based on the year
				let weeks_current = moment(todate).isoWeeksInYear();
				if (selected.value == '52') return weeks_current;
				if (selected.value == '26') return Math.round(weeks_current / 2);
			};

			_this.functions.getPayValues = function (fromDate, toDate, selected) {
				// routine to work out the pay period defaults when the user changes the option and opts to
				let values = [];
				let current_date = moment(fromDate);
				let index = 0;
				let first_day = parseInt(current_date.day()) + 1;
				let max = selected.max;
				if (max == null) max = _this.functions.calculatePeriodMax(selected, toDate);
				while (current_date.isBefore(toDate)) {
					index++;

					// check we we have reached the max periods
					if (index > max) break;

					// calculate the date
					let calc_date = current_date.clone();

					// add the date into the correct month
					let row = {
						day: parseInt(calc_date.format('DD')),
						month: parseInt(calc_date.format('MM')),
						skip: false
					};
					values.push(row);

					// now determine the next date
					current_date = current_date.add(selected.moment.duration, parseInt(selected.moment.value));

					// semi month set the days manually depending on the index
					if (parseInt(selected.value) == 24) {
						if (index % 2 != 0)
							current_date = current_date.set('date', parseInt(_this.model.pay_period.semi_pay_day));
						else current_date.add('month', 1).set('date', first_day);
					}
				}
				return values;
			};

			_this.functions.onPayPeriodCalculate = function (set) {
				// routine to calculate the pay periods based on the pay period selected date Range
				let currentSelected = lodash.find(_this.model.pay_period.options, function (option) {
					return option.value == _this.model.pay_period.type;
				});

				let values = [];
				if (currentSelected.value != '-1')
					values = _this.functions.getPayValues(
						_this.model.pay_period.selectedDateRange.startDate,
						_this.model.pay_period.selectedDateRange.endDate,
						currentSelected
					);
				if (set) {
					_this.model.pay_period.grid.data = values;
					_this.functions.drawPayPeriodGrid();

					_this.model.validators.pay_period.form.revalidateField('hiddenPeriodValidation');
					_this.model.validators.pay_period.form.validate();
				}
				return values;
			};
			//</editor-fold>

			//<editor-fold desc="Schedule Tab">
			_this.functions.updateCronData = function () {
				// routine to update the cron data
				let type = parseInt(_this.model.schedule.type);
				_this.dataModel.schedule.type = type;

				let date = moment(_this.model.schedule.date);
				_this.dataModel.schedule.base_time = { hour: date.hour(), minute: date.minute() };

				let cron = `${_this.dataModel.schedule.base_time.minute} ${_this.dataModel.schedule.base_time.hour}`;

				// now figure out the day list
				if (_this.dataModel.schedule.type == 3) {
					cron += ' ' + lodash.join(_this.dataModel.schedule.parameters.days, ',') + ' * *';
				}
				if (_this.dataModel.schedule.type == 1 || _this.dataModel.schedule.type == 2)
					cron += ' * * ' + lodash.join(_this.dataModel.schedule.parameters.week, ',');
				if (_this.dataModel.schedule.type == 0) {
					let startDay = 28 - parseInt(_this.dataModel.schedule.parameters.month);
					let endDay = 31 - parseInt(_this.dataModel.schedule.parameters.month);
					cron += ' ' + startDay.toString() + '-' + endDay.toString() + ' * *';
				}
				_this.dataModel.schedule.cron = cron;
			};
			_this.functions.calculateCron = function () {
				// routine to calculate the cron value based on the current schedule
				if (_this.model.validators.schedule && _this.model.validators.schedule.form) {
					_this.model.validators.schedule.form.revalidateField('hiddenScheduleValidation');
					_this.model.validators.schedule.form.validate();
					if (!_this.model.validators.schedule.isValid) return;
				}
				_this.functions.updateCronData();
			};

			_this.functions.validateSchedule = function () {
				// routine to validate the schedule is valid
				let type = parseInt(_this.model.schedule.type);
				if (
					(type == 1 || type == 2) &&
					(_this.dataModel.schedule.parameters.week == null ||
						_this.dataModel.schedule.parameters.week.length == 0)
				)
					return { message: 'There needs to be at least one Week-Day Selected ', valid: false };
				if (
					type == 3 &&
					(_this.dataModel.schedule.parameters.days == null ||
						_this.dataModel.schedule.parameters.days.length == 0)
				)
					return { message: 'There needs to be at least one Day of the Month Entered ', valid: false };
				if (type == 0) {
					if (_this.dataModel.schedule.parameters.month == null)
						return { message: 'Month-End minus must be not be Empty', valid: false };
					try {
						let value = parseInt(_this.dataModel.schedule.parameters.month);
						if (value < 0 || value > 60)
							return {
								message: 'Month-End minus must be not be less than 0 and less than 61',
								valid: false
							};
					} catch (e) {
						return { message: 'Month-End minus must be numeric', valid: false };
					}
				}
				return { message: '', valid: true };
			};

			_this.functions.attachScheduleValidation = function () {
				// routine to attach the output validator
				// this is not strictly needed as there is no validation on the output level as yet
				_this.model.validators.schedule = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditSchedule';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						input_schedule_type: {
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										let data = {
											message: 'Schedule Execution is Required',
											valid: _this.model.schedule.type != '-1'
										};
										return data;
									}
								}
							}
						},

						hiddenScheduleValidation: {
							group: '#div_input_schedule',
							excluded: false,
							feedbackIcons: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										return _this.functions.validateSchedule();
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.schedule, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					let currentValue = _this.model.validators.schedule.isValid;
					_this.model.validators.schedule.isValid = _this.model.validators.schedule.form.isValid();

					// check if the cron was not updated because of timing
					if (!currentValue && _this.model.validators.schedule.isValid) _this.functions.updateCronData();
				});
			};

			_this.functions.calcScheduleWeekly = function () {
				// routine to work out the schedule days when the user changes the option
				_this.model.schedule.days = [];
				let noDays = _this.dataModel.schedule.holidays ? 5 : 7;
				let currentDate = moment();
				let override = false;
				if (_this.dataModel.schedule.parameters.week == null) {
					_this.dataModel.schedule.parameters.week = [];
					override = true;
				}

				for (let i = 0; i < noDays; i++) {
					// set the day
					let day = { selected: false };
					currentDate.day(i + 1);
					day.name = currentDate.format('dddd');
					day.num = i + 1;

					// see if the day is selected
					let isActive = lodash.find(_this.dataModel.schedule.parameters.week, function (day) {
						return day == i + 1;
					});
					if (isActive == null && override) {
						// based on the selection change the selected
						if (_this.model.schedule.type == '1') day.selected = true;
						else {
							// every other day
							day.selected = i % 2 == 0;
						}
						if (day.selected) _this.dataModel.schedule.parameters.week.push(i + 1);
					}
					if (isActive != null) day.selected = true;

					_this.model.schedule.days.push(day);
				}
			};

			_this.functions.onScheduleTypeChange = function (clearInd) {
				// routine to adjust the options when the type changes
				if (clearInd > 0) _this.dataModel.schedule.parameters = {};
				// revalidate the screen
				//_this.model.validators.schedule.form.revalidateField("hiddenScheduleValidation");

				// determine the days if the type changes to weekly or daily
				if (
					_this.model.schedule.type == '2' &&
					clearInd == 1 // set exclude holidays to true
				)
					_this.dataModel.schedule.holidays = true;

				if (_this.model.schedule.type == '1' || _this.model.schedule.type == '2') {
					_this.functions.calcScheduleWeekly();
				}
				if (_this.model.schedule.type == '0' && _this.dataModel.schedule.parameters.month == null)
					_this.dataModel.schedule.parameters.month = 0;

				if (_this.model.schedule.type == '3') {
					// setup the grid data
					if (_this.dataModel.schedule.parameters.days == null) _this.dataModel.schedule.parameters.days = [];

					_this.model.schedule.grid.data = lodash.map(_this.dataModel.schedule.parameters.days, function (
						day,
						index
					) {
						return { day: day, time: _this.model.schedule.time };
					});
					_this.model.schedule.grid.flags.refresh.value += 1;
				}
				_this.functions.calculateCron();
			};

			_this.functions.onScheduleTimeChange = function () {
				let value = $scope.timepicker.value();
				_this.model.schedule.date = value;
				_this.functions.calculateCron();
			};

			_this.functions.onScheduleScheduleWeekChange = function () {
				// routine to be invoked when the user has changed a week day selection
				_this.dataModel.schedule.parameters.week = lodash
					.chain(_this.model.schedule.days)
					.filter({ selected: true })
					.map(function (day) {
						return day.num;
					})
					.value();
				_this.functions.calculateCron();
			};

			_this.functions.onScheduleChangeHoliday = function (value) {
				// if the skip is changed only if the type is weekly in some way do we need to do anything
				_this.dataModel.schedule.holidays = value;
				if (_this.model.schedule.type == '1' || _this.model.schedule.type == '2')
					_this.functions.onScheduleTypeChange(2);
			};

			_this.functions.onScheduleUpdateDays = function () {
				// routine to update the days when the user changes the grid
				if (_this.model.schedule.grid.obj == null) return;
				let currentSelection = _this.model.schedule.grid.obj.dataSource.data();
				_this.dataModel.schedule.parameters.days = lodash
					.chain(currentSelection)
					.filter(function (obj) {
						return obj.day > 0;
					})
					.map(function (obj) {
						return obj.day;
					})
					.value();
				_this.functions.calculateCron();
			};

			_this.functions.initializeScheduleGrid = function () {
				// routine to initialize the schedule grid for days of the month
				if (_this.model.schedule.grid != null && _this.model.schedule.grid.obj != null) return;

				_this.model.schedule.grid.functionManager = {};
				_this.model.schedule.grid.functionManager.gridCreate = function (grid) {
					// once the grid is create get its reference
					_this.model.schedule.grid.obj = grid;

					// update the add button to add the row to the end
					$('.k-grid-my-create', grid.element).on('click', function (e) {
						e.preventDefault();
						let dataSource = grid.dataSource;
						let total = dataSource.data().length;
						dataSource.insert(total, {});
						dataSource.page(dataSource.totalPages());
						grid.editRow(grid.tbody.children().last());
					});
				};

				_this.model.schedule.grid.options = {
					pageable: false,
					selectable: false,
					navigatable: true,
					height: 550,
					toolbar: [
						{
							name: 'my-create',
							text: 'Add Entry',
							iconClass: 'k-icon k-i-add'
						}
					],
					dataSource: {
						data: _this.model.schedule.grid.data,
						pageSize: 1000,
						sort: [],
						change: function (e) {
							e.preventDefault();
							_this.functions.onScheduleUpdateDays();
						},
						schema: {
							model: {
								fields: {
									day: { type: 'number', validation: { required: true, min: 1, max: 31 } }
								}
							}
						}
					},
					columns: [
						{ field: 'identifier', type: 'string', tooltip: false, hidden: true },
						{
							field: 'day',
							title: 'Day of Month',
							width: '120px',
							format: '{0:00}',
							editor: function (container, options) {
								let input = $('<input/>');
								input.attr('name', options.field);
								input.appendTo(container);
								input.kendoDropDownList({
									dataTextField: 'desc',
									dataValueField: 'day',
									dataSource: _this.functions.getScheduleMonthDays()
								});
							}
						},
						{ command: 'destroy', title: '&nbsp;', width: 150, iconClass: 'k-icon k-i-copy' }
					],
					editable: true,
					dataBound: function (e) {
						let grid = this;

						uiSvc.dataBoundKendoGrid(grid, null);
					}
				};
			};

			_this.functions.getScheduleMonthDays = function () {
				// routine to calculate the day source for the schedule days of the month option
				// this will be called by the kendo when the user edits
				let currentSelection = _this.model.schedule.grid.obj.dataSource.data();
				let data = [];
				for (let i = 0; i < 31; i++) {
					let dayNum = i + 1;
					let formattedNumber = dayNum.toLocaleString('en-US', {
						minimumIntegerDigits: 2,
						useGrouping: false
					});
					let isEntered = lodash.find(currentSelection, { day: dayNum });
					if (!isEntered) data.push({ day: dayNum, desc: formattedNumber });
				}
				return data;
			};

			_this.functions.initializeSchedule = function () {
				// routine to initialize the schedule options
				_this.model.schedule = {};
				_this.model.schedule.options = [
					{ value: '-1', name: 'Please select the Schedule Execution Type' },
					{ value: '0', name: 'Monthly' },
					{ value: '1', name: 'Daily' },
					{ value: '2', name: 'Every other Weekday' },
					{ value: '3', name: 'Specific Days of Month' }
				];

				// check the base inputs
				if (
					_this.dataModel.schedule.type == null ||
					_this.dataModel.schedule.type < 0 ||
					_this.dataModel.schedule.type > 3
				)
					_this.dataModel.schedule.type = -1;

				// work out the base time
				if (_this.dataModel.schedule.base_time == null)
					_this.dataModel.schedule.base_time = { hour: 2, minute: 0 }; // 2 AM

				_this.model.schedule.cron = _this.dataModel.schedule.cron;
				_this.model.schedule.holidays = false;
				if (_this.dataModel.schedule.holidays != null)
					_this.model.schedule.holidays = _this.dataModel.schedule.holidays;

				// determine the time display value
				_this.model.schedule.date = moment().set({
					hour: _this.dataModel.schedule.base_time.hour,
					minute: _this.dataModel.schedule.base_time.minute
				});
				_this.model.schedule.time = _this.model.schedule.date.format('hh:mm A');

				_this.model.schedule.type = _this.dataModel.schedule.type.toString();

				_this.model.schedule.grid = { data: [] };
				_this.model.schedule.grid.flags = { refresh: { value: 0 }, rebuild: { value: 0 } };

				if (_this.dataModel.schedule.parameters == null) _this.dataModel.schedule.parameters = {};

				// setup the screen
				_this.functions.onScheduleTypeChange(0);
				_this.functions.initializeScheduleGrid();
			};
			//</editor-fold>

			//<editor-fold desc="Delivery Tab">

			_this.functions.validateDeliveryNotification = function (message, modelValue, field) {
				// custom validation function invoked by BV when any field in the delivery notification changes to ensure
				// that if one of the fields are completed all must be completed
				let fields = [ 'input_notify_subject', 'input_notify_message', 'input_notify_email' ];
				let returnObj = { message: message, valid: false };
				if (
					modelValue == null ||
					(angular.isArray(modelValue) && modelValue.length == 0) ||
					(!angular.isArray(modelValue) && modelValue === '')
				) {
					// check if all the notification fields are completed
					if (
						(_this.dataModel.delivery.notifications.receipt_email == null ||
							_this.dataModel.delivery.notifications.receipt_email.length == 0) &&
						field == fields[2]
					)
						return returnObj;
					if (
						(_this.dataModel.delivery.notifications.subject == null ||
							_this.dataModel.delivery.notifications.subject == '') &&
						field == fields[0]
					)
						return returnObj;
					if (
						(_this.dataModel.delivery.notifications.message == null ||
							_this.dataModel.delivery.notifications.message == '') &&
						field == fields[1]
					)
						return returnObj;

					// reset the fields as everything is now valid
					lodash.forEach(fields, function (fieldname) {
						if (fieldname === field) return;
						_this.model.validators.delivery.form.resetField(fieldname);
					});
				}
				returnObj.valid = true;
				return returnObj;
			};
			_this.functions.attachDeliveryValidation = function () {
				// routine to attach the delivery validation
				_this.model.validators.delivery = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditDelivery';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						input_delivery_type: {
							group: '#div_input_delivery_type',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										let data = {
											message: 'Delivery Type is Required',
											valid: _this.model.delivery.type != '-1'
										};
										return data;
									}
								}
							}
						},

						input_notify_email: {
							group: '#div_input_notify_email',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										return _this.functions.validateDeliveryNotification(
											'At Least One Notification Email is Required',
											_this.dataModel.delivery.notifications.receipt_email,
											$field[0].id
										);
									}
								}
							}
						},
						input_notify_subject: {
							group: '#div_input_notify_subject',
							excluded: false,
							validators: {
								callback: {
									// make sure that the email is valid and there is at least 1 email
									callback: function (value, validator, $field) {
										return _this.functions.validateDeliveryNotification(
											'A Notification Subject is Required',
											value,
											$field[0].id
										);
									}
								}
							}
						},
						input_notify_message: {
							group: '#div_input_notify_message',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										return _this.functions.validateDeliveryNotification(
											'A Notification Message is Required',
											value,
											$field[0].id
										);
									}
								}
							}
						},
						input_email_address: {
							group: '#div_input_email_address',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										if (
											_this.dataModel.delivery.options.recipients == null ||
											_this.dataModel.delivery.options.recipients.length == 0
										) {
											return {
												message: 'At least one Delivery Recipient is required',
												valid: false
											};
										}
										return { message: '', valid: true };
									}
								}
							}
						},

						input_email_subject: {
							group: '#div_input_email_subject',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Delivery Subject is Required'
								}
							}
						},

						input_email_message: {
							group: '#div_input_email_message',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Delivery Message is Required'
								}
							}
						},

						input_ftp_server: {
							group: '#div_input_ftp_server',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Server Host or IP is Required'
								}
							}
						},
						input_ftp_port: {
							group: '#div_input_ftp_port',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Server Port is Required'
								},
								integer: {
									message: 'Server Port should be a numeric'
								}
							}
						},
						input_ftp_login: {
							group: '#div_input_ftp_login',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Server Login is Required'
								},
								regexp: {
									regexp: '^[a-zA-Z0-9_]{3,}$',
									message:
										'Server Login must contain no spaces or special characters and must be a minimum of 3'
								}
							}
						},
						input_ftp_password: {
							group: '#div_input_ftp_password',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Server Login Password is Required'
								}
							}
						},
						input_ftp_path: {
							group: '#div_input_ftp_path',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'Destination Path is Required'
								}
							}
						},
						input_ftp_file: {
							group: '#div_input_ftp_file',
							excluded: true,
							validators: {
								notEmpty: {
									message: 'Destination File is Required'
								}
							}
						},
						input_api_url: {
							group: '#div_input_api_url',
							excluded: false,
							validators: {
								notEmpty: {
									message: 'API HTTP Post URL is Required'
								}
							}
						},
						input_api_login: {
							group: '#div_input_api_login',
							excluded: false,
							validators: {
								regexp: {
									regexp: '^[a-zA-Z0-9_]{3,}$',
									message:
										'API Auth Login must contain no spaces or special characters and must be a minimum of 3'
								}
							}
						},
						input_api_password: {
							group: '#div_input_api_password',
							excluded: false,
							validators: {
								callback: {
									callback: function (value, validator, $field) {
										if (_this.dataModel.delivery.options.user != null && (!value || value == '')) {
											return { message: 'API Password is Required', valid: false };
										}
										return { message: '', valid: true };
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.delivery, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					_this.model.validators.delivery.isValid = _this.model.validators.delivery.form.isValid();
				});
				_this.functions.onDeliveryChange(false);
			};

			_this.functions.onDeliveryChange = function (clearOptions) {
				// routine to adjust the options when the type changes
				if (clearOptions) _this.dataModel.delivery.options = {};

				// enable the correct field validators based on the current delivery type
				let enable_fields = [];
				let disable_fields = [];
				switch (parseInt(_this.model.delivery.type)) {
					case 0:
						// FTP
						enable_fields = _this.model.delivery.ftp;
						disable_fields = lodash.concat(_this.model.delivery.api, _this.model.delivery.email);
						if (_this.dataModel.delivery.options.port == null) _this.dataModel.delivery.options.port = 22;
						break;
					case 1:
						// API
						enable_fields = _this.model.delivery.api;
						disable_fields = lodash.concat(_this.model.delivery.ftp, _this.model.delivery.email);
						break;
					case 2:
						// EMAIL
						enable_fields = _this.model.delivery.email;
						disable_fields = lodash.concat(_this.model.delivery.ftp, _this.model.delivery.api);
				}
				lodash.forEach(enable_fields, function (fieldname) {
					_this.model.validators.delivery.form.enableFieldValidators(fieldname, true);
				});
				lodash.forEach(disable_fields, function (fieldname) {
					_this.model.validators.delivery.form.enableFieldValidators(fieldname, false);
				});
				_this.model.validators.delivery.isValid = false;
			};

			_this.functions.onDeliveryEncryptionToggle = function (toggle) {
				_this.model.delivery.encryption.enabled = toggle;
			};
			_this.functions.onDeliveryAcceptEncryptionKey = function () {
				// routine to accept the delivery key
				if (_this.model.delivery.encryption.key != '') {
					_this.model.delivery.encryption.fingerprint = 'Awaiting Definition Update...';
					_this.functions.onDeliveryEncryptionKeyToggle(false);
				}
			};
			_this.functions.onDeliveryEncryptionKeyToggle = function (value) {
				_this.model.delivery.encryption.showKey = value;
			};

			_this.functions.initializeDelivery = function () {
				// routine to initialize the delivery tab
				_this.model.delivery = {};
				_this.model.delivery.options = [
					{ value: '-1', name: 'Please select a Delivery Type' },
					{ value: '0', name: 'SFTP' },
					{ value: '1', name: 'HTTP Post' },
					{ value: '2', name: 'Email' }
				];

				// setup the field groups
				_this.model.delivery.ftp = [
					'input_ftp_server',
					'input_ftp_port',
					'input_ftp_login',
					'input_ftp_password',
					'input_ftp_path',
					'input_ftp_file'
				];
				_this.model.delivery.api = [ 'input_api_url', 'input_api_login', 'input_api_password' ];
				_this.model.delivery.email = [ 'input_email_address', 'input_email_subject', 'input_email_message' ];

				if (!_this.dataModel.delivery) _this.dataModel.delivery = {};

				if (_this.dataModel.delivery.type == null) _this.dataModel.delivery.type = -1;
				if (_this.dataModel.delivery.pause == null) _this.dataModel.delivery.pause = false;
				_this.model.delivery.type = _this.dataModel.delivery.type.toString();

				// update the encryption details
				_this.model.delivery.encryption = { enabled: false, show_key: false };
				if (_this.dataModel.delivery && _this.dataModel.delivery.encryption != null) {
					_this.model.delivery.encryption.enabled = true;
					_this.model.delivery.encryption.fingerprint = _this.dataModel.delivery.encryption.fingerprint;
				}
			};
			//</editor-fold>

			//<editor-fold desc="Filter Tab">

			_this.functions.onDeltaToggle = function (percOn) {
				// routine to re-validate the columns when the delta toggle is switched
				_this.dataModel.filter.delta = percOn;
				_this.model.validators.definition.form.revalidateField('hiddenDefinitionValidation');
				_this.model.validators.definition.form.validate();
			};

			_this.functions.onSelectFilterDaysButton = function (button) {
				_this.model.filter.days.buttonCaption = button.caption;
				_this.model.filter.days.type = parseInt(button.value);
			};
			_this.functions.initializeFilter = function () {
				// routine to initialize the filter tab and set the model variables accordingly
				_this.model.filter = {};

				// determine the correct selection based on the sign of the value
				if (!_this.dataModel.filter.days) _this.dataModel.filter.days = 0;

				_this.model.filter.days = {};
				_this.model.filter.days.value = Math.abs(_this.dataModel.filter.days);
				_this.model.filter.days.type = _this.dataModel.filter.days < 0 ? 0 : 1;

				_this.model.filter.days.buttons = [];
				_this.model.filter.days.buttons.push({ caption: 'Add', value: '1' });
				_this.model.filter.days.buttons.push({ caption: 'Subtract', value: '0' });

				if (_this.dataModel.filter.delta == null) _this.dataModel.filter.delta = false;

				_this.model.filter.status = [];
				if (_this.dataModel.filter.status) {
					_this.model.filter.status = lodash.map(_this.dataModel.filter.status, function (value) {
						return value.toString();
					});
				}
			};
			_this.functions.attachFilterValidation = function () {
				// routine to attach the filter validation
				_this.model.validators.filter = {};
				let stateInfo = {};
				stateInfo.elementId = 'frmConfigEditFilter';
				stateInfo.icons = false;
				stateInfo.fields = {
					fields: {
						input_policy_status: {
							group: '#div_input_policy_status',
							excluded: false,
							validators: {
								callback: {
									// make sure that the email is valid and there is at least 1 email
									callback: function (value, validator, $field) {
										if (_this.model.filter.status && _this.model.filter.status.length == 0)
											return { message: 'At Least One Policy Status is Required', valid: false };
										return { message: '', valid: true };
									}
								}
							}
						}
					}
				};
				uiSvc.attachValidator(_this.model.validators.filter, stateInfo, function (isError, e, data) {
					// check if the form is valid on a field change
					_this.model.validators.filter.isValid = _this.model.validators.filter.form.isValid();
				});
			};

			//</editor-fold>

			//<editor-fold desc="Initialization">
			_this.functions.initializeTabs = function () {
				// routine to initialize the screen when first coming into the screen
				_this.model.tabs = [
					{ id: 'summary', caption: 'Summary', hasValidator: false },
					{ id: 'definition', caption: 'Definition', hasValidator: true },
					{ id: 'filter', caption: 'Filtering', hasValidator: true },
					{ id: 'output', caption: 'Output', hasValidator: true },
					{ id: 'delivery', caption: 'Delivery', hasValidator: true },
					{ id: 'schedule', caption: 'Schedule', hasValidator: true },
					{ id: 'pay_period', caption: 'Pay Periods', hasValidator: true }
				];

				_this.functions.initializeHeader();
				_this.functions.refreshDefinition(2000);
				_this.functions.initializeOutput();
				_this.functions.initializeDelivery();
				_this.functions.initializeFilter();
				_this.functions.initializeSchedule();
				_this.functions.initializePayPeriod();

				if (_this.model.activeTab == null) _this.functions.setActiveTab('summary');
			};
			_this.functions.initializeValidators = function () {
				// routine to initialize the validators for the form
				_this.functions.attachDefinitionValidator();
				_this.functions.attachFilterValidation();
				_this.functions.attachDeliveryValidation();
				_this.functions.attachOutputValidation();
				_this.functions.attachScheduleValidation();
				_this.functions.attachPayPeriodValidation();

				// now loop through the validators and validate
				lodash.forOwn(_this.model.validators, function (validator) {
					validator.form.validate();
					validator.isValid = validator.form.isValid();
				});
			};
			_this.functions.initializeHeader = function () {
				// routine to setup the header for this configuration
				_this.model.status = {
					groupName: '',
					id: _this.model.id,
					group_id: _this.dataModel.group_id,
					sub_group: _this.dataModel.sub_group_id,
					desc: null
				};
				if (_this.model.recordStatus == uiSvc.editModes.INSERT) {
					_this.model.status.supplemental = 'New Definition';
					if (_this.model.copy_id != null)
						_this.model.status.supplemental =
							'New Definition Copied from Definition ' + _this.model.copy_id;
					_this.model.status.icon = 'asterisk';
					_this.model.status.id = '<New Identifier>';
					_this.model.status.return_code = -1;
				}
				else {
					_this.model.status.id = _this.model.id;
					_this.model.status.supplemental = 'Not Yet Executed';
					_this.model.status.return_code = 1;
				}
				if (_this.dataModel.last_execution != null) {
					_this.model.status.last_run = uiSvc.formatDate(_this.dataModel.last_execution.date);
					if (_this.dataModel.last_execution.next_date != null)
						_this.model.status.next_run = uiSvc.formatDate(_this.dataModel.last_execution.next_date);
					_this.model.status.return_code = _this.dataModel.last_execution.status;
					_this.model.status.supplemental = _this.dataModel.last_execution.supplemental;
					_this.model.status.desc = dataSvc.aegf.functions.getModuleStatus(_this.model.status.return_code);
				}

				let descs = dataSvc.aegf.functions.getGroupDescriptions(
					_this.model.status.group_id,
					_this.model.status.sub_group
				);
				_this.model.status.names = { group: descs.groupDesc };
				_this.model.status.groupName = _this.model.status.names.group;
				if (descs.group_code != null) {
					_this.model.status.groupName += ' (' + descs.group_code + ')';
					_this.model.status.group_code = descs.group_code;
				}
				if (_this.dataModel.sub_group_id) {
					_this.model.status.groupName += ' - Sub-Group: ' + descs.subGroup;
					_this.model.status.names.sub_group = descs.subGroup;
				}
				_this.model.status.icon = $filter('bootStrapStatusIconFilter')(
					dataSvc.aegf.functions.getBootStrapStatus(_this.model.status.return_code)
				);
				_this.model.status.alertClass =
					'alert-' +
					$filter('bootStrapStatusFilter')(
						dataSvc.aegf.functions.getBootStrapStatus(_this.model.status.return_code)
					);
			};

			_this.functions.initialize = function () {
				// routine to initialize the screen
				_this.model.id = $stateParams.id;
				_this.model.copy_id = null;
				if (_this.model.id == -1) {
					_this.model.recordStatus = uiSvc.editModes.INSERT;

					// check if we have a record to copy
					if ($stateParams.copy_id != null && $stateParams.copy_id === '') $stateParams.copy_id = null;
					if ($stateParams.copy_id != null) {
						// initialize the screen and prepare for editing
						dataSvc.aegf.functions
							.readConfig($stateParams.copy_id)
							.then(function (result) {
								_this.model.copy_id = $stateParams.copy_id;
								_this.dataModel = dataSvc.aegf.functions.copyRecord(
									result,
									$stateParams.group_id,
									$stateParams.sub_group_id
								);
								_this.functions.initializeTabs();
							})
							.catch(function (err) {});
					}
					else {
						_this.dataModel = dataSvc.aegf.functions.initializeRecord(
							$stateParams.group_id,
							$stateParams.sub_group_id
						);
						_this.functions.initializeTabs();
					}
				}
				else {
					// initialize the screen and prepare for editing
					dataSvc.aegf.functions
						.readConfig(_this.model.id)
						.then(function (result) {
							_this.dataModel = result;
							_this.model.recordStatus = uiSvc.editModes.UPDATE;
							_this.functions.initializeTabs();
						})
						.catch(function (err) {});
				}

				$timeout(function () {
					_this.functions.initializeValidators();
				}, 2000);
			};
			//</editor-fold>

			_this.functions.initialize();
		}
	]);
});
