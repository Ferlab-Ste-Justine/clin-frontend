import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import {
  Button, Card, Dropdown, Table, Tooltip, Modal, Select,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import { State } from '../../../../../../reducers';
import { FamilyMember, FamilyMemberType, ParsedPatientData } from '../../../../../../helpers/providers/types';
import MaleProband from './icons/MaleProband';
import FemaleProband from './icons/FemaleProband';
import UnknownProband from './icons/UnknownProband';
import { navigateToPatientScreen } from '../../../../../../actions/router';
import { removeParentToFamily, updateParentStatusInFamily } from '../../../../../../actions/patient';

interface Props {
  addParentMenu: React.ReactElement
}

interface DataType {
  patient: Partial<ParsedPatientData> & FamilyMember
  mother?: FamilyMember | null
  father?: FamilyMember | null
}

function getProbandIcon(sex: string) {
  switch (sex) {
    case 'male':
      return <MaleProband />;
    case 'female':
      return <FemaleProband />;
    default:
      return <UnknownProband />;
  }
}

function renderIfEmpty(value: string) {
  return value || '--';
}

function renderIfFetus(value: string, record: any) {
  if (record.patient.isFetus) {
    return '--';
  }

  return renderIfEmpty(value);
}

function renderPatientCell(value: ParsedPatientData | FamilyMember, record: DataType, index: number) {
  const dispatch = useDispatch();
  if (value == null) {
    return '--';
  }
  // Only show for the first line (the "current patient" line) for their cell and not their parent's
  const showProbandIcon = index === 0 && value.id === record.patient.id;
  return (
    <Button
      type="link"
      className="button link--underline family-tab__details__table__name"
      onClick={() => dispatch(navigateToPatientScreen(value.id))}
    >
      { (value as ParsedPatientData).isFetus ? 'Fetus' : `${value.firstName} ${value.lastName}` }
      { showProbandIcon && (
        <Tooltip title="Cas index">
          { getProbandIcon(!(value as ParsedPatientData).isFetus ? value.gender || '' : 'unknown') }
        </Tooltip>
      ) }
    </Button>
  );
}

const FamilyTable: React.FC<Props> = ({ addParentMenu }) => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const columns = [
    {
      title: intl.get('screen.patient.details.family.table.name'),
      dataIndex: 'patient',
      render: renderPatientCell,
    },
    {
      title: intl.get('screen.patient.details.family.table.ramq'),
      dataIndex: ['patient', 'ramq'],
      width: 180,
      render: renderIfFetus,
    },
    {
      title: intl.get('screen.patient.details.family.table.birthDate'),
      dataIndex: ['patient', 'birthDate'],
      render: renderIfFetus,
      width: 180,
    }, {
      title: intl.get('screen.patient.details.family.table.sex'),
      dataIndex: ['patient', 'gender'],
      render: (value: string, record: any) => (
        !value || record.patient.isFetus ? '--' : intl.get(`screen.patient.details.family.table.sex.${value}`)
      ),
      width: 200,
    },
    {
      title: intl.get('screen.patient.details.family.table.father'),
      dataIndex: 'father',
      render: renderPatientCell,
    },
    {
      title: intl.get('screen.patient.details.family.table.mother'),
      dataIndex: 'mother',
      render: renderPatientCell,
    },
    {
      title: intl.get('screen.patient.details.family.table.status'),
      key: 'status',
      render: (value, record, index) => {
        if (index === 0) {
          return '--';
        }

        return (
          <Select
            className="family-tab__details__table__status"
            value={record.patient.code}
            onChange={(newStatus) => {
              dispatch(updateParentStatusInFamily(record.patient.id, newStatus));
            }}
          >
            <Select.Option value="UNF">
              { intl.get('screen.patient.details.family.modal.status.no') }
            </Select.Option>
            <Select.Option value="AFF">
              { intl.get('screen.patient.details.family.modal.status.yes') }
            </Select.Option>
            <Select.Option value="UNK">
              { intl.get('screen.patient.details.family.modal.status.unknown') }
            </Select.Option>
          </Select>
        );
      },
      width: 160,
    },
    {
      title: intl.get('screen.patient.details.family.table.actions'),
      render: (value, record, index) => {
        const Wrapper: React.FC = ({ children }) => <div className="family-tab__details__table__actions">{ children }</div>;
        if (index === 0) {
          return <Wrapper>--</Wrapper>;
        }

        return (
          <Wrapper>
            <Button
              className="button--borderless"
              onClick={() => {
                Modal.confirm({
                  title: intl.get('screen.patient.details.family.remove.confirm.title'),
                  content: intl.get('screen.patient.details.family.remove.confirm.description'),
                  okText: intl.get('screen.patient.details.family.remove.confirm.remove'),
                  cancelText: intl.get('screen.patient.details.family.remove.confirm.cancel'),
                  onOk() {
                    dispatch(removeParentToFamily(record.patient.id));
                    return Promise.resolve();
                  },
                });
              }}
              aria-label={intl.get('screen.patient.details.family.removeParent')}
            >
              <DeleteOutlined />
            </Button>
          </Wrapper>
        );
      },
      width: 80,
    },
  ] as ColumnType<DataType>[];
  const familyMembers = useSelector((state: State) => state.patient.family) || [];
  const data: DataType[] = familyMembers.map((fm) => ({
    patient: fm,
    mother: !fm.type && patient.id === fm.id ? familyMembers.find(
      (fmm) => fmm.type != null && [FamilyMemberType.MOTHER.toString(), FamilyMemberType.NATURAL_MOTHER_OF_FETUS.toString()].includes(fmm.type),
    ) : null,
    father: !fm.type && patient.id === fm.id ? familyMembers.find((fmf) => fmf.type === FamilyMemberType.FATHER) : null,
  }))
  // The sort puts the "main patient" first since they doesn't have a type set
    .sort((fma, fmb) => fma.patient.type?.localeCompare(fmb.patient.type || '') || -1);

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
