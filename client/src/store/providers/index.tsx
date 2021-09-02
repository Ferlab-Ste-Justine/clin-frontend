import React from 'react';

import ApolloProvider from './apollo';

export enum GraphqlBackend {
  FHIR,
  ARRANGER
}

type ClinGraphqlProvider = {
  backend?: GraphqlBackend;
}

export interface IProvider {
  children: React.ReactNode;
  userToken: string;
}

export type GraphqlProvider = IProvider & ClinGraphqlProvider;

const Provider = ({ children, userToken }: IProvider): React.ReactElement => (
  <ApolloProvider userToken={userToken}>{ children }</ApolloProvider>
);

export default Provider;
