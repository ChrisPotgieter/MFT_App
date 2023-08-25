/*
 /// <summary>
 /// app.modules.custom.spe_cno.services - speCNODataSvc.js
 /// CNO SPE Module Data Service
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 15/12/2017
 /// </summary>
 */
 define(['modules/custom/spe_cno/module', 'lodash', 'moment'], function(module, lodash, moment)
 {
     moment().format();
     "use strict";
     module.registerService('speCNODataSvc',['$state', '$filter','$log', '$timeout', '$q', 'uiSvc','apiSvc', 'apiProvider', 'cacheDataSvc', 'chartSvc', 'adminDataSvc', 'transactionReportingSvc', 'userSvc', function($state, $filter, $log, $timeout, $q, uiSvc, apiSvc, apiProvider, cacheDataSvc, chartSvc, adminDataSvc, transactionReportingSvc, userSvc)
     {
         let _this = this;
         // setup the api
         let configs = [
             {url: 'client/cno/spe/reporting/rep001', resourceName:'speCNOReport_REP001'},
             {url: 'client/cno/tpci/search', resourceName: 'speCNOTPCISearch'},
             {url: 'client/cno/tpci/dashboard', resourceName: 'speCNOTPCIDashboard'},
             {url: 'client/cno/tpci/vendor', resourceName: 'speCNOTPCIVendor'},
             {url: 'client/cno/tpci/errors', resourceName: 'speCNOTPCIErrors'},
             {url: 'client/cno/tpci/transactions', resourceName: 'speCNOTPCITransactions'},
             {url: 'client/cno/tpci/detail/', resourceName: 'speCNOTPCIDetail'},
 
             {url: 'client/cno/aegf/search', resourceName: 'speCNOAEGSearch'},
             {url :'client/cno/aegf/read/:id', resourceName: 'speCNOAEGRead', params: {id:'@id'}},
             {url :'client/cno/aegf/update/', resourceName: 'speCNOAEGFUpdate'},
             {url: 'client/cno/aegf/dashboard', resourceName: 'speCNOAEGFDashboard'},


             {url :'client/cno/cli', resourceName: 'speCNOCLIRequest'}


         ];
 
         angular.forEach(configs, function(value){
             apiSvc.add(value);
         });

         // set this up as an CLI Controller
         _this.cliInstructionEnum  = { AEGF_GROUP_SYNC: 20, AEGF_SSN_SYNC:21, AEGF_LOB_SYNC: 22, AEGF_ADHOC_RUN: 23, AEGF_SCHEDULE: 24, AEGF_RESUME_DELIVERY: 25};
         adminDataSvc.setupCLI(_this, 'speCNOCLIRequest', 'cnoCLICtrl');
 
 
         //<editor-fold desc="Sender & Customized Reporting">
         _this.senderImport = function(model)
         {
             // routine to prepare for sender imports
             return apiProvider.getObject("speCNOSenderImport", model);
         };
         _this.processReport_REP001 = function(model)
         {
             return apiProvider.getList("speCNOReport_REP001", model);
         };
         //</editor-fold>
 
 
         //<editor-fold desc="Third Party Commission Intake">
         _this.tpciModules = {ENROLLMENT: 1, COMMISSION: 2};
         _this.tpciVendors = cacheDataSvc.getListForType("1", "TPCI_VENDOR");
 
 
         //<editor-fold desc="Dashboard">
         _this.refreshTPCIDashboard = function (filterObject, module) {
             // routine to request the TPCI Dashboard Reporting for the given filter object and module id
             filterObject.module = module;
             return apiProvider.getObject('speCNOTPCIDashboard', filterObject);
         };
 
         _this.refreshTPCIVendor = function(filterObject)
         {
             // routine to return the vendor breakdown information for the given filter
             return apiProvider.getList('speCNOTPCIVendor', filterObject);
         };
 
         _this.refreshTPCIErrors = function(filterObject)
         {
             // routine to return the the error listing for the given filter
             return apiProvider.getList('speCNOTPCIErrors', filterObject);
         };
         _this.refreshTPCITransactions = function(filterObject)
         {
             // routine to return the the record listing for the given filter
             return apiProvider.getList('speCNOTPCITransactions', filterObject);
         };
 
         _this.getTPCIDashboardColorPalette = function (module)
         {
             // routine to return the color palette for for the  TPCI Module
             let baseColors = chartSvc.getColors();
             //let colors =  ['#6096BA', '#274C77','#FF6700', '#A3CEF1', '#023047', '#8B8C89'];
             //let color =  {error: baseColors.chartError, unk: baseColors.chartUnknown, requests: colors[0], success: colors[1], time: colors[2], bytes: colors[3], proc_time: colors[5]};
             let colors = ['#89BBFE', '#006494', '#25A18E', '#7AE582', '#615d6C', '#9EB3C2'];
             let color = {
                 error: baseColors.chartError,
                 unk: baseColors.chartUnknown,
                 requests: colors[0],
                 success: colors[1],
                 amounts: colors[2],
                 vendors: colors[3],
                 send_bytes: colors[4],
                 receive_bytes: colors[5]
             };
 
             return {
                 colorArray: colors,
                 colorNames: color
             };
         };
 
         _this.showTPCIVendorSummary = function (filter, module)
         {
             // routine to display the Vendor Summary Dialog on the TPCI Dashboard
             let record = filter;
             record.module = module;
 
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/tpci-vendor-detail-dialog.tpl.html";
             controlOptions.controller = "cnoTpicVendorDetailDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.size = 'lg';
             controlOptions.windowClass = 'lg-modal';
             uiSvc.showDialog(record, controlOptions);
         };
 
         _this.onTPCICountDrill = function(data, filter)
         {
             // routine to handle drills on the counts for both the comparision filter and the standard filter
             let module = filter.module;
             switch (data.caption)
             {
                 case "Vendors":
                     _this.showTPCIVendorSummary(filter, module);
                     break;
                 case "Errors":
                     _this.showTPCITransactionSummary(filter, 1);
                     break;
                 case "Transactions Received":
                     _this.showTPCITransactionSummary(filter, 0);
                     break;
             }
         };
 
 
 
         _this.showTPCITransactionSummary = function(filter, type)
         {
             // routine to display the Transaction Dialog on the TPCI Dashboard
             let record = {filter: filter, type: type};
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/tpci-dashboard-transaction-dialog.tpl.html";
             controlOptions.controller = "cnoTpciDashboardTransactionDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.size = 'lg';
             controlOptions.windowClass = 'xl-modal';
             uiSvc.showDialog(record, controlOptions);
         };
 
         _this.parseTPCIVendorData = function(value)
         {
             // routine to parse the record the data for grid use
             lodash.forEach(value, function(item)
             {
                 let value = $filter("localUTCStringFilter")(item.last_date);
                 item.last_date = $filter("kendoDateFilter")(value);
                 item.name = item._id;
 
                 // get the name
                 let record = cacheDataSvc.getListRecord("1", "TPCI_VENDOR", item._id);
                 if (record != null)
                     item.name = record.description;
             });
             return value;
         };
 
 
         //</editor-fold>
 
         //<editor-fold desc="Grid">
         _this.parseTPCICountData = function (data, vendorData, updateObject, module, mode)
         {
             // update the counts for the given data for the given module
             if (data == undefined)
                 data = {count: 0, succeeded: 0, failed: 0, vendors: 0, amount: 0, premium: 0};
 
             // update the vendors data
             data.vendors = (vendorData) ? vendorData.length : 0;
 
             updateObject.vendors.value = $filter("number")(data.vendors);
             updateObject.requests.value = $filter("number")(data.count);
             updateObject.failed.value = $filter("number")(data.failed);
 
             // update the commission data
             if (module == _this.tpciModules.COMMISSION)
             {
                 updateObject.amount.value =  $filter("currency")(data.amount);
                 updateObject.premium.value =  $filter("currency")(data.premium);
             }
         };
 
         _this.refreshTPCISearch = function(filterObject, module)
         {
             // routine to return all requests for the given filter in the given module with stats
             filterObject.module = module;
             return apiProvider.getObject('speCNOTPCISearch', filterObject);
         };
 
         _this.parseTPCIGridData = function(value, module)
         {
             // routine to parse the record the data for grid use
             let dateFormat = "yyyy-MM-dd";
             lodash.forEach(value, function(item)
             {
                 let value = $filter("localUTCStringFilter")(item.received_date);
                 item.received_date = $filter("kendoDateFilter")(value);
                 if (item.insured_dob)
                 {
                     value = $filter("removeUTCDateFilter")(item.insured_dob);
                     item.insured_dob = $filter("kendoDateFilter")(value, dateFormat);
                 }
                 if (item.policy)
                 {
                     if (item.policy.effective_date)
                     {
                         value = $filter("removeUTCDateFilter")(item.policy.effective_date);
                         item.policy_effective_date = $filter("kendoDateFilter")(value, dateFormat);
                     }
                     if (item.policy.signed_date)
                     {
                         value = $filter("removeUTCDateFilter")(item.policy.signed_date);
                         item.policy_signed_date = $filter("kendoDateFilter")(value, dateFormat);
                     }
                     if (item.policy.termination_date)
                     {
                         value = $filter("removeUTCDateFilter")(item.policy.termination_date);
                         item.policy_termination_date = $filter("kendoDateFilter")(value, dateFormat);
                     }
                     if (item.policy.original_eff_date)
                     {
                         value = $filter("removeUTCDateFilter")(item.policy.original_eff_date);
                         item.policy_original_eff_date = $filter("kendoDateFilter")(value, dateFormat);
                     }
                 }
                 if (item.agent_npn && (!item.agent_san || item.agent_san == ''))
                     item.agent_san = item.agent_npn;
                 if (item.commission)
                 {
                     if (item.commission.eff_date)
                     {
                         value = $filter("removeUTCDateFilter")(item.commission.eff_date);
                         item.commission_eff_date = $filter("kendoDateFilter")(value, dateFormat);
                     }
                 }
                 _this.getTPCIRowStatus(item);
             });
             return value;
         };
 
         _this.getTPCITransactionStatus = function (value)
         {
             // return the status for the given value - this matches GWID Status
             return $filter("speGwidStatusFilter")(value);
         };
 
         _this.getTPCIProcStatus = function (value, rowStyle)
         {
             // return the status for the TPCI Status for the given value
             let status = parseInt(value);
             if (rowStyle)
             {
                 if (status >=1 && status < 5 && rowStyle != 'transactionError')
                     rowStyle = 'transactionError';
             }
             switch (status)
             {
                 case 1:
                     return "Input Document";
                     break;
                 case 2:
                     return "Document Failed - Record Length";
                     break;
                 case 3:
                     return "Document Failed - Duplicate Record";
                     break;
                 case 4:
                     return "Document Failed - Pre-Edits";
                     break;
                 case 5:
                     return "Document Failed - Duplicate Field";
                     break;
                 case 6:
                     return "Merge - Ready for Extraction by LifePro";
                     break;
                 case 7:
                     return "Sent to Life-Pro - Awaiting Response";
                     break;
                 case 8:
                     return "Feedback Received from LifePro";
                     break;
                 default:
                     return "Unknown (" + value + ")";
             };
         };
 
         _this.getTPCIVendor = function(code, company)
         {
             // routine to return the TCPI Vendor Name
             let vendor = lodash.find(_this.tpciVendors, function(record)
             {
                 return record.companyId == company && record.code == code;
             });
             if (vendor != null)
                 return vendor.description;
             else
                 return code;
         };
 
         _this.getTPCIRowStatus = function(row)
         {
             // return the status for the given value - this matches GWID Status
             row.rowStyle = $filter("speGwidRowStyleFilter")(row.status);
             row.status_desc = _this.getTPCITransactionStatus(row.status);
             row.vendor_name = _this.getTPCIVendor(row.vendor_code, row.company_id);
             row.processing_status_desc = _this.getTPCIProcStatus(row.processing_status, row.rowStyle);
         };
 
         //</editor-fold>
 
         //<editor-fold desc="Detail">
         _this.showTPCIAssociatedTransaction = function(modalResult)
         {
             // routine to show associated transactions with from a TPCI Drill
             var baseState = null;
             let record = {transactionId: modalResult.id};
             switch(modalResult.module)
             {
                 case "itx":
                 case "itx_lifepro":
                     //baseState = "app.custom.spe_cno.reporting";
                     //record.transactionType = 2;
                     baseState = "app.mft_v2.reporting";
                     record.transactionType = 0;
                     break;
                 case "mft":
                     baseState = "app.mft_v2.reporting";
                     record.transactionType = 0;
                     break;
             }
             transactionReportingSvc.navigateTransaction(baseState + ".transactionDetail.jobview", record);
         };
 
         _this.showTCPIDetail = function(doc)
         {
             // routine to show the the detail of an TPCI Record
 
             let record = doc;
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/tpci-detail-dialog.tpl.html";
             controlOptions.controller = "cnoTpciDetailDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.size = 'lg';
             controlOptions.windowClass = 'xl-modal';
             let modalInstance = uiSvc.showDialog(record, controlOptions);
             modalInstance.result.then(function (modalResult)
             {
                 if (modalResult.id)
                     _this.showTPCIAssociatedTransaction(modalResult);
             }).catch(function (err)
             {
                 if (err != "cancel")
                     $log.error("Unable to Display Detail Dialog", err);
             });
         };
 
         _this.readTPCIDetail = function(doc)
         {
             // routine to return the gwid for the given document
             let filterObject = {oid: doc.id, companyId: doc.company_id, recordIndex: doc.record_index, jobId: doc.job_id, processingKey: doc.processing_id, module: doc.entity_type};
             if (doc.reference && doc.reference.itx && doc.reference.itx.id)
                 filterObject.ediTransactionId = doc.reference.itx.id;
             if (doc.reference && doc.reference.lifepro && doc.reference.lifepro.job_id)
             {
                 filterObject.systemId = doc.source_system_id;
                 filterObject.lifeProJobId = doc.reference.lifepro.job_id;
                 if (doc.reference.lifepro.itx_id)
                     filterObject.lifeProEdiTransactionId = doc.reference.lifepro.itx_id;
             }
             return apiProvider.getObject("speCNOTPCIDetail", filterObject);
         };
         //</editor-fold>
 
         //<editor-fold desc="General Functions">
         _this.getTPCIDepartment = function()
         {
             // determine the type of reporting to do based on the state
             let department = {id: 0, code: "enrollment"};
             let _state = $state.get($state.current);
             if (_state != null && _state.data != null && _state.data.department)
                 department = _state.data.department;
             return department;
         };
         _this.getTPCIDepartmentName = function(type)
         {
             // routine to return the department name
             if (type == _this.tpciModules.ENROLLMENT)
                 return "Enrollment";
             if (type == _this.tpciModules.COMMISSION)
                 return "Commission";
             return "Unknown";
         };
 
 
         //</editor-fold>
 
 
 
 
 
         //</editor-fold>
 
         //<editor-fold desc="Automated Employer Group Files">
         _this.aegf = {functions: {}, data: {cache: null, module_code:"AEGF"}, };

         _this.aegf.data.fields = [

             {data_source:["$govtid$"], identifier: "bcn", caption:"Social", selectable: true, hidden: true},
             {data_source:["$emp_code$"], identifier: "emp_code", caption:"Employee Code", selectable: true},
             {data_source:["$polnumber$"], identifier: "policy_number", caption:"Policy No.", selectable: true},
             {data_source:["$lastname$", ",", "$firstname$"], identifier: "full_name", caption:"Full Name", selectable: false},
             {data_source:["$lob$"], identifier: "lob", caption:"LOB Short", selectable: true, hidden: true},
             {data_source:["$lob_desc$"], identifier: "lob_desc", caption:"Line of Business", selectable: true},
             {data_source:["$mode$"], identifier: "mode", caption:"Payment Mode", selectable: true},
             {data_source:["$policy_status$"], identifier: "status", caption:"Policy Status", selectable: true},
             {data_source:["$carrieradminsystemname$"], identifier: "system", caption:"System", selectable: true},
             {data_source:["$paidtodate$"], identifier: "paidtodate", caption:"Paid To", selectable: true},
             {data_source:["$effectivedate$"], identifier: "effectivedate", caption:"Effective", selectable: true},
             {data_source:["$premium$"], identifier: "premium", caption:"Premium", justification: "1", selectable: true},
             {data_source:["$pay_date$"], identifier: "pay_date", caption:"Deduction Date", selectable: true},
             {data_source:["$pay_deduct$"], identifier: "pay_deduct", caption:"Deduction Code", selectable: false},
             {data_source:["$acc_pay_date$"], identifier: "acc_pay_date", caption:"Accural Date", selectable: true},
             {data_source:["$lastname$"], identifier: "last_name", caption:"Last Name", hidden: true, selectable: true},
             {data_source:["$firstname$"], identifier: "first_name", caption:"First Name", hidden: true, selectable: true},
             {data_source:["$middlename$"], identifier: "middle_name", caption:"Middle Name", hidden: true, selectable: true},
             {data_source:["$policy_indicator$"], identifier: "policy_indicator", caption:"Change Indicator", selectable: false, hidden: true}
         ];

         _this.aegf.functions.showDetail = function(id)
         {
             // routine to show the the detail of an AEGF Record
             let record = {id: id};
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/aegf-transaction-detail.tpl.html";
             controlOptions.controller = "aegfTransactionDetailDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.windowClass =  'xl-modal';
             let modalInstance = uiSvc.showSlideOutDialog(record, controlOptions);
             return modalInstance.result;
         };
         _this.aegf.functions.getFields = function ()
         {
            return _this.aegf.data.fields;
         };

         _this.aegf.functions.readModuleConfig = function()
         {
             // routine to read module config
             let deferred = $q.defer();
             adminDataSvc.readModuleParameter(_this.aegf.data.module_code).then(function (record)
             {
                 deferred.resolve(record);
             }).catch(function(err)
             {
                 $log.error("Unable to read AEGF Module Configuration", err)
             });
            return deferred.promise;
         };

         _this.aegf.functions.getModuleStatus = function(value)
         {
             // routine to the module status
             if (value == 1)
                 return "Processing";
             if (value == 999)
                 return "In-Error";
             if (value == 2)
                 return "Output Generated - Not Delivered";
             if (value == 3)
                 return "Delivery Paused";
             if (value == 4)
                 return "Delivered";
             if (value == 998)
                 return "Data Issues";
             return "Unknown";
         };

         _this.aegf.functions.getDeliveryType = function(value)
         {
             // routine to the delivery type
             if (value == 0)
                 return "SFTP";
             if (value == 1)
                 return "HTTP(s) Post";
             if (value == 2)
                 return "Email";
             return "Unknown";
         };


         _this.aegf.functions.getExecutionType = function(value)
         {
             // routine to the execution type
             if (value == 2)
                 return "Holiday";
             if (value == 1)
                 return "Ad-Hoc";
             return "Scheduled";
         };

         _this.aegf.functions.getColorPalette = function ()
         {
             // routine to return the color palette for for the AEGF System
             let baseColors = chartSvc.getColors();
             let colors = ['#89BBFE', '#006494', '#25A18E', '#7AE582', '#615d6C', '#9EB3C2'];
             let color = {
                 error: baseColors.chartError,
                 unk: baseColors.chartUnknown,
                 requests: colors[0],
                 success: colors[1],
                 scheduled: colors[2],
             };

             return {
                 colorArray: colors,
                 colorNames: color
             };
         };

         _this.aegf.functions.buildInitialColumns = function()
         {
             // routine to return the initial columns for a new report
             return lodash.map(_this.aegf.data.fields, function(field)
             {
                 if (!field.hidden)
                     field.hidden = false;
                 if (!field.justification)
                     field.justification = "0";

                 let record = {identifier: field.identifier, hidden: field.hidden, caption: field.caption, justification: parseInt(field.justification), data_source: field.data_source};
                 if (field.transformations)
                     record.transformations = field.transformations;
                 return record;
             });

         };

         _this.aegf.functions.copyRecord = function(copyRecord, group_id, sub_group_id)
         {
             // routine to insert a record based on the definition of an existing record
             let record = {group_id: group_id};
             if (sub_group_id != null)
                 record.sub_group_id = sub_group_id;
            record = copyRecord;
            record.group_id = group_id;
            record.sub_group_id = null;
             if (sub_group_id != null)
                 record.sub_group_id = sub_group_id;
             record.last_execution = null;
             record._id = null;
             return record;
         };

         _this.aegf.functions.initializeRecord = function(group_id, sub_group_id)
         {
            // routine to initialize a default record when the user clicks new
            let record = {group_id: group_id};
            if (sub_group_id != null)
                record.sub_group_id = sub_group_id;
            record.columns = [];
            record.output = {type:'-1', aggregate: false};
            record.filter = {days: 0};
            record.delivery = {type:-1, options: {}, notifications:{receipt_email:[]}};
            record.schedule = {type: -1};
            return record;
         };
         _this.aegf.functions.updateConfig = function(record, recordStatus, description)
         {
             // routine to save the given list of customer list records with audit information
             let model = {record: record, recordStatus: recordStatus, audit: adminDataSvc.createAudit(description, 0)};
             return apiProvider.getObject("speCNOAEGFUpdate", model);
         };
         _this.aegf.functions.readConfig = function(id)
         {
             // routine to read an aegf configuration using its id
             return apiProvider.get('speCNOAEGRead', {id: id});
         };
         _this.aegf.functions.searchConfigs = function(filterObject)
         {
             // routine to read all configs for the given filter object
             return apiProvider.getObject("speCNOAEGSearch", filterObject);
         };
         _this.aegf.functions.initializeConfig = function()
         {
             // routine to initialize a new config record with the defaults
             let record = {};
             return record;
         };

         _this.aegf.functions.initializeCache = function()
         {
             // routine to initiate the aegf cache
             let deferred = $q.defer();
             let listModel = {
                 company_id: userSvc.getOrgInfo().companyId,
                 type: "AEGF_GROUP"
             };
             adminDataSvc.readCustomerListAudit(listModel).then(function (result)
             {
                _this.aegf.data.cache = {};
                _this.aegf.data.cache.groups = result;
                deferred.resolve(_this.aegf.data.cache);

             }).catch(function (err)
             {
                 $log.error("Unable to Get AEGF Cache", err);
             });
             return deferred.promise;
         };

         _this.aegf.functions.getLists = function()
         {
             // routine to return the cache data used for employee groups
             if (_this.aegf.data.cache == null)
             {
                 return _this.aegf.functions.initializeCache();
             }
             else
             {
                 let deferred = $q.defer();
                 deferred.resolve(_this.aegf.data.cache);
                 return deferred.promise;
             }
         };

         _this.aegf.functions.getGroupDescriptions = function(groupId, subGroup)
         {
             // routine to return the sub group descriptions for the given list
             let returnObject = {group: groupId, subGroup:subGroup, groupDesc: groupId, group_code: null};
             if (_this.aegf.data.cache == null)
             {
                 // we dont have the cache yet - send back a default but initiate the cache get
                 _this.aegf.functions.getLists();
                 return returnObject;
             }
             else
             {
                 let groupRecord = lodash.find(_this.aegf.data.cache.groups, {code: groupId.toString()});
                 if (groupRecord == null)
                     return returnObject;

                 returnObject.groupDesc = groupRecord.description;
                 returnObject.group_code = groupId;
                 if (groupRecord.jsonData.crs_number && groupRecord.jsonData.crs_number != "")
                     returnObject.group_code = groupRecord.jsonData.crs_number;
                 if (subGroup == null)
                     return returnObject;

                 let subGroupRecord = lodash.find(groupRecord.jsonData.sub_groups, function (record)
                 {
                     return (record.code == subGroup.toString())
                 });
                 if (subGroupRecord != null) {
                     let number = subGroup;
                     if (subGroupRecord.crs_number != null && subGroupRecord.crs_number != "")
                         number = subGroupRecord.crs_number;
                     returnObject.subGroup = subGroupRecord.description + " (" + number + ")";
                     returnObject.subGroupDesc = subGroupRecord.description;
                     returnObject.subGroupNumber = number;
                 }

                 return returnObject;
             }
         };

         _this.aegf.functions.parseCountData = function (data, scheduled, updateObject)
         {
             // routine to parse the count data for the dashboard
             if (data == undefined)
                 data = {count: 0, successful: 0, failed: 0};

             updateObject.requests.value = $filter("number")(data.count);
             updateObject.successful.value = $filter("number")(data.successful);
             updateObject.failed.value = $filter("number")(data.failed);
         };

         _this.aegf.functions.getErrorCaption = function(value)
         {
             // routine to the error caption for display
             if (value == "lob_deduction")
                 return "Payroll Deduction Code Mapping";
             if (value == "employee_code")
                 return "Employee Code Mapping";
             if (value == "lob")
                 return  "Line of Business Mapping";
             if (value == "pay_period")
                 return "Pay Period Mapping";
             return "Definition Errors";

         }
         _this.aegf.functions.parseExecutionData = function(value)
         {
             // routine to parse the record the data for grid use
             lodash.forEach(value, function(item)
             {
                 item = transactionReportingSvc.parseCommonTransaction(item);

                 // add the aegf specifics
                 item.moduleStatusDesc = _this.aegf.functions.getModuleStatus(item.module_status);
                 if (!item.progress_perc)
                     item.progress_perc = 100;

                 // check for paused
                 if (item.rowStyle == null && item.module_status == 3)
                     item.rowStyle = "recordUpdate";

                 // get the descriptions
                 let subGroup = null;
                 if (item.sub_group != null)
                     subGroup = item.sub_group;
                 let returnDesc = _this.aegf.functions.getGroupDescriptions(item.employer_id, subGroup);
                 item.employer_desc = returnDesc.groupDesc;
                 item.sub_group_desc = returnDesc.subGroup;
                 item.employer_code = returnDesc.group_code;
                 item.execution_type_desc = _this.aegf.functions.getExecutionType(item.execution_type);
             });
             return value;
         };

         _this.aegf.functions.getGroupData = function(item)
         {
             // routine to return the group data for the given item
             let subGroup = null;
             if (item.sub_group_id != null && item.sub_group_id != '')
                 subGroup = item.sub_group_id;
             let returnDesc = _this.aegf.functions.getGroupDescriptions(item.group_id, subGroup);
             item.groupDesc = returnDesc.groupDesc;
             item.subGroupDesc = returnDesc.subGroup;
             if (returnDesc.group_code != null)
                 item.groupCode = returnDesc.group_code;
            return item;
         };

         _this.aegf.functions.parseScheduledGridData = function(value)
         {
             // routine to parse the record the data for grid use
             lodash.forEach(value, function(item) {
                 item.rowStyle = null;
                 item = _this.aegf.functions.getGroupData(item);
                 if (!item.last_execution)
                     item.last_execution = {};
                 if (item.next_run != null) {
                     let utc = moment(item.next_run, "YYYY-MM-DDThh:mm:ss").utc().format("YYYY-MM-DDThh:mm:ss") + 'Z';
                     let value = $filter("localUTCStringFilter")(utc);
                     item.next_run = $filter("kendoDateFilter")(value);
                     item.schedule_type = $filter("cnoAegfScheduleTypeFilter")(parseInt(item.schedule.type));
                 }
             });
             return value;
         };

         _this.aegf.functions.parsePayPeriodGridData = function(value)
         {
             // routine to parse the record the data for grid use
             let current = moment();
             lodash.forEach(value, function(item) {
                 item.rowStyle = null;
                 item = _this.aegf.functions.getGroupData(item);
                 if (item.pay_period != null)
                 {
                     item.payroll_type = $filter("cnoAegfPayTypeFilter")(parseInt(item.pay_period.type));
                     if (item.pay_period.start_date != null)
                     {
                         let value = $filter("localUTCStringFilter")(item.pay_period.start_date);
                         item.pay_period_start = $filter("kendoDateFilter")(value);
                     }
                     if (item.pay_period.expire_date != null)
                     {
                         let expire = moment(item.pay_period.expire_date);
                         if (expire > current)
                             item.rowStyle = "transactionError";
                         let value = $filter("localUTCStringFilter")(item.pay_period.expire_date);
                         item.pay_period_expire = $filter("kendoDateFilter")(value);
                     }
                 }
             });
             return value;
         };


         _this.aegf.functions.parseBillingConfigData = function(value)
         {
             // routine to parse the record the data for grid use
             lodash.forEach(value, function(item)
             {
                 item.rowStyle = null;
                 item = _this.aegf.functions.getGroupData(item);
                 if (!item.last_execution)
                     item.last_execution = {};
                 if (item.last_execution && item.last_execution.date)
                 {
                     let value = $filter("localUTCStringFilter")(item.last_execution.date);
                     item.last_execution.date = $filter("kendoDateFilter")(value);
                 }
                 item.supplemental = "";
                 if (item.last_execution && item.last_execution.status != null)
                 {
                     let status = item.last_execution.status;
                     if (status == 999 || status == 998)
                         item.rowStyle = "transactionError";
                     if (status == 3)
                         item.rowStyle = "recordUpdate";
                     item.status_desc = _this.aegf.functions.getModuleStatus(item.last_execution.status);
                     item.supplemental = item.last_execution.supplemental
                 }
             });
             return value;
         };

         _this.aegf.functions.getBootStrapStatus = function(value)
         {
             // routine to get the bootstrap status for the given configuration status
             switch (value)
             {
                 case 4:     /* Delivered */
                     return 2;
                     break;
                 case 2:      /* Generated Not Delivered  */
                 case 1:      /* Processing */
                 case -1:     /* Not Run */
                     return 1;
                     break;
                 case 999:     /* Stopped/Error */
                 case 998:     /* Data Category Issue */
                     return 99;
                     break;
                 case 97:     /* Skipped due to Cron */
                 case 98:     /* Skipped due to Holiday */
                 case 3:    /* Paused */
                     return 3;
                     break;
             }
         };



         _this.aegf.functions.showColumnAddDialog = function(columns)
         {
             // routine to show the column config dialog return a promise
             let deferred = $q.defer();

             // set the dialog data
             let dialogData = {rows: columns, row: {caption:""}};
             dialogData.row.rowId = -1;
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/aegf-billing-config-detail-column-add-dialog.tpl.html";
             controlOptions.controller = "aegfBillingConfigDetailColumnAddDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.size = 'md';
             let modalInstance = uiSvc.showDialog(dialogData, controlOptions);
             modalInstance.result.then(function (result)
             {
                 modalInstance.close();
                 columns.push(result);
                 deferred.resolve(result);
             }, function (err)
             {
                 $log.error("Unable to Show Column Add Configurator", err)
             });
             return deferred.promise;
         };

         _this.aegf.functions.viewDefinition = function(id)
         {
             // routine to route the user to the billing configuration for the given id
             let model = {id: id};
             $state.go("app.custom.crs.billing", model);
         };

         _this.aegf.functions.showColumnConfigDialog = function(columns, columnIndex)
         {
             // routine to show the column config dialog return a promise
             let deferred = $q.defer();

             // set the dialog data
             let dialogData = {rows: columns, row: angular.copy(columns[columnIndex])};
             dialogData.row.rowId = columnIndex;
             let controlOptions = {};
             controlOptions.templateUrl = "app/modules/custom/spe_cno/partials/aegf-billing-config-detail-column-edit-dialog.tpl.html";
             controlOptions.controller = "aegfBillingConfigDetailColumnEditDialogCtrl";
             controlOptions.controllerAs = "vmDialog";
             controlOptions.size = 'lg';
             let modalInstance = uiSvc.showDialog(dialogData, controlOptions);
             modalInstance.result.then(function (result)
             {
                 modalInstance.close();
                 deferred.resolve(result);
             }, function (err)
             {
                 $log.error("Unable to Show Column Configurator", err)
             });
             return deferred.promise;
         };

         _this.aegf.functions.getPageSizes = function()
         {
             // routine to return the page sizes for kendo grids based
             return [50, 100, 200, "all"];
         }


         _this.aegf.functions.viewDocument = function(record)
         {
             // routine to view the document linked to the given record
             let options = {tableName:"AEGF_Binary"};
             transactionReportingSvc.viewInLineAttachment(record.attachment_id, record.attachment_format, 9999, record.icon, options);
         };

         _this.aegf.functions.prepareAdhocRunDialog = function(dialog)
         {
             // routine to prepare the given dialog for adhoc reporting
             dialog.progressInfo.viewReport = function()
             {
                 let record = {attachment_id: dialog.lastProgress.info.result.id, attachment_format: dialog.lastProgress.info.result.type, icon: "fa-paperclip"};
                 _this.aegf.functions.viewDocument(record);
             };

             dialog.progressInfo.buttons = [];
             dialog.progressInfo.buttons.push({
                 name: "output",
                 class: "primary",
                 action: dialog.progressInfo.viewReport,
                 caption: "View Report...",
                 visible: false
             });

             dialog.progressInfo.onProgressUpdateComplete = function(status)
             {
                 if (status == uiSvc.backgroundProcessStates.COMPLETED || status == uiSvc.backgroundProcessStates.INERROR)
                 {
                     if (dialog.lastProgress.info.result != null)
                     {
                         dialog.progressInfo.buttons[0].visible = true;
                     }
                 }
                 if (status == uiSvc.backgroundProcessStates.COMPLETED)
                 {
                     dialog.modalResult = true;
                 }
                 if (status == uiSvc.backgroundProcessStates.INERROR)
                 {
                     dialog.modalResult = false;
                 }
             };
         };

         _this.aegf.functions.refreshDashboard = function(filterObject)
         {
             // routine to request aegf dashboard for the given filter object
             return apiProvider.getObject('speCNOAEGFDashboard', filterObject);
         };


         //</editor-fold>
 
 
     }]);
 
 });
 