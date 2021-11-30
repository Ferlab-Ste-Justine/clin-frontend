import React from 'react';
import intl from 'react-intl-universal';
import { Card, Table, Typography } from 'antd';
import { Observation } from 'helpers/fhir/types';
import { FamilyObservation } from 'helpers/providers/types';
import get from 'lodash/get';

import DetailsRow from './DetailsRow';

const Wrapper: React.FC = ({ children }) => (
  <Card
    bordered={false}
    title={intl.get('screen.patient.details.prescriptions.family.title')}
  >  { children }
  </Card>
);

const EthnicityNote: React.FC<{note?: string}> = ({ note }) => {
  if (note == null) {
    return <></>;
  }
  return <span className="prescriptions-tab__prescriptions-section__family-history__ethnicity-note"> | { note }</span>;
};

interface Observations{
  eth?: Observation
  cons?: Observation
}
interface Props {
  familyHistories: FamilyObservation[]
  observations: Observations
}

interface EthnicityData{
  code: string;
  note?: string;
}

const getEthnicity = (ethnicityObs?: Observation): EthnicityData => {
  const ethnicity = get(ethnicityObs, 'valueCodeableConcept.coding[0].code', undefined);
  const note = get(ethnicityObs, 'note[0].text');

  if (ethnicity !== undefined) {
    return {
      code: intl.get(`form.patientSubmission.form.ethnicity.${ethnicity}`),
      note,
    };
  }
  return {
    code: '--',
    note,
  };
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
  if (consanguinity === '--' && ethnicity.code === '--' && familyHistories.length === 0) {
    return (
      <Wrapper>
        <Typography.Text className="prescriptions-tab__prescriptions-section--empty">
          { intl.get('screen.patient.details.prescriptions.family.empty') }
        </Typography.Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <DetailsRow label={intl.get('screen.patient.details.prescriptions.family.ethnicity')}>
        { ethnicity.code }
        <EthnicityNote note={ethnicity.note} />
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
              columns={[
                {
                  dataIndex: 'link',
                  key: 'link',
                  title: intl.get('screen.patient.details.prescriptions.family.familyCondition.link'),
                  width: 200,
                },
                {
                  dataIndex: 'note',
                  key: 'note',
                  title: intl.get('screen.patient.details.prescriptions.family.familyCondition.notes'),
                },
              ]}
              dataSource={familyHistories.map((fh, index) => ({ ...fh, key: index, note: fh.note || '--' }))}
              pagination={false}
            />
          </div>
        )
      }
    </Wrapper>
  );
};

export default FamilyHistory;
