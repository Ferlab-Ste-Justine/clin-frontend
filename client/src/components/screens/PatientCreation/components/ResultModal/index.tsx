import React from 'react';
import intl from 'react-intl-universal';
import {
  Button, Modal, Typography,
} from 'antd';
import './styles.scss';
import { useSelector } from 'react-redux';

interface Props {
  open: boolean
  onClose: () => void
  icon: React.ReactNode
  description: React.ReactNode
  actions: React.ReactNode
}

const I18N_PREFIX = 'screen.patient.creation.modal.';

const ResultModal: React.FC<Props> = ({
  open, onClose, icon, description, actions,
}) => {
  const patient = useSelector((state: any) => state.patient.patient.parsed);

  if (!patient?.id) {
    return <span />;
  }

  return (
    <Modal visible={open} footer={null} width={815} onCancel={onClose}>
      <div className="patient-creation__modal__content">

        { icon }

        <Typography.Text className="patient-creation__modal__content__name">
          { `${patient.lastName.toUpperCase()}, ${patient.firstName}` }
        </Typography.Text>

        <Typography.Text className="patient-creation__modal__content__description">
          { description }
        </Typography.Text>

        <div className="patient-creation__modal__content__buttons-wrapper">
          { actions }
        </div>
        <span>
          <Button type="link" onClick={onClose}>{ intl.get(`${I18N_PREFIX}close`) }</Button>
        </span>
      </div>
    </Modal>
  );
};

export default ResultModal;
