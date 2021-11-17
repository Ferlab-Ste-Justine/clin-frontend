import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import VariantPageV1 from './VariantSearchV1';
import keycloak from 'keycloak';
import EnvironmentVariables from 'helpers/EnvironmentVariables';

import styles from './index.module.scss';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const index = (props: any) => {
  const query = useQuery();
  const { uid } = useParams<{ uid: string }>();

  if (query.get("v") == "1") {
    return <VariantPageV1 {...props} />;
  } else {
    return (
      <iframe
        className={styles.variantIframe}
        src={`${EnvironmentVariables.configFor({ key: 'CLIN_UI' })}/variant/${uid}?token=${
          keycloak.token
        }`}
      />
    );
  }
};

export default index;
