import React from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { updateParentStatusInFamily } from 'actions/patient';
import { Button, Card, Dropdown, Table, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { isFetusOnly } from 'helpers/fhir/familyMemberHelper';
import { State } from 'reducers';

import { FamilyMember } from 'store/FamilyMemberTypes';

import ActionsCell from './ActionsCell';
import NameCell from './NameCell';
import PositionCell from './PositionCell';
import StatusCell from './StatusCell';

interface Props {
  addParentMenu: React.ReactElement;
  canAddAtLeastOneParent: boolean;
  showActions: boolean;
}

interface DataType {
  key: number;
  member: FamilyMember;
}

const renderExceptIfFetus = (value: string, record: DataType) =>
  !value || isFetusOnly(record.member) ? '--' : value;

const sortProbandFirst = (members: FamilyMember[]) =>
  members.slice().sort((a, b) => +b.isProband - +a.isProband);

const FamilyTable = ({
  addParentMenu,
  canAddAtLeastOneParent,
  showActions,
}: Props): React.ReactElement => {
  const familyMembers = useSelector((state: State) => state.patient.family) || [];

  const data: DataType[] = sortProbandFirst(familyMembers).map((fm, index: number) => ({
    key: index,
    member: fm,
  }));

  const columns = [
    {
      dataIndex: 'member',
      render: (familyMember: FamilyMember) => {
        if (!familyMember) {
          return '--';
        }
        return <NameCell familyMember={familyMember} />;
      },
      title: intl.get('screen.patient.details.family.table.name'),
    },
    {
      dataIndex: ['member', 'ramq'],
      render: renderExceptIfFetus,
      title: intl.get('screen.patient.details.family.table.ramq'),
      width: 180,
    },
    {
      dataIndex: ['member', 'birthDate'],
      render: renderExceptIfFetus,
      title: intl.get('screen.patient.details.family.table.birthDate'),
      width: 180,
    },
    {
      dataIndex: ['member', 'gender'],
      render: (value: string) =>
        intl.get(`screen.patient.details.family.table.sex.${value}`).defaultMessage('--'),
      title: intl.get('screen.patient.details.family.table.sex'),
      width: 200,
    },
    {
      dataIndex: 'member',
      render: (familyMember: FamilyMember) => <PositionCell familyMember={familyMember} />,
      title: (
        <Tooltip
          overlayClassName="tooltip"
          title={intl.get('screen.patient.details.family.table.relationshipTip')}
        >
          {intl.get('screen.patient.details.family.table.relationship')}
        </Tooltip>
      ),
    },
    {
      key: 'status',
      render: (_: string, record: DataType) => {
        if (record.member.isProband) {
          return '--';
        }
        return (
          <StatusCell
            memberCode={record.member.code}
            memberId={record.member.id}
            updateParentStatusInFamily={updateParentStatusInFamily}
          />
        );
      },
      title: intl.get('screen.patient.details.family.table.status'),
      width: 160,
    },
  ].concat(
    showActions
      ? [
          {
            key: 'actions',
            render: (_, record: DataType) => <ActionsCell memberId={record.member.id} />,
            title: intl.get('screen.patient.details.family.table.actions'),
            width: 80,
          },
        ]
      : [],
  ) as ColumnType<DataType>[];

  return (
    <Card
      bordered={false}
      className="family-tab__details"
      extra={
        showActions ? (
          <Dropdown
            disabled={!canAddAtLeastOneParent}
            overlay={addParentMenu}
            overlayClassName="family-tab__add-parent"
            placement="bottomCenter"
            trigger={['click']}
          >
            <Button>
              {intl.get('screen.patient.details.family.addParent')}
              <DownOutlined />
            </Button>
          </Dropdown>
        ) : null
      }
      title={intl.get('screen.patient.details.family.title')}
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
