import React from 'react';
import { Row, } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import FetusHeader from './components/FetusHeader';
import ProbandHeader from './components/ProbandHeader';

interface Props {
  patient: ParsedPatientData
}

const PatientHeader= ({ patient }: Props): React.ReactElement => (
  <div className="header__content--static">
    <Row align="bottom" className="flex-row patient-header" gutter={12}>
      { patient.isFetus 
        ? (<FetusHeader patient={patient} />)
        : (<ProbandHeader patient={patient}/>)
      }
    </Row>
  </div>
);

export default PatientHeader;
