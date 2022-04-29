import React, { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { connect } from 'react-redux';
import { Bridge } from 'bridge';

import Layout from 'components/Layout';

import { NewPrescriptionModal, Screens } from './NewPrescriptionModal';

import styles from './search.module.scss';

type SearchScreenProps = {
  app: { locale: { lang: string } };
};

const SearchScreen = ({ app }: SearchScreenProps): React.ReactElement => {
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
      Bridge.setMainChannel(iFrame.current)
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
        src={`/search/?lang=${
          app.locale.lang
        }`}
      />
    </Layout>
  );
};

const mapStateToProps = (state: any) => ({
  app: state.app,
});

export default connect(mapStateToProps)(SearchScreen);
