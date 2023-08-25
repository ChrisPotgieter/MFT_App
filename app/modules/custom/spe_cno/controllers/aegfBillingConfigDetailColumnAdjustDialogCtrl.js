/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - aegfBillingConfigDetailColumnAdjustDialogCtrl.js
 /// Controller to Manage Column Position Adjustment Dialog
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Chris Potgieter
 /// Date:20/04/2023
 /// </summary>
 */
define(['modules/custom/spe_cno/module', 'lodash', 'bootstrap-validator'], function (module, lodash) {
    'use strict';

    module.registerController('aegfBillingConfigDetailColumnAdjustDialogCtrl',  ['$scope', '$panelInstance', 'uiSvc', 'speCNODataSvc', 'dialogData', function ($scope, $uibModalInstance, uiSvc, dataSvc, dialogData)
	{
        let _this = this;
        _this.functions = {};

        //<editor-fold desc="Functions">
		_this.functions.gridCreate = function(grid)
		{
			// once the grid is create get its reference
			_this.grid = grid;
		};

		_this.functions.init = function () {

            // initialize the controller
            _this.model = {data: [], flags: {refresh: {value: 0}}};
            _this.dialogData = dialogData;

            // setup the grid
            _this.model.options = {
                sortable: false,
                groupable: false,
                filterable: false,
                columnMenu: false,
                resizable: false,
                pageable: false,
                selectable: 'row',
                dataSource: {
                    data: [],
                    pageSize: 10000,
                    sort: [],
                    schema: {
                        model: {
                            id: 'id',
                            uid: 'id',
                            fields: {
                                id: {"type": "number"},
                                caption: {type: 'string'},
								hidden: {type:"boolean"}
                            }
                        }
                    }
                },
                columns: [
                    {
                        field: '',
                        title: '',
                        width: '58px',
                        template: function (dataItem, e) {
                            return "<button class='btn bg-color-blueDark txt-color-white' ><i class='fa fa-bars'></i></button>";
                        }
                    },
                    {
                        field: 'caption',
                        title: 'Caption',
                    },
                    {
                        field: "action",
                        title: "Action",
                        width: "100px",
                        template: function (dataItem) {
                            let icon = dataItem.hidden ? "eye-slash" : "eye";
                            let button = "<button class='btn bg-color-blueDark txt-color-white' ng-click=\"functionManager.onChangeHidden(\'" + dataItem.id + "\');\"><i class=\"fa fa-" + icon + "\"></i></button>";
                            button += "&nbsp;&nbsp;<button class='btn bg-color-blueDark txt-color-white' ng-click=\"functionManager.onCloseForEdit(\'" + dataItem.id + "\');\"><i class=\"fa fa-pencil\"></i></button>";
                            return button;
                        }
                    },
                ],
                dataBound: function (e) {
                    let grid = this;
                    grid.table.kendoSortable({
                        filter: '>tbody >tr ',
                        hint: $.noop,
                        cursor: 'move',

                        container: '#grid tbody ',
                        change: function (e)
						{
                            let skip = grid.dataSource.skip(),
                                oldIndex = e.oldIndex + skip,
                                newIndex = e.newIndex + skip,
                                data = grid.dataSource.data(),
                                dataItem = grid.dataSource.getByUid(e.item.data('uid'));

                            grid.dataSource.remove(dataItem);
                            grid.dataSource.insert(newIndex, dataItem);
                        }
                    });
                    uiSvc.dataBoundKendoGrid(grid, _this.functions.editRow);
                }
            };

            _this.functions.refreshData();
        };

        _this.functions.showColumnAddDialog = function()
        {
            // routine to show the column add dialog
            dataSvc.aegf.functions.showColumnAddDialog(dialogData.rows).then(function(result)
            {
                _this.functions.refreshData();
            });
        };


        _this.functions.refreshData = function()
        {
            // set the grid data
            _this.model.data = [];
            lodash.forEach(dialogData.rows, function (row, index) {
                _this.model.data.push({
                    caption: row.caption,
                    id: index,
                    hidden: row.hidden,
                    sourceId: row.identifier
                });
            });
        };

        _this.functions.cancelDialog = function () {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.confirmDialog = function ()
		{
		    // routine to perform the save
            _this.functions.updateSourceHidden();

            // send back updated columns
			let columns = [];
            let data = _this.grid.dataSource.data();
			lodash.forEach(data, function(dataItem)
			{
				let sourceColumn = _this.dialogData.rows[dataItem.id];
				if (sourceColumn != null)
					columns.push(sourceColumn);
			});

			// close the window
            $uibModalInstance.close({action: 0, data: columns});
		};

        _this.functions.onChangeHidden = function (index)
		{
		    // routine to toggle the id of the item in the datasource
            let dataItem = _this.grid.dataSource.data()[index];
            dataItem.hidden = !dataItem.hidden;
            _this.grid.refresh();
        };

        _this.functions.onCloseForEdit = function(index)
        {
            _this.functions.updateSourceHidden();

            // close the window
            $uibModalInstance.close({action:1, data: index});
        };


        _this.functions.updateSourceHidden = function()
        {
            // routine to update the source model with the visibility before closing or going into column edit
            let data = _this.grid.dataSource.data();
            lodash.forEach(data, function(dataItem, )
            {
                let sourceColumn = _this.dialogData.rows[dataItem.id];
                sourceColumn.hidden = dataItem.hidden;
            });

        };
        _this.functions.editRow = function(record)
		{
			// routine to bring up the edit column dialog for the selected row
            _this.functions.onCloseForEdit(record.id);
		};

        //</editor-fold>

        _this.functions.init();
    }
    ]);
});
