/* eslint-disable prefer-destructuring */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Steps, Card, Form, Input, Button, message, Radio, DatePicker, Select, Tree, Checkbox, Row,
} from 'antd';
import {
  has,
  curry,
} from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_save, ic_remove, ic_add, ic_visibility, ic_visibility_off, ic_help, ic_person,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { patientSubmissionShape } from '../../../reducers/patientSubmission';
import { appShape } from '../../../reducers/app';
import {
  savePatientSubmission,
} from '../../../actions/patientSubmission';
import ClinicalInformation from './ClinicalInformation';
import './style.scss';

const { Step } = Steps;
const { TextArea, Search } = Input;
const { TreeNode } = Tree;
const { Option, OptGroup } = Select;

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
const addObservation = curry((clinicalImpression, observation) => {
  clinicalImpression.investigation[0].item.push(observation);
});

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
  const _has = has;
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
                <Radio.Button value={gv.value}><span className="radioText">{gv.label}</span></Radio.Button>
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


const Approval = props => (
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
          <Search classeName="searchInput" placeholder="Recherche par nom ou licence…" />
        </Form.Item>
      </Form>
    </Card>
  </div>

);

class PatientSubmissionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPageIndex: 0,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
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

  getClinicalImpressionData() {
    const { currentPageIndex } = this.state;
    const { clinicalImpression, form } = this.props;
    const values = form.getFieldsValue();

    const clinicalImpressionData = { ...clinicalImpression };

    if (currentPageIndex === 1) {
      const { investigation } = clinicalImpression;
      const observations = investigation[0].item;
      if (values.cgh !== undefined) {
        const oldCGH = observations.length ? observations[0] : {};
        clinicalImpressionData.investigation[0].item[0] = {
          ...oldCGH,
          code: {
            text: 'cgh',
          },
          valueBoolean: values.cgh,
          note: values.cghNote,
        };
      }
    }

    return clinicalImpressionData;
  }

  handleSubmit(e) {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) { return; }

      const { actions, serviceRequest } = this.props;
      const patientData = this.getPatientData();

      const { clinicalImpression } = this.props;
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

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { patient, clinicalImpression } = this.props;

    this.pages = [
      {
        title: intl.get('screen.clinicalSubmission.patientInformation'),
        content: (
          <PatientInformation parentForm={this} getFieldDecorator={getFieldDecorator} patient={patient} />
        ),
        name: 'PatientInformation',
        values: {},
      },
      {
        title: intl.get('screen.clinicalSubmission.clinicalInformation'),
        content: (
          <ClinicalInformation parentForm={this} form={form} clinicalImpression={clinicalImpression} />
        ),
        name: 'ClinicalInformation',
        values: {},
      },
      {
        title: intl.get('screen.clinicalSubmission.approval'),
        content: (
          <Approval parentForm={this} getFieldDecorator={getFieldDecorator} />
        ),
        name: 'Approval',
        values: {},
      },
    ];

    const { currentPageIndex } = this.state;
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
            initialValues={{
              remember: true,
            }}
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
                onClick={() => message.success('Cancelled ...')}
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
  // patientInformation: PropTypes.shape(patientSubmissionShape).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    savePatientSubmission,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  patient: state.patientSubmission.patient,
  clinicalImpression: state.patientSubmission.clinicalImpression,
  search: state.search,
});

const WrappedPatientSubmissionForm = Form.create({ name: 'patient_submission' })(PatientSubmissionScreen);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedPatientSubmissionForm);
