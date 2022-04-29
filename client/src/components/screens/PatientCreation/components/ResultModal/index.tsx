import React from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import {
  Button, Modal, Typography,
} from 'antd';
import { Patient } from 'helpers/fhir/types';

import './styles.scss';

interface Props {
  open: boolean
  onClose: () => void
  icon: React.ReactNode
  description: React.ReactNode
  actions: React.ReactNode
  title?: string
}

const I18N_PREFIX = 'screen.patient.creation.modal.';

const ResultModal: React.FC<Props> = ({
  actions, description, icon, onClose, open, title,
}) => {
  const patient = useSelector((state: any) => state.patientCreation.patient) as Patient;

  if (!patient?.id && !title) {
    return <span />;
  }

  const isFetus = patient?.extension.find((ext) => ext.url.includes('is-fetus'))?.valueBoolean || false;
  let displayedTitle = title || `${patient.name[0].family.toUpperCase()} ${patient.name[0].given[0]}`;
  if (isFetus) {
    displayedTitle += ` (${intl.get('screen.patient.creation.fetus').toLowerCase()})`;
  }
  return (
    <Modal footer={null} onCancel={() => onClose()} visible={open} width={815}>
      <div className="patient-creation__modal__content">
        { icon }

        <Typography.Text className="patient-creation__modal__content__name">
          { displayedTitle }
        </Typography.Text>

        <Typography.Text className="patient-creation__modal__content__description">
          { description }
        </Typography.Text>

        <div className="patient-creation__modal__content__buttons-wrapper">
          { actions }
        </div>
        <span>
          <Button className="patient-creation__modal__content__close-button" data-testid="CloseButton" onClick={() => onClose()} type="link">
            { intl.get(`${I18N_PREFIX}close`) }
          </Button>
        </span>
      </div>
    </Modal>
  );
};

export default ResultModal;
