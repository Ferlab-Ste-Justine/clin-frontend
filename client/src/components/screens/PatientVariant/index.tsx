import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import VariantPageV1 from './VariantSearchV1';
import EnvironmentVariables from 'helpers/EnvironmentVariables';
import { RptManager } from 'helpers/keycloak-api/manager';

import styles from './index.module.scss';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

type PatientVariantProps = {
  app: { locale: { lang: string } };
};

const PatientVariant = ({ app, ...props }: PatientVariantProps) => {
  const query = useQuery();
  const [rptToken, setRptToken] = useState('');
  const { uid } = useParams<{ uid: string }>();

  useEffect(() => {
    (async () => {
      setRptToken((await RptManager.readRpt()).accessToken);
    })();
  }, []);

  if (query.get('v') == '1') {
    return <VariantPageV1 {...props} />;
  }

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
