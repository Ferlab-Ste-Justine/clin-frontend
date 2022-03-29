import React from 'react';
import { render, screen } from '@testing-library/react';
import AppTest from 'AppTest';

import FilesTab from 'components/screens/Patient/components/FilesTab';
import { manyFilesData } from 'components/screens/Patient/components/FilesTab/tests/mockData';
import {useFilesData} from 'store/graphql/files/actions'
import ApolloProvider from 'store/providers/apollo';


jest.mock("store/graphql/files/actions");

const renderComponents = (
  <AppTest>
    <ApolloProvider>
        <FilesTab />
    </ApolloProvider>
  </AppTest>
)

describe('PatientFiles', () => {

  beforeEach(() => {
    (useFilesData as jest.Mock).mockReset();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shoud show empty page when no file', async () => {


    (useFilesData as jest.Mock).mockImplementation(() =>
      ({ loading: false, results: {"id": "Patient/QA-PA-00002/_history/4"}})
    );

    render(
      renderComponents
    );
    expect(screen.getByText('Aucun fichier pour ce patient')).toBeDefined();
  });

  test('should display a table with all files', async () => {

    (useFilesData as jest.Mock).mockImplementation(() =>(manyFilesData));

    render(
      renderComponents
    );
    const nOfHeaderRow = 1;
    const nOfFiles = manyFilesData.results.docs.length
    const totalNOfRow = nOfHeaderRow + nOfFiles;
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(totalNOfRow);
  });
});