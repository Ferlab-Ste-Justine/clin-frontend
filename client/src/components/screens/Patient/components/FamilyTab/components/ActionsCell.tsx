import { Button, Modal } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import intl from 'react-intl-universal';
import { DeleteOutlined } from '@ant-design/icons';
import { removeParentToFamily } from 'actions/patient';

type Props = {
  memberId: string
}

const ActionsCell = ({
  memberId,
}: Props) => {
  const dispatch = useDispatch();
  return (
    <div className="family-tab__details__table__actions">
      <Button
        className="button--borderless"
        onClick={() => {
          Modal.confirm({
            title: intl.get('screen.patient.details.family.remove.confirm.title'),
            content: intl.get('screen.patient.details.family.remove.confirm.description'),
            okText: intl.get('screen.patient.details.family.remove.confirm.remove'),
            cancelText: intl.get('screen.patient.details.family.remove.confirm.cancel'),
            onOk() {
              dispatch(removeParentToFamily(memberId));
              return Promise.resolve();
            },
          });
        }}
        aria-label={intl.get('screen.patient.details.family.removeParent')}
      >
        <DeleteOutlined />
      </Button>
    </div>
  );
};

export default ActionsCell;
