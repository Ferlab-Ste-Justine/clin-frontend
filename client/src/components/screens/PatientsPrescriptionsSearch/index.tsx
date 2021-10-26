import React from 'react';

import Layout from 'components/Layout';
import { GraphqlBackend } from 'store/providers';
import ApolloProvider from 'store/providers/apollo';

import PatientsPrescriptions from './PatientsPrescriptions';

const SearchScreen = (): React.ReactElement => (
  <Layout>
    <ApolloProvider backend={GraphqlBackend.ARRANGER}>
      <PatientsPrescriptions />
    </ApolloProvider>
  </Layout>
)
export default SearchScreen;
