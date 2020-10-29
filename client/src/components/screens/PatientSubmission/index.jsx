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
  AutoComplete, Button, Card, Checkbox, DatePicker, Form, Input, Radio, Row, Select, Steps,
} from 'antd';
import {
  find, has, debounce, mapValues,
} from 'lodash';

import IconKit from 'react-icons-kit';
import { ic_save, ic_keyboard_arrow_left } from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { navigateToPatientSearchScreen } from '../../../actions/router';
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
  getFamilyRelationshipDisplayForCode,
} from '../../../helpers/fhir/fhir';
import { FhirDataManager } from '../../../helpers/fhir/fhir_data_manager.ts';
import { ObservationBuilder } from '../../../helpers/fhir/builder/ObservationBuilder.ts';
import { FamilyMemberHistoryBuilder } from '../../../helpers/fhir/builder/FMHBuilder.ts';

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
  const extensionValue = find(extension, o => o.url.includes(extensionName) && o.valueCoding.code);
  if (extensionValue) {
    return extensionValue.valueCoding;
  }
  return undefined;
};

const hasObservations = observations => observations.cgh != null || observations.indic != null
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

const PatientInformation = ({ getFieldDecorator, patient }) => {
  const genderValues = getGenderValues();
  const ethnicityValueCoding = getValueCoding(patient, 'qc-ethnicity');
  const consanguinityValueCoding = getValueCoding(patient, 'blood-relationship');
  const disabledDate = current => current && current > moment().startOf('day');
  return (
    <Card title="Patient" bordered={false} className="staticCard patientContent">
      <Form.Item label={intl.get('form.patientSubmission.form.lastName')}>
        {getFieldDecorator('family', {
          rules: [{
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
          ],
          initialValue: has(patient, 'name[0].family') ? patient.name[0].family : '',
        })(
          <Input placeholder={intl.get('form.patientSubmission.form.lastName')} className="input large" />,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.given')}>
        {getFieldDecorator('given', {
          rules: [{
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
          ],
          initialValue: has(patient, 'name[0].given[0]') ? patient.name[0].given[0] : '',
        })(
          <Input placeholder={intl.get('form.patientSubmission.form.given')} className="input large" />,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.gender')}>
        {getFieldDecorator('gender', {
          rules: [{ required: true, message: 'Veuillez indiquer le sexe' }],
          initialValue: has(patient, 'gender') ? patient.gender : '',
        })(
          <Radio.Group buttonStyle="solid">
            {
                            Object.values(genderValues).map(gv => (
                              <Radio.Button value={gv.value} key={`gender_${gv.value}`}>
                                <span className="radioText">{gv.label}</span>
                              </Radio.Button>
                            ))
                        }
          </Radio.Group>,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.birthDate.label')}>
        {getFieldDecorator('birthDate', {
          rules: [{ required: true, message: 'Veuillez indiquer la date de naissance' }],
          initialValue: defaultBirthDate(patient),
        })(
          <DatePicker placeholder={intl.get('form.patientSubmission.form.birthDate.hint')} className="small" disabledDate={disabledDate} />,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.ramq')}>
        {getFieldDecorator('ramq', {
          rules: [{
            pattern: RegExp(/^[a-zA-Z-]{4}\d{8,9}$/),
            message: 'Doit comporter quatre lettres suivies de 8 ou 9 chiffres',
          }],
          initialValue: ramqValue(patient),
        })(
          <Input placeholder="ABCD 0000 0000" className="input large" />,
        )}
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.mrn')}>
        {getFieldDecorator('mrn', {
          rules: [
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
          ],
          initialValue: mrnValue(patient),
        })(
          <Input placeholder="12345678" className="input small" />,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.hospital')}>
        {getFieldDecorator('organization', {
          rules: [{ required: true, message: 'Please select the hospital!' }],
          initialValue: defaultOrganizationValue(patient),
        })(
          <Select className="small" dropdownClassName="selectDropdown">
            <Select.Option value="CHUSJ">CHUSJ</Select.Option>
            <Select.Option value="CHUM">CHUM</Select.Option>
            <Select.Option value="CUSM">CUSM</Select.Option>
          </Select>,
        )}
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.ethnicity')}>
        {getFieldDecorator('ethnicity', {
          rules: [{ required: false }],
          initialValue: ethnicityValueCoding ? ethnicityValueCoding.code : ethnicityValueCoding,
        })(
          <Select className="large" placeholder={intl.get('form.patientSubmission.form.ethnicity.select')} dropdownClassName="selectDropdown">
            <Select.Option value="CA-FR">Canadien-Français</Select.Option>
            <Select.Option value="EU">Caucasienne Européenne</Select.Option>
            <Select.Option value="AFR">Africain ou caribéen</Select.Option>
            <Select.Option value="LAT- AM">Hispanique</Select.Option>
            <Select.Option value="ES-AS">Asiatique de l&apos;est et du sud-est</Select.Option>
            <Select.Option value="SO-AS">Asiatique du sud</Select.Option>
            <Select.Option value="ABOR">Aboriginal</Select.Option>
            <Select.Option value="MIX">Origine mixte</Select.Option>
            <Select.Option value="OTH">Autre</Select.Option>
          </Select>,
        )}
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label={intl.get('form.patientSubmission.form.consanguinity')}>
        {getFieldDecorator('consanguinity', {
          rules: [{ required: false }],
          initialValue: consanguinityValueCoding ? consanguinityValueCoding.display : consanguinityValueCoding,
        })(
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="Yes"><span className="radioText">{intl.get('form.patientSubmission.form.consanguinity.yes')}</span></Radio.Button>
            <Radio.Button value="No"><span className="radioText">{intl.get('form.patientSubmission.form.consanguinity.no')}</span></Radio.Button>
            <Radio.Button value="Unknown"><span className="radioText">{intl.get('form.patientSubmission.form.consanguinity.unknown')}</span></Radio.Button>
          </Radio.Group>,
        )}
        <span className="optional">Facultatif</span>
      </Form.Item>
    </Card>
  );
};

const Approval = ({
  dataSource,
  practitionerOptionSelected,
  practitionerSearchTermChanged,
  getFieldDecorator,
  initialConsentsValue,
  initialPractitionerValue,
  updateConsentmentsCallback,
}) => (
  <div>
    <Card title="Consentements" bordered={false} className="staticCard patientContent">
      <Form>
        {/* TODO initialValue */}
        <Form.Item label="Clauses signées" className="labelTop">
          {getFieldDecorator('consent', {
            rules: [{ required: true, message: 'Veuillez sélectionner au moins un consentement' }],
            initialValue: initialConsentsValue,
          })(
            <Checkbox.Group className="checkboxGroup" onChange={updateConsentmentsCallback}>
              <Row>
                <Checkbox className="checkbox" value="c1"><span className="checkboxText">{intl.get('form.patientSubmission.form.consent.patient')}</span></Checkbox>
              </Row>
              <Row>
                <Checkbox className="checkbox" value="c2"><span className="checkboxText">{intl.get('form.patientSubmission.form.consent.father')}</span></Checkbox>
              </Row>
              <Row>
                <Checkbox className="checkbox" value="c3"><span className="checkboxText">{intl.get('form.patientSubmission.form.consent.mother')}</span></Checkbox>
              </Row>
              <Row>
                <Checkbox className="checkbox" value="c4"><span className="checkboxText">{intl.get('form.patientSubmission.form.consent.research')}</span></Checkbox>
              </Row>
            </Checkbox.Group>,
          )}
        </Form.Item>
      </Form>
    </Card>
    <Card title="Approbation" bordered={false} className="staticCard patientContent">
      <Form>
        <p className="cardDescription">Nullam id dolor id nibh ultricies vehicula ut id elit. Vestibulum id ligula porta felis euismod semper.</p>
        {/* TODO initialValue */}
        <Form.Item className="searchInput searchInput340" label="Médecin résponsable">
          {getFieldDecorator('practInput', {
            initialValue: initialPractitionerValue,
            rules: [
              {
                required: true,
                message: 'Veuillez spécifier le nom du médecin responsable',
              },
              {
                whitespace: true,
                message: 'Ne peut pas contenir que des espaces',
              },
            ],
          })(
            <AutoComplete
              optionLabelProp="text"
              classeName="searchInput"
              placeholder="Recherche par nom ou licence…"
              dataSource={dataSource}
              onSelect={practitionerOptionSelected}
              onChange={practitionerSearchTermChanged}
            />,
          )}

        </Form.Item>
      </Form>
    </Card>
  </div>
);

const stringifyPractionerOption = po => `${po.family}, ${po.given} License No: ${po.license}`;
const practitionerOptionFromResource = resource => ({
  given: resource.name[0].given[0],
  family: resource.name[0].family,
  license: resource.identifier[0].value,
});

class PatientSubmissionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPageIndex: 0,
      practitionerOptions: [],
    };

    this.submit = this.submit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.isClinicalInformationComplete = this.isClinicalInformationComplete.bind(this);
    this.handlePractitionerSearchTermChanged = this.handlePractitionerSearchTermChanged.bind(this);
    this.searchPractitioner = debounce(this.searchPractitioner.bind(this), 300);
    this.handlePractitionerOptionSelected = this.handlePractitionerOptionSelected.bind(this);
    this.canGoNextPage = this.canGoNextPage.bind(this);
    this.updateFormValues = this.updateFormValues.bind(this);
    this.createSummary = this.createSummary.bind(this);
    this.saveSecondPageLocalStore = this.saveSecondPageLocalStore.bind(this);
  }

  getPatientData() {
    const { currentPageIndex } = this.state;
    const { patient, form } = this.props;
    let values = form.getFieldsValue();

    const getEthnicityDisplay = (ethnicity) => {
      switch (ethnicity) {
        case 'CA-FR':
          return 'French Canadian';
        case 'EU':
          return 'European Caucasia';
        case 'AFR':
          return 'African or Carabean';
        case 'LAT- AM':
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

      values = mapValues(values, (o) => {
        if (typeof o === 'string') {
          return o.trim();
        }
        return o;
      });
      const value = FhirDataManager.createPatient({
        ...values,
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
  }

  getHPOData() {
    console.log(this);
    return [];
  }

  getPractitioner() {
    const { currentPageIndex } = this.state;
    const { form } = this.props;
    const values = form.getFieldsValue();
    if (currentPageIndex === 2) {
      return values.practitioner.id;
    }

    return null;
  }

  getClinicalImpressionData() {
    const { currentPageIndex } = this.state;
    const { clinicalImpression } = this.props;

    const clinicalImpressionData = { ...clinicalImpression };

    if (currentPageIndex === 1) {
      const { investigation } = clinicalImpression;
      investigation[0].item = [
        this.createCGHResourceList(),
        ...this.createFamilyRelationshipResourceList(),
        this.createIndicationResourceList(),
      ];
    }

    return clinicalImpressionData;
  }

  getServiceRequestCode() {
    const { form } = this.props;
    const values = form.getFieldsValue();

    if (values.analyse != null) {
      return values.analyse;
    }
    
    const { localStore } = this.props;
    return localStore.serviceRequest.code;
  }

  canGoNextPage(currentPage) {
    const { form, observations, practitionerId } = this.props;
    const values = form.getFieldsValue();
    let hasError = null;
    switch (currentPage) {
      case 0:
        if (values.given && values.family && values.gender && values.birthDate && values.mrn) {
          hasError = find(form.getFieldsError(), o => o !== undefined);
          if (hasError) {
            return true;
          }
          return false;
        }
        return true;
      case 1: {
        const checkIfEmptyValue = array => array != null && array.findIndex(element => !element) === -1;
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
          if ((checkIfEmptyValue(values.familyRelationshipNotes) && !checkIfEmptyValue(values.familyRelationshipCodes))
          || (!checkIfEmptyValue(values.familyRelationshipNotes) && checkIfEmptyValue(values.familyRelationshipCodes))) {
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

        hasError = find(form.getFieldsError(), (o) => {
          if (Array.isArray(o)) {
            return !o.includes(undefined);
          }
          return o !== undefined;
        });

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
        hasError = find(form.getFieldsError(), o => o !== undefined);
        if (hasError) {
          return true;
        }
        if (values.consent != null && values.consent.length > 0 && practitionerId != null) {
          return false;
        }
        return true;
      default:
        return false;
    }
  }

  createFamilyRelationshipResourceList() {
    const { form } = this.props;
    const values = form.getFieldsValue();

    if (values.familyRelationshipCodes === undefined) {
      return [];
    }

    const {
      familyRelationshipIds,
      familyRelationshipCodes,
      familyRelationshipNotes,
      familyRelationshipsToDelete,
    } = values;

    return familyRelationshipCodes.map((code, index) => {
      const id = familyRelationshipIds[index];
      const toDelete = familyRelationshipsToDelete[index];
      if (id == null || id.length === 0) {
        const builder = new FamilyMemberHistoryBuilder({
          coding: [{
            code,
            display: getFamilyRelationshipDisplayForCode(familyRelationshipCodes[index]),
          }],
        });
        const note = familyRelationshipNotes[index];
        if (note != null && note.length > 0) {
          builder.withNote(note);
        }
        if (toDelete) {
          builder.withStatus('entered-in-error');
        }
        return builder.build();
      }
      return null;
    }).filter(r => r != null);
  }

  createCGHResourceList() {
    const { form } = this.props;
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
  }

  createIndicationResourceList() {
    const { form } = this.props;
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
  }

  createSummary() {
    const { form, localStore } = this.props;
    const values = form.getFieldsValue();
    const builder = new ObservationBuilder('INVES');

    if (values.summaryNote == null && localStore.summary.note != null) {
      builder.withNote(localStore.summary.note);
    } else {
      builder.withNote(values.summaryNote);
    }
    return builder.build();
  }

  submit(e) {
    const { actions } = this.props;
    this.handleSubmit(e);
    actions.navigateToPatientSearchScreen();
  }

  handleSubmit(e) {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err) => {
      if (err) {
        return;
      }

      const {
        actions, serviceRequest, clinicalImpression, observations, deleted, practitionerId, groupId,
      } = this.props;

      const patientData = this.getPatientData();

      const submission = {
        patient: patientData,
        serviceRequest,
      };

      submission.serviceRequest = submission.serviceRequest || {};
      submission.serviceRequest.code = this.getServiceRequestCode();

      if (hasObservations(observations)) {
        submission.clinicalImpression = clinicalImpression;
      }
      const { currentPageIndex } = this.state;

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
            ...this.createCGHResourceList(),
          },
          indic: {
            ...observations.indic,
            ...this.createIndicationResourceList(),
          },
          summary: {
            ...observations.summary,
            ...this.createSummary(),
          },
        };
        actions.saveObservations(submission.observations);
        this.saveSecondPageLocalStore();
      } else {
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
            ...this.createSummary(),
          },
        };
      }

      submission.practitionerId = practitionerId;
      submission.deleted = deleted;
      submission.groupId = groupId;
      actions.savePatientSubmission(submission);
    });
  }

  nbPages() {
    return this.pages.length;
  }

  updateFormValues() {
    const { form } = this.props;
    debounce(() => { form.setFieldsValue({}); }, 500)();
  }


  saveSecondPageLocalStore() {
    const { actions, form } = this.props;
    const values = form.getFieldsValue();

    actions.saveServiceRequest(values.analyse);
    actions.saveLocalCgh(values.cghInterpretationValue, values.cghPrecision);
    actions.saveLocalSummary(values.summaryNote);
    actions.saveLocalIndic(values.indication);
  }

  next() {
    const { currentPageIndex } = this.state;
    const { actions, observations } = this.props;
    const pageIndex = currentPageIndex + 1;
    if (currentPageIndex === 0) {
      actions.savePatientLocal(this.getPatientData());
    } else if (currentPageIndex === 1) {
      actions.saveObservations(
        {
          ...observations,
          cgh: {
            ...observations.cgh,
            ...this.createCGHResourceList(),
          },
          indic: {
            ...observations.indic,
            ...this.createIndicationResourceList(),
          },
        },
      );

      this.saveSecondPageLocalStore();
    }

    this.setState({ currentPageIndex: pageIndex });
    this.updateFormValues();
  }


  previous() {
    const { currentPageIndex } = this.state;
    const pageIndex = currentPageIndex - 1;
    this.setState({ currentPageIndex: pageIndex });

    if (currentPageIndex === 1) {
      this.saveSecondPageLocalStore();
    }

    this.updateFormValues();
  }

  isFirstPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === 0;
  }

  isLastPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === this.nbPages() - 1;
  }

  // TODO: Update check
  isClinicalInformationComplete() {
    const { observations } = this.props;
    if (observations.cgh == null) {
      return false;
    }
    if (observations.hpos.length === 0) {
      return false;
    }

    if (observations.indic == null) {
      return false;
    }
    return true;
  }

  handlePractitionerOptionSelected(license) {
    const { actions } = this.props;
    const { practitionerOptions } = this.state;
    const practitioner = practitionerOptions.find(o => o.license === license);

    if (practitioner != null) {
      const practitionerText = `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`;
      actions.saveLocalPractitioner(practitionerText);
      const resource = createPractitionerResource(practitioner);
      actions.assignServiceRequestPractitioner(resource);
    }
  }

  searchPractitioner(term) {
    this.handlePractitionerSearchTermChanged(term);
  }

  handlePractitionerSearchTermChanged(term) {
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

          this.setState({
            practitionerOptions: result,
          });
        }
      });
    }
  }

  render() {
    const { form, actions, localStore } = this.props;
    const { getFieldDecorator } = form;
    const { patient, clinicalImpression, serviceRequest } = this.props;
    const { practitionerOptions, currentPageIndex } = this.state;

    const assignedPractitioner = serviceRequest ? serviceRequest.requester : null;
    const assignedPractitionerLabel = assignedPractitioner && has(assignedPractitioner, 'resourceType')
      ? stringifyPractionerOption(practitionerOptionFromResource(assignedPractitioner))
      : '';

    const { consents } = localStore;
    const initialPractitionerValue = localStore.practitioner;

    const practitionerOptionsLabels = practitionerOptions.map(practitioner => (
      <AutoComplete.Option
        key={practitioner.license}
        text={`${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`}
      >
        <div className="page3__autocomplete">
          <span className="page3__autocomplete__family-name">{practitioner.family.toUpperCase()}</span> {practitioner.given} – {practitioner.license}
        </div>
      </AutoComplete.Option>
    ));

    this.pages = [
      {
        title: intl.get('screen.clinicalSubmission.patientInformation'),
        content: (
          <PatientInformation parentForm={this} getFieldDecorator={getFieldDecorator} patient={patient} />
        ),
        name: 'PatientInformation',
        values: {},
        isComplete: () => true,
      },
      {
        title: intl.get('screen.clinicalSubmission.clinicalInformation'),
        content: (
          <ClinicalInformation parentForm={this} form={form} clinicalImpression={clinicalImpression} />
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
            getFieldDecorator={getFieldDecorator}
            dataSource={practitionerOptionsLabels}
            practitionerOptionSelected={this.handlePractitionerOptionSelected}
            practitionerSearchTermChanged={this.searchPractitioner}
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

    const currentPage = this.pages[currentPageIndex];
    const pageContent = currentPage.content;
    return (
      <Content type="auto">
        <Header />
        <div className="page_headerStaticMargin">
          <Steps current={currentPageIndex} className="headerStaticContent step">
            {this.pages.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>
        <div className="page-static-content">
          <Form
            onSubmit={this.handleSubmit}
          >
            {pageContent}
            <div className="submission-form-actions">
              {
                currentPageIndex === this.pages.length - 1 && (
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={this.canGoNextPage(currentPageIndex)}
                    onClick={this.submit}
                  >
                    Soumettre
                  </Button>
                )
              }
              {
                currentPageIndex !== this.pages.length - 1 && (
                  <Button type="primary" onClick={() => this.next()} disabled={this.canGoNextPage(currentPageIndex)}>
                    {intl.get('screen.clinicalSubmission.nextButtonTitle')}
                  </Button>
                )
              }

              {
                  currentPageIndex !== 0 && (
                  <Button onClick={() => this.previous()} disabled={this.isFirstPage()}>
                    <IconKit size={20} icon={ic_keyboard_arrow_left} />
                    {intl.get('screen.clinicalSubmission.previousButtonTitle')}
                  </Button>
                  )
              }

              <Button
                htmlType="submit"
              >
                <IconKit size={20} icon={ic_save} />
                {intl.get('screen.clinicalSubmission.saveButtonTitle')}
              </Button>
              <Button
                onClick={actions.navigateToPatientSearchScreen}
                className="cancelButton"
              >
                {intl.get('screen.clinicalSubmission.cancelButtonTitle')}
              </Button>
            </div>
          </Form>
        </div>
        <Footer />
      </Content>
    );
  }
}

PatientSubmissionScreen.propTypes = {
  router: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    navigateToPatientSearchScreen,
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

const mapStateToProps = state => ({
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
});

const WrappedPatientSubmissionForm = Form.create({ name: 'patient_submission' })(PatientSubmissionScreen);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedPatientSubmissionForm);
