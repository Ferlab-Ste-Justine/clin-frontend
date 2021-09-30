import React, { ReactNode } from 'react';

type Props = { title: string; value?: string | ReactNode };

const DetailsRow = ({ title, value }: Props): React.ReactElement => (
  <div className="patient-section__col__details__row">
    <span className="patient-section__col__details__row__title">{title}</span>
    <span className="patient-section__col__details__row__info">{value || '--'}</span>
  </div>
);

export default DetailsRow;
