import React, { ReactNode } from 'react';
import { Typography } from 'antd';

type Props = { title: string; value?: string | ReactNode };

const { Text } = Typography;

const DetailsRow = ({ title, value }: Props): React.ReactElement => (
  <div className="patient-section__col__details__row">
    <Text className="patient-section__col__details__row__title">{title}</Text>
    <span className="patient-section__col__details__row__info">{value || '--'}</span>
  </div>
);

export default DetailsRow;
