/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Descriptions, Typography, PageHeader,
} from 'antd';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';
import VariantNavigation from './components';

import './style.scss';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';

import Statement from '../../Query/Statement';
import { selectQuery, replaceQuery, removeQuery, duplicateQuery, sortStatement } from '../../../actions/variant';


class PatientVariantScreen extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.handleQuerySelection = this.handleQuerySelection.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueryRemoval = this.handleQueryRemoval.bind(this);
    this.handleQueryDuplication = this.handleQueryDuplication.bind(this);
    this.handleStatementSort = this.handleStatementSort.bind(this);
  }

  handleQuerySelection(query) {
    const { actions, patient } = this.props;
    const { id } = patient;

    actions.selectQuery(id, query);
  }

  handleQueryChange(query) {
    const { actions } = this.props;
    actions.replaceQuery(query.data || query)
  }

  handleQueryRemoval(query) {
    const { actions } = this.props;
    actions.removeQuery(query.data)
  }

  handleQueryDuplication(query, index) {
    const { actions } = this.props;
    actions.duplicateQuery(query.data, index)
  }

  handleStatementSort(sortedQueries, sortedActiveQuery) {
    const { actions } = this.props;
    actions.sortStatement(sortedQueries, sortedActiveQuery)
  }

    render() {
    const { intl, variant } = this.props;
    const { queries } = variant;
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

            <VariantNavigation
                key="variant-navigation"
                className="variant-navigation"
                onEditCallback={this.handleQueryChange}
            />
            <br />
            <br />
            <Statement
              key="variant-statement"
              data={queries}
              intl={intl}
              options={{
                  copyable: true,
                  duplicatable: true,
                  editable: true,
                  removable: true,
                  reorderable: true,
                  selectable: true,
                  undoable: true,
              }}
              display={{
                  compoundOperators: true,
              }}
              onSelectCallback={this.handleQuerySelection}
              onSortCallback={this.handleStatementSort}
              onEditCallback={this.handleQueryChange}
              onRemoveCallback={this.handleQueryRemoval}
              onDuplicateCallback={this.handleQueryDuplication}
            />
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    selectQuery,
    replaceQuery,
    removeQuery,
    duplicateQuery,
    sortStatement,
  }, dispatch),
});

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PatientVariantScreen));
