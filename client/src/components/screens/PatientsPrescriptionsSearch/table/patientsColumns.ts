import intl from 'react-intl-universal';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';

import { TColumn } from './columns';

import './tableColumn.scss';


export const patientsColumns = (
  sqons: ISyntheticSqon[],
  onLinkClick?: (sqons: ISyntheticSqon[]) => void,
): TColumn[] =>
  [
    {
      name: 'cid',
      summary: false,
      title: intl.get('screen.patientsearch.table.id'),
    },
    {
      name: 'ramq',
      summary: false,
      title: intl.get('screen.patientsearch.table.ramq'),
    },
    {
      name: 'lastName',
      summary: false,
      title: intl.get('screen.patient.details.edit.lastname'),
    },
    {
      name: 'firstName',
      summary: true,
      title: intl.get('screen.patient.details.edit.firstname'),
    },
    {
      name: 'gender',
      summary: true,
      title: intl.get('screen.patientsearch.table.gender'),
    },
    {
      name: 'birthDate',
      summary: false,
      title: intl.get('screen.patientsearch.table.dob'),
    },
    {
      name: 'timestamp',
      summary: false,
      title: intl.get('screen.patientsearch.table.dateCreation'),
    },
  ].map((c) => ({ ...c, dataIndex: c.name, key: Array.isArray(c.name) ? c.name.join('.') : c.name }));
