/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button, Card, Form, Steps, Typography, Col, Row, Tooltip, Divider,
} from 'antd';
import find from 'lodash/find';
import has from 'lodash/has';
import debounce from 'lodash/debounce';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import toArray from 'lodash/values';

import { SaveOutlined, LeftOutlined } from '@ant-design/icons';

import { navigateToPatientSearchScreen, navigateToPatientScreen } from '../../../actions/router';
import {
  assignServiceRequestPractitioner,
  savePatientSubmission,
  savePatientLocal,
  saveObservations,
  saveServiceRequest,
  saveLocalCgh,
  saveLocalSummary,
  saveLocalIndic,
  updateConsentments,
  saveLocalPractitioner,
} from '../../../actions/patientSubmission';
import ClinicalInformation from './components/ClinicalInformation';
import Approval from './components/Approval';
import Api from '../../../helpers/api';
import ConfirmCancelModal from './components/ConfirmCancelModal';

import './style.scss';

import {
  cghDisplay,
  createPractitionerResource,
  genPractitionerKey,
  getTestCoding,
  hpoOnsetValues,
  hpoInterpretationValues,
  getFamilyRelationshipDisplayForCode,
} from '../../../helpers/fhir/fhir';
import { ObservationBuilder } from '../../../helpers/fhir/builder/ObservationBuilder.ts';
import Layout from '../../Layout';
import { ServiceRequestBuilder } from '../../../helpers/fhir/builder/ServiceRequestBuilder';
import { ClinicalImpressionBuilder } from '../../../helpers/fhir/builder/ClinicalImpressionBuilder';
import { createRequest } from '../../../actions/prescriptions';
import { updatePatientPractitioners } from '../../../actions/patientCreation';
import { FamilyMemberHistoryBuilder } from '../../../helpers/fhir/builder/FMHBuilder';

const { Step } = Steps;

const stringifyPractionerOption = (po) => `${po.family}, ${po.given} License No: ${po.license}`;
const practitionerOptionFromResource = (resource) => ({
  given: resource.name[0].given[0],
  family: resource.name[0].family,
  license: resource.identifier[0].value,
});

