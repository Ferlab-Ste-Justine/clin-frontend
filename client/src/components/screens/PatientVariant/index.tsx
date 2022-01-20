import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import EnvironmentVariables from 'helpers/EnvironmentVariables';
import { RptManager } from 'helpers/keycloak-api/manager';

import 'style/themes/clin/dist/antd.css';
import styles from './index.module.scss';

type PatientVariantProps = {
  app: { locale: { lang: string } };
};

const PatientVariant = ({ app }: PatientVariantProps) => {
  const [rptToken, setRptToken] = useState('');
  const { uid } = useParams<{ uid: string }>();

  useEffect(() => {
    (async () => {
      setRptToken((await RptManager.readRpt()).accessToken);
    })();
  }, []);

  return (
    <iframe
      className={styles.variantIframe}
      src={`${EnvironmentVariables.configFor({
        key: 'CLIN_UI',
      })}/variant/${uid}?token=${rptToken}&lang=${app.locale.lang}`}
    />
  );
};

const mapStateToProps = (state: any) => ({
  app: state.app,
});

export default connect(mapStateToProps)(PatientVariant);
