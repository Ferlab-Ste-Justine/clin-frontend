import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { FormOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { ParsedPatientData } from 'helpers/providers/types';

import FamilyTag from '../PrescriptionsTab/components/FamilyTag';

import PatientEditModal from './components/PatientEdit';
import DetailsCol from './DetailsCol';
import DetailsRow from './DetailsRow';
import ProfileCard from './ProfileCard';

import './styles.scss';

const MAX_MRNS_DISPLAYED = 2;

interface MrnValue {
  value: string;
  organization: string;
}

interface MultipleMrnProps {
  mrns: MrnValue[];
}

const MultipleMrn = ({ mrns }: MultipleMrnProps) => {
  const [isShowingAll, setIsShowingAll] = useState(false);

  return (
    <div className="patient-section__col__details__row__info__multiple-mrn">
      <ul>
        {mrns
          .map((value, index) => {
            if (index > MAX_MRNS_DISPLAYED - 1 && !isShowingAll) {
              return null;
            }
            return <li key={value.value}>{`${value.value} - ${value.organization}`}</li>;
          })
          .filter((e) => e)}
      </ul>
      {mrns.length > MAX_MRNS_DISPLAYED ? (
        <Button onClick={() => setIsShowingAll((oldValue) => !oldValue)} type="link">
          {intl.get(`screen.patient.details.${isShowingAll ? 'seeLess' : 'seeMore'}`)}
        </Button>
      ) : null}
    </div>
  );
};

interface Props {
  patient: ParsedPatientData;
  canEditPatient: boolean;
}

const PatientDetails = ({ canEditPatient, patient }: Props): React.ReactElement => {
  const [isPatientEditionModalOpen, setIsPatientEditionModalOpen] = useState(false);

  const mrns = patient.mrn.map((mrn) => ({
    organization: mrn.hospital,
    value: mrn.number,
  })) as MrnValue[];

  const hasMultipleMrn = mrns.length >= MAX_MRNS_DISPLAYED;
  return (
    <Card bordered={false} className="patient-section__card">
      <div className="patient-section">
        <ProfileCard />

        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow title={intl.get('screen.patient.details.ramq')} value={patient.ramq} />
          {hasMultipleMrn ? (
            <DetailsRow
              title={intl.get('screen.patient.details.mrn')}
              value={<MultipleMrn mrns={mrns} />}
            />
          ) : (
            <DetailsRow
              title={intl.get('screen.patient.details.mrn')}
              value={`${patient.mrn[0].number} | ${patient.mrn[0].hospital}`}
            />
          )}
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow
            title={intl.get('screen.patient.details.gender')}
            value={intl.get(
              `screen.patient.details.${
                patient.isFetus ? 'unknown' : patient.gender.toLowerCase()
              }`,
            )}
          />
          <DetailsRow title={intl.get('screen.patient.details.dob')} value={patient.birthDate} />
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'} isLast>
          <DetailsRow title={intl.get('screen.patient.header.family')} value={patient.familyId} />
          <DetailsRow
            title={intl.get('screen.patient.details.familyType')}
            value={<FamilyTag type="solo" />}
          />
        </DetailsCol>
      </div>
      <Button
        className="patient-section__edit-button"
        disabled={!canEditPatient}
        icon={<FormOutlined />}
        onClick={() => setIsPatientEditionModalOpen(true)}
      >
        {intl.get('screen.patient.details.edit')}
      </Button>
      <PatientEditModal
        isVisible={isPatientEditionModalOpen}
        onClose={() => setIsPatientEditionModalOpen(false)}
      />
    </Card>
  );
};

export default PatientDetails;
