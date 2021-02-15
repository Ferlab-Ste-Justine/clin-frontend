import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
} from 'antd';
import './styles.scss';
import { useDispatch } from 'react-redux';
import FormModal from './components/FormModal';
import SuccessModal from './components/SuccessModal';
import ExistingModal from './components/ExistingModal';
import { navigateToPatientSearchScreen } from '../../../actions/router';
import { closeCreatePatient } from '../../../actions/patientCreation';
import ErrorModal from './components/ErrorModal';

const I18N_PREFIX = 'screen.patient.creation.';
enum SCREENS {
  FORM, SUCCESS, EXISTING, ERROR
}

const PatientCreation: React.FC = () => {
  const [openModal, setOpenModal] = useState<SCREENS | null>(null);
  const dispatch = useDispatch();

  const onClose = () => {
    setOpenModal(null);
    dispatch(closeCreatePatient());
    dispatch(navigateToPatientSearchScreen());
  };

  return (
    <>
      <Button
        type="primary"
        className="patient-creation__button"
        onClick={() => setOpenModal(SCREENS.FORM)}
      >
        <PlusOutlined />
        { intl.get(`${I18N_PREFIX}createPrescription`) }
      </Button>
      <FormModal
        open={openModal === SCREENS.FORM}
        onClose={onClose}
        onCreated={() => setOpenModal(SCREENS.SUCCESS)}
        onError={() => setOpenModal(SCREENS.ERROR)}
        onExistingPatient={() => setOpenModal(SCREENS.EXISTING)}
      />

      <SuccessModal
        open={openModal === SCREENS.SUCCESS}
        onClose={onClose}
        onNewPatient={() => setOpenModal(SCREENS.FORM)}
      />

      <ExistingModal
        open={openModal === SCREENS.EXISTING}
        onClose={onClose}
      />

      <ErrorModal
        open={openModal === SCREENS.ERROR}
        onClose={onClose}
        onRetry={() => setOpenModal(SCREENS.FORM)}
      />

    </>
  );
};

export default PatientCreation;
