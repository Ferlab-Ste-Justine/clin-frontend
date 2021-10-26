import React from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types';
import { Badge, Button } from 'antd';

import { TColumn } from './columns';

import './tableColumn.scss';

const statusColors: Record<string, Record<string, string>> = {
  'active': {
    color: '#1D8BC6',
    key:'screen.patientsearch.status.active'
  },
  'completed': {
    color: '#389E0D',
    key: 'screen.patientsearch.status.completed',
  },
  'draft': {
    color: '#D2DBE4',
    key: 'screen.patientsearch.status.draft'
  },

  'incomplete': {
    color: '#EB2F96',
    key: 'screen.patientsearch.status.incomplete'
  },

  'on-hold': {
    color: '#D46B08',
    key: 'screen.patientsearch.status.on-hold'
  },

  'revoked': {
    color: '#CF1322',
    key: 'screen.patientsearch.status.revoked'
  },
}

export const prescriptionsColumns = (
  sqons: ISyntheticSqon[],
  onLinkClick?: (sqons: ISyntheticSqon[]) => void,
): TColumn[] =>
  [
    {
      name: 'status',
      render: (value: string) => (
        <Badge className="badge" color={statusColors[value]?.color} text={intl.get(statusColors[value].key)} />
      ),
      summary: false,
      title: intl.get('screen.patientsearch.table.status'),
    },
    {
      name: 'timestamp',
      render: (date: string) => Intl.DateTimeFormat(navigator.language).format(new Date(date)),
      summary: false,
      title: intl.get('screen.patientsearch.table.date'),
    },
    {
      name: 'test',
      summary: true,
      title: intl.get('screen.patientsearch.table.test'),
    },
    {
      name: 'practitioner',
      render: (p: Record<string, string>) => `${p.lastName}, ${p.firstName}`,
      summary: true,
      title: intl.get('screen.patientsearch.table.practitioner'),
    },
    {
      name: ['patientInfo', 'organization', 'cid'],
      summary: true,
      title: intl.get('screen.patientsearch.table.establishment'),
    },

    {
      name: 'patientId',
      render: (patientId: string) => (
        <Link
          href='#prescriptions'
          to={`/patient/${patientId}/`}
        >
          <Button type="link">
            <div className={'story-table-code'}>{patientId}</div>
          </Button>
        </Link>
      ),
      summary: false,
      title: intl.get('screen.patientsearch.table.patientId'),
    },
  ].map((c) => ({ ...c, dataIndex: c.name, key: Array.isArray(c.name) ? c.name.join('.') : c.name }));
