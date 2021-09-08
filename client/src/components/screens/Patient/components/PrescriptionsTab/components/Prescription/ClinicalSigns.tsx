import React from 'react';
import { Card, Table } from 'antd';
import intl from 'react-intl-universal';
import get from 'lodash/get';
import { EyeFilled, EyeInvisibleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { ClinicalImpression, Reference } from 'helpers/fhir/types';
import { ClinicalObservation } from '../../../../../../../helpers/providers/types';

const getObservedIcon = (status: string) => {
  const prescriptionTabCN = 'prescriptions-tab__prescriptions-section__clinical-sign__observed ';

  if (status === 'POS') {
    return (
      <EyeFilled
        className={`${prescriptionTabCN} ${prescriptionTabCN}--positive`}
        aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.observed')}
      />
    );
  }
  if (status === 'NEG') {
    return (
      <EyeInvisibleFilled
        className={`${prescriptionTabCN} ${prescriptionTabCN}--negative`}
        aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.negative')}
      />
    );
  }

  return (
    <QuestionCircleFilled
      className={`${prescriptionTabCN} ${prescriptionTabCN}--unknown`}
      aria-label={intl.get('screen.patient.details.prescriptions.clinicalSign.unknown')}
    />
  );
};

interface Props {
  clinicalImpression: ClinicalImpression
  hpos: ClinicalObservation[]
}

const ClinicalSigns: React.FC<Props> = ({ clinicalImpression, hpos }) => {
  const dataSource = hpos.filter(
    (hpo) => get(clinicalImpression, 'investigation[0].item', []).find(
      (item: Reference) => item.reference.indexOf(hpo.id) !== -1,
    ) != null,
  ).map((obs) => ({
    observed: getObservedIcon(obs.observed),
    category: obs.category,
    term: obs.term,
    apparition: obs.ageAtOnset,
    notes: obs.note || '--',
  }));
  return (
    <Card
      title={intl.get('screen.patient.details.prescriptions.clinicalSign.title')}
      bordered={false}
      className="prescriptions-tab__prescriptions-section__clinical-sign"
    >
      <Table
        pagination={false}
        columns={[
          {
            key: 'observed',
            dataIndex: 'observed',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.observed'),
            width: 80,
          },
          {
            key: 'term',
            dataIndex: 'term',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.term'),
          },
          {
            key: 'apparition',
            dataIndex: 'apparition',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.apparition'),
          },
          {
            key: 'notes',
            dataIndex: 'notes',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.notes'),
          },
        ]}
        dataSource={dataSource}
        size="small"
      />
    </Card>
  );
};

export default ClinicalSigns;
