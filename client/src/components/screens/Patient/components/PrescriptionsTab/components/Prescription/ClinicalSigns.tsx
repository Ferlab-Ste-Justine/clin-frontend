import React from 'react';
import intl from 'react-intl-universal';
import { Card, Table } from 'antd';
import { ClinicalImpression, Reference } from 'helpers/fhir/types';
import { ClinicalObservation } from 'helpers/providers/types';
import get from 'lodash/get';

import { getObservedIcon } from 'components/Utils/getObservedIcon';


interface Props {
  clinicalImpression: ClinicalImpression
  hpos: ClinicalObservation[]
}

const ClinicalSigns: React.FC<Props> = ({ clinicalImpression, hpos }) => {
  const dataSource = hpos.filter(
    (hpo) => get(clinicalImpression, 'investigation[0].item', []).find(
      (item: Reference) => item.reference.indexOf(hpo.id) !== -1,
    ) != null,
  ).map((obs, index) => ({
    apparition: obs.ageAtOnset,
    category: obs.category,
    key: index,
    notes: obs.note || '--',
    observed: obs.observed,
    term: obs.term,
  }));

  return (
    <Card
      bordered={false}
      className="prescriptions-tab__prescriptions-section__clinical-sign"
      title={intl.get('screen.patient.details.prescriptions.clinicalSign.title')}
    >
      <Table
        columns={[
          {
            dataIndex: 'observed',
            key: 'observed',
            render: (observed) => (
              <div className='prescriptions-tab__prescriptions-section__clinical-sign__observed'>
                {getObservedIcon(observed)}
              </div>
            ),
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.observed'),
            width: 80,
          },
          {
            dataIndex: 'term',
            key: 'term',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.term'),
          },
          {
            dataIndex: 'apparition',
            key: 'apparition',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.apparition'),
          },
          {
            dataIndex: 'notes',
            key: 'notes',
            title: intl.get('screen.patient.details.prescriptions.clinicalSign.notes'),
          },
        ]}
        dataSource={dataSource}
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default ClinicalSigns;
