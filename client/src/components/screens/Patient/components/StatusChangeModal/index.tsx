import {
  Button, Radio, Modal, Input,
} from 'antd';
import intl from 'react-intl-universal';
import React, {
  ChangeEvent, Reducer, useEffect, useReducer,
} from 'react';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import './style.scss';

export enum StatusType {
  draft = 'draft',
  submitted = 'submitted',
  active = 'active',
  'on-hold' = 'on-hold',
  revoked = 'revoked',
  completed = 'completed'
}

const statusWithNotes = [StatusType['on-hold'], StatusType.revoked];

interface Props {
  isVisible: boolean
  onOk: (newStatus: StatusType, note?: string) => void
  onCancel: () => void
  initialStatus?: StatusType
}

interface State {
  initialStatus: StatusType
  selectedStatus: StatusType
  isSubmittable: boolean
  notes: {[key in StatusType]?: string}
}

enum ActionType {
  SET_STATUS,
  SET_NOTE,
  CLEAN_NOTES,
}

interface StatusAction {
  type: ActionType.SET_STATUS,
  payload: StatusType,
}

interface NoteAction {
  type: ActionType.SET_NOTE,
  payload: {key: StatusType, value: string},
}

interface ClearNotesAction {
  type: ActionType.CLEAN_NOTES,
}

type Action = StatusAction | NoteAction | ClearNotesAction;

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
    case ActionType.SET_NOTE: {
      const { key, value } = action.payload;
      return {
        ...state,
        notes: {
          ...state.notes,
          [key]: value,
        },
      };
    }
    case ActionType.CLEAN_NOTES: {
      return {
        ...state,
        notes: {},
      };
    }
    default:
      return { ...state };
  }
};

function StatusChangeModal({
  isVisible, onOk: onOkCallback, onCancel, initialStatus = StatusType.draft,
}: Props) {
  const statuses = {
    [StatusType['on-hold']]: {
      value: StatusType['on-hold'],
      className: 'incomplete',
      label: intl.get('screen.patient.details.status.incomplete'),
      description: intl.get('screen.patient.details.status.incomplete.description'),
    },
    [StatusType.revoked]: {
      value: StatusType.revoked,
      className: 'revoked',
      label: intl.get('screen.patient.details.status.revoked'),
      description: intl.get('screen.patient.details.status.revoked.description'),
    },
    [StatusType.active]: {
      value: StatusType.active,
      className: 'active',
      label: intl.get('screen.patient.details.status.active'),
      description: intl.get('screen.patient.details.status.active.description'),
    },
    [StatusType.completed]: {
      value: StatusType.completed,
      className: 'completed',
      label: intl.get('screen.patient.details.status.completed'),
      description: intl.get('screen.patient.details.status.completed.description'),
    },
  };

  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    reducer, {
      initialStatus, selectedStatus: initialStatus, isSubmittable: false, notes: {},
    },
  );

  useEffect(() => {
    function resetState() {
      dispatch({ type: ActionType.SET_STATUS, payload: initialStatus });
      dispatch({ type: ActionType.CLEAN_NOTES });
    }

    resetState();
  }, [isVisible]);

  function onChange(e: RadioChangeEvent) {
    const selectedStatus = e.target.value as StatusType;

    dispatch({ type: ActionType.SET_STATUS, payload: selectedStatus });
  }

  const updateNote = (e: ChangeEvent<HTMLTextAreaElement>, key: StatusType) => {
    dispatch({ type: ActionType.SET_NOTE, payload: { key, value: e.target.value } });
  };

  const statusToDisplay = initialStatus === 'submitted' ? [statuses[StatusType['on-hold']], statuses.revoked, statuses.active] : [statuses.completed];
  const onOk = () => onOkCallback(state.selectedStatus, state.notes[state.selectedStatus]);

  const isShowNote = (status: StatusType) => status === state.selectedStatus && statusWithNotes.includes(status);

  return (
    <Modal
      title={intl.get('screen.patient.details.changePrescriptionStatus')}
      className="status--modal"
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
      <Radio.Group onChange={onChange} className="status--modal__group" value={state.selectedStatus}>
        {
          statusToDisplay.map(({
            value, label, description, className,
          }) => (
            <Radio key={value} value={value} className={className}>
              { label }
              <span className="description">{ description }</span>
              { isShowNote(value) && (
                <Input.TextArea
                  value={state.notes[value]}
                  onChange={(event) => updateNote(event, value)}
                />
              ) }
            </Radio>

          ))
        }
      </Radio.Group>
    </Modal>
  );
}

StatusChangeModal.defaultProps = {
  initialStatus: StatusType.draft,
};

export default StatusChangeModal;
