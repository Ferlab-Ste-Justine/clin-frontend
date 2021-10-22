import React, { ReactElement } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import get from 'lodash/get'
import { RptManager } from '../../helpers/keycloak-api/manager';
import { GraphqlBackend, GraphqlProvider } from 'store/providers';

const ARRANGER_API = get(window, 'CLIN.arrangerBaseUrl', process.env.REACT_APP_ARRANGER_API)
const PROJECT_ID = get(window, 'CLIN.arrangerProjectId', process.env.REACT_APP_ARRANGER_PROJECT_ID)
const FHIR_API = get(window, 'CLIN.fhirBaseUrl', process.env.REACT_APP_FHIR_SERVICE_URL)

const fhirLink = createHttpLink({
  uri: `${FHIR_API}/$graphql`,
});

const arrangerLink = createHttpLink({
  uri: `${ARRANGER_API}/${PROJECT_ID}/graphql`,
});

const getAuthLink = () => (
  setContext((_, { headers }) => (
    RptManager.readRpt().then(rptToken => (
      {
        headers: {
          ...headers,
          authorization: `Bearer ${rptToken.accessToken}`
        },
      }
    ))
)));

const backendUrl = (backend: GraphqlBackend) => (
  backend === GraphqlBackend.FHIR ? fhirLink : arrangerLink
);

export default ({ children, backend = GraphqlBackend.FHIR }: GraphqlProvider): ReactElement => {
  const header = getAuthLink();

  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: header.concat(backendUrl(backend)),
  });
  return <ApolloProvider client={client}>{ children }</ApolloProvider>;
};
