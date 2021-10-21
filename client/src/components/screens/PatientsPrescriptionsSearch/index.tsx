import React from 'react';
import keycloak from 'keycloak';

import Layout from 'components/Layout';
import { GraphqlBackend } from 'store/providers';
import ApolloProvider from 'store/providers/apollo';

import PatientsPrescriptionsSearch from './SearchPrescription';

const PatientsPrescriptionsSearchScreen = (): React.ReactElement => (
  <Layout>
    <ApolloProvider backend={GraphqlBackend.ARRANGER}>
      <PatientsPrescriptionsSearch />
    </ApolloProvider>
  </Layout>
)
export default PatientsPrescriptionsSearchScreen;
