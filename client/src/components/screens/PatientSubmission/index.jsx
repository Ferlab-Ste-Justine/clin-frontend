/* eslint-disable prefer-destructuring */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
/* eslint-disable import/named */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Steps, Card, Form, Input, Button, Radio, DatePicker, Select, Checkbox, Row, AutoComplete,
} from 'antd';
import {
  has,
} from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_save,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { navigateToPatientSearchScreen } from '../../../actions/router';
import {
  savePatientSubmission,
  assignServiceRequestPractitioner,
} from '../../../actions/patientSubmission';
import ClinicalInformation from './ClinicalInformation';
import Api from '../../../helpers/api';

import './style.scss';

import {
  cghDisplay,
  createCGHResource,
  getHPOOnsetDisplayFromCode,
  createIndicationResource,
  createHPOResource,
  isCGH,
  isHPO,
  isFamilyHistoryResource,
  isIndication,
  hpoInterpretationDisplayForCode,
  createFamilyHistoryMemberResource,
  createPractitionerResource,
  getFamilyRelationshipDisplayForCode,
} from '../../../helpers/fhir/fhir';

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

const hasObservations = clinicalImpression => clinicalImpression.investigation[0].item.length > 0;

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

const PatientInformation = ({ getFieldDecorator, patient }) => {
  const genderValues = getGenderValues();
  return (
    <Card title="Patient" bordered={false} className="staticCard patientContent">
      <Form.Item label="Nom">
        {getFieldDecorator('family', {
          rules: [{ required: true, message: 'Please enter the family name!' }],
          initialValue: has(patient, 'name.family') ? patient.name.family : '',
        })(
          <Input placeholder="Nom de famille" className="input large" />,
        )}
      </Form.Item>
      <Form.Item label="Prénom">
        {getFieldDecorator('given', {
          rules: [{ required: true, message: 'Please enter the given name!' }],
          initialValue: has(patient, 'name.given') ? patient.name.given : '',
        })(
          <Input placeholder="Prénom" className="input large" />,
        )}
      </Form.Item>
      <Form.Item label="Sexe">
        {getFieldDecorator('gender', {
          rules: [{ required: true, message: 'Please select the gender!' }],
          initialValue: has(patient, 'gender') ? patient.gender : '',
        })(
          <Radio.Group buttonStyle="solid">
            {
              Object.values(genderValues).map(gv => (
                <Radio.Button value={gv.value} key={`gender_${gv.value}`}><span className="radioText">{gv.label}</span></Radio.Button>
              ))
            }
          </Radio.Group>,
        )}
      </Form.Item>
      <Form.Item label="Date de naissance">
        {getFieldDecorator('birthDate', {
          rules: [{ required: true, message: 'Please enter the birthdate!' }],
          initialValue: has(patient, 'birthDate') ? patient.birthDate : '',
        })(
          <DatePicker className="small" />,
        )}
      </Form.Item>
      <Form.Item label="RAMQ">
        {getFieldDecorator('ramq', {
          rules: [{ pattern: RegExp(/^[A-Z]{4}\d{8,9}$/), message: 'Doit comporter quatre lettres majuscules suivies de 8 ou 9 chiffres' }],
          initialValue: ramqValue(patient),
        })(
          <Input placeholder="ABCD 0000 0000" className="input large" />,
        )}
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label="MRN">
        {getFieldDecorator('mrn', {
          rules: [{ required: true, message: 'Please enter the MRN number!' }],
          initialValue: mrnValue(patient),
        })(
          <Input placeholder="12345678" className="input small" />,
        )}
      </Form.Item>
      <Form.Item label="Hôpital">
        <Select defaultValue="CHUSJ" className="small" dropdownClassName="selectDropdown">
          <Select.Option value="CHUSJ">CHUSJ</Select.Option>
          <Select.Option value="CHUM">CHUM</Select.Option>
          <Select.Option value="CUSM">CUSM</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Ethnicité">
        <Select className="large" placeholder="Selectionner" dropdownClassName="selectDropdown">
          <Select.Option value="Canadien-Français">Canadien-Français</Select.Option>
          <Select.Option value="Afro-Américaine">Afro-Américaine</Select.Option>
          <Select.Option value="Caucasienne Européenne">Caucasienne Européenne</Select.Option>
          <Select.Option value="Hispanique">Hispanique</Select.Option>
          <Select.Option value="Asiatique">Asiatique</Select.Option>
          <Select.Option value="Juive">Juive</Select.Option>
          <Select.Option value="Amérindienne">Amérindienne</Select.Option>
          <Select.Option value="Autre">Autre</Select.Option>
        </Select>
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label="Consanguinité">
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="yes"><span className="radioText">Oui</span></Radio.Button>
          <Radio.Button value="no"><span className="radioText">Non</span></Radio.Button>
          <Radio.Button value="unknown"><span className="radioText">Inconnu</span></Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Card>
  );
};

