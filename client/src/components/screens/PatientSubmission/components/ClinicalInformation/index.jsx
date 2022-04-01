/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { getServiceRequestCode } from 'actions/serviceRequest';
import {
  AutoComplete, Button, Card, Checkbox, Col, Form, Input, Popconfirm, Row, Select, Typography,
} from 'antd';
import Api from 'helpers/api';
import { ObservationBuilder } from 'helpers/fhir/builder/ObservationBuilder.ts';
import {
  getHPOCode,
  getHPODisplay,
  getHPOInterpretationCode,
  getHPOOnsetCode,
  getResourceId,
  hpoInterpretationValues,
  hpoOnsetValues,
} from 'helpers/fhir/fhir';
import { getObservationValue } from 'helpers/fhir/fhir';
import { PrescriptionStatus } from 'helpers/fhir/types';
import { findLocalDesignationIfExists } from 'helpers/ServiceRequestCode';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import map from 'lodash/map';
import toArray from 'lodash/values';
import { bindActionCreators } from 'redux';

import { getObservedIcon } from 'components/Utils/getObservedIcon';

import ErrorText from './components/ErrorText';
import FamilyStorySection from './components/FamilyStorySection';
import InvestigationSection from './components/InvestigationSection';
import MrnItem from './components/MrnItem';
import OntologyTree from './components/OntologyTree';

const ROOT_PHENOTYPE = 'Phenotypic abnormality (HP:0000118)';

const intlPrefixKey = 'form.patientSubmission';

const HpoHiddenFields = ({
  hpoIndex,
  hpoResource,
}) => (
  <div>
    <Form.Item className="hidden-form" initialValue={getResourceId(hpoResource)} name={['hpos', hpoIndex, 'id']}>
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item className="hidden-form" initialValue={getHPOCode(hpoResource)} name={['hpos', hpoIndex, 'code']}>
      <Input size="small" type="hidden" />
    </Form.Item>
    <Form.Item className="hidden-form" initialValue={getHPODisplay(hpoResource)} name={['hpos', hpoIndex, 'display']}>
      <Input size="small" type="hidden" />
    </Form.Item>
  </div>
);

export const hpoDisplayName = (key, name) => `${name} (${key})`;


class ClinicalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hpoInterpretation: [],
      hpoOptions: [],
      treeData: [],
    };

    this.handleHpoSearchTermChanged = this.handleHpoSearchTermChanged.bind(this);
    this.handleHpoOptionSelected = this.handleHpoOptionSelected.bind(this);
    this.handleHpoDeleted = this.handleHpoDeleted.bind(this);
    this.handleHpoNodesChecked = this.handleHpoNodesChecked.bind(this);
    this.hpoSelected = this.hpoSelected.bind(this);
    this.isAddDisabled = this.isAddDisabled.bind(this);
    this.isStatusIncomplete = this.isStatusIncomplete.bind(this);
    this.givenCodeIsTheOnlyOneSelected = this.givenCodeIsTheOnlyOneSelected.bind(this);
  }

  componentDidUpdate() {
    const { onChange } = this.props;
    onChange();
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getServiceRequestCode();
    Api.searchHpoChildren(ROOT_PHENOTYPE)
      .then((res) => {
        const phenotypes = (res.payload?.data?.data.hits || [])
          .map((h) => ({ key: h._source.hpo_id, title: h._source.name }));
        this.setState({
          treeData: [...phenotypes],
        });
      });
  }



  phenotype({
    deleteHpo,
    form,
    hpoIndex,
    hpoResource,
  }) {
    const { OptGroup, Option } = Select;

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
      <div className="phenotypeBlock" key={hpoResource.valueCodeableConcept.coding[0].code}>
        <div className="phenotypeFirstLine">
          <div className="leftBlock">
            <span className="hpoTitle">{ getHPODisplay(hpoResource) }</span>
            <Popconfirm
              cancelText={intl.get(`${intlPrefixKey}.form.hpo.confirm.no`)}
              okText={intl.get(`${intlPrefixKey}.form.hpo.confirm.yes`)}
              onConfirm={() => deleteHpo(getHPOCode(hpoResource))}
              placement="top"
              title={intl.get(`${intlPrefixKey}.form.hpo.confirm.text`)}
            >
              <Button
                className="button--borderless deleteButton"
                type="link"
              >
                { intl.get(`${intlPrefixKey}.clinicalInformation.delete`) }
              </Button>
            </Popconfirm>
          </div>
          <HpoHiddenFields deleteHpo={deleteHpo} form={form} hpoIndex={hpoIndex} hpoResource={hpoResource} />
          <div className="rightBlock">
            <Form.Item
              initialValue={getHPOInterpretationCode(hpoResource)}
              name={['hpos', hpoIndex, 'interpretation']}
            >
              <Select
                className="select selectObserved"
                defaultValue={getHPOInterpretationCode(hpoResource)}
                dropdownClassName="selectDropdown"
                onChange={onChangeInterpretation}
                placeholder={intl.get(`${intlPrefixKey}.form.hpo.interpretation`)}
                size="small"
                data-testid="InterpretationDropdown"
              >
                { hpoInterpretationValues().map((interpretation, index) => (
                  <Select.Option
                    key={`hpoInterpretation_${index}`}
                    value={interpretation.value}
                  >
                    <div className='icon'>{ getObservedIcon(interpretation.value) }</div>
                    { interpretation.display }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>
            <Form.Item
              initialValue={getHPOOnsetCode(hpoResource)}
              name={['hpos', hpoIndex, 'onset']}
            >
              <Select
                className="select selectAge"
                defaultValue={getHPOOnsetCode(hpoResource)}
                disabled={!hpoInterpretation.includes(getHPODisplay(hpoResource))}
                dropdownClassName="selectDropdown"
                onChange={onChange}
                placeholder={intl.get(`${intlPrefixKey}.form.hpo.ageAtOnset`)}
                size="small"
              >
                {
                  hpoOnsetValues.map((group, gIndex) => (
                    <OptGroup key={`onsetGroup_${gIndex}`} label={group.groupLabel}>
                      { group.options.map((o, oIndex) => (
                        <Option key={`${gIndex}_onsetOption_${oIndex}`} value={o.code}>{ o.display }</Option>
                      )) }
                    </OptGroup>
                  ))
                }
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="phenotypeSecondLine" key={`input-${hpoIndex}`}>
          <Form.Item initialValue={defaultValue()} name={['hpos', hpoIndex, 'note']}>
            <Input className="input hpoNote" placeholder="Ajouter une note…" size="small" value={defaultValue()} />
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
    const { form, hpoResources, onHposUpdated } = this.props;

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
      form, hpoResources, onChange, onHposUpdated,
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

  isStatusIncomplete() {
    const { serviceRequest } = this.props
    return serviceRequest.status === PrescriptionStatus.incomplete
  }
  givenCodeIsTheOnlyOneSelected(code) {
    const { form } = this.props
    const selectedAnalysisTests = (form.getFieldValue('analysis.tests') || []).filter((test) => test);
    const hasOnlyOneSelectedTest = selectedAnalysisTests.length === 1;
    const codeIsSelected =selectedAnalysisTests.some((test) => test === code);
    return (hasOnlyOneSelectedTest && codeIsSelected)
  }

  render() {
    const {
      hpoOptions, treeData,
    } = this.state;

    const hpoOptionsLabels = map(hpoOptions, 'name');
    const {
      fmhResources, form, hpoResources, observations, onChange, serviceRequest, serviceRequestCode, submitFailed, validate,
    } = this.props;
    const { TextArea } = Input;
    let cghId = null;
    if (observations.cgh != null) {
      cghId = observations.cgh?.id;
    }

    const hpoCodes = hpoResources.filter((r) => !r.toDelete).map(getHPOCode);

    const initialAnalysisValue = serviceRequest.code;
    let initialAnalysisNote = serviceRequest.note;
    const initialInterpretation = observations?.cgh?.interpretation?.[0]?.coding?.[0]?.code ?? null;
    const initialPrecision =  observations?.cgh?.note?.[0]?.text ?? null;
    const initialIndicNote = getObservationValue(observations.indic, null);
    const initialSummaryNote = getObservationValue(observations.summary, null);
    const initialConsanguinityValue = {
      id: observations.cons?.id,
      value:  observations.cons?.valueBoolean
    }

    const isEditMode = initialAnalysisValue != null;

    if (form.getFieldValue('analysis.comments')) {
      initialAnalysisNote = initialAnalysisNote !== form.getFieldValue('analysis.comments')
        ? form.getFieldValue('analysis.comments')
        : initialAnalysisNote;
    }
    return (
      <div className="clinical-information">

        <Card
          bordered={false}
          className="staticCard patientContent"
          id="MedicalFileSection"
          title={intl.get(`${intlPrefixKey}.clinicalInformation.medicalFile`)}
        >
          <Form.Item label={intl.get(`${intlPrefixKey}.clinicalInformation.file`)}>
            <MrnItem form={form} onChange={() => onChange()} />
          </Form.Item>
        </Card>

        <Card
          bordered={false}
          className="staticCard patientContent clinical-information__analysis"
          id="AnalysisSection"
          title={intl.get(`${intlPrefixKey}.clinicalInformation.analysis`)}
        >
          <Form.Item
            className="hidden-form"
            initialValue={cghId}
            name="cghId"
          >
            <Input size="small" type="hidden" />
          </Form.Item>

          { !isEditMode
          && (
            <Form.Item
              label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.selection`)}
              name="analysis.tests"
              rules={[{
                message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.analyse`)} />,
                required: true,
              }]}
            >
              <Checkbox.Group
                className="clinical-information__analysis__checkbox-group"
                data-testid="clinical-information-analysis-checkbox-group"
              >
                {
                  serviceRequestCode?.map((concept) => (
                    <Checkbox
                      key={concept.code}
                      value={concept.code}
                      data-testid={concept.code}
                    >{ findLocalDesignationIfExists(concept, this.props.lang) || concept.display}
                    </Checkbox>
                  ))
                }
              </Checkbox.Group>
            </Form.Item>
          ) }
          { isEditMode
          && (
            <Form.Item
              id="ValidationMrn"
              initialValue={[initialAnalysisValue]}
              label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.selection`)}
              name="analysis.tests"
              rules={[{
                message: <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.mrn`)} />,
                required: true,
              }]}
            >
              <Checkbox.Group
                className="clinical-information__analysis__checkbox-group"
                data-testid="clinical-information-analysis-checkbox-group"
                onChange={() => {
                  this.setState({});
                  validate();
                }}
              >
                {
                  serviceRequestCode?.map((concept) => (
                    <Checkbox
                      key={concept.code}
                      value={concept.code}
                      data-testid={concept.code}
                    >{ findLocalDesignationIfExists(concept, this.props.lang) || concept.display }
                    </Checkbox>
                  ))
                }
              </Checkbox.Group>
            </Form.Item>
          ) }

          <Form.Item
            initialValue={initialAnalysisNote}
            label={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.comments`)}
            name="analysis.comments"
          >
            <Row gutter={8}>
              <Col span={17}>
                <TextArea
                  defaultValue={initialAnalysisNote}
                  placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.analysis.comments.placeholder`)}
                  rows={4}
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
          bordered={false}
          className="staticCard patientContent clinical-information__investigation"
          id="InvestigationSection"
          title={intl.get(`${intlPrefixKey}.clinicalInformation.investigation`)}
        >
          <InvestigationSection
            interpretation={initialInterpretation}
            isEditMode={isEditMode}
            precision={initialPrecision}
            summary={initialSummaryNote}
          />
        </Card>

        <Card
          bordered={false}
          className="staticCard patientContent"
          id="FamilyHistorySection"
          title={intl.get('screen.patient.header.familyHistory')}
        >
          <FamilyStorySection consanguinity={initialConsanguinityValue} familyHistoryResources={fmhResources} isEditMode={isEditMode}/>
        </Card>
        <Card bordered={false} className="staticCard patientContent" title="Signes cliniques">
          <div className="separator">
            <div className="cardSeparator">
              <Form.Item
                name="hposTree"
              >
                <div className={submitFailed ? 'treeError hposTree' : 'hposTree'}>
                  <Form.Item className="searchInput searchInputFull">
                    <AutoComplete
                      className="searchInput"
                      dataSource={hpoOptionsLabels}
                      onChange={this.handleHpoSearchTermChanged}
                      onSelect={this.handleHpoOptionSelected}
                      placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.searchClinicalSign`)}
                    />

                  </Form.Item>
                  <OntologyTree
                    checkedKeys={hpoCodes}
                    loadData={this.onLoadHpoChildren}
                    onCheck={this.handleHpoNodesChecked}
                    treeData={treeData}
                  />
                </div>

              </Form.Item>
            </div>
            <div className={hpoResources.length === 0 ? 'cardSeparator message' : 'cardSeparator'}>{
              hpoResources.length === 0
                ? <p>{ intl.get(`${intlPrefixKey}.clinicalInformation.validation.clinicalSign`) }</p>
                : hpoResources.map((hpoResource, hpoIndex) => this.phenotype({
                  deleteHpo: this.handleHpoDeleted,
                  form,
                  hpoIndex,
                  hpoResource,
                }))
            }
            </div>
          </div>

        </Card>
        <Card
          bordered={false}
          className="staticCard patientContent"
          title={intl.get(`${intlPrefixKey}.clinicalInformation.indications`)}
        >
          <Form.Item
            initialValue={initialIndicNote}
            label={intl.get(`${intlPrefixKey}.clinicalInformation.diagnosticHypothesis`)}
            name="indication"
            rules={[
              {
                message: (
                  <ErrorText text={intl.get(`${intlPrefixKey}.clinicalInformation.validation.diagnosticHypothesis`)} />
                ),
              },
              {
                message: intl.get(`${intlPrefixKey}.clinicalInformation.validation.noSpace`),
                whitespace: true,
              },
            ]}
          >
            <TextArea
              className="input note"
              placeholder={intl.get(`${intlPrefixKey}.clinicalInformation.hypothesis.placeholder`)}
              rows={4}
              data-testid="hypothesis-placeholder"
            />
          </Form.Item>
        </Card>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getServiceRequestCode
  }, dispatch),
});

const mapStateToProps = (state) => ({
  clinicalImpression: state.patientSubmission.clinicalImpression,
  observations: state.patientSubmission.observations,
  serviceRequest: state.patientSubmission.serviceRequest,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClinicalInformation);
