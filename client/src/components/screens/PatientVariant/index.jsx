/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Row, Col, Input, Icon, Tag, Pagination, Button, Descriptions, Typography, PageHeader,
} from 'antd';
import { format } from 'util';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import VariantNavigation from './components';

import './style.scss';
import { patientShape } from '../../../reducers/patient';

// import { navigateToPatientScreen, navigateToPatientSearchScreen } from '../../../actions/router';
// import { searchPatientVariants } from '../../../actions/patient';
import { cloneDeep } from 'lodash';
import Statement from '../../Query/Statement';



/* eslint-disable max-len */
const queryA = {
    title: 'Query 1',
    instructions: [
        {
            type: 'filter',
            data: {
                id: 'study',
                type: 'generic',
                operand: 'all',
                values: ['My Study', 'Your Study'],
            },
        },
        {
            type: 'operator',
            data: {
                type: 'and',
            },
        },
        {
            type: 'filter',
            data: {
                id: 'proband',
                type: 'generic',
                operand: 'one',
                values: ['true'],
            },
        },
        {
            type: 'operator',
            data: {
                type: 'and',
            },
        },
        {
            type: 'filter',
            data: {
                id: 'study',
                type: 'generic',
                operator: 'all',
                values: ['My Study', 'Your Study'],
            },
        },
        {
            type: 'operator',
            data: {
                type: 'and',
            },
        },
        {
            type: 'filter',
            data: {
                id: 'proband',
                type: 'generic',
                operand: 'one',
                values: ['true'],
            },
        },
    ],
};

const queryB = {
    instructions: [
        {
            type: 'filter',
            data: {
                id: 'study',
                type: 'generic',
                operand: 'none',
                values: ['My Study'],
            },
        },
        {
            type: 'operator',
            data: {
                type: 'or',
            },
        },
        {
            type: 'filter',
            data: {
                id: 'proband',
                type: 'generic',
                operand: 'all',
                values: ['true'],
            },
        },
    ],
};

const optionsA = {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    reorderable: true,
    selectable: true,
    undoable: true,
};
const statementA = [
    queryA,
    queryB,
    cloneDeep(queryA),
    cloneDeep(queryA),
];
const displayA = {
    compoundOperators: true,
};


class PatientVariantScreen extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {

  }

    render() {
    const { intl, patient } = this.props;

    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <PageHeader
              title={(
                  <div>
                    <Typography.Title level={2}>
                      Recherche de variants
                    </Typography.Title>
                  </div>
              )}
          />

            <Descriptions title="Patient [PT93993], Masculin, Proband, Affecté" layout="horizontal" column={1}>
                <Descriptions.Item label="Famille">[FA09383], Mère: [PT3983883] (Non affecté), Père: [PT4736] (Non affecté)</Descriptions.Item>
                <Descriptions.Item label="Signes">Epilepsie ([HP93993]), Schizophrénie ([HP2772])</Descriptions.Item>
                <Descriptions.Item label="Indication(s)">Anomalies neuro-psychiatriques</Descriptions.Item>
            </Descriptions>

            <VariantNavigation className="variant-navigation" />
            <br />
            <br />
            <Statement key="variant-statement" data={statementA} options={optionsA} display={displayA} />


        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
  query: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // navigateToPatientScreen,
    // navigateToPatientSearchScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientVariantScreen));
