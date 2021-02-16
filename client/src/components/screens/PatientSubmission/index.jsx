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
} from '../../../helpers/fhir/fhir';
import { ObservationBuilder } from '../../../helpers/fhir/builder/ObservationBuilder.ts';
import Layout from '../../Layout';
import { PatientBuilder } from '../../../helpers/fhir/builder/PatientBuilder';
import { ServiceRequestBuilder } from '../../../helpers/fhir/builder/ServiceRequestBuilder';
import { ClinicalImpressionBuilder } from '../../../helpers/fhir/builder/ClinicalImpressionBuilder';
import { createRequest } from '../../../actions/prescriptions';

const { Step } = Steps;

const stringifyPractionerOption = (po) => `${po.family}, ${po.given} License No: ${po.license}`;
const practitionerOptionFromResource = (resource) => ({
  given: resource.name[0].given[0],
  family: resource.name[0].family,
  license: resource.identifier[0].value,
});

const SERVICE_REQUEST_CODE_SYSTEM = 'http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code';

const getTestCoding = (name) => {
  switch (name) {
    case 'adultCancerPredisposition': return {
      code: 'PCA',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.adultCancerPredisposition'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'kidTumorPredisposition': return {
      code: 'PTSE',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.kidTumorPredisposition'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'kidHematopathiesPredisposition': return {
      code: 'PHME',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.kidHematopathiesPredisposition'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'ehlersDanlos': return {
      code: 'SED',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.ehlersDanlos'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'polymalformatifs': return {
      code: 'SP',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.polymalformatifs'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'muscle': return {
      code: 'MM',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.muscle'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'amyotrophicLateralSclerosis': return {
      code: 'SLA',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.amyotrophicLateralSclerosis'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'retinopathies': return {
      code: 'RET',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.retinopathies'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'deafness': return {
      code: 'SUR',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.deafness'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'intellecualDisability': return {
      code: 'DI',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.intellecualDisability'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'nuclearMitochondrialGenes': return {
      code: 'GMN',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.nuclearMitochondrialGenes'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'rasopathies': return {
      code: 'RAS',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.rasopathies'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'cardiomyopathies': return {
      code: 'CAR',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.cardiomyopathies'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'hereditaryArrhythmias': return {
      code: 'AH',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.hereditaryArrhythmias'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    case 'aortopathies': return {
      code: 'AOR',
      display: intl.get('form.patientSubmission.clinicalInformation.analysis.options.aortopathies'),
      system: SERVICE_REQUEST_CODE_SYSTEM,
    };
    default:
      throw new Error(`Invalid test name [${name}]`);
  }
};

