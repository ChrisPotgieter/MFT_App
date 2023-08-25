/*
 /// <summary>
 /// app.modules.common.controllers - commonDateSchedulerDayDialog
 /// Common Dialog for mqaDateScheduler directive
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date: 06/07/2020
 /// </summary>
 */
define([ 'modules/common/module', 'moment', 'moment-holiday' ], function (module, moment, momentHoliday) {
	moment().format();

	('use strict');

	module.registerController('commonDateSchedulerDayDialog', [
		'$uibModalInstance',
		'cacheDataSvc',
		'dialogData',
		'uiSvc',
		'$scope',
		'adminDataSvc',
		'$timeout',
		'userSvc',

		function ($uibModalInstance, cacheDataSvc, dialogData, uiSvc, $scope, adminDataSvc, $timeout, userSvc) {
			var _this = this;
			_this.functions = {};
			_this.model = { flags: { refresh: { value: 0 } } };

			_this.dialogData = dialogData;
			_this.dataModel = dialogData.row;
			_this.stateInfo = {};
			_this.stateInfo.elementId = 'frmDateScheduler';

			_this.stateInfo.fields = {
				fields: {
					hiddenValidation: {
						excluded: false,
						feedbackIcons: false,
						validators: {}
					}
				}
			};

			const weekday = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
			//Skip weekends and publicholiday
			_this.functions.skipWeekendsAndHolidays = function (date) {
				let day = date.getDay();
				let updatedDate = date;

				//run function if skiday checkbox true
				if (_this.dataModel.skipDay) {


					//Check if date on a weekend
					if (day === 6) {
						updatedDate.setDate(updatedDate.getDate() - 1);
					}
					else if (day === 0) {
						updatedDate.setDate(updatedDate.getDate() - 2);
					}
					//Check if date is a public holiday
					if (moment(date).isHoliday()) {
						updatedDate.setDate(updatedDate.getDate() - 1);
					}
					return updatedDate;
				}
				else {
					return date;
				} /**/
			};

			//date gets selected
			//array of 7 days gets added
			_this.functions.addDaily = function (date, time) {
				let i = 1;
				while (i < 8) {
					var result = new Date(date);
					result.setDate(result.getDate() + i);

					let newRecord = {
						code: result,
						day: i,
						batchType: _this.dataModel.batchType,
						rowId: i,
						recordStatus: uiSvc.editModes.INSERT,
						date: _this.functions.skipWeekendsAndHolidays(result),
						time: time
					};
					_this.dialogData.rows.push(newRecord);
					i++;
				}
			};

			//popuplate every second day for seven days
			_this.functions.addEverySecondDay = function (date, time) {
				let i = 1;
				while (i < 16) {
					var result = new Date(date);
					result.setDate(result.getDate() + i);

					let newRecord = {
						code: result,
						day: i,
						batchType: _this.dataModel.batchType,
						rowId: i,
						recordStatus: uiSvc.editModes.INSERT,
						date: _this.functions.skipWeekendsAndHolidays(result),
						time: time
					};
					if (Number.isInteger(i / 2)) {
						_this.dialogData.rows.push(newRecord);
					}
					i++;
				}
			};

			//add every month day minus selcted days
			_this.functions.addEndOfMonths = function (date, time) {
				let month = date.getMonth();
				let year = date.getFullYear();

				let i = 0;
				while (i < 12) {
					let lastDayOfMonth = new Date(year, month + 1, 0).getDate();
					console.log(lastDayOfMonth);
					let newDate = new Date(year, month, lastDayOfMonth - _this.model.monthEndDays);
					month++;
					if (month === 11) {
						month = 0;
						year = year + 1;
					}

					let newRecord = {
						code: newDate,
						day: i,
						batchType: _this.dataModel.batchType,
						rowId: i,
						recordStatus: uiSvc.editModes.INSERT,
						date: _this.functions.skipWeekendsAndHolidays(newDate),
						time: time
					};

					_this.dialogData.rows.push(newRecord);
					i++;
				}
				/**/
			};

			_this.functions.onSaveRecord = function (record) {
				record.code = record.date;

				//Every other weekday option
				if (_this.dataModel.batchType === 'EveryOtherWeekday' && _this.dialogData.rows.length === 0) {
					return _this.functions.addEverySecondDay(record.date, record.time);
				}

				//Schedule daily option
				if (_this.dataModel.batchType === 'ScheduledDaily' && _this.dialogData.rows.length === 0) {
					return _this.functions.addDaily(record.date, record.time);
				}

				//Schedule month end option
				if (_this.dataModel.batchType === 'ScheduledMonthEnd' && _this.dialogData.rows.length === 0) {
					return _this.functions.addEndOfMonths(record.date, record.time);
				}

				//if skipDays active run functions
				record.date = _this.functions.skipWeekendsAndHolidays(record.date);
				return record;
			};

			adminDataSvc.listFunctions.initializeDialogController(_this, $uibModalInstance, 'Day');
		}
	]);
});
