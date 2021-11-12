import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { closeCreatePatient } from 'actions/patientCreation';
import { navigateToSubmissionFromPatientCreation } from 'actions/router';
import { Button } from 'antd';
import { Routes } from 'navigation/route';

import ErrorModal from './components/ErrorModal';
import ExistingModal from './components/ExistingModal';
import FormModal from './components/FormModal';
import SuccessModal from './components/SuccessModal';

import './styles.scss';

const I18N_PREFIX = 'screen.patient.creation.';
enum SCREENS {
  FORM,
  SUCCESS,
  EXISTING,
  ERROR,
}

const PatientCreation = (): React.ReactElement => {
  const [openModal, setOpenModal] = useState<SCREENS | null>(null);
  const dispatch = useDispatch();
  const history = useHistory();

  const onClose = (goToScreen?: () => void) => {
    setOpenModal(null);
    dispatch(closeCreatePatient());
    if (goToScreen != null) {
      goToScreen();
    } else {
      history.push(Routes.PatientSearch);
    }
  };

  const onCreateNew = () => {
    dispatch(closeCreatePatient());
    setOpenModal(SCREENS.FORM);
  };

  return (
    <>
      <Button
        className="patient-creation__button"
        onClick={() => setOpenModal(SCREENS.FORM)}
        type="primary"
      >
        <PlusOutlined />
        {intl.get(`${I18N_PREFIX}createPrescription`)}
      </Button>
      <FormModal
        onClose={onClose}
        onCreated={() => setOpenModal(SCREENS.SUCCESS)}
        onError={() => setOpenModal(SCREENS.ERROR)}
        onExistingPatient={() => setOpenModal(SCREENS.EXISTING)}
        open={openModal === SCREENS.FORM}
      />

      <SuccessModal
        onClose={onClose}
        onCompletePrescription={() => {
          setOpenModal(null);
          dispatch(navigateToSubmissionFromPatientCreation());
          dispatch(closeCreatePatient());
        }}
        onNavigateToPatient={(patientId) => {
          onClose(() => history.push(Routes.getPatientPath(patientId)));
        }}
        onNewPatient={onCreateNew}
        open={openModal === SCREENS.SUCCESS}
      />

      <ExistingModal
        onClose={onClose}
        onNavigateToPatientCard={(patientId) => {
          onClose(() => history.push(Routes.getPatientPath(patientId)));
        }}
        open={openModal === SCREENS.EXISTING}
      />

      <ErrorModal onClose={onClose} onRetry={onCreateNew} open={openModal === SCREENS.ERROR} />
    </>
  );
};

export default PatientCreation;
