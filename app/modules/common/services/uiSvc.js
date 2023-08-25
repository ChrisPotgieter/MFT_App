/*
 /// <summary>
 /// app.modules.common.services - uiSvc.js
 /// Service to Manage General UI Functions
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 6/10/2015
 /// </summary>
 */
define(['modules/common/module', 'lodash', 'moment', 'ng-fileupload','angular-slideout', 'angular-couch-potato', 'appConfig', 'appCustomConfig','jquery'], function(module, lodash, moment, fileUpload, slideOut, couchpotato, appConfig, appCustomConfig, $)
{
    "use strict";
    moment().format();

    module.registerService('uiSvc',['$rootScope', '$state','$filter', '$templateCache','$q', '$window', '$uibModal', '$sce', '$timeout', '$interval', 'Upload', 'angularSlideOutPanel', 'apiSvc', 'cacheDataSvc', function($rootScope, $state, $filter, $templateCache, $q, $window, $uibModal, $sce, $timeout, $interval, Upload, slideOutSvc, apiSvc, cacheDataSvc)
    {
        const _this = this;
        _this.modes = {STANDARD: 0, DEBUG: 1, DEMO: 2};
        _this.formStates = {INDETERMINATE: 0, VALID: 1, INVALID: 99};
        _this.editModes = {UPDATE: 0, INSERT: 1, DELETE: 99};
        _this.backgroundProcessStates = {STARTED: 1, COMPLETED: 0, INPROGRESS: 2, INERROR: 999};
        _this.data = {lastPanelInstance: null}

        //<editor-fold desc="Page Management">
        _this.cancelTimers = function(timerObj)
        {
            // routine to cancel all timers in the given object
            if (!timerObj)
                return;
            lodash.forOwn(timerObj, function(timer)
            {
                if (timer != null)
                {
                    $interval.cancel(timer);
                    timer = null;
                }
            })
        };

        _this.scrollToTop = function()
        {
            // routine to scroll to the top of the page
            $timeout(function()
            {
                $window.scrollTo(0, 0);
            },200);
        };



        //</editor-fold>

        //<editor-fold desc="Form Functions">

        _this.getFormNoFeedbackIcons = function()
        {
            // routine to return form validate options for bootstrap validation
            return {
                feedbackIcons: {
                    validating: 'glyphicon glyphicon-refresh'
                }
            }
        };

        _this.getFormValidateOptions = function()
        {
            // routine to return form validate options for bootstrap validation
            return {
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                }
            }
        };

        //</editor-fold>


        //<editor-fold desc="Kendo Utilities">
        _this.excelExport = function(e)
        {
            // routine to manage the right align of footer types
            const rows = e.workbook.sheets[0].rows;

            for (let ri = 0; ri < rows.length; ri++) {
                const row = rows[ri];

                if (row.type === "group-footer" || row.type === "footer") {
                    for (let ci = 0; ci < row.cells.length; ci++) {
                        const cell = row.cells[ci];
                        if (cell.value && (cell.value.startsWith("<"))) {
                            // Use jQuery.fn.text to remove the HTML and get only the text
                            cell.value = $(cell.value).text();
                            // Set the alignment
                            cell.hAlign = "right";
                        }
                    }
                }
            }
        };

        _this.parseMetaGridData = function(data, customKey, customFunction)
        {
            // routine to parse the given meta-data set and format it for display
            if (!customKey)
                customKey = "Custom";
            let  records = [];
            lodash.forOwn(data, function(value, key)
            {
                let category = customKey;
                if (key.startsWith("mqa"))
                    category = appCustomConfig.product.name + " Extensions";
                let record = {key: key, value: value, category: category};
                if (customFunction != null)
                    customFunction(record);
                records.push(record);
            });
            return records;
        };

        _this.getKendoGridMetaConfigGridOptions = function(data, functions)
        {
            // routine to return standard kendo grid options for a meta-data config grid
            return {
                resizable: false,
                selectable: "row",
                filterable: {mode: "row"},
                columnMenu: false,
                noRecords: true,
                pageable: {
                    pageSizes: true
                },
                messages: {
                    noRecords: "No Records Available"
                },
                dataSource: {
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "rowId",
                            uid:"rowId"
                        }
                    }
                },
                columns: [
                    {field: "rowId", type: "string", tooltip: false, hidden: true},
                    {field: "code", type: "string", tooltip: true, title: data.subTitle,
                        filterable: {
                            cell: {
                                operator: "contains",
                                suggestionOperator: "contains",
                                showOperators: false,
                            }
                        }},
                    {field: "description", type: "string", tooltip: true, title: "Description", filterable: false},
                    {
                        field: "meta_count",
                        title: "Meta-Data Elements",
                        width: "150px",
                        filterable: false,
                        attributes:{style:"text-align:right;"},
                        headerAttributes:{style:"text-align:right;"},
                        template: function (dataItem)
                        {
                            return dataItem.jsonData.metadata.length;
                        }
                    }
                ],
                dataBound: function (e) {
                    const grid = this;
                    _this.dataBoundKendoGrid(grid, functions.editRecord);
                }
            };
        };

        _this.getKendoPageSizes = function(small)
        {
            // routine to return the page sizees for kendo grids based on the runmode
            if (appCustomConfig.runMode == _this.modes.DEMO)
                return [25,50,75, "all"];
            if (small == undefined)
                return [25,50,75, "all"];
            else
                return [10,15,20,"all"];
        };
        _this.displayKendoBoolean = function(value, opposite)
        {
            // routine to display a yes/no icon
            if (opposite != undefined && opposite == true)
            {
                return (value) ? "No": "Yes";
            }
            return (value) ? "Yes": "No";
        };
        _this.addKendoGridTooltip = function(filterName, grid, fieldName, position)
        {
            // routine to add a tooltip for the given field
            if (fieldName == null)
                fieldName = filterName;
            const element = $(grid.wrapper);
            element.kendoTooltip({
                filter: "." + filterName,
                position: position ? position : "left",
                beforeShow: function (e) {
                    const dataItem = grid.dataItem(e.target.closest("tr"));
                    let value = dataItem[fieldName];
                    if (!value) {
                        e.preventDefault();
                    }
                    if (typeof value === 'string' || value instanceof String) {
                        value = value.trim();
                        if (value == '')
                            e.preventDefault();
                    }
                },
                content: function(e)
                {
                    const dataItem = grid.dataItem(e.target.closest("tr"));
                    const content = dataItem[fieldName];
                    let widthContent = "<div class='scroll-body' slimscroll=\"{'height': '400', alwaysVisible: 'true', 'position': 'left', color: 'silver'}\">" + content + "</div>";
                    return widthContent;
                }
            }).data("kendoTooltip");
        };

        _this.addKendoTooltip = function(elementName, position)
        {
            // routine to add a tooltip for the given field
            const element = $(elementName);
            const tooltip = element.kendoTooltip({
                position: position ? position : "left",
                beforeShow: function (e) {
                    //e.preventDefault();
                },
            }).data("kendoTooltip");
        };



        _this.saveKendoGridState = function(grid)
        {
            // routine to return an object that contains the current state of the given grid
            const state = {
                columns: grid.columns,
                page: grid.dataSource.page(),
                pageSize: grid.dataSource.pageSize(),
                sort: grid.dataSource.sort(),
                filter: grid.dataSource.filter(),
                group: grid.dataSource.group()
            };
            return state;
        };

        _this.displayKendoLoader = function(target, visible)
        {
            const element = $(target);
            kendo.ui.progress.messages = {
                loading: "Processing..."
            };
            kendo.ui.progress(element, visible);
        };

        _this.loadKendoGridState = function(options, state)
        {
            // routine to update the given grid options with the given state before loading
            options.columns = state.columns;

            options.dataSource.page = state.page;
            options.dataSource.pageSize = state.pageSize;
            options.dataSource.sort = state.sort;
            options.dataSource.filter = state.filter;
            options.dataSource.group = state.group;
        };


        _this.drawKendoDiagramPoints = function(diagram, dataObject, drawFunction)
        {
            // routine to draw a kendo based point diagram
            diagram.clear();

            const dataviz = kendo.dataviz;
            const defaultConnectors = [{name: "top"}, {name: "bottom"}, {name: "right"}, {name: "left"}, {name: "auto"}];
            lodash.forEach(dataObject.shapes, function(item)
            {
                const shape = new dataviz.diagram.Shape({
                    id: item.id,
                    x: item.x,
                    y: item.y,
                    content: {text: item.description},
                    visual: drawFunction,
                    dataItem: item,
                    connectors: defaultConnectors.slice(0),
                    selectable: item.enabled,
                    editable: {connect: false}
                });

                diagram.addShape(shape);
            });
            lodash.forEach(dataObject.connections, function(item)
            {
                const source = diagram.getShapeById(item.from.id);
                const target = diagram.getShapeById(item.to.id);
                diagram.connect(source.getConnector($filter("kendoConnectorFilter")(item.from.direction)), target.getConnector($filter("kendoConnectorFilter")(item.to.direction)));
            });

        };

        _this.dataBoundKendoGantt = function(gantt, onclick)
        {
            // routine to link the click event and row color to a kendo gantt chart
            let i;
            let model;
            const tasks = gantt.element.find(".k-task");
            for (i = 0; i < tasks.length; i++)
            {
                model = gantt.dataSource.getByUid(tasks[i].attributes["data-uid"].value);
                if (model.custom && model.custom.style)
                    $(tasks[i]).addClass(model.custom.style);
                if (onclick != null)
                {
                    $(tasks[i]).dblclick(model, function (event)
                    {
                        onclick(event.data);
                    });
                }
            }

            // add to the rows
            const rows = gantt.element.find("tr[data-uid]").not('.k-treelist-group');
            for (i = 0; i < rows.length; i++)
            {
                model = gantt.dataSource.getByUid(rows[i].attributes["data-uid"].value);
                if (model.custom && model.custom.style)
                    $(rows[i]).addClass(model.custom.style);
                if (onclick != null)
                {
                    $(rows[i]).dblclick(model, function (event)
                    {
                        onclick(event.data);
                    });
                }
            }
        };

        _this.dataBoundKendoGrid = function(grid, onclick, fixedHeader, hasProgress, groupingClick)
        {
            // routine to link the click event and row color to a kendo grid
            let i;
            if (hasProgress)
            {
                grid.tbody.find(".progress").each(function ()
                {
                    const row = $(this).closest("tr");
                    const model = grid.dataItem(row);
                    let progress = 0;
                    if (model && model.progress_perc)
                        progress = model.progress_perc;

                    $(this).kendoProgressBar({

                        value: progress,
                        max: 100
                    });
                });
            };

            const gridData = grid.table.find("tr[data-uid]");
            for (i = 0; i < gridData.length; i++)
            {
                let model = grid.dataItem(gridData[i]);
                if (model.rowStyle)
                    $(gridData[i]).addClass(model.rowStyle);
                if (onclick != null)
                {
                    $(gridData[i]).dblclick(model, function (event)
                    {
                        onclick(event.data);
                    });
                }
            }
            if (fixedHeader)
            {
                // routine to allow for fix header as per https://docs.telerik.com/kendo-ui/knowledge-base/fixed-headers-grid
                let wrapper = grid.wrapper;
                let header = wrapper.find(".k-grid-header");
                function resizeFixed()
                {
                    let paddingRight = parseInt(header.css("padding-right"));
                    header.css("width", wrapper.width() - paddingRight);
                }
                function scrollFixed()
                {
                    let offset = $(this).scrollTop(),
                        tableOffsetTop = wrapper.offset().top,
                        tableOffsetBottom = tableOffsetTop + wrapper.height() - header.height();
                    if(offset < tableOffsetTop || offset > tableOffsetBottom) {
                        header.removeClass("grid-fixed-header");
                    } else if(offset >= tableOffsetTop && offset <= tableOffsetBottom && !header.hasClass("fixed")) {
                        header.addClass("grid-fixed-header");
                    }
                }
                resizeFixed();
                $(window).resize(resizeFixed);
                $(window).scroll(scrollFixed);
            }

            if (groupingClick != null)
            {
                // attach click events to all transaction grouping elements
                const groups = grid.table.find("a[id^='group_']");
                for (i = 0; i < groups.length; i++) {
                    const element = $(groups[i]);
                    element.click(function () {
                        groupingClick(this.id);
                    });
                }

            }
        };


        _this.parseKendoInfluxData = function(value)
        {
            // routine to parse influx time data for ui display
            lodash.forEach(value, function(item)
            {
                const time = $filter("localUTCEpochDateFilter")(item.time, "YYYY-MM-DD HH:mm:ss.SSS");
                item.time = $filter("kendoDateFilter")(time);
            });
            return value;
        };
        _this.formatKendoDate = function(dateValue)
        {
            // routine to format a given date for kendo grid view
            let valuestr = _this.formatDate(dateValue);
            const value = $filter("kendoDateFilter")(valuestr);
            return value;
        };


        //</editor-fold>


        //<editor-fold desc="General Functions">
        _this.getFileIOName = function(fullPath)
        {
            return fullPath.replace(/^.*[\\\/]/, '');
        };
        _this.getFileIOType = function(fullPath)
        {
            return fullPath.split('.').pop();
        };

        _this.attachValidator = function(controller, stateInfo, onValidationCallback, onFormValidationCallback)
        {
            // routine to attach the validator to a given controller
            const innerForm = $(document.getElementById(stateInfo.elementId));
            let icons = true;
            if (stateInfo.icons)
                icons = stateInfo.icons;
            let options = icons ? _this.getFormNoFeedbackIcons() : _this.getFormNoFeedbackIcons();
            let formOptions = lodash.merge({}, options, stateInfo.fields);
            const fv = innerForm.bootstrapValidator(formOptions);
            if (onValidationCallback != null) {
                fv.on("error.field.bv", function (e, data) {
                    onValidationCallback(true, e, data);
                }).on("success.field.bv", function(e, data)
                {
                    onValidationCallback(false, e, data);
                });
            }
            if (onFormValidationCallback != null) {
                fv.on("error.form.bv", function (e)
                {
                    onFormValidationCallback(true, e)
                })
                fv.on("success.form.bv", function (e)
                {
                    onFormValidationCallback(false, e)
                })

            }
            controller.form = innerForm.data('bootstrapValidator');
        };



        _this.performDateValidation = function(dateValue, fieldName)
        {
            // routine to perform a bootstrap validation of the given date
            if (!dateValue || !dateValue.startDate || !dateValue.endDate)
            {
                return {valid: false, message:"Please provide a " + fieldName + " Date"};
            }
            let startDate = moment(dateValue.startDate);
            let endDate = moment(dateValue.endDate);
            if (startDate.valueOf() > endDate.valueOf())
            {
                return {value: false, message: fieldName + " Start Date must be less than End Date"};
            }
            if (endDate.valueOf() < startDate.valueOf())
            {
                return {value: false, message: fieldName + " End Date must be greater than Start Date"};
            }
            return true;
        };

        _this.getProductInfo = function(baseProductInfo) {
            // routine to return the product information
            let returnObject = {version: appConfig.version, name:"ITM", environment:"DEFAULT"};
            if (appCustomConfig.product.name)
                returnObject.name = appCustomConfig.product.name;
            if (baseProductInfo)
            {
                if (baseProductInfo.licensing && baseProductInfo.licensing.product_name)
                    returnObject.name = baseProductInfo.licensing.product_name;
                if (baseProductInfo.tenant && baseProductInfo.tenant.name)
                    returnObject.environment = baseProductInfo.tenant.name;
            }
            returnObject.copyright = "© Copyright " + moment().format("YYYY") + " MQAttach Inc";
            return returnObject;
        };

        _this.calcMilliseconds = function(record)
        {
            // routine to calculate the no of milliseconds for the given record
            let returned  = 0;
            if (record.days)
                returned += parseInt(record.days) * 86400000;
            if (record.hours)
                returned += parseInt(record.hours) * 3600000;
            if (record.minutes)
                returned += parseInt(record.minutes) * 60000;
            if (record.seconds)
                returned += parseInt(record.seconds) * 1000;
            if (record.milli)
                returned += parseInt(record.milli);
            return returned;
        };

        _this.showDialog = function(record, controlOptions)
        {
            // routine to bring up the dialog
            const dialogData = record;
            const modalOptions = {
                animation: true,
                backdrop: 'static',
                templateUrl: controlOptions.templateUrl,
                controller: controlOptions.controller,
                controllerAs: 'vmDialog',
                resolve:
                    {
                        dialogData: function () {
                            return dialogData;
                        }
                    }
            };
            if (controlOptions.controllerAs)
                modalOptions.controllerAs = controlOptions.controllerAs;
            if (controlOptions.size)
                modalOptions.size = controlOptions.size;
            if (controlOptions.windowClass)
                modalOptions.windowClass = controlOptions.windowClass;
            if (controlOptions.resolve)
                modalOptions.resolve = controlOptions.resolve;
            let uibModalInstance = $uibModal.open(modalOptions);
            return uibModalInstance;
        };

        _this.showSlideOutDialog = function(record, controlOptions, closeExisting)
        {
            // routine to bring up the dialog in a slide out panel
            const dialogData = record;
            const modalOptions = {
                templateUrl: controlOptions.templateUrl,
                controllerAs: 'vmDialog',
                animation: true,
                backdrop: 'static',
                openOn: 'right',
                resolve:
                    {
                        dialogData: function () {
                            return dialogData;
                        }
                    }
            };
            if ((closeExisting || closeExisting == undefined)  && _this.data.lastPanelInstance != null)
            {
                _this.data.lastPanelInstance.dismiss("cancel");
                _this.data.lastPanelInstance = null;
            }
            if (!controlOptions.controllerAs)
                controlOptions.controllerAs = "vmDialog";
            if (controlOptions.windowClass)
                modalOptions.panelClass = controlOptions.windowClass;
            if (controlOptions.resolve)
                modalOptions.resolve = controlOptions.resolve;

            modalOptions.controller = String(controlOptions.controller)  + " as " + controlOptions.controllerAs;
            let panelInstance = slideOutSvc.open(modalOptions);
            if (_this.data.lastPanelInstance == null)
                _this.data.lastPanelInstance = panelInstance;
            return panelInstance;
        };



        _this.formatDate = function(dateValue)
        {
            // routine to format a given date for kendo grid view
            let value  = $filter("localUTCStringFilter")(dateValue);
            return value;
        };


        _this.roundNumber = function(num, places)
        {
            // routine to round to a given number to given number of places
            return +(Math.round(num + "e+" + places)  + "e-" + places);
        };

        _this.getUnixDate = function(dateStr)
        {
            // routine to return the unix date value for the given string
            if (dateStr.startsWith("Week"))
            {
                // convert the year and week number to a date
                const parts = dateStr.replace("Week ", "").split('-');
                return moment(parts[0]).add(parseInt(parts[1])-1, 'weeks').startOf('isoweek').format("x");
            }
            else
                return  moment(dateStr).format('x');

        };
        _this.getAttachmentStyle = function(evt)
        {
            // routine to get the attachment styling
            switch (evt.blobFormat) {
                case "text":
                case "txt":
                    evt.icon = "fa-file-text-o";
                    evt.foreground = "txt-color-blue";
                    evt.background = "bg-color-blue";
                    break;
                case "pdf":
                    evt.icon = "fa-file-pdf-o";
                    evt.foreground = "txt-color-red";
                    evt.background = "bg-color-red";
                    break;
                case "jpeg":
                    evt.icon = "fa-file-image-o";
                    evt.foreground = "txt-color-orange";
                    evt.background = "bg-color-orange";
                    break;
                case "xml":
                    evt.icon = "fa-file-code-o";
                    evt.foreground = "txt-color-blueDark";
                    evt.background = "bg-color-blueDark";
                    break;
                default:
                    evt.icon = "fa-file";
                    evt.foreground = "txt-color-muted";
                    evt.background = "bg-color-muted";
                    break;
            }
        };
        _this.setupBootstrapValidator = function(formElement, options, validCallback)
        {
            // routine to setup the bootstrap validator on the given form with  the given options and a callback when the form is successful or not
            const fv = formElement.bootstrapValidator(options).on('error.field.bv', function (e) {
                validCallback(true);
            }).on("success.field.bv", function (e, data) {
                validCallback(false);
            });
            return formElement.data('bootstrapValidator');
        };

        _this.openURL = function(url)
        {
            // open to open the given url
            // TODO: Check this
            $window.open(url);
        };



        _this.refreshActiveGrid = function (data)
        {
            // routine to only show active records
            // TODO: Remove this once the ITX System has used a common meta-data system
            const active = lodash.filter(data, function (record) {
                return (record.recordStatus != _this.editModes.DELETE);
            });
            return active;
        };

        _this.openBlob = function(blob)
        {
            // routine to open a given blob object in a new window
            const fileURL = URL.createObjectURL(blob);
            const trustedUrl = $sce.trustAsResourceUrl(fileURL);
            $window.open(trustedUrl);
        };
        //</editor-fold>


        //<editor-fold desc="Theme & Color Management">
        _this.buildSplash = function()
        {
            // determine the splash screen information
            _this.removeTheme();
            let returnObj = {splash:{}, buttonClass:null};
            let rnd = Math.floor((Math.random() * appCustomConfig.splashScreens.length));

            returnObj.splash = appCustomConfig.splashScreens[rnd];
            if (appCustomConfig.buttonClass == undefined)
                appCustomConfig.buttonClass = "btn-primary";
            returnObj.buttonClass = appCustomConfig.buttonClass;
            if (returnObj.splash.buttonClass)
                returnObj.buttonClass = _this.model.splash.buttonClass;

            // add the product name
            returnObj.product = _this.getProductInfo(cacheDataSvc.getProductEnvironment());
            return returnObj;
        };

        _this.getTheme = function()
        {
            // routine to return the current them in use by the user
            const skin = localStorage.getItem('sm-skin') || appConfig.smartSkin;
            const foundSkin = lodash.find(appConfig.skins, {name: skin});
            return foundSkin;
        };

        _this.removeTheme = function()
        {
            // routine to remove the theme from the current page (used by the login/lockout screens)
            const defaultSkin = _.find(appConfig.skins, {name: appConfig.smartSkin});
            const root = $('body');
            root.removeClass(_.map(appConfig.skins, 'name').join(' '));
            root.addClass(defaultSkin.name);
            $("#logo img").attr('src', defaultSkin.logo);
        };


        _this.shadeBlend = function (p,c0,c1)
        {
            // routine to return a new hex color based on the given shade percentage
            //http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
            const n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
            if(c0.length>7){
                var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
                return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
            }else{
                var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
                return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
            }
        };
        //</editor-fold>

        //<editor-fold desc="Route Management">

        _this.updateStateModule = function(statePrefix, moduleName, code)
        {
            // routine to update all states with the correct module name
            /*
             lodash.chain($state.get()).filter(function(state)
             {
             return state.name.startsWith(statePrefix);
             }).forEach(function(state)
             {
             if (state.data && state.data.module)
             state.data.module = moduleName;
             }).value();
             */
            const filteredStates = lodash.filter($state.get(), function (state) {
                return state.name.startsWith(statePrefix);
            });
            lodash.forEach(filteredStates, function(state)
            {
                if (state.data && state.data.module)
                {
                    state.data.module = moduleName;
                    state.data.module_id = code;
                }
            });
        };

        _this.createViewStates = function(modulePrefix, $stateProvider, stateArray)
        {
            // routine to create states in the ui-router with the specified module prefix
            lodash.forEach(stateArray, function(state)
            {
                $stateProvider.state(modulePrefix + "." + state.id, lodash.extend({}, state.state));
            });
        };
        //</editor-fold>

        //<editor-fold desc="Popup and Message Box Functions">

        _this.showSmallPopup = function(title, message, timeout, color, icon)
        {
            // routine to show a small popup
            if (timeout == undefined || timeout == null || timeout < 0)
                timeout = 3000;
            if (!message)
                message = "Your changes have been saved successfully";
            if (!title)
                title = "Success !";
            if (!color)
                color = "#739E73";
            if (!icon)
                icon = "fa-check";
            const options = {
                title: title,
                content: message,
                color: color,
                icon: "fa " + icon
            };
            if (timeout > 0)
                options.timeout = timeout;
            $.smallBox(options);
        };
    
        _this.showExtraSmallPopup = function(title, message, timeout, color, icon)
        {
            // routine to show am extra small popup
            if (timeout == undefined || timeout == null || timeout < 0)
                timeout = 3000;
            if (!message)
                message = "Your changes have been saved successfully";
            if (!title)
                title = "Success !";
            if (!color)
                color = "#739E73";
            if (!icon)
                icon = "fa-check";
            const options = {
                title: title,
                content: message,
                color: color,
                iconSmall: "fa " + icon
            };

            if (timeout > 0)
                options.timeout = timeout;
            $.smallBox(options);
        };

        _this.showBigBox = function(title, message, timeout, color, icon)
        {
            // routine to show a big box
            if (timeout == undefined || timeout == null || timeout < 0)
                timeout = 3000;
            if (!message)
                message = "Your changes have been saved successfully";
            if (!title)
                title = "Success !";
            if (!color)
                color = "#739E73";
            if (!icon)
                icon = "fa-check";
            const options = {

                title: title,
                content: message,
                color: color,
                icon: "fa " + icon
            };
            if (timeout > 0)
                options.timeout = timeout;
            $.bigBox(options);
        };

        _this.clearBigBox = function()
        {
            // routine to clear any big boxes on the screen
            $('#divbigBoxes').empty();
        };
        _this.clearSmallBox = function()
        {
            // routine to clear any big boxes on the screen
            $('#divSmallBoxes').empty();
            $('#divMiniIcons').empty();
        };


        _this.showError = function(title, message)
        {
            // routine to an error
            _this.showBigBox(title, message, 6000, "#C46A69", "fa-warning shake animated");
        };

        _this.showSmartAdminBox = function(title, message, buttons, buttonCallback, color, icon)
        {
            let htmlTitle = title;
            if (icon)
                htmlTitle = "<i class='fa " + icon + " style='color:" + color + "'></i>" + title;
            $.SmartMessageBox({
                title: htmlTitle,
                content: message,
                buttons: buttons
            }, buttonCallback);
        };

        //</editor-fold>

        //<editor-fold desc="Long Running Progress and Upload Management">
        _this.requestFileUpload = function(data)
        {
            // TODO: See if this is still needed
            // open the dialog that will initiate a upload a file
            const modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/modules/common/partials/progress-dialog.tpl.html',
                controller: 'fileUploadCtrl',
                controllerAs: 'vmDialog',
                resolve:
                    {
                        dialogData: function () {
                            return data;
                        }
                    }
            });
            modalInstance.result.then(function (result)
            {

                if (data.resultFunction != null)
                    data.resultFunction(result);
            }, function ()
            {
            });
        };

        _this.handleFileUpload = function(dialog, metaData)
        {
            // routine to upload the file to the server
            dialog.stopTimer();
            dialog.progressInfo.showProgress = true;
            if (metaData.uploadFile && metaData.uploadFile.$error)
                return dialog.showUploadError(metaData.uploadFile.$error);

            // formulate the upload request
            const uploadRequest = {file: metaData.uploadFile};
            uploadRequest.metaData = metaData;

            dialog.progressInfo.perc = 0;
            dialog.progressInfo.icon = "fa fa-upload";
            const promise = Upload.upload({url: apiSvc.baseUrl + '/upload/uploadTemp', data: uploadRequest});

            // upload was successful, prepare the import
            promise.then(function(successEvent)
            {
                // successful upload - get the result
                dialog.uploadComplete(successEvent);
            }, function(failureEvent)
            {
                return dialog.showUploadError(failureEvent.data);
            }, function(progressEvent)
            {
                // update the progress bar
                dialog.progressInfo.perc = Math.min(100, parseInt(100.0 * progressEvent.loaded / progressEvent.total)) + "%";
                dialog.progressInfo.description = dialog.progressInfo.perc + " Complete";

            });
        };
        _this.showUploadError = function(dialog, error)
        {
            // there was an error uploading the file
            dialog.progressInfo.icon = "fa fa-times";
            dialog.progressInfo.description = "Upload Failed " + error;
        };
        _this.startLongRunTimer = function(dialog, time)
        {
            // routine to start the long run timer
            const inval = time == null ? 3 : time;
            if (dialog.timer == null)
                dialog.timer = $interval(dialog.refreshProgress, inval * 1000);

        };

        _this.stopLongRunTimer = function(dialog)
        {
            // routine to stop the long run timer
            if (dialog.timer)
            {
                const cancelled = $interval.cancel(dialog.timer);
                if (cancelled)
                    dialog.timer = null;
            }
        };


        _this.updateLongRunProgress = function (model, dialog) 
        {
            // routine to handle long run progress screen updates
            const status = model.status;
            dialog.progressInfo.lines = model.info.lines;
            if (dialog.progressInfo.onProgressUpdate != null)
                dialog.progressInfo.onProgressUpdate(model);

            // check for initialization
            if (status != _this.backgroundProcessStates.STARTED && !dialog.progressInfo.initialized)
            {
                model.status = _this.backgroundProcessStates.STARTED;
                dialog.updateProgress(model);
                model.status = status;
            }

            if (status == _this.backgroundProcessStates.COMPLETED)
            {
                dialog.modalResult = model.info.result;
                dialog.progressInfo.icon = "fa fa-check";
                dialog.progressInfo.description = "Complete";
                dialog.progressInfo.title = model.title;
                dialog.progressInfo.perc = "100%";
                dialog.progressInfo.allowOK = true;
                dialog.progressInfo.allowCancel = true;
                dialog.stopTimer();
                if (dialog.progressInfo.onProgressUpdateComplete != null)
                    dialog.progressInfo.onProgressUpdateComplete(status);
                return;
            }
            if (status == _this.backgroundProcessStates.STARTED)
            {
                dialog.progressInfo.showLineDisplay = true;
                dialog.progressInfo.icon = "fa fa-clock-o";
                dialog.progressInfo.description = model.description;
                dialog.progressInfo.title = model.title;
                dialog.progressInfo.perc = model.progress + "%";
                dialog.progressInfo.allowOK = false;
                dialog.progressInfo.allowCancel = false;
                dialog.progressInfo.lineDisplay = true;
                dialog.progressInfo.initialized = true;
                if (dialog.progressInfo.onProgressUpdateComplete != null)
                    dialog.progressInfo.onProgressUpdateComplete(status);
                return;
            }

            if (status === _this.backgroundProcessStates.INPROGRESS)
            {
                dialog.progressInfo.icon = "fa fa-cog";
                dialog.progressInfo.title = model.title;
                dialog.progressInfo.description = model.description;
                dialog.progressInfo.perc = model.progress + "%";
                if (dialog.progressInfo.onProgressUpdateComplete != null)
                    dialog.progressInfo.onProgressUpdateComplete(status);
                return;
            }
            if (status === _this.backgroundProcessStates.INERROR)
            {
                dialog.progressInfo.icon = "fa fa-times";
                dialog.progressInfo.allowOK = true;
                dialog.progressInfo.allowCancel = true;
                dialog.progressInfo.title = model.title;
                dialog.progressInfo.description = model.description;
                dialog.progressInfo.perc = "100%";
                dialog.progressInfo.lines.push("Unable to Process " + model.title);
                dialog.stopTimer();
                if (dialog.progressInfo.onProgressUpdateComplete != null)
                    dialog.progressInfo.onProgressUpdateComplete(status);
                return;
            }


        };
        //</editor-fold>

        //<editor-fold desc="Grid Editing Functions">
        _this.initializeGridEditor = function(callerObj, dataObj, lastIdObj, functions)
        {
            if (callerObj.functions == null)
                callerObj.functions = {};
            callerObj.functions.initializeRows = function ()
            {
                // routine to initialize the row Id's upon load of this directive
                lastIdObj = 0;
                lodash.forEach(dataObj, function(item, index)
                {
                    item.rowId = index;
                    item.rowStyle = null;
                    item.recordStatus = _this.editModes.UPDATE;
                    lastIdObj++;
                });
            };

            callerObj.functions.insertRecord = function()
            {
                // routine to allow users to insert records
                let row = functions.rowInitialize();
                callerObj.functions.showEditRecordDialog(row);
            };

            callerObj.functions.editRecord = function(record)
            {
                // routine to allow users to edit existing records
                callerObj.functions.showEditRecordDialog(record);
            };

            callerObj.functions.showEditRecordDialog = function(record)
            {
                // routine to bring up the editing dialog
                let dialogData = {};
                dialogData.row = angular.copy(record);
                dialogData.rows = dataObj;
                let controlOptions = functions.showRecord(dialogData, record);
                let modalInstance = _this.showDialog(dialogData, controlOptions);
                modalInstance.result.then(function (result)
                {
                    // refresh the data
                    let type = result.recordStatus;
                    if (type == _this.editModes.INSERT)
                    {
                        // insert the column
                        lastIdObj++;
                        result.rowId = lastIdObj;
                        result.recordStatus = _this.editModes.UPDATE;
                        dataObj.push(result);

                    }
                    if (type == _this.editModes.DELETE)
                    {

                        // remove the entry
                        let entry = {rowId: result.rowId};
                        lodash.remove(dataObj, entry);
                    }
                    if (type == _this.editModes.UPDATE)
                    {
                        // update the record
                        const recordIndex = lodash.findIndex(dataObj, {rowId: result.rowId});
                        if (recordIndex >= -1)
                            dataObj.splice(recordIndex, 1, result);
                    }

                    // update the overall record status
                    if (!result.recordStatus)
                        result.recordStatus = _this.editModes.UPDATE;//"Update"
                    functions.refresh();

                    // close the dialog
                    modalInstance.close();
                }, function ()
                { });
            };

        }


        //</editor-fold>



        // scroll to the top on a url change
        $rootScope.$on("$locationChangeSuccess", function()
        {
            _this.scrollToTop();
        });

    }]);
});


