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
import findIndex from 'lodash/findIndex';
import ErrorText from './components/ErrorText';

import {
  hpoOnsetValues,
  getResourceId,
  getHPOCode,
  getHPODisplay,
  getHPOOnsetCode,
  getHPOInterpretationCode,
  hpoInterpretationValues,
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
import MrnItem from './components/MrnItem';
import InvestigationSection from './components/InvestigationSection';
import FamilyStorySection from './components/FamilyStorySection';
import { ObservationBuilder } from '../../../../../helpers/fhir/builder/ObservationBuilder.ts';

const interpretationIcon = {
  POS: ic_visibility,
  NEG: ic_visibility_off,
  IND: ic_help,
};

const intlPrefixKey = 'form.patientSubmission';

const HpoHiddenFields = ({
  hpoResource,
  hpoIndex,
}) => (
  <div>
    <Form.Item name={['hpos', hpoIndex, 'id']} initialValue={getResourceId(hpoResource)} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item name={['hpos', hpoIndex, 'code']} initialValue={getHPOCode(hpoResource)} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item name={['hpos', hpoIndex, 'display']} initialValue={getHPODisplay(hpoResource)} className="hidden-form">
      <Input size="small" type="hidden" />
    </Form.Item>
  </div>
);

const INITIAL_TREE_ROOTS = [
  { key: 'HP:0001197', title: 'Abnormality of prenatal development or birth', is_leaf: false },
  { key: 'HP:0001507', title: 'Growth abnormality', is_leaf: false },
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
      hpoInterpretation: [],
    };

    const { treeData } = this.state;
    this.loadedHpoTreeNodes = treeData.reduce((acc, value) => { acc[value.key] = true; return acc; }, {});
    this.onLoadHpoChildren = this.onLoadHpoChildren.bind(this);
    this.deleteFamilyHistory = this.deleteFamilyHistory.bind(this);
    this.handleHpoSearchTermChanged = this.handleHpoSearchTermChanged.bind(this);
    this.handleHpoOptionSelected = this.handleHpoOptionSelected.bind(this);
    this.handleHpoDeleted = this.handleHpoDeleted.bind(this);
    this.handleHpoNodesChecked = this.handleHpoNodesChecked.bind(this);
    this.hpoSelected = this.hpoSelected.bind(this);
    this.isAddDisabled = this.isAddDisabled.bind(this);
  }

  componentDidUpdate() {
    const { onChange } = this.props;
    onChange();
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
    const { onChange } = this.props;
    const { hpoInterpretation } = this.state;

    const onChangeInterpretation = (e) => {
      const hpoDisplay = getHPODisplay(hpoResource);
      if (e === 'POS') {
        this.setState({
          hpoInterpretation: [...hpoInterpretation, hpoDisplay],
        });
      } if (hpoInterpretation.includes(hpoDisplay)) {
        const indexObservedDisplay = hpoInterpretation.indexOf(hpoDisplay);
        hpoInterpretation.splice(indexObservedDisplay, 1);
        const hposForm = form.getFieldValue('hpos');
        const indexHpos = findIndex(hposForm, { display: hpoDisplay });
        const hpoElement = hposForm[indexHpos];
        delete hpoElement.onset;
        hposForm.splice(indexHpos, 1, hpoElement);
        form.setFieldsValue({ hpos: hposForm });
        this.setState({
          hpoInterpretation,
        });
      }
      onChange();
    };

    return (
      <div key={hpoResource.valueCodeableConcept.coding[0].code} className="phenotypeBlock">
        <div className="phenotypeFirstLine">
          <div className="leftBlock">
            <span className="hpoTitle">{ getHPODisplay(hpoResource) }</span>
            <Popconfirm
              placement="top"
              title={intl.get(`${intlPrefixKey}.form.hpo.confirm.text`)}
              onConfirm={() => deleteHpo(getHPOCode(hpoResource))}
              okText={intl.get(`${intlPrefixKey}.form.hpo.confirm.yes`)}
              cancelText={intl.get(`${intlPrefixKey}.form.hpo.confirm.no`)}
            >
              <Button
                type="link"
                className="button--borderless deleteButton"
              >
                { intl.get(`${intlPrefixKey}.clinicalInformation.delete`) }
              </Button>
            </Popconfirm>
          </div>
          <HpoHiddenFields hpoResource={hpoResource} form={form} hpoIndex={hpoIndex} deleteHpo={deleteHpo} />
          <div className="rightBlock">
            <Form.Item
              name={['hpos', hpoIndex, 'interpretation']}
              initialValue={getHPOInterpretationCode(hpoResource)}
              rules={[{
                required: true,
                message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.requiredField`)} />,
              }]}
            >
              <Select
                className="select selectObserved"
                placeholder={intl.get(`${intlPrefixKey}.form.hpo.interpretation`)}
                size="small"
                dropdownClassName="selectDropdown"
                defaultValue={getHPOInterpretationCode(hpoResource)}
                onChange={onChangeInterpretation}
              >
                { hpoInterpretationValues().map((interpretation, index) => (
                  <Select.Option
                    key={`hpoInterpretation_${index}`}
                    value={interpretation.value}
                  >
                    <IconKit
                      className={`${interpretation.iconClass} icon`}
                      size={14}
                      icon={interpretationIcon[interpretation.value]}
                    />
                    { interpretation.display }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>
            <Form.Item
              name={['hpos', hpoIndex, 'onset']}
              initialValue={getHPOOnsetCode(hpoResource)}
            >
              <Select
                className="select selectAge"
                size="small"
                placeholder={intl.get(`${intlPrefixKey}.form.hpo.ageAtOnset`)}
                dropdownClassName="selectDropdown"
                defaultValue={getHPOOnsetCode(hpoResource)}
                onChange={onChange}
                disabled={!hpoInterpretation.includes(getHPODisplay(hpoResource))}
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
          <Form.Item name={['hpos', hpoIndex, 'note']} initialValue={defaultValue()}>
            <Input placeholder="Ajouter une note…" value={defaultValue()} size="small" className="input hpoNote" />
          </Form.Item>
        </div>
      </div>
    );
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
    const { onHpoSelected } = this.props;
    onHpoSelected(code, display);
  }

  handleHpoNodesChecked(_e, info) {
    const { treeData } = this.state;
    const { onHposUpdated, form, hpoResources } = this.props;

    const { hpos } = form.getFieldsValue();
    const checkedNodes = info.checkedNodes.map((n) => ({ code: n.key, display: n.title }));

    const updatedHpos = hpoResources.filter((resource) => {
      if (resource.valueCodeableConcept.coding.length > 0) {
        const { code } = resource.valueCodeableConcept.coding[0];
        const isUnchecked = checkedNodes.find((r) => r.code === code) === undefined;
        // Resources selected by the autocomplete aren't in the treeData
        const isHidden = treeData.find((td) => td.key === code) === undefined;

        return !isUnchecked || isHidden;
      }
      return false;
    });

    checkedNodes.forEach((resource) => {
      if (updatedHpos.find((r) => resource.code === r.valueCodeableConcept.coding[0].code) == null) {
        updatedHpos.push(new ObservationBuilder('HPO').withValue(resource.code, resource.display).build());
      }
    });

    const hpoValues = (hpos || [])
      .filter((hpo) => updatedHpos.find(
        (entry) => hpo.code === get(entry, 'valueCodeableConcept.coding[0].code'),
      ) != null);
    form.setFieldsValue({ hpos: hpoValues, hposTree: info.checkedNodes });

    onHposUpdated(updatedHpos);
  }

  handleHpoOptionSelected(value) {
    const { hpoOptions } = this.state;
    const option = hpoOptions.find((h) => h.name === value);

    this.hpoSelected({ code: option.id, display: option.name });
  }

  handleHpoDeleted(hpoId) {
    const {
      form, onChange, onHposUpdated, hpoResources,
    } = this.props;
    const values = form.getFieldsValue();
    const result = hpoResources.filter((hpo) => get(hpo, 'valueCodeableConcept.coding[0].code') !== hpoId);

    onHposUpdated(result);
    form.setFieldsValue({
      ...values,
      hpos: values.hpos.filter((hpo) => hpo.code !== hpoId),
      hposTree: result.length > 0 ? result : null,
    });
    onChange();
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      const { TreeNode } = Tree;
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} checkable={item.checkable === true}>
            { this.renderTreeNodes(item.children) }
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} dataRef={item} checkable={item.checkable === true} />;
    });
  }

  render() {
    const {
      hpoOptions, treeData,
    } = this.state;

    const hpoOptionsLabels = map(hpoOptions, 'name');
    const {
      form, observations, localStore, onChange, hpoResources, fmhResources, validate, submitFailed,
    } = this.props;

    const { TextArea } = Input;

    // const cghInterpretationValue = has(localStore, 'cgh.interpretation') ? localStore.cgh.interpretation : null;
    let cghId = null;
    if (observations.cgh != null) {
      cghId = observations.cgh.id;
    }

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
    let initialAnalysisNote = get(localStore, 'serviceRequest.note', undefined);
    const initialInterpretation = get(localStore, 'cgh.interpretation', undefined);
    const initialPrecision = get(localStore, 'cgh.precision', undefined);
    const initialIndicNote = observations.indic ? get(observations, 'indic.note[0].text') : null;
    const initialSummaryNote = get(localStore, 'summary.note', undefined);

    const isEditMode = initialAnalysisValue != null;

    const formTests = (form.getFieldValue('analysis.tests') || []).filter((test) => test != null);
    if (form.getFieldValue('analysis.comments')) {
      initialAnalysisNote = initialAnalysisNote !== form.getFieldValue('analysis.comments')
        ? form.getFieldValue('analysis.comments')
        : initialAnalysisNote;
    }
    return (
      <div className="clinical-information">
        <Card
          title={intl.get(`${intlPrefixKey}.clinicalInformation.medicalFile`)}
          className="staticCard patientContent"
          bordered={false}
        >
          <Form.Item label={intl.get(`${intlPrefixKey}.clinicalInformation.file`)}>
            <MrnItem form={form} onChange={() => onChange()} />
          </Form.Item>
        </Card>
        <Card
          title={intl.get(`${intlPrefixKey}.clinicalInformation.analysis`)}
          className="staticCard patientContent clinical-information__analysis"
          bordered={false}
        >

          <Form.Item
            name="cghId"
            initialValue={cghId}
            className="hidden-form"
          >
            <Input size="small" type="hidden" />
          </Form.Item>

          { !isEditMode
          && (
            <Form.Item
              label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.selection`)}
              name="analysis.tests"
              rules={[{
                required: true,
                message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.analyse`)} />,
              }]}
            >
              <Checkbox.Group
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
          ) }
          { isEditMode
          && (
            <Form.Item
              label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.selection`)}
              name="analysis.tests"
              initialValue={[initialAnalysisValue]}
              rules={[{
                required: true,
                message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.mrn`)} />,
              }]}
            >
              <Checkbox.Group
                className="clinical-information__analysis__checkbox-group"
                onChange={() => {
                  this.setState({});
                  validate();
                }}
              >
                { analysisTestOptions.map((option) => (
                  <Checkbox
                    disabled={
                      get(localStore, 'serviceRequest.status') === 'incomplete'
                      || (formTests.length === 1 && formTests.find((test) => test === option.code) == null)
                    }
                    value={option.code}
                  >{ option.display }
                  </Checkbox>
                )) }
              </Checkbox.Group>
            </Form.Item>
          ) }

          <Form.Item
            label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.comments`)}
            name="analysis.comments"
            initialValue={initialAnalysisNote}
          >
            <Row gutter={8}>
              <Col span={17}>
                <TextArea
                  placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.comments.placeholder`)}
                  rows={4}
                  defaultValue={initialAnalysisNote}
                />
              </Col>
              <Col>
                <Typography.Text className="optional-item__label">
                  { intl.get(`${intlPrefixKey}.form.validation.optional`) }
                </Typography.Text>
              </Col>
            </Row>
          </Form.Item>
        </Card>

        <Card
          title={intl.get(`${intlPrefixKey}.clinicalInformation.investigation`)}
          bordered={false}
          className="staticCard patientContent clinical-information__investigation"
        >
          <InvestigationSection
            interpretation={initialInterpretation}
            precision={initialPrecision}
            summary={initialSummaryNote}
          />
        </Card>
        <Card
          title={intl.get('screen.patient.header.familyHistory')}
          bordered={false}
          className="staticCard patientContent"
        >
          <FamilyStorySection familyHistoryResources={fmhResources} />
        </Card>
        <Card title="Signes cliniques" bordered={false} className="staticCard patientContent">
          <div className="separator">
            <div className="cardSeparator">
              <Form.Item
                name="hposTree"
                rules={[{
                  required: true,
                  message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.hposTree`)} />,
                }]}
              >
                <div className={submitFailed ? 'treeError hposTree' : 'hposTree'}>
                  <Form.Item className="searchInput searchInputFull">
                    <AutoComplete
                      className="searchInput"
                      placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.searchClinicalSign`)}
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

              </Form.Item>
            </div>
            <div className={hpoResources.length === 0 ? 'cardSeparator message' : 'cardSeparator'}>{
              hpoResources.length === 0
                ? <p>{ intl.get(`${intlPrefixKey}.clinicalInformation.validation.clinicalSign`) }</p>
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
        <Card
          title={intl.get(`${intlPrefixKey}.clinicalInformation.indications`)}
          bordered={false}
          className="staticCard patientContent"
        >
          <Form.Item
            label={intl.get(`${intlPrefixKey}.clinicalInformation.diagnosticHypothesis`)}
            name="indication"
            initialValue={initialIndicNote}
            rules={[
              {
                required: true,
                message: (
                  <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.diagnosticHypothesis`)} />
                ),
              },
              {
                whitespace: true,
                message: intl.get(`${intlPrefixKey}.clinicalInformation.validation.noSpace`),
              },
            ]}
          >
            <TextArea
              placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.hypothesis.placeholder`)}
              className="input note"
              rows={4}
            />
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
