/*
 /// <summary>
 /// app.modules.common.filters - formatFilters
 /// Filter to perform various filters
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 11/26/2014
 /// </summary>
 */
define(['modules/common/module', 'moment','moment-humanize'], function(module, moment, humanize)
{
    "use strict";
    moment().format();

    module.registerFilter('bytesFilter',[function() {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;

            const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
            let number = 0;
            let value = 0;
            if (bytes > 0)
            {
                number = Math.floor(Math.log(bytes) / Math.log(1024));
                value = (bytes / Math.pow(1024, Math.floor(number)))
            }
            return value.toFixed(precision) + ' ' + units[number];
        }
    }]);

    module.registerFilter('kbFilter',[function()
    {
        return function (bytes)
        {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            return Math.floor(bytes/1024);
        }
    }]);

    module.registerFilter('secondsToStringFilter',[function()
    {
        return function(seconds)
        {
            let roundedSeconds = seconds;
            if (!isNaN(seconds))
                roundedSeconds = parseFloat(seconds);
            return humanize((roundedSeconds * 1000).toFixed(3), {units: ["year", "month", "week", "day", "hour", "minute", "second", "millisecond"]});
        }
    }]);

    module.registerFilter('kendoDateFilter',[function()
    {
        return function(dateValue, dateFormat)
        {

            if (dateValue && typeof dateValue === "string")
            {
                if (dateValue.length === 24)
                    return kendo.parseDate(dateValue, "yyyy-MM-ddTHH:mm:ss.fffZ");
                if (dateValue.length === 20)
                    return kendo.parseDate(dateValue, "yyyy-MM-ddTHH:mm:ssZ");
                if (dateFormat)
                    return kendo.parseDate(dateValue, dateFormat);
                return kendo.parseDate(dateValue, "yyyy-MM-dd HH:mm:ss.fff")
            }
            return dateValue;
        }
    }]);
    module.registerFilter('titleCaseFilter',[function()
    {
        return function(input)
        {
            input = input || '';
            return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
    }]);
    module.registerFilter('kendoConnectorFilter',[function()
    {
        return function(type)
        {
            switch(type)
            {
                case 1:
                    return "Top";
                case 2:
                    return "Bottom";
                case 3:
                    return "Left";
                case 4:
                    return "Right";
                default:
                    return "Auto";
            }
        }

     }]);

    module.registerFilter('array', [function()
    {
        // routine to return an error filled with numbers of a given length
        // http://www.angularjs4u.com/filters/angularjs-template-divs-row/
        return function(arrayLength) {
            arrayLength = Math.ceil(arrayLength);
            const arr = new Array(arrayLength);
            let i = 0;
            for (; i < arrayLength; i++) {
                arr[i] = i;
            }
            return arr;
        };
    }]);

    module.registerFilter('bootStrapStatusFilter',[function()
    {
        // filter to return a bootstrap label based on the type
        return function(type)
        {
            switch(type)
            {
                case 1:
                    return "info";
                case 2:
                    return "success";
                case 3:
                    return "warning";
                case 4:
                    return "info";
                case 99:
                    return "danger";
                default:
                    return "default";
            }
        }

    }]);

    module.registerFilter('bootStrapStatusIconFilter',[function()
    {
        // filter to return a bootstrap label based on the type
        return function(type)
        {
            switch(type)
            {
                case 1:
                    return "fa-info";
                case 2:
                    return "fa-check-square-o";
                case 3:
                    return "fa-exclamation-warning";
                case 4:
                    return "fa-info-circle";
                case 99:
                    return "fa-exclamation-circle";
                default:
                    return undefined;
            }
        }

    }]);

    module.registerFilter('commaNumbers', [function()
    {
        // routine to format numbers as comma separated
        return function (nStr) {
            // routine to format numbers with commas
            nStr += '';
            const x = nStr.split('.');
            let x1 = x[0];
            const x2 = x.length > 1 ? '.' + x[1] : '';
            const rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
    }]);


    module.registerFilter('localEpochDateFilter',[function()
    {
        // filter to return a local date based on the unix epoch date (in utc)
        return function(input, display)
        {
            if (!isNaN(input))
            {
                return moment(parseInt(input)).local().format(display);
            }
            return input;
        }

    }]);

    module.registerFilter('localUTCEpochDateFilter',[function()
    {
        // filter to return a local date based on the unix epoch date (in utc)
        return function(input, display)
        {
            if (display === undefined)
                display = 'LLL';
            return moment(input).local().format(display);
        }
    }]);

    module.registerFilter('localUTCDateFilter',[function()
    {
        // filter to return a local date based on the an utc javascript Date
        return function(input, display)
        {
            if (display === undefined)
                display = 'LLL';
            return moment(input).format(display);
        }

    }]);

    module.registerFilter('removeUTCDateFilter',[function()
    {
        // filter to return a date based on the an utc string which should not be a utc string
        return function(input, display)
        {
            if (input.endsWith("Z"))
                input = input.slice(0, -1);
            if (display === undefined)
                display = "YYYY-MM-DD";
            return moment(input).format(display);
        }

    }]);


    module.registerFilter('localUTCStringFilter',[function()
    {
        // filter to return a local date based on the an utc javascript Date
        return function(input, display)
        {
            if (display === undefined)
                display = "YYYY-MM-DD HH:mm:ss.SSS";
            return moment.utc(input).local().format(display)
        }

    }]);

    module.registerFilter('localUTCStrToDateFilter',[function()
    {
        // filter to return a local date based on the an utc javascript Date
        return function(input)
        {
            return moment.utc(input).local().toDate();
        }

    }]);

    module.registerFilter('replaceAllFilter',[function()
    {
        // filter to replace all occurences of a string with another string
        return function(input,search, replacement)
        {
            return input.replace(new RegExp(search, 'g'), replacement);
        }

    }]);

    module.registerFilter('ibmMQMessageTypeFilter',[function()
    {
        // filter to return the IBM message type for a given type
        return function(input)
        {
            switch (input)
            {
                case 1:
                    return "Request";
                case 2:
                    return "Reply";
                case 8:
                    return "Datagram";
                case 4:
                    return "Report";
                case 112:
                    return "MQE Fields from MQE";
                case 113:
                    return "MQE Fields";
                case 65535:
                    return "System Last";
                case 65536:
                    return "Application First";
                case 999999999:
                    return "Application Last";
                default:
                    return input;
            }
        }
    }]);

    module.registerFilter('ibmMQMessageFeedbackFilter',[function()
    {
        // filter to return the IBM feedback options for the given inp
        return function(input)
        {
            switch (input)
            {
                case 0:
                    return "None";
                case 1:
                    return "System First";
                case 256:
                    return "Quit";
                case 258:
                    return "Expiration";
                case 259:
                    return "Confirmation of Arrival";
                case 260:
                    return "Confirmation of Delivery";
                case 262:
                    return "Channel Completed";
                case 264:
                    return "Channel Failed - Retry";
                case 265:
                    return "Application Cannot be Started";
                default:
                    return input;
            }
        }
    }]);


    module.registerFilter('ibmMQMessageEncodingFilter',[function()
    {
        // filter to return the IBM encoding for the given input
        return function(input)
        {
            switch (input)
            {
                case 273:
                    return "IBM iSeries/SPARC";
                case 546:
                    return "Linux/Windows";
                case 17:
                    return "Microfocus on Cobol";
                case 785:
                    return "z/OS";
                default:
                    return input;
            }
        }
    }]);

    module.registerFilter('ibmMQMessagePersistenceFilter',[function()
    {
        // filter to return the IBM persistence for the given input
        return function(input)
        {
            switch (input)
            {
                case -1:
                    return "As Parent";
                case 0:
                    return "Non-Persistent";
                case 1:
                    return "Persistent";
                case 2:
                    return "As Queue/Topic";
                default:
                    return input;
            }
        }
    }]);

    module.registerFilter('ibmMQMessageIdFilter',[function()
    {
        // filter to return the IBM message Id for the given input

        return function(input)
        {
            let no_id = "000000000000000000000000000000000000000000000000";
            if (input === no_id)
                return "Non-Specified";
            return input;
        }
    }]);


    module.registerFilter('ibmMQMessageCharsetFilter',[function()
    {
        // filter to return the IBM charset for the given input
        return function(input)
        {
            switch (input)
            {
                case 0:
                    return "Default";
                case -2:
                    return "Inherit";
                case -1:
                    return "Embedded";
                case -3:
                    return "Application";
                case -4:
                    return "As Published";
                default:
                    return "Code Page " + input;
            }
        }
    }]);



    module.registerFilter('ibmMQMessagePutTypeFilter',[function()
    {
        // filter to return the IBM put type for the given input
        return function(input)
        {
            switch (input)
            {
                case -1:
                    return "Unknown";
                case 0:
                    return "No Context";
                case 1:
                    return "CICS";
                case 2:
                    return "MVS/ZOS/OS-390";
                case 3:
                    return "IMS";
                case 4:
                    return "OS/2";
                case 5:
                    return "Disk Operating System (DOS)";
                case 6:
                    return "UNIX/AIX";
                case 7:
                    return "Queue Manager";
                case 8:
                    return "OS/400";
                case 9:
                    return "Windows";
                case 10:
                    return "CICS VSE";
                case 11:
                    return "Windows Server";
                case 12:
                    return "MVS";
                case 13:
                    return "Guardian/NSK";
                case 14:
                    return "VOS";
                case 15:
                    return "Open TP1";
                case 18:
                    return "VM";
                case 19:
                    return "IMS Bridge";
                case 20:
                    return "XCF";
                case 21:
                    return "CICS Bridge";
                case 22:
                    return "Notes Agent";
                case 23:
                    return "TPF";
                case 25:
                    return "User";
                case 26:
                    return "Broker/QM Publish";
                case 28:
                    return "Java";
                case 29:
                    return "Distributed Queue Manager";
                case 30:
                    return "Channel Initiator";
                case 31:
                    return "WLM";
                case 32:
                    return "Batch";
                case 33:
                    return "RRS Batch";
                case 34:
                    return "SIB";
                case 65536:
                    return "User First";
                case 999999999:
                    return "User Last";
                default:
                    return "Other (" + input + ")";
            }
        }
    }]);

    module.registerFilter('ibmMQMessageReportFilter',[function()
    {
        // filter to return the IBM message report options for a given type
        return function(input)
        {
            switch (input)
            {
                case 16777216:
                    return "Exception";
                case 50331648:
                    return "Exception with Data";
                case 2097152:
                    return "Expiration";
                case 6291456:
                    return "Expiration with Data";
                case 14680064:
                    return "Expiration with Full Data";
                case 256:
                    return "Confirmation of Arrival";
                case 768:
                    return "Confirmation of Arrival with Data";
                case 1792:
                    return "Confirmation of Arrival with Full Data";
                case 2048:
                    return "Confirmation of Delivery";
                case 6144:
                    return "Confirmation of Delivery with Data";
                case 14336:
                    return "Confirmation of Delivery with Full Data";
                case 1:
                    return "Application Performed";
                case 2:
                    return "Application Not Performed";
                case 4:
                    return "Activity";
                case 0:
                    return "Default";
                case 64:
                    return "Pass Correlation Id";
                case 134217728:
                    return "Discard Message";
                case 16384:
                    return "Pass Discard and Expiry";
                default:
                    return input;
            }
        }
    }]);




});
