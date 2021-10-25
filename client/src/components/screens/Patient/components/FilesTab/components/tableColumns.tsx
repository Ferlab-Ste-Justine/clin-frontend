import React from 'react';
import { sortByOldest } from 'helpers/utils'

import { PatientResponse } from '../index';

import ActionDropdown from './ActionDropdown';

export const filesColumns = [
    {
      intlKey: 'screen.patient.details.file.name',
      name: 'title',
    },
    {
      intlKey: 'screen.patient.details.file.type',
      name: 'type',
    },
    {
      intlKey: 'screen.patient.details.file.format',
      name: 'format',
    },
    {
      intlKey: 'screen.patient.details.file.size',
      name: 'size',
    },
    {
      intlKey: 'screen.patient.details.file.sample',
      name: 'sample',
    },
    {
      intlKey: 'screen.patient.details.file.aliquot',
      name: 'aliquot',
    },
    {
      intlKey: 'screen.patient.details.file.prescription',
      name: 'prescription',
    },
    {
      intlKey: 'screen.patient.details.file.date',
      name: 'date',
      sorter: sortByOldest,
    },
    {
      intlKey: 'screen.patient.details.file.action',
      name: 'action',
      render: (
        action: {
          format: string,
          url: {
            file: string;
            index: string;
          },
          metadata: PatientResponse,
        },
      ) => (
          <ActionDropdown format={action.format} metadata={action.metadata} url={action.url} />
      ),
    },
  ].map((c) => ({
    ...c, dataIndex: c.name, key: c.name,
  }));