import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Tabs, Button, Typography, Tooltip, Tag, Popover,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assessment, ic_show_chart, ic_local_library, ic_people,
} from 'react-icons-kit/md';
import FrequenciesTab from './components/frequencies';
import ResumeTabs from './components/resume';
import AssociationsTab from './components/associations';
import PatientsTabs from './components/patients';
import './style.scss';

import fetchVariantDetails from '../../../actions/variantDetails';
import { navigateToPatientScreen, navigateToVariantDetailsScreen } from '../../../actions/router';
import Layout from '../../Layout';

const SUMMARY_TAB = 'screen.variantdetails.tab.summary';
const FREQUENCIES_TAB = 'screen.variantdetails.tab.frequencies';
const CLINICAL_ASSOCIATIONS_TAB = 'screen.variantdetails.tab.clinicalAssociations';
const PATIENTS_TAB = 'screen.variantdetails.tab.patients';

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
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
  }

  componentDidMount() {
    const { match, actions } = this.props;
    const { params } = match;
    const { uid } = params;
    this.variantId = uid;

    actions.fetchVariantDetails(uid);
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
              <PatientsTabs variantDetails />

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
