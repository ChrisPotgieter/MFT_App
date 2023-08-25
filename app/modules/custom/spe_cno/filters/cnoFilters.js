/*
 /// <summary>
 /// app.modules.custom.spe_cno.filters - cnoFilters
 /// Class to perform various CNO Reporting Filters
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/07/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module'], function (module) {
    "use strict";
    module.registerFilter('cnoAegfTransformationFilter', ['$filter', function ($filter)
    {
        return function (dataItem)
        {
            let returnValue = "";
            switch (dataItem.function)
            {
                case "trim":

                    if (dataItem.parameters.all != null && dataItem.parameters.all)
                        returnValue += " All";
                    else {
                        if (dataItem.parameters.right != null && dataItem.parameters.right)
                            returnValue += "Right";
                        else
                            returnValue += "Left";
                    }
                    break;
                case "mask":
                    returnValue += "Char ('" + dataItem.parameters.char + "') for Chars " + dataItem.parameters.chars;
                    break;
                case "pad":
                    returnValue += "Length " + dataItem.parameters.length + " Char ('" + dataItem.parameters.char + "')";
                    break;
                case "length":
                    returnValue += "Length: " + dataItem.parameters.length;
                    break;
                default:
                    break;
            }
            return $filter('titleCaseFilter')(returnValue);
        }
    }]);

    module.registerFilter('cnoAegfScheduleTypeFilter', ['$filter', function ($filter)
    {
        // routine to return the filter for AEGF Schedule Types
        return function (type)
        {
            let returnValue = "";
            switch (type) {
                case 0:
                    return "Monthly Month-End";
                case 1:
                    return "Daily/Weekly";
                case 2:
                    return "Every Other Weekday";
                case 3:
                    return "Specific Days";
            }
        }
    }]);
    module.registerFilter('cnoAegfPayTypeFilter', ['$filter', function ($filter)
    {
        // routine to return the filter for AEGF Payroll types
        return function (type)
        {
            let returnValue = "";
            switch (type) {
                case 12:
                    return "Monthly";
                case 24:
                    return "Semi-Monthly";
                case 52:
                    return "Weekly";
                case 26:
                    return "Bi-Weekly";
            }
        }
    }])




});
