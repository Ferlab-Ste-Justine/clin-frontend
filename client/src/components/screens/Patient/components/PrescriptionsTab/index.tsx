import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { navigateToSubmissionWithPatient } from 'actions/router';
import { ClinicalImpression, ServiceRequest } from 'helpers/fhir/types';
import {
  ConsultationSummary, Prescription,
} from 'helpers/providers/types';
import { State } from 'reducers';

import NoPrescription from './components/NoPrescription';
import Prescriptions from './components/Prescriptions';

import './styles.scss';

const PrescriptionsTab: React.FC = () => {
  const dispatch = useDispatch();

  const prescriptions = useSelector((state: State) => state.patient.prescriptions?.map(
    (prescription: {original: ServiceRequest, parsed: Prescription}) => prescription.parsed,
  ) || []).sort((a, b) => ((a.id! > b.id!) ? -1 : ((b.id! > a.id!) ? 1 : 0)));

  const clinicalImpressions = useSelector((state: State) => state.patient.consultation?.map(
    (consultation: {original: ClinicalImpression, parsed: ConsultationSummary}) => consultation.original,
  ) || []);

  return (
    <div className="page-static-content prescriptions-tab">
      {
        prescriptions.length <= 0 ? (
          <NoPrescription onCreatePrescription={() => dispatch(navigateToSubmissionWithPatient())} />
        ) : (
          <Prescriptions clinicalImpressions={clinicalImpressions} prescriptions={prescriptions} />
        )
      }
    </div>
  );
};

export default PrescriptionsTab;
