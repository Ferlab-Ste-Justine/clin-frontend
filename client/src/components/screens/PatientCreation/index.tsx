import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { UserAddOutlined } from '@ant-design/icons';
import {
  Button,
} from 'antd';
import './styles.scss';
import { useDispatch } from 'react-redux';
import FormModal from './components/FormaModal';
import SuccessModal from './components/SuccessModal';
import ExistingModal from './components/ExistingModal';
import { navigateToPatientSearchScreen } from '../../../actions/router';

const I18N_PREFIX = 'screen.patient.creation.';
enum SCREENS {
  FORM, SUCCESS, EXISTING
}

const PatientCreation: React.FC = () => {
  const [openModal, setOpenModal] = useState<SCREENS | null>(null);
  const dispatch = useDispatch();

  function onClose() {
    setOpenModal(null);
    dispatch(navigateToPatientSearchScreen());
  }

  return (
    <>
      <Button
        type="primary"
        className="patient-creation__button"
        onClick={() => setOpenModal(SCREENS.FORM)}
      >
        <UserAddOutlined />
        { intl.get(`${I18N_PREFIX}createPatient`) }
      </Button>
      <FormModal
        open={openModal === SCREENS.FORM}
        onClose={onClose}
        onCreated={() => setOpenModal(SCREENS.SUCCESS)}
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
    </>
  );
};

export default PatientCreation;
