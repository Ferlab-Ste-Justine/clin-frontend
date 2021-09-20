import { Select } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import intl from 'react-intl-universal';
import { Action } from 'redux';
import { GroupMemberStatusCode } from '../../../../../../helpers/fhir/patientHelper';

type Props = {
  memberCode: GroupMemberStatusCode;
  updateParentStatusInFamily: (id: string, status: GroupMemberStatusCode) => Action
  memberId: string;
}

const StatusCell = ({
  memberId, memberCode, updateParentStatusInFamily,
}: Props) => {
  const dispatch = useDispatch();

  return (
    <Select
      className="family-tab__details__table__status"
      value={memberCode}
      onChange={(newStatus) => {
        dispatch(updateParentStatusInFamily(memberId, newStatus));
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
};

export default StatusCell;
