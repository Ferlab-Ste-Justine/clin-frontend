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
  Steps, Card, Form, Input, Button, message, Radio, DatePicker, Select, Tree,
} from 'antd';
import {
  has,
} from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_save, ic_remove, ic_add,
} from 'react-icons-kit/md';
import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import { patientSubmissionShape } from '../../../reducers/patientSubmission';
import { appShape } from '../../../reducers/app';
import {
  savePatient,
} from '../../../actions/patientSubmission';
import './style.scss';

const { Step } = Steps;
const { TextArea } = Input;
const { TreeNode } = Tree;

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
    <Card title="Patient" bordered={false} className="patientContent">
      <Form.Item label="Nom">
        {getFieldDecorator('family', {
          rules: [{ required: true, message: 'Please enter the family name!' }],
          initialValue: has(patient, 'name.family') ? patient.name.family : '',
        })(
          <Input placeholder="Nom de famille" className="large" />,
        )}
      </Form.Item>
      <Form.Item label="Prénom">
        {getFieldDecorator('given', {
          rules: [{ required: true, message: 'Please enter the given name!' }],
          initialValue: has(patient, 'name.given') ? patient.name.given : '',
        })(
          <Input placeholder="Prénom" className="large" />,
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
          <Input placeholder="ABCD 0000 0000" className="large" />,
        )}
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label="MRN">
        {getFieldDecorator('mrn', {
          rules: [{ required: true, message: 'Please enter the MRN number!' }],
          initialValue: mrnValue(patient),
        })(
          <Input placeholder="12345678" className="small" />,
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
          <Select.Option value="CF">Canadien-Français</Select.Option>
        </Select>
        <span className="optional">Facultatif</span>
      </Form.Item>
      <Form.Item label="Consanguinité">
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="o"><span className="radioText">Oui</span></Radio.Button>
          <Radio.Button value="n"><span className="radioText">Non</span></Radio.Button>
          <Radio.Button value="n"><span className="radioText">Inconnu</span></Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Card>
  );
};


const ClinicalInformation = (props) => {
  const familyItem = (
    <div className="familyLine">
      <Form.Item>
        <Input placeholder="Ajouter une note…" className="noteInput note" />
      </Form.Item>
      <Form.Item>
        <Select className="selectRelation" placeholder="Relation parental" dropdownClassName="selectDropdown">
          <Select.Option value="CF">Inconnu Parental</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button className="delButton" shape="round">
          <IconKit size={20} icon={ic_remove} />
        </Button>
      </Form.Item>
    </div>
  );
  return (
    <div>
      <Form>
        <Card title="Informations cliniques" bordered={false} className="patientContent">

          <Form.Item label="Type d’analyse">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="exome"><span className="radioText">Exome</span></Radio.Button>
              <Radio.Button value="genome"><span className="radioText">Génome</span></Radio.Button>
              <Radio.Button value="sequencage"><span className="radioText">Séquençage ciblé</span></Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>
        <Card title="Résumé de l’investigation" bordered={false} className="patientContent">
          <Form.Item label="CGH">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="negatif"><span className="radioText">Négatif</span></Radio.Button>
              <Radio.Button value="anormal"><span className="radioText">Anormal</span></Radio.Button>
              <Radio.Button value="so"><span className="radioText">Sans objet</span></Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Précision">
            <Input placeholder="Veuillez préciser…" className="note" />
          </Form.Item>
          <Form.Item label="Résumé">
            <TextArea className="note" rows={4} />
            <span className="optional">Facultatif</span>
          </Form.Item>
        </Card>
        <Card title="Histoire familiale" bordered={false} className="patientContent">
          <div className="familyLines">
            {familyItem}
          </div>
          <Form.Item>
            <Button className="addFamilyButton">
              <IconKit size={14} icon={ic_add} />
              Ajouter
            </Button>
          </Form.Item>
        </Card>
        <Card title="Signes cliniques" bordered={false} className="patientContent">
          <Form.Item>
            <Input placeholder="Ajouter une note…" className="large" />
          </Form.Item>
          <Tree>
            <TreeNode title="parent 1" key="0-0">
              <TreeNode title="parent 1-0" key="0-0-0" disabled>
                <TreeNode title="leaf" key="0-0-0-0" disableCheckbox />
                <TreeNode title="leaf" key="0-0-0-1" />
              </TreeNode>
              <TreeNode title="parent 1-1" key="0-0-1">
                <TreeNode title={<span style={{ color: '#1890ff' }}>sss</span>} key="0-0-1-0" />
              </TreeNode>
            </TreeNode>
          </Tree>
        </Card>
        <Card title="Indications" bordered={false} className="patientContent">
          <Form.Item label="Hypothèse(s) de diagnostique">
            <TextArea className="note" rows={4} />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

const Approval = props => (
  <div>
    <Card title="Analyse demandée" bordered={false} className="patientContent">
      <Form>
        <Form.Item label="Some field">
          <Input placeholder="a placeholder ..." />
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

  handleSubmit(e) {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) { return; }

      const { actions, patient } = this.props;
      const patientData = {
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

      actions.savePatient(patientData);
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
    const { patient } = this.props;

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
          <ClinicalInformation parentForm={this} getFieldDecorator={getFieldDecorator} />
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
        <div className="page_headerStatic">
          <Steps current={currentPageIndex} className="step">
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
              <Button type="primary" onClick={() => this.next()} disabled={this.isLastPage()}>
                {intl.get('screen.clinicalSubmission.nextButtonTitle')}
              </Button>
              <Button onClick={() => this.previous()} disabled={this.isFirstPage()}>
                {intl.get('screen.clinicalSubmission.previousButtonTitle')}
              </Button>
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
    savePatient,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  patient: state.patientSubmission.patient,
  search: state.search,
});

const WrappedPatientSubmissionForm = Form.create({ name: 'patient_submission' })(PatientSubmissionScreen);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedPatientSubmissionForm);
