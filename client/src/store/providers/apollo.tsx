import React, { ReactElement } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { IProvider } from 'store/providers';

const ARRANGER_API = process.env.REACT_APP_ARRANGER_API;
const PROJECT_ID = process.env.REACT_APP_PROJECT_ID;

const httpLink = createHttpLink({
  uri: `${ARRANGER_API}${PROJECT_ID}/graphql`,
});

const getAuthLink = (userToken: string) => setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: userToken ? `Bearer ${userToken}` : '',
  },
}));

export default ({ children, userToken }: IProvider): ReactElement => {
  const header = getAuthLink(userToken);

  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: header.concat(httpLink),
  });
  return <ApolloProvider client={client}>{ children }</ApolloProvider>;
};
