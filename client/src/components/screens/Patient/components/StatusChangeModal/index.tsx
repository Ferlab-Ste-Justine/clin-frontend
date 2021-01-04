import {
  Button, Radio, Modal,
} from 'antd';
import intl from 'react-intl-universal';
import React, { Reducer, useEffect, useReducer } from 'react';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import './style.scss';

enum StatusType {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed'
}

interface Props {
  isVisible: boolean
  onOk: (newStatus: StatusType) => void
  onCancel: () => void
  initialStatus: StatusType
}

interface State {
  initialStatus: StatusType
  selectedStatus: StatusType
  isSubmittable: boolean
}

enum ActionType {
  SET_STATUS, SET_NOTES
}

interface Action {
  type: ActionType.SET_STATUS
  payload: StatusType
}

const reducer: Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.SET_STATUS: {
      const newStatus = action.payload;
      return {
        ...state,
        selectedStatus: newStatus,
        isSubmittable: newStatus !== state.initialStatus,
      };
    }
    default:
      return { ...state };
  }
};

function StatusChangeModal({
  isVisible, onOk: onOkCallback, onCancel, initialStatus,
}: Props) {
  const statuses = {
    [StatusType.ON_HOLD]: {
      value: StatusType.ON_HOLD,
      className: 'incomplete',
      label: intl.get('screen.patient.details.status.incompleted'),
      description: intl.get('screen.patient.details.status.incompleted.description'),
    },
    [StatusType.REVOKED]: {
      value: StatusType.REVOKED,
      className: 'revoked',
      label: intl.get('screen.patient.details.status.revoked'),
      description: intl.get('screen.patient.details.status.revoked.description'),
    },
    [StatusType.ACTIVE]: {
      value: StatusType.ACTIVE,
      className: 'active',
      label: intl.get('screen.patient.details.status.active'),
      description: intl.get('screen.patient.details.status.active.description'),
    },
    [StatusType.COMPLETED]: {
      value: StatusType.COMPLETED,
      className: 'completed',
      label: intl.get('screen.patient.details.status.completed'),
      description: intl.get('screen.patient.details.status.completed.description'),
    },
  };

  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    reducer, { initialStatus, selectedStatus: initialStatus, isSubmittable: false },
  );

  useEffect(() => {
    function resetState() {
      dispatch({ type: ActionType.SET_STATUS, payload: initialStatus });
    }

    resetState();
  }, [isVisible]);

  function onChange(e: RadioChangeEvent) {
    const selectedStatus = e.target.value as StatusType;

    dispatch({ type: ActionType.SET_STATUS, payload: selectedStatus });
  }

  const statusToDisplay = [statuses[StatusType.ON_HOLD], statuses.revoked, statuses.active, statuses.completed];
  const onOk = () => onOkCallback(state.selectedStatus);

  return (
    <Modal
      title={intl.get('screen.patient.details.changePrescriptionStatus')}
      className="statusModal"
      visible={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button size="small" key="back" onClick={onCancel} className="cancel">
          { intl.get('screen.patient.details.cancel') }
        </Button>,
        <Button size="small" key="submit" type="primary" onClick={onOk} disabled={!state.isSubmittable}>
          { intl.get('screen.patient.details.changeStatus') }
        </Button>,
      ]}
    >
      <Radio.Group onChange={onChange} className="modalRadio" value={state.selectedStatus}>
        {
          statusToDisplay.map(({
            value, label, description, className,
          }) => (
            <Radio key={value} value={value} className={className}>
              { label }
              <span className="description">{ description }</span>
            </Radio>
          ))
        }
      </Radio.Group>
    </Modal>
  );
}

export default StatusChangeModal;
