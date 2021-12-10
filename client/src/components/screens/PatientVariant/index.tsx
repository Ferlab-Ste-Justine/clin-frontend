import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import VariantPageV1 from './VariantSearchV1';
import EnvironmentVariables from 'helpers/EnvironmentVariables';
import { RptManager } from 'helpers/keycloak-api/manager';

import styles from './index.module.scss';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const index = (props: any) => {
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
  } else {
    return (
      <iframe
        className={styles.variantIframe}
        src={`${EnvironmentVariables.configFor({
          key: 'CLIN_UI',
        })}/variant/${uid}?token=${rptToken}`}
      />
    );
  }
};

export default index;
