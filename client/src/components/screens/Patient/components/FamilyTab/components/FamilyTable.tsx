import React from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import {
  Button, Card, Dropdown, Table,
} from 'antd';
import { ColumnType } from 'antd/lib/table';

import { updateParentStatusInFamily } from '../../../../../../actions/patient';
import { isFetusOnly } from '../../../../../../helpers/fhir/familyMemberHelper';
import { State } from '../../../../../../reducers';
import { FamilyMember } from '../../../../../../store/FamilyMemberTypes';

import ActionsCell from './ActionsCell';
import NameCell from './NameCell';
import PositionCell from './PositionCell';
import StatusCell from './StatusCell';

interface Props {
  addParentMenu: React.ReactElement;
}

interface DataType {
  key: number;
  member: FamilyMember;
}

const renderExceptIfFetus = (value: string, record: DataType) => !value || (isFetusOnly(record.member) ? '--' : value);

const sortProbandFirst = (members: FamilyMember[]) => members
  .slice()
  .sort((a, b) => +b.isProband - +a.isProband);

const FamilyTable = ({ addParentMenu }: Props) => {
  const familyMembers = useSelector((state: State) => state.patient.family) || [];

  const data: DataType[] = sortProbandFirst(familyMembers).map((fm, index: number) => ({
    key: index,
    member: fm,
  }));

  const columns = [
    {
      title: intl.get('screen.patient.details.family.table.name'),
      dataIndex: 'member',
      render: (familyMember: FamilyMember) => {
        if (!familyMember) {
          return '--';
        }
        return <NameCell familyMember={familyMember} />;
      },
    },
    {
      title: intl.get('screen.patient.details.family.table.ramq'),
      dataIndex: ['member', 'ramq'],
      width: 180,
      render: renderExceptIfFetus,
    },
    {
      title: intl.get('screen.patient.details.family.table.birthDate'),
      dataIndex: ['member', 'birthDate'],
      render: renderExceptIfFetus,
      width: 180,
    },
    {
      title: intl.get('screen.patient.details.family.table.sex'),
      dataIndex: ['member', 'gender'],
      render: (value: string, record: DataType) => (!value || isFetusOnly(record.member)
        ? '--'
        : intl.get(`screen.patient.details.family.table.sex.${value}`)),
      width: 200,
    },
    {
      title: 'Position',
      dataIndex: 'member',
      align: 'center',
      render: (familyMember: FamilyMember) => <PositionCell familyMember={familyMember} />,
    },
    {
      title: intl.get('screen.patient.details.family.table.status'),
      key: 'status',
      render: (value, record) => {
        if (record.member.isProband) {
          return '--';
        }
        return (
          <StatusCell
            memberId={record.member.id}
            memberCode={record.member.code}
            updateParentStatusInFamily={updateParentStatusInFamily}
          />
        );
      },
      width: 160,
    },
    {
      title: intl.get('screen.patient.details.family.table.actions'),
      render: (value, record) => {
        if (record.member.isProband) {
          return '--';
        }

        return (
          <ActionsCell memberId={record.member.id} />
        );
      },
      width: 80,
    },
  ] as ColumnType<DataType>[];

  return (
    <Card
      className="family-tab__details"
      title={intl.get('screen.patient.details.family.title')}
      extra={(
        <Dropdown
          overlay={addParentMenu}
          placement="bottomCenter"
          trigger={['click']}
          overlayClassName="family-tab__add-parent"
        >
          <Button>
            { intl.get('screen.patient.details.family.addParent') }
            <DownOutlined />
          </Button>
        </Dropdown>
      )}
      bordered={false}
    >
      <Table
        className="family-tab__details__table"
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    </Card>
  );
};

export default FamilyTable;
