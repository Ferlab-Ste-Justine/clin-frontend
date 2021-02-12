import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConsultationSummary, ParsedPatientData, Prescription } from '../../../../../helpers/providers/types';
import PatientDetails from './components/PatientDetails';
import './styles.scss';
import Prescriptions from './components/Prescriptions';
import { State } from '../../../../../reducers';
import { navigatoToSubmissionWithPatient } from '../../../../../actions/router';
import NoPrescription from './components/NoPrescription';
import { ClinicalImpression, ServiceRequest } from '../../../../../helpers/fhir/types';

const PrescriptionsTab : React.FC = () => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;

  const prescriptions = useSelector((state: State) => state.patient.prescriptions?.map(
    (prescription: {original: ServiceRequest, parsed: Prescription}) => prescription.parsed,
  ) || []);
  const clinicalImpressions = useSelector((state: State) => state.patient.consultation?.map(
    (consultation: {original: ClinicalImpression, parsed: ConsultationSummary}) => consultation.original,
  ) || []);

  return (
    <div className="page-static-content prescriptions-tab">
      <PatientDetails patient={patient} />
      {
        prescriptions.length <= 0 ? (
          <NoPrescription onCreatePrescription={() => dispatch(navigatoToSubmissionWithPatient())} />
        ) : (
          <Prescriptions prescriptions={prescriptions} clinicalImpressions={clinicalImpressions} />
        )
      }
    </div>
  );
};

export default PrescriptionsTab;
