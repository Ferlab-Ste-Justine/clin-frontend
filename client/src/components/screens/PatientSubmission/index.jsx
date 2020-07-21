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
  find,
} from 'lodash';

import IconKit from 'react-icons-kit';
import {
  ic_save,
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

const PatientInformation = ({ getFieldDecorator }) => (
  <Card title="Patient" bordered={false} className="patientContent">

    <Form.Item label="Nom">
      {getFieldDecorator('family', {
        rules: [{ required: true, message: 'Please input your family name!' }],
      })(
        <Input placeholder="Nom de famille" className="large" />,
      )}
    </Form.Item>
    <Form.Item label="Prénom">
      {getFieldDecorator('given', {
        rules: [{ required: true, message: 'Please input your given name!' }],
      })(
        <Input placeholder="Prénom" className="large" />,
      )}
    </Form.Item>
    <Form.Item label="Sexe">
      {getFieldDecorator('gender', {
        rules: [{ required: true, message: 'Please select your gender!' }],
      })(
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="a"><span className="radioText">Masculin</span></Radio.Button>
          <Radio.Button value="b"><span className="radioText">Féminin</span></Radio.Button>
          <Radio.Button value="c"><span className="radioText">Autre</span></Radio.Button>
          <Radio.Button value="d"><span className="radioText">Inconnu</span></Radio.Button>
        </Radio.Group>,
      )}
    </Form.Item>
    <Form.Item label="Date de naissance">
      {getFieldDecorator('birthDate', {
        rules: [{ required: true, message: 'Please input your birthdate!' }],
      })(
        <DatePicker className="small" />,
      )}
    </Form.Item>
    <Form.Item label="RAMQ">
      <Input placeholder="ABCD 0000 0000" className="large" />
    </Form.Item>
    <Form.Item label="MRN">
      <Input placeholder="12345678" className="small" />
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


const ClinicalInformation = (props) => {
  const familyItem = (
    <>
      <Form.Item>
        <Input placeholder="Ajouter une note…" className="small" />
      </Form.Item>
      <Form.Item>
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="m"><span className="radioText">Maternel</span></Radio.Button>
          <Radio.Button value="p"><span className="radioText">Paternel</span></Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Select className="large" placeholder="Selectionner" dropdownClassName="selectDropdown">
          <Select.Option value="CF">Canadien-Français</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button>-</Button>
      </Form.Item>
    </>
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
          <Form.Item label="Résumé">
            <TextArea rows={4} />
          </Form.Item>
        </Card>
        <Card title="Histoire familiale" bordered={false} className="patientContent">
          {familyItem}
          <Form.Item>
            <Button type="dashed" style={{ width: '60%' }}>
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
            <Input placeholder="Ajouter une note…" className="large" />
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

      const { actions } = this.props;
      console.log('Received values of form: ', values);
      const patient = {
        name: {
          family: values.family,
          given: values.given,
        },
        birthDate: values.birthDate,
        gender: values.gender,
      };

      actions.savePatient(patient);
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

    this.pages = [
      {
        title: intl.get('screen.clinicalSubmission.patientInformation'),
        content: (
          <PatientInformation parentForm={this} getFieldDecorator={getFieldDecorator} />
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
        <div className="steps">
          <Steps current={currentPageIndex}>
            {this.pages.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>

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
            {/* <Form.Item> */}
            <Button
              htmlType="submit"
            >
              <IconKit size={20} icon={ic_save} />
              {intl.get('screen.clinicalSubmission.saveButtonTitle')}
            </Button>
            {/* </Form.Item> */}

            <Button
              htmlType="submit"
              onClick={() => message.success('Cancelled ...')}
              className="cancelButton"
            >
              {intl.get('screen.clinicalSubmission.cancelButtonTitle')}
            </Button>
          </div>
        </Form>


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
  patient: state.patient,
  search: state.search,
});

const WrappedPatientSubmissionForm = Form.create({ name: 'patient_submission' })(PatientSubmissionScreen);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedPatientSubmissionForm);
