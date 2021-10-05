import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { updateParentStatusInFamily } from 'actions/patient';
import { Select } from 'antd';
import { GroupMemberStatusCode } from 'helpers/fhir/patientHelper';
import { State } from 'reducers';

import { GroupMemberStatusCodes } from 'store/GroupTypes';

type Props = {
  memberCode: GroupMemberStatusCode;
  memberId: string;
};

const StatusCell = ({ memberCode, memberId }: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const idsOfParentUpdatingStatuses = useSelector(
    (state: State) => state.patient.idsOfParentUpdatingStatuses,
  );

  const isUpdatingStatus = idsOfParentUpdatingStatuses.includes(memberId);

  return (
    <Select
      className="family-tab__details__table__status"
      defaultValue={memberCode}
      disabled={isUpdatingStatus}
      loading={isUpdatingStatus}
      onChange={(newStatus) => {
        dispatch(updateParentStatusInFamily(memberId, newStatus));
      }}
    >
      <Select.Option value={GroupMemberStatusCodes.unaffected}>
        {intl.get('screen.patient.details.family.modal.status.no')}
      </Select.Option>
      <Select.Option value={GroupMemberStatusCodes.affected}>
        {intl.get('screen.patient.details.family.modal.status.yes')}
      </Select.Option>
      <Select.Option value={GroupMemberStatusCodes.unknown}>
        {intl.get('screen.patient.details.family.modal.status.unknown')}
      </Select.Option>
    </Select>
  );
};

export default StatusCell;
