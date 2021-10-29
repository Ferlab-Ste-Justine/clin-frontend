import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { getPatientFileURL } from 'actions/patient';
import { Button, Dropdown, Menu } from 'antd';

import { PatientResponse } from '../index'

interface Props {
    format: string,
    url: {
      file: string;
      index: string;
    },
    metadata: PatientResponse,
}

enum PatientFileFormat {
  vcf = 'VCF',
  cram = 'CRAM',
  tgz = 'TGZ',
}

const ActionDropdown = ({
    format,
    metadata,
    url,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();
  
  const makeDropdownOptions = (
      format: string,
      url: {
          file: string;
          index: string;
      },
      metadata: PatientResponse,
  ) => {
      const onClickInitiDownload = (url:string) => dispatch(getPatientFileURL(url));
      const options = [
      (
      <Menu.Item key='file'>
          <Button
          className="link--underline"
          onClick={() => onClickInitiDownload(url.file)}
          target="_blank"
          type="link"
          >
          { intl.get('screen.patient.details.file.download.file') }
          </Button>
      </Menu.Item>
      ),
      (
      <Menu.Item key='metadata'>
          <Button
          className="link--underline"
          download={`${metadata.aliquot.resource[0].external_id}_${metadata.content[0].format}_META.json`}
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(metadata, null, 4)
          )}`}
          type="link"
          >
          Metadata
          </Button>
      </Menu.Item>
      ),];

      if (format === PatientFileFormat.cram || format === PatientFileFormat.vcf) {
      options.push(
          (
          <Menu.Item key='index'>
              <Button
              className="link--underline"
              onClick={() => onClickInitiDownload(url.index)}
              target="_blank"
              type="link"
              >
  
              Index
              </Button>
          </Menu.Item>
          ),
      );
      }
      return options
  };
  return (
    <Dropdown
      className="files-tab__dropdownAction"
      overlay={(
        <Menu>
          {
            makeDropdownOptions(format, url, metadata)
          }
        </Menu>
      )}
    >
      <Button type="link">
        { intl.get('screen.patient.details.file.download') } 
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ActionDropdown;
