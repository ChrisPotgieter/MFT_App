mqa-/*
 /// <summary>
 /// modules.common.directives.tables - mqaDataTable.js
 /// Generic Jquery Datatable Directive - to display JQuery DataTables in a consistent way
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 07/12/2016
 /// </summary>
 */
define(['modules/common/module', 'lodash'], function (module, lodash) {

    'use strict';

    module.registerDirective('mqaDataTable', ['$compile','$templateRequest', 'DTOptionsBuilder', 'DTColumnBuilder', function ($compile, $templateRequest, DTOptionsBuilder, DTColumnBuilder) {
        return {
            restrict: 'E',
            scope:
            {
                itemTemplateName: '@',
                headerTemplateName:'@',
                headers: '=',
                title: '@',
                rows: '=',
                dtInstance:'=',
                ondrill:'&?',
                dtColumns:'=?',
                dtOptions:'=?',
                filterable: '@?'
            },
            replace: true,
            controller: function($scope)
            {
                // we need to do this in a controller function as this executes before the angular-datatables controller which is where angular-datatables does
                // its initialization

                $scope.ngDrillRecord =   function(data)
                {
                    // routine to handle the drilling on the grid row (angular-style via ng-click on the template)
                    if (!$scope.ondrill)
                        return;
                    $scope.ondrill()(data);
                };


                if (!$scope.dtOptions)
                {
                    var languageOptions = {"sSearch": "<span class='input-group-addon input-md'><i class='glyphicon glyphicon-search'></i></span></span>","sSearchPlaceholder": "Enter Criteria...","sLengthMenu": "Display _MENU_ records per page",
                        "sEmptyTable": "No Data Available","sInfo": "Showing _START_ to _END_ of _TOTAL_ records", "sInfoEmpty": "Showing 0 to 0 of 0 records","sInfoFiltered": "(filtered from _MAX_ total records)"};
                    $scope.dtOptions = DTOptionsBuilder.newOptions()
                        .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-12 hidden-xs'l>r>" +
                            "t" +
                            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
                        .withLanguage(languageOptions)
                        .withPaginationType('full_numbers')
                        .withOption('rowCallback', $scope.dtDrillRecord)
                        .withBootstrap();
                }

                // get the columns or set default columns based on the headers
                if (!$scope.dtColumns)
                {
                    $scope.dtColumns = [];
                    lodash.forEach($scope.headers, function(header)
                    {
                        $scope.dtColumns.push(DTColumnBuilder.newColumn(header))
                    })
                }

                var updateData = function()
                {
					$scope.data = $scope.rows;

                };
                $scope.$watchCollection("rows", function(newValue, oldValue)
                {
                    if (!(newValue === oldValue))
					{
						if ($scope.dtInstance && $scope.dtInstance.DataTable)
							updateData();
					}
                });
                updateData();
            },
            link: function($scope, element, attributes)
            {
                // update the element html by taking the base template and appending the item template to it
                // the compile will force the directive to render which will force angular-datatables to re-render
                $templateRequest("app/modules/common/directives/tables/mqaDataTable.tpl.html").then(function(baseHTML)
                {
                    $templateRequest($scope.headerTemplateName).then(function(headerHTML)
                    {
                        // update the header
                        var queryElement = $(baseHTML);
                        queryElement.find('thead').first().empty().append(headerHTML);


                        // update the item template
                        $templateRequest($scope.itemTemplateName).then(function(itemHTML)
                        {
                            queryElement.find('tbody > tr').first().empty().append(itemHTML);
                            element.html(queryElement.html());
                            $compile(element.contents())($scope);

                            // Apply the filter
                            if ($scope.filterable)
                            {
                                element.on('keyup change', 'thead th input[type=text]', function () {

                                    $scope.dtInstance.DataTable
                                        .column($(this).parent().index() + ':visible')
                                        .search(this.value)
                                        .draw();
                                });
                            }
                        });
                    });

                }).catch(function(err)
                {
                    throw err;
                });
            }
        }
    }]);
});

