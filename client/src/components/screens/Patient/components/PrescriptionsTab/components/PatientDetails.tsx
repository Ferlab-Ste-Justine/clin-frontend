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
import { ParsedPatientData } from '../../../../../../helpers/providers/types';
import FamilyTag from './FamilyTag';

const MultipleMrn: React.FC = () => {
  const [isShowingAll, setIsShowingAll] = useState(false);
  const mrns = [ // TODO #multiMRN replace with real values
    { value: '12345', hospital: 'CHUSJ' },
    { value: '12345', hospital: 'CHUSJ' },
    { value: '12345', hospital: 'CHUSJ' },
    { value: '12345', hospital: 'CHUSJ' },
  ];

  return (
    <div className="prescriptions-tab__patient-section__col__details__row__info__multiple-mrn">
      <ul>
        { mrns.map((value, index) => {
          if (index >= 2 && !isShowingAll) {
            return null;
          }
          return (
            <li>{ `${value.value} - ${value.hospital}` }</li>
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
}

const PatientDetails: React.FC<Props> = ({ patient }) => {
  const hasMultipleMrn = false; // TODO #multiMRN Replace this when migrating to new multi mrn setup
  return (
    <Card bordered={false} className="prescriptions-tab__patient-section__card">
      <div className="prescriptions-tab__patient-section">
        <div className="prescriptions-tab__patient-section__name-block">
          <IconKit size={56} icon={ic_perm_contact_calendar} />
          <Typography.Title level={3} className="patientName">{ patient.lastName }</Typography.Title>
          <Typography.Title level={4} className="patientName">{ patient.firstName }</Typography.Title>
          <Tag color="red">{ patient.proband }</Tag>
        </div>

        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow title={intl.get('screen.patient.details.ramq')} value={patient.ramq} />
          { hasMultipleMrn ? (
            <DetailsRow title={intl.get('screen.patient.details.mrn')} value={<MultipleMrn />} />
          ) : (
            <DetailsRow title={intl.get('screen.patient.details.mrn')} value={`${patient.mrn[0].number} | ${patient.mrn[0].hospital}`} />
          ) }
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'}>
          <DetailsRow
            title={intl.get('screen.patient.details.gender')}
            value={intl.get(`screen.patient.details.${patient.gender.toLowerCase()}`)}
          />
          <DetailsRow title={intl.get('screen.patient.details.dob')} value={patient.birthDate} />
        </DetailsCol>
        <DetailsCol align={hasMultipleMrn ? 'top' : 'center'} isLast>
          <DetailsRow title={intl.get('screen.patient.header.family')} value={patient.familyId} />
          <DetailsRow
            title={intl.get('screen.patient.details.familyType')}
            value={
              <FamilyTag type="trio" />
            }
          />
        </DetailsCol>
      </div>
      <Button
        className="prescriptions-tab__patient-section__edit-button"
        icon={<FormOutlined />}
        onClick={() => alert('This feature is not implemented yet')}
      >
        { intl.get('screen.patient.details.edit') }
      </Button>
    </Card>
  );
};

export default PatientDetails;
