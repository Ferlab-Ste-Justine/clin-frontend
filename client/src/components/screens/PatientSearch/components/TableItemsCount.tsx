import React from 'react';
import intl from 'react-intl-universal';
import { Typography } from 'antd';

type Props = {
  className?: string;
  page: number;
  size: number;
  total: number;
}

export const TableItemsCount = ({
  className,
  page,
  size,
  total,
}: Props): React.ReactElement => {
  const from = (page - 1) * size + 1;
  const to = from + size - 1;
  const itemsCount = (      <>
    <Typography.Text strong> { from }-{ to }
    </Typography.Text>
    <Typography.Text> { intl.get('screen.patientsearch.headers.count.of') }
    </Typography.Text>
    <Typography.Text strong> { total }
    </Typography.Text>
  </>);

  return className ?
    <div className={className}>{itemsCount}</div> :
    itemsCount;
};
