import React from 'react';
import { useDispatch } from 'react-redux';
import { closeCreatePatient } from 'actions/patientCreation';
import {
  navigateToPatientScreen,
  navigateToPatientSearchScreen,
  navigateToSubmissionFromPatientCreation,
} from 'actions/router';
import { Bridge } from 'bridge';

import ErrorModal from 'components/screens/PatientCreation/components/ErrorModal';
import ExistingModal from 'components/screens/PatientCreation/components/ExistingModal';
import FormModal from 'components/screens/PatientCreation/components/FormModal';
import SuccessModal from 'components/screens/PatientCreation/components/SuccessModal';

import 'components/screens/PatientCreation/styles.scss';

export enum Screens {
  Form,
  Success,
  Existing,
  Error,
  None,
}

export const NewPrescriptionModal = ({
  bridge,
  openModal = Screens.None,
  setOpenModal,
}: {
  bridge: Bridge | null;
  openModal: Screens;
  setOpenModal: (s: Screens) => void;
}): React.ReactElement => {
  const dispatch = useDispatch();

  const goToPatientSearch = () => dispatch(navigateToPatientSearchScreen());

  const onClose = (goToScreen?: () => void) => {
    setOpenModal(Screens.None);
    dispatch(closeCreatePatient());
    if (goToScreen) {
      goToScreen();
    } else {
      bridge?.closeNewPatientModal()
      goToPatientSearch();
    }
  };

  const onCreateNew = () => {
    dispatch(closeCreatePatient());
    setOpenModal(Screens.Form);
  };

  return (
    <>
      <FormModal
        onClose={onClose}
        onCreated={() => setOpenModal(Screens.Success)}
        onError={() => setOpenModal(Screens.Error)}
        onExistingPatient={() => setOpenModal(Screens.Existing)}
        open={openModal === Screens.Form}
      />
      <SuccessModal
        onClose={onClose}
        onCompletePrescription={() => {
          setOpenModal(Screens.None);
          dispatch(navigateToSubmissionFromPatientCreation());
          dispatch(closeCreatePatient());
        }}
        onNavigateToPatient={(patientId) => {
          onClose(() => dispatch(navigateToPatientScreen(patientId)));
        }}
        onNewPatient={onCreateNew}
        open={openModal === Screens.Success}
      />

      <ExistingModal
        onClose={onClose}
        onNavigateToPatientCard={(patientId) => {
          onClose(() => dispatch(navigateToPatientScreen(patientId)));
        }}
        open={openModal === Screens.Existing}
      />

      <ErrorModal onClose={onClose} onRetry={onCreateNew} open={openModal === Screens.Error} />
    </>
  );
};
