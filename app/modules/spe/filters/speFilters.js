/*
 /// <summary>
 /// app.modules.spe.filters - speFilters
 /// Class to perform various SPE Reporting Filters
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 02/08/2017
 /// </summary>
 */
define(['modules/spe/module'], function (module) {
    "use strict";
    module.registerFilter('speGwidStatusFilter', [function () {
        // filter to return the status of a gwid based on its status
        return function (type) {
            switch (type) {
                case 0:
                    return "In-Progress";
                    break;
                case 1:
                    return "Successful";
                    break;
                case 90:
                    return "Failed Compliance";
                    break;
                case 91:
                    return "Failed Rules";
                    break;
                case 92:
                    return "Failed Duplicate";
                case 93:
                    return "Failed Complete Record Duplicate"; // TODO: This is an issue as 93 used to be auto-corrected
                case 94:
                    return "Failed Invalid Record Length";
                case 95:
                    return "Failed Invalid Data Type";
                case 96:
                    return "Failed Merged";
                case 97:
                    return "Failed Filtered";
                case 98:
                    return "Failed External";
                case 99:
                    return "Auto-Corrected";
                    break;
                case 999:
                    return "Irreparable";
                    break;
                case 2:
                    return "Repaired Awaiting Validation";
                    break;
                case 3:
                    return "Repaired  Validated Awaiting Submission";
                    break;
                case 4:
                    return "Repaired";
                    break;
                default:
                    return "Unspecified";
            }
        }
    }]);

    module.registerFilter('speEnvelopeDirectionFilter', [function () {
        // filter to return the direction of an envelope from SPE
        return function (type) {
            if (type === undefined || type === null || type === "")
                return "Sync Pending";

            switch (parseInt(type)) {
                case 0:
                    return "Outbound";
                    break;
                case 1:
                    return "Inbound";
                    break;
                default:
                    return "Unspecified";
            }
        }
    }]);


    module.registerFilter('speGwidRowStyleFilter', [function () {
        // filter to return the row Style of a GWID Based on its status
        return function (type) {
            switch (type) {
                case 90:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 97:
                    return "transactionError";
                    break;
                case 99:
                    return "recordInsert"; // we have a issue here as this used to be autocorrected
                    break;
                case 999:
                case 98:
                    return "transactionCancel";
                    break;
                case 2:
                    return "recordUpdate";
                    break;
                case 3:
                    return "transactionRepair";
                    break;
                case 4:
                    return "transactionResubmit";
                    break;
                default:
                    return null;
            }
        }
    }]);

    module.registerFilter('speGwidTextStyleFilter', [function () {
        // filter to return the text Style of a GWID Based on its status
        return function (type) {
            switch (type) {
                case 90:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 97:
                    return "txt-color-red bold";
                    break;
                case 2:
                    return "txt-color-orangeDark";
                    break;
                case 3:
                    return "txt-color-orange";
                    break;
                case 4:
                    return "txt-color-magenta";
                    break;
                default:
                    return null;
            }
        }
    }]);

    module.registerFilter("itxGwidEditorStyleFilter", [function () {
        return function (type) {
            let record = {readOnly: false};
            switch (type) {
                case 90:
                    record.desc = "Document has Failed with a Compliance Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 91:
                    record.desc = "Document has Failed with a Rule Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 92:
                    record.desc = "Document has Failed with a Duplicate Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 93:
                    record.desc = "Document has Failed with Complete Record Duplicate Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 94:
                    record.desc = "Document has Failed with Invalid Record Length Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 95:
                    record.desc = "Document has Failed with Invalid Data Type Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 96:
                    record.desc = "Document has Failed with Merged Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 97:
                    record.desc = "Document has Failed with Filtered Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 98:
                    record.desc = "Document has Failed with External Error";
                    record.type = "danger";
                    record.icon = "times";
                    break;
                case 99:
                    record.desc = "Document Failed but has been Auto-Corrected";
                    record.type = "info";
                    record.icon = "wrench";
                    record.readOnly = true;
                    break;
                case 999:
                    record.desc = "Document Has been Marked as Irreparable";
                    record.type = "danger";
                    record.icon = "times";
                    record.readOnly = true;
                    break;
                case 2:
                    record.desc = "Document Failed and Repair has Commenced but Validation has not occurred";
                    record.type = "warning";
                    record.icon = "edit";
                    break;
                case 3:
                    record.desc = "Document Failed and Repair has been Successfully Validated, Resubmission is Outstanding";
                    record.type = "warning";
                    record.icon = "paper-plane";
                    break;
                case 4:
                    record.desc = "Document Failed but was Repaired and Resubmitted";
                    record.type = "info";
                    record.icon = "wrench";
                    record.readOnly = true;
                    break;
                default:
                    record.desc = "Document has passed EDI Validation";
                    record.type = "success";
                    record.icon = "check";
                    record.readOnly = true;
                    break;

            }
            return record;
        }
    }]);

});
