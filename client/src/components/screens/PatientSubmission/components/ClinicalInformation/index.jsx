/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Form, Input, Button, Tree, Select, AutoComplete, Typography, Popconfirm, Checkbox, Row, Col,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_help, ic_visibility, ic_visibility_off,
} from 'react-icons-kit/md';

import intl from 'react-intl-universal';

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import map from 'lodash/map';
import toArray from 'lodash/values';

import {
  hpoOnsetValues,
  getResourceId,
  getHPOCode,
  getHPODisplay,
  getHPOOnsetCode,
  getHPOInterpretationCode,
  hpoInterpretationValues,
  getFamilyRelationshipDisplayForCode,
  getTestCoding,
} from '../../../../../helpers/fhir/fhir';

import {
  addHpoResource,
  setHpoResourceDeletionFlag,
  setFamilyRelationshipResourceDeletionFlag,
  addFamilyHistoryResource,
  addEmptyFamilyHistory,
  updateHpoNote,
  updateHpoObservation,
  updateHpoAgeOnSet,
  updateFMHNote,
} from '../../../../../actions/patientSubmission';

import Api from '../../../../../helpers/api';
import { FamilyMemberHistoryBuilder } from '../../../../../helpers/fhir/builder/FMHBuilder.ts';
import { ObservationBuilder } from '../../../../../helpers/fhir/builder/ObservationBuilder.ts';
import MrnItem from './components/MrnItem';
import InvestigationSection from './components/InvestigationSection';
import FamilyStorySection from './components/FamilyStorySection';

const interpretationIcon = {
  POS: ic_visibility,
  NEG: ic_visibility_off,
  IND: ic_help,
};

const HpoHiddenFields = ({
  hpoResource,
  hpoIndex,
}) => (
  <div>
    <Form.Item name={`hpoIds[${hpoIndex}]`} initialValue={getResourceId(hpoResource) || ''} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item name={`hposToDelete[${hpoIndex}]`} initialValue={hpoResource.toDelete} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item name={`hpoCodes[${hpoIndex}]`} initialValue={getHPOCode(hpoResource) || ''} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item name={`hpoDisplays[${hpoIndex}]`} initialValue={getHPODisplay(hpoResource) || ''} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
  </div>
);

const INITIAL_TREE_ROOTS = [
  { key: 'HP:0001197', title: 'Abnormality of prenatal development or birth', is_leaf: false },
  { key: 'HP:0001507', title: 'Growth abnormality', is_Leaf: false },
  { key: 'HP:0000478', title: 'Abnormality of the eye', is_leaf: false },
  { key: 'HP:0001574', title: 'Abnormality of the ear', is_leaf: false },
  { key: 'HP:0012519', title: 'Hypoplastic posterior communicating artery', is_leaf: false },
  { key: 'HP:0001626', title: 'Abnormality of the cardiovascular system', is_leaf: false },
  { key: 'HP:0002086', title: 'Abnormality of the respiratory system', is_leaf: false },
  { key: 'HP:0000924', title: 'Abnormality of the skeletal system', is_leaf: false },
  { key: 'HP:0003011', title: 'Abnormality of the musculature', is_leaf: false },
  { key: 'HP:0000119', title: 'Abnormality of the genitourinary system', is_leaf: false },
  { key: 'HP:0025031', title: 'Abnormal digestive system', is_leaf: false },
  { key: 'HP:0000152', title: 'Abnormality of head or neck', is_leaf: false },
  { key: 'HP:0000707', title: 'Abnormality of the nervous system', is_leaf: false },
];

class ClinicalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hpoOptions: [],
      treeData: INITIAL_TREE_ROOTS,
    };

    const { treeData } = this.state;
    this.loadedHpoTreeNodes = treeData.reduce((acc, value) => { acc[value.key] = true; return acc; }, {});
    this.onLoadHpoChildren = this.onLoadHpoChildren.bind(this);
    this.addFamilyHistory = this.addFamilyHistory.bind(this);
    this.deleteFamilyHistory = this.deleteFamilyHistory.bind(this);
    this.handleHpoSearchTermChanged = this.handleHpoSearchTermChanged.bind(this);
    this.handleHpoOptionSelected = this.handleHpoOptionSelected.bind(this);
    this.handleHpoDeleted = this.handleHpoDeleted.bind(this);
    this.handleHpoNodesChecked = this.handleHpoNodesChecked.bind(this);
    this.hpoSelected = this.hpoSelected.bind(this);
    this.isAddDisabled = this.isAddDisabled.bind(this);
    this.fmhNoteUpdate = this.fmhNoteUpdate.bind(this);
    this.fmhSelected = this.fmhSelected.bind(this);
    this.handleHpoNoteChanged = this.handleHpoNoteChanged.bind(this);
    this.handleObservationChanged = this.handleObservationChanged.bind(this);
    this.handleHpoAgeChanged = this.handleHpoAgeChanged.bind(this);
  }

  componentDidUpdate() {
    const { validate } = this.props;
    validate();
  }

  onLoadHpoChildren(treeNode) {
    return new Promise((resolve) => {
      const { treeData } = this.state;
      const { dataRef } = treeNode.props;
      const { key } = dataRef;

      if (treeNode.props.children) {
        resolve();
        return;
      }

      Api.searchHpoChildren(key).then((response) => {
        if (response.payload) {
          const { data } = response.payload.data;
          const { hits } = data;
          const results = map(hits, '_source')
            .map((r) => ({ title: r.name, key: r.id, checkable: true }))
            .map((r) => ({ ...r, checked: true }));

          treeNode.props.dataRef.children = results;

          results.forEach((r) => { this.loadedHpoTreeNodes[r.key] = true; });

          this.setState({
            treeData: [...treeData],
          });
          resolve();
        }
      });
    });
  }

  phenotype({
    hpoResource,
    form,
    hpoIndex,
    deleteHpo,
  }) {
    const { Option, OptGroup } = Select;

    const defaultValue = () => {
      if (hpoResource.note != null && hpoResource.note.length > 0) {
        return hpoResource.note[0].text;
      }
      return '';
    };
    return (
      <div key={hpoResource.valueCodeableConcept.coding[0].code} className="phenotypeBlock">
        <div className="phenotypeFirstLine">
          <div className="leftBlock">
            <span className="hpoTitle">{ getHPODisplay(hpoResource) }</span>
            <Popconfirm
              placement="top"
              title={intl.get('form.patientSubmission.form.hpo.confirm.text')}
              onConfirm={() => deleteHpo(getHPOCode(hpoResource))}
              okText={intl.get('form.patientSubmission.form.hpo.confirm.yes')}
              cancelText={intl.get('form.patientSubmission.form.hpo.confirm.no')}
            >
              <Button type="link" className="bordelessButton deleteButton">{ intl.get('form.patientSubmission.clinicalInformation.delete') }</Button>
            </Popconfirm>
          </div>
          <HpoHiddenFields hpoResource={hpoResource} form={form} hpoIndex={hpoIndex} deleteHpo={deleteHpo} />
          <div className="rightBlock">
            <Form.Item name={`interpretation-${hpoIndex}`}>
              <Select
                className="select selectObserved"
                placeholder={intl.get('form.patientSubmission.form.hpo.interpretation')}
                size="small"
                dropdownClassName="selectDropdown"
                defaultValue={getHPOInterpretationCode(hpoResource)}
                onChange={(event) => this.handleObservationChanged(event, hpoIndex)}
              >
                { hpoInterpretationValues().map((interpretation, index) => (
                  <Select.Option
                    key={`hpoInterpretation_${index}`}
                    value={interpretation.value}
                  >
                    <IconKit className={`${interpretation.iconClass} icon`} size={14} icon={interpretationIcon[interpretation.value]} />
                    { interpretation.display }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>
            <Form.Item name={`onset-${hpoIndex}`}>
              <Select
                className="select selectAge"
                size="small"
                placeholder={intl.get('form.patientSubmission.form.hpo.ageAtOnset')}
                dropdownClassName="selectDropdown"
                defaultValue={getHPOOnsetCode(hpoResource)}
                onChange={(event) => this.handleHpoAgeChanged(event, hpoIndex)}
              >
                {
                  hpoOnsetValues.map((group, gIndex) => (
                    <OptGroup label={group.groupLabel} key={`onsetGroup_${gIndex}`}>
                      { group.options.map((o, oIndex) => (
                        <Option value={o.code} key={`onsetOption_${oIndex}`}>{ o.display }</Option>
                      )) }
                    </OptGroup>
                  ))
                }
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="phenotypeSecondLine" key={`input-${hpoIndex}`}>
          <Form.Item>
            <Input placeholder="Ajouter une note…" value={defaultValue()} size="small" onChange={(event) => this.handleHpoNoteChanged(event.target.value, hpoIndex)} className="input hpoNote" />
          </Form.Item>
        </div>
      </div>
    );
  }

  handleHpoNoteChanged(note, index) {
    const { actions } = this.props;
    actions.updateHpoNote(note, index);
  }

  handleObservationChanged(observationCode, index) {
    const { actions, validate } = this.props;

    validate();
    actions.updateHpoObservation(
      {
        interpretation: {
          code: observationCode,
          display: hpoInterpretationValues().find((interpretation) => interpretation.value === observationCode).display,
        },
      }, index,
    );
  }

  handleHpoAgeChanged(code, index) {
    const { actions, validate } = this.props;
    validate();

    let value = null;
    const keys = Object.keys(hpoOnsetValues);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      const group = hpoOnsetValues[key];
      value = group.options.find((onSet) => onSet.code === code);
      if (value != null) {
        break;
      }
    }

    if (value == null) {
      throw new Error(`OnSet code [${code}] not found in [hpoOnsetValues]`);
    }
    actions.updateHpoAgeOnSet(value, index);
  }

  isAddDisabled() {
    const { form } = this.props;
    const values = form.getFieldsValue();
    let {
      familyRelationshipCodes,
    } = values;
    if (familyRelationshipCodes == null) {
      familyRelationshipCodes = {};
    }
    const frc = toArray(familyRelationshipCodes);

    const index = frc.length - 1;
    return frc[index] == null || frc[index].length === 0;
  }

  addFamilyHistory() {
    const { actions } = this.props;
    actions.addEmptyFamilyHistory();
  }

  fmhNoteUpdate(note, index) {
    const { actions } = this.props;
    actions.updateFMHNote(note, index);
  }

  fmhSelected(fhmCode, index) {
    const { form, validate } = this.props;
    validate();
    const values = form.getFieldsValue();
    const {
      familyRelationshipCodes,
    } = values;

    let { familyRelationshipNotes } = values;

    familyRelationshipNotes = toArray(familyRelationshipNotes).map((n) => n.trim());
    const fmh = [];
    const { observations } = this.props;
    toArray(familyRelationshipCodes).forEach((c, i) => {
      const code = i === index ? fhmCode : c;
      if (code != null && code.length > 0) {
        const builder = new FamilyMemberHistoryBuilder(code, getFamilyRelationshipDisplayForCode(code));
        if (familyRelationshipNotes[i] != null) {
          builder.withNote(familyRelationshipNotes[i]);
        }
        const familyHistory = builder.build();

        if (observations.fmh[i].id != null && observations.fmh[i].id.length > 0) {
          familyHistory.id = observations.fmh[i].id;
        }
        fmh.push(familyHistory);
      }
    });
    const { actions } = this.props;
    actions.addFamilyHistoryResource(fmh);
  }

  deleteFamilyHistory({ code }) {
    const { form, actions } = this.props;
    const values = form.getFieldsValue();
    const {
      familyRelationshipIds,
      familyRelationshipCodes,
      familyRelationshipNotes,
    } = values;

    const codes = [];
    const ids = [];
    const notes = [];

    toArray(familyRelationshipCodes).forEach((c, i) => {
      if (c !== code) {
        codes.push(c);
        ids.push(familyRelationshipIds[i]);
        notes.push(familyRelationshipNotes[i]);
      }
    });

    values.familyRelationshipCodes = codes;
    values.familyRelationshipIds = ids;
    values.familyRelationshipNotes = notes;
    form.setFieldsValue(values);

    const fmh = [];
    const deleted = [];
    const { observations } = this.props;

    observations.fmh.forEach((familyHistory) => {
      if (isEmpty(familyHistory) || familyHistory.relationship.coding[0].code !== code) {
        fmh.push(familyHistory);
      } else if (familyHistory.id != null) {
        deleted.push(familyHistory);
      }
    });

    actions.addFamilyHistoryResource(fmh);
    actions.setFamilyRelationshipResourceDeletionFlag(deleted);
    if (fmh.length === 0) {
      actions.addEmptyFamilyHistory();
    }
  }

  handleHpoSearchTermChanged(term) {
    Api.searchHpos(term.toLowerCase().trim()).then((response) => {
      if (response.payload) {
        const { data } = response.payload.data;
        const { hits } = data;
        const results = map(hits, '_source');

        this.setState({
          hpoOptions: results,
        });
      }
    });
  }

  hpoSelected({ code, display }) {
    const { actions } = this.props;

    const builder = new ObservationBuilder('HPO');
    builder.withValue({
      coding: [{
        code, display,
      }],
    });

    actions.addHpoResource(builder.build());
  }

  handleHpoNodesChecked(_e, info) {
    const { actions, observations } = this.props;
    const { treeData } = this.state;

    const checkedNodes = info.checkedNodes.map((n) => ({ code: n.key, display: n.title }));
    const hpoResources = observations.hpos;

    const toDelete = [];
    const toAdd = [];

    hpoResources.forEach((resource) => {
      if (resource.valueCodeableConcept.coding.length > 0) {
        const { code } = resource.valueCodeableConcept.coding[0];
        const isUnchecked = checkedNodes.find((r) => r.code === code) === undefined;
        // Resources selected by the autocomplete aren't in the treeData
        const isHidden = treeData.find((td) => td.key === code) === undefined;

        if (isUnchecked && !isHidden) {
          toDelete.push(resource);
        }
      }
    });

    checkedNodes.forEach((resource) => {
      if (hpoResources.find((r) => resource.code === r.valueCodeableConcept.coding[0].code) == null) {
        toAdd.push(resource);
      }
    });

    toDelete.map((r) => ({ code: r.valueCodeableConcept.coding[0].code })).forEach(actions.setHpoResourceDeletionFlag);
    toAdd.forEach(this.hpoSelected);
  }

  handleHpoOptionSelected(value) {
    const { hpoOptions } = this.state;
    const option = hpoOptions.find((h) => h.name === value);

    this.hpoSelected({ code: option.id, display: option.name });
  }

  handleHpoDeleted(hpoId) {
    const { actions } = this.props;
    actions.setHpoResourceDeletionFlag({ code: hpoId, toDelete: true });
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      const { TreeNode } = Tree;
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            { this.renderTreeNodes(item.children) }
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} dataRef={item} />;
    });
  }

  render() {
    const { hpoOptions, treeData } = this.state;

    const hpoOptionsLabels = map(hpoOptions, 'name');
    const {
      form, observations, localStore, patient,
    } = this.props;

    const { TextArea } = Input;
    const familyHistoryResources = observations.fmh || [];

    // const cghInterpretationValue = has(localStore, 'cgh.interpretation') ? localStore.cgh.interpretation : null;
    let cghId = null;
    if (observations.cgh != null) {
      cghId = observations.cgh.id;
    }

    const hpoResources = observations.hpos;
    const hpoCodes = hpoResources.filter((r) => !r.toDelete).map(getHPOCode);

    const analysisTestNames = [
      'adultCancerPredisposition',
      'muscle',
      'nuclearMitochondrialGenes',

      'kidTumorPredisposition',
      'amyotrophicLateralSclerosis',
      'rasopathies',

      'kidHematopathiesPredisposition',
      'retinopathies',
      'cardiomyopathies',

      'ehlersDanlos',
      'deafness',
      'hereditaryArrhythmias',

      'polymalformatifs',
      'intellecualDisability',
      'aortopathies',
    ];
    const analysisTestOptions = analysisTestNames.map((testName) => getTestCoding(testName));

    const initialAnalysisValue = get(localStore, 'serviceRequest.code', undefined);
    const initialInterpretation = get(localStore, 'cgh.interpretation', undefined);
    const initialPrecision = get(localStore, 'cgh.precision', undefined);
    const initialIndicNote = get(localStore, 'indic.note', undefined);

    return (
      <div className="clinical-information">
        <Card
          title={intl.get('form.patientSubmission.clinicalInformation.medicalFile')}
          className="staticCard patientContent"
          bordered={false}
        >
          <Form.Item label={intl.get('form.patientSubmission.clinicalInformation.file')}>
            <MrnItem form={form} patient={patient} />
          </Form.Item>
        </Card>
        <Card
          title={intl.get('form.patientSubmission.clinicalInformation.analysis')}
          className="staticCard patientContent clinical-information__analysis"
          bordered={false}
        >

          <Form.Item name="cghId" initialValue={cghId} className="hidden-form">
            <Input size="small" type="hidden" />
          </Form.Item>

          <Form.Item
            label={intl.get('form.patientSubmission.clinicalInformation.analysis.selection')}
            name="analysis.tests"
            initialValue={[initialAnalysisValue]}
          >
            <Checkbox.Group
              disabled={initialAnalysisValue != null}
              className="clinical-information__analysis__checkbox-group"
            >
              { analysisTestOptions.map((option) => (
                <Checkbox
                  value={option.code}
                >{ option.display }
                </Checkbox>
              )) }
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label={intl.get('form.patientSubmission.clinicalInformation.analysis.comments')}
            name="analysis.comments"
          >
            <Row gutter={8}>
              <Col span={17}>
                <TextArea
                  placeholder={intl.get('form.patientSubmission.clinicalInformation.analysis.comments.placeholder')}
                  rows={4}
                />
              </Col>
              <Col>
                <Typography.Text className="optional-item__label">
                  { intl.get('form.patientSubmission.form.validation.optional') }
                </Typography.Text>
              </Col>
            </Row>
          </Form.Item>
        </Card>

        <Card
          title={intl.get('form.patientSubmission.clinicalInformation.investigation')}
          bordered={false}
          className="staticCard patientContent clinical-information__investigation"
        >
          <InvestigationSection interpretation={initialInterpretation} precision={initialPrecision} />
        </Card>
        <Card
          title={intl.get('screen.patient.header.familyHistory')}
          bordered={false}
          className="staticCard patientContent"
        >
          <FamilyStorySection familyHistoryResources={familyHistoryResources} />
        </Card>
        <Card title="Signes cliniques" bordered={false} className="staticCard patientContent">
          <div className="separator">
            <div className="cardSeparator">
              <Form.Item className="searchInput searchInputFull">
                <AutoComplete
                  className="searchInput"
                  placeholder={intl.get('form.patientSubmission.clinicalInformation.searchClinicalSign')}
                  dataSource={hpoOptionsLabels}
                  onSelect={this.handleHpoOptionSelected}
                  onChange={this.handleHpoSearchTermChanged}
                />

              </Form.Item>
              <Tree
                loadData={this.onLoadHpoChildren}
                checkStrictly
                checkable
                checkedKeys={hpoCodes}
                onCheck={this.handleHpoNodesChecked}
              >
                { this.renderTreeNodes(treeData) }
              </Tree>
            </div>
            <div className={hpoResources.length === 0 ? 'cardSeparator message' : 'cardSeparator'}>{
              hpoResources.length === 0
                ? <p>{ intl.get('form.patientSubmission.clinicalInformation.validation.clinicalSign') }</p>
                : hpoResources.map((hpoResource, hpoIndex) => this.phenotype({
                  hpoResource,
                  form,
                  hpoIndex,
                  deleteHpo: this.handleHpoDeleted,
                }))
            }
            </div>
          </div>

        </Card>
        <Card title={intl.get('form.patientSubmission.clinicalInformation.indications')} bordered={false} className="staticCard patientContent">
          <Form.Item
            label={intl.get('form.patientSubmission.clinicalInformation.diagnosticHypothesis')}
            name="indication"
            initialValue={initialIndicNote}
            rules={[
              {
                required: true,
                message: intl.get('form.patientSubmission.clinicalInformation.validation.diagnosticHypothesis'),
              },
              {
                whitespace: true,
                message: intl.get('form.patientSubmission.clinicalInformation.validation.noSpace'),
              },
            ]}
          >
            <TextArea className="input note" rows={4} />
          </Form.Item>
        </Card>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addHpoResource,
    setHpoResourceDeletionFlag,
    setFamilyRelationshipResourceDeletionFlag,
    addFamilyHistoryResource,
    addEmptyFamilyHistory,
    updateHpoNote,
    updateHpoObservation,
    updateHpoAgeOnSet,
    updateFMHNote,
  }, dispatch),
});

const mapStateToProps = (state) => ({
  clinicalImpression: state.patientSubmission.clinicalImpression,
  observations: state.patientSubmission.observations,
  serviceRequest: state.patientSubmission.serviceRequest,
  localStore: state.patientSubmission.local,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClinicalInformation);
