import React, { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { Bridge } from 'bridge';
import EnvironmentVariables from 'helpers/EnvironmentVariables';
import keycloak from 'keycloak';

import Layout from 'components/Layout';

import { NewPrescriptionModal, Screens } from './NewPrescriptionModal';

import styles from './search.module.scss';

const SearchScreen = (): React.ReactElement => {
  const iFrame = useRef<HTMLIFrameElement>(null);
  const [openModal, setOpenModal] = useState(Screens.None);

  const store = useStore();

  const prescriptionModalCallback = (_: MessageEvent) => {
    setOpenModal(Screens.Form);
  };

  let bridge: Bridge;

  useEffect(() => {
    if (iFrame && iFrame.current) {
      bridge = new Bridge(store, iFrame.current);
      bridge.register('createNewPrescription', prescriptionModalCallback);
    }

    return function cleanup() {
      if (bridge) {
        bridge.remove(prescriptionModalCallback);
      }
    };
  }, [iFrame]);

  return (
    <Layout>
      <NewPrescriptionModal openModal={openModal} setOpenModal={setOpenModal} />
      <iframe
        className={styles.searchIframe}
        ref={iFrame}
        src={`${EnvironmentVariables.configFor({ key: 'CLIN_UI' })}/search/?token=${
          keycloak.token
        }`}
      />
    </Layout>
  );
};

export default SearchScreen;
