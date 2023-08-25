/*
 /// <summary>
 /// app.modules.spe.extensions.instamed.services - speInstamedDataSvc
 /// SPE InstaMed Extension
 /// Core Data Service for the Instamed Extension Module
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/04/2020
 /// </summary>
 */
define(['modules/spe/module', 'lodash'], function (module, lodash) {
    "use strict";
    module.registerService('speInstamedDataSvc', ['$filter', '$log', '$timeout', '$state', '$q', '$uibModal', 'uiSvc', 'apiSvc', 'apiProvider', 'chartSvc', function ($filter, $log, $timeout, $state, $q, $uibModal, uiSvc, apiSvc, apiProvider, chartSvc) {
        var _this = this;
        _this.model = {};



        //<editor-fold desc="Common Functions">
        _this.getColorPalette = function()
        {
            // routine to return the color palette for this module
            var baseColors = chartSvc.getColors();
            let colorArray = ['#335c67', '#fff3B0', '#E09F3E','#75485E', '#7E7F9A', '#DE9B98'];
            let failColor = colorArray[5];
            let okColor = colorArray[4];
            let error = baseColors.chartError;

            return {
                colorArray: colorArray,
                colorNames: {error: error, unk: baseColors.chartUnknown, request: colorArray[0], paid:colorArray[2], processed: colorArray[1], paymentMethods: colorArray[0], paymentStatus: colorArray[2],
                            pre_edit: okColor, pre_edit_fail: failColor, non_compliance: okColor, non_compliance_fail: error, payments: colorArray[2],
                            reject: colorArray[0], reject_error: error, idf_to_be: okColor, idf_to_be_fail: failColor, idf_received: okColor, idf_response: colorArray[3] }
            };
        };

        _this.getStatusList = function()
        {
            // routine to return the statuses available
            return [{code:"Data", description:"Data Received"},
                {code: "X12 835", description: "Generating X12 835"},
                {code: "X12 999", description: "Received X12 999"},
                {code: "Process IDF", description: "Process IDF"},
                {code: "Generate IDF Response", description: "Generate IDF Response"}];
        };


        _this.getPaymentMethods = function () {
            return [{code: "ach", description: "EFT"},
                    {code: "virtualcard", description: "Virtual Card"},
                    {code: "chk", description: "Check"},
                    {code: "non", description: "Non-Payment"},
                    {code: "bop", description: "BOP"}
                    ];
        };
        _this.getTotals = function () {
            return [{code: "total", description: "Total"}];
        };
        _this.getPartnerProcStatusCodes = function ()
        {
            // routine to return the processing status codes from the partner
            return [
                {code: "settled",description: "Settled"},
                {code: "paid", description: "Paid"},
                {code: "non", description: "Non-Payment"},
                {code: "pendingfunding", description: "Pending Funding"},
                {code: "partiallysettled", description: "Partially Settled"},
                {code: "returned", description: "Returned"}, {code: "void", description: "Voided"},
                {code: "stopped",description: "Stopped"},
                {code: "cancelled", description: "Cancelled"},
                {code: "expired", description: "Expired"},
                {code: "reissued", description: "Re-Issued"}
                ];

        };
        _this.getPartnerProcStatusCodesDashboard = function ()
        {
            // routine to return the processing status codes from the partner for Dashboard view
            return [
                {code: "settled",description: "Settled"},
                {code: "paid", description: "Paid"},
                {code: "non", description: "Non-Payment"},
                {code: "pendingfunding", description: "Pending Funding"},
                {code: "partiallysettled", description: "Partially Settled"},
                {code: "returned", description: "Returned"}, {code: "void", description: "Voided"},
                {code: "stopped",description: "Stopped"},
                {code: "cancelled", description: "Cancelled"},
                {code: "expired", description: "Expired"},
                {code: "reissued", description: "Re-Issued"}
            ];

        };

        _this.getResponseStatusCodes = function () {
            return [{code: "settled", description: "Settled"}, {code: "paid", description: "Paid"}];
        };

        _this.getProcTitles = function ()
        {
            // routine to return the titles - this will eventually be parameterized
            if (_this.model.titles)
                return _this.model.titles;

            var mainTitles = {
                backend:"BICPS",
                preEdit:"Pre-Edit",
                partnerName:"Instamed",
                main:"Payment Cycle",
                holdingCompany:"Parent Company",
                division:"Company",
                subCompany:"Sub Company",
                ediType:"835",
                responseType:"IDF"
            };
            var procTitles = {

                request: "Received from " + mainTitles.backend,
                x12835: "X12 " + mainTitles.ediType + " To " + mainTitles.partnerName,
                x12999: "X12 Acknowledgement",
                partner: mainTitles.responseType + " From " +  mainTitles.partnerName,
                response: "Response to " + mainTitles.backend,
                checkNumber:mainTitles.backend + " Trace Number"
            };
            _this.model.titles = lodash.merge(mainTitles, procTitles);
            return _this.model.titles;
        };

        _this.methods = _this.getPaymentMethods();
        _this.getPaymentMethod = function(value)
        {
            // routine to get the method description for the given code
            var record = lodash.find(_this.methods, {code: value.toLowerCase()});
            if (record != null)
                return record.description;
            else
                return value;
        };
        _this.paymentStatuses = _this.getResponseStatusCodes();
        _this.getPaymentStatus = function(value)
        {
            // routine to get the method description for the given code
            var record = lodash.find(_this.getPartnerProcStatusCodes(), {code: value.toLowerCase()});
            if (record != null)
                return record.description;
            else
                return value;
        };


        //</editor-fold>

        //<editor-fold desc="Balancing Reporting">
        _this.createBalancingGridColumn = function(fieldsList, aggregateList, partialFieldName, dest_name, fieldObject)
        {
            // routine to create the dynamic columns for the balancing grid both on the dashboard and reporting
            var key = dest_name  + "_" + fieldObject.code;
            fieldsList[key] = {type:"number"};
            aggregateList.push(
                {
                    field: key,
                    aggregate: "sum"
                });

            // create the column object and return it
            var columnObject =
                {
                    field: key,
                    title: fieldObject.description,
                    aggregates:["sum"],
                    format: '{0:n0}',
                    footerTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                    groupFooterTemplate:"<div style=\"text-align: right\">#= kendo.toString(sum, 'n0') #</div>",
                    attributes:{style:"text-align:right;"},
                    headerAttributes:{style:"text-align:right;"},
                    filterable: false,
                    width: "120px"
                };
            return columnObject;
        };
        _this.processValueArray = function(array, srcObj, destObj, srcName, destName)
        {
            // routine to process the status and payment methods into mappings
            var total = 0;
            lodash.forEach(array, function(method)
            {
                var value = lodash.get(srcObj, srcName + "." + method.code + ".count", 0);
                var key = destName + "_" + method.code;
                destObj[key] = value;
                total += value;
            });
            return total;

        }
        _this.parseBalancingKendoGridData = function (rows)
        {
            // routine to massage the data for grid use
            var methods = _this.getPaymentMethods();
            var part_status = _this.getPartnerProcStatusCodes();
            var part_totals = _this.getTotals();
            var resp_totals = _this.getTotals();
            var req_status = _this.getResponseStatusCodes();
            var titles = _this.getProcTitles();

            var returnRows = lodash.map(rows, function (item)
            {
                var value = $filter("localUTCEpochDateFilter")(item.batch_date, "YYYY-MM-DD HH:mm:ss.SSS");
                var value2 = $filter("localUTCEpochDateFilter")(item.sys_date, "YYYY-MM-DD HH:mm:ss.SSS");
                var returnRow = {_id: item._id, transactionId: item.transactionId, status: item.status, moduleDesc:item.moduleDesc, holdingCompany: item.holdingCompany, division: item.division};
                returnRow.batch_date = $filter("kendoDateFilter")(value);
                returnRow.sys_date = $filter("kendoDateFilter")(value2);

                // request counts
                returnRow.req_claimCount = item.summary.request.claimCount;
                returnRow.req_claimAmount = uiSvc.roundNumber(item.summary.request.claimAmount,2);
                returnRow.req_slCount = item.summary.request.serviceLineCount;
                returnRow.preEdit_claimCount = item.summary.request.preEditClaimCount;
                returnRow.preEdit_claimAmount = uiSvc.roundNumber(item.summary.request.preEditClaimAmount,2);

                // payment
                returnRow.pay_nc_claimCount =  item.summary.x12835.noncompliance.claimCount;
                returnRow.pay_nc_claimAmount = 0.00;
                if (item.summary.x12835.noncompliance.claimAmount)
                    returnRow.pay_nc_claimAmount = uiSvc.roundNumber(item.summary.x12835.noncompliance.claimAmount,2);
                returnRow.pay_claimCountPaid = item.summary.x12835.claimCountPaid;
                returnRow.pay_claimCountNPaid = item.summary.x12835.claimCountNonPaid;
                returnRow.pay_claimCount = item.summary.x12835.claimCount;
                returnRow.pay_claimAmount = uiSvc.roundNumber(item.summary.x12835.claimAmount,2);
                returnRow.pay_tranCount = item.summary.x12835.transactionCount;
                returnRow.pay_tranAmount = uiSvc.roundNumber(item.summary.x12835.transactionAmount,2);

                // ack
                returnRow.ack_incl =  item.summary.x12999.transactionsIncluded;
                returnRow.ack_recv = item.summary.x12999.transactionsReceived;
                returnRow.ack_acc = item.summary.x12999.transactionsAccepted;
                returnRow.ack_rej = item.summary.x12999.rejected.transactionCount;
                returnRow.outofBalance = null;

                // payment methods
                var total_part_pm = _this.processValueArray(methods, item, returnRow, "summary.partner.methods.list", "part_pm");
                var total_res_pm = _this.processValueArray(methods, item, returnRow, "summary.response.methods.list", "res_pm");

                // statuses
                _this.processValueArray(part_status, item, returnRow, "summary.partner.status.list", "part_st");
                _this.processValueArray(req_status, item, returnRow, "summary.response.status.list", "res_st");

                //Partner totals
                _this.processValueArray(part_totals, item, returnRow, "summary.partner.methods", "part_pm");
                _this.processValueArray(part_totals, item, returnRow, "summary.partner.status", "part_st");

                //Response totals
                _this.processValueArray(resp_totals, item, returnRow, "summary.response.methods", "res_pm");
                _this.processValueArray(resp_totals, item, returnRow, "summary.response.status", "res_st");

                // determine the correct row style
                if (returnRow.pay_nc_claimCount > 0)             // non-compliant count > 0
                {
                    returnRow.outofBalance = "Non-Compliance " + $filter('number')(returnRow.pay_nc_claimCount);
                    returnRow.rowStyle = "recordUpdate";
                }
                if (returnRow.preEdit_claimCount > 0)             // pre-edit error count > 0
                {
                    returnRow.outofBalance = "Pre-Edit Error " + $filter('number')(returnRow.preEdit_claimCount);
                    returnRow.rowStyle = "recordUpdate";
                }
                if (returnRow.pay_tranCount != returnRow.ack_incl) // x12 batch count has not been fully accepted
                {
                    returnRow.outofBalance = "ST Batch Not fully accepted";
                    returnRow.rowStyle = "recordUpdate";
                }
                if (returnRow.pay_claimCount != total_part_pm)    // total payments made by partner does not equal 835 pay amount
                {
                    returnRow.outofBalance = titles.responseType + " Count " + $filter('number')(total_part_pm) + "\ndoes not equal\n" + titles.ediType + " Count " + $filter('number')(returnRow.pay_claimCount);
                    returnRow.rowStyle = "recordUpdate";
                }

                if (returnRow.ack_rej > 0)
                {
                    returnRow.outofBalance = "Rejected" + $filter('number')(returnRow.ack_rej);
                    returnRow.rowStyle = "recordDelete";
                }
                var finalPayCount = returnRow.pay_claimCount + parseInt(returnRow.preEdit_claimCount) + parseInt(returnRow.pay_nc_claimCount);
                var finalPayAmount = uiSvc.roundNumber(returnRow.pay_claimAmount + returnRow.preEdit_claimAmount + returnRow.pay_nc_claimAmount,2);

                if (returnRow.req_claimCount != finalPayCount)
                {
                    returnRow.outofBalance = titles.request + " Count " + $filter('number')(returnRow.req_claimCount) + "\ndoes not equal\n" + titles.x12835 + " Count " + $filter('number')(finalPayCount);
                    returnRow.rowStyle = "recordDelete";       // request claim count <> 835 claim count total
                }
                if (returnRow.req_claimAmount != finalPayAmount)
                {
                    returnRow.outofBalance = titles.request + " Amount " + $filter('currency')(returnRow.req_claimAmount) + "\ndoes not equal\n" + titles.x12835 + " Amount " + $filter('currency')(finalPayAmount);
                    returnRow.rowStyle = "recordDelete";       // request claim amount <> 835 claim amount total
                }
                return returnRow;
            });
            return returnRows;
        };

        _this.balancingSearch = function (filterObject) {
            // routine to request balance reporting for the given filter object and call the callback
            return apiProvider.getList('speInstamedBalancingSearch', filterObject)
        };
        _this.balancingDetail = function (id)
        {
            // routine to request iib reporting for the given filter object
            return apiProvider.get("speInstamedBalancingDetail", {id: id});
        };

        _this.navigateTransaction = function(id, baseState)
        {
            // routine to navigate to the transaction
            var currentState = baseState.parent;
            var baseRoute = currentState.name + ".reporting.transactionDetail.ganttview";
            if (currentState.name.indexOf("ganttview") > -1)
                baseRoute = currentState.name + ".ganttview";
            $state.go(baseRoute, {transactionId: id});
        };


        //</editor-fold>

        //<editor-fold desc="Dashboard">
        _this.refreshDashboard = function (filterObject)
        {
            // routine to request iib reporting for the given filter object
            return apiProvider.getObject('speInstamedBaseDashboard', filterObject);
        };

        //</editor-fold>

        //<editor-fold desc="Claims Reporting">
        _this.claimsSearch = function (filterObject) {
            // routine to request claim search for the given object
            return apiProvider.getObject('speInstamedClaimSearch', filterObject)
        };
        _this.parseClaimsKendoGridData = function (rows)
        {
            // routine to massage the claims data for grid use
            var returnRows = lodash.map(rows, function (item)
            {
                var value = $filter("localUTCEpochDateFilter")(item.createDate, "YYYY-MM-DD HH:mm:ss.SSS");
                var value2 = $filter("localUTCEpochDateFilter")(item.sysdate, "YYYY-MM-DD HH:mm:ss.SSS");
                item.createDate = $filter("kendoDateFilter")(value);
                item.sysdate = $filter("kendoDateFilter")(value2);
                if (!item.actualPaidAmount)
                    item.actualPaidAmount = 0;
                if (!item.requestedPaidAmount)
                    item.requestedPaidAmount = 0;
                if (item.rejectErrorCode && item.rejectErrorCode == "||")
                    item.rejectErrorCode = null;
                if (item.rejectErrorDesc && item.rejectErrorDesc == "||")
                    item.rejectErrorDesc = null;
                if (item.payMethod)
                    item.payMethod = _this.getPaymentMethod(item.payMethod);
                if (item.payStatus)
                    item.payStatus = _this.getPaymentStatus(item.payStatus);
                if (item.paidDate)
                {
                    var value3 = $filter("localUTCEpochDateFilter")(item.paidDate, "YYYY-MM-DD HH:mm:ss.SSS");
                    item.paidDate = $filter("kendoDateFilter")(value3);
                }
                return item;
            });
            //console.log("rows", returnRows);

            return returnRows;
        };

        //</editor-fold>

        // setup the api
        var configs = [
            {url: '/spe/instamed/dashboard/base', 'resourceName': 'speInstamedBaseDashboard'},
            {url: '/spe/instamed/balancing/search', 'resourceName': 'speInstamedBalancingSearch'},
            {url: '/spe/instamed/balancing/detail', resourceName: 'speInstamedBalancingDetail'},
            {url: '/spe/instamed/claim/search', resourceName: 'speInstamedClaimSearch'},
            {url: '/spe/instamed/claim/detail', resourceName: 'speInstamedClaimDetail'}
        ];

        angular.forEach(configs, function (value) {
            apiSvc.add(value);
        });

    }]);

});
