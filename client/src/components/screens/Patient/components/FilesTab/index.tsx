import React from 'react';
import {
  Card, Table, Button, Dropdown, Menu,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';

import './styles.scss';

const getDropdownOption = (tempoInfo: number) => {
  const option = [];

  if (tempoInfo >= 3) {
    option.push(
      (<Menu.Item><Button type="link">Metadata</Button></Menu.Item>),
      (<Menu.Item><Button type="link">File</Button></Menu.Item>),
      (<Menu.Item><Button type="link"> Index</Button></Menu.Item>),
    );
  }
  if (tempoInfo === 2) {
    option.push(
      (<Menu.Item><Button type="link">Metadata</Button></Menu.Item>),
      (<Menu.Item><Button type="link">File</Button></Menu.Item>),
    );
  }
  if (tempoInfo === 1) {
    option.push(
      (<Menu.Item><Button type="link">File</Button></Menu.Item>),
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
      {
        tempoInfo === 4 ? (
          <Button type="link" className="link--underline">
            IGV
          </Button>
        ) : null
      }

    </div>
  );
};

const FilesTab: React.FC = () => {
  const dataSource: any = [
    {
      name: 'file1ne.cram',
      type: 'AR',
      format: 'CRAM',
      size: '34 GB',
      sample: '1',
      prescription: (
        <Button
          type="link"
          className="link--underline"
        >
          31979
        </Button>),
      date: '2020-02-12',
      action: getDropdownOption(4),
    },
    {
      name: 'filename.vcf',
      type: 'SNV',
      format: 'gVCF',
      size: '245 MB',
      sample: '4',
      prescription: (
        <Button
          type="link"
          className="link--underline"
        >
          47908
        </Button>),
      date: '2020-04-05',
      action: getDropdownOption(3),
    },
    {
      name: 'file.tar.gz',
      type: 'QC',
      format: 'TGZ',
      size: '2 MB',
      sample: '3',
      prescription: (
        <Button
          type="link"
          className="link--underline"
        >
          33070
        </Button>),
      date: '2020-12-17',
      action: getDropdownOption(2),
    },
    {
      name: 'file3name.pdf',
      type: 'Consent',
      format: 'PDF',
      size: '23 KB',
      sample: '6',
      prescription: (
        <Button
          type="link"
          className="link--underline"
        >
          31979
        </Button>),
      date: '2020-06-24',
      action: getDropdownOption(1),
    },
  ];

  return (
    <div className="page-static-content files-tab">
      <Card
        bordered={false}
      >
        <Table
          pagination={false}
          columns={[
            {
              key: 'name',
              dataIndex: 'name',
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
    </div>
  );
};

export default FilesTab;
