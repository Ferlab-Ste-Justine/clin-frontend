import React from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_cloud_download,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { Card, Typography, } from 'antd';

const EmptyCard = (): React.ReactElement => (
  <div className="page-static-content">
    <Card bordered={false} className="staticCard files-tab__details">
      <div className="files-tab__details--empty">
        <IconKit icon={ic_cloud_download} size={72} />
        <Typography.Text className="files-tab__details--empty__texts__title">
          { intl.get('screen.patient.details.file.empty.title') }
        </Typography.Text>
      </div>
    </Card>
  </div>

);

export default EmptyCard;
