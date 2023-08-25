define(['layout/module', 'lodash', 'kendo.all.min','appConfig','notification'], function (module, _, kendo,appConfig) {

    'use strict';

    module.registerDirective('demoStates', function ($rootScope) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/smartadmin/modules/layout/directives/demo/demo-states.tpl.html',
            scope: true,
                    link: function (scope, element, attributes)
                    {
                        element.parent().css({
                            position: 'relative'
                        });

                        element.on('click', '#demo-setting', function () {
                            element.toggleClass('activate')
                        })
                    },
            controller: function ($scope) {
                var $root = $('body');

                $scope.$watch('fixedHeader', function (fixedHeader) {
                    localStorage.setItem('sm-fixed-header', fixedHeader);
                    $root.toggleClass('fixed-header', fixedHeader);
                    if (fixedHeader == false) {
                        $scope.fixedRibbon = false;
                        $scope.fixedNavigation = false;
                    }
                });

                $scope.applyKendoTheme = function(skinName, animate)
                {
                    // routine to apply the kendo them to this document
                    var doc = document,
                        kendoLinks = $("link[href*='kendo.']"),
                        commonLink = kendoLinks.filter("[href*='kendo.common']"),
                        skinLink = kendoLinks.filter(":not([href*='kendo.common'])"),
                        href = location.href,
                        skinRegex = /kendo\.\w+(\.min)?\.css/i,
                        extension = skinLink.attr("rel") === "stylesheet" ? ".css" : ".less",
                        newSkinUrl = skinLink.attr("href").replace(skinRegex, "kendo." + skinName + "$1" + extension);

                    function preloadStylesheet(file, callback)
                    {
                        var element = $("<link rel='stylesheet' href='" + file + "' \/>").appendTo("head");

                        setTimeout(function () {
                            callback();
                            element.remove();
                        }, 100);
                    }

                    function replaceTheme()
                    {
                        var browser = kendo.support.browser,
                            oldSkinName = $(doc).data("kendoSkin"),
                            newLink;

                        if (browser.msie && browser.version < 10) {
                            newLink = doc.createStyleSheet(newSkinUrl);
                        } else {
                            newLink = skinLink.eq(0).clone().attr("href", newSkinUrl);
                            newLink.insertBefore(skinLink[0]);
                        }

                        skinLink.remove();

                        $(doc.documentElement).removeClass("k-" + oldSkinName).addClass("k-" + skinName);
                    }

                    if (animate) {
                        preloadStylesheet(newSkinUrl, replaceTheme);
                    } else {
                        replaceTheme();
                    }
                };


                $scope.$watch('fixedNavigation', function (fixedNavigation) {
                    localStorage.setItem('sm-fixed-navigation', fixedNavigation);
                    $root.toggleClass('fixed-navigation', fixedNavigation);
                    if (fixedNavigation) {
                        $scope.insideContainer = false;
                        $scope.fixedHeader = true;
                    } else {
                        $scope.fixedRibbon = false;
                    }
                });


                $scope.$watch('fixedRibbon', function (fixedRibbon) {
                    localStorage.setItem('sm-fixed-ribbon', fixedRibbon);
                    $root.toggleClass('fixed-ribbon', fixedRibbon);
                    if (fixedRibbon) {
                        $scope.fixedHeader = true;
                        $scope.fixedNavigation = true;
                        $scope.insideContainer = false;
                    }
                });

                $scope.$watch('fixedPageFooter', function (fixedPageFooter) {
                    localStorage.setItem('sm-fixed-page-footer', fixedPageFooter);
                    $root.toggleClass('fixed-page-footer', fixedPageFooter);
                });

                $scope.$watch('insideContainer', function (insideContainer) {
                    localStorage.setItem('sm-inside-container', insideContainer);
                    $root.toggleClass('container', insideContainer);
                    if (insideContainer) {
                        $scope.fixedRibbon = false;
                        $scope.fixedNavigation = false;
                    }
                });

                $scope.$watch('rtl', function (rtl) {
                    localStorage.setItem('sm-rtl', rtl);
                    $root.toggleClass('smart-rtl', rtl);
                });

                $scope.$watch('menuOnTop', function (menuOnTop) {
                    $rootScope.$broadcast('$smartLayoutMenuOnTop', menuOnTop);
                    localStorage.setItem('sm-menu-on-top', menuOnTop);
                    $root.toggleClass('menu-on-top', menuOnTop);

                    if(menuOnTop)$root.removeClass('minified');
                });

                $scope.$watch('colorblindFriendly', function (colorblindFriendly) {
                    localStorage.setItem('sm-colorblind-friendly', colorblindFriendly);
                    $root.toggleClass('colorblind-friendly', colorblindFriendly);
                });


                $scope.fixedHeader = localStorage.getItem('sm-fixed-header') == 'true';
                $scope.fixedNavigation = localStorage.getItem('sm-fixed-navigation') == 'true';
                $scope.fixedRibbon = localStorage.getItem('sm-fixed-ribbon') == 'true';
                $scope.fixedPageFooter = localStorage.getItem('sm-fixed-page-footer') == 'true';
                $scope.insideContainer = localStorage.getItem('sm-inside-container') == 'true';
                $scope.rtl = localStorage.getItem('sm-rtl') == 'true';
                if (!localStorage.getItem("sm-menu-on-top"))
                    localStorage.setItem('sm-menu-on-top', true);
                $scope.menuOnTop = localStorage.getItem('sm-menu-on-top') == 'true' || $root.hasClass('menu-on-top');
                $scope.colorblindFriendly = localStorage.getItem('sm-colorblind-friendly') == 'true';


                $scope.skins = appConfig.skins;


                $scope.smartSkin = localStorage.getItem('sm-skin') || appConfig.smartSkin;


                $scope.setSkin = function (skin) {
                    $scope.smartSkin = skin.name;
                    $root.removeClass(_.map($scope.skins, 'name').join(' '));
                    $root.addClass(skin.name);
                    localStorage.setItem('sm-skin', skin.name);
                    $("#logo img").attr('src', skin.logo);

                    // update the kendo theme
                    if (skin.kendo)
                        $scope.applyKendoTheme(skin.kendo, true);

                };


                if($scope.smartSkin != "smart-style-0"){
                    $scope.setSkin(_.find($scope.skins, {name: $scope.smartSkin}))
                }


                $scope.factoryReset = function () {
                    $.SmartMessageBox({
                        title: "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
                        content: "Would you like to RESET all your saved widgets and clear LocalStorage?1",
                        buttons: '[No][Yes]'
                    }, function (ButtonPressed) {
                        if (ButtonPressed == "Yes" && localStorage) {
                            localStorage.clear();
                            location.reload()
                        }
                    });
                }
            }
        }
    });
});