function PatientSubmissionScreen(props) {
  const [form] = Form.useForm();

  const [state, setState] = React.useState({
    currentPageIndex: 0,
    practitionerOptions: [],
    valid: false,
    isCancelConfirmVisible: false,
    selectedPractitioner: null,
    firstPageFields: {},
  });

  const getFields = () => (state.currentPageIndex === 0 ? form.getFieldsValue() : state.firstPageFields);

  const getPatientData = () => {
    const { currentPageIndex } = state;
    const { patient } = props;
    let values = getFields();

    const getEthnicityDisplay = (ethnicity) => {
      switch (ethnicity) {
        case 'CA-FR':
          return intl.get('form.patientSubmission.form.ethnicity.cafr');
        case 'EU':
          return intl.get('form.patientSubmission.form.ethnicity.eu');
        case 'AFR':
          return intl.get('form.patientSubmission.form.ethnicity.afr');
        case 'LAT-AM':
          return intl.get('form.patientSubmission.form.ethnicity.latam');
        case 'ES-AS':
          return intl.get('form.patientSubmission.form.ethnicity.esas');
        case 'SO-AS':
          return intl.get('form.patientSubmission.form.ethnicity.soas');
        case 'ABOR':
          return intl.get('form.patientSubmission.form.ethnicity.abor');
        case 'MIX':
          return intl.get('form.patientSubmission.form.ethnicity.mix');
        case 'OTH':
          return intl.get('form.patientSubmission.form.ethnicity.oth');
        default:
          return '';
      }
    };

    if (currentPageIndex === 0) {
      values.ramq = values.ramq.toUpperCase();
      const gender = typeof values.gender === 'string' ? get(values, 'gender', '') : get(values, 'gender.target.value', '');

      values = mapValues(values, (o) => {
        if (typeof o === 'string') {
          return o.trim();
        }
        return o;
      });

      const value = new PatientBuilder()
        .withId(patient.id)
        .withFamily(values.family)
        .withGiven(values.given)
        .withMrn(values.mrn)
        .withOrganization(values.organization)
        .withBloodRelationship(values.consanguinity)
        .withEthnicityCode(values.ethnicity ? values.ethnicity : '')
        .withEthnicityDisplay(getEthnicityDisplay(values.ethnicity))
        .withActive(true)
        .withBirthDate(new Date(values.birthDate.toDate()))
        .withGeneralPractitioners(patient.generalPractitioner)
        .withGender(gender)
        .build();

      return value;
    }

    return { ...patient };
  };

  const getServiceRequestCode = () => {
    const values = form.getFieldsValue();

    if (values.analyse != null) {
      return values.analyse;
    }

    const { localStore } = props;
    return localStore.serviceRequest.code;
  };

  const canGoNextPage = (currentPage) => {
    const { observations } = props;
    const { localStore } = props;

    const values = form.getFieldsValue();
    let hasError = null;
    switch (currentPage) {
      case 0: {
        const checkIfEmptyValue = (array) => array != null && array.findIndex((element) => !element) === -1;
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
          const frm = toArray(values.familyRelationshipNotes);
          const frc = toArray(values.familyRelationshipCodes);
          if ((checkIfEmptyValue(frm) && !checkIfEmptyValue(frc)) || (!checkIfEmptyValue(frm) && checkIfEmptyValue(frc))) {
            return false;
          }
          return true;
        };

        const checkHpo = () => {
          if (observations.hpos.length > 0) {
            const checkValue = [];
            observations.hpos.forEach((element) => {
              if (element.interpretation.length === 0 || element.extension.length === 0) {
                checkValue.push(false);
              }
            });
            if (checkValue.includes(false)) {
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
    if (indication != null) {
      builder.withNote(indication);
    }

    return builder.build();
  };

  const { localStore } = props;

  const createSummary = (note) => {
    // const values = getFields();
    const builder = new ObservationBuilder('INVES');

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

      allAnalysis.forEach((analysis) => {
        batch.serviceRequests.push(new ServiceRequestBuilder()
          .withRequester(get(state.selectedPractitioner, 'id'))
          .withSubject(currentPatient.id)
          .withCoding(getTestCoding(analysis))
          .withSubmitted(submitted, userRole.id)
          .build());
        batch.clinicalImpressions.push(new ClinicalImpressionBuilder()
          .withSubmitted(submitted)
          .withSubject(currentPatient.id)
          .withAge(1)
          .withAssessorId(userRole.id)
          .build());
      });

      batch.hpos = observations.hpos;
      batch.fmhs = observations.fmh.filter((fmh) => !isEmpty(fmh));

      const cghObservation = createCGHResourceList();
      if (cghObservation != null) {
        batch.observations.push(cghObservation);
      }
      batch.observations.push(createIndicationResourceList());

      if (content.summaryNote != null) {
        batch.observations.push(createSummary(content.summaryNote));
      }

      actions.createRequest(batch);
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
        selectedPractitioner: practitioner,
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
    const { editMode, actions, patient } = props;

    if (editMode) {
      actions.navigateToPatientScreen(patient.id, 'clinical', true);
    } else {
      actions.navigateToPatientSearchScreen();
    }
  };

  const onFormFinish = (isOnLastPage) => {
    const { actions } = props;
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
            <Title className="headerStaticContent" level={3}>
              <Typography.Text
                className="headerStaticContent__primary"
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
                      disabled={!state.valid}
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
  editMode: state.patientSubmission.editMode,
  currentPatient: state.patientSubmission.patient,
  userRole: state.user.practitionerData.practitionerRole,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSubmissionScreen);
