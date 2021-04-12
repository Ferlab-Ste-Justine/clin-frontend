import {
  Card, Tag, Divider, Button, Typography,
} from 'antd';
import React, { CSSProperties, ReactNode, useState } from 'react';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_perm_contact_calendar,
} from 'react-icons-kit/md';
import { FormOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { ParsedPatientData } from '../../../../../../helpers/providers/types';
import FamilyTag from './FamilyTag';
import { navigateToPatientScreen } from '../../../../../../actions/router';
import PatientEditModal from './PatientEdit';
import { State } from '../../../../../../reducers';

const MAX_MRNS_DISPLAYED = 2;

const ProfileCard: React.FC<{patient: ParsedPatientData}> = ({ patient }) => {
  const parent = useSelector<State>((state) => state.patient.parent) as any;

  const dispatch = useDispatch();
  return (
    <div className="prescriptions-tab__patient-section__name-block">
      <IconKit size={56} icon={ic_perm_contact_calendar} style={{ color: '#DADADA' }} />
      { patient.isFetus ? (
        <>
          <Typography.Title level={3} className="patientName">
            { intl.get('screen.patient.details.fetus') }
          </Typography.Title>
          <Button
            type="link"
            className="link--underline"
            onClick={() => dispatch(navigateToPatientScreen(patient.familyRelation))}
          >
            { `${parent.lastName.toUpperCase()} ${parent.firstName} (${intl.get('screen.patient.details.mother').toLowerCase()})` }
          </Button>
        </>
      ) : (
        <>
          <Typography.Title level={3} className="patientName">{ patient.lastName.toUpperCase() }</Typography.Title>
          <Typography.Title level={4} className="patientName">{ patient.firstName }</Typography.Title>
        </>
      ) }
      <div className="prescriptions-tab__patient-section__name-block__tags">
        <Tag color={patient.proband === 'Proband' ? 'red' : 'geekblue'}>{ patient.proband }</Tag>
        {
          patient.isFetus && (
            <Tag color="purple">{ intl.get('screen.patient.details.fetus') }</Tag>
          )
        }
      </div>
    </div>

  );
};
interface MrnValue {
  value:string,
  organization: string
}

interface MultipleMrnProps {
  mrns: MrnValue[]
}

const MultipleMrn: React.FC<MultipleMrnProps> = ({ mrns }) => {
  const [isShowingAll, setIsShowingAll] = useState(false);

  return (
    <div className="prescriptions-tab__patient-section__col__details__row__info__multiple-mrn">
      <ul>
        { mrns.map((value, index) => {
          if (index > (MAX_MRNS_DISPLAYED - 1) && !isShowingAll) {
            return null;
          }
          return (
            <li>{ `${value.value} - ${value.organization}` }</li>
          );
        }) }
      </ul>
      <Button
        type="link"
        onClick={() => setIsShowingAll((oldValue) => !oldValue)}
      >
        { intl.get(`screen.patient.details.${isShowingAll ? 'seeLess' : 'seeMore'}`) }
      </Button>
    </div>
  );
};

const DetailsRow: React.FC<{title: string, value?: string | ReactNode}> = ({ title, value }) => (
  <div className="prescriptions-tab__patient-section__col__details__row">
    <span className="prescriptions-tab__patient-section__col__details__row__title">
      { title }
    </span>
    <span className="prescriptions-tab__patient-section__col__details__row__info">
      { value || '--' }
    </span>
  </div>
);

const DetailsCol: React.FC<{isLast?: boolean, align: 'center' | 'top'}> = ({ children, isLast = false, align }) => (
  <div className="prescriptions-tab__patient-section__col">
    <div
      className="prescriptions-tab__patient-section__col__details"
      style={{ '--details-col-justify': align } as CSSProperties}
    >
      { children }
    </div>
    { !isLast && <Divider type="vertical" /> }
  </div>
);

interface Props {
  patient: ParsedPatientData
  canEditPatient: boolean
}

const PatientDetails: React.FC<Props> = ({ patient, canEditPatient }) => {
  const [isPatientEditionModalOpen, setIsPatientEditionModalOpen] = useState(false);
  const mrns = patient.mrn
    .map((mrn) => ({ value: mrn.number, organization: mrn.hospital })) as MrnValue[];

  const hasMultipleMrn = mrns.length >= MAX_MRNS_DISPLAYED;
  return (
    <Card bordered={false} className="prescriptions-tab__patient-section__card">
      <div className="prescriptions-tab__patient-section">
        <ProfileCard patient={patient} />

        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow title={intl.get('screen.patient.details.ramq')} value={patient.ramq} />
          { hasMultipleMrn ? (
            <DetailsRow
              title={intl.get('screen.patient.details.mrn')}
              value={<MultipleMrn mrns={mrns} />}
            />
          ) : (
            <DetailsRow
              title={intl.get('screen.patient.details.mrn')}
              value={`${patient.mrn[0].number} | ${patient.mrn[0].hospital}`}
            />
          ) }
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow
            title={intl.get('screen.patient.details.gender')}
            value={intl.get(`screen.patient.details.${patient.isFetus ? 'unknown' : patient.gender.toLowerCase()}`)}
          />
          <DetailsRow title={intl.get('screen.patient.details.dob')} value={patient.birthDate} />
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'} isLast>
          <DetailsRow title={intl.get('screen.patient.header.family')} value={patient.familyId} />
          <DetailsRow
            title={intl.get('screen.patient.details.familyType')}
            value={
              <FamilyTag type="solo" />
            }
          />
        </DetailsCol>
      </div>
      <Button
        className="prescriptions-tab__patient-section__edit-button"
        icon={<FormOutlined />}
        onClick={() => setIsPatientEditionModalOpen(true)}
        disabled={!canEditPatient}
      >
        { intl.get('screen.patient.details.edit') }
      </Button>
      <PatientEditModal isVisible={isPatientEditionModalOpen} onClose={() => setIsPatientEditionModalOpen(false)} />
    </Card>
  );
};

export default PatientDetails;
