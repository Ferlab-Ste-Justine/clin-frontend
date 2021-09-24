import React, { CSSProperties } from 'react';
import { Divider } from 'antd';

type Props = { isLast?: boolean; align: 'center' | 'top'; children: React.ReactNode };

const DetailsCol = ({ align, children, isLast = false }: Props): React.ReactElement => (
  <div className="patient-section__col">
    <div
      className="patient-section__col__details"
      style={{ '--details-col-justify': align } as CSSProperties}
    >
      {children}
    </div>
    {!isLast && <Divider type="vertical" />}
  </div>
);

export default DetailsCol;
