import React from 'react';
import intl from 'react-intl-universal';
import { CheckOutlined, CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export const getObservedIcon = (status: string): React.ReactElement => {
  if (status === 'POS') {
    return (
      <CheckOutlined
        aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.observed')}
        className={`observedIcon--positive`}
      />
    );
  }
  if (status === 'NEG') {
    return (
      <CloseOutlined
        aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.negative')}
        className={`observedIcon--negative`}
      />
    );
  }
  
  return (
    <QuestionCircleOutlined
      aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.unknown')}
    />
  );
};