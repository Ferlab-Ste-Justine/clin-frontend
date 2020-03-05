

/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu,
} from 'antd';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import InteractiveTable from '../../Table/InteractiveTable';
import { createCellRenderer } from '../../Table/index';

import './style.scss';
import style from './style.module.scss';
// import { variantDetails } from '../../../reducers/variantDetails';

import fetchVariantDetails from '../../../actions/variantDetails';

const SUMMARY_TAB = 'screen.variantdetails.tab.summary';
const FREQUENCIES_TAB = 'screen.variantdetails.tab.frequencies';
const CLINICAL_ASSOCIATIONS_TAB = 'screen.variantdetails.tab.clinicalAssociations';
const PATIENTS_TAB = 'screen.variantdetails.tab.patients';

class VariantDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: SUMMARY_TAB,
    };

    this.columnPreset = [
      { key: 'geneAffectedId', label: 'Gene', renderer: createCellRenderer('button', this.getConsequences, { key: 'id', handler: () => {} }) },
      { key: 'aaChange', label: 'AA', renderer: createCellRenderer('text', this.getConsequences, { key: 'organization' }) },
      { key: 'consequence', label: 'Consequence', renderer: createCellRenderer('text', this.getConsequences, { key: 'firstName' }) },
      { key: 'strand', label: 'Brin', renderer: createCellRenderer('text', this.getConsequences, { key: 'lastName' }) },
      { key: 'impact', label: 'Impact', renderer: createCellRenderer('text', this.getConsequences, { key: 'birthDate' }) },
      { key: 'conservationScores.PhyloP17Way', label: 'Conservation (PhyloP17Way)', renderer: createCellRenderer('text', this.getConsequences, { key: 'familyComposition' }) },
      { key: 'transcripts', label: 'Transcripts', renderer: createCellRenderer('text', this.getConsequences, { key: 'proband' }) },
    ];
  }

  componentDidMount() {
    const { match, actions } = this.props;
    const { params } = match;
    const { uid } = params;
    this.variantId = uid;

    actions.fetchVariantDetails(uid);
  }

  getConsequences() {
    const {
      variantDetails,
    } = this.props;

    if (!variantDetails) return null;

    const { data } = variantDetails;

    if (!data) return null;

    const { consequences } = data;

    return consequences;
  }

  render() {
    const {
      currentTab,
    } = this.state;

    const consequences = this.getConsequences();

    if (!consequences) return null;

    return (
      <Content>
        <Header />
        <Tabs key="..." defaultActiveKey={SUMMARY_TAB} className="tabs">
          <Tabs.TabPane
            key={SUMMARY_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(SUMMARY_TAB)}
              </span>
            )}
          >
            <Row type="flex" gutter={32}>
              <Col>
                <Row>
                  <Col>
                    <DataList
                      title={intl.get(SUMMARY_TAB)}
                      dataSource={[
                        { label: 'Variant', value: 'TODO' },
                        { label: 'Cytobande', value: 'TODO' },
                        { label: 'Type', value: 'TODO' },
                        { label: 'Génome Réf.', value: 'TODO' },
                        { label: 'Allele Réf.', value: 'TODO' },
                        { label: 'Allele Atl', value: 'TODO' },
                        { label: 'Gène(s)', value: 'TODO' },
                        { label: 'Impact(s)', value: 'TODO' },
                        { label: 'Signification clinique (Clinvar)', value: 'TODO' },
                        { label: 'Date des annotations', value: 'TODO' },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col>
                    <DataList
                      title="Références externes"
                      dataSource={[
                        { label: 'Clin Var', value: 'TODO' },
                        { label: 'OMIN', value: 'TODO' },
                        { label: 'dbSNP', value: 'TODO' },
                      ]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <DataList
                      title="Patients"
                      dataSource={[
                        { label: 'Nb de patients (i)', value: 'TODO' },
                        { label: 'Nb d\'alleles ALT', value: 'TODO' },
                        { label: 'Nb total d\'alleles', value: 'TODO' },
                        { label: 'Nb d\'homozygotes', value: 'TODO' },
                        { label: 'Fréquences', value: 'TODO' },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row type="flex" gutter={32}>
              <Col>
                <InteractiveTable
                  key="patient-interactive-table"
                  size={consequences.length}
                  page={1}
                  total={consequences.length}
                  schema={this.columnPreset}
                  pageChangeCallback={this.handlePageChange}
                  pageSizeChangeCallback={this.handlePageSizeChange}
                  exportCallback={this.exportToTsv}
                  numFrozenColumns={1}
                  isLoading={false}
                  copyCallback={this.handleCopy}
                />
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane
            key={FREQUENCIES_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(FREQUENCIES_TAB)}
              </span>
            )}
          >

          </Tabs.TabPane>

          <Tabs.TabPane
            key={CLINICAL_ASSOCIATIONS_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(CLINICAL_ASSOCIATIONS_TAB)}
              </span>
            )}
          >

          </Tabs.TabPane>

          <Tabs.TabPane
            key={PATIENTS_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(PATIENTS_TAB)}
              </span>
            )}
          >

          </Tabs.TabPane>
        </Tabs>
      </Content>
    );
  }
}

VariantDetailsScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  variantDetails: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchVariantDetails,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
  variantDetails: state.variantDetails,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VariantDetailsScreen);
