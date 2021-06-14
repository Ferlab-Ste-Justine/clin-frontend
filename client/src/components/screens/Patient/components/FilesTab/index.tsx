import React, { useState } from 'react';
import {
  Card, Table, Button, Dropdown, Menu,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { ParsedPatientData } from '../../../../../helpers/providers/types';
import { navigateToPatientScreen } from '../../../../../actions/router';
import { State } from '../../../../../reducers';
import Api from '../../../../../helpers/api';
import { TaskResponse } from '../../../../../helpers/search/types';
import MetadataModal from './metadataModal';

import './styles.scss';

const getDropdownOption = (tempoInfo: number) => {
  const option = [];
const fileInfo: {[key: string]: any} = require('./info.json');

const getURL = async (url:string) => {
  const data: any = await Api.getFileURL(url);
  return data.payload.data.url;
};

const FilesTab : React.FC = () => {
  const { Patient } = fileInfo;

  const dispatch = useDispatch();
  const dataSource:any[] = [];
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const [isOpen, setIsOpenModal] = useState<boolean>(false);
  const [documentReference, setDocumentReference] = useState<string>('');

  const handleGoToPatientScreen:any = (patientId: string, requestId: string | null = null) => {
    dispatch(navigateToPatientScreen(patientId, {
      tab: 'prescriptions',
      reload: false,
      openedPrescriptionId: requestId,
    }));
  };

  const getFileSize = (size: number) => {
    let newSize = size;
    if (size >= 1000 && size < 10 ** 6) {
      newSize = size / 1000;
      return `${newSize} ko`;
    } if (size >= 10 ** 6 && size < 10 ** 9) {
      newSize = size / 10 ** 6;
      return `${newSize} mo`;
    } if (size >= 10 ** 9 && size < 10 ** 12) {
      newSize = size / 10 ** 9;
      return `${newSize} go`;
    }

    return `${newSize} o`;
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const getDropdownOption = (format: string, url:any, documentR:string) => {
    const option = [];
    option.push(
      (
        <Menu.Item>
          <Button
            type="link"
            className="link--underline"
            target="_blank"
            onClick={async () => {
              const newUrl = await getURL(url.file);
              window.open(newUrl, '_blank');
            }}
          >
            File
          </Button>
        </Menu.Item>
      ),
      (
        <Menu.Item>
          <Button
            type="link"
            className="link--underline"
            target="_blank"
            onClick={async () => {
              setDocumentReference(documentR);
              setIsOpenModal(true);
            }}
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
              type="link"
              className="link--underline"
              target="_blank"
              onClick={async () => {
                const newUrl = await getURL(url.index);
                window.open(newUrl, '_blank');
              }}
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
          overlay={menu}
          className="files-tab__dropdownAction"
        >
          <Button type="link">
            Download <DownOutlined />
          </Button>
        </Dropdown>

      </div>
    );
  };

  Patient.tasks.forEach((element:TaskResponse) => {
    const {
      format, title, size,
    } = element.output.resource.content[0];
    const { type } = element.output.resource;
    const prescription = element.resource.id.split('/')[1];
    const url = {
      file: element.output.resource.content[0].url,
      index: element.output.resource.content.length > 1 ? element.output.resource.content[1].url : null,
    };
    const date = element.runDate[0].split('T')[0];
    const documentR = JSON.stringify(element.output.resource, undefined, 4);
    const specimen = element.output.resource.specimen
      ? `${element.output.resource.specimen[0].external_id} / ${element.output.resource.specimen[0].organization.name}`
      : '--';
    const sizeWithUnity = getFileSize(Number(size));
    const data = {
      title,
      type,
      format,
      size: sizeWithUnity,
      sample: specimen,
      prescription: (
        <Button
          type="link"
          className="link--underline"
          onClick={() => {
            handleGoToPatientScreen(patient.id, prescription);
            window.location.reload();
          }}
          data-id={prescription}
        >
          { prescription }
        </Button>),
      date,
      action: getDropdownOption(format, url, documentR),
    };

    dataSource.push(data);
  });

  return (
    <div className="page-static-content files-tab">
      <Card
        bordered={false}
      >
        <Table
          pagination={false}
          columns={[
            {
              key: 'title',
              dataIndex: 'title',
              title: intl.get('screen.patient.details.file.name'),
            },
            {
              key: 'type',
              dataIndex: 'type',
              title: intl.get('screen.patient.details.file.type'),
            },
            {
              key: 'format',
              dataIndex: 'format',
              title: intl.get('screen.patient.details.file.format'),
            },
            {
              key: 'size',
              dataIndex: 'size',
              title: intl.get('screen.patient.details.file.size'),
            },
            {
              key: 'sample',
              dataIndex: 'sample',
              title: intl.get('screen.patient.details.file.sample'),
              sorter: (a, b) => parseInt(a.sample, 10) - parseInt(b.sample, 10),
            },
            {
              key: 'prescription',
              dataIndex: 'prescription',
              title: intl.get('screen.patient.details.file.prescription'),
              sorter: (a, b) => parseInt(a.prescription.props.children, 10) - parseInt(b.prescription.props.children, 10),
            },
            {
              key: 'date',
              dataIndex: 'date',
              title: intl.get('screen.patient.details.file.date'),
              defaultSortOrder: 'descend',
              sorter: (a, b) => {
                const dateA: Date = new Date(a.date.replace(/-/g, '/'));
                const dateB: Date = new Date(b.date.replace(/-/g, '/'));
                return dateA.getTime() - dateB.getTime();
              },
            },
            {
              key: 'action',
              dataIndex: 'action',
              title: intl.get('screen.patient.details.file.action'),
            },
          ]}
          dataSource={dataSource}
          size="small"
        />
      </Card>

      <MetadataModal
        open={isOpen}
        data={documentReference}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default FilesTab;