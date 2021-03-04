import React from 'react';
import { Card, Table, Typography } from 'antd';
import get from 'lodash/get';
import intl from 'react-intl-universal';
import { Observation } from '../../../../../../../helpers/fhir/types';
import { FamilyObservation } from '../../../../../../../helpers/providers/types';
import DetailsRow from './DetailsRow';

const Wrapper: React.FC = ({ children }) => (
  <Card
    title={intl.get('screen.patient.details.prescriptions.family.title')}
    bordered={false}
  >  { children }
  </Card>
);

interface Observations{
  eth?: Observation
  cons?: Observation
}
interface Props {
  familyHistories: FamilyObservation[]
  observations: Observations
}

const getEthnicity = (ethnicityObs?: Observation) => {
  const ethnicity = get(ethnicityObs, 'valueCodeableConcept.coding[0].code', undefined);
  if (ethnicity !== undefined) {
    return intl.get(`form.patientSubmission.form.ethnicity.${ethnicity}`);
  }
  return '--';
};

const getConsanguinity = (consanguinityObs?: Observation) => {
  const consanguinity = get(consanguinityObs, 'valueBoolean', undefined);
  if (consanguinity !== undefined) {
    return intl.get(`form.patientSubmission.form.consanguinity.${consanguinity ? 'yes' : 'no'}`);
  }
  return '--';
};

const FamilyHistory: React.FC<Props> = ({ familyHistories, observations }) => {
  const ethnicity = getEthnicity(observations.eth);
  const consanguinity = getConsanguinity(observations.cons);
  if (consanguinity === '--' && ethnicity === '--' && familyHistories.length === 0) {
    return (
      <Wrapper>
        { intl.get('screen.patient.details.prescriptions.family.empty') }
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.ethnicity')}>
        { ethnicity }
      </DetailsRow>
      <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.blood')}>
        { consanguinity }
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
