/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Tabs, Button, Row, Col, Typography, Tooltip, Card, Tag, Popover,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assessment, ic_show_chart, ic_local_library, ic_people,
} from 'react-icons-kit/md';
import DataTable, { createCellRenderer } from '../../Table/index';
import FrequenciesTab from './components/frequencies';
import ResumeTabs from './components/resume';
import AssociationsTab from './components/associations';
import './style.scss';

import fetchVariantDetails from '../../../actions/variantDetails';
import { navigateToPatientScreen, navigateToVariantDetailsScreen } from '../../../actions/router';
import Layout from '../../Layout';

const SUMMARY_TAB = 'screen.variantdetails.tab.summary';
const FREQUENCIES_TAB = 'screen.variantdetails.tab.frequencies';
const CLINICAL_ASSOCIATIONS_TAB = 'screen.variantdetails.tab.clinicalAssociations';
const PATIENTS_TAB = 'screen.variantdetails.tab.patients';

const COLUMN_WIDTH = {
  TINY: 65,
  NARROW: 80,
  SMALL: 90,
  NORMAL: 100,
  SMALLMEDIUM: 120,
  MEDIUM: 150,
  WIDE: 200,

};

const Link = ({ url, text }) => (
  <Button
    key={uuidv1()}
    type="link"
    size="default"
    href={url}
    target="_blank"
    className="link--underline"
  >
    { text }
  </Button>
);

Link.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

class VariantDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getDonors = this.getDonors.bind(this);
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);
    this.state.donorsColumnPreset = [
      {
        key: 'patient_id',
        label: 'screen.variantDetails.patientsTab.donor',
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'patient_id',
          handler: this.handleGoToPatientScreen,
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'organization_id',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.organization_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'study_id',
        label: 'screen.variantDetails.patientsTab.studyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.study_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'family_id',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.family_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'sequencing_strategy',
        label: 'screen.variantDetails.patientsTab.type',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.sequencing_strategy; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'zygosity',
        label: 'screen.variantDetails.patientsTab.zygosity',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.zygosity; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALL,
      },
      {
        key: 'ad_alt',
        label: 'screen.variantDetails.patientsTab.adAlt',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_alt; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'ad_total',
        label: 'screen.variantDetails.patientsTab.adTotal',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_total; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'ad_ratio',
        label: 'screen.variantDetails.patientsTab.adFreq',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_ratio; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
      {
        key: 'gq',
        label: 'screen.variantDetails.patientsTab.genotypeQuality',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.gq; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'qd',
        label: 'screen.variantDetails.patientsTab.qd',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.qd; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'last_update',
        label: 'screen.variantDetails.patientsTab.lastUpdate',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.last_update; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
    ];
  }

  componentDidMount() {
    const { match, actions } = this.props;
    const { params } = match;
    const { uid } = params;
    this.variantId = uid;

    actions.fetchVariantDetails(uid);
  }

  getDonors() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        donors,
      } = data;
      return donors;
    }

    return [];
  }

  goToPatientTab() {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.id, 'patients');
  }

  handleGoToPatientScreen(e) {
    const { actions } = this.props;
    const value = e.target.getAttribute('data-id');
    actions.navigateToPatientScreen(value);
  }

  handleTabNavigation(tab) {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.variantID, tab);
  }

  render() {
    const { variantDetails, router } = this.props;
    const { data } = variantDetails;
    const { hash } = router.location;

    if (!data) return null;

    const {
      donorsColumnPreset,
    } = this.state;

    let mutationIdTitle = null;
    if (data.hgvsg.length > 31) {
      const mutationIdTitleStart = data.hgvsg.substring(0, 15);
      const mutationIdTitleEnd = data.hgvsg.substring(data.hgvsg.length - 15);
      const mutationIdTitleText = `${mutationIdTitleStart} ... ${mutationIdTitleEnd}`;

      const content = (
        <div>
          <p>{ data.hgvsg }</p>
        </div>
      );
      mutationIdTitle = (
        <Popover content={content}>
          <Typography.Text className="variant-page-content__header__title">
            { mutationIdTitleText }
          </Typography.Text>
        </Popover>
      );
    } else {
      mutationIdTitle = data.hgvsg;
    }

    const getVepTag = () => {
      switch (data.impact_score) {
        case 1:
          return (
            <Tag className="variant-page-content__header__tag"> MODIFIER </Tag>
          );
        case 2:
          return (
            <Tag className="variant-page-content__header__tag" color="green"> LOW </Tag>
          );
        case 3:
          return (
            <Tag className="variant-page-content__header__tag" color="gold"> MODERATE </Tag>
          );
        case 4:
          return (
            <Tag className="variant-page-content__header__tag" color="red"> HIGH </Tag>
          );

        default:
          return true;
      }
    };

    return (
      <Layout>
        <div className="variant-page-content">
          <div className="page_headerStaticNoMargin">
            <div className="variant-page-content__header">
              <Tooltip title={data.mutationId} overlayClassName="tooltip">
                <span>
                  <Typography.Text className="variant-page-content__header__title">
                    { mutationIdTitle }
                  </Typography.Text>
                </span>
              </Tooltip>
              <Tag className="variant-page-content__header__tag" color="purple"> Germline </Tag>
              { getVepTag() }
            </div>
          </div>
          <Tabs
            key="..."
            activeKey={(hash ? hash.replace('#', '') : 'summary')}
            className="tabs staticTabs"
            onChange={this.handleTabNavigation}
          >
            <Tabs.TabPane
              key="summary"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_assessment} />
                  { intl.get(SUMMARY_TAB) }
                </span>
              )}
            >
              <ResumeTabs variantDetails />

            </Tabs.TabPane>
            <Tabs.TabPane
              key="frequencies"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_show_chart} />
                  { intl.get(FREQUENCIES_TAB) }
                </span>
              )}
            >
              <FrequenciesTab variantDetails />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="clinical_associations"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_local_library} />
                  { intl.get(CLINICAL_ASSOCIATIONS_TAB) }
                </span>
              )}
            >
              <AssociationsTab variantDetails />

            </Tabs.TabPane>
            <Tabs.TabPane
              key="patients"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_people} />
                  { intl.get(PATIENTS_TAB) }
                </span>
              )}
            >
              <div className="page-static-content">
                <Row type="flex" gutter={32}>
                  <Card title={intl.get('screen.variantDetails.patientsTab.title')} className="staticCard" bordered={false}>
                    <Row>
                      <Col>
                        <div>
                          { intl.get('screen.variantDetails.patientsTab.count', { qty: this.getDonors().length }) }
                        </div>
                      </Col>
                    </Row>
                    <Col className="patientTable">
                      <DataTable
                        size={this.getDonors().length}
                        total={this.getDonors().length}
                        reorderColumnsCallback={this.handleColumnsReordered}
                        resizeColumnsCallback={this.handleColumnResized}
                        columns={donorsColumnPreset}
                        copyCallback={this.handleCopy}
                        enableGhostCells
                        enableResizing
                      />
                    </Col>
                  </Card>

                </Row>
              </div>

            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}
VariantDetailsScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
  variantDetails: PropTypes.shape({}).isRequired,
};
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    fetchVariantDetails,
    navigateToPatientScreen,
    navigateToVariantDetailsScreen,
  }, dispatch),
});
const mapStateToProps = (state) => ({
  app: state.app,
  router: state.router,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
  variantDetails: state.variantDetails,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VariantDetailsScreen);
