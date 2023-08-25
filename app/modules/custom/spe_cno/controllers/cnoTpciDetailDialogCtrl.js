/*
 /// <summary>
 /// app.modules.custom.spe_cno.controllers - cnoTpciDetailDialogCtrl
 /// Third Party Commission Intake Dialog Controller to Manage Displaying of Transaction Detail Information
 ///
 /// Copyright © 2009 - MQAttach Canada Inc. and All associated Companies
 /// Written By: Mac Bhyat
 /// Date: 04/06/2022
 /// </summary>
 */

define(['modules/custom/spe_cno/module', 'appCustomConfig'], function (module, appCustomConfig)
{
    "use strict";
    module.registerController('cnoTpciDetailDialogCtrl', ['$uibModalInstance', '$log', '$filter', 'uiSvc', 'speDataSvc', 'speCNODataSvc', 'dialogData', function ($uibModalInstance, $log, $filter, uiSvc, speDataSvc, dataSvc, dialogData)
    {
        let _this = this;

        _this.model = {title:"Transaction Detail", icon:"fa fa-info-circle", currentTabIndex: 1, flags:{refresh: {value: 0}}};
        _this.model.processing = {height: "250", options:{propertyView: true, title:"Processing Information"}};
        _this.model.insured = {height: "250", options:{propertyView: true, title:"Policy Information"}};
        _this.model.agent = {height: "150", options:{propertyView: true, title:"Agent Information"}};
        _this.model.input = {data:[], type: 0};
        _this.model.response = {data:[], type: 0};

        //<editor-fold desc="Functions">
        _this.functions = {};
        _this.functions.buildStatus = function()
        {
            // routine to build the status panel for the record
            let status = _this.model.base_record.failed > 0 ? 99 : 2;
            _this.model.status = {};
            _this.model.status.class = $filter('bootStrapStatusFilter')(status);
            _this.model.status.icon = $filter('bootStrapStatusIconFilter')(status);
            _this.model.status.caption = $filter("speGwidStatusFilter")(_this.model.base_record.status);
            _this.model.status.processing = dataSvc.getTPCIProcStatus(_this.model.base_record.processing_status);
            _this.model.status.message = _this.model.base_record.supplemental;
        };
        _this.functions.buildDescriptions = function()
        {
            // routine to build the descriptions needed for the display
            _this.model.vendor_name = dataSvc.getTPCIVendor(_this.model.base_record.vendor.code, _this.model.base_record.company_id);
            _this.model.entity_desc = dataSvc.getTPCIDepartmentName(_this.model.base_record.entity_type);
        };

        _this.functions.buildMetaSummary = function(type, metaType)
        {
            // routine to build a meta-data tab (1 - input, 2 - life pro)
            let meta = [];
            let balancing = null;
            let key = metaType == 1 ? "input" : "response";
            if (metaType == 1)
            {
                meta = _this.model.detail.meta;
                balancing = _this.model.detail.balancing;
            }
            if (metaType == 2)
            {
                meta = _this.model.detail.lifeProMeta;
                balancing = _this.model.detail.lifeProBalancing;
            }
            if (balancing)
                _this.model[key].type = metaType;
            _this.model[key].title = type;
            if (meta && meta.metaData)
                _this.model[key].data = uiSvc.parseMetaGridData(meta.metaData, type + " Information");
        };

        _this.functions.buildInsuredSummary = function()
        {
            let insured = "Insured";
            let policy = "Policy";
            let records = [];

            let rec = _this.model.base_record;

            // build up the insured value
            if (rec.insured)
            {
                records.push({key:"Name", value: rec.insured.name, category: insured});
                if (rec.insured.dob)
                records.push({key:"DOB", value: $filter("removeUTCDateFilter")(rec.insured.dob), category: insured});
                if (rec.insured.id && rec.insured.id != "0")
                    records.push({key:"ID", value: rec.insured.id, category: insured});
                if (rec.insured.medicare_id && rec.insured.medicare_id != "0")
                    records.push({key:"Medicare ID", value: rec.insured.medicare_id, category: insured});
                if (rec.insured.ssn && rec.insured.ssn != "0" && rec.insured.ssn.trim() != "")
                    records.push({key:"SSN", value: rec.insured.ssn, category: insured});
                if (rec.insured.address1 && rec.insured.address1.trim() != "")
                {
                    let address = [rec.insured.address1.trim()];
                    if (rec.insured.address2 && rec.insured.address2.trim() != "")
                        address.push(rec.insured.address2.trim());
                    if (rec.insured.city && rec.insured.city.trim() != "")
                        address.push(rec.insured.city.trim());
                    address.push(rec.insured.state);
                    if (rec.insured.zip_code && rec.insured.zip_code.trim() != "" && rec.insured.zip_code != "000")
                        address.push(rec.insured.zip_code.trim());
                    records.push({key:"Address", value: address.join(","), category: insured});

                    if (rec.insured.phone_num)
                        records.push({key:"Contact Number", value: rec.insured.phone_num, category: insured});
                }
                else
                {
                    records.push({key:"State", value: rec.insured.state, category: insured});
                }
            }

            // build up the policy information
            if (rec.plan_code)
                records.push({key: "Plan Code", value: rec.plan_code, category: policy});
            if (rec.product_code)
                records.push({key: "Product Code", value: rec.product_code, category: policy});
            if (rec.policy)
            {
                if (rec.policy.effective_date)
                    records.push({ key: "Effective",  value: $filter("removeUTCDateFilter")(rec.policy.effective_date),  category: policy });
                if (rec.policy.original_eff_date)
                    records.push({ key: "Orig. Effective",  value: $filter("removeUTCDateFilter")(rec.policy.original_eff_date),  category: policy });

                if (rec.policy.signed_date)
                    records.push({key:"Signed", value: $filter("removeUTCDateFilter")(rec.policy.signed_date), category: policy});
                if (rec.policy.termination_date)
                    records.push({key:"Terminated", value: $filter("removeUTCDateFilter")(rec.policy.termination_date), category: policy});
                if (rec.policy.termination_reason)
                    records.push({key:"Termination Reason", value: rec.policy.termination_reason, category: policy});
                if (rec.policy.status)
                    records.push({key:"Status", value: rec.policy.status, category: policy});
            };
            _this.model.insured.data = records;
        };

        _this.functions.buildProcessingSummary = function()
        {
            let category = "General";
            let dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
            let prodCategory = appCustomConfig.product.name + " Extensions";
            let referenceCategory = "Transactions";
            let records = [];
            let rec = _this.model.base_record;
            records.push({key:"System", value: rec.system, category: category});
            if (rec.source_system_id)
                records.push({key:"Source System", value: rec.source_system_id, category: category});
            records.push({key:"Transaction Id", value: rec._id,  category: category});
            if (rec.batch_id)
                records.push({key:"Batch Id", value: rec.batch_id,  category: category});
            records.push({key:"Processing Id", value: rec.processing_id, category: category});
            records.push({key:"Record Index", value: rec.record_index, category: category});
            records.push({key:"Job Id", value: rec.job_id,  category: prodCategory});
            records.push({key:"Document Id", value: rec.doc_id,  category: prodCategory});
            records.push({key:"Document Type", value: rec.doc_type,  category: prodCategory});
            if (rec.reference)
            {
                if (rec.reference.mft && rec.reference.mft.id)
                    records.push({key: "MFT Transaction", value: rec.reference.mft.id, category: referenceCategory, click: true, parms: 'mft', title:"Click here to view the Associated MFT Transaction"});
                if (rec.reference.itx && rec.reference.itx.id)
                    records.push({key: "ITX Transaction", value: rec.reference.itx.id, category: referenceCategory, click: true, parms: 'itx', title:"Click here to view the Associated ITX Transaction"});
                if (rec.reference.lifepro && rec.reference.lifepro.itx_id)
                    records.push({key: "Life-Pro ITX Transaction", value: rec.reference.lifepro.itx_id, category: referenceCategory, click: true, parms: 'itx_lifepro', title:"Click here to view the Associated Life-Pro ITX Transaction"});
            }
            if (rec.last_updated_date)
                records.push({key:"Last Updated", value: $filter("localUTCDateFilter")(rec.last_updated_date, dateTimeFormat), category: prodCategory});
            if (rec.expiry)
                records.push({key:"Dashboard Expiry", value: $filter("localUTCDateFilter")(rec.expiry, dateTimeFormat), category: prodCategory});
            _this.model.processing.data = records;
        };

        _this.functions.buildLifeProSummary = function()
        {
            // routine to build up the lifepro record
            if (!_this.model.base_record.reference || !_this.model.base_record.reference.lifepro)
            {
                _this.model.lifepro_record = null;
                return;
            }
            _this.model.lifepro_record = _this.model.base_record.reference.lifepro;
        };

        _this.functions.buildAgentSummary = function()
        {
            // routine to build up the agent information
            let category = "Writing Agent";
            let otherCategory = "Agent";
            let records = [];

            let rec = _this.model.base_record;
            if (rec.agentNumber && rec.agentNumber.trim() != "")
                records.push({key:"Number", value: rec.agentNumber.trim(), category: category});
            if (rec.commission_applicable)
                records.push({key:"Commission Applicable", value: rec.commission_applicable, category: category});
            if (rec.agent)
            {
                if (rec.agent.number && rec.agent.number.trim() != "")
                    records.push({key:"Number", value: rec.agent.number, category: category});
                if (rec.agent.name && rec.agent.name.trim() != "")
                    records.push({key:"Name", value: rec.agent.name, category: category});
                if (rec.agent.ssn && rec.agent.ssn != "0" && rec.agent.ssn.trim() != "")
                    records.push({key:"SSN", value: rec.agent.ssn, category: category});
                if (rec.agent.san && rec.agent.san != "0" && rec.agent.san.trim() != "")
                    records.push({key:"SAN", value: rec.agent.san, category: category});
                if (rec.agent.npn && rec.agent.npn != "0" && rec.agent.npn.trim() != "")
                    records.push({key:"NPN", value: rec.agent.npn, category: category});
                if (rec.agent.indicator)
                    records.push({key:"Indicator", value: rec.agent.indicator, category: category});
            };
            if (rec.other_agent)
            {
                if (rec.other_agent.ssn && rec.other_agent.ssn != "0" && rec.other_agent.ssn.trim() != "")
                    records.push({key:"SSN", value: rec.other_agent.ssn, category: otherCategory});
                if (rec.other_agent.san && rec.other_agent.san != "0" && rec.other_agent.san.trim() != "")
                    records.push({key:"SAN", value: rec.other_agent.san, category: otherCategory});
                if (rec.other_agent.npn && rec.other_agent.npn != "0" && rec.other_agent.npn.trim() != "")
                    records.push({key:"NPN", value: rec.other_agent.npn, category: otherCategory});
            };

            _this.model.agent.data = records;
        };

        _this.functions.setCurrentTab = function(tab)
        {
            // routine to set the current tab index if the user navigates
            _this.model.currentTabIndex = tab;
        };

        _this.functions.cancelDialog = function()
        {
            // close the window
            $uibModalInstance.dismiss('cancel');
        };
        _this.functions.navigateTransaction = function(module)
        {
            // routine to navigate the user to the given module transaction
            let id = null;
            if (module == "mft")
                id = _this.model.base_record.reference.mft.id;
            if (module == "itx")
                id = _this.model.base_record.reference.itx.id;
            if (module == "itx_lifepro")
                id = _this.model.base_record.reference.lifepro.itx_id;

            if (id != null)
                $uibModalInstance.close({module: module, id: id});
        };

        _this.functions.initialize = function()
        {
            let type = dataSvc.getTPCIDepartmentName(dialogData.entity_type);
            dataSvc.readTPCIDetail(dialogData).then(function(data)
            {
                _this.model.detail = data;
                _this.model.base_record = _this.model.detail.baseRecord;
                _this.functions.buildStatus();
                _this.functions.buildDescriptions();
                _this.functions.buildProcessingSummary();
                _this.functions.buildInsuredSummary();
                _this.functions.buildAgentSummary();
                _this.functions.buildMetaSummary(type, 1);
                _this.functions.buildMetaSummary("Custom", 2);
                _this.functions.buildLifeProSummary();
            }).catch(function (err)
            {
                $log.error("Unable to Read Detail Information", err);
            });
        };
        _this.functions.initialize();
        //</editor-fold>

        //<editor-fold desc="Function Manager">
        _this.functionManager = {};
        _this.functionManager.itemClick = function(value, module)
        {
            _this.functions.navigateTransaction(module);
        };
        _this.functionManager.showBalancing = function(type)
        {
            // TODO: Move this once SPE MFT is in its own module
            let balancing = type == 1 ? _this.model.detail.balancing : _this.model.detail.lifeProBalancing;
            speDataSvc.setBalancing(balancing);
            let dialogData  = {nodeData: balancing.summary};
            speDataSvc.viewBalancing(dialogData);
        };
        //</editor-fold>

    }]);
});