const Approval = ({
  practitionerOptionsLabels,
  practitionerOptionSelected,
  practitionerSearchTermChanged,
  assignedPractitionerLabel,
}) => (
  <div>
    <Card title="Consentements" bordered={false} className="staticCard patientContent">
      <Form>
        <Form.Item label="Clauses signées" className="labelTop">
          <Checkbox.Group className="checkboxGroup">
            <Row>
              <Checkbox className="checkbox" value="c1"><span className="checkboxText">Clause 1</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="c2"><span className="checkboxText">Clause 2</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="c3"><span className="checkboxText">Clause 3</span></Checkbox>
            </Row>
            <Row>
              <Checkbox className="checkbox" value="c4"><span className="checkboxText">Clause 4</span></Checkbox>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Card>
    <Card title="Approbation" bordered={false} className="staticCard patientContent">
      <Form>
        <p className="cardDescription">Nullam id dolor id nibh ultricies vehicula ut id elit. Vestibulum id ligula porta felis euismod semper.</p>
        <Form.Item className="searchInput searchInput340" label="Médecin résponsable">
          <AutoComplete
            classeName="searchInput"
            placeholder="Recherche par nom ou licence…"
            value={assignedPractitionerLabel}
            dataSource={practitionerOptionsLabels}
            onSelect={practitionerOptionSelected}
            onChange={practitionerSearchTermChanged}
          />
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

    this.handleSubmit = this.handleSubmit.bind(this);
    this.isClinicalInformationComplete = this.isClinicalInformationComplete.bind(this);
    this.handlePractitionerSearchTermChanged = this.handlePractitionerSearchTermChanged.bind(this);
    this.handlePractitionerOptionSelected = this.handlePractitionerOptionSelected.bind(this);
  }

  getPatientData() {
    const { currentPageIndex } = this.state;
    const { patient, form } = this.props;
    const values = form.getFieldsValue();

    if (currentPageIndex === 0) {
      return {
        name: {
          family: values.family,
          given: values.given,
        },
        birthDate: values.birthDate,
        gender: values.gender,
        id: patient.id,
        identifier: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: values.mrn,
          },
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'JHN',
                  display: 'Jurisdictional health number (Canada)',
                },
              ],
              text: 'Numéro assurance maladie du Québec',
            },
            value: values.ramq,
          },
        ],
      };
    }

    return { ...patient };
  }

  getHPOData() {
    console.log(this);
    return [];
  }

  getClinicalImpressionData() {
    const { currentPageIndex } = this.state;
    const { clinicalImpression } = this.props;

    const clinicalImpressionData = { ...clinicalImpression };

    if (currentPageIndex === 1) {
      const { investigation } = clinicalImpression;
      investigation[0].item = [
        ...this.createCGHResourceList(),
        ...this.createFamilyRelationshipResourceList(),
        ...this.createHPOResourceList(),
        ...this.createIndicationResourceList(),
      ];
    }

    return clinicalImpressionData;
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

    const familyRelationshipResources = familyRelationshipCodes.map((code, index) => createFamilyHistoryMemberResource({
      id: familyRelationshipIds[index],
      code,
      display: getFamilyRelationshipDisplayForCode(familyRelationshipCodes[index]),
      note: familyRelationshipNotes[index],
      toDelete: familyRelationshipsToDelete[index],
    }));

    return familyRelationshipResources;
  }

  createHPOResourceList() {
    const { form } = this.props;
    const values = form.getFieldsValue();

    if (values.hpoCodes === undefined) {
      return [];
    }

    const {
      hpoIds,
      hpoCodes,
      hpoDisplays,
      hpoOnsets,
      hpoNotes,
      hposToDelete,
      hpoInterpretationCodes,
    } = values;

    const hpoResources = hpoCodes.map((code, index) => createHPOResource({
      id: hpoIds[index],
      hpoCode: { code, display: hpoDisplays[index] },
      onset: { code: hpoOnsets[index], display: getHPOOnsetDisplayFromCode(hpoOnsets[index]) },
      category: {
        code: '',
        display: '',
      },
      interpretation: {
        code: hpoInterpretationCodes[index],
        display: hpoInterpretationDisplayForCode(hpoInterpretationCodes[index]),
      },
      note: hpoNotes[index],
      toDelete: hposToDelete[index],
    }));

    return hpoResources;
  }

  createCGHResourceList() {
    const { form } = this.props;
    const values = form.getFieldsValue();

    if (values.cghInterpretationValue === undefined) {
      return [];
    }

    const {
      cgh,
      cghNote,
    } = values;

    return [
      createCGHResource({
        id: cghId,
        interpretation: {
          value: cghInterpretationValue,
          display: cghDisplay(cghInterpretationValue),
        },
        note: cghNote,
      }),
    ];
  }

  createIndicationResourceList() {
    const { form } = this.props;
    const values = form.getFieldsValue();

    if (values.indication === undefined) {
      return [];
    }

    const {
      indication,
      indicationId,
    } = values;

    return [{
      ...createIndicationResource({ id: indicationId, note: indication }),
    }];
  }

  handleSubmit(e) {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err) => {
      if (err) { return; }

      const { actions, serviceRequest, clinicalImpression } = this.props;

      const patientData = this.getPatientData();

      const clinicalImpressionData = this.getClinicalImpressionData();

      const submission = {
        patient: patientData,
        serviceRequest,
      };

      if (hasObservations(clinicalImpression)) {
        submission.clinicalImpression = clinicalImpressionData;
      }

      actions.savePatientSubmission(submission);
    });
  }

  nbPages() {
    return this.pages.length;
  }

  next() {
    const { currentPageIndex } = this.state;
    const pageIndex = currentPageIndex + 1;
    this.setState({ currentPageIndex: pageIndex });
  }

  previous() {
    const { currentPageIndex } = this.state;
    const pageIndex = currentPageIndex - 1;
    this.setState({ currentPageIndex: pageIndex });
  }

  isFirstPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === 0;
  }

  isLastPage() {
    const { currentPageIndex } = this.state;
    return currentPageIndex === this.nbPages() - 1;
  }

  isClinicalInformationComplete() {
    const { clinicalImpression } = this.props;
    const resources = clinicalImpression.investigation[0].item;
    if (!resources.find(isCGH)) {
      return false;
    }
    if (!resources.find(isHPO)) {
      return false;
    }
    if (!resources.find(isHPO)) {
      return false;
    }
    if (!resources.find(isIndication)) {
      return false;
    }
    if (!resources.find(isFamilyHistoryResource)) {
      return false;
    }
    return true;
  }

  handlePractitionerOptionSelected(value) {
    const { actions } = this.props;
    const { practitionerOptions } = this.state;
    const option = practitionerOptions.find(o => stringifyPractionerOption(o) === value);

    if (option) {
      const resource = createPractitionerResource(option);
      actions.assignServiceRequestPractitioner(resource);
    }
  }

  handlePractitionerSearchTermChanged(term) {
    const normalizedTerm = term.toLowerCase().trim();
    const params = { given: normalizedTerm, family: normalizedTerm, license: normalizedTerm };
    Api.searchPractitioners(params).then((response) => {
      if (response.payload) {
        const { data } = response.payload;

        // TODO this function is mocking a result. Please replace when data becomes accessible in FHIR
        // eslint-disable-next-line no-unused-vars
        const extractPractionerOptions = d => [
          {
            family: 'Francis', given: 'Renaud', license: '00000', id: '1393',
          },
        ];

        const options = extractPractionerOptions(data);

        this.setState({
          practitionerOptions: options,
        });
      }
    });
  }

  render() {
    const { form, actions } = this.props;
    const { getFieldDecorator } = form;
    const { patient, clinicalImpression, serviceRequest } = this.props;
    const { practitionerOptions, currentPageIndex } = this.state;

    const assignedPractitioner = serviceRequest ? serviceRequest.requester : null;
    const assignedPractitionerLabel = assignedPractitioner && has(assignedPractitioner, 'resourceType')
      ? stringifyPractionerOption(practitionerOptionFromResource(assignedPractitioner))
      : '';

    const practitionerOptionsLabels = practitionerOptions.map(stringifyPractionerOption);

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
        isComplete: this.isClinicalInformationComplete(),
      },
      {
        title: intl.get('screen.clinicalSubmission.approval'),
        content: (
          <Approval
            parentForm={this}
            getFieldDecorator={getFieldDecorator}
            practitionerOptionsLabels={practitionerOptionsLabels}
            practitionerOptionSelected={this.handlePractitionerOptionSelected}
            practitionerSearchTermChanged={this.handlePractitionerSearchTermChanged}
            assignedPractitionerLabel={assignedPractitionerLabel}
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
                currentPageIndex !== this.pages.length - 1 && (
                  <Button type="primary" onClick={() => this.next()} disabled={this.isLastPage()}>
                    {intl.get('screen.clinicalSubmission.nextButtonTitle')}
                  </Button>
                )
              }

              {
                currentPageIndex !== 0 && (
                  <Button onClick={() => this.previous()} disabled={this.isFirstPage()}>
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
    assignServiceRequestPractitioner,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  serviceRequest: state.patientSubmission.serviceRequest,
  patient: state.patientSubmission.patient,
  clinicalImpression: state.patientSubmission.clinicalImpression,
  search: state.search,
});

const WrappedPatientSubmissionForm = Form.create({ name: 'patient_submission' })(PatientSubmissionScreen);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedPatientSubmissionForm);
