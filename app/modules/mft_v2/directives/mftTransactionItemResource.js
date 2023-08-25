/*
 /// <summary>
 /// modules.mft_v2.directives - mftTransactionItemResource
 /// MFT Transaction Item Resource directive to display Correct Template for the given Item Resource
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 29/09/2020
 /// </summary>
 */
define(['modules/mft_v2/module'], function (module) {
    "use strict";

    module.registerDirective('mftTransactionItemResource', ['$compile', 'mftv2DataSvc', 'cacheDataSvc', function ($compile, mftv2DataSvc, cacheDataSvc) {
        return {
            restrict: 'EA',
            scope:
            {
                item: '=',
            },
            compile: function (element) {
                return {
                    pre: function preLink($scope, element, attributes) {

                        // work out the item to pass to the compile directive
                        let templateId = "mftTransactionDetailCommon";
                        let templateName = "transaction-detail-item-common.tpl.html";
                        $scope.item.description = mftv2DataSvc.getStorageType($scope.item.type);
                        $scope.item.icon = "fa fa-file-text";
                        switch ($scope.item.type) {
                            case 0:
                                templateId = "mftTransactionDetailFile";
                                templateName = "transaction-detail-item-file.tpl.html";
                                break;
                            case 1:
                                $scope.item.icon = "fa fa-stack-overflow bigIcon";
                                templateId = "mftTransactionDetailQueue";
                                templateName = "transaction-detail-item-queue.tpl.html";
                                break;
                            case 4:
                                $scope.item.icon = "icon-nginx-alt";
                                templateId = "mftTransactionDetailDataset";
                                templateName = "transaction-detail-item-dataset.tpl.html";
                                break;

                            default:
                                templateId = "mftTransactionDetailCommon";
                                templateName = "transaction-detail-item-common.tpl.html";
                                break;
                        }
                        cacheDataSvc.loadTemplate("app/modules/mft_v2/partials/" + templateName, templateId).then(function (html) {
                            element.html(html);
                            $compile(element.contents())($scope);
                        });
                    }
                }
            }

        }
    }]);
});