function PatientSubmissionScreen(props) {
  const [form] = Form.useForm();
  const isEditPrescription = get(props, 'localStore.serviceRequest.id', '').length > 0;

  const [state, setState] = React.useState({
    currentPageIndex: 0,
    practitionerOptions: [],
    valid: false,
    isCancelConfirmVisible: false,
    selectedPractitioner: get(props, 'localStore.requesterId', undefined),
    firstPageFields: {},
  });

  const getFields = () => (state.currentPageIndex === 0 ? form.getFieldsValue() : state.firstPageFields);

  const getValidValues = (array) => array.filter((obj) => !Object.values(obj).every((a) => a == null));

  const canGoNextPage = (currentPage) => {
    const { observations } = props;
    const { localStore } = props;

    const values = form.getFieldsValue();
    let hasError = null;
    switch (currentPage) {
      case 0: {
        const checkCghInterpretationValue = () => {
          if (values.cghInterpretationValue) {
            if (values.cghInterpretationValue !== 'A') {
              return true;
            }
            if (values.cghPrecision !== null) {
              return true;
            }
            return false;
          }
          return false;
        };

        const checkFamilyHistory = () => {
          const fmh = get(values, 'fmh', []);
          if (fmh.length > 0) {
            const checkValue = [];
            fmh.forEach((element) => {
              if (get(element, 'relation.length', '') === 0 || get(element, 'note.length', '') === 0) {
                checkValue.push(false);
              }
            });
            if (checkValue.includes(false)) {
              return false;
            }
            return true;
          }
          return true;
        };

        const checkHpo = () => {
          const hpos = getValidValues(get(values, 'hpos', []));
          if (hpos.length > 0) {
            const checkValue = hpos.map(
              (element) => get(element, 'interpretation') === null || get(element, 'onset') == null,
            );
            if (checkValue.includes(true)) {
              return false;
            }
            return true;
          }
          return false;
        };

        hasError = find(form.getFieldsError(), (o) => o.errors.length > 0);

        if (values['analysis.tests']
            && checkHpo()
            && checkCghInterpretationValue()
            && checkFamilyHistory()
            && values.indication
            && values.mrn
            && values.organization
            && !hasError
        ) {
          return false;
        }
        return true;
      }
      case 1:
        hasError = find(form.getFieldsError(), (o) => o.errors.length > 0);
        if (hasError) {
          return true;
        }
        if (values.consent != null && values.consent.length > 0 && localStore.practitioner != null && localStore.practitioner.length > 0) {
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const validate = () => {
    const valid = !canGoNextPage(state.currentPageIndex);

    if (valid && !state.valid) {
      setState((currentState) => ({
        ...currentState,
        valid: true,
      }));
    } else if (!valid && state.valid) {
      setState((currentState) => ({
        ...currentState,
        valid: false,
      }));
    }
  };

  React.useEffect(() => {
    validate();
  });
  const { localStore } = props;

  const createCGHResourceList = () => {
    const values = getFields();
    if (values.cghInterpretationValue === undefined || values.cghInterpretationValue === 'non-realized') {
      return undefined;
    }

    const {
      cghInterpretationValue,
    } = values;

    const cghResult = values['cgh.result'];

    const cghPrecision = values['cgh.precision'] ? values['cgh.precision'].trim() : undefined;
    const builder = new ObservationBuilder('CGH')
      .withId(get(localStore, 'cgh.id'))
      .withStatus('final');

    if (cghInterpretationValue === 'realized') {
      builder.withInterpretation({
        coding: [{
          display: cghDisplay(cghResult),
          code: cghResult,
        }],
      });
    }

    if (cghPrecision != null && cghPrecision.length > 0) {
      builder.withNote(cghPrecision);
    }

    return builder.build();
  };

  const createIndicationResourceList = () => {
    const values = getFields();

    if (values.indication === undefined) {
      return [];
    }

    let {
      indication,
    } = values;

    indication = indication ? indication.trim() : indication;

    const builder = new ObservationBuilder('INDIC');
    builder.withId(get(localStore, 'indic.id'));
    if (indication != null) {
      builder.withNote(indication);
    }

    return builder.build();
  };

  const createSummary = (note) => {
    // const values = getFields();
    const builder = new ObservationBuilder('INVES');
    builder.withId(get(localStore, 'inves.id'));

    if (note == null && localStore.summary.note != null) {
      builder.withNote(localStore.summary.note);
    } else {
      builder.withNote(note);
    }
    return builder.build();
  };

  const saveClinicalInfoPageLocalStore = () => {
    const { actions } = props;
    const values = getFields();

    actions.saveServiceRequest(values.analyse);
    actions.saveLocalCgh(values.cghInterpretationValue, values.cghPrecision);
    actions.saveLocalSummary(values.summaryNote);
    actions.saveLocalIndic(values.indication);
  };

  const buildHpoObservation = (hpo) => {
    const observation = new ObservationBuilder('HPO')
      .withId(hpo.id)
      .withInterpretation({
        coding: [{
          display: hpoInterpretationValues().find((interpretation) => interpretation.value === hpo.interpretation).display,
          code: hpo.interpretation,
        }],
      })
      .withValue({
        coding: [{
          code: hpo.code,
          display: hpo.display,
        }],
      })
      .withNote(hpo.note)
      .build();

    let value = null;
    const keys = Object.keys(hpoOnsetValues);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      const group = hpoOnsetValues[key];
      value = group.options.find((onSet) => onSet.code === hpo.onset);
      if (value != null) {
        break;
      }
    }

    observation.extension.push({
      url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
      valueCoding: {
        code: value.code,
        display: value.display,
      },
    });
    return observation;
  };

  const saveSubmission = (submitted = false) => {
    form.validateFields().then((data) => {
      const {
        actions, observations, userRole, currentPatient,
      } = props;

      const content = state.currentPageIndex === 0 ? data : state.firstPageFields;

      const batch = {
        serviceRequests: [],
        clinicalImpressions: [],
        observations: [],
        hpos: [],
        fmhs: [],
        length: 0,
        submitted,
      };

      const allAnalysis = content['analysis.tests'];
      batch.length = get(allAnalysis, 'length', 0);

      if (batch.length === 0) {
        return;
      }

      const { mrn, organization } = content;

      allAnalysis.forEach((analysis) => {
        batch.serviceRequests.push(new ServiceRequestBuilder()
          .withId(get(localStore, 'serviceRequest.id'))
          .withMrn(mrn, organization)
          .withRequester(state.selectedPractitioner)
          .withSubject(currentPatient.id)
          .withCoding(getTestCoding(analysis))
          .withSubmitted(submitted, userRole.id)
          .build());
        batch.clinicalImpressions.push(new ClinicalImpressionBuilder()
          .withId(get(localStore, 'clinicalImpression.id'))
          .withSubmitted(submitted)
          .withSubject(currentPatient.id)
          .withAge(1)
          .withAssessorId(userRole.id)
          .build());
      });

      batch.hpos = getValidValues(get(content, 'hpos', [])).map(buildHpoObservation);
      batch.fmhs = get(content, 'fmh', []).filter(
        (fmh) => fmh.note != null && fmh.relation != null,
      ).map(
        (fmh) => new FamilyMemberHistoryBuilder(fmh.relation, getFamilyRelationshipDisplayForCode(fmh.relation))
          .withId(fmh.id)
          .withNote(fmh.note)
          .withPatient(currentPatient.id)
          .build(),
      );

      const cghObservation = createCGHResourceList();
      if (cghObservation != null) {
        batch.observations.push(cghObservation);
      }
      batch.observations.push(createIndicationResourceList());

      if (content.summaryNote != null) {
        batch.observations.push(createSummary(content.summaryNote));
      }

      actions.createRequest(batch);
      actions.updatePatientPractitioners(batch.serviceRequests[0], batch.clinicalImpressions[0]);
    });
  };

  const isFirstPage = () => {
    const { currentPageIndex } = state;
    return currentPageIndex === 0;
  };

  const handlePractitionerOptionSelected = (selected) => {
    const { actions } = props;
    const { practitionerOptions } = state;
    const practitioner = practitionerOptions.find((o) => genPractitionerKey(o) === selected);

    if (practitioner != null) {
      const practitionerText = genPractitionerKey(practitioner);
      actions.saveLocalPractitioner(practitionerText);
      const resource = createPractitionerResource(practitioner);
      actions.assignServiceRequestPractitioner(resource);

      setState((currentState) => ({
        ...currentState,
        selectedPractitioner: practitioner.id,
      }));
    }
  };

  const handlePractitionerSearchTermChanged = (term, callback = null) => {
    if (term == null) {
      return;
    }
    const normalizedTerm = term.toLowerCase().trim();

    if (normalizedTerm.length > 0 && normalizedTerm.length < 10) {
      const params = { term: normalizedTerm };
      Api.searchPractitioners(params).then((response) => {
        if (response.payload) {
          const { data } = response.payload;

          const result = [];
          if (data.entry != null) {
            data.entry.forEach((entry) => {
              const { resource } = entry;
              if (resource != null && resource.name != null && resource.name.length > 0) {
                result.push({
                  id: resource.id,
                  family: resource.name[0].family,
                  given: resource.name[0].given[0],
                  license: resource.identifier[0].value,
                });
              }
            });
          }

          setState((currentState) => ({
            ...currentState,
            practitionerOptions: result,
          }));

          if (callback != null) {
            callback();
          }
        }
      });
    }
  };

  const searchPractitioner = (term) => {
    handlePractitionerSearchTermChanged(term);
  };

  const next = () => {
    const { currentPageIndex } = state;
    const pageIndex = currentPageIndex + 1;
    setState({ ...state, currentPageIndex: pageIndex, firstPageFields: form.getFieldsValue() });
    debounce(validate, 500)();
  };

  const previous = () => {
    const { currentPageIndex } = state;
    const pageIndex = currentPageIndex - 1;
    setState({ ...state, currentPageIndex: pageIndex });

    if (currentPageIndex === 0) {
      saveClinicalInfoPageLocalStore();
    }

    debounce(validate, 500)();
  };

  const handleCancel = () => {
    const { actions, patient } = props;
    actions.navigateToPatientScreen(patient.id, 'clinical', true);
  };

  const onFormFinish = (isOnLastPage) => {
    if (isOnLastPage) {
      saveSubmission(true);
    } else {
      next();
    }
  };

  const { actions } = props;
  const { patient, clinicalImpression, serviceRequest } = props;
  const { practitionerOptions, currentPageIndex } = state;

  const assignedPractitioner = serviceRequest ? serviceRequest.requester : null;
  const assignedPractitionerLabel = assignedPractitioner && has(assignedPractitioner, 'resourceType')
    ? stringifyPractionerOption(practitionerOptionFromResource(assignedPractitioner))
    : '';

  const consents = get(localStore, 'consents', []);
  const initialPractitionerValue = get(localStore, 'practitioner', '');

  const practitionerOptionsLabels = practitionerOptions.map((practitioner) => (
    {
      value: genPractitionerKey(practitioner),
      label: (
        <>
          <div className="page3__autocomplete">
            <span className="page3__autocomplete__family-name">{ practitioner.family.toUpperCase() }</span> { practitioner.given }
            { practitioner.license != null && practitioner.license.length > 0 && <> – { practitioner.license }</> }
          </div>
        </>
      ),
    }
  ));

  const pages = [
    {
      title: intl.get('screen.clinicalSubmission.clinicalInformation'),
      content: (
        <ClinicalInformation
          parentForm={this}
          form={form}
          patient={patient}
          clinicalImpression={clinicalImpression}
          validate={validate}
        />
      ),
      name: 'ClinicalInformation',
      values: {},
      isComplete: () => true,
    },
    {
      title: intl.get('screen.clinicalSubmission.approval'),
      content: (
        <Approval
          parentForm={this}
          dataSource={practitionerOptionsLabels}
          practitionerOptionSelected={handlePractitionerOptionSelected}
          practitionerSearchTermChanged={searchPractitioner}
          assignedPractitionerLabel={assignedPractitionerLabel}
          initialConsentsValue={consents}
          initialPractitionerValue={initialPractitionerValue}
          updateConsentmentsCallback={actions.updateConsentments}
          disabled={initialPractitionerValue != null && get(localStore, 'status', 'draft') !== 'draft'}
        />
      ),
      name: 'Approval',
      values: {},
    },
  ];
  const { Title } = Typography;
  const currentPage = pages[currentPageIndex];
  const pageContent = currentPage.content;
  const isOnLastPage = currentPageIndex === pages.length - 1;
  return (
    <Layout>
      <>
        <Row className="page_headerStaticMargin">
          <Col>
            <Title className="header__content--static" level={3}>
              <Typography.Text
                className="header__content--static__primary"
              >
                { `${intl.get('form.patientSubmission.form.title')}` }
                <Divider type="vertical" className="patientSubmission__header__divider" />
                { ` ${has(patient, 'name[0].family') ? patient.name[0].family.toUpperCase() : ''}`
              + ` ${has(patient, 'name[0].given[0]') ? patient.name[0].given[0] : ''}` }
              </Typography.Text>
            </Title>

          </Col>
          <Col flex={1}>&nbsp;</Col>
          <Col>

            <Button
              onClick={() => setState((prevState) => ({ ...prevState, isCancelConfirmVisible: true }))}
              danger
              type="text"
            >
              { intl.get('screen.clinicalSubmission.cancelButtonTitle') }
            </Button>
          </Col>
        </Row>

        <div className="page-static-content">
          <Card bordered={false} className="step">
            <Steps current={currentPageIndex}>
              { pages.map((item) => <Step key={item.title} title={item.title} />) }
            </Steps>
          </Card>

          <Form
            form={form}
            onFinish={() => onFormFinish(isOnLastPage)}
            onChange={validate}
          >
            { pageContent }
            <Card className="patientSubmission__form__footer">
              <Row gutter={8}>
                { !isFirstPage && (
                  <Col>
                    <Button icon={<LeftOutlined />} onClick={previous}>
                      { intl.get('screen.clinicalSubmission.previousButtonTitle') }
                    </Button>
                  </Col>
                ) }
                <Col>
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={!state.valid}
                  >
                    {
                      isOnLastPage
                        ? intl.get('form.patientSubmission.form.submit')
                        : intl.get('screen.clinicalSubmission.nextButtonTitle')
                    }
                  </Button>
                </Col>
                <Col flex={1}>&nbsp;</Col>
                <Col>
                  <Tooltip placement="top" title="Enregistrez les données de cette prescription et complétez-la plus tard.">
                    <Button
                      onClick={() => saveSubmission()}
                      disabled={!state.valid || isEditPrescription}
                    >
                      <SaveOutlined />
                      { intl.get('screen.clinicalSubmission.saveButtonTitle') }
                    </Button>
                  </Tooltip>

                </Col>
                <Col>
                  <Button
                    onClick={() => setState((prevState) => ({ ...prevState, isCancelConfirmVisible: true }))}
                    danger
                    type="text"
                  >
                    { intl.get('screen.clinicalSubmission.cancelButtonTitle') }
                  </Button>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>
      </>
      <ConfirmCancelModal
        open={state.isCancelConfirmVisible}
        onClose={() => setState((prevState) => ({ ...prevState, isCancelConfirmVisible: false }))}
        onQuit={() => handleCancel()}
        onSaveAndQuit={() => {
          saveSubmission();
          handleCancel();
        }}
      />
    </Layout>
  );
}

PatientSubmissionScreen.propTypes = {
  router: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientSearchScreen,
    navigateToPatientScreen,
    savePatientSubmission,
    savePatientLocal,
    assignServiceRequestPractitioner,
    saveObservations,
    saveServiceRequest,
    saveLocalCgh,
    saveLocalSummary,
    saveLocalIndic,
    updateConsentments,
    saveLocalPractitioner,
    createRequest,
    updatePatientPractitioners,
  }, dispatch),
});

const mapStateToProps = (state) => ({
  app: state.app,
  router: state.router,
  serviceRequest: state.patientSubmission.serviceRequest,
  patient: state.patientSubmission.patient,
  groupId: state.patientSubmission.groupId,
  clinicalImpression: state.patientSubmission.clinicalImpression,
  observations: state.patientSubmission.observations,
  deleted: state.patientSubmission.deleted,
  practitionerId: state.patientSubmission.practitionerId,
  search: state.search,
  localStore: state.patientSubmission.local,
  currentPatient: state.patientSubmission.patient,
  userRole: state.user.practitionerData.practitionerRole,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSubmissionScreen);
