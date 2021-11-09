import React, { useState } from 'react';
import IconKit from 'react-icons-kit';
import { ic_cloud_download, ic_people, ic_widgets } from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { MedicineBoxFilled } from '@ant-design/icons';
import { Spin, Tabs } from 'antd';
import PropTypes from 'prop-types';
import { appShape } from 'reducers/app';

import ApolloProvider from 'store/providers/apollo';

import Layout from '../../Layout';
import PatientVariantScreen from '../PatientVariant';

import FamilyTab from './components/FamilyTab';
import FilesTab from './components/FilesTab';
import PatientHeader from './components/PatientHeader';
import PrescriptionsTab from './components/PrescriptionsTab';

import 'style/themes/clin/dist/antd.css';
import './style.scss';

const PatientScreen = ({ app, patient }) => {
  const { showSubloadingAnimation } = app;

  if (showSubloadingAnimation) {
    return (
      <Layout>
        <div className="spinContainer">
          <Spin spinning />
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      content: <PrescriptionsTab />,
      name: 'prescriptions',
      title: (
        <span className="tabName">
          <MedicineBoxFilled />
          {intl.get('screen.patient.tab.prescriptions')}
        </span>
      ),
    },
    {
      content: <FamilyTab />,
      name: 'family',
      title: (
        <span className="tabName">
          <IconKit icon={ic_people} size={18} />
          {intl.get('screen.patient.tab.family')}
        </span>
      ),
    },
    {
      content: <PatientVariantScreen />,
      name: 'variant',
      title: (
        <span className="tabName">
          <IconKit icon={ic_widgets} size={18} />
          Variants
        </span>
      ),
    },
    {
      // FixMe
      content: (
        <ApolloProvider>
          <FilesTab />
        </ApolloProvider>
      ),
      name: 'files',
      title: (
        <span className="tabName">
          <IconKit icon={ic_cloud_download} size={18} />
          Fichiers
        </span>
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <Layout>
      {patient?.id && patient.id.length > 0 && (
        <div className="patient-page">
          <div className="page_headerStaticNoMargin">
            <PatientHeader patient={patient} />
          </div>
          <Tabs
            activeKey={activeTab}
            className="patient-page__tabs staticTabs"
            onChange={(tab) => {
              setActiveTab(tab);
            }}
          >
            {tabs.map((tab) => (
              <Tabs.TabPane key={tab.name} style={{ height: '100%' }} tab={tab.title}>
                {tab.content}
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      )}
    </Layout>
  );
};

PatientScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  patient: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state) => ({
  app: state.app,
  patient: state.patient.patient.parsed,
});

export default connect(mapStateToProps, {})(PatientScreen);
