/*
 /// <summary>
 /// app.modules.transaction-reporting.controllers - transactionDetailCtrl.js
 /// Base Transaction Detail Controller
 /// Abstract Controller that is the parent of all Transaction Detail Controllers
 /// This controller does the heavy lifting and manages most of the display interaction
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 5/31/2015
 /// </summary>
 */
define(['modules/transaction-reporting/module', 'moment', 'lodash'], function (module, moment, lodash) {

	moment().format();
	"use strict";

	module.registerController('transactionDetailCtrl', ['$scope', '$log', '$state','$stateParams', '$timeout', '$location','$filter','uiSvc', 'apiSvc', 'apiProvider','cacheDataSvc','transactionReportingSvc', 'speDataSvc', 'iibv2DataSvc', function ($scope, $log, $state, $stateParams, $timeout, $location, $filter, uiSvc, apiSvc, apiProvider, cacheDataSvc, transactionReportingSvc, speDataSvc, iibv2DataSvc)
	{

		// setup the panes
		$scope.panes = [];
		$scope.panes.push({collapsible: true, resizable: true,  scrollable: false});
		$scope.panes.push({collapsible: false, resizable: true, scrollable: false});
		$scope.panes.push({collapsible: true, resizable: true,  scrollable: false});

		$scope.orientation = "horizontal";

		// initialize variables
		$scope.navigation = undefined;
		$scope.initPanesView = undefined;

		$scope.data = undefined;
		$scope.transactionType = 0; // 0 - MFT, 1 - IIB, 2 - SPE, 101 = IIB Prolifics
		$scope.showDiagram = false;
		$scope.tabs = [];
		$scope.tree = [];
		$scope.widget = {title: "Transaction Details", icon: "fa fa-edit txt-color-darken"};

		$scope.$on("kendoWidgetCreated", function(event, widget)
		{
			// once the kendo widgets are created
			if ($scope.splitter == widget)
				$scope.initPanes();

		});

		$scope.initPanes = function()
		{
			// update the pane
			var panes = $scope.splitter.element.children(".k-pane");
			var isTransactionView = $state.current.name.indexOf('baseview') > 0;
			if (isTransactionView)
			{
				// when its just the transaction view - remove the tree
				$scope.splitter.collapse(panes[0]);
				$scope.splitter.size(panes[0], "0px");
				$scope.splitter.size(panes[1], "72%");
				$scope.splitter.size(panes[2], "26%");
			}
			else
			{
				// expand the tree
				$scope.splitter.expand(panes[0]);
				$scope.splitter.size(panes[0], "15%");
				$scope.splitter.size(panes[1], "57%");
				$scope.splitter.size(panes[2], "28%");
			}

			// broadcast
            $timeout(function()
            {
            	$scope.splitter.resize(true);
                $scope.$broadcast('panes_init', panes);
            },500);

        };

		var parseTreeData = function(treeObject)
		{
			// routine to parse the navigation tree for display filtering
			if (treeObject.subTitle)
				treeObject.subTitle = $filter("localEpochDateFilter")(treeObject.subTitle, "dddd, MMMM DD YYYY, h:mm:ss:SSS a");
			treeObject.selected = (treeObject.id && treeObject.id == $scope.data.baseTransaction.transactionId);
			if (treeObject.nodes && treeObject.nodes.length)
			{
				angular.forEach(treeObject.nodes, function (child){
					parseTreeData(child);
				});
			}
			return treeObject;
		};

        $scope.initializeTabs = function()
        {

            // routine to initialize the tab information
            $scope.transactionType = $scope.data.baseTransaction.mqaModule;
            $scope.widget.style = {};
            transactionReportingSvc.updateTransactionViewModel($scope.data.baseTransaction);


            // build the new tabs
            var defaultDetail;
            switch ($scope.transactionType)
            {
				case 0:
					defaultDetail = "mft_v2";
					break;
                case 1:
                    defaultDetail = "iib"; // Core IIB
                    break;
                case 101:
                    defaultDetail = "broker"; // IIB MFT
                    break;
                case 102:
				case 103:
                    defaultDetail = "iib_v2"; // IIB V2
                    break;
                case 2:
                    defaultDetail = "spe";
                    break;
				case 3:
					defaultDetail = "boomi";	// BOOMI
					break;

            }
            $scope.widget.title = "Transaction Id - " + $scope.data.baseTransaction.transactionId;
            $scope.tabs = [];
            $scope.tabs.push({ title: 'Transaction', icon: 'fa-bar-chart-o', state: '.baseview.' + defaultDetail, activate:'**.baseview.**'});

            if ($scope.data.baseTransaction && $scope.data.baseTransaction.jobId)
                $scope.tabs.push({title:'Job', icon:'fa-bar-chart-o', state: '.jobview.' + defaultDetail, activate:'**.jobview.**'});

            /*
            if ($scope.data.baseTransaction && $scope.data.baseTransaction.docId && $scope.data.baseTransaction.docType)
                $scope.tabs.push({title:'Document', icon:'fa-bar-chart-o', state: '.docview.' + defaultDetail, activate:'**.docview.**'});

             */
        };

        var applyNavigation = function()
        {
            // refresh the tree
            if (!$scope.navigation)
                return;

            $scope.navigation();
        };

        var initializeMongoView = function()
		{
			// routine to create the base transaction based on the module
			if ($scope.data.module == 0)
			{
				$scope.$broadcast("mft_v2_changed");
			}
			if ($scope.data.module == 2)
			{
				$scope.$broadcast('spe-changed');
			}
			if ($scope.data.module == 102 || $scope.data.module == 103)
			{
				$scope.$broadcast("iib_v2_changed");
			}
			if ($scope.data.module == 3)
			{
				$scope.$broadcast("boomi_changed");
			}
			applyNavigation();
			return;
		};

		$scope.changeTransaction = function(result)
		{
			// routine to update the scope when the transaction changes
			$scope.data = result;

			// determine the base transaction
			$scope.showDiagram = false;
			$scope.data.documentModel = $scope.data.baseTransaction == null;
			if ($scope.data.baseTransaction == null)
			{
				// this is a mongo transaction so initialize it and return
                initializeMongoView();
                return;
            }
			else
			{
				$scope.showDiagram = ($scope.transactionType == 0 || $scope.transactionType == 101);
			}
            $scope.initializeTabs();


			// check for a meta-data attachment
			if ($scope.data.metaData)
			{
				var attachment = lodash.find($scope.data.metaData, {type: 1, key: 'aPayloadURL'});
				if (attachment != null)
				{
					$scope.data.baseTransaction.attachment = attachment.value;
				}
			};

			applyNavigation();
        };

        $scope.viewUrl = function(url)
        {
            // routine to open the given url
            uiSvc.openURL(url);
        };


        $scope.refreshTree = function(result)
		{
			// routine to update the tree object
			$scope.tree = [];
			parseTreeData(result);
			$scope.tree.push(result);
		};

		$scope.refreshData = function(transactionId)
		{
			// routine to formulate the filter object based on the current scope and send the filter object to the server for processing
			transactionReportingSvc.readCommonTransaction(transactionId).then(function (result)
			{
				$scope.changeTransaction(result);

			}).catch(function (result)
			{
				$log.error("Unable to retrieve Transaction Detail Data", result);
				if (!$scope.data)
					$state.to("app.error", {error: "Invalid Transaction " + transactionId});
			});
		};



        $scope.refreshBaseTransaction = function(promise){
			// routine to request a refresh of the base transaction
			let promiseApi = transactionReportingSvc.readCommonTransaction($scope.data.baseTransaction.transactionId);
			if (promise)
				return promiseApi;
			// do everything
			promiseApi.then(function (result)
			{
				$scope.changeTransaction(result);
			}).catch(function (result)
			{
				$log.error("Unable to retrieve Transaction Detail Data", result);
			});
		};

		$scope.setNavigation = function(navigator)
		{
			// routine to set the navigation tree function appropriate for the display
			// (this happens of instantiation of view-sub controllers)
			$scope.navigation = navigator;
			$scope.tree = [];

			if ($scope.splitter)
			{
				$scope.initPanes();
			}
			if (navigator == undefined)
				return;
			// if we have created the widget then refresh the data and update the navigator
			/*
			if ($scope.diagram)
			{
				// update the view with the latest data
				$scope.initView();

				// update the navigation
				$scope.navigation();
			}
			
			 */
		};

		$scope.initView = function()
		{
			// routine to initialize the view when the sub controller is instantiated
			if ($scope.data && $scope.data.baseTransaction)
			{
				$scope.refreshBaseTransaction();
			}
			else
			{
				if ($stateParams.transactionId)
					$scope.refreshData($stateParams.transactionId);
			}
		};

		$scope.navTree = function(item)
		{
			// change the transaction displayed when the user navigates to a different transaction by navigating to the meta of the new transaction
			if (!item.selected)
			{
				var baseNav = "^";
				if ($state.includes("**.detail") || $state.current.data != null && ($state.current.data.isDetail))
					baseNav += ".^";
				if ($state.current.data != null && $state.current.data.isSubDetail)
					baseNav += ".^";
				transactionReportingSvc.navigateTransaction(baseNav, {transactionId: item.id, transactionType: parseInt(item.additionalData)});
			}
		};

		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
		{
			// routine to update the detail title when a change of state is successful
			if ($state.current.data.subTitle)
			{
				$scope.detailSubTitle = $state.current.data.subTitle;
			}
		});
	}]);
});
