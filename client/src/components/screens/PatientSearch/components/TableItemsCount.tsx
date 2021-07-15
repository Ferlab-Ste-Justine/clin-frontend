import React from 'react';
import { Typography } from 'antd';
import intl from 'react-intl-universal';

export const TableItemsCount: React.FC<{
    page: number,
    size: number,
    total: number,
  }> = ({ page, size, total }) => (
    <>
      <Typography.Text strong> { page }-{ size }
      </Typography.Text>
      <Typography.Text> { intl.get('screen.patientsearch.headers.count.of') }
      </Typography.Text>
      <Typography.Text strong> { total }
      </Typography.Text>
    </>
  );
