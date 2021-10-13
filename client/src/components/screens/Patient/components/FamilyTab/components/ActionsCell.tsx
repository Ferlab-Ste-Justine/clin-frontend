import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { removeParentToFamily } from 'actions/patient';
import { Button, message, Modal } from 'antd';
import { State } from 'reducers';
import { FamilyActionStatus } from 'reducers/patient';

type Props = {
  memberId: string;
};

const ActionsCell = ({ memberId }: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const familyActionStatus = useSelector((state: State) => state.patient.familyActionStatus);
  const isRemovingParentInProgress =
    familyActionStatus === FamilyActionStatus.removeMemberInProgress;

  const displayMessageWhenDone = (isSuccess: boolean) =>
    isSuccess
      ? message.success(intl.get('screen.patient.details.family.remove.success'))
      : message.error(intl.get('screen.patient.details.family.remove.error'));

  return (
    <div className="family-tab__details__table__actions">
      <Button
        aria-label={intl.get('screen.patient.details.family.removeParent')}
        className="button--borderless"
        disabled={isRemovingParentInProgress}
        icon={<DeleteOutlined />}
        loading={isRemovingParentInProgress}
        onClick={() => {
          Modal.confirm({
            cancelText: intl.get('screen.patient.details.family.remove.confirm.cancel'),
            content: intl.get('screen.patient.details.family.remove.confirm.description'),
            okText: intl.get('screen.patient.details.family.remove.confirm.remove'),
            onOk() {
              dispatch(removeParentToFamily(memberId, displayMessageWhenDone));
            },
            title: intl.get('screen.patient.details.family.remove.confirm.title'),
          });
        }}
      />
    </div>
  );
};

export default ActionsCell;
