/*
 /// <summary>
 /// modules.admin.directives - mqaAdmCompanyList.js
 /// Administration Module Directive to List Companies Available for Editing
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 10/02/2017
 /// </summary>
 */

define(['modules/admin/module', 'lodash','bootstrap-validator'], function(module, lodash) {
  "use strict";

  module.registerDirective('mqaAdmCompanyList', ['$timeout','$log', '$state','uiSvc','adminDataSvc', "userSvc", function($timeout, $log, $state, uiSvc,adminDataSvc, userSvc)
  {
    return {
        restrict: 'E',
        templateUrl: "app/modules/admin/directives/mqaAdmCompanyList.tpl.html",
        replace: true,
        link: function($scope, form, attrs)
        {
            // initialize the grid
            $scope.dataGridOptions = {
                sortable: true,
                resizable: true,
                selectable: "row",
                noRecords: true,
                messages: {
                    noRecords: "No Records Available or Document Type Not Selected"
                },
                pageable: {
                    pageSizes: true
                },
                dataSource:
                    {
                        data: [],
                        pageSize: 10,
                        schema:
                            {
                                model:
                                    {
                                        id: "id",
                                        uid:"id",
                                        fields:
                                            {
                                                id: {type:"string"},
                                                name: {type:"string"},
                                                info: {type:"object"},
                                                activeDirectoryInfo: {type:"object"}
                                            }
                                    }
                            }
                    },

                columns: [
                    {
                        field: "id",
                        title: "Id",
                        hidden: true
                    },
                    {
                        field: 'name',
                        title: 'Name'
                    },
                    {
                        field: "email",
                        title: "Email Address",
                        template: function(dataItem)
                        {
                            if (dataItem.additional && dataItem.additional.email != "")
                                return dataItem.additional.email;
                            else
                                return "";
                        }
                    },
                    {
                        field: "phone",
                        title: "Phone",
                        template: function (dataItem) {
                            console.log(dataItem)
                            if (dataItem.additional && dataItem.additional.phone != "")
                                return dataItem.additional.phone;
                            else
                                return "";
                        }
                    },
                    {
                        field: "domains",
                        title: "Domains",
                        template: function(dataItem)
                        {
                            if (dataItem.active_directory_domains)
                            {
                                var html = "";
                                lodash.forEach(dataItem.active_directory_domains, function(item)
                                {
                                    if (item && item.domain)
                                        html += '<ul class="list-inline"><li>' + item.domain + '</li></ul>';
                                });
                                return html;
                            }
                            else
                                return "";
                        }
                    }

                ],
                dataBound: function(e)
                {
                    var grid = this;

                    uiSvc.dataBoundKendoGrid(grid, $scope.editRecord);
                }

            };
            $scope.data = [];

            $scope.initialize = function()
            {
                // routine to get the companies from the database
                adminDataSvc.readCompanies().then(function(result)
                {

                    let allowSwitch = userSvc.hasFeature( userSvc.commonFeatures.ADMIN_SWITCH_COMPANY);
                    if (!allowSwitch)
                        $scope.data = lodash.filter(result, {id: userSvc.getOrgInfo().companyId});
                    else
                        $scope.data = result;

                }).catch(function(err)
                {
                    $log.error("Unable to Retrieve Company List", err);
                })
            };

            $scope.insertRecord = function()
            {
                $state.go("app.admin.companywiz", {id: 0});
            };


            $scope.editRecord = function(model)
            {
                $state.go("app.admin.companywiz", {id: model.id});
            };
            $scope.initialize();
        }
    }
  }]);

});

