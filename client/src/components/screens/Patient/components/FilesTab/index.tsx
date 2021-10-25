import './components/tableColumns'

import React from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { Card, Spin,Table } from 'antd';
import { formatBytes } from 'helpers/file';
import { ParsedPatientData } from 'helpers/providers/types';
import { State } from 'reducers';

import { useFilesData } from 'store/graphql/files/actions';

import EmptyCard from './components/EmptyCard';
import { filesColumns } from './components/tableColumns';

import './styles.scss';

export type UseFilesResponse = {
  loading:boolean
  results: ResultsFilesResponse
}

export type ResultsFilesResponse = {
  docs:PatientResponse [];
  id:string;
}

export type PatientResponse = {
  id: string;
  type: string;
  aliquot: AliquotContent;
  content: {
      attachment: DocumentReferenceContent;
      format: string;
  }[];
  task: TaskResponse;
}

type AliquotContent = {
  id: string[]
  resource: [
      {
          external_id: string;
          organization: {
              reference: string;
              resource: {
                  name: string;
              }
          }
          sample: [
              {
              reference: string
              resource: {
                  external_id: string;
                  organization: {
                      reference: string;
                      resource: {
                          name: string;
                      }
                  }
              }
          }
      ]
      }
  ]
}

type DocumentReferenceContent = {
  url: string;
  size: number;
  hash: string;
  title: string;
  format: string;
}

export type TaskResponse = {
  id: string;
  focus: {
      reference: string;
  }
  runDate: string;
}

export type FileResult = {
  action: {format: string, metadata: PatientResponse, url :{file:string, index:string}},
  aliquot: string,
  date: string,
  format: string,
  key: number,
  prescription: string,
  sample: string
  size: string,
  title:string,
  type:string,
}

const makeRowsFromFilesResults = (filesResults:UseFilesResponse) => filesResults.results.docs.map((element: PatientResponse, index: number):FileResult => {
  const { size } = element.content[0].attachment;
  const url = {
    file: element.content[0].attachment.url,
    index: element.content.length > 1 ? element.content[1].attachment.url : '',
  };
  return {
    action: {format: element.content[0].format, metadata: element, url},
    aliquot: element.aliquot.resource[0].external_id,
    date: element.task.runDate,
    format: element.content[0].format,
    key: index,
    prescription: element.task.focus.reference.split('/')[1],
    sample: element.aliquot.resource[0].sample[0].resource.external_id,
    size: formatBytes(Number(size)),
    title: element.content[0].attachment.title,
    type:element.type,
  };
})

const FilesTab = () : React.ReactElement => {
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const prescriptionFileResults = useFilesData({ patientId: patient.id });

  if (!prescriptionFileResults.loading && !prescriptionFileResults.results.docs) {
    return <EmptyCard />
  }
  const filesColumnsIntl = () => filesColumns.map((c) => ({ ...c, title: intl.get(c.intlKey) }));
  
    return (
    <div className="page-static-content files-tab">
      <Card
        bordered={false}
      >
        {prescriptionFileResults.loading ? <Spin/> :
        <Table
          columns={filesColumnsIntl()}
          dataSource={makeRowsFromFilesResults(prescriptionFileResults)}
          pagination={false}
          size="small"
        />}
      </Card>
    </div>
  );
};

export default FilesTab;
