/*
 /// <summary>
 /// app.modules.transaction-reporting.filters - transactionFilters
 /// Class to perform various Transaction Reporting filters
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/26/2014
 /// </summary>
 */
define(['modules/transaction-reporting/module'], function(module)
{
    "use strict";
    module.registerFilter('transType',[function()
    {
        return function(type)
        {
            switch(type)
            {
                case 1:
                    return "Resubmission";
                case 2:
                    return "Repair";
                case 3:
                    return "Cancellation";
                default:
                    return "Transaction";
            }
        }
    }]);

    module.registerFilter('operationType',[function()
    {
        return function(type)
        {
            switch(type)
            {
                case 1:
                    return "Resubmission Requested";
                case 2:
                    return "Repair Requested";
                case 3:
                    return "Cancellation Requested";
                default:
                    return "None";
            }
        }
    }]);


    module.registerFilter('moduleType',[function()
    {
        // routine to return the module type
        return function(type)
        {
            switch(type)
            {
                case 1:
                case 101:
                    return "IIB";
                case 102:
                case 103:
                    return "ACE";
                case 2:
                    return "ITXA";
                case 210:
                    return "InstaMed";
                case 200:
                    return "ITX Launcher";
                case 3:
                    return "Boomi";
                case 4:
                    return "Bridge";
                case 999:
                    return "Admin";
                case 99:
                case 9999:
                    return "Custom";
                default:
                    return "MFT";
            }
        }
    }]);

});
