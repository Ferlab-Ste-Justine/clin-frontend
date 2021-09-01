import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch,useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { getPatientFileURL } from 'actions/patient';
import {
Button,   Card, Dropdown, Menu,
Table, 
} from 'antd';
import { formatBytes } from 'helpers/file';
import { ParsedPatientData } from 'helpers/providers/types';
import { PatientResponse } from 'helpers/search/types';
import { State } from 'reducers';

import { getFilesData } from 'store/graphql/files/actions';

import EmptyCard from './components/EmptyCard';
import MetadataModal from './metadataModal';

import './styles.scss';

const FilesTab = () => {
  let previousData: any | null = null;
  const dispatch = useDispatch();
  const dataSource: any[] = [];
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const [isOpen, setIsOpenModal] = useState<boolean>(false);
  const [documentReference, setDocumentReference] = useState<string>('');
  let filesResults = getFilesData({ patientId: patient.id })();

  if (filesResults.loading) {
    if (!filesResults.results && previousData) {
      filesResults = previousData;
    }
    else{
      return null
    }
  }

  if (filesResults.results) {
    previousData = filesResults;
  }

  const filesColumns = [
    {
      intlKey: 'screen.patient.details.file.name',
      name: 'title',
    },
    {
      intlKey: 'screen.patient.details.file.type',
      name: 'type',
    },
    {
      intlKey: 'screen.patient.details.file.format',
      name: 'format',
    },
    {
      intlKey: 'screen.patient.details.file.size',
      name: 'size',
    },
    {
      intlKey: 'screen.patient.details.file.sample',
      name: 'sample',
    },
    {
      intlKey: 'screen.patient.details.file.aliquot',
      name: 'aliquot',
    },
    {
      intlKey: 'screen.patient.details.file.prescription',
      name: 'prescription',
      sorter: (a: any, b: any) => a - b,
    },
    {
      intlKey: 'screen.patient.details.file.date',
      name: 'date',
      sorter: (a: { date: string; }, b: { date: string; }) => {
        const dateA: Date = new Date(a.date.replace(/-/g, '/'));
        const dateB: Date = new Date(b.date.replace(/-/g, '/'));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      intlKey: 'screen.patient.details.file.action',
      name: 'action',
    },
  ].map((c) => ({
    ...c, dataIndex: c.name, key: c.name,
  }));

  const filesColumnsIntl = () => filesColumns.map((c) => ({ ...c, title: intl.get(c.intlKey) }));

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const getDropdownOption = (
    format: string,
    url: {
      file: string;
      index: string;
    },
    metaData: PatientResponse,
  ) => {
    const option = [];

    option.push(
      (
        <Menu.Item>
          <Button
            className="link--underline"
            onClick={() => dispatch(getPatientFileURL(url.file))}
            target="_blank"
            type="link"
          >
            { intl.get('screen.patient.details.file.download.file') }
          </Button>
        </Menu.Item>
      ),
      (
        <Menu.Item>
          <Button
            className="link--underline"
            onClick={() => {
              setDocumentReference(JSON.stringify(metaData));
              setIsOpenModal(true);
            }}
            type="link"
          >
            Metadata
          </Button>
        </Menu.Item>
      ),
    );
    if (format === 'CRAM' || format === 'VCF') {
      option.push(
        (
          <Menu.Item>
            <Button
              className="link--underline"
              onClick={() => dispatch(getPatientFileURL(url.index))}
              target="_blank"
              type="link"
            >

              Index
            </Button>
          </Menu.Item>
        ),
      );
    }

    const menu = (
      <Menu>
        {
          option
        }
      </Menu>
    );

    return (
      <div>
        <Dropdown
          className="files-tab__dropdownAction"
          overlay={menu}
        >
          <Button type="link">
            { intl.get('screen.patient.details.file.download') } <DownOutlined />
          </Button>
        </Dropdown>

      </div>
    );
  };

  const getData = () => {
    filesResults.results.docs.forEach((element: PatientResponse) => {
      const {
        size, title,
      } = element.content[0].attachment;
      const { type } = element;
      const { format } = element.content[0];
      const sizeWithUnity = formatBytes(Number(size));
      const specimen = element.aliquot.resource[0].sample[0].resource.external_id;
      const aliquot = element.aliquot.resource[0].external_id;
      const prescription = element.task.focus.reference.split('/')[1];
      const date = element.task.runDate;

      const url = {
        file: element.content[0].attachment.url,
        index: element.content.length > 1 ? element.content[1].attachment.url : '',
      };

      const dataLine = {
        action: getDropdownOption(format, url, element),
        aliquot,
        date,
        format,
        prescription,
        sample: specimen,
        size: sizeWithUnity,
        title,
        type,
      };

      dataSource.push(dataLine);
    });
  };

  if (!filesResults.results.docs) {
    return <EmptyCard />
  }
  getData();
  return (
    <div className="page-static-content files-tab">
      <Card
        bordered={false}
      >
        <Table
          columns={filesColumnsIntl()}
          dataSource={dataSource}
          pagination={false}
          size="small"
        />
      </Card>
      <MetadataModal
        data={documentReference}
        onClose={handleCloseModal}
        open={isOpen}
      />
    </div>
  );
};

export default FilesTab;
