/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button, Card, Form, Steps, Typography, Col, Row, Tooltip, Divider, Alert,
} from 'antd';
import find from 'lodash/find';
import has from 'lodash/has';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { WarningOutlined, SaveOutlined, LeftOutlined } from '@ant-design/icons';

import { navigateToPatientSearchScreen, navigateToPatientScreen } from '../../../actions/router';
import {
  assignServiceRequestPractitioner,
  assignServiceRequestResident,
  savePatientSubmission,
  savePatientLocal,
  saveObservations,
  saveServiceRequest,
  saveLocalCgh,
  saveLocalSummary,
  saveLocalIndic,
  updateConsentments,
  saveLocalPractitioner,
  saveLocalResident,
} from '../../../actions/patientSubmission';
import ClinicalInformation from './components/ClinicalInformation';
import SecondPage from './components/SecondPage';
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

const isFetus = (patient) => patient?.extension.find(
  (ext) => ext.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
)?.valueBoolean || false;

function PatientSubmissionScreen(props) {
  const [form] = Form.useForm();

  const [state, setState] = React.useState({
    currentPageIndex: 0,
    practitionerOptions: [],
    valid: false,
    isCancelConfirmVisible: false,
    selectedPractitioner: get(props, 'localStore.requesterId', undefined),
    selectedResident: get(props, 'localStore.residentId', undefined),
    firstPageFields: {},
    hpoResources: get(props, 'observations.hpos'),
    fmhResources: get(props, 'observations.fmh'),
    asError: false,
  });

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
              (element) => get(element, 'interpretation') == null,
            );
            if (checkValue.includes(true)) {
              return false;
            }
            return true;
          }
          return false;
        };

        hasError = find(form.getFieldsError(), (o) => o.errors.length > 0);

        const checkTest = () => {
          if (values['analysis.tests']) {
            const allAnalysis = values['analysis.tests'].filter((item) => item != null);
            if (allAnalysis.length === 0) {
              return false;
            }
            return true;
          }
          return false;
        };

        const checkMRN = () => {
          if (values['full-mrn']) {
            return true;
          } if (values.mrn && values.organization) {
            return true;
          }
          return false;
        };

        if (checkTest()
            && checkHpo()
            && checkCghInterpretationValue()
            && checkFamilyHistory()
            && values.indication
            && checkMRN()
            && !hasError
        ) {
          return false;
        }
        return true;
      }
      case 1: {
        hasError = find(form.getFieldsError(), (o) => o.errors.length > 0);
        if (hasError) {
          return true;
        }
        const isResidentValid = values.prescribingDoctorType === 'doctor'
         || (
           values.prescribingDoctorType === 'resident' && localStore.resident != null && localStore.resident.length > 0
         );

        if (localStore.practitioner != null && localStore.practitioner.length > 0 && isResidentValid) {
          return false;
        }
        return true;
      }
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

  const onChange = () => {
    // Update the select value when the mrn and organization changes (usually after you create a new MRN)
    const mrn = form.getFieldValue('mrn');
    const organization = form.getFieldValue('organization');
    if (mrn && organization) {
      form.setFieldsValue({ 'full-mrn': `${mrn} | ${organization}` });
    }
    validate();
  };

  React.useEffect(() => {
    validate();
  });
  const { localStore } = props;

  const createCGHResourceList = (content, patientId) => {
    const values = content;
    if (values.cghInterpretationValue === undefined || values.cghInterpretationValue === 'non-realized') {
      return undefined;
    }

    const {
      cghInterpretationValue,
    } = values;

    const cghResult = values['cgh.result'];

    const cghPrecision = values['cgh.precision'] ? values['cgh.precision'].trim() : undefined;
    const builder = new ObservationBuilder('CGH')
      .withSubject(patientId)
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

  const createIndicationResourceList = (content, patientId) => {
    const values = content;

    if (values.indication === undefined) {
      return [];
    }

    let {
      indication,
    } = values;

    indication = indication ? indication.trim() : indication;

    const builder = new ObservationBuilder('INDIC');
    builder
      .withSubject(patientId)
      .withId(get(localStore, 'indic.id'));
    if (indication != null) {
      builder.withNote(indication);
    }

    return builder.build();
  };

  const createSummary = (note, patientId) => {
    // const values = getFields();
    const builder = new ObservationBuilder('INVES');
    builder
      .withSubject(patientId)
      .withId(get(localStore, 'inves.id'));

    if (note == null && localStore.summary.note != null) {
      builder.withNote(localStore.summary.note);
    } else {
      builder.withNote(note);
    }
    return builder.build();
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
      .withValue(hpo.code, hpo.display)
      .withNote(hpo.note)
      .build();

    if (hpo.onset != null) {
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

      if (value != null) {
        if (observation.extension == null) {
          observation.extension = [];
        }
        observation.extension.push({
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset',
          valueCoding: {
            code: value.code,
            display: value.display,
          },
        });
      }
    }
    return observation;
  };

  const buildFmhsFromValues = (values, currentPatient) => get(values, 'fmh', []).filter(
    (fmh) => fmh.note != null && fmh.relation != null,
  ).map(
    (fmh) => new FamilyMemberHistoryBuilder(fmh.relation, getFamilyRelationshipDisplayForCode(fmh.relation))
      .withId(fmh.id)
      .withNote(fmh.note)
      .withPatient(currentPatient.id)
      .build(),
  );

  const saveSubmission = (submitted = false) => {
    form.validateFields().then((data) => {
      const {
        actions, userRole, currentPatient, userPractitioner,
      } = props;

      const content = state.currentPageIndex === 0 ? data : state.firstPageFields;
      const { status } = localStore;

      const batch = {
        serviceRequests: [],
        clinicalImpressions: [],
        observations: [],
        hpos: [],
        fmhs: [],
        length: 0,
        submitted,
        update: get(localStore, 'serviceRequest.id') != null,
      };

      const allAnalysis = content['analysis.tests'].filter((item) => item != null);
      batch.length = get(allAnalysis, 'length', 0);

      if (batch.length === 0) {
        return;
      }

      const { mrn, organization } = content;
      let fullMRN = [];
      if (!mrn && !organization) {
        fullMRN = content['full-mrn'].split(' | ');
      } else {
        fullMRN[0] = mrn;
        fullMRN[1] = organization;
      }
      allAnalysis.forEach((analysis) => {
        batch.serviceRequests.push(new ServiceRequestBuilder()
          .withId(get(localStore, 'serviceRequest.id'))
          .withMrn(fullMRN[0], fullMRN[1])
          .withRequester(state.selectedPractitioner)
          .withSubject(currentPatient.id)
          .withCoding(getTestCoding(analysis))
          .withSubmitted(submitted, userPractitioner.id, status)
          .withAuthoredOn(get(localStore, 'serviceRequest.authoredOn'))
          .withNote(content['analysis.comments'])
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
      batch.fmhs = buildFmhsFromValues(content, currentPatient);

      const cghObservation = createCGHResourceList(content, currentPatient.id);
      if (cghObservation != null) {
        batch.observations.push(cghObservation);
      }
      batch.observations.push(createIndicationResourceList(content, currentPatient.id));

      if (content.summaryNote != null) {
        batch.observations.push(createSummary(content.summaryNote, currentPatient.id));
      }

      if (get(content, 'ethnicity.value') != null) {
        const observationBuilder = new ObservationBuilder('ETH')
          .withStatus('final')
          .withSubject(currentPatient.id)
          .withId(content.ethnicity.id)
          .withValue(content.ethnicity.value,
            intl.get(`form.patientSubmission.form.ethnicity.${content.ethnicity.value}`),
            'http://fhir.cqgc.ferlab.bio/CodeSystem/qc-ethnicity');

        if (get(content, 'ethnicity.note') != null) {
          observationBuilder.withNote(content.ethnicity.note);
        }

        batch.observations.push(observationBuilder.build());
      }

      if (get(content, 'consanguinity.value') != null) {
        batch.observations.push(
          new ObservationBuilder('CONS')
            .withSubject(currentPatient.id)
            .withId(content.consanguinity.id)
            .withBooleanValue(content.consanguinity.value === 'yes'),
        );
      }

      actions.createRequest(batch, get(localStore, 'serviceRequest.id'));
      actions.updatePatientPractitioners(batch.serviceRequests[0], batch.clinicalImpressions[0]);
    });
  };

  const isFirstPage = () => {
    const { currentPageIndex } = state;
    return currentPageIndex === 0;
  };

  const handlePractitionerOptionSelected = (practitionerSelected) => {
    const { actions } = props;
    const { practitionerOptions } = state;

    if (practitionerSelected != null) {
      const practitionerText = genPractitionerKey(practitionerSelected);
      actions.saveLocalPractitioner(practitionerText);
      const resource = createPractitionerResource(practitionerSelected);
      actions.assignServiceRequestPractitioner(resource);

      setState((currentState) => ({
        ...currentState,
        selectedPractitioner: practitionerSelected.id,
      }));
    }
  };

  const handleResidentOptionSelected = (residentSelected) => {
    const { actions } = props;

    if (residentSelected != null) {
      const practitionerText = genPractitionerKey(residentSelected);
      actions.saveLocalResident(practitionerText);
      const resource = createPractitionerResource(residentSelected);
      actions.assignServiceRequestResident(resource);

      setState((currentState) => ({
        ...currentState,
        selectedResident: residentSelected.id,
      }));
    } else {
      actions.saveLocalResident(null);
      actions.assignServiceRequestResident(null);
      setState((currentState) => ({
        ...currentState,
        selectedResident: null,
      }));
    }
  };

  const next = () => {
    const { currentPageIndex } = state;
    const pageIndex = currentPageIndex + 1;
    setState({ ...state, currentPageIndex: pageIndex, firstPageFields: form.getFieldsValue() });
    debounce(validate, 500)();
  };

  const previous = () => {
    const { currentPageIndex, firstPageFields } = state;
    const { currentPatient } = props;
    const pageIndex = currentPageIndex - 1;

    setState({
      ...state,
      fmhResources: buildFmhsFromValues(firstPageFields, currentPatient),
      currentPageIndex: pageIndex,
      firstPageFields: {
        ...firstPageFields,
        ...form.getFieldsValue(),
      },
    });

    debounce(validate, 500)();
  };

  const handleCancel = () => {
    const { actions, patient } = props;
    actions.navigateToPatientScreen(patient.id, {
      tab: 'prescriptions',
      reload: true,
      openedPrescriptionId: get(localStore, 'serviceRequest.id'),
    });
  };

  const onFormFinish = (isOnLastPage) => {
    if (isOnLastPage) {
      saveSubmission(true);
    } else {
      next();
    }
  };

  const onHpoSelected = (code, display) => {
    const { hpoResources } = state;

    const builder = new ObservationBuilder('HPO');
    builder.withValue(code, display);

    setState({
      ...state,
      hpoResources: [
        ...hpoResources,
        builder.build(),
      ],
    });
  };

  const onHposUpdated = (hpos) => {
    setState({
      ...state,
      hpoResources: [
        ...hpos,
      ],
    });
  };

  const isPrescriptionEmpty = () => {
    const values = form.getFieldsValue();
    return values.cghId == null
    && get(values, 'analysis.tests', []).filter((i) => i != null).length === 0
    && values.cghInterpretationValue === 'non-realized'
    && get(values, 'ethnicity.value') == null
    && get(values, 'consanguinity.value') == null
    && values.indication == null
    && get(values, 'analysis.comments') == null
    && values['full-mrn'] == null
    && values.mrn == null
    && values.organization == null
    && values.indication == null;
  };

  const onCancelClick = () => {
    if (isPrescriptionEmpty()) {
      handleCancel();
    } else {
      setState((prevState) => ({ ...prevState, isCancelConfirmVisible: true }));
    }
  };

  const { actions } = props;
  const {
    patient, clinicalImpression, serviceRequest,
  } = props;
  const {
    currentPageIndex, hpoResources, fmhResources, valid, asError,
  } = state;

  const initialPractitionerValue = get(localStore, 'practitioner', '');
  const initialResidentValue = get(localStore, 'resident', '');

  const pages = [
    {
      title: intl.get('screen.clinicalSubmission.clinicalInformation'),
      content: (
        <ClinicalInformation
          parentForm={this}
          form={form}
          patient={patient}
          clinicalImpression={clinicalImpression}
          onChange={onChange}
          validate={validate}
          hpoResources={hpoResources}
          onHpoSelected={onHpoSelected}
          onHposUpdated={onHposUpdated}
          fmhResources={fmhResources}
        />
      ),
      name: 'ClinicalInformation',
      values: {},
      isComplete: () => true,
    },
    {
      title: intl.get('screen.clinicalSubmission.approval'),
      content: (
        <SecondPage
          form={form}
          doctorOptions={{
            optionSelected: handlePractitionerOptionSelected,
            initialValue: initialPractitionerValue,
          }}
          residentOptions={{
            optionSelected: handleResidentOptionSelected,
            initialValue: initialResidentValue,
          }}
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
  if (valid && asError) {
    setState((currentState) => ({
      ...currentState,
      asError: false,
    }));
  }

  const onFailedSubmit = () => {
    if (!form.getFieldValue('hposTree')) {
      document.querySelector('.hposTree').classList.add('treeError');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setState((currentState) => ({
      ...currentState,
      asError: true,
    }));
  };
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
                { isFetus(patient) ? ` (${intl.get('screen.patient.creation.fetus')})` : '' }
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
          { asError
            ? (
              <Alert
                data-testid="alert"
                message="Des erreurs se sont produites"
                description="Veuillez corriger les champs indiqués ci-dessous"
                type="error"
                className="patientSubmission__form__alert"
                icon={<WarningOutlined />}
                showIcon
              />
            ) : null }
          <Card bordered={false} className="step">
            <Steps current={currentPageIndex}>
              { pages.map((item) => <Step key={item.title} title={item.title} />) }
            </Steps>
          </Card>

          <Form
            form={form}
            onFinish={() => onFormFinish(isOnLastPage)}
            onFinishFailed={onFailedSubmit}
            onChange={onChange}
          >
            { pageContent }
            <Card className="patientSubmission__form__footer">
              <Row gutter={8}>
                { !isFirstPage() && (
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
                  >
                    {
                      isOnLastPage
                        ? intl.get('form.patientSubmission.form.submit')
                        : intl.get('screen.clinicalSubmission.nextButtonTitle')
                    }
                  </Button>
                </Col>
                <Col>
                  <Button
                    onClick={onCancelClick}
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
        }}
      />
    </Layout>
  );
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientSearchScreen,
    navigateToPatientScreen,
    savePatientSubmission,
    savePatientLocal,
    assignServiceRequestPractitioner,
    assignServiceRequestResident,
    saveObservations,
    saveServiceRequest,
    saveLocalCgh,
    saveLocalSummary,
    saveLocalIndic,
    updateConsentments,
    saveLocalPractitioner,
    saveLocalResident,
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
  userPractitioner: state.user.practitionerData.practitioner,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSubmissionScreen);
