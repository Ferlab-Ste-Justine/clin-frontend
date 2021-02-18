import { Card, Table, Typography } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FamilyObservation, ParsedPatientData } from '../../../../../../../helpers/providers/types';
import DetailsRow from './DetailsRow';

const Wrapper: React.FC = ({ children }) => (
  <Card
    title={intl.get('screen.patient.details.prescriptions.family.title')}
    bordered={false}
  >  { children }
  </Card>
);

interface Props {
  patient: Partial<ParsedPatientData>
  familyHistories: FamilyObservation[]
}

const FamilyHistory: React.FC<Props> = ({ patient, familyHistories }) => {
  const hasEthnicity = patient.ethnicity && patient.ethnicity !== 'N/A';
  const hasBloodRelationship = patient.bloodRelationship && patient.bloodRelationship !== 'N/A';
  if (!hasEthnicity && !hasBloodRelationship && familyHistories.length === 0) {
    return (
      <Wrapper>
        { intl.get('screen.patient.details.prescriptions.family.empty') }
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.ethnicity')}>
        { hasEthnicity ? patient.ethnicity : '--' }
      </DetailsRow>
      <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.blood')}>
        { hasBloodRelationship ? patient.bloodRelationship : '--' }
      </DetailsRow>
      {
        familyHistories.length === 0 && (
          <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.familyCondition')}>
            { intl.get('screen.patient.details.prescriptions.family.familyCondition.empty') }
          </DetailsRow>
        )
      }
      {
        familyHistories.length > 0 && (
          <div className="prescriptions-tab__prescriptions-section__family-history__conditions">
            <Typography.Title level={4}>
              { intl.get('screen.patient.details.prescriptions.family.familyCondition') }
            </Typography.Title>
            <Table
              pagination={false}
              columns={[
                {
                  title: intl.get('screen.patient.details.prescriptions.family.familyCondition.link'),
                  dataIndex: 'link',
                  key: 'link',
                  width: 200,
                },
                {
                  title: intl.get('screen.patient.details.prescriptions.family.familyCondition.notes'),
                  dataIndex: 'note',
                  key: 'note',
                },
              ]}
              dataSource={familyHistories.map((fh) => ({ ...fh, note: fh.note || '--' }))}
            />
          </div>
        )
      }
    </Wrapper>
  );
};

export default FamilyHistory;
