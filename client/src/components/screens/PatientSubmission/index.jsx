/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button, Card, Form, Steps, Typography,
} from 'antd';
import {
  find, has, debounce, mapValues, get, values as toArray,
} from 'lodash';

import IconKit from 'react-icons-kit';
import { ic_save, ic_keyboard_arrow_left } from 'react-icons-kit/md';
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
import PatientInformation from './components/PatientInformation';
import Api from '../../../helpers/api';

import './style.scss';

import {
  cghDisplay,
  createPractitionerResource,
  genPractitionerKey,
} from '../../../helpers/fhir/fhir';
import { ObservationBuilder } from '../../../helpers/fhir/builder/ObservationBuilder.ts';
import Layout from '../../Layout';
import ConfirmationModal from '../../ConfirmationModal';
import { PatientBuilder } from '../../../helpers/fhir/builder/PatientBuilder';

const { Step } = Steps;

const hasObservations = (observations) => observations.cgh != null || observations.indic != null
  || observations.fmh.length > 0 || observations.hpos.length > 0;

const stringifyPractionerOption = (po) => `${po.family}, ${po.given} License No: ${po.license}`;
const practitionerOptionFromResource = (resource) => ({
  given: resource.name[0].given[0],
  family: resource.name[0].family,
  license: resource.identifier[0].value,
});

