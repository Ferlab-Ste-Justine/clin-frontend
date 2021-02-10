import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ParsedPatientData, Prescription } from '../../../../../helpers/providers/types';
import PatientDetails from './components/PatientDetails';
import './styles.scss';
import Prescriptions from './components/Prescriptions';
import { State } from '../../../../../reducers';
import { navigatoToSubmissionWithPatient } from '../../../../../actions/router';
import NoPrescription from './components/NoPrescription';

const PrescriptionsTab : React.FC = () => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;

  const prescriptions = useSelector((state: State) => state.patient.prescriptions?.map(
    (prescription: {original: any, parsed: Prescription}) => prescription.parsed,
  ) || []);

  return (
    <div className="page-static-content">
      <PatientDetails patient={patient} />
      {
        prescriptions.length <= 0 ? (
          <NoPrescription onCreatePrescription={() => dispatch(navigatoToSubmissionWithPatient())} />
        ) : (
          <Prescriptions prescriptions={prescriptions} />
        )
      }
    </div>
  );
};

export default PrescriptionsTab;
