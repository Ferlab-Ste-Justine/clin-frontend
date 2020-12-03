/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
/* eslint-disable import/named */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import {
  AutoComplete, Button, Card, Checkbox, DatePicker, Form, Input, Radio, Row, Select, Steps, Typography,
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
import ClinicalInformation from './ClinicalInformation';
import Api from '../../../helpers/api';

import './style.scss';

import {
  cghDisplay,
  createPractitionerResource,
} from '../../../helpers/fhir/fhir';
import { FhirDataManager } from '../../../helpers/fhir/fhir_data_manager.ts';
import { ObservationBuilder } from '../../../helpers/fhir/builder/ObservationBuilder.ts';
import Layout from '../../Layout';
import ConfirmationModal from '../../ConfirmationModal';

const { Step } = Steps;

const ramqValue = (patient) => {
  const { identifier } = patient;
  if (identifier && identifier.length > 1) {
    return identifier[1].value;
  }

  return '';
};

const mrnValue = (patient) => {
  const { identifier } = patient;
  if (identifier && identifier.length) {
    return identifier[0].value;
  }

  return '';
};

const getValueCoding = (patient, extensionName) => {
  const { extension } = patient;
  const extensionValue = find(extension, (o) => o.url.includes(extensionName) && o.valueCoding.code);
  if (extensionValue) {
    return extensionValue.valueCoding;
  }
  return undefined;
};

const hasObservations = (observations) => observations.cgh != null || observations.indic != null
  || observations.fmh.length > 0 || observations.hpos.length > 0;

const getGenderValues = () => ({
  male: {
    value: 'male',
    label: intl.get('form.patientSubmission.form.genderMale'),
  },
  female: {
    value: 'female',
    label: intl.get('form.patientSubmission.form.genderFemale'),
  },
  other: {
    value: 'other',
    label: intl.get('form.patientSubmission.form.genderOther'),
  },
  unknown: {
    value: 'unknown',
    label: intl.get('form.patientSubmission.form.genderUnknown'),
  },
});

const defaultOrganizationValue = (patient) => {
  if (has(patient, 'managingOrganization.reference') && patient.managingOrganization.reference.length > 0) {
    return patient.managingOrganization.reference.split('/')[1];
  }
  return 'CHUSJ';
};

const defaultBirthDate = (patient) => {
  if (has(patient, 'birthDate') && patient.birthDate.length > 0) {
    return moment(patient.birthDate, 'YYYY-MM-DD');
  }
  return null;
};

const PatientInformation = ({ patient, validate }) => {
  const genderValues = getGenderValues();
  const ethnicityValueCoding = getValueCoding(patient, 'qc-ethnicity');
  const consanguinityValueCoding = getValueCoding(patient, 'blood-relationship');
  const disabledDate = (current) => current && current > moment().startOf('day');
  const selectedGender = get(patient, 'gender', '');
  return (
    <Card title="Patient" bordered={false} className="patientContent">
      <Form.Item
        label={intl.get('form.patientSubmission.form.lastName')}
        name="family"
        initialValue={has(patient, 'name[0].family') ? patient.name[0].family : ''}
        rules={[{
          required: true,
          message: 'Veuillez entrer un nom de famille',
        },
        {
          pattern: RegExp(/^[a-zA-Z0-9- '\u00C0-\u00FF]*$/),
          message: <span className="errorMessage">Les caractères spéciaux sont interdits</span>,
        },
        {
          whitespace: true,
          pattern: RegExp(/(.*[a-z]){2}/i),
          message: <span className="errorMessage">Doit contenir au moins 2 caractères</span>,
        },
        ]}
      >
        <Input placeholder={intl.get('form.patientSubmission.form.lastName')} className="input large" />
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.given')}
        name="given"
        initialValue={has(patient, 'name[0].given[0]') ? patient.name[0].given[0] : ''}
        rules={[{
          required: true,
          message: 'Veuillez entrer un prénom',
        },
        {
          pattern: RegExp(/^[a-zA-Z- '\u00C0-\u00FF]*$/),
          message: <span className="errorMessage">Les caractères spéciaux sont interdits</span>,
        },
        {
          whitespace: true,
          pattern: RegExp(/(.*[a-z]){2}/i),
          message: <span className="errorMessage">Doit contenir au moins 2 caractères</span>,
        },
        ]}
      >
        <Input placeholder={intl.get('form.patientSubmission.form.given')} className="input large" />
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.gender')}
        name="gender"
        rules={[{
          required: true,
          message: 'Veuillez indiquer le sexe',
        }]}
        initialValue={selectedGender}
        valuePropName="gender"
      >
        <Radio.Group buttonStyle="solid" defaultValue={selectedGender}>
          {
            Object.values(genderValues).map((gv) => (
              <Radio.Button value={gv.value} key={`gender_${gv.value}`}>
                <span className="radioText">{ gv.label }</span>
              </Radio.Button>
            ))
          }
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.birthDate.label')}
        name="birthDate"
        initialValue={defaultBirthDate(patient)}
        rules={[{ required: true, message: 'Veuillez indiquer la date de naissance' }]}
      >
        <DatePicker placeholder={intl.get('form.patientSubmission.form.birthDate.hint')} className="small" disabledDate={disabledDate} />
      </Form.Item>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.ramq')}
          name="ramq"
          initialValue={ramqValue(patient)}
          rules={[{
            pattern: RegExp(/^[a-zA-Z-]{4}\d{8,9}$/),
            message: 'Doit comporter quatre lettres suivies de 8 ou 9 chiffres',
          }]}
        >
          <Input placeholder="ABCD 0000 0000" className="input large" />
        </Form.Item>

        <span className="optional-item__label">Facultatif</span>
      </div>

      <Form.Item
        label={intl.get('form.patientSubmission.form.mrn')}
        name="mrn"
        initialValue={mrnValue(patient)}
        rules={[
          { required: true, message: 'Veuillez entrer le numéro de dossier médical' },
          {
            pattern: RegExp(/^[a-zA-Z0-9- '\u00C0-\u00FF]*$/),
            message: <span className="errorMessage">Les caractères spéciaux sont interdits</span>,
          },
          {
            whitespace: true,
            pattern: RegExp(/(.*[a-z0-9]){2}/i),
            message: <span className="errorMessage">Doit contenir au moins 2 caractères</span>,
          },
        ]}
      >
        <Input placeholder="12345678" className="input small" />
      </Form.Item>
      <Form.Item
        label={intl.get('form.patientSubmission.form.hospital')}
        name="organization"
        initialValue={defaultOrganizationValue(patient)}
        rules={[{ required: true, message: 'Please select the hospital!' }]}
      >
        <Select
          className="small"
          dropdownClassName="selectDropdown"
          onChange={validate}
        >
          <Select.Option value="CHUSJ">CHUSJ</Select.Option>
          <Select.Option value="CHUM">CHUM</Select.Option>
          <Select.Option value="CUSM">CUSM</Select.Option>
        </Select>
      </Form.Item>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.ethnicity')}
          name="ethnicity"
          initialValue={ethnicityValueCoding ? ethnicityValueCoding.code : ethnicityValueCoding}
          rules={[{ required: false }]}
        >
          <Select
            className="large"
            placeholder={intl.get('form.patientSubmission.form.ethnicity.select')}
            dropdownClassName="selectDropdown"
          >
            <Select.Option value="CA-FR">Canadien-Français</Select.Option>
            <Select.Option value="EU">Caucasienne Européenne</Select.Option>
            <Select.Option value="AFR">Africain ou caribéen</Select.Option>
            <Select.Option value="LAT-AM">Hispanique</Select.Option>
            <Select.Option value="ES-AS">Asiatique de l&apos;est et du sud-est</Select.Option>
            <Select.Option value="SO-AS">Asiatique du sud</Select.Option>
            <Select.Option value="ABOR">Aborigène</Select.Option>
            <Select.Option value="MIX">Origine mixte</Select.Option>
            <Select.Option value="OTH">Autre</Select.Option>
          </Select>
        </Form.Item>
        <span className="optional-item__label">Facultatif</span>
      </div>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.consanguinity')}
          name="consanguinity"
          initialValue={get(consanguinityValueCoding, 'display', null)}
          rules={[{ required: false }]}
        >
          <Radio.Group buttonStyle="solid" defaultValue={get(consanguinityValueCoding, 'display', '')}>
            <Radio.Button value="Yes">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.yes') }</span>
            </Radio.Button>
            <Radio.Button value="No">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.no') }</span>
            </Radio.Button>
            <Radio.Button value="Unknown">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.unknown') }</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <span className="optional-item__label">Facultatif</span>
      </div>
    </Card>
  );
};

const Approval = ({
  dataSource,
  practitionerOptionSelected,
  practitionerSearchTermChanged,
  initialConsentsValue,
  initialPractitionerValue,
  updateConsentmentsCallback,
  form,
  handleSubmit,
}) => (
  <div>
    <Card title="Consentements" bordered={false} className="patientContent">
      <Form form={form}>
        { /* TODO initialValue */ }

        <Form.Item
          label="Clauses signées"
          className="labelTop"
          name="consent"
          initialValue={initialConsentsValue}
          rules={[{ required: true, message: 'Veuillez sélectionner au moins un consentement' }]}
        >
          <Checkbox.Group className="checkboxGroup" onChange={updateConsentmentsCallback}>
            <Row>
              <Checkbox className="checkbox" value="consent-1"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.patient') }</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="consent-2"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.father') }</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="consent-3"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.mother') }</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="consent-4"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.research') }</span></Checkbox>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Card>
    <Card title="Approbation" bordered={false} className="patientContent">
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <p className="cardDescription">Nullam id dolor id nibh ultricies vehicula ut id elit. Vestibulum id ligula porta felis euismod semper.</p>
        { /* TODO initialValue */ }

        <Form.Item
          label="Médecin résponsable"
          className="searchInput searchInput340"
          name="practInput"
          initialValue={initialPractitionerValue}
          rules={[
            {
              required: true,
              message: 'Veuillez spécifier le nom du médecin responsable',
            },
            {
              whitespace: true,
              message: 'Ne peut pas contenir que des espaces',
            },
          ]}
        >

          <AutoComplete
            optionLabelProp="text"
            classeName="searchInput"
            placeholder="Recherche par nom ou licence…"
            defaultValue={initialPractitionerValue}
            dataSource={dataSource}
            onSelect={practitionerOptionSelected}
            onChange={practitionerSearchTermChanged}
          />
        </Form.Item>
      </Form>
    </Card>
  </div>
);

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
          return 'French Canadian';
        case 'EU':
          return 'European Caucasia';
        case 'AFR':
          return 'African or Carabean';
        case 'LAT-AM':
          return 'Hispanic and Latino Americans';
        case 'ES-AS':
          return 'East and Southeast Asian';
        case 'SO-AS':
          return 'South Asian';
        case 'ABOR':
          return 'Aboriginal';
        case 'MIX':
          return 'Mixted descent';
        case 'OTH':
          return 'Other ethnicity';
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
      const value = FhirDataManager.createPatient({
        ...values,
        gender,
        id: patient.id,
        bloodRelationship: values.consanguinity,
        ethnicityCode: values.ethnicity ? values.ethnicity : '',
        ethnicityDisplay: getEthnicityDisplay(values.ethnicity),
        active: false,
        birthDate: new Date(values.birthDate.toDate()),
      });
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
  const handleSubmit = (e, submitted = false) => {
    form.validateFields().then(() => {
      const {
        actions, serviceRequest, clinicalImpression, observations, deleted, practitionerId, groupId,
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
        if (submitted) {
          submission.status = 'on-hold';
        }
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
      actions.savePatientSubmission(submission);
    });
  };
  const submit = (e) => {
    const { actions } = props;
    handleSubmit(e, true);
    actions.navigateToPatientSearchScreen();
  };

  const isFirstPage = () => {
    const { currentPageIndex } = state;
    return currentPageIndex === 0;
  };

  const handlePractitionerOptionSelected = (license) => {
    const { actions } = props;
    const { practitionerOptions } = state;
    const practitioner = practitionerOptions.find((o) => o.license === license);

    if (practitioner != null) {
      const practitionerText = `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`;
      actions.saveLocalPractitioner(practitionerText);
      const resource = createPractitionerResource(practitioner);
      actions.assignServiceRequestPractitioner(resource);
    }
  };

  const handlePractitionerSearchTermChanged = (term, callback = null) => {
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
      actions.navigateToPatientScreen(patient.id, 'clinical');
    } else {
      actions.navigateToPatientSearchScreen();
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
    <AutoComplete.Option
      key={practitioner.license}
      text={`${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`}
    >
      <div className="page3__autocomplete">
        <span className="page3__autocomplete__family-name">{ practitioner.family.toUpperCase() }</span> { practitioner.given } – { practitioner.license }
      </div>
    </AutoComplete.Option>
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
          form={form}
          handleSubmit={handleSubmit}
        />
      ),
      name: 'Approval',
      values: {},
    },
  ];
  const { Title } = Typography;
  const currentPage = pages[currentPageIndex];
  const pageContent = currentPage.content;
  return (
    <Layout>
      <>
        <div className="page_headerStaticMargin">
          <Title className="headerStaticContent" level={3}>Nouveau patient et prescription de test génomique</Title>
        </div>
        <div className="page-static-content">
          <Card bordered={false} className="step">
            <Steps current={currentPageIndex}>
              { pages.map((item) => <Step key={item.title} title={item.title} />) }
            </Steps>
          </Card>

          <Form
            form={form}
            onFinish={handleSubmit}
            onChange={validate}
          >
            { pageContent }
            <div className="submission-form-actions">
              {
                currentPageIndex === pages.length - 1 && (
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={!state.valid}
                    onClick={submit}
                  >
                    Soumettre
                  </Button>
                )
              }
              {
                currentPageIndex !== pages.length - 1 && (
                  <Button
                    type="primary"
                    onClick={() => next()}
                    disabled={!state.valid}
                  >
                    { intl.get('screen.clinicalSubmission.nextButtonTitle') }
                  </Button>
                )
              }

              {
                currentPageIndex !== 0 && (
                  <Button onClick={() => previous()} disabled={isFirstPage()}>
                    <IconKit size={20} icon={ic_keyboard_arrow_left} />
                    { intl.get('screen.clinicalSubmission.previousButtonTitle') }
                  </Button>
                )
              }

              <Button
                htmlType="submit"
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientSubmissionScreen);
