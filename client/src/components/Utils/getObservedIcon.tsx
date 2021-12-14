import React from 'react';
import intl from 'react-intl-universal';
import { CheckOutlined, CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';

enum ObservedStatus {
  POS = 'POS',
  NEG = 'NEG',
}

export const getObservedIcon = (status: string): React.ReactElement => {
  if (status === ObservedStatus.POS) {
    return (
      <CheckOutlined
        aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.observed')}
        className={`observedIcon--positive`}
      />
    );
  }
  if (status === ObservedStatus.NEG) {
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