import { DownOutlined } from '@ant-design/icons';
import {
  Card, Typography, Button,
} from 'antd';
import React from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_people,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import Dropdown from '../../../../../Dropdown';

const EmptyCard: React.FC<{addParentMenu: React.ReactElement}> = ({ addParentMenu }) => (
  <Card className="family-tab__details" bordered={false}>
    <div className="family-tab__details--empty">
      <IconKit size={42} icon={ic_people} />
      <Typography.Text className="family-tab__details--empty__texts__title">
        { intl.get('screen.patient.details.family.empty.title') }
      </Typography.Text>
      <Typography.Text className="family-tab__details--empty__texts__description">
        { intl.get('screen.patient.details.family.empty.description') }
      </Typography.Text>
      <Dropdown
        overlay={addParentMenu}
        placement="bottomCenter"
        trigger={['click']}
        overlayClassName="family-tab__add-parent"
      >
        <Button type="primary">
          { intl.get('screen.patient.details.family.addParent') }
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  </Card>
);

export default EmptyCard;
