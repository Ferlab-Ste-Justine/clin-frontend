import React, { useRef } from 'react';
import EnvironmentVariables from 'helpers/EnvironmentVariables';
import keycloak from 'keycloak';

import Layout from 'components/Layout';

import styles from './search.module.scss';

const SearchScreen = (): React.ReactElement => (
  <Layout>
    <iframe
      className={styles.searchIframe}
      src={`${EnvironmentVariables.configFor({ key: 'CLIN_UI' })}/search/?token=${keycloak.token}`}
    />
  </Layout>
);

export default SearchScreen;