function PatientSubmissionScreen(props) {
  const [form] = Form.useForm();

  const [state, setState] = React.useState({
    currentPageIndex: 0,
    practitionerOptions: [],
    valid: false,
  });

  const getPatientData = () => {
    const { currentPageIndex } = state;
    const { patient } = props;
    let values = form.getFieldsValue();

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
    const gender = typeof values.gender === 'string' ? get(values, 'gender', '') : get(values, 'gender.target.value', '');
    switch (currentPage) {
      case 0:
        if (values.given && values.family && gender && values.birthDate && values.mrn) {
          hasError = find(form.getFieldsError(), (o) => o.errors.length > 0);
          if (hasError) {
            return true;
          }
          return false;
        }
        return true;
      case 1: {
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

        if (values.analyse
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
      case 2:
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
    const values = form.getFieldsValue();
    if (values.cghInterpretationValue === undefined) {
      return undefined;
    }

    const {
      cghInterpretationValue,
      cghPrecision,
    } = values;

    values.cghPrecision = cghPrecision ? cghPrecision.trim() : cghPrecision;
    const builder = new ObservationBuilder('CGH')
      .withStatus('final');

    if (cghInterpretationValue != null) {
      builder.withInterpretation({
        coding: [{
          display: cghDisplay(cghInterpretationValue),
          code: cghInterpretationValue,
        }],
      });
    }

    if (cghPrecision != null && cghPrecision.length > 0) {
      builder.withNote(cghPrecision);
    }

    return builder.build();
  };

  const createIndicationResourceList = () => {
    const values = form.getFieldsValue();

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

  const createSummary = () => {
    const values = form.getFieldsValue();
    const builder = new ObservationBuilder('INVES');

    if (values.summaryNote == null && localStore.summary.note != null) {
      builder.withNote(localStore.summary.note);
    } else {
      builder.withNote(values.summaryNote);
    }
    return builder.build();
  };

  const saveSecondPageLocalStore = () => {
    const { actions } = props;
    const values = form.getFieldsValue();

    actions.saveServiceRequest(values.analyse);
    actions.saveLocalCgh(values.cghInterpretationValue, values.cghPrecision);
    actions.saveLocalSummary(values.summaryNote);
    actions.saveLocalIndic(values.indication);
  };
  const saveSubmission = (submitted = false) => {
    form.validateFields().then(() => {
      const {
        actions, serviceRequest, clinicalImpression, observations, deleted, practitionerId, groupId, userRole,
      } = props;

      const patientData = getPatientData();

      const submission = {
        patient: patientData,
        serviceRequest,
      };

      submission.serviceRequest = { ...submission.serviceRequest };
      submission.serviceRequest.code = getServiceRequestCode();

      if (hasObservations(observations)) {
        submission.clinicalImpression = clinicalImpression;
      }
      const { currentPageIndex } = state;

      if (currentPageIndex === 0) {
        submission.observations = {
          ...observations,
          cgh: {
            ...observations.cgh,
          },
          indic: {
            ...observations.indic,
          },
          summary: {
            ...observations.summary,
          },
        };
      } else if (currentPageIndex === 1) {
        submission.observations = {
          ...observations,
          cgh: {
            ...observations.cgh,
            ...createCGHResourceList(),
          },
          indic: {
            ...observations.indic,
            ...createIndicationResourceList(),
          },
          summary: {
            ...observations.summary,
            ...createSummary(),
          },
        };
        actions.saveObservations(submission.observations);
        saveSecondPageLocalStore();
      } else {
        submission.submitted = submitted;
        submission.observations = {
          ...observations,
          cgh: {
            ...observations.cgh,
          },
          indic: {
            ...observations.indic,
          },
          summary: {
            ...observations.summary,
            ...createSummary(),
          },
        };
      }

      submission.practitionerId = practitionerId;
      submission.deleted = deleted;
      submission.groupId = groupId;
      submission.userRole = userRole;

      actions.savePatientSubmission(submission);
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
    const { actions, observations } = props;
    const pageIndex = currentPageIndex + 1;
    if (currentPageIndex === 0) {
      actions.savePatientLocal(getPatientData());
    } else if (currentPageIndex === 1) {
      actions.saveObservations(
        {
          ...observations,
          cgh: {
            ...observations.cgh,
            ...createCGHResourceList(),
          },
          indic: {
            ...observations.indic,
            ...createIndicationResourceList(),
          },
        },
      );

      saveSecondPageLocalStore();

      const { practitioner } = localStore;

      handlePractitionerSearchTermChanged(practitioner, () => {
        handlePractitionerOptionSelected(practitioner);
      });
    }

    setState({ ...state, currentPageIndex: pageIndex });
    debounce(validate, 500)();
  };

  const previous = () => {
    const { currentPageIndex } = state;
    const pageIndex = currentPageIndex - 1;
    setState({ ...state, currentPageIndex: pageIndex });

    if (currentPageIndex === 1) {
      saveSecondPageLocalStore();
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
      text: (
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
      title: intl.get('screen.clinicalSubmission.patientInformation'),
      content: (
        <PatientInformation parentForm={this} patient={patient} validate={validate} />
      ),
      name: 'PatientInformation',
      values: {},
      isComplete: () => true,
    },
    {
      title: intl.get('screen.clinicalSubmission.clinicalInformation'),
      content: (
        <ClinicalInformation parentForm={this} form={form} clinicalImpression={clinicalImpression} validate={validate} />
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
        <div className="page_headerStaticMargin">
          <Title className="headerStaticContent" level={3}>{ intl.get('form.patientSubmission.form.title') }</Title>
        </div>
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
            <div className="submission-form-actions">
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
              {
                currentPageIndex !== 0 && (
                  <Button onClick={() => previous()} disabled={isFirstPage()}>
                    <IconKit size={20} icon={ic_keyboard_arrow_left} />
                    { intl.get('screen.clinicalSubmission.previousButtonTitle') }
                  </Button>
                )
              }

              <Button
                onClick={() => saveSubmission()}
              >
                <IconKit size={20} icon={ic_save} />
                { intl.get('screen.clinicalSubmission.saveButtonTitle') }
              </Button>
              <Button
                onClick={() => ConfirmationModal({ onOk: () => { handleCancel(); } })}
                className="cancelButton"
              >
                { intl.get('screen.clinicalSubmission.cancelButtonTitle') }
              </Button>
            </div>
          </Form>
        </div>
      </>
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
  userRole: state.user.practitionerData.practitionerRole,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSubmissionScreen);
