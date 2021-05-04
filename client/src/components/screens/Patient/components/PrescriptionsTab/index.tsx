import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ConsultationSummary, ParsedPatientData, Prescription,
} from '../../../../../helpers/providers/types';
import PatientDetails from '../PatientDetails';
import './styles.scss';
import Prescriptions from './components/Prescriptions';
import { State } from '../../../../../reducers';
import { navigateToSubmissionWithPatient } from '../../../../../actions/router';
import NoPrescription from './components/NoPrescription';
import { ClinicalImpression, ServiceRequest } from '../../../../../helpers/fhir/types';

const PrescriptionsTab : React.FC = () => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const canEditPatient = !!useSelector((state: State) => state.patient.canEdit);

  const prescriptions = useSelector((state: State) => state.patient.prescriptions?.map(
    (prescription: {original: ServiceRequest, parsed: Prescription}) => prescription.parsed,
  ) || []).sort((a, b) => ((a.id! > b.id!) ? -1 : ((b.id! > a.id!) ? 1 : 0)));

  const clinicalImpressions = useSelector((state: State) => state.patient.consultation?.map(
    (consultation: {original: ClinicalImpression, parsed: ConsultationSummary}) => consultation.original,
  ) || []);

  return (
    <div className="page-static-content prescriptions-tab">
      <PatientDetails patient={patient} canEditPatient={canEditPatient} />
      {
        prescriptions.length <= 0 ? (
          <NoPrescription onCreatePrescription={() => dispatch(navigateToSubmissionWithPatient())} />
        ) : (
          <Prescriptions prescriptions={prescriptions} clinicalImpressions={clinicalImpressions} />
        )
      }
    </div>
  );
};

export default PrescriptionsTab;
