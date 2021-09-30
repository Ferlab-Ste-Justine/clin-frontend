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
}

export type GraphqlProvider = IProvider & ClinGraphqlProvider;

const Provider = ({ children }: IProvider): React.ReactElement => (
  <ApolloProvider>{ children }</ApolloProvider>
);

export default Provider;
